import { IconArrowNarrowUp } from "@tabler/icons-react";
import { fetchServerSentEvents } from "@tanstack/ai-client";
import { useChat } from "@tanstack/ai-react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "#/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "#/components/ai-elements/message";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
} from "#/components/ai-elements/prompt-input";
import { Shimmer } from "#/components/ai-elements/shimmer";
import { Suggestion, Suggestions } from "#/components/ai-elements/suggestion";

export const Route = createFileRoute("/")({ component: Puckwise });

const suggestions = [
	"Who leads the league in goals this season?",
	"Show me the current standings",
	"Who has the most 5-on-5 goals in the last 3 years?",
	"Who leads in assists this season?",
];

function Puckwise() {
	const { error, isLoading, messages, sendMessage } = useChat({
		connection: fetchServerSentEvents("/api/chat"),
	});
	const [inputValue, setInputValue] = useState("");
	const hasSubmitted = messages.length > 0;
	// we aren't displaying thinking tokens, so visible messages are the ones that have text tokens
	const visibleMessages = messages.filter(
		(message) =>
			message.role !== "assistant" ||
			message.parts.some(
				(part) => part.type === "text" && part.content.trim().length > 0,
			),
	);
	const isWaitingForVisibleResponse =
		isLoading && visibleMessages.at(-1)?.role === "user";

	const submitMessage = async (messageText: string) => {
		const text = messageText.trim();

		if (!text || isLoading) {
			return;
		}

		setInputValue("");
		await sendMessage(text);
	};

	// TODO: Respect prefers-reduced-motion before shipping; consider MotionConfig or useReducedMotion.
	return (
		<main className="h-screen overflow-hidden bg-background px-4 py-6 text-foreground sm:py-8">
			<motion.div
				className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-col items-center"
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

					<AnimatePresence initial={false}>
						{hasSubmitted && (
							<motion.div
								className="min-h-0 w-full flex-1 py-4"
								exit={{ opacity: 0 }}
								initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
								animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
								transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
							>
								<Conversation className="h-full">
									<ConversationContent className="px-0 pb-8">
										{visibleMessages.map((message) => (
											<Message from={message.role} key={message.id}>
												<MessageContent>
													{message.parts.map((part, idx) => {
														if (part.type === "text") {
															return (
																// biome-ignore lint/suspicious/noArrayIndexKey: yolo
																<MessageResponse key={idx}>
																	{part.content}
																</MessageResponse>
															);
														}
														return null;
													})}
												</MessageContent>
											</Message>
										))}
										{isWaitingForVisibleResponse && (
											<Message from="assistant">
												<MessageContent aria-live="polite">
													<Shimmer className="text-sm" duration={1.6}>
														Getting pucks deep…
													</Shimmer>
												</MessageContent>
											</Message>
										)}
										{error && (
											<Message from="assistant">
												<MessageContent>
													<MessageResponse>{`Error: ${error.message}`}</MessageResponse>
												</MessageContent>
											</Message>
										)}
									</ConversationContent>
									<ConversationScrollButton />
								</Conversation>
							</motion.div>
						)}
					</AnimatePresence>

					<motion.div
						className="w-full shrink-0"
						layout
						transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
					>
						<PromptInput
							onSubmit={(message) => {
								void submitMessage(message.text);
							}}
						>
							<PromptInputBody>
								<PromptInputTextarea
									onChange={(event) => setInputValue(event.currentTarget.value)}
									placeholder={
										'Ask about NHL stats... (e.g., "Who has the most goals this season?")'
									}
									value={inputValue}
								/>
							</PromptInputBody>
							<PromptInputFooter className="justify-end">
								<PromptInputSubmit disabled={isLoading}>
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
									<Suggestions className="justify-center">
										{suggestions.map((suggestion) => (
											<Suggestion
												key={suggestion}
												onClick={(selectedSuggestion) => {
													setInputValue(selectedSuggestion);
													void submitMessage(selectedSuggestion);
												}}
												suggestion={suggestion}
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
