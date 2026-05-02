import type { Spec } from "@json-render/core";
import { lazy, Suspense } from "react";
import { isRenderableSpec } from "#/lib/puckwise-chart-spec";

const LazyPuckwiseChartRenderer = lazy(
	() => import("#/components/puckwise-chart-renderer"),
);

export { isRenderableSpec };

export function PuckwiseChart({ spec }: { spec: Spec | null }) {
	if (!isRenderableSpec(spec)) {
		return null;
	}

	return (
		<Suspense fallback={<ChartLoadingFallback />}>
			<LazyPuckwiseChartRenderer spec={spec} />
		</Suspense>
	);
}

function ChartLoadingFallback() {
	return (
		<output
			aria-label="Loading chart"
			className="my-4 block h-72 w-full animate-pulse rounded-xl border border-border/70 bg-muted/35"
		/>
	);
}
