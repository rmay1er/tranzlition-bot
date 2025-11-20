import type { CustomContext } from "../types/context.js";
import { logger } from "../utils/logger.js";

export const lastMsgMiddleware = async (
  ctx: CustomContext,
  next: () => Promise<void>,
) => {
  ctx.editLastMessage = async (
    text: string,
    options: { parse_mode?: "HTML" | "Markdown" | "MarkdownV2" } = {},
  ) => {
    try {
      if (ctx.session.lastMessage?.id) {
        await ctx.api.editMessageText(
          ctx.chat!.id,
          ctx.session.lastMessage.id,
          text,
          options,
        );
      } else {
        logger.warn("Отсутствует ID последнего сообщения");
      }
    } catch (error) {
      logger.error("Ошибка при редактировании сообщения");
      throw error;
    }
  };

  ctx.deleteLastMessage = async () => {
    try {
      if (ctx.session.lastMessage?.id) {
        await ctx.api.deleteMessage(ctx.chat!.id, ctx.session.lastMessage.id);
        ctx.session.lastMessage.id = null; // Сбрасываем ID сообщения
      } else {
        logger.warn("Отсутствует ID последнего сообщения для удаления");
      }
    } catch (error) {
      logger.error("Ошибка при удалении сообщения");
      throw error;
    }
  };

  await next(); // Передаем управление следующему middleware
};
