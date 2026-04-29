import {
	applySpecPatch,
	type JsonPatch,
	nestedToFlat,
	SPEC_DATA_PART_TYPE,
	type Spec,
	type SpecDataPart,
} from "@json-render/core";
import type { ReactNode } from "react";
import { MessageResponse } from "#/components/ai-elements/message";
import { isRenderableSpec, PuckwiseChart } from "#/components/puckwise-chart";

type MessagePart = {
	type: string;
	text?: string;
	data?: unknown;
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
