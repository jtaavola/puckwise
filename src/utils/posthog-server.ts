import { PostHog } from "posthog-node";

export const posthogClient = new PostHog(
	process.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN ?? "",
	{
		host: process.env.VITE_PUBLIC_POSTHOG_HOST ?? "",
		flushAt: 1,
		flushInterval: 0,
	},
);
