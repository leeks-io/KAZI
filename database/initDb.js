const { dbRun, dbAll } = require('./db');

const seedJobs = [
  {
    title: "Experienced Auto Mechanic",
    skill: "mechanic",
    location: "Ikeja, Lagos, Nigeria",
    salary: "₦120,000/month",
    type: "full-time",
    company_name: "Danfo Fix Motors"
  },
  {
    title: "Commercial & Office Cleaner",
    skill: "cleaner",
    location: "Lekki, Lagos, Nigeria",
    salary: "₦75,000/month",
    type: "full-time",
    company_name: "Sparkle Clean Services"
  },
  {
    title: "Bespoke Fashion Tailor & Pattern Cutter",
    skill: "tailor",
    location: "Surulere, Lagos, Nigeria",
    salary: "₦90,000/month",
    type: "full-time",
    company_name: "Suru Apparel Studio"
  },
  {
    title: "Professional Fleet & Private Driver",
    skill: "driver",
    location: "Yaba, Lagos, Nigeria",
    salary: "₦110,000/month",
    type: "full-time",
    company_name: "Express Rides Ltd"
  },
  {
    title: "Residential Electrician & Wiring Tech",
    skill: "electrician",
    location: "Lagos Island, Nigeria",
    salary: "₦130,000/month",
    type: "gig",
    company_name: "Island Power Solutions"
  },
  {
    title: "Structural Metal Welder & Fabricator",
    skill: "welder",
    location: "Ikeja, Lagos, Nigeria",
    salary: "₦140,000/month",
    type: "full-time",
    company_name: "Ikeja Metal Works"
  },
  {
    title: "Braids & Natural Hairstylist",
    skill: "hairstylist",
    location: "Westlands, Nairobi, Kenya",
    salary: "KSh 35,000/month",
    type: "full-time",
    company_name: "Glamour Braids Salon"
  },
  {
    title: "Emergency Pipe & Plumbing Technician",
    skill: "plumber",
    location: "Nairobi, Kenya",
    salary: "KSh 40,000/month",
    type: "gig",
    company_name: "Nairobi Pipe Repairs"
  },
  {
    title: "Retail Kiosk Sales Vendor",
    skill: "vendor",
    location: "Westlands, Nairobi, Kenya",
    salary: "KSh 28,000/month",
    type: "full-time",
    company_name: "Savannah Mart"
  },
  {
    title: "Corporate & Residential Security Guard",
    skill: "security guard",
    location: "Kampala, Uganda",
    salary: "KSh 32,000/month",
    type: "full-time",
    company_name: "Shield Guard Uganda"
  },
  {
    title: "Furniture & Roofing Carpenter",
    skill: "carpenter",
    location: "Kumasi, Ghana",
    salary: "GH₵ 2,800/month",
    type: "full-time",
    company_name: "Ashanti Craft Woodwork"
  },
  {
    title: "Commercial Building Painter",
    skill: "painter",
    location: "Accra, Ghana",
    salary: "GH₵ 2,500/month",
    type: "gig",
    company_name: "Accra Fine Finishes"
  },
  {
    title: "Buka Restaurant Head Cook",
    skill: "cook",
    location: "Accra, Ghana",
    salary: "GH₵ 3,000/month",
    type: "full-time",
    company_name: "Chop House Buka"
  },
  {
    title: "Estate Gardener & Lawn Specialist",
    skill: "gardener",
    location: "Westlands, Nairobi, Kenya",
    salary: "KSh 30,000/month",
    type: "part-time",
    company_name: "Green Thumb Gardens"
  },
  {
    title: "Solar & Generator Repair Technician",
    skill: "electrician",
    location: "Ikeja, Lagos, Nigeria",
    salary: "₦150,000/month",
    type: "full-time",
    company_name: "Naija Solar Power"
  },
  {
    title: "Express Dispatch Delivery Rider",
    skill: "driver",
    location: "Surulere, Lagos, Nigeria",
    salary: "₦85,000/month",
    type: "full-time",
    company_name: "Swift Logistics"
  },
  {
    title: "Construction Mason & Bricklayer",
    skill: "mason",
    location: "Kampala, Uganda",
    salary: "KSh 38,000/month",
    type: "gig",
    company_name: "Kampala Builders Co"
  },
  {
    title: "Cold Store Wholesale Fishmonger",
    skill: "vendor",
    location: "Kumasi, Ghana",
    salary: "GH₵ 2,200/month",
    type: "full-time",
    company_name: "Coastal Catch Depot"
  },
  {
    title: "Events & Party Catering Cook",
    skill: "cook",
    location: "Yaba, Lagos, Nigeria",
    salary: "₦100,000/month",
    type: "part-time",
    company_name: "Taste of Africa Events"
  },
  {
    title: "Facility Maintenance & Handyman",
    skill: "plumber",
    location: "Lekki, Lagos, Nigeria",
    salary: "₦95,000/month",
    type: "full-time",
    company_name: "Lekki Property Mgt"
  }
];

async function initDatabase() {
  try {
    console.log('Initializing database schema...');

    // Core jobs table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        skill TEXT NOT NULL,
        location TEXT NOT NULL,
        salary TEXT NOT NULL,
        type TEXT NOT NULL,
        company_name TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        posted_by_telegram_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Telegram user profiles
    await dbRun(`
      CREATE TABLE IF NOT EXISTS telegram_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT UNIQUE NOT NULL,
        name TEXT,
        phone TEXT,
        email TEXT,
        location TEXT,
        role TEXT DEFAULT 'worker',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Web users table for email/password authentication
    await dbRun(`
      CREATE TABLE IF NOT EXISTS web_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT DEFAULT '',
        email TEXT UNIQUE NOT NULL,
        phone TEXT DEFAULT '',
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'worker',
        telegram_id TEXT DEFAULT NULL,
        avatar_url TEXT DEFAULT NULL,
        is_verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Job applications
    await dbRun(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        telegram_id TEXT NOT NULL,
        applicant_name TEXT,
        phone TEXT,
        email TEXT,
        location TEXT,
        status TEXT DEFAULT 'pending',
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id)
      )
    `);

    // Saved jobs
    await dbRun(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        telegram_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, telegram_id)
      )
    `);

    // Reminders
    await dbRun(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT NOT NULL,
        job_id INTEGER,
        remind_at TEXT NOT NULL,
        note TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const existingRows = await dbAll('SELECT COUNT(*) as count FROM jobs');
    const count = existingRows[0] ? existingRows[0].count : 0;

    if (count === 0) {
      console.log('Seeding 20 realistic African informal economy job postings...');
      for (const job of seedJobs) {
        await dbRun(
          `INSERT INTO jobs (title, skill, location, salary, type, company_name, status) VALUES (?, ?, ?, ?, ?, ?, 'open')`,
          [job.title, job.skill, job.location, job.salary, job.type, job.company_name]
        );
      }
      console.log('Database seeded successfully with 20 jobs.');
    } else {
      console.log(`Database already has ${count} job postings.`);
    }
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
}

if (require.main === module) {
  initDatabase().then(() => {
    console.log('Done initialization.');
    process.exit(0);
  });
}

module.exports = { initDatabase };
