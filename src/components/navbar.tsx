import { useLocation } from "@solidjs/router";
import { IoStatsChart } from "solid-icons/io";
import { RiMediaWebcamLine } from "solid-icons/ri";
import { RiSystemTimer2Line } from "solid-icons/ri";
import { TiGroup } from "solid-icons/ti";

export default function Navbar() {
	const location = useLocation();

	return (
		<nav class="flex items-right justify-between p-4 bg-gray-100 shadow-md rounded-lg">
			<div class="flex items-center">
				<RiMediaWebcamLine class="w-8 h-8 mr-1" />
				<a href="/" class="font-bold text-lg">
					FaceX
				</a>
			</div>

			<div class="flex items-center space-x-6">
				<div class="flex items-center group cursor-pointer">
					<a
						href="/roulette"
						class={`flex flex-row ${location.pathname === "/roulette" ? "text-blue-500" : "group-hover:text-blue-500"}`}
					>
						<RiSystemTimer2Line class="w-6 h-6 mr-1" />
						Roulette
					</a>
				</div>
				<div class="flex items-center group cursor-pointer">
					<a
						href="/tracking"
						class={`flex flex-row ${location.pathname === "/tracking" ? "text-blue-500" : "group-hover:text-blue-500"}`}
					>
						<IoStatsChart class="w-6 h-6 mr-1" />
						Tracking
					</a>
				</div>
				<div class="flex items-center group cursor-pointer">
					<a
						href="/group"
						class={`flex flex-row ${location.pathname === "/group" ? "text-blue-500" : "group-hover:text-blue-500"}`}
					>
						<TiGroup class="w-6 h-6 mr-1" />
						Groupe
					</a>
				</div>
			</div>
		</nav>
	);
}
