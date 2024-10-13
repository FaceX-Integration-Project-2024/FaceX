import { RiMediaWebcamLine } from 'solid-icons/ri'

export default function Navbar() {
	return (
		<nav class="flex items-right justify-between p-4 bg-gray-100 shadow-md rounded-lg">
			<div class="flex items-center">
				<RiMediaWebcamLine class="w-6 mr-2"/>
				<span class="font-bold text-lg">FaceX</span>
			</div>

			<div class="flex items-center space-x-6">
				<div class="flex items-center group cursor-pointer">
					<img
						src="./images/roulette.png"
						alt="Roulette Icon"
						class="w-5 mr-1 group-hover:hidden"
					/>
					<img
						src="./images/roulette-hover.png"
						alt="Roulette Icon Hover"
						class="w-5 mr-1 hidden group-hover:block"
					/>
					<a href="/#" class="group-hover:text-blue-500">
						Roulette
					</a>
				</div>
				<div class="flex items-center group cursor-pointer">
					<img
						src="./images/tracking.png"
						alt="Tracking Icon"
						class="w-5 mr-1 group-hover:hidden"
					/>
					<img
						src="./images/tracking-hover.png"
						alt="Tracking Icon Hover"
						class="w-5 mr-1 hidden group-hover:block"
					/>
					<a href="/tracking" class="group-hover:text-blue-500">
						Tracking
					</a>
				</div>
				<div class="flex items-center group cursor-pointer">
					<img
						src="./images/group.png"
						alt="Group Icon"
						class="w-5 mr-1 group-hover:hidden"
					/>
					<img
						src="./images/group-hover.png"
						alt="Group Icon Hover"
						class="w-5 mr-1 hidden group-hover:block"
					/>
					<a href="/#" class="group-hover:text-blue-500">
						Groupe
					</a>
				</div>
			</div>
		</nav>
	);
}
