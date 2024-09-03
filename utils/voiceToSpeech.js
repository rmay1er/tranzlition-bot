import axios from 'axios'
import { OpenAI } from 'openai'
import fs from 'fs'

class VoiceToSpeech {
	constructor(GPTapiKey, TGapiToken) {
		this.openai = new OpenAI({ apiKey: GPTapiKey })
		this.botToken = TGapiToken
	}

	async getWhisperResponse(filePath) {
		try {
			// Загрузка голосового файла
			const fileUrl = `https://api.telegram.org/file/bot${this.botToken}/${filePath}`
			const response = await axios.get(fileUrl, { responseType: 'arraybuffer' })

			// Создание временного файла для OpenAI Whisper
			const tempFilePath = './temp_voice_file.ogg'
			fs.writeFileSync(tempFilePath, response.data)

			// Транскрибирование с помощью OpenAI Whisper
			const transcription = await this.openai.audio.transcriptions.create({
				file: fs.createReadStream(tempFilePath),
				model: 'whisper-1',
			})

			// Удаление временного файла
			fs.unlinkSync(tempFilePath)

			return transcription.text
		} catch (error) {
			console.error('Ошибка в ответе:', error)
			throw error
		}
	}
}

export default VoiceToSpeech

// Примечание к использованию:
// const voiceToSpeech = new VoiceToSpeech('your-openai-api-key', 'your-telegram-bot-token')
// const response = await voiceToSpeech.getWhisperResponse('file-path')
// console.log(response)
