import { PostHog } from "posthog-node";

const posthogToken = process.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (!posthogToken) {
	console.warn(
		"VITE_PUBLIC_POSTHOG_PROJECT_TOKEN is not set; server-side PostHog analytics will be disabled.",
	);
}

export const posthogClient = new PostHog(posthogToken ?? "", {
	host: process.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
	flushAt: 1,
	flushInterval: 0,
});
