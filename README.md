# README

This project is a Telegram bot designed using the Grammy framework. It incorporates AI technology for language translation and voice processing. The bot offers seamless interaction by translating text and voice messages into multiple languages.

## Features

- **Language Selection**: Users can choose from a variety of languages for translation, including English, Thai, Spanish, French, German, Italian, Russian, Chinese, and Japanese. The language selection is facilitated through an inline keyboard with country flags for easier recognition.

- **AI-Powered Text Generation**: Utilizes the OpenAI GPT model to generate and translate text into the selected language. This feature ensures high-quality translations with contextual relevance.

- **Voice to Text and Text to Speech**: The bot can convert voice messages into text using Whisper and vice versa, enhancing accessibility and ease of communication.

- **Session Management**: Tracks user interactions to provide a consistent experience across sessions. It remembers the last message and the selected language for continuous translation.

## Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Ensure you have API keys from OpenAI and Telegram, then set them in your environment variables.

## Usage

- **/start**: Initiates a conversation with the bot, where users are prompted to select a language for translation.
- **Message Handling**: The bot processes both text and voice messages, translating them into the pre-selected language.
- **Commands and Callbacks**: Uses a set of predefined commands and inline keyboards for user interaction.

## Error Handling

The bot includes error-handling mechanisms to manage errors from both the Grammy framework and HTTP requests. It logs errors for debugging and ensures the bot continues to run smoothly.

## Development and Configuration

- Make sure the `.env` file is properly configured with your API keys.
- Modify `instructions.json` for custom instruction sets used in AI text generation.
- Development configuration, including model selection and versioning, is managed in `devConfig`.

## License

This project is licensed under the MIT License.
