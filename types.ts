export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  totalPages: number;
  currentPage: number;
  summary: string;
  status: 'to-read' | 'reading' | 'finished';
  quotes: string[];
  content?: string;
}

export interface ReadingGoal {
  target: number;
  year: number;
}

export interface ChatMessage {
  id:string;
  sender: 'user' | 'ai';
  text: string;
}