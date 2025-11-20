export interface LastMessage {
  id: number | null;
  isStart?: boolean;
  translatedText?: string;
  fullText?: string;
}

export interface Language {
  code: string;
  flag: string;
  name: string;
}

export interface SessionData {
  lastMessage: LastMessage;
  langToTranslate?: Language;
}

export interface BotSession {
  session: SessionData;
}
