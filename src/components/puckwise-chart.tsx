import type { Spec } from "@json-render/core";
import { defineRegistry, JSONUIProvider, Renderer } from "@json-render/react";
import { chartCatalog } from "#/lib/chart-catalog";

const { registry: chartRegistry } = defineRegistry(chartCatalog, {
	components: {
		Chart: ({ props }) => <SvgChart {...props} />,
	},
});

type ChartPoint = {
	label: string;
	value: number;
	series?: string;
};

type ChartProps = {
	title: string;
	subtitle?: string;
	type: "bar" | "line";
	yAxisLabel?: string;
	data: ChartPoint[];
};

export function PuckwiseChart({ spec }: { spec: Spec | null }) {
	if (!isRenderableSpec(spec)) {
		return null;
	}

	return (
		<div className="my-4 overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
			<JSONUIProvider initialState={spec.state} registry={chartRegistry}>
				<Renderer registry={chartRegistry} spec={spec} />
			</JSONUIProvider>
		</div>
	);
}

export function isRenderableSpec(spec: Spec | null | undefined): spec is Spec {
	return Boolean(spec?.root && spec.elements?.[spec.root]);
}

function SvgChart({
	title,
	subtitle,
	type,
	yAxisLabel,
	data = [],
}: ChartProps) {
	const chartTitle = title?.trim() || "Chart";
	const chartType = type === "line" ? "line" : "bar";
	const chartData = Array.isArray(data)
		? data.flatMap((point, index) => {
				if (!point || typeof point !== "object") {
					return [];
				}

				const value = Number(point.value);

				if (!Number.isFinite(value)) {
					return [];
				}

				return [
					{
						label: String(point.label || `#${index + 1}`),
						series: point.series,
						value,
					},
				];
			})
		: [];

	if (chartData.length === 0) {
		return (
			<div>
				<ChartHeader subtitle={subtitle} title={chartTitle} />
				<p className="text-muted-foreground text-sm">
					No chart data available.
				</p>
			</div>
		);
	}

	const width = 680;
	const height = 320;
	const pad = { top: 44, right: 24, bottom: 62, left: 54 };
	const chartWidth = width - pad.left - pad.right;
	const chartHeight = height - pad.top - pad.bottom;
	const values = chartData.map((point) => point.value);
	const rawMinValue = Math.min(...values, 0);
	const rawMaxValue = Math.max(...values, 0);
	const minValue = rawMinValue === rawMaxValue ? 0 : rawMinValue;
	const maxValue = rawMinValue === rawMaxValue ? 1 : rawMaxValue;
	const range = maxValue - minValue;
	const xStep = chartWidth / Math.max(chartData.length, 1);
	const y = (value: number) =>
		pad.top + ((maxValue - value) / range) * chartHeight;
	const zeroY = y(0);
	const pointKeyCounts = new Map<string, number>();
	const points = chartData.map((point, index) => {
		const keyCount = pointKeyCounts.get(point.label) ?? 0;
		pointKeyCounts.set(point.label, keyCount + 1);

		return {
			...point,
			key: keyCount === 0 ? point.label : `${point.label}-${keyCount + 1}`,
			x: pad.left + xStep * index + xStep / 2,
			y: y(point.value),
		};
	});
	const path = points
		.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
		.join(" ");
	const ticks = [0, 0.25, 0.5, 0.75, 1].map((tick) => minValue + range * tick);

	return (
		<div>
			<ChartHeader subtitle={subtitle} title={chartTitle} />
			<svg
				className="h-auto w-full"
				role="img"
				viewBox={`0 0 ${width} ${height}`}
			>
				<title>{chartTitle}</title>
				<line
					className="stroke-border"
					x1={pad.left}
					x2={width - pad.right}
					y1={zeroY}
					y2={zeroY}
				/>
				<line
					className="stroke-border"
					x1={pad.left}
					x2={pad.left}
					y1={pad.top}
					y2={pad.top + chartHeight}
				/>
				{ticks.map((tick) => {
					const tickY = y(tick);

					return (
						<g key={tick}>
							<line
								className="stroke-border/60"
								x1={pad.left}
								x2={width - pad.right}
								y1={tickY}
								y2={tickY}
							/>
							<text
								className="fill-muted-foreground text-[11px]"
								textAnchor="end"
								x={pad.left - 10}
								y={tickY + 4}
							>
								{formatTick(tick)}
							</text>
						</g>
					);
				})}
				{chartType === "bar" ? (
					points.map((point) => {
						const barWidth = Math.min(xStep * 0.62, 46);
						const barTop = Math.min(point.y, zeroY);
						const barHeight = Math.max(Math.abs(zeroY - point.y), 1);

						return (
							<g key={point.key}>
								<rect
									className="fill-primary"
									height={barHeight}
									rx={6}
									width={barWidth}
									x={point.x - barWidth / 2}
									y={barTop}
								/>
								<text
									className="fill-foreground font-medium text-[12px]"
									textAnchor="middle"
									x={point.x}
									y={point.value >= 0 ? point.y - 8 : point.y + 16}
								>
									{formatTick(point.value)}
								</text>
							</g>
						);
					})
				) : (
					<>
						<path
							className="stroke-primary"
							d={path}
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={3}
						/>
						{points.map((point) => (
							<circle
								className="fill-primary stroke-background"
								cx={point.x}
								cy={point.y}
								key={point.key}
								r={5}
								strokeWidth={2}
							/>
						))}
					</>
				)}
				{points.map((point) => (
					<text
						className="fill-muted-foreground text-[11px]"
						key={`${point.key}-label`}
						textAnchor="middle"
						x={point.x}
						y={height - 28}
					>
						{point.label}
					</text>
				))}
				{yAxisLabel && (
					<text
						className="fill-muted-foreground text-[12px]"
						textAnchor="middle"
						transform={`rotate(-90 18 ${pad.top + chartHeight / 2})`}
						x={18}
						y={pad.top + chartHeight / 2}
					>
						{yAxisLabel}
					</text>
				)}
			</svg>
		</div>
	);
}

function ChartHeader({
	subtitle,
	title,
}: {
	subtitle?: string;
	title: string;
}) {
	return (
		<div className="mb-3">
			<h3 className="font-semibold text-foreground text-lg leading-tight">
				{title}
			</h3>
			{subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
		</div>
	);
}

function formatTick(value: number) {
	return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
