import { MetaProvider, Title } from "@solidjs/meta";
import { Route, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Show, Suspense, createSignal } from "solid-js";
import "@fontsource/inter";
import "./app.css";

import type { AuthSession } from "@supabase/supabase-js";
import Navbar from "./components/navbar";
import Login from "./login";
import { supabase } from "./supabase-client";

import { isServer } from "solid-js/web";

import {
	ColorModeProvider,
	ColorModeScript,
	cookieStorageManagerSSR,
} from "@kobalte/core";
import { getCookie } from "vinxi/http";
import { UserContextProvider } from "./components/context";

function getServerCookies() {
	"use server";
	const colorMode = getCookie("kb-color-mode");
	return colorMode ? `kb-color-mode=${colorMode}` : "";
}

export default function App() {
	const [session, setSession] = createSignal<AuthSession>();

	supabase.auth.getSession().then(({ data: { session } }) => {
		setSession(session ?? undefined);
	});

	supabase.auth.onAuthStateChange((_event, session) => {
		setSession(session ?? undefined);
	});

	const storageManager = cookieStorageManagerSSR(
		isServer ? getServerCookies() : document.cookie,
	);

	return (
		<Router
			root={(props) => (
				<MetaProvider>
					<UserContextProvider>
						<ColorModeScript storageType={storageManager.type} />
						<ColorModeProvider storageManager={storageManager}>
							<Title>FaceX</Title>
							<Show when={session()}>
								<Navbar />
							</Show>
							<Suspense>{props.children}</Suspense>
						</ColorModeProvider>
					</UserContextProvider>
				</MetaProvider>
			)}
		>
			<Show when={session()} fallback={<Route path="*" component={Login} />}>
				<FileRoutes />
			</Show>
		</Router>
	);
}
