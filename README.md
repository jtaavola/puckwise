# Puckwise

Puckwise is an AI hockey analytics chat assistant powered by live NHL data.

## Development

### Requirements

- Node.js 22+
- npm
- OpenRouter API key

### Environment

Create a `.env.local` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
LLM_MODEL=your_openrouter_model
```

Example model values are available from OpenRouter, such as `openai/gpt-5.4` or another supported text model.

### Running

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000` by default.
