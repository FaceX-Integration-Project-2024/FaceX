import { createEffect, onCleanup } from "solid-js";
import { Wheel } from "spin-wheel";
import type { Attendance } from "~/routes/tracking";

interface SpinWheelProps {
	options: Attendance[];
}

const SpinWheel = (props: SpinWheelProps) => {
	let container;
	let wheel;

	createEffect(() => {
		// Initialize the wheel once the DOM element is available
		wheel = new Wheel(container, props.options);
		wheel.isInteractive = false;
		wheel.pointerAngle;
        wheel.rotationSpeedMax = 1000;

		onCleanup(() => {
			wheel.remove();
		});
	});

	const handleClick = () => {
		if (wheel) {
			wheel.spin(400);
		}
	};

	return (
		<div
			class="wheel-container flex"
			ref={(el) => (container = el)}
			onClick={handleClick}
		>
			{/* The wheel will be rendered inside this div */}
		</div>
	);
};

export default SpinWheel;
