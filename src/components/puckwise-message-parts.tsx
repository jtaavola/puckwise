import {
	applySpecPatch,
	type JsonPatch,
	nestedToFlat,
	SPEC_DATA_PART_TYPE,
	type Spec,
	type SpecDataPart,
} from "@json-render/core";
import { CheckCircle2, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { MessageResponse } from "#/components/ai-elements/message";
import { isRenderableSpec, PuckwiseChart } from "#/components/puckwise-chart";
import { Spinner } from "#/components/ui/spinner";

type MessagePart = {
	type: string;
	text?: string;
	data?: unknown;
	input?: unknown;
	output?: unknown;
	state?: string;
	toolName?: string;
	title?: string;
};

export function PuckwiseMessageParts({
	parts,
}: {
	parts: readonly MessagePart[];
}) {
	const renderedParts: ReactNode[] = [];
	let pendingSpec = createEmptySpec();
	let hasPendingSpec = false;
	let chartIndex = 0;
	const renderedKeyCounts = new Map<string, number>();

	const flushSpec = () => {
		if (!hasPendingSpec) {
			return;
		}

		if (isRenderableSpec(pendingSpec)) {
			renderedParts.push(
				<PuckwiseChart key={`chart-${chartIndex}`} spec={pendingSpec} />,
			);
		}

		chartIndex += 1;
		pendingSpec = createEmptySpec();
		hasPendingSpec = false;
	};

	parts.forEach((part) => {
		if (part.type === "text") {
			flushSpec();

			if (part.text?.trim()) {
				renderedParts.push(
					<MessageResponse key={nextRenderedKey(renderedKeyCounts, part.text)}>
						{part.text}
					</MessageResponse>,
				);
			}

			return;
		}

		if (isToolPart(part)) {
			if (hasPendingSpec && isRenderableSpec(pendingSpec)) {
				flushSpec();
			}

			renderedParts.push(
				<ToolIndicator
					key={nextRenderedKey(
						renderedKeyCounts,
						`tool-${getToolName(part)}-${part.state}`,
					)}
					part={part}
				/>,
			);
			return;
		}

		if (part.type !== SPEC_DATA_PART_TYPE) {
			return;
		}

		const data = parseSpecData(part.data);

		if (!data) {
			return;
		}

		if (data.type === "patch") {
			if (
				hasPendingSpec &&
				data.patch.path === "/root" &&
				isRenderableSpec(pendingSpec)
			) {
				flushSpec();
			}

			hasPendingSpec = true;
			applyPatchSafely(pendingSpec, data.patch);
			return;
		}

		flushSpec();

		const spec =
			data.type === "flat"
				? data.spec
				: nestedToFlat(data.spec as Record<string, unknown>);

		if (isRenderableSpec(spec)) {
			renderedParts.push(
				<PuckwiseChart key={`chart-${chartIndex}`} spec={spec} />,
			);
			chartIndex += 1;
		}
	});

	flushSpec();

	return <>{renderedParts}</>;
}

function ToolIndicator({ part }: { part: ToolMessagePart }) {
	const status = getToolIndicatorStatus(part.state);

	return (
		<div
			aria-live="polite"
			className="flex w-fit max-w-full items-center gap-2 rounded-full border border-border/70 bg-muted/45 px-3 py-1.5 text-muted-foreground text-xs"
		>
			{status === "running" && <Spinner className="size-3.5" />}
			{status === "done" && (
				<CheckCircle2
					className="size-3.5 text-emerald-600"
					aria-hidden="true"
				/>
			)}
			{status === "error" && (
				<CircleAlert className="size-3.5 text-destructive" aria-hidden="true" />
			)}
			<span className="truncate">{getToolIndicatorLabel(part)}</span>
		</div>
	);
}

type ToolMessagePart = MessagePart & {
	state: string;
};

function isToolPart(part: MessagePart): part is ToolMessagePart {
	return (
		(part.type === "dynamic-tool" || part.type.startsWith("tool-")) &&
		typeof part.state === "string"
	);
}

function getToolName(part: ToolMessagePart) {
	if (part.type === "dynamic-tool") {
		return part.toolName || part.title || "tool";
	}

	return part.type.slice("tool-".length);
}

function getToolIndicatorLabel(part: ToolMessagePart) {
	const toolName = getToolName(part);
	const labels = toolIndicatorLabels[toolName] ?? {
		running: `Using ${formatToolName(toolName)}`,
		done: `Finished ${formatToolName(toolName)}`,
		error: `${formatToolName(toolName)} failed`,
	};
	const detail = getToolIndicatorDetail(
		toolName,
		getToolIndicatorStatus(part.state),
		part,
	);
	const detailSuffix = detail ? ` - ${detail}` : "";

	return `${labels[getToolIndicatorStatus(part.state)]}${detailSuffix}`;
}

const toolIndicatorLabels: Record<
	string,
	Record<"running" | "done" | "error", string>
> = {
	searchNhlPlayers: {
		running: "Searching for player",
		done: "Found player",
		error: "Player search failed",
	},
	getNhlPlayerLanding: {
		running: "Getting player info",
		done: "Got player info",
		error: "Player info lookup failed",
	},
};

function getToolIndicatorStatus(state: string): "running" | "done" | "error" {
	if (state === "output-available" || state === "approval-responded") {
		return "done";
	}

	if (state === "output-error" || state === "output-denied") {
		return "error";
	}

	return "running";
}

function formatToolName(toolName: string) {
	return toolName
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/[-_]+/g, " ")
		.toLowerCase();
}

function formatToolInputSummary(toolName: string, input: unknown) {
	if (!isRecord(input)) {
		return formatPrimitiveInput(input);
	}

	if (toolName === "searchNhlPlayers") {
		return [input.firstName, input.lastName]
			.filter((value) => typeof value === "string" && value.trim())
			.join(" ");
	}

	const entries = Object.entries(input).flatMap(([key, value]) => {
		const formattedValue = formatPrimitiveInput(value);
		return formattedValue ? [`${formatToolName(key)}: ${formattedValue}`] : [];
	});

	return entries.join(", ");
}

function getToolIndicatorDetail(
	toolName: string,
	status: "running" | "done" | "error",
	part: ToolMessagePart,
) {
	if (toolName === "getNhlPlayerLanding" && status === "done") {
		return formatPlayerLandingName(part.output);
	}

	return formatToolInputSummary(toolName, part.input);
}

function formatPlayerLandingName(output: unknown) {
	if (!isRecord(output)) {
		return "";
	}

	if (typeof output.fullName === "string") {
		return output.fullName.trim();
	}

	const firstName = getDefaultLocalizedString(output.firstName);
	const lastName = getDefaultLocalizedString(output.lastName);

	return [firstName, lastName].filter(Boolean).join(" ");
}

function getDefaultLocalizedString(value: unknown) {
	if (!isRecord(value) || typeof value.default !== "string") {
		return "";
	}

	return value.default.trim();
}

function formatPrimitiveInput(input: unknown) {
	if (typeof input === "string") {
		return input.trim();
	}

	if (typeof input === "number" || typeof input === "boolean") {
		return String(input);
	}

	return "";
}

function createEmptySpec(): Spec {
	return { elements: {}, root: "" };
}

function nextRenderedKey(keyCounts: Map<string, number>, value: string) {
	const baseKey = `text-${hashString(value)}`;
	const keyCount = keyCounts.get(baseKey) ?? 0;
	keyCounts.set(baseKey, keyCount + 1);

	return keyCount === 0 ? baseKey : `${baseKey}-${keyCount + 1}`;
}

function hashString(value: string) {
	let hash = 0;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) | 0;
	}

	return Math.abs(hash).toString(36);
}

function parseSpecData(data: unknown): SpecDataPart | null {
	if (!isRecord(data) || typeof data.type !== "string") {
		return null;
	}

	if (data.type === "patch") {
		const patch = data.patch;

		if (!isRecord(patch) || typeof patch.op !== "string") {
			return null;
		}

		if (typeof patch.path !== "string") {
			return null;
		}

		return data as SpecDataPart;
	}

	if (data.type === "flat" && isFlatSpec(data.spec)) {
		return data as SpecDataPart;
	}

	if (data.type === "nested" && isRecord(data.spec)) {
		return data as SpecDataPart;
	}

	return null;
}

function isFlatSpec(value: unknown): value is Spec {
	return (
		isRecord(value) &&
		typeof value.root === "string" &&
		isRecord(value.elements)
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function applyPatchSafely(spec: Spec, patch: JsonPatch) {
	try {
		applySpecPatch(spec, patch);
	} catch {
		// Ignore malformed AI patch data rather than breaking the chat UI.
	}
}
