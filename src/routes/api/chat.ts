import {
	chat,
	convertMessagesToModelMessages,
	type ModelMessage,
	toServerSentEventsResponse,
} from "@tanstack/ai";
import { createOpenRouterText } from "@tanstack/ai-openrouter";
import { createFileRoute } from "@tanstack/react-router";
import type { OpenRouterTextModels } from "node_modules/@tanstack/ai-openrouter/dist/esm/adapters/text";
import { z } from "zod";

type TextOnlyModelMessage = ModelMessage<string | null>;

const messagePartSchema = z.union([
	z.looseObject({
		type: z.literal("text"),
		content: z.string(),
	}),
	z.looseObject({
		type: z.literal("thinking"),
		content: z.string(),
	}),
]);

const chatRequestSchema = z.looseObject({
	messages: z
		.array(
			z.looseObject({
				id: z.string(),
				role: z.enum(["user", "assistant"]),
				parts: z.array(messagePartSchema),
			}),
		)
		.min(1),
});

function isTextOnlyModelMessage(
	message: ModelMessage,
): message is TextOnlyModelMessage {
	return typeof message.content === "string" || message.content === null;
}

function convertMessagesToTextOnlyModelMessages(
	messages: z.infer<typeof chatRequestSchema>["messages"],
): Array<TextOnlyModelMessage> | null {
	const modelMessages = convertMessagesToModelMessages(messages);

	if (!modelMessages.every(isTextOnlyModelMessage)) {
		return null;
	}

	return modelMessages;
}

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
				let payload: z.infer<typeof chatRequestSchema>;

				try {
					payload = chatRequestSchema.parse(await request.json());
				} catch {
					return Response.json({ error: "Invalid chat request" }, { status: 400 });
				}

				try {
					const messages = convertMessagesToTextOnlyModelMessages(payload.messages);

					if (!messages) {
						return Response.json({ error: "Invalid chat request" }, { status: 400 });
					}

					const stream = chat({
						adapter: getOpenRouterAdapter(),
						messages,
						systemPrompts: [
							"You are Puckwise, an AI hockey analytics assistant. Answer clearly and concisely. If current NHL data is required and you do not have access to a live stats tool, say so instead of inventing statistics.",
						],
					});

					return toServerSentEventsResponse(stream);
				} catch (error) {
					console.error("Failed to generate chat response", error);

					return Response.json(
						{ error: "Failed to generate response" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
