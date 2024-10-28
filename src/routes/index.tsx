import { Show } from "solid-js";
import { useUserContext } from "~/components/context";
import Wheel from "~/components/wheel";

export default function Home() {
	const { user } = useUserContext();

	return (
		<main>
			<Show when={user()} fallback="User is not defined">
				<Show
					when={user()?.role === "student"}
					fallback="You are not a student"
				>
					<div class="flex flex-col">
						<span>Bienvenue, {user()?.email}</span>
						<span>Role: {user()?.role}</span>
						<Wheel />
					</div>
				</Show>
			</Show>
		</main>
	);
}
