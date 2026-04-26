import { IconSend2 } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
} from "#/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "#/components/ai-elements/suggestion";

export const Route = createFileRoute("/")({ component: Puckwise });

const suggestions = [
	"Who leads the league in goals this season?",
	"Show me the current standings",
	"Who has the most 5-on-5 goals in the last 3 years?",
	"What are Connor McDavid's stats?",
	"Who leads in assists this season?",
	"Show me the Boston Bruins' record",
];

function Puckwise() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 text-foreground">
			<div className="flex w-full max-w-2xl flex-col items-center">
				<div className="mb-8 flex flex-col items-center">
					<img
						src="/logo.png"
						alt="Puckwise"
						className="mb-4 size-28 object-contain"
					/>
					<h1 className="m-0 text-2xl font-semibold tracking-tight">
						Puckwise
					</h1>
					<p className="mt-1 mb-0 text-sm text-muted-foreground">
						Ask questions about hockey statistics
					</p>
				</div>

				<PromptInput onSubmit={() => undefined}>
					<PromptInputBody>
						<PromptInputTextarea
							className="min-h-14 px-5 py-4 text-base"
							placeholder={
								'Ask about NHL stats... (e.g., "Who has the most goals this season?")'
							}
						/>
					</PromptInputBody>
					<PromptInputFooter className="justify-end px-3 pb-3">
						<PromptInputSubmit className="size-11 rounded-xl" size="icon">
							<IconSend2 aria-hidden="true" />
						</PromptInputSubmit>
					</PromptInputFooter>
				</PromptInput>

				<div className="mt-6 w-full">
					<p className="mb-3 text-center text-sm text-muted-foreground">
						Try asking:
					</p>
					<Suggestions className="flex-wrap justify-center whitespace-normal">
						{suggestions.map((suggestion) => (
							<Suggestion
								key={suggestion}
								suggestion={suggestion}
								className="h-auto px-4 py-2"
							/>
						))}
					</Suggestions>
				</div>

				<p className="mt-6 mb-0 text-center text-xs text-muted-foreground">
					Data provided by the official NHL API. Stats may be delayed.
				</p>
			</div>
		</main>
	);
}
