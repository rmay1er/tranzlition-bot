export const lastMsgMiddleware = async (ctx, next) => {
	ctx.editLastMessage = async (text, options = {}) => {
		try {
			if (ctx.session.lastMessage?.id) {
				await ctx.api.editMessageText(
					ctx.chat.id,
					ctx.session.lastMessage.id,
					text,
					options
				)
			} else {
				console.error('Отсутствует ID последнего сообщения')
			}
		} catch (error) {
			console.error('Ошибка при редактировании сообщения')
			throw error
		}
	}

	ctx.deleteLastMessage = async () => {
		try {
			if (ctx.session.lastMessage?.id) {
				await ctx.api.deleteMessage(ctx.chat.id, ctx.session.lastMessage.id)
				ctx.session.lastMessage.id = null // Сбрасываем ID сообщения
			} else {
				console.error('Отсутствует ID последнего сообщения для удаления')
			}
		} catch (error) {
			console.error('Ошибка при удалении сообщения')
			throw error
		}
	}

	await next() // Передаем управление следующему middleware
}
