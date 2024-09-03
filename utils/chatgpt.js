import { OpenAI } from 'openai'

class ChatGPT {
	constructor(apiKey, model = 'gpt-4o-mini') {
		this.openai = new OpenAI({ apiKey: apiKey })
		this.model = model
	}

	async getChatGPTResponse(assistantMessage, userMessage) {
		try {
			if (!userMessage || typeof userMessage !== 'string') {
				throw new Error('User message is required and must be a string.')
			}

			// Используем переданное сообщение ассистента, если оно не пустое
			const messages = [
				{ role: 'assistant', content: assistantMessage },
				{ role: 'user', content: userMessage },
			]

			const completion = await this.openai.chat.completions.create({
				model: this.model,
				messages: messages,
				temperature: 1, // Настройки по умолчанию
				max_tokens: 150, // Настройки по умолчанию
			})

			return completion.choices[0].message.content
		} catch (error) {
			console.error('Error in getChatGPTResponse:', error)
			throw error
		}
	}
}

export default ChatGPT

// Примечание к использованию:
// const chatGPT = new ChatGPT('your-api-key', 'gpt-4o-mini')
// const response = await chatGPT.getChatGPTResponse('assistant message', 'user message')
