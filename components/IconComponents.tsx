
import React from 'react';

interface IconProps {
  className?: string;
}

export const UserIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

export const BotIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 8h-1V4.79C18 3.25 16.75 2 15.21 2c-1.22 0-2.3.77-2.78 1.87-.14.33-.22.69-.22 1.06V8H8v8H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2zm-5-3c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 12H6v-5h14v5zm-3-7.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-6 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
    <path d="M0 0h24v24H0z" fill="none"/>
    <circle cx="15" cy="13.5" r="1.5"/>
    <circle cx="9" cy="13.5" r="1.5"/>
    <path d="M15.21 2C16.75 2 18 3.25 18 4.79V7H6V4.79C6 3.25 7.25 2 8.79 2S11.07 3.01 11.43 4H12.57C12.93 3.01 13.67 2 14.71 2h.5zM14 5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
 </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

export const MicrophoneIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15a.996.996 0 0 0-.98-.85C5.47 11 5 11.45 5 12.01v.02c0 3.53 2.61 6.43 6 6.92V22h2v-3.05c3.39-.49 6-3.39 6-6.92v-.02c0-.56-.47-1.01-1.09-1.01z"/>
  </svg>
);

export const MicrophoneOffIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.79 5.79c.08-.3.13-.61.13-.94 0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3 .33 0 .64-.05.94-.13L17.82 17H17v-1.17l-2.81-2.81c.52.25 1.1.4 1.72.4.22 0 .43-.02.64-.05l1.45 1.45C15.89 17.82 15.06 18 14.19 18H14v3h-4v-3H9.81c-.87 0-1.7-.18-2.45-.51l1.45-1.45c.16.03.33.05.5.05 1.66 0 3-1.34 3-3V8.83l-3-3V5c0-1.66 1.34-3 3-3s3 1.34 3 3v6c0 .5-.13.96-.34 1.37L12 14zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15a.996.996 0 0 0-.98-.85C5.47 11 5 11.45 5 12.01v.02c0 3.53 2.61 6.43 6 6.92V22h2v-3.05c.91-.13 1.77-.45 2.55-.9L19 19.05l1.41-1.41L4.41 3 3 4.41l2.91 2.91C5.55 7.94 5 8.9 5 10v2c0 .56.47 1.01 1.09 1.01.49 0 .9-.36.98-.85C7.48 9.8 9.53 8 12 8s4.52 1.8 4.93 4.15c.07.49.49.85.98.85.62 0 1.09-.45 1.09-1.01V10c0-.28-.05-.55-.12-.81l2.03 2.03z"/>
  </svg>
);


export const SpeakerPlayIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);

export const SpeakerStopIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L7 9H3v6h4l5 5V4z"/>
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
     <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 17.25a.75.75 0 01-.75-.75V12a.75.75 0 011.5 0v4.5a.75.75 0 01-.75.75zm0-8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" />
  </svg>
);
