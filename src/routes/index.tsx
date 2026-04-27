import { IconArrowNarrowUp } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
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
	const [hasSubmitted, setHasSubmitted] = useState(false);

	// TODO: Respect prefers-reduced-motion before shipping; consider MotionConfig or useReducedMotion.
	return (
		<main className="min-h-screen overflow-hidden bg-background px-4 py-6 text-foreground sm:py-8">
			<motion.div
				className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col items-center sm:min-h-[calc(100vh-4rem)]"
				layout
				transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
			>
				<motion.div
					className={`flex w-full flex-1 flex-col items-center ${
						hasSubmitted ? "justify-end" : "justify-center"
					}`}
					layout
					transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
				>
					{/* WARNING: Blur filters can be expensive; keep these exit animations limited to small elements. */}
					<AnimatePresence initial={false} mode="popLayout">
						{!hasSubmitted && (
							<motion.div
								className="mb-8 flex flex-col items-center"
								exit={{ opacity: 0, scale: 0.96, y: -22, filter: "blur(8px)" }}
								initial={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
								transition={{ duration: 0.34, ease: [0.4, 0, 0.2, 1] }}
							>
								<img
									src="/logo.png"
									alt="Puckwise"
									className="mb-2 size-28 object-contain"
								/>
								<h1 className="m-0 text-2xl font-bold tracking-tight">
									PUCK<span className="text-primary">WISE</span>
								</h1>
								<p className="mt-1 mb-0 text-sm text-muted-foreground">
									Ask questions about hockey statistics
								</p>
							</motion.div>
						)}
					</AnimatePresence>

					<motion.div
						className="w-full"
						layout
						transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
					>
						<PromptInput
							onSubmit={(message) => {
								if (message.text.trim() || message.files.length > 0) {
									setHasSubmitted(true);
								}
							}}
						>
							<PromptInputBody>
								<PromptInputTextarea
									placeholder={
										'Ask about NHL stats... (e.g., "Who has the most goals this season?")'
									}
								/>
							</PromptInputBody>
							<PromptInputFooter>
								<PromptInputTools />
								<PromptInputSubmit>
									<IconArrowNarrowUp />
								</PromptInputSubmit>
							</PromptInputFooter>
						</PromptInput>
					</motion.div>

					<AnimatePresence initial={false} mode="popLayout">
						{!hasSubmitted && (
							<motion.div
								className="w-full"
								exit={{ opacity: 0, y: 26, filter: "blur(8px)" }}
								initial={{ opacity: 1, y: 0, filter: "blur(0px)" }}
								transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
							>
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
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</motion.div>
		</main>
	);
}
