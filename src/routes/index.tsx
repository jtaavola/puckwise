import { IconArrowNarrowUp } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { nanoid } from "nanoid";
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

type ChatMessage = {
	id: string;
	text: string;
};

function Puckwise() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const hasSubmitted = messages.length > 0;

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
										{messages.map((message) => (
											<Message from="user" key={message.id}>
												<MessageContent>
													<MessageResponse>{message.text}</MessageResponse>
												</MessageContent>
											</Message>
										))}
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
								const text = message.text.trim();

								if (!text) {
									return;
								}

								const id = nanoid();

								setMessages((currentMessages) => [
									...currentMessages,
									{
										id,
										text,
									},
								]);
							}}
						>
							<PromptInputBody>
								<PromptInputTextarea
									placeholder={
										'Ask about NHL stats... (e.g., "Who has the most goals this season?")'
									}
								/>
							</PromptInputBody>
							<PromptInputFooter className="justify-end">
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
