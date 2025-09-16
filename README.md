# Telegram TTS Bot

A Telegram bot built with [Grammy framework](https://grammy.dev/) that leverages OpenAI technologies for seamless multilingual text and voice translation. This bot supports converting text to speech, voice to text transcription, and text translation with AI-powered context understanding.

---

## Features

- **Multilingual Support**: Translate both text and voice messages into various languages such as English, Thai, Spanish, French, German, Italian, Russian, Chinese, and Japanese.
- **AI Text Generation & Translation**: Uses OpenAI GPT models for accurate and context-aware translations.
- **Voice to Text (Whisper)**: Converts voice messages into transcribed text.
- **Text to Speech (TTS)**: Converts translated text back into natural-sounding speech in OGG format for sending as voice messages.
- **Interactive Language Selection**: Inline keyboard with country flag emojis for quick language selection.
- **Session Management**: Maintains language preference and last message info for each user.
- **Smooth User Interaction**: Supports commands and handlers for both voice and text inputs.
- **Robust Error Handling**: Logs issues and maintains uninterrupted bot service.

---

## Prerequisites

- Node.js (version 18 or later recommended)
- NPM or Yarn package manager
- Telegram Bot Token (from [BotFather](https://t.me/botfather))
- OpenAI API key (with access to GPT, Whisper, and TTS models)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/tts_bot.git
cd tts_bot
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Setup Environment Variables

Create a `.env` file in the project root and add your API keys:

```
BOT_TOKEN=your_telegram_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

> Make sure your OpenAI API key has access to the `gpt-4`, `whisper-1`, and `tts-1` models.

### 4. Run the bot locally

```bash
npm run dev
# or
node bot.js
```

---

## Deployment

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployment to a server via SSH on every push to the `main` branch.

Before using CI/CD deployment:

- Configure your deployment server with Node.js and PM2.
- Add your SSH credentials and server info as GitHub secrets (`SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY`).
- On the server, the bot directory should be at `./JavaScript/tts_bot` or update the deploy script to your path.
- PM2 should be managing the bot process under the name `ttsbot`.

---

## Bot Commands and Usage

- `/start`: Starts interaction and prompts language selection.
- Send **text messages**: The bot translates your message into the selected language and returns translated text and voice.
- Send **voice messages**: The bot transcribes your voice using Whisper, translates the text, and replies with translated text and spoken voice (OGG).
- Select language anytime via the inline keyboard to change the translation target language.

---

## Project Structure Highlights

- `utils/voiceToSpeech.js`: Handles voice message downloading, Whisper transcription.
- `utils/tts2.js`: Converts translated text into speech (OGG format) using OpenAI TTS.
- `middleware/editLastMsg.js`: Middleware for editing or deleting the last bot message to keep the chat clean.
- `.github/workflows/deploy.yml`: GitHub Actions workflow for automated deployment on push to main.

---

## Notes & Customization

- The bot remembers your last selected language and message using session middleware.
- Modify `instructions.json` or similar configuration files if you want to customize AI prompts or translation behavior.
- For extended language or voice support, update the language list and TTS voice models accordingly.

---

## Troubleshooting

- Ensure your API keys are valid and have proper access permissions.
- Check server logs (via PM2 or your process manager) for runtime errors.
- Validate network and firewall settings if the bot cannot reach Telegram or OpenAI APIs.
- The deployment workflow expects the bot to be run using PM2 with process name `ttsbot`.

---

## Contribution

Feel free to fork the repo and submit pull requests for improvements or additional features.

---

## License

This project is licensed under the MIT License.

---

*Created by Ruslan Mayer*
