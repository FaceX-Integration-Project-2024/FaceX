import { createSignal } from "solid-js";

const segments = [
  { name: "Option 1", color: "red" },
  { name: "Option 2", color: "yellow" },
  { name: "Option 3", color: "pink" },
  { name: "Option 4", color: "yellow" },
  { name: "Option 5", color: "red" },
  { name: "Option 6", color: "orange" },
  { name: "Option 7", color: "green" },
  { name: "Option 8", color: "blue" },
]; // test avant db

export default function RouletteWheel() {
	const [rotation, setRotation] = createSignal(0);

	const spinWheel = () => {
		const newRotation = rotation() + Math.ceil(Math.random() * 3600); // pour faire tourner la roulette => pas optimal car parfois la roulette tourne lentement
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
					style={{ "clip-path": "polygon(50% 0%, 15% 100%, 85% 100%)" }} // test avec polygon que j'utilisais en JS/CSS pour faire apparaître le curseur mais n'a pas l'air de fonctionner (polygon servait aussi à délimiter les différents quartiers)
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
								"background-color": segment.color,
								"transform": `rotate(${(360 / segments.length) * index}deg) skewY(${90 - 360 / segments.length}deg)`,
								"transform-origin": "center center",
							}} // pour les 8 quartiers, le problème c'est qu'ils se superposent entre eux (Option 8 étant au dessus des autres Options)
						>
							<div
								class="w-1/2 h-full flex justify-center items-center "
								style={{ "transform": "skewY(-45deg)" }}
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
