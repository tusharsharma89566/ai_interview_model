
import React from 'react';
import { SendIcon, MicrophoneIcon, MicrophoneOffIcon } from './IconComponents';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
  isRecording: boolean;
  toggleRecording: () => void;
  speechRecognitionAvailable: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  stopAISpeaking: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled, 
  isRecording, 
  toggleRecording, 
  speechRecognitionAvailable,
  inputText,
  setInputText,
  stopAISpeaking
}) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !disabled) {
      onSendMessage(inputText.trim());
      // setInputText(''); // App.tsx now clears it on send
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    stopAISpeaking(); // Stop AI if user starts typing
    setInputText(e.target.value);
  }

  const handleMicClick = () => {
    stopAISpeaking(); // Stop AI if user wants to record
    toggleRecording();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 sm:space-x-3">
      {speechRecognitionAvailable && (
        <button
          type="button"
          onClick={handleMicClick}
          disabled={disabled && !isRecording} // Can stop recording even if main input is disabled
          className={`p-2.5 rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500
            ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}
            disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          title={isRecording ? "Stop recording" : "Start recording (Voice Input)"}
        >
          {isRecording ? <MicrophoneOffIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicrophoneIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      )}
      <input
        type="text"
        value={inputText}
        onChange={handleInputChange}
        placeholder={isRecording ? "Listening..." : "Type your answer..."}
        disabled={disabled}
        className="flex-grow p-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-150 disabled:opacity-60"
        aria-label="Chat input"
      />
      <button
        type="submit"
        disabled={disabled || !inputText.trim()}
        className="bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <SendIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </form>
  );
};

export default ChatInput;
