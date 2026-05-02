import { PostHogProvider } from "@posthog/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { domAnimation, LazyMotion } from "motion/react";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import TanStackQueryProvider from "../integrations/tanstack-query/root-provider";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'light';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Puckwise | AI Hockey Analytics",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: Theme init script is static and safe // react-doctor-disable-next-line react/no-danger */}
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
				<PostHogProvider
					apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN || ""}
					options={{
						api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
						ui_host: "https://us.posthog.com",
						defaults: "2026-01-30",
						capture_exceptions: true,
					}}
				>
					<TanStackQueryProvider>
						<LazyMotion features={domAnimation}>
							<header className="fixed inset-x-0 top-0 z-50">
								<div className="relative flex h-16 items-center px-4 sm:px-6 lg:px-8">
									<Link
										to="/"
										preload="intent"
										className="text-xl font-bold tracking-tight no-underline"
										aria-label="Puckwise home"
									>
										PUCK<span className="text-primary">WISE</span>
									</Link>
									<div className="absolute right-4 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
										<span className="text-primary">Early preview</span>
										<span className="hidden sm:inline">
											{" "}
											· Work in progress
										</span>
									</div>
								</div>
							</header>
							{children}
						</LazyMotion>
						<TanStackDevtools
							config={{
								position: "bottom-right",
							}}
							plugins={[
								{
									name: "Tanstack Router",
									render: <TanStackRouterDevtoolsPanel />,
								},
								TanStackQueryDevtools,
							]}
						/>
					</TanStackQueryProvider>
				</PostHogProvider>
				<Scripts />
			</body>
		</html>
	);
}
