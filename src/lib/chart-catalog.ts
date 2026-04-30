import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

const chartPointSchema = z.object({
	label: z.string(),
	value: z.number(),
	series: z.string().optional(),
});

export const chartCatalog = defineCatalog(schema, {
	components: {
		Chart: {
			props: z.object({
				title: z.string(),
				subtitle: z.string().optional(),
				type: z.enum(["bar", "line"]),
				yAxisLabel: z.string().optional(),
				data: z.array(chartPointSchema).min(1).max(24),
			}),
			slots: [],
			description:
				"A compact hockey analytics chart. Use bar charts for player/category comparisons and line charts for season-by-season trends.",
		},
	},
	actions: {},
});

export const chartPrompt = chartCatalog.prompt({
	mode: "inline",
	customRules: [
		"Use a chart only when it makes a comparison, ranking, or trend easier to understand; otherwise answer with text only.",
		"If the user explicitly asks to show, plot, graph, or chart a trend/comparison, your final answer MUST include exactly one ```spec block immediately after a concise explanation.",
		"Never say you will create, update, or process a chart later. Emit the ```spec block in the same final response.",
		"The ```spec block must contain RFC 6902 JSON Patch operations, one JSON object per line, and no prose inside the block.",
		"Only chart facts you have verified with tools or that are directly available in the conversation. Do not invent values.",
		'Build this flat spec shape with patches: {"root":"chart","elements":{"chart":{"type":"Chart","props":{...},"children":[]}}}.',
		"Keep charts focused: 3-12 data points is ideal. Use short labels.",
		"For multi-player or multi-category comparisons over time, use one data point per label/series pair, e.g. the same season label repeated with different series names. The renderer will draw one line/bar per series.",
		'Example spec block:\n```spec\n{"op":"add","path":"/root","value":"chart"}\n{"op":"add","path":"/elements","value":{}}\n{"op":"add","path":"/elements/chart","value":{"type":"Chart","props":{"title":"Goals by season","type":"line","yAxisLabel":"Goals","data":[{"label":"2022-23","series":"Player X","value":40},{"label":"2022-23","series":"Player Y","value":32}]},"children":[]}}\n```',
	],
});
