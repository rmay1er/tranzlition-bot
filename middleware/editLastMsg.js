export const lastMsgMiddleware = async (ctx, next) => {
	// Добавляем метод editLastMessage в ctx
	ctx.editLastMessage = async (text, options = {}) => {
		if (ctx.session.lastMessage) {
			await ctx.api.editMessageText(
				ctx.chat.id,
				ctx.session.lastMessage.id,
				text,
				options
			)
		} else {
			console.error('no lastMessageId')
		}
	}

	// Добавляем метод deleteLastMessage в ctx
	ctx.deleteLastMessage = async () => {
		if (ctx.session.lastMessage) {
			await ctx.api.deleteMessage(ctx.chat.id, ctx.session.lastMessage.id)
			ctx.session.lastMessage.id = null // Сбрасываем ID сообщения
		}
	}

	await next() // Передаем управление следующему middleware
}
