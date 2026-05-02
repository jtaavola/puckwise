import { useChat } from "@ai-sdk/react";
import { SPEC_DATA_PART_TYPE } from "@json-render/core";
import { usePostHog } from "@posthog/react";
import { IconArrowNarrowUp } from "@tabler/icons-react";
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
import { PuckwiseMessageParts } from "#/components/puckwise-message-parts";

export const Route = createFileRoute("/")({ component: Puckwise });

const suggestions = [
	"Compare Quinn Hughes points per game for VAN and for MN this year",
	"Show Boldy and Kaprizov goals over last 5 years",
	"How many career games does Spurgeon have?",
	"Compare Connor McDavid and Nathan MacKinnon points this season",
];

function Puckwise() {
	const posthog = usePostHog();
	const { error, messages, sendMessage, status } = useChat({
		onError: (error) => {
			posthog.captureException(error);
		},
	});
	const isLoading = status === "submitted" || status === "streaming";
	const [inputValue, setInputValue] = useState("");
	const hasSubmitted = messages.length > 0;
	// We aren't displaying thinking tokens, so visible assistant messages need user-facing content.
	const visibleMessages = messages.filter(
		(message) =>
			message.role !== "assistant" ||
			message.parts.some(
				(part) =>
					hasCompleteAssistantPart(part) ||
					part.type === "dynamic-tool" ||
					part.type.startsWith("tool-"),
				),
	);
	const isWaitingForVisibleResponse = isLoading;

	const submitMessage = async (messageText: string) => {
		const text = messageText.trim();

		if (!text || isLoading) {
			return;
		}

		posthog.capture("chat_message_submitted", {
			question_length: text.length,
			conversation_length: messages.length,
		});

		setInputValue("");
		sendMessage(
			{ text },
			{
				headers: {
					"X-PostHog-Session-Id": posthog.get_session_id() ?? "",
					"X-PostHog-Distinct-Id": posthog.get_distinct_id() ?? "",
				},
			},
		);
	};

	// TODO: Respect prefers-reduced-motion before shipping; consider MotionConfig or useReducedMotion.
	return (
		<main
			className={`bg-background pt-16 text-foreground ${
				hasSubmitted
					? "h-dvh overflow-hidden"
					: "min-h-dvh overflow-x-hidden overflow-y-auto"
			}`}
		>
			<motion.div
				className={`mx-auto flex min-h-0 w-full flex-col ${
					hasSubmitted ? "h-full" : "min-h-[calc(100dvh-4rem)]"
				}`}
				layout
				transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
			>
				<motion.div
					className={`flex w-full min-h-0 flex-1 flex-col px-0 pb-4 sm:pb-6 ${
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
								className="min-h-0 w-full flex-1 pb-4"
								exit={{ opacity: 0 }}
								initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
								animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
								transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
							>
								<Conversation className="h-full">
									<ConversationContent className="mx-auto w-full max-w-3xl px-4 pb-8">
										{visibleMessages.map((message) => (
											<Message from={message.role} key={message.id}>
												<MessageContent>
													<PuckwiseMessageParts parts={message.parts} />
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
													<MessageResponse>
														Sorry, something went wrong while generating a
														response.
													</MessageResponse>
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
						className="mx-auto w-full max-w-2xl shrink-0 px-4"
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
									placeholder={"Ask about NHL stats..."}
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
								className="mx-auto w-full max-w-4xl px-4"
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
													posthog.capture("suggestion_clicked", {
														suggestion: selectedSuggestion,
													});
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

function hasCompleteAssistantPart(part: { type: string; text?: string }) {
	return (
		(part.type === "text" && (part.text?.trim().length ?? 0) > 0) ||
		part.type === SPEC_DATA_PART_TYPE
	);
}
