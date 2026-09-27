require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { dbAll, dbRun } = require('../database/db');

/**
 * Check if text is a greeting or generic non-job message
 */
function isGreetingOrGeneralQuery(text) {
  if (!text || typeof text !== 'string') return false;
  const clean = text.toLowerCase().trim().replace(/[^\w\s]/gi, '');
  
  const greetingPhrases = [
    'hello', 'hi', 'hey', 'good day', 'good morning', 'good afternoon', 'good evening',
    'howfar', 'how far', 'sannu', 'jambo', 'habari', 'sup', 'yo', 'start', 'help',
    'what is kazi', 'who are you', 'info', 'kazi', 'test', 'ping', 'welcome', 'thanks', 'thank you'
  ];

  if (greetingPhrases.includes(clean)) {
    return true;
  }

  const words = clean.split(/\s+/);
  const startsWithGreeting = greetingPhrases.some(g => clean.startsWith(g));
  
  const jobKeywords = [
    'mechanic', 'cleaner', 'tailor', 'driver', 'electrician', 'welder', 'hairstylist',
    'plumber', 'vendor', 'security', 'carpenter', 'painter', 'cook', 'gardener', 'mason',
    'rider', 'hire', 'hiring', 'work', 'job', 'salary', 'pay', 'looking', 'vacancy',
    'ikeja', 'lekki', 'yaba', 'surulere', 'lagos', 'nairobi', 'kampala', 'accra', 'kumasi', 'westlands'
  ];

  const hasJobKeyword = jobKeywords.some(k => clean.includes(k));

  if (startsWithGreeting && !hasJobKeyword && words.length <= 4) {
    return true;
  }

  return false;
}

/**
 * Fallback intent/entity parser when Gemini API key is missing or fails.
 */
function fallbackExtractEntities(text, intentHint) {
  if (isGreetingOrGeneralQuery(text)) {
    return { intent: 'greeting', skill: 'general', location: 'any', type: 'any' };
  }

  const lower = text.toLowerCase();
  
  let intent = intentHint;
  if (!intent) {
    if (
      lower.includes('hiring') ||
      lower.includes('post job') ||
      lower.includes('need a') ||
      lower.includes('looking for a') ||
      lower.includes('we need') ||
      lower.includes('vacancy')
    ) {
      intent = 'post_job';
    } else {
      intent = 'find_job';
    }
  }

  const skillsList = [
    'mechanic', 'cleaner', 'tailor', 'driver', 'electrician',
    'welder', 'hairstylist', 'plumber', 'vendor', 'security guard',
    'carpenter', 'painter', 'cook', 'gardener', 'mason', 'rider'
  ];

  let extractedSkill = 'general';
  for (const s of skillsList) {
    if (lower.includes(s)) {
      extractedSkill = s;
      break;
    }
  }
  if (extractedSkill === 'general') {
    if (lower.includes('auto') || lower.includes('car')) extractedSkill = 'mechanic';
    if (lower.includes('hair') || lower.includes('salon') || lower.includes('braid')) extractedSkill = 'hairstylist';
    if (lower.includes('food') || lower.includes('chef') || lower.includes('buka')) extractedSkill = 'cook';
    if (lower.includes('pipe') || lower.includes('water')) extractedSkill = 'plumber';
    if (lower.includes('drive') || lower.includes('cab') || lower.includes('uber')) extractedSkill = 'driver';
    if (lower.includes('wire') || lower.includes('power') || lower.includes('solar')) extractedSkill = 'electrician';
    if (lower.includes('house') || lower.includes('office') || lower.includes('cleaning')) extractedSkill = 'cleaner';
  }

  const locationsList = [
    'ikeja', 'yaba', 'lagos island', 'lekki', 'surulere',
    'lagos', 'westlands', 'nairobi', 'kampala', 'kumasi', 'accra'
  ];
  let extractedLocation = 'any';
  for (const loc of locationsList) {
    if (lower.includes(loc)) {
      extractedLocation = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }

  let extractedType = 'full-time';
  if (lower.includes('gig') || lower.includes('task') || lower.includes('urgent')) extractedType = 'gig';
  if (lower.includes('part-time') || lower.includes('part time')) extractedType = 'part-time';

  let company_name = 'Kazi Employer';
  let salary = 'Negotiable';
  let title = `${extractedSkill.toUpperCase()} Job`;

  if (intent === 'post_job') {
    const salaryMatch = text.match(/(?:₦|ksh|gh₵|\$|naira|shillings|cedis)?\s?\d+(?:,\d+)*(?:\/month|\/day|\/hr)?/i);
    if (salaryMatch) {
      salary = salaryMatch[0];
    }
    title = `${extractedSkill.charAt(0).toUpperCase() + extractedSkill.slice(1)} Wanted in ${extractedLocation}`;
  }

  return {
    intent,
    skill: extractedSkill,
    location: extractedLocation,
    type: extractedType,
    company_name,
    salary,
    title
  };
}

/**
 * Sends prompt to Google Gemini API to extract structured JSON entities
 */
async function extractWithGemini(text, intentHint) {
  if (isGreetingOrGeneralQuery(text)) {
    return { intent: 'greeting', skill: 'general', location: 'any', type: 'any' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('YOUR_GEMINI_API_KEY')) {
    console.log('[Matcher] GEMINI_API_KEY missing, using fallback parser');
    return fallbackExtractEntities(text, intentHint);
  }

  const prompt = `
You are Kazi's AI intent and entity parser for Africa's informal economy job platform.
Analyze the user input (chat message, CV, or voice transcript) and extract structured job parameters in strict JSON format.

Input text: "${text.replace(/"/g, '\\"')}"
${intentHint ? `Explicit intent hint provided by user: "${intentHint}"` : ''}

Respond ONLY with a valid JSON object matching this structure (no markdown, no extra commentary):
{
  "intent": "find_job" | "post_job" | "greeting",
  "skill": "extracted main skill (e.g., mechanic, cleaner, tailor, driver, electrician, welder, hairstylist, plumber, vendor, security guard, carpenter, painter, cook, gardener, mason)",
  "location": "extracted location or city (e.g., Ikeja, Lekki, Yaba, Surulere, Lagos Island, Westlands, Nairobi, Kampala, Kumasi, Accra, or 'any')",
  "type": "full-time" | "part-time" | "gig" | "any",
  "company_name": "company or hiring party name (if post_job; default 'Kazi Employer')",
  "salary": "salary amount with currency e.g. ₦120,000/month, KSh 35,000/month, GH₵ 2,500/month (if post_job; default 'Negotiable')",
  "title": "a concise title for the job posting if post_job, e.g. 'Experienced Auto Mechanic'"
}

Note: If the input is just a greeting (like 'hello', 'hi', 'hey', 'good morning') or unclear non-job message with no skill/job request, set "intent": "greeting".
`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const result = await model.generateContent(prompt);
    const rawContent = result.response.text();

    if (!rawContent) {
      return fallbackExtractEntities(text, intentHint);
    }

    const parsed = JSON.parse(rawContent);
    return parsed;
  } catch (err) {
    console.error('[Matcher] Gemini API error:', err.message);
    return fallbackExtractEntities(text, intentHint);
  }
}

/**
 * Fuzzy score job relevance for find_job query
 */
function calculateRelevanceScore(job, targetSkill, targetLocation, targetType) {
  let score = 0;
  const matched_fields = [];

  const jobSkill = (job.skill || '').toLowerCase();
  const jobTitle = (job.title || '').toLowerCase();
  const reqSkill = (targetSkill || '').toLowerCase();

  // Skill matching (fuzzy token/substring)
  if (reqSkill !== 'any' && reqSkill !== 'general') {
    if (jobSkill === reqSkill || jobTitle.includes(reqSkill)) {
      score += 50;
      matched_fields.push('skill');
    } else {
      const reqTokens = reqSkill.split(/\s+/);
      const isPartial = reqTokens.some(t => t.length > 2 && (jobSkill.includes(t) || jobTitle.includes(t)));
      if (isPartial) {
        score += 35;
        matched_fields.push('skill');
      }
    }
  } else {
    score += 10;
  }

  // Location matching
  const jobLoc = (job.location || '').toLowerCase();
  const reqLoc = (targetLocation || '').toLowerCase();

  if (reqLoc !== 'any') {
    if (jobLoc.includes(reqLoc) || reqLoc.includes(jobLoc)) {
      score += 40;
      matched_fields.push('location');
    } else {
      const locKeywords = ['lagos', 'nairobi', 'accra', 'kampala', 'ikeja', 'lekki', 'yaba', 'surulere', 'westlands', 'kumasi'];
      for (const kw of locKeywords) {
        if (reqLoc.includes(kw) && jobLoc.includes(kw)) {
          score += 25;
          matched_fields.push('location');
          break;
        }
      }
    }
  } else {
    score += 15;
  }

  // Type matching
  const jobType = (job.type || '').toLowerCase();
  const reqType = (targetType || '').toLowerCase();

  if (reqType !== 'any' && reqType) {
    if (jobType === reqType) {
      score += 20;
      matched_fields.push('type');
    }
  } else {
    score += 10;
  }

  return { score, matched_fields };
}

/**
 * SHARED CORE MATCHING FUNCTION
 * Used by BOTH Web App and Telegram Bot without duplicate logic.
 */
async function matchJobOrPost({ text, intentHint }) {
  if (!text || typeof text !== 'string') {
    throw new Error('Input text must be a valid non-empty string');
  }

  // Step 1: Extract intent & entities via Gemini API (with fallback)
  const entities = await extractWithGemini(text, intentHint);
  const { intent, skill, location, type, company_name, salary, title } = entities;

  console.log(`[Matcher] Extracted Intent: ${intent} | Skill: ${skill} | Location: ${location}`);

  // Step 2: Handle 'greeting' or unclear message (DO NOT RUN MATCHING)
  if (intent === 'greeting' || isGreetingOrGeneralQuery(text)) {
    return {
      action: 'greeting',
      success: true,
      message: `👋 Hello! Welcome to Kazi — Africa's voice-first informal economy job platform.\n\nWhether you are looking for work or want to hire skilled workers, Kazi connects you instantly!\n\n💡 How to use Kazi:\n1️⃣ Find Work: Type or send a voice note like "I am a mechanic looking for work in Ikeja" or upload your CV.\n2️⃣ Post a Job: Type or send a voice note like "We need a cleaner in Lekki for ₦75,000/month".\n\nHow can Kazi help you today? Try typing your skill or sending a voice note!`,
      extracted: { intent: 'greeting' }
    };
  }

  // Step 3: Handle 'post_job' intent
  if (intent === 'post_job') {
    const jobTitle = title || `${skill.charAt(0).toUpperCase() + skill.slice(1)} Professional`;
    const jobCompany = company_name || 'Independent Employer';
    const jobSalary = salary || 'Negotiable';
    const jobLocation = location !== 'any' ? location : 'Lagos, Nigeria';
    const jobType = type !== 'any' ? type : 'full-time';

    const insertResult = await dbRun(
      `INSERT INTO jobs (title, skill, location, salary, type, company_name, status) VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [jobTitle, skill, jobLocation, jobSalary, jobType, jobCompany]
    );

    const newJobRows = await dbAll('SELECT * FROM jobs WHERE id = ?', [insertResult.id]);
    const createdJob = newJobRows[0];

    return {
      action: 'post_job',
      success: true,
      message: 'Job successfully posted on Kazi!',
      job: createdJob,
      extracted: entities
    };
  }

  // Step 4: Handle 'find_job' intent
  const allJobs = await dbAll("SELECT * FROM jobs WHERE status = 'open' ORDER BY created_at DESC");

  const scoredJobs = allJobs.map(job => {
    const { score, matched_fields } = calculateRelevanceScore(job, skill, location, type);
    return {
      ...job,
      score,
      matched_fields
    };
  });

  scoredJobs.sort((a, b) => b.score - a.score);
  const top3Jobs = scoredJobs.slice(0, 3);

  return {
    action: 'find_job',
    success: true,
    query_summary: { skill, location, type },
    extracted: entities,
    total_found: scoredJobs.length,
    jobs: top3Jobs
  };
}

module.exports = {
  matchJobOrPost,
  extractWithGemini,
  fallbackExtractEntities,
  isGreetingOrGeneralQuery
};
