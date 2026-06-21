
export type Subject = 'Math' | 'Science' | 'English' | 'General';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  audioData?: string;
  isQuiz?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface UserProfile {
  name: string;
  age: number;
  grade: string;
}
