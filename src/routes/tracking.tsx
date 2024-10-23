import { Title } from "@solidjs/meta";
import { For, Show, createResource, createSignal, onCleanup } from "solid-js";
import { useUserContext } from "~/components/context";
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
	getAttendanceForClassBlock,
	getPictureUrl,
    supabase,
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
			when={["instructor", "admin"].includes(user()?.role || "") || true}
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
	const handleAttendanceChange = (payload:any) => {
		console.log("Change received!", payload);
		refetch(); // Re-fetch the attendances data whenever a change is detected
	};

	// Subscribe to real-time updates
	const attendanceChannel = supabase
		.channel('attendance')
		.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance' }, handleAttendanceChange)
		.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'attendance' }, handleAttendanceChange)
		.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'attendance' }, handleAttendanceChange)
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
											onClick={() => console.log("working")}
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
								<DialogDescription>
									Matricule : {selectedStudent()?.matricule} <br />
									Classe : 3TL1 <br />
									Statut : {selectedStudent()?.attendance_status}
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
	return "Faire la vue étudiant ici";
}
