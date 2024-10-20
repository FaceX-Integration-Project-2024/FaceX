import { createSignal } from "solid-js";
import { supabase } from "./supabase-client";

import { IoLogoMicrosoft } from "solid-icons/io";
import { Button } from "~/components/ui/button";

export default function Login() {
	const [loading, setLoading] = createSignal(false);
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
		<div class="flex flex-center justify-center items-center h-[100dvh] w-[100dvw]">
			<div class="h-max" aria-live="polite">
				<h1 class="header">Login page</h1>
				<Button onClick={handleLogin} disabled={loading()}>
					<IoLogoMicrosoft class="mr-2" />
					Login with Microsoft
				</Button>
			</div>
		</div>
	);
}
