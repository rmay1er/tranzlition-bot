//Текст в речь файл ogg на выходи для голосового в телеграм.
import OpenAI from 'openai'
import { Readable } from 'stream'

class TextToSpeechTelegram {
	constructor(apiKey) {
		this.openai = new OpenAI({ apiKey: apiKey })
	}

	async convertToSpeech(text) {
		try {
			const response = await this.openai.audio.speech.create({
				model: 'tts-1',
				voice: 'alloy',
				input: text,
				response_format: 'opus',
			})

			const buffer = Buffer.from(await response.arrayBuffer())
			const fileName = `speech_${Date.now()}.ogg`

			// Создаем поток из буфера
			const stream = Readable.from(buffer)

			return {
				fileName: fileName,
				stream: stream,
			}
		} catch (error) {
			console.error('Ошибка при конвертации текста в речь:', error.message)
			throw error
		}
	}
}

export default TextToSpeechTelegram
