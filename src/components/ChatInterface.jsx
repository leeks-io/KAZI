import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, ArrowUp, Mic, MicOff, Loader2, Sparkles, Send } from 'lucide-react';
import TogglePill from './TogglePill';
import MessageBubble from './MessageBubble';
import KaziLogo from './KaziLogo';
import { apiFetch } from '../api';

export default function ChatInterface({
  activeTab,
  onToggleTab,
  onApplyJob,
  onSaveJob,
  onNewPosting,
  applications = [],
  savedJobs = []
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'kazi',
      text: "👋 Welcome to Kazi! Africa's voice-first informal job matching network.\n\nWhether you need to find work or hire skilled workers, I am here to help. Type a message, upload a CV, or press the microphone to record a voice note!",
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Send Text Message with Real-Time Streaming
  const handleSendMessage = async (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const kaziMsgId = (Date.now() + 1).toString();
    // Add real-time streaming placeholder
    setMessages(prev => [
      ...prev,
      {
        id: kaziMsgId,
        sender: 'kazi',
        text: '',
        streaming: true,
        jobs: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      const response = await apiFetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          role: activeTab === 'post_job' ? 'employer' : 'worker'
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let matchData = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                accumulatedText += data.text;
                setMessages(prev =>
                  prev.map(m => m.id === kaziMsgId ? { ...m, text: accumulatedText } : m)
                );
              }
              if (data.done && data.matchData) {
                matchData = data.matchData;
              }
            } catch (e) {}
          }
        }
      }

      // Stream finished — update with real job matches or job post confirmation
      if (matchData) {
        if (matchData.action === 'post_job' && matchData.job && onNewPosting) {
          onNewPosting(matchData.job);
        }
        setMessages(prev =>
          prev.map(m =>
            m.id === kaziMsgId
              ? {
                  ...m,
                  text: accumulatedText || (matchData.action === 'post_job' ? '✅ Job Posted Successfully!' : 'Here are your top matches:'),
                  jobs: matchData.action === 'find_job' ? matchData.jobs : null,
                  streaming: false
                }
              : m
          )
        );
      } else {
        setMessages(prev =>
          prev.map(m => (m.id === kaziMsgId ? { ...m, streaming: false } : m))
        );
      }
    } catch (err) {
      console.error('Error during streaming:', err);
      // Fallback to /api/match if stream fails
      try {
        const fallbackRes = await apiFetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, intentHint: activeTab })
        });
        const fallbackData = await fallbackRes.json();
        setMessages(prev =>
          prev.map(m =>
            m.id === kaziMsgId
              ? {
                  ...m,
                  text: fallbackData.message || (fallbackData.jobs?.length > 0 ? `I found ${fallbackData.jobs.length} top job matches for you:` : 'No exact matches found right now.'),
                  jobs: fallbackData.action === 'find_job' ? fallbackData.jobs : null,
                  streaming: false
                }
              : m
          )
        );
      } catch (e) {
        setMessages(prev =>
          prev.map(m =>
            m.id === kaziMsgId
              ? {
                  ...m,
                  text: '⚠️ Sorry, there was an issue connecting to the AI service. Please try again.',
                  streaming: false
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle CV Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: `📄 Uploaded CV: ${file.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('cv', file);
    formData.append('intentHint', activeTab);

    try {
      const response = await apiFetch('/api/upload-cv', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to extract CV');
      }

      const botReplyText = data.jobs && data.jobs.length > 0
        ? `📄 **CV Extracted & Analyzed!**\n\nI parsed your CV experience and matched you with these top opportunities:`
        : `📄 **CV Analyzed!** No active jobs found matching your specific CV skills right now. Try searching directly or posting a job request!`;

      const kaziMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'kazi',
        text: botReplyText,
        jobs: data.jobs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, kaziMsg]);
    } catch (err) {
      console.error('Error uploading CV:', err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'kazi',
          text: '⚠️ Failed to read uploaded CV. Please ensure it is a valid PDF or DOCX file.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Browser Microphone Recording Handling
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission is required to record voice notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleAudioUpload = async (audioBlob) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-note.webm');
    formData.append('intentHint', activeTab);

    try {
      const response = await apiFetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed audio transcription');

      const userVoiceMsg = {
        id: Date.now().toString(),
        sender: 'user',
        text: data.transcript,
        transcript: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, userVoiceMsg]);

      let botReplyText = '';
      if (data.action === 'greeting') {
        botReplyText = data.message;
      } else if (data.action === 'post_job') {
        botReplyText = `🎙️ **Voice Note Processed!**\n\nJob **${data.job.title}** posted in ${data.job.location} (${data.job.salary}).`;
        if (onNewPosting && data.job) {
          onNewPosting(data.job);
        }
      } else {
        botReplyText = data.jobs && data.jobs.length > 0
          ? `🎙️ **Voice Note Transcribed!** Here are your top job matches:`
          : `🎙️ Transcribed voice note: *"${data.transcript}"*\nNo open matching jobs found right now.`;
      }

      const kaziMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'kazi',
        text: botReplyText,
        jobs: data.jobs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, kaziMsg]);
    } catch (err) {
      console.error('Error processing audio note:', err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'kazi',
          text: '⚠️ Could not transcribe audio. Please try again or type your message.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="chat-section" className="py-8 px-4 max-w-5xl mx-auto">
      {/* Rounded-2xl card, indigo-900 background, thin terracotta border */}
      <div className="rounded-2xl bg-[#191638] border border-[#E8632C]/40 shadow-2xl overflow-hidden flex flex-col h-[650px] md:h-[720px]">
        
        {/* Top Header & Pill Toggle */}
        <div className="p-4 md:p-6 border-b border-gray-800/80 bg-[#12102A]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <KaziLogo size={32} />
            <div>
              <h2 className="font-heading font-bold text-base md:text-lg text-[#F5F0E8] tracking-wide">
                MATCHING ASSISTANT
              </h2>
              <p className="text-xs text-[#F2A03D] flex items-center gap-1 font-sans">
                <Sparkles className="w-3 h-3" /> Voice & CV AI Active
              </p>
            </div>
          </div>

          {/* Find Work / Post a Job Animated Toggle Pill */}
          <TogglePill activeTab={activeTab} onToggle={onToggleTab} />
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 bg-[#191638]/90">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onApplyJob={onApplyJob}
              onSaveJob={onSaveJob}
              applications={applications}
              savedJobs={savedJobs}
            />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 my-4">
              <KaziLogo size={28} className="scale-90 animate-pulse" />
              <div className="bg-[#12102A] border border-gray-800 text-[#F5F0E8]/80 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-sm font-sans">
                <Loader2 className="w-4 h-4 text-[#E8632C] animate-spin" />
                <span>Searching SQLite database & matching via Gemini AI...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar Row */}
        <div className="p-3 md:p-4 bg-[#12102A] border-t border-gray-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 md:gap-3"
          >
            {/* Hidden File Input for CV */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />

            {/* Circular Ochre Paperclip CV Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload CV (PDF or DOCX)"
              className="w-11 h-11 rounded-full bg-[#F2A03D] hover:bg-[#E08F2C] text-[#12102A] flex items-center justify-center transition-all duration-200 shrink-0 shadow-md cursor-pointer hover:scale-105"
            >
              <Paperclip className="w-5 h-5 font-bold" />
            </button>

            {/* Rounded-full Text Input with Integrated Microphone Icon */}
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeTab === 'find_job'
                    ? "Type your skill or location (e.g., 'Mechanic in Ikeja' or 'Cleaner in Lekki')..."
                    : "Type job details (e.g., 'Hiring welder in Surulere for ₦140,000/month')..."
                }
                className="w-full rounded-full bg-[#191638] border border-gray-700 text-[#F5F0E8] placeholder-[#F5F0E8]/40 pl-5 pr-12 py-3.5 text-sm md:text-base font-sans focus:outline-none focus:border-[#E8632C] transition-colors"
              />

              {/* Microphone Icon inside Field - Pulses Gently in Terracotta while recording */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? "Stop recording voice note" : "Record voice note"}
                className={`absolute right-3.5 p-1.5 rounded-full transition-all cursor-pointer ${
                  isRecording
                    ? 'text-[#E8632C] animate-pulse bg-[#E8632C]/20'
                    : 'text-gray-400 hover:text-[#E8632C]'
                }`}
              >
                {isRecording ? (
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="text-[10px] font-bold text-[#E8632C]">{recordingTime}s</span>
                    <MicOff className="w-5 h-5 text-[#E8632C]" />
                  </div>
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Distinct Asymmetric Terracotta Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              title="Send message"
              className="w-11 h-11 bg-[#E8632C] hover:bg-[#D2531F] disabled:opacity-40 text-white flex items-center justify-center transition-all duration-200 shrink-0 shadow-md cursor-pointer hover:scale-105 rounded-tl-xl rounded-tr-xs rounded-br-xl rounded-bl-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
