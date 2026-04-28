import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { createOpenRouterText } from "@tanstack/ai-openrouter";
import { createFileRoute } from "@tanstack/react-router";
import type { OpenRouterTextModels } from "node_modules/@tanstack/ai-openrouter/dist/esm/adapters/text";

function getOpenRouterAdapter() {
	const apiKey = process.env.LLM_API_KEY;
	const model = process.env.LLM_MODEL;

	if (!apiKey) {
		throw new Error("Missing LLM_API_KEY environment variable");
	}

	if (!model) {
		throw new Error("Missing LLM_model environment variable");
	}

	return createOpenRouterText(model as OpenRouterTextModels, apiKey, {
		serverURL: process.env.LLM_BASE_URL,
	});
}

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const { messages } = await request.json();

					const stream = chat({
						adapter: getOpenRouterAdapter(),
						messages,
						systemPrompts: [
							"You are Puckwise, an AI hockey analytics assistant. Answer clearly and concisely. If current NHL data is required and you do not have access to a live stats tool, say so instead of inventing statistics.",
						],
					});

					return toServerSentEventsResponse(stream);
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: "Failed to generate response";

					return Response.json({ error: message }, { status: 500 });
				}
			},
		},
	},
});
