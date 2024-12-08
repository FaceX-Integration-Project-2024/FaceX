import { onMount, onCleanup, Show, createSignal } from "solid-js";
import { Wheel } from "spin-wheel";
import type { Attendance } from "~/routes/tracking";


interface SpinWheelProps {
	options: Attendance[];
}

const SpinWheel = (props: SpinWheelProps) => {
    const [winner, setWinner] = createSignal();
	let container;
	let wheel;

	onMount(() => {
        wheel = new Wheel(container, props.options);
        wheel.isInteractive = false;
        wheel.pointerAngle;
        wheel.overlayImage = "./wheelv2-overlay.svg"
        wheel.rotationSpeedMax = 1000;
        wheel.onCurrentIndexChange = handleWinnerChange;
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
		<div class="h-1/2">
            <div
                class="wheel-container"
                ref={(el) => (container = el)}
                onClick={handleClick}
            >
                {/* The wheel will be rendered inside this div */}
            </div>
            <Show when={winner()}>And the winner is <strong>{winner()}</strong> !</Show>
        </div>
	);
};

export default SpinWheel;
