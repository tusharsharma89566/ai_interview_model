
export interface ChatMessageData {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isHidden?: boolean; // Optional: To hide certain system messages like the initial prompt
}

export enum InterviewState {
  NOT_STARTED = 'NOT_STARTED',
  LOADING_SYSTEM_PROMPT = 'LOADING_SYSTEM_PROMPT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}
