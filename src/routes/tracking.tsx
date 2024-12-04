import { Title } from "@solidjs/meta";
import {
	For,
	Show,
	createResource,
	createSignal,
	onCleanup,
	onMount,
} from "solid-js";
import { getSessionEmail, useUserContext } from "~/components/context";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardTitle,
} from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	getAllClassBlocksIds,
	getAttendanceByEmail,
	getAttendanceByStatus,
	getAttendanceForClassBlock,
	getPictureUrl,
	getStudentAttenceStatus,
	supabase,
	updateAttendanceForClassBlock,
} from "~/supabase-client";

interface Attendance {
	matricule: string;
	student_full_name: string;
	attendance_status: string;
}

export default function TrackingPage() {
	const { user } = useUserContext();
	return (
		<Show
			when={["instructor", "admin"].includes(user()?.role || "")} //disabled
			fallback={<StudentView />}
		>
			<InstructorView />
		</Show>
	);
}

function InstructorView() {
	const [selectedBlockId, setSelectedBlockId] = createSignal(1);
	const [blockids] = createResource(
		async () => {
			return getAllClassBlocksIds();
		},
		{ initialValue: [1] },
	);
	const [attendances, { refetch }] = createResource(
		selectedBlockId,
		async (blockId) => {
			if (!blockId) return null;
			return getAttendanceForClassBlock(blockId);
		},
	);
	const [open, setOpen] = createSignal(false);
	const [selectedStudent, setSelectedStudent] = createSignal<Attendance | null>(
		null,
	);

	// Handle real-time inserts, updates and deletes
	const handleAttendanceChange = (payload: any) => {
		// console.log("Change received!", payload);
		if (payload.new.block_id === selectedBlockId()) {
			refetch(); // Re-fetch the attendances data whenever a change is detected related to the selected class block
		}
	};

	// Subscribe to real-time updates
	const attendanceChannel = supabase
		.channel("attendance")
		.on(
			"postgres_changes",
			{ event: "INSERT", schema: "public", table: "attendance" },
			(payload) => handleAttendanceChange(payload),
		)
		.on(
			"postgres_changes",
			{ event: "UPDATE", schema: "public", table: "attendance" },
			(payload) => handleAttendanceChange(payload),
		)
		.on(
			"postgres_changes",
			{ event: "DELETE", schema: "public", table: "attendance" },
			(payload) => handleAttendanceChange(payload),
		)
		.subscribe();

	// Clean up subscription when the component is destroyed
	onCleanup(() => {
		attendanceChannel.unsubscribe();
	});

	return (
		<div class="flex flex-col p-5">
			<Title>FaceX - Tracking</Title>
			<Select<number>
				value={selectedBlockId()}
				onChange={setSelectedBlockId}
				options={blockids()}
				placeholder="Select a class block"
				itemComponent={(props) => (
					<SelectItem item={props.item}>{props.item.textValue}</SelectItem>
				)}
			>
				<SelectTrigger aria-label="Block" class="w-[180px]">
					<SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
				</SelectTrigger>
				<SelectContent />
			</Select>
			<div class="flex justify-center">
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 m-5 gap-5 max-w-screen-2xl">
					<Show
						when={attendances() && Object.keys(attendances()).length !== 0}
						fallback={"No Data"}
					>
						<For each={attendances()}>
							{(attendance) => (
								<Card class="flex flex-col justify-center items-center space-y-3 p-2 min-w-fit">
									<Avatar
										class="w-28 h-28 cursor-pointer"
										onClick={() => {
											setSelectedStudent(attendance);
											setOpen(true);
										}}
									>
										<AvatarImage
											src={getPictureUrl(
												`students/${attendance.matricule}.jpg`,
											)}
											class="object-cover w-28 h-28"
										/>
										<AvatarFallback>Photo</AvatarFallback>
									</Avatar>
									<CardTitle>{attendance.student_full_name}</CardTitle>
									<CardFooter>
										<Badge
											onClick={() =>
												updateAttendanceForClassBlock(
													attendance.student_email,
													selectedBlockId(),
													attendance.attendance_status === "Present"
														? "Absent"
														: "Present",
												)
											}
											class={`${attendance.attendance_status === "Present" ? "bg-green-600 text-white hover:bg-green-800" : ""} cursor-pointer`}
											variant={
												attendance.attendance_status === "Present"
													? "default"
													: "destructive"
											}
										>
											{attendance.attendance_status}
										</Badge>
									</CardFooter>
								</Card>
							)}
						</For>
					</Show>
				</div>
			</div>
			<Dialog open={open()} onOpenChange={setOpen}>
				<DialogContent>
					<div class="flex items-start space-x-4">
						<Avatar class="w-32 h-32">
							<AvatarImage
								src={getPictureUrl(
									`students/${selectedStudent()?.matricule}.jpg`,
								)}
								class="object-cover w-32 h-32"
							/>
							<AvatarFallback>Photo</AvatarFallback>
						</Avatar>
						<div class="flex flex-col justify-center">
							<DialogHeader>
								<DialogTitle>
									{selectedStudent()?.student_full_name}
								</DialogTitle>
								<DialogDescription class="flex flex-col">
									<span>Matricule : {selectedStudent()?.matricule}</span>
									<span>Classe : 3TL1</span>
									<span>Statut : {selectedStudent()?.attendance_status}</span>
								</DialogDescription>
							</DialogHeader>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function StudentView() {
	const [studentEmail, setStudentEmail] = createSignal("");

	onMount(() => {
		const email = getSessionEmail();
		if (email) {
			setStudentEmail(email); // Initialiser le signal avec l'email utilisateur
		}
	});

	// 2. Resource pour récupérer les présences d'un étudiant par email
	const [studentAttendances, { refetch }] = createResource(
		studentEmail, // dépend de l'email
		async (email) => {
			if (!email) return null;
			const data = await getAttendanceByEmail(email);
			return data;
		},
	);

	const [open, setOpen] = createSignal(false);
	const [selectedstats, setSelectedstats] = createSignal("présence");

	const [studentAttendencesByStatus] = createResource(
		selectedstats,
		async (status) => {
			if (!status) return null;
			const data = await getAttendanceByStatus(studentEmail(), status);
			console.log(data);
			return data;
		},
	);

	const [getStudentAttendancesStatus] = createResource(
		studentEmail,
		async (email) => {
			if (!email) return null;
			const data = await getStudentAttenceStatus(email);
			console.log(data);
			return data;
		},
	);

	const handleAttendanceChange = (payload: any) => {
		// console.log("Change received!", payload);
		if (payload.new.student_email === studentEmail()) {
			refetch(); // Re-fetch the attendances data whenever a change is detected related to connected student
		}
	};

	// Subscribe to real-time updates
	const attendanceChannel = supabase
		.channel("attendance")
		.on(
			"postgres_changes",
			{ event: "INSERT", schema: "public", table: "attendance" },
			(payload) => handleAttendanceChange(payload),
		)
		.on(
			"postgres_changes",
			{ event: "UPDATE", schema: "public", table: "attendance" },
			(payload) => handleAttendanceChange(payload),
		)
		.on(
			"postgres_changes",
			{ event: "DELETE", schema: "public", table: "attendance" },
			(payload) => handleAttendanceChange(payload),
		)
		.subscribe();

	// Clean up subscription when the component is destroyed
	onCleanup(() => {
		attendanceChannel.unsubscribe();
	});

	// Affiche la liste des présences
	return (
		<div>
			<div class="mb-6 p-4 max-w-md mx-auto border rounded-lg shadow-md ">
				<ul class="space-y-4 ">
					<li class="flex items-center justify-between">
						<span>Nombre de présences :</span>
						{getStudentAttendancesStatus()?.present}
						<button
							onClick={() => {
								setOpen(true);
								setSelectedstats("Present");
							}}
							type="button"
							class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
						>
							Détails
						</button>
					</li>
					<li class="flex items-center justify-between">
						<span>Nombre d'absences :</span>
						{getStudentAttendancesStatus()?.absent}
						<button
							onClick={() => {
								setOpen(true);
								setSelectedstats("Absent");
							}}
							type="button"
							class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
						>
							Détails
						</button>
					</li>
					<li class="flex items-center justify-between">
						<span>Nombre de retards :</span>
						{getStudentAttendancesStatus()?.retard}
						<button
							onClick={() => {
								setOpen(true);
								setSelectedstats("Retard");
							}}
							type="button"
							class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
						>
							Détails
						</button>
					</li>
				</ul>
			</div>

			<div class="p-4 rounded-xl shadow-lg">
				<h2 class="text-xl font-bold text-center mb-4">Mes présences</h2>
				<div class="flex flex-wrap gap-4">
					<For each={studentAttendances()}>
						{(attendance) => (
							<div class="flex-1 min-w-[250px] max-w-[300px] border rounded-lg shadow-md p-4 transition-transform transform hover:scale-105">
								<p>
									<strong>cours :</strong> {attendance.name}
								</p>
								<p>
									<strong>Statut :</strong> {attendance.status}
								</p>
								<p>
									<strong>Date :</strong>{" "}
									{new Date(attendance.timestamp).toLocaleString()}
								</p>
							</div>
						)}
					</For>
				</div>
			</div>
			<Dialog open={open()} onOpenChange={setOpen}>
				<DialogContent>
					<div class="p-4 rounded-xl shadow-lg">
						<div class="flex flex-wrap gap-4">
							<For each={studentAttendencesByStatus()}>
								{(attendance) => (
									<div class="flex-1 min-w-[250px] max-w-[300px] border rounded-lg shadow-md p-4 transition-transform transform hover:scale-105">
										<p>
											<strong>cours :</strong> {attendance.name}
										</p>
										<p>
											<strong>Statut :</strong> {attendance.status}
										</p>
										<p>
											<strong>Date :</strong>{" "}
											{new Date(attendance.timestamp).toLocaleString()}
										</p>
									</div>
								)}
							</For>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
