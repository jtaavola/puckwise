import type { Spec } from "@json-render/core";
import { defineRegistry, JSONUIProvider, Renderer } from "@json-render/react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Label,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "#/components/ui/chart";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "#/components/ui/empty";
import { chartCatalog } from "#/lib/chart-catalog";

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

type NormalizedChartPoint = {
	label: string;
	value: number;
};

const chartMargin = {
	left: 8,
	right: 8,
	top: 16,
};

export function PuckwiseChart({ spec }: { spec: Spec | null }) {
	if (!isRenderableSpec(spec)) {
		return null;
	}

	return (
		<JSONUIProvider initialState={spec.state} registry={chartRegistry}>
			<Renderer registry={chartRegistry} spec={spec} />
		</JSONUIProvider>
	);
}

export function isRenderableSpec(spec: Spec | null | undefined): spec is Spec {
	return Boolean(spec?.root && spec.elements?.[spec.root]);
}

function ShadcnChart({
	title,
	subtitle,
	type,
	yAxisLabel,
	data = [],
}: ChartProps) {
	const chartTitle = title?.trim() || "Chart";
	const chartType = type === "line" ? "line" : "bar";
	const chartData = normalizeChartData(data);
	const chartConfig = {
		value: {
			label: yAxisLabel || "Value",
			color: "var(--chart-1)",
		},
	} satisfies ChartConfig;

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
								<Bar dataKey="value" fill="var(--color-value)" radius={6} />
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
								<Line
									dataKey="value"
									dot={{ fill: "var(--color-value)" }}
									stroke="var(--color-value)"
									strokeWidth={2}
									type="monotone"
								/>
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

function normalizeChartData(data: ChartPoint[]): NormalizedChartPoint[] {
	if (!Array.isArray(data)) {
		return [];
	}

	return data.flatMap((point, index) => {
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
				value,
			},
		];
	});
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
