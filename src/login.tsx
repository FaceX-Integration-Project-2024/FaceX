import { createSignal } from "solid-js";
import { supabase } from "./supabase-client";

import { Button } from "~/components/ui/button";

export default function Login() {
	const [loading, setLoading] = createSignal(false);
	const [email, setEmail] = createSignal("");

	const handleLogin = async (e: MouseEvent) => {
		e.preventDefault();

		try {
			setLoading(true);
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "azure",
				options: {
					redirectTo: window.location.host,
					scopes: "email",
				},
			});
			if (error) throw error;
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div class="row flex-center flex">
			<div class="col-6 form-widget" aria-live="polite">
				<h1 class="header">Supabase + SolidJS</h1>
				<Button onClick={handleLogin}>Login with Microsoft</Button>
			</div>
		</div>
	);
}
