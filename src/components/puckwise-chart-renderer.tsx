import type { Spec } from "@json-render/core";
import { defineRegistry, JSONUIProvider, Renderer } from "@json-render/react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Bar,
	BarChart,
	CartesianGrid,
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	Label,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "#/components/ui/chart";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "#/components/ui/empty";
import { chartCatalog } from "#/lib/chart-catalog";
import { isRenderableSpec } from "#/lib/puckwise-chart-spec";

const { registry: chartRegistry } = defineRegistry(chartCatalog, {
	components: {
		Chart: ({ props }) => <ShadcnChart {...props} />,
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

type NormalizedSeries = {
	key: string;
	label: string;
};

type NormalizedChartData = {
	points: Array<Record<string, number | string>>;
	series: NormalizedSeries[];
};

const EMPTY_CHART_DATA: ChartPoint[] = [];

const chartMargin = {
	left: 8,
	right: 8,
	top: 16,
};

export default function PuckwiseChartRenderer({ spec }: { spec: Spec | null }) {
	if (!isRenderableSpec(spec)) {
		return null;
	}

	return (
		<JSONUIProvider initialState={spec.state} registry={chartRegistry}>
			<Renderer registry={chartRegistry} spec={spec} />
		</JSONUIProvider>
	);
}

function ShadcnChart({
	title,
	subtitle,
	type,
	yAxisLabel,
	data = EMPTY_CHART_DATA,
}: ChartProps) {
	const chartTitle = title?.trim() || "Chart";
	const chartType = type === "line" ? "line" : "bar";
	const { points: chartData, series } = normalizeChartData(data, yAxisLabel);
	const chartConfig = Object.fromEntries(
		series.map((item, index) => [
			item.key,
			{
				label: item.label,
				color: `var(--chart-${(index % 5) + 1})`,
			},
		]),
	) satisfies ChartConfig;

	return (
		<Card className="my-4">
			<CardHeader>
				<CardTitle>{chartTitle}</CardTitle>
				{subtitle && <CardDescription>{subtitle}</CardDescription>}
			</CardHeader>
			<CardContent>
				{chartData.length === 0 ? (
					<Empty className="min-h-64">
						<EmptyHeader>
							<EmptyTitle>No chart data</EmptyTitle>
							<EmptyDescription>
								No chart data is available for this response.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<ChartContainer config={chartConfig} className="h-72 w-full">
						{chartType === "bar" ? (
							<BarChart
								accessibilityLayer
								data={chartData}
								margin={chartMargin}
							>
								<CartesianGrid vertical={false} />
								<ChartXAxis />
								<ChartYAxis label={yAxisLabel} />
								<ChartTooltip
									content={<ChartTooltipContent indicator="dashed" />}
									cursor={false}
								/>
								{series.map((item) => (
									<Bar
										dataKey={item.key}
										fill={`var(--color-${item.key})`}
										key={item.key}
										radius={6}
									/>
								))}
								{series.length > 1 && (
									<ChartLegend content={<ChartLegendContent />} />
								)}
							</BarChart>
						) : (
							<LineChart
								accessibilityLayer
								data={chartData}
								margin={chartMargin}
							>
								<CartesianGrid vertical={false} />
								<ChartXAxis />
								<ChartYAxis label={yAxisLabel} />
								<ChartTooltip
									content={<ChartTooltipContent indicator="line" />}
									cursor={false}
								/>
								{series.map((item) => (
									<Line
										dataKey={item.key}
										dot={{ fill: `var(--color-${item.key})` }}
										key={item.key}
										stroke={`var(--color-${item.key})`}
										strokeWidth={2}
										type="monotone"
									/>
								))}
								{series.length > 1 && (
									<ChartLegend content={<ChartLegendContent />} />
								)}
							</LineChart>
						)}
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}

function ChartXAxis() {
	return (
		<XAxis
			axisLine={false}
			dataKey="label"
			interval="preserveStartEnd"
			tickFormatter={formatLabel}
			tickLine={false}
			tickMargin={8}
		/>
	);
}

function ChartYAxis({ label }: { label?: string }) {
	return (
		<YAxis
			axisLine={false}
			tickFormatter={formatTick}
			tickLine={false}
			tickMargin={8}
			width={label ? 64 : 48}
		>
			{label && (
				<Label
					angle={-90}
					className="fill-muted-foreground text-xs"
					position="insideLeft"
					value={label}
				/>
			)}
		</YAxis>
	);
}

function normalizeChartData(
	data: ChartPoint[],
	defaultSeriesLabel = "Value",
): NormalizedChartData {
	if (!Array.isArray(data)) {
		return { points: [], series: [] };
	}

	const seriesByName = new Map<string, NormalizedSeries>();
	const pointsByLabel = new Map<string, Record<string, number | string>>();

	data.forEach((point, index) => {
		if (!point || typeof point !== "object") {
			return;
		}

		const value = Number(point.value);

		if (!Number.isFinite(value)) {
			return;
		}

		const label = String(point.label || `#${index + 1}`);
		const seriesLabel = String(point.series || defaultSeriesLabel || "Value");
		let series = seriesByName.get(seriesLabel);

		if (!series) {
			series = {
				key: `series${seriesByName.size + 1}`,
				label: seriesLabel,
			};
			seriesByName.set(seriesLabel, series);
		}

		const chartPoint = pointsByLabel.get(label) ?? { label };
		chartPoint[series.key] = value;
		pointsByLabel.set(label, chartPoint);
	});

	return {
		points: [...pointsByLabel.values()],
		series: [...seriesByName.values()],
	};
}

function formatLabel(value: string) {
	return value.length > 12 ? `${value.slice(0, 12)}…` : value;
}

function formatTick(value: number | string) {
	const numberValue = Number(value);

	if (!Number.isFinite(numberValue)) {
		return String(value);
	}

	return Number.isInteger(numberValue)
		? String(numberValue)
		: numberValue.toFixed(1);
}
