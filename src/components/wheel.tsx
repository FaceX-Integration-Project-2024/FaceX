import { Show, createSignal, onCleanup, onMount } from "solid-js";
import { Wheel } from "spin-wheel";
import type { Attendance } from "~/routes/tracking";

interface SpinWheelProps {
	items: Attendance[];
}

const SpinWheel = (props: SpinWheelProps) => {
	const [winner, setWinner] = createSignal();
	let container;
	let wheel;

	onMount(() => {
		const overlayImageElement = new Image();
		overlayImageElement.src = "./wheelv2-overlay.svg";

		wheel = new Wheel(container, props.items);
		wheel.isInteractive = false;
		wheel.overlayImage = overlayImageElement;
		wheel.rotationSpeedMax = 1000;
		wheel.onCurrentIndexChange = handleWinnerChange;
		wheel.itemBackgroundColors = [
			"#FF0000", // Rouge vif
			"#FF4500", // Rouge orangé
			"#FF7F00", // Orange vif
			"#FFA500", // Orange
			"#FFD700", // Doré
			"#FFFF00", // Jaune vif
			"#ADFF2F", // Vert jaunâtre
			"#7FFF00", // Vert lime
			"#32CD32", // Vert printemps
			"#00FF00", // Vert vif
			"#00FA9A", // Vert menthe
			"#00FFFF", // Cyan vif
			"#1E90FF", // Bleu dodger
			"#0000FF", // Bleu pur
			"#8A2BE2", // Bleu violet
			"#9400D3", // Violet foncé
			"#FF00FF", // Magenta
			"#FF1493", // Rose profond
			"#FF69B4", // Rose vif
			"#FF4500", // Orange rouge
		];
	});

	onCleanup(() => {
		wheel.remove();
	});

	const handleWinnerChange = (e) => {
		setWinner(wheel.items[e.currentIndex].label);
	};

	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	const handleClick = () => {
		if (wheel) {
			wheel.spinToItem(getRandomInt(wheel.items.length), 4000, true, 5, 1);
		}
	};

	return (
		<>
			<div
				class="wheel-container h-96"
				ref={(el) => (container = el)}
				onClick={handleClick}
			>
				{/* The wheel will be rendered inside this div */}
			</div>
			<Show when={winner()}>
				<div>
					L'étudiant sélectionné est : <strong>{winner()}</strong> !
				</div>
			</Show>
		</>
	);
};

export default SpinWheel;
