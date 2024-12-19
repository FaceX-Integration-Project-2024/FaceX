import { Show } from "solid-js";
import { useUserContext } from "~/components/context";

import InstructorView from "~/components/tracking-instructor";
import StudentView from "~/components/tracking-student";

export interface Attendance {
	student_email: string;
	matricule: string;
	student_full_name: string;
	attendance_status: string;
}

export default function TrackingPage() {
	const { user } = useUserContext();
	return (
		<Show
			when={["instructor", "admin"].includes(user()?.role || "")}
			fallback={<StudentView />}
		>
			<InstructorView />
		</Show>
	);
}
