import { useColorMode } from "@kobalte/core";
import {
	IoCheckmarkCircleOutline,
	IoLogoMicrosoft,
	IoMoonOutline,
	IoSunnyOutline,
} from "solid-icons/io";
import { RiMediaWebcamLine } from "solid-icons/ri";
import { Show, createResource, createSignal } from "solid-js";
import { Button } from "~/components/ui/button";
import { supabase } from "~/supabase-client";

export default function LoginNavbar() {
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

	const { colorMode, setColorMode } = useColorMode();

	return (
		<nav
			class={`flex items-right justify-between p-4 ${colorMode() === "light" ? "bg-gray-100" : "bg-gray-900"} shadow-md sticky top-0 z-50`}
		>
			<div class="flex items-center">
				<RiMediaWebcamLine class="w-8 h-8 mr-1" />
				FaceX
			</div>

			<div class="flex items-center space-x-6">
				<div class="flex items-center group cursor-pointer">
					<Button
						onClick={handleLogin}
						disabled={loading()}
						onKeyDown={(e: KeyboardEvent) => e.key === "Enter" && handleLogin}
						role="button"
						tabIndex={0}
					>
						<IoLogoMicrosoft class="mr-2" />
						Login with Microsoft
					</Button>
				</div>
				<div
					class="flex items-center group cursor-pointer"
					onClick={() =>
						setColorMode(colorMode() === "light" ? "dark" : "light")
					}
					onKeyDown={(e: KeyboardEvent) => e.key === "Enter" && handleLogin}
					tabIndex={0}
				>
					<Show
						when={colorMode() === "light"}
						fallback={<IoMoonOutline class="w-5 h-5 mr-1" />}
					>
						<IoSunnyOutline class="w-5 h-5 mr-1" />
					</Show>
				</div>
			</div>
		</nav>
	);
}
