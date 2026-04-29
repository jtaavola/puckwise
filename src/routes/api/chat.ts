import { openrouter } from "@openrouter/ai-sdk-provider";
import { createFileRoute } from "@tanstack/react-router";
import {
	createAgentUIStreamResponse,
	safeValidateUIMessages,
	ToolLoopAgent,
} from "ai";
import { getNhlPlayerLanding, searchNhlPlayers } from "#/lib/nhl-tools";

function createPuckwiseAgent() {
	if (!process.env.LLM_MODEL) {
		throw new Error("LLM_MODEL environment variable is not set");
	}

	if (!process.env.OPENROUTER_API_KEY) {
		throw new Error("OPENROUTER_API_KEY environment variable is not set");
	}

	return new ToolLoopAgent({
		model: openrouter(process.env.LLM_MODEL),
		instructions: `You are Puckwise, an AI hockey analytics assistant. Answer clearly and concisely.

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
		tools: {
			searchNhlPlayers,
			getNhlPlayerLanding,
		},
	});
}

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				let payload: { messages?: unknown };

				try {
					payload = await request.json();
				} catch (error) {
					console.error("Failed to parse chat request", error);

					return Response.json(
						{ error: "Malformed chat request" },
						{ status: 400 },
					);
				}

				try {
					const validationResult = await safeValidateUIMessages({
						messages: payload.messages,
					});

					if (!validationResult.success) {
						return Response.json(
							{ error: "Invalid chat request" },
							{ status: 400 },
						);
					}

					return createAgentUIStreamResponse({
						agent: createPuckwiseAgent(),
						uiMessages: validationResult.data,
					});
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
