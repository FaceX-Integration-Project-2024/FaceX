// import { createSignal } from "solid-js";

// const segments = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"];
// const segmentColors = [
// 	"bg-red-500",
// 	"bg-green-500",
// 	"bg-blue-500",
// 	"bg-yellow-500",
// 	"bg-purple-500",
// ];
// let sw = true;

// export default function RouletteWheel() {
// 	const [rotation, setRotation] = createSignal(0);
// 	const [spinning, setSpinning] = createSignal(false);
// 	const [result, setResult] = createSignal("");

// 	const spinWheel = () => {
// 		if (spinning()) return;

// 		setSpinning(true);

// 		let randomDegree = sw ? 4000 : 720;
// 		sw = !sw;

// 		setRotation(randomDegree);
// 		setTimeout(() => {
// 			setSpinning(false);
// 			const winningSegment = Math.floor(
// 				((randomDegree % 360) / 360) * segments.length,
// 			);
// 			setResult(segments[winningSegment]);
// 		}, 3000);
// 	};

// 	return (
// 		<div class="flex flex-col items-center">
// 			<div
// 				class="relative w-64 h-64 rounded-full border-4 border-gray-800 overflow-hidden"
// 				style={{
// 					transform: `rotate(${rotation()}deg)`,
// 					transition: "transform 3s ease-out",
// 				}}
// 			>
// 				{segments.map((segment, index) => (
// 					<div
// 						class={`absolute inset-0 ${segmentColors[index % segmentColors.length]}`}
// 						style={{
// 							clipPath: `polygon(50% 50%, 100% ${index * (100 / segments.length)}%, 100% ${(index + 1) * (100 / segments.length)}%)`,
// 							transform: `rotate(${(index / segments.length) * 360}deg)`,
// 						}}
// 					>
// 						<span
// 							class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold"
// 							style={{
// 								transform: `rotate(${-(index / segments.length) * 360}deg)`,
// 							}}
// 						>
// 							{segment}
// 						</span>
// 					</div>
// 				))}
// 			</div>
// 			<button
// 				onClick={spinWheel}
// 				disabled={spinning()}
// 				class="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded disabled:opacity-50"
// 			>
// 				{spinning() ? "Spinning..." : "Spin the Wheel!"}
// 			</button>
// 			{result() && (
// 				<div class="mt-5 text-2xl">
// 					Result: <span class="font-bold">{result()}</span>
// 				</div>
// 			)}
// 		</div>
// 	);
// }

import { createSignal } from "solid-js";

const segments = [
	{ name: "Option 1", color: "#db7093" },
	{ name: "Option 2", color: "#20b2aa" },
	{ name: "Option 3", color: "#d63e92" },
	{ name: "Option 4", color: "#daa520" },
	{ name: "Option 5", color: "#ff340f" },
	{ name: "Option 6", color: "#ff7f50" },
	{ name: "Option 7", color: "#3cb371" },
	{ name: "Option 8", color: "#4169e1" },
];

export default function RouletteWheel() {
	const [rotation, setRotation] = createSignal(0);

	const spinWheel = () => {
		const newRotation = rotation() + Math.ceil(Math.random() * 3600);
		setRotation(newRotation);
	};

	return (
		<div class="flex justify-center items-center min-h-screen">
			<div class="relative w-96 h-96 flex justify-center items-center">
				{/*Bouton de spin*/}
				<div
					class="spinBtn absolute w-16 h-16 bg-white rounded-full z-10 flex justify-center items-center font-semibold text-gray-800 border-4 border-gray-700 cursor-pointer uppercase tracking-widest"
					onClick={spinWheel}
				>
					Spin
				</div>

				{/*Curseur*/}
				<div
					class="absolute top-0 left-1/2 transform -translate-x-1/2 w-5 h-7 bg-white"
					style={{ clipPath: "polygon(50% 0%, 15% 100%, 85% 100%)" }}
				></div>

				{/*Roue*/}
				<div
					class="wheel absolute w-full h-full bg-gray-800 rounded-full overflow-hidden shadow-lg"
					style={{
						transform: `rotate(${rotation()}deg)`,
						transition: "transform 5s ease-in-out",
					}}
				>
					{segments.map((segment, index) => (
						<div
							class="absolute w-full h-full flex items-center "
							style={{
								backgroundColor: segment.color,
								transform: `rotate(${(360 / segments.length) * index}deg) skewY(${90 - 360 / segments.length}deg)`,
								transformOrigin: "center center",
							}}
						>
							<div
								class="w-1/2 h-full flex justify-center items-center "
								style={{ transform: "skewY(-45deg)" }}
							>
								<span class="text-white text-lg font-bold transform -rotate-45 ">
									{segment.name}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
