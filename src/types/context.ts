import type { Context } from "grammy";
import type { SessionData } from "./session";

export interface CustomContext extends Context {
  session: SessionData;
  deleteLastMessage: () => Promise<void>;
  editLastMessage: (
    text: string,
    options?: { parse_mode?: "HTML" | "Markdown" | "MarkdownV2" },
  ) => Promise<void>;
}

export interface MessageContext extends CustomContext {
  message: {
    text?: string;
    voice?: {
      file_id: string;
      file_unique_id: string;
      duration: number;
      mime_type?: string;
      file_size?: number;
    };
    message_id: number;
    date: number;
    chat: any;
    from: any;
  };
}

export interface CallbackQueryContext extends CustomContext {
  callbackQuery: {
    data: string;
    id: string;
    from: any;
    chat_instance: string;
  };
}
