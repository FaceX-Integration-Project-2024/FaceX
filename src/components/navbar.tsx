import { useColorMode } from "@kobalte/core";
import { useLocation } from "@solidjs/router";
import {
	IoCheckmarkCircleOutline,
	IoLogOutOutline,
	IoMoonOutline,
	IoPersonCircleOutline,
	IoSunnyOutline,
} from "solid-icons/io";
import { RiMediaWebcamLine } from "solid-icons/ri";
import { Show, createResource, createSignal } from "solid-js";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { supabase } from "~/supabase-client";
import { UserContextProvider, useUserContext } from "./context";

export default function Navbar() {
	const { user } = useUserContext();
	const location = useLocation();
	const { colorMode, setColorMode } = useColorMode();
	const [open, setOpen] = createSignal(false);

	return (
		<nav
			class={`flex items-right justify-between p-4 ${colorMode() === "light" ? "bg-gray-100" : "bg-gray-900"} shadow-md sticky top-0 z-50`}
		>
			<div class="flex items-center">
				<a href="/" class="flex flex-row font-bold text-lg">
					<RiMediaWebcamLine class="w-8 h-8 mr-1" />
					FaceX
				</a>
			</div>

			<div class="flex items-center space-x-6">
				{/*<div class="flex items-center group cursor-pointer">*/}
				{/*	<a*/}
				{/*		href="/roulette"*/}
				{/*		class={`flex flex-row ${location.pathname === "/roulette" ? "text-blue-500" : "group-hover:text-blue-500"}`}*/}
				{/*	>*/}
				{/*		<RiSystemTimer2Line class="w-6 h-6 mr-1" />*/}
				{/*		Roulette*/}
				{/*	</a>*/}
				{/*</div>*/}
				<div class="flex items-center group cursor-pointer">
					<a
						href="/tracking"
						class={`flex flex-row ${location.pathname === "/tracking" ? "text-blue-500" : "group-hover:text-blue-500"}`}
					>
						<IoCheckmarkCircleOutline class="w-6 h-6 mr-1" />
						Tracking
					</a>
				</div>
				{/*<div class="flex items-center group cursor-pointer">*/}
				{/*	<a*/}
				{/*		href="/group"*/}
				{/*		class={`flex flex-row ${location.pathname === "/group" ? "text-blue-500" : "group-hover:text-blue-500"}`}*/}
				{/*	>*/}
				{/*		<TiGroup class="w-6 h-6 mr-1" />*/}
				{/*		Groupe*/}
				{/*	</a>*/}
				{/*</div>*/}
				<div class="flex items-center group cursor-pointer">
					<DropdownMenu>
						<DropdownMenuTrigger class="flex flex-row group-hover:text-blue-500">
							<IoPersonCircleOutline class="w-6 h-6 mr-1" />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuLabel>{user()?.email}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onSelect={() =>
									setColorMode(colorMode() === "light" ? "dark" : "light")
								}
							>
								<Show
									when={colorMode() === "light"}
									fallback={<IoMoonOutline class="w-5 h-5 mr-1" />}
								>
									<IoSunnyOutline class="w-5 h-5 mr-1" />
								</Show>
								Toggle theme
							</DropdownMenuItem>
							<DropdownMenuItem
								class="!text-red-600"
								onSelect={() => setOpen(true)}
							>
								<IoLogOutOutline class="w-5 h-5 mr-1" />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Dialog open={open()} onOpenChange={setOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Are you sure ?</DialogTitle>
								<DialogDescription>
									You are about to be disconnected.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									variant="destructive"
									onClick={() => supabase.auth.signOut()}
								>
									Confirm
								</Button>
								<Button variant="secondary" onClick={() => setOpen(false)}>
									Cancel
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</nav>
	);
}
