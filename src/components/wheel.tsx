import { createSignal } from "solid-js";

const segments = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"];
const segmentColors = [
	"bg-red-500",
	"bg-black-400",
	"bg-black-400",
	"bg-black-900",
	"bg-black-50",
];
let sw = true;

export default function RouletteWheel() {
	const [rotation, setRotation] = createSignal(0);
	const [spinning, setSpinning] = createSignal(false);
	const [result, setResult] = createSignal("");

	const spinWheel = () => {
		if (spinning()) return;

		setSpinning(true);

		let i = 0;
		if (sw === true) {
			i = 1;
			sw = false;
		} else {
			sw = true;
		}

		const randomDegree = Math.floor(i * 3600 + 2 * 360);

		setRotation(randomDegree);
		setTimeout(() => {
			setSpinning(false);
			const winningSegment = Math.floor(
				((randomDegree % 360) / 360) * segments.length,
			);
			setResult(segments[winningSegment]);
		}, 3000);
	};

	return (
		<div class="flex flex-col items-center">
			<div
				class="relative w-64 h-64 rounded-full border-4 border-gray-800 overflow-hidden"
				style={{
					transform: `rotate(${rotation()}deg)`,
					transition: "transform 3s ease-out",
				}}
			>
				{segments.map((segment, index) => (
					<div
						class={`absolute inset-0 ${segmentColors[index % segmentColors.length]}`}
						style={{
							clipPath: `polygon(50% 50%, 100% ${100 / segments.length}% , 100% ${100 / segments.length + 100 / segments.length}%, 50% 50%)`,
							transform: `rotate(${(index / segments.length) * 360}deg)`,
						}}
					>
						<span
							class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 text-black font-bold"
							style={{ transform: `rotate(${360 / segments.length / 2}deg)` }}
						>
							{segment}
						</span>
					</div>
				))}
			</div>
			<button
				onClick={spinWheel}
				disabled={spinning()}
				class="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded disabled:opacity-50"
			>
				{spinning() ? "Spinning..." : "Spin the Wheel!"}
			</button>
			{result() && (
				<div class="mt-5 text-2xl">
					Result: <span class="font-bold">{result()}</span>
				</div>
			)}
		</div>
	);
}
