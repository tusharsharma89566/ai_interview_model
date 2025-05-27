
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessageData, InterviewState } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingSpinner from './components/LoadingSpinner';
import TimerDisplay from './components/TimerDisplay';
import { UserIcon, BotIcon, InfoIcon } from './components/IconComponents';
import { generateSystemPrompt, MODEL_NAME } from './constants';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

type SpeechRecognitionErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported";

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null; // Updated
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

  abort(): void;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
    SpeechSynthesisErrorEvent: typeof SpeechSynthesisErrorEvent;
    SpeechRecognitionErrorEvent: typeof SpeechRecognitionErrorEvent; // Added for clarity
  }
}

const App: React.FC = () => {
  const [apiKeyExists, setApiKeyExists] = useState<boolean>(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewState, setInterviewState] = useState<InterviewState>(InterviewState.NOT_STARTED);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState<boolean>(false);
  const [speechSynthesisAvailable, setSpeechSynthesisAvailable] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoPlayAiResponse, setAutoPlayAiResponse] = useState<boolean>(true);
  const [currentSpokenMessageId, setCurrentSpokenMessageId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState<string>("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerIntervalRef = useRef<number | null>(null); // Changed NodeJS.Timeout to number

  // New state for interview customization
  const [jobRole, setJobRole] = useState<string>("");
  const [userSkills, setUserSkills] = useState<string>("");
  const [userProjects, setUserProjects] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<number>(10); // Default duration
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds


  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (process.env.API_KEY) {
      setApiKeyExists(true);
    } else {
      setError("API_KEY environment variable not found. Please ensure it is set.");
      setApiKeyExists(false);
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setSpeechRecognitionAvailable(true);
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setChatInputText(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error, "Message:", event.message);
        let errorMessage = `Speech recognition error: ${event.error}.`;
        if (event.message) {
          errorMessage += ` Message: ${event.message}`;
        }
        setError(errorMessage);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

    } else {
      setSpeechRecognitionAvailable(false);
      console.warn("Speech Recognition API not available.");
    }

    if ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
      setSpeechSynthesisAvailable(true);
      utteranceRef.current = new SpeechSynthesisUtterance();
      utteranceRef.current.onstart = () => setIsSpeaking(true);
      utteranceRef.current.onend = () => {
        setIsSpeaking(false);
        setCurrentSpokenMessageId(null);
      };
      utteranceRef.current.onerror = (event: Event) => { // Keep as Event due to SpeechSynthesisErrorEvent potentially not being the only error type
        console.error("Speech synthesis error event:", event);
        let displayErrorMessage = "An unknown error occurred during speech synthesis.";
        if (event instanceof window.SpeechSynthesisErrorEvent) {
          displayErrorMessage = `Speech synthesis error: ${event.error}.`;
          if (event.error === 'audio-busy') {
            displayErrorMessage += " The audio device might be busy. Please try again shortly.";
          }
        } else {
          const eventDetails: {[key: string]: any} = {};
          if (event) {
            for (const key in event) {
                if (Object.prototype.hasOwnProperty.call(event, key)) {
                    const value = (event as any)[key];
                    if (typeof value !== 'object' && typeof value !== 'function') {
                        eventDetails[key] = value;
                    } else if (key === 'error' && value) { // Handle cases where error might be an object
                        eventDetails[key] = String(value);
                    }
                }
            }
          }
          if (Object.keys(eventDetails).length > 0) {
            displayErrorMessage = `Speech synthesis error (generic): Type: ${event.type}, Details: ${JSON.stringify(eventDetails)}`;
          } else if (event && event.type) {
            displayErrorMessage = `Speech synthesis error (generic): Type: ${event.type}`;
          }
        }
        setError(displayErrorMessage);
        setIsSpeaking(false);
        setCurrentSpokenMessageId(null);
      };
    } else {
      setSpeechSynthesisAvailable(false);
      console.warn("Speech Synthesis API not available.");
    }
    
    return () => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.abort();
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]); // isRecording is the main dynamic dependency here that relates to re-setting handlers, API_KEY checked once.

  const stopSpeaking = useCallback(() => {
    if (speechSynthesisAvailable && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); 
    }
  }, [speechSynthesisAvailable]);


  const speakText = useCallback((text: string, messageId: string) => {
    if (!speechSynthesisAvailable || !utteranceRef.current) {
      console.warn("Speech synthesis not available or utterance not initialized.");
      return;
    }
    stopSpeaking(); 
    
    setTimeout(() => { // Ensure any pending cancel() has executed
        if (utteranceRef.current) {
            utteranceRef.current.text = text;
            utteranceRef.current.lang = 'en-US'; 
            setCurrentSpokenMessageId(messageId); 
            window.speechSynthesis.speak(utteranceRef.current);
        }
    }, 50);

  }, [speechSynthesisAvailable, stopSpeaking]);


  const toggleRecording = () => {
    if (!speechRecognitionAvailable || !recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop(); 
    } else {
      stopSpeaking(); 
      setChatInputText(""); 
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setError(null); 
      } catch (e: any) {
          console.error("Error starting speech recognition:", e);
          setError(`Could not start microphone: ${e.message || e.name || "Unknown error"}. Please check permissions.`);
          setIsRecording(false);
      }
    }
  };

  useEffect(scrollToBottom, [messages]);

  // Timer effect
  useEffect(() => {
    if (interviewState === InterviewState.IN_PROGRESS && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft <= 0 && interviewState === InterviewState.IN_PROGRESS) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      // Optionally, inform AI or auto-conclude. For now, timer hitting zero is a visual cue.
      // The AI is prompted to manage time.
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [interviewState, timeLeft]);


  const initializeChat = useCallback(async () => {
    if (!apiKeyExists) {
      setError("Cannot initialize chat: API Key is missing.");
      setInterviewState(InterviewState.NOT_STARTED);
      return;
    }
    setIsLoading(true);
    setError(null);
    setTimeLeft(durationMinutes * 60);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const systemPrompt = generateSystemPrompt(jobRole, userSkills, userProjects, durationMinutes);
      
      const chat = ai.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: systemPrompt,
        }
      });
      setChatSession(chat);

      const initialUserMessageText = "Hello! Please start the interview.";
      
      const response: GenerateContentResponse = await chat.sendMessage({ message: initialUserMessageText });
      const aiResponseText = response.text;
      
      const newAiMessage: ChatMessageData = {
        id: Date.now().toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      };
      setMessages([newAiMessage]); 
      setInterviewState(InterviewState.IN_PROGRESS);
      if (autoPlayAiResponse && aiResponseText) {
        speakText(aiResponseText, newAiMessage.id);
      }

    } catch (e) {
      console.error("Failed to initialize chat session:", e);
      setError(`Failed to start interview: ${e instanceof Error ? e.message : String(e)}. Check your API key and network.`);
      setInterviewState(InterviewState.NOT_STARTED);
    } finally {
      setIsLoading(false);
    }
  }, [apiKeyExists, autoPlayAiResponse, speakText, jobRole, userSkills, userProjects, durationMinutes]);


  const handleSendMessage = async (inputText: string) => {
    if (!chatSession || isLoading || !inputText.trim()) return;
    
    stopSpeaking(); 

    const userMessage: ChatMessageData = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setChatInputText(""); 
    setIsLoading(true);
    setError(null);

    try {
      const response: GenerateContentResponse = await chatSession.sendMessage({ message: inputText });
      const aiResponseText = response.text;
      
      const newAiMessage: ChatMessageData = {
        id: Date.now().toString() + '_ai',
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, newAiMessage]);

      if (autoPlayAiResponse && aiResponseText) {
        speakText(aiResponseText, newAiMessage.id);
      }

      // Check for concluding phrases for overall feedback
      const lowerCaseText = aiResponseText.toLowerCase();
      if (lowerCaseText.includes("concludes our mock interview") || lowerCaseText.includes("this was the final part of our session") || lowerCaseText.includes("feedback session is complete")) {
        setInterviewState(InterviewState.COMPLETED);
         if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      }

    } catch (e) {
      console.error("Failed to send message or get response:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(`Error communicating with AI: ${errorMessage}`);
      const errorAiMessage: ChatMessageData = {
        id: Date.now().toString() + '_error',
        sender: 'ai',
        text: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorAiMessage]);
       if (autoPlayAiResponse) {
        speakText(errorAiMessage.text, errorAiMessage.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startInterview = () => {
    if (!jobRole.trim()) {
        setError("Please enter a Job Role to start the interview.");
        return;
    }
    if (durationMinutes <=0) {
        setError("Please set a valid interview duration.");
        return;
    }
    setError(null);
    setMessages([]);
    setChatInputText("");
    setInterviewState(InterviewState.LOADING_SYSTEM_PROMPT);
    initializeChat();
  };
  
  const restartInterview = () => {
    stopSpeaking();
    setChatSession(null);
    setMessages([]);
    setError(null);
    setChatInputText("");
    setInterviewState(InterviewState.NOT_STARTED);
    // Do not clear jobRole, userSkills, userProjects, durationMinutes here,
    // so user can easily restart with same settings or modify slightly.
    setTimeLeft(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognitionRef.current && isRecording) {
        recognitionRef.current.abort();
        setIsRecording(false);
    }
  };

  if (!apiKeyExists && error?.includes("API_KEY")) {
     return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-100">
        <div className="bg-red-800 p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Configuration Error</h1>
          <p className="text-red-200">{error}</p>
          <p className="mt-4 text-sm text-red-300">Please ensure the API_KEY is correctly configured in your environment.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-gray-800 shadow-2xl">
      <header className="bg-gray-700 p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BotIcon className="w-8 h-8 mr-2 text-teal-400 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-teal-400">
              AI Interview Coach
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {interviewState === InterviewState.IN_PROGRESS && <TimerDisplay timeLeft={timeLeft} />}
            {speechSynthesisAvailable && (interviewState === InterviewState.IN_PROGRESS || interviewState === InterviewState.COMPLETED) && (
              <div className="flex items-center space-x-2" title={autoPlayAiResponse ? "Disable AI voice" : "Enable AI voice"}>
                <span className="text-sm text-gray-300">AI Voice:</span>
                <button
                  onClick={() => {
                      const newAutoPlayState = !autoPlayAiResponse;
                      setAutoPlayAiResponse(newAutoPlayState);
                      if (!newAutoPlayState && isSpeaking) { 
                          stopSpeaking();
                      }
                  }}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none ${autoPlayAiResponse ? 'bg-teal-500' : 'bg-gray-600'}`}
                  role="switch"
                  aria-checked={autoPlayAiResponse}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${autoPlayAiResponse ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
            )}
          </div>
        </div>
         {!speechRecognitionAvailable && interviewState !== InterviewState.NOT_STARTED && (
            <p className="text-xs text-yellow-400 text-center mt-1">Speech input (microphone) not available or not permitted in your browser.</p>
        )}
        {!speechSynthesisAvailable && interviewState !== InterviewState.NOT_STARTED && (
            <p className="text-xs text-yellow-400 text-center mt-1">Speech output (speaker) not available in your browser.</p>
        )}
      </header>

      {interviewState === InterviewState.NOT_STARTED && (
         <div className="flex-grow flex flex-col items-center justify-center p-6 text-center custom-scrollbar overflow-y-auto">
            <UserIcon className="w-20 h-20 text-teal-500 mb-4"/>
            <h2 className="text-3xl font-semibold text-gray-100 mb-3">Ready to Practice?</h2>
            <p className="text-gray-300 mb-6 max-w-md">
              Customize your mock interview below, then click Start.
            </p>

            <div className="w-full max-w-md space-y-4 mb-6">
              <div>
                <label htmlFor="jobRole" className="block text-sm font-medium text-gray-300 mb-1 text-left">Job Role (Required)</label>
                <input 
                  type="text" 
                  id="jobRole"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full p-2.5 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  placeholder="e.g., Software Engineer, Product Manager"
                />
              </div>
              <div>
                <label htmlFor="userSkills" className="block text-sm font-medium text-gray-300 mb-1 text-left">Your Key Skills (Optional)</label>
                <textarea 
                  id="userSkills"
                  value={userSkills}
                  onChange={(e) => setUserSkills(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none custom-scrollbar"
                  placeholder="e.g., React, Python, Project Management"
                />
              </div>
              <div>
                <label htmlFor="userProjects" className="block text-sm font-medium text-gray-300 mb-1 text-left">Your Projects (Optional, brief overview)</label>
                <textarea 
                  id="userProjects"
                  value={userProjects}
                  onChange={(e) => setUserProjects(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none custom-scrollbar"
                  placeholder="e.g., Developed an e-commerce app using MERN stack."
                />
              </div>
              <div>
                <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-300 mb-1 text-left">Interview Duration (Minutes)</label>
                <input 
                  type="number" 
                  id="durationMinutes"
                  value={durationMinutes}
                  min="3"
                  max="60"
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <button
              onClick={startInterview}
              disabled={isLoading || !apiKeyExists || !jobRole.trim()}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-150 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Mock Interview
            </button>
            {isLoading && <div className="mt-4"><LoadingSpinner /> <p className="text-sm text-gray-400">Initializing...</p></div>}
            {error && !error.includes("API_KEY") && <p className="mt-4 text-red-400 px-2 py-1 bg-red-900/50 rounded-md flex items-center gap-2"><InfoIcon className="w-5 h-5 flex-shrink-0"/>{error}</p>}
         </div>
      )}
      
      {(interviewState === InterviewState.IN_PROGRESS || interviewState === InterviewState.LOADING_SYSTEM_PROMPT || interviewState === InterviewState.COMPLETED) && (
        <>
          <div className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar bg-gray-800">
            {messages.filter(msg => !msg.isHidden).map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg}
                speakText={speakText}
                stopSpeaking={stopSpeaking}
                isThisMessageSpeaking={isSpeaking && currentSpokenMessageId === msg.id}
                speechSynthesisAvailable={speechSynthesisAvailable}
              />
            ))}
            {isLoading && messages.length > 0 && messages[messages.length -1].sender === 'user' && (
              <div className="flex justify-start items-center">
                  <BotIcon className="w-8 h-8 mr-2 flex-shrink-0 text-teal-400" />
                  <div className="bg-gray-700 p-3 rounded-lg max-w-xs lg:max-w-md shadow">
                    <LoadingSpinner />
                  </div>
              </div>
            )}
             {isLoading && interviewState === InterviewState.LOADING_SYSTEM_PROMPT && messages.length === 0 && (
                 <div className="flex justify-start items-center">
                    <BotIcon className="w-8 h-8 mr-2 flex-shrink-0 text-teal-400" />
                    <div className="bg-gray-700 p-3 rounded-lg max-w-xs lg:max-w-md shadow">
                        <LoadingSpinner /> <span className="ml-2 text-sm">Preparing your interview...</span>
                    </div>
                 </div>
             )}
            <div ref={messagesEndRef} />
          </div>

          {error && !error.includes("API_KEY") && (
            <div className="p-2 bg-red-700 text-white text-sm text-center" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="p-4 bg-gray-700 border-t border-gray-600">
            {interviewState === InterviewState.COMPLETED ? (
              <div className="text-center">
                <p className="text-lg text-gray-200 mb-4">Interview session completed. Review the feedback above.</p>
                <button
                  onClick={restartInterview}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg shadow transition duration-150"
                >
                  Practice Again
                </button>
              </div>
            ) : (
              <ChatInput 
                onSendMessage={handleSendMessage} 
                disabled={isLoading || interviewState === InterviewState.LOADING_SYSTEM_PROMPT || timeLeft === 0}
                isRecording={isRecording}
                toggleRecording={toggleRecording}
                speechRecognitionAvailable={speechRecognitionAvailable}
                inputText={chatInputText}
                setInputText={setChatInputText}
                stopAISpeaking={stopSpeaking}
              />
            )}
             {interviewState === InterviewState.IN_PROGRESS && timeLeft === 0 && !isLoading && (
                <p className="text-center text-yellow-400 mt-2 text-sm">Time's up! Please send your final answer or wait for the AI to conclude.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
