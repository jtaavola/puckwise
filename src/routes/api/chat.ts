import {
	chat,
	convertMessagesToModelMessages,
	type ModelMessage,
	toServerSentEventsResponse,
} from "@tanstack/ai";
import { createOpenRouterText } from "@tanstack/ai-openrouter";
import { createFileRoute } from "@tanstack/react-router";
import type {
	OpenRouterTextAdapter,
	OpenRouterTextModels,
} from "node_modules/@tanstack/ai-openrouter/dist/esm/adapters/text";
import { z } from "zod";
import { getNhlPlayerLanding, searchNhlPlayers } from "#/lib/nhl-tools";

type TextOnlyModelMessage = ModelMessage<string | null>;

const chatRequestSchema = z.looseObject({
	messages: z
		.array(
			z.looseObject({
				id: z.string(),
				role: z.enum(["user", "assistant"]),
				parts: z.array(z.any()),
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

function createChatAdapter() {
	if (!process.env.LLM_MODEL) {
		throw new Error("LLM_MODEL environment variable is not set");
	}

	if (!process.env.OPENROUTER_API_KEY) {
		throw new Error("OPENROUTER_API_KEY environment variable is not set");
	}

	return createOpenRouterText(
		process.env.LLM_MODEL as OpenRouterTextModels,
		process.env.OPENROUTER_API_KEY,
	);
}

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				let payload: z.infer<typeof chatRequestSchema>;

				try {
					payload = chatRequestSchema.parse(await request.json());
				} catch {
					return Response.json(
						{ error: "Invalid chat request" },
						{ status: 400 },
					);
				}

				try {
					const messages = convertMessagesToTextOnlyModelMessages(
						payload.messages,
					);

					if (!messages) {
						return Response.json(
							{ error: "Invalid chat request" },
							{ status: 400 },
						);
					}

					const stream = chat({
						adapter: createChatAdapter(),
						messages,
						tools: [searchNhlPlayers, getNhlPlayerLanding],
						systemPrompts: [
							`You are Puckwise, an AI hockey analytics assistant. Answer clearly and concisely.

You have access to live NHL data through two tools:
- searchNhlPlayers: resolve a player's last name to a list of matching player IDs.
- getNhlPlayerLanding: fetch a player's full profile and season-by-season totals.

Use these tools when answering questions about current or historical NHL players, teams, games, stats, scores, standings, schedules, rosters, boxscores, or play-by-play. Do not invent statistics.

Rules for interpreting stats:
- When filtering seasonTotals from getNhlPlayerLanding, use leagueAbbrev === "NHL" and gameTypeId === 2 for regular-season NHL stats.
- For playoff stats, use gameTypeId === 3.
- When the user says "last year", prefer the previous completed NHL season, not a season that is currently in progress.
- If a player's name is ambiguous (multiple matches from searchNhlPlayers), ask a clarifying question instead of guessing.
- If no player matches, tell the user no matching NHL player was found and ask for more detail.
- Ignore non-NHL rows unless the user explicitly asks about junior, international, AHL, or other leagues.`,
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
