import { createSignal } from "solid-js";

const wheelOptions = [
	{ text: "Option 1", color: "bg-[#db7093]" },
	{ text: "Option 2", color: "bg-[#20b2aa]" },
	{ text: "Option 3", color: "bg-[#d63e92]" },
	{ text: "Option 4", color: "bg-[#daa520]" },
	{ text: "Option 5", color: "bg-[#ff340f]" },
	{ text: "Option 6", color: "bg-[#ff7f50]" },
	{ text: "Option 7", color: "bg-[#3cb371]" },
	{ text: "Option 8", color: "bg-[#4169e1]" },
];

export default function RouletteWheel() {
	const [rotation, setRotation] = createSignal(0);

	const spinWheel = () => {
		const additionalRotation = Math.ceil(Math.random() * 5 * 3600); // "* 4" pour tourner plus vite au cas ou le math random est trop bas
		setRotation((prev) => prev + additionalRotation);
	};

	return (
		<div class="flex justify-center items-center min-h-screen bg-gray-100 font-sans">
			<div class="relative w-[400px] h-[400px] flex justify-center items-center">
				{/* Spin Button */}
				<button
					onClick={spinWheel}
					class="absolute z-10 w-[60px] h-[60px] bg-white rounded-full border-4 border-black/75 
                 flex justify-center items-center uppercase font-semibold text-gray-700 
                 cursor-pointer select-none hover:bg-gray-100 active:scale-95 transition-transform"
				>
					Spin
				</button>

				{/* Wheel */}
				<div
					class="absolute top-0 left-0 w-full h-full bg-gray-800 rounded-full overflow-hidden shadow-[0_0_0_5px_#333,0_0_0_15px_#fff,0_0_0_18px_#111]"
					style={{
						transform: `rotate(${rotation()}deg)`,
						transition: "transform 5s ease-in-out",
					}}
				>
					{wheelOptions.map((option, index) => (
						<div
							class={`absolute w-1/2 h-1/2 ${option.color} origin-bottom-right 
                      flex justify-center items-center cursor-pointer select-none`}
							style={{
								transform: `rotate(calc(45deg * ${index + 1}))`,
								clipPath: "polygon(0 0, 56% 0, 100% 100%, 0 56%)", // ne passe pas le typecheck car il attend "clip-path" mais vu que j'utilise .map il faut le mettre en camelCase "clipPath"
							}}
						>
							<span
								class="relative rotate-45 text-4xl font-bold text-white 
                       drop-shadow-[3px_5px_2px_rgba(0,0,0,0.15)]"
							>
								{option.text}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}; // V3