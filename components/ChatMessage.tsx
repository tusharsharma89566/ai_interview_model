
import React from 'react';
import { ChatMessageData } from '../types';
import { UserIcon, BotIcon, SpeakerPlayIcon, SpeakerStopIcon } from './IconComponents';

interface ChatMessageProps {
  message: ChatMessageData;
  speakText?: (text: string, messageId: string) => void;
  stopSpeaking?: () => void;
  isThisMessageSpeaking?: boolean;
  speechSynthesisAvailable?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  speakText, 
  stopSpeaking, 
  isThisMessageSpeaking,
  speechSynthesisAvailable 
}) => {
  const isUser = message.sender === 'user';

  if (message.isHidden) {
    return null; // Don't render hidden messages
  }

  const handleSpeakerClick = () => {
    if (!speechSynthesisAvailable) return;

    if (isThisMessageSpeaking && stopSpeaking) {
      stopSpeaking();
    } else if (speakText) {
      speakText(message.text, message.id);
    }
  };

  return (
    <div className={`flex items-end space-x-2 sm:space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 self-start">
          <BotIcon className="w-8 h-8 text-teal-400 rounded-full" />
        </div>
      )}
      <div
        className={`p-3 rounded-xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg shadow-md break-words relative group ${
          isUser
            ? 'bg-teal-600 text-white rounded-br-none'
            : 'bg-gray-700 text-gray-100 rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        {!isUser && speechSynthesisAvailable && speakText && stopSpeaking && (
          <button
            onClick={handleSpeakerClick}
            className={`absolute -top-2 -right-2 p-1 bg-gray-600 hover:bg-gray-500 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150
                        ${isThisMessageSpeaking ? 'opacity-100' : ''}`}
            aria-label={isThisMessageSpeaking ? "Stop speaking" : "Play message audio"}
            title={isThisMessageSpeaking ? "Stop speaking" : "Play message audio"}
          >
            {isThisMessageSpeaking ? 
              <SpeakerStopIcon className="w-4 h-4" /> : 
              <SpeakerPlayIcon className="w-4 h-4" />}
          </button>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 self-start">
          <UserIcon className="w-8 h-8 text-gray-400 rounded-full" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
