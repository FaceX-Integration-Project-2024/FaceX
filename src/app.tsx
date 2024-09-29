import { MetaProvider, Title } from "@solidjs/meta";
import { Route, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Show, Suspense, createSignal } from "solid-js";
import "./app.css";

import type { AuthSession } from "@supabase/supabase-js";
import Login from "./login";
import { supabase } from "./supabase-client";

export default function App() {
	const [session, setSession] = createSignal<AuthSession>();

	supabase.auth.getSession().then(({ data: { session } }) => {
		setSession(session ?? undefined);
	});

	supabase.auth.onAuthStateChange((_event, session) => {
		setSession(session ?? undefined);
	});

	return (
		<Router
			root={(props) => (
				<MetaProvider>
					<Title>FaceX</Title>
					<Suspense>{props.children}</Suspense>
				</MetaProvider>
			)}
		>
			<Show when={session()} fallback={<Route component={Login} />}>
				<FileRoutes />
			</Show>
		</Router>
	);
}
