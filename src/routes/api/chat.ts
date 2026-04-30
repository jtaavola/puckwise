import { pipeJsonRender } from "@json-render/core";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { withTracing } from "@posthog/ai";
import { createFileRoute } from "@tanstack/react-router";
import {
	createAgentUIStream,
	createUIMessageStreamResponse,
	safeValidateUIMessages,
	ToolLoopAgent,
} from "ai";
import { chartPrompt } from "#/lib/chart-catalog";
import { getNhlPlayerLanding, searchNhlPlayers } from "#/lib/nhl-tools";
import { posthogClient } from "#/utils/posthog-server";

function createPuckwiseAgent({
	distinctId,
	sessionId,
}: {
	distinctId: string;
	sessionId: string | null;
}) {
	if (!process.env.LLM_MODEL) {
		throw new Error("LLM_MODEL environment variable is not set");
	}

	if (!process.env.OPENROUTER_API_KEY) {
		throw new Error("OPENROUTER_API_KEY environment variable is not set");
	}

	return new ToolLoopAgent({
		model: withTracing(openrouter(process.env.LLM_MODEL), posthogClient, {
			posthogDistinctId: distinctId,
			posthogProperties: {
				$ai_span_name: "puckwise-chat",
				$session_id: sessionId || undefined,
			},
		}),
		instructions: `You are Puckwise, an AI hockey analytics assistant. Answer clearly and concisely.

You can include charts in answers using JSON Render specs. Use charts when they clarify comparisons, rankings, trends, or season-by-season data. If a user explicitly asks to show, plot, graph, or chart season-by-season data, the final answer must include a chart spec; do not merely promise to create one.

${chartPrompt}

You have access to live NHL data through two tools:
- searchNhlPlayers: resolve a player's last name, optionally with first name, to a list of matching player IDs.
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
				const sessionId = request.headers.get("X-PostHog-Session-Id");
				const distinctId =
					request.headers.get("X-PostHog-Distinct-Id") || "anonymous";

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

					posthogClient.capture({
						distinctId,
						event: "chat_message_received",
						properties: {
							$session_id: sessionId || undefined,
							message_count: validationResult.data.length,
						},
					});

					return createUIMessageStreamResponse({
						stream: pipeJsonRender(
							await createAgentUIStream({
								agent: createPuckwiseAgent({ distinctId, sessionId }),
								uiMessages: validationResult.data,
							}),
						),
					});
				} catch (error) {
					console.error("Failed to generate chat response", error);

					posthogClient.captureException(error, distinctId, {
						$session_id: sessionId || undefined,
						source: "api_chat",
					});

					return Response.json(
						{ error: "Failed to generate response" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
