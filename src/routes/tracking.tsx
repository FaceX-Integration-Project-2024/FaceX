import { Title } from "@solidjs/meta";
import { saveAs } from "file-saver";
import { IoPeople, IoSettingsOutline } from "solid-icons/io";
import { IoRefreshSharp } from "solid-icons/io";
import { RiSystemTimer2Line } from "solid-icons/ri";
import { Separator } from "~/components/ui/separator";
import {
	For,
	Show,
	createEffect,
	createResource,
	createSignal,
	onCleanup,
	onMount,
} from "solid-js";
import * as XLSX from "xlsx";
import { getSessionEmail, useUserContext } from "~/components/context";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardFooter, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
	NumberField,
	NumberFieldDecrementTrigger,
	NumberFieldErrorMessage,
	NumberFieldGroup,
	NumberFieldIncrementTrigger,
	NumberFieldInput,
	NumberFieldLabel,
} from "~/components/ui/number-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	TextField,
	TextFieldInput,
	TextFieldLabel,
} from "~/components/ui/text-field";
import SpinWheel from "~/components/wheel";
import {
	getAttendanceByEmail,
	getAttendanceByStatus,
	getAttendanceForClassBlock,
	getClassBlocksByCourseId,
	getCoursesByInstructorId,
	getPictureUrl,
	getStudentAttenceStatus,
	supabase,
	updateAttendanceForClassBlock,
	updateLateTimeInterval,
} from "~/supabase-client";

export interface Attendance {
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

function InstructorView() {
	const email = getSessionEmail;
	const [selectedCourseId, setSelectedCourseId] = createSignal<number>();
	const [lateTimeInterval, setLateTimeInterval] = createSignal<number[]>();
	const [selectedBlockId, setSelectedBlockId] = createSignal<number>();
	const [openEditCourseDialog, setOpenEditCourseDialog] = createSignal(false);
	const [loading, setLoading] = createSignal(false);

	const [courses, { refetch: refetchCourses }] = createResource(
		email,
		async (email) => {
			if (!email) return null;
			return getCoursesByInstructorId(email);
		},
		{ initialValue: [] },
	);
	const [blocks] = createResource(
		selectedCourseId,
		async (selectedCourseId) => {
			return getClassBlocksByCourseId(selectedCourseId);
		},
		{ initialValue: [] },
	);
	const [attendances, { refetch }] = createResource(
		selectedBlockId,
		async (blockId) => {
			if (!blockId) return null;
			return getAttendanceForClassBlock(blockId);
		},
	);

	const presentAttendances = () => {
		return attendances().filter(
			(a: { attendance_status: string }) => a.attendance_status === "Present" || a.attendance_status === "Late",
		);
	};

	createEffect(() => {
		const coursesList = courses();
		if (coursesList.length > 0 && !selectedCourseId()) {
			setSelectedCourseId(coursesList[0].course_id); // Premier cours par défaut
			setLateTimeInterval(coursesList[0].late_time_interval);
		}
	});
	createEffect(() => {
		const blocksList = blocks();
		if (blocksList.length > 0 && !selectedBlockId()) {
			setSelectedBlockId(blocksList[0].block_id); // Premier block par défaut
		}
	});

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

	const [openWheelDialog, setOpenWheelDialog] = createSignal(false);
	const [showWheel, setShowWheel] = createSignal(true);

	const [openDialog, setOpenDialog] = createSignal(false);
	const [peoplePerGroup, setPeoplePerGroup] = createSignal(0);
	const [groups, setGroups] = createSignal<string[][]>();
	const [includeAbsents, setIncludeAbsents] = createSignal(false);

	const createGroups = (
		peoplePerGroup: number,
		presentStudents: Attendance[],
	) => {
		const groups: string[][] = [];
		let start = 0;
		const presentStudentNames = presentStudents.map(
			(student) => student.student_full_name,
		);

		for (let i = 0; i < presentStudentNames.length - 1; i++) {
			const j =
				Math.floor(Math.random() * (presentStudentNames.length - i)) + i;
			[presentStudentNames[i], presentStudentNames[j]] = [
				presentStudentNames[j],
				presentStudentNames[i],
			];
		}

		while (start < presentStudentNames.length) {
			groups.push(presentStudentNames.slice(start, start + peoplePerGroup));
			start += peoplePerGroup;
		}
		return groups;
	};

	const exportGroupsToExcel = () => {
		const fileName = prompt(
			"Entrez le nom du fichier (sans extension) :",
			"groupes",
		);

		if (fileName) {
			const workbook = XLSX.utils.book_new();
			const groupList = groups();

			if (groupList.length === 0) {
				console.error("Il n'y a pas de groupes disponibles !");
				return;
			}

			const worksheetData = [];
			const header = [
				"Groupe",
				...groupList[0].map((_, i) => `Étudiant ${i + 1}`),
			];
			worksheetData.push(header);

			groupList.forEach((group, index) => {
				const row = [index + 1, ...group];
				worksheetData.push(row);
			});

			const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
			XLSX.utils.book_append_sheet(workbook, worksheet, "Groupe");

			const excelBuffer = XLSX.write(workbook, {
				bookType: "xlsx",
				type: "array",
			});
			const data = new Blob([excelBuffer], {
				type: "application/octet-stream",
			});

			saveAs(data, `${fileName}.xlsx`);
		}
	};

	// Clean up subscription when the component is destroyed
	onCleanup(() => {
		attendanceChannel.unsubscribe();
	});

	return (
		<div class="flex flex-col p-5">
			<Title>FaceX - Tracking</Title>
			<div class="flex flex-wrap justify-between gap-2">
				<div class="flex flex-wrap gap-2">
					<Select
						options={courses()}
						value={courses().find(
							(course) => course.course_id === selectedCourseId(),
						)}
						onChange={(course) => {
							if(course) {
								setSelectedCourseId(course.course_id);
								setLateTimeInterval(course.late_time_interval);
								setSelectedBlockId(undefined);
							}
						}}
						optionValue="course_id"
						optionTextValue="course_name"
						placeholder="Select a course"
						itemComponent={(props) => (
							<SelectItem item={props.item}>{props.item.textValue}</SelectItem>
						)}
					>
						<SelectTrigger aria-label="Course" class="w-[180px]">
							<SelectValue<string>>
								{(state) => state.selectedOption()?.course_name}
							</SelectValue>
						</SelectTrigger>
						<SelectContent />
					</Select>
					<Select
						options={blocks()}
						value={blocks().find(
							(block) => block.block_id === selectedBlockId(),
						)}
						onChange={(block) => {
							if (block) {
								// Add a null check before accessing block properties
								setSelectedBlockId(block.block_id);
							}
						}}
						optionValue="block_id"
						optionTextValue="block_name"
						placeholder="Select a class block"
						itemComponent={(props) => (
							<SelectItem item={props.item}>{props.item.textValue}</SelectItem>
						)}
					>
						<SelectTrigger aria-label="Block" class="w-[180px]">
							<SelectValue<string>>
								{(state) => state.selectedOption()?.block_name}
							</SelectValue>
						</SelectTrigger>
						<SelectContent />
					</Select>
					<Button onClick={setOpenEditCourseDialog} class="gap-1">
						<IoSettingsOutline class="h-5 w-5" />
						Edit course
					</Button>
					<Dialog
						open={openEditCourseDialog()}
						onOpenChange={setOpenEditCourseDialog}
					>
						<DialogContent>
							<DialogHeader>
								<DialogTitle class="flex flex-row gap-2 items-center">
									Edit Course
									<Button
										variant="ghost"
										class="flex h-5 w-5 p-3"
										title="Refresh"
										onClick={() => {
											refetchCourses();
										}}
									>
										<IoRefreshSharp class="h-5 w-5" />
									</Button>
								</DialogTitle>
								<DialogDescription>
									Changer les paramètres du cours
								</DialogDescription>
							</DialogHeader>
							<TextField class="flex flex-row items-center">
								<TextFieldLabel>Nom</TextFieldLabel>
								<TextFieldInput
									value={
										courses().find(
											(course) => course.course_id === selectedCourseId(),
										).course_name
									}
									disabled
								/>
							</TextField>
							<NumberField
								class="flex flex-row items-center gap-2"
								value={lateTimeInterval()[0]}
								onRawValueChange={(value) =>
									setLateTimeInterval((prev) => [value, prev[1]])
								}
								minValue={0}
								maxValue={lateTimeInterval()[1]}
							>
								<NumberFieldLabel>Début du retard</NumberFieldLabel>
								<NumberFieldGroup>
									<NumberFieldInput />
									<NumberFieldIncrementTrigger />
									<NumberFieldDecrementTrigger />
								</NumberFieldGroup>
								<span>min</span>
							</NumberField>
							<NumberField
								class="flex flex-row items-center gap-2"
								value={lateTimeInterval()[1]}
								onRawValueChange={(value) =>
									setLateTimeInterval(
										setLateTimeInterval((prev) => [prev[0], value]),
									)
								}
								minValue={lateTimeInterval()[0]}
								maxValue={600}
							>
								<NumberFieldLabel>Fin du retard</NumberFieldLabel>
								<NumberFieldGroup>
									<NumberFieldInput />
									<NumberFieldIncrementTrigger />
									<NumberFieldDecrementTrigger />
								</NumberFieldGroup>
								<span>min</span>
							</NumberField>
							<DialogFooter>
								<Button
									disabled={loading()}
									onClick={() => {
										setLoading(true);
										updateLateTimeInterval(
											selectedCourseId(),
											lateTimeInterval(),
										).then(() => {
											refetchCourses();
											setLoading(false);
										});
									}}
								>
									Sauvegarder
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
				<div class="flex flex-wrap gap-2">
					<Button onClick={setOpenWheelDialog} class="gap-1">
						<RiSystemTimer2Line class="h-5 w-5" />
						Turn a wheel
					</Button>
					<Dialog open={openWheelDialog()} onOpenChange={setOpenWheelDialog}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle class="flex flex-row gap-2 items-center">
									Tourner la roue
									<Button
										variant="ghost"
										class="flex h-5 w-5 p-3"
										title="Refresh"
										onClick={() => {
											setShowWheel(false);
											setShowWheel(true);
										}}
									>
										<IoRefreshSharp class="h-5 w-5" />
									</Button>
								</DialogTitle>
								<DialogDescription>
									Cliquez sur la roue pour la faire tourner
								</DialogDescription>
							</DialogHeader>
							<Show when={showWheel()} keyed>
								<SpinWheel attendances={attendances()} />
							</Show>
						</DialogContent>
					</Dialog>
					<Button onClick={() => setOpenDialog(true)} class="gap-1">
						<IoPeople class="h-5 w-5" />
						Compose groups
					</Button>
					<Dialog open={openDialog()} onOpenChange={setOpenDialog}>
						<DialogContent class="h-[75vh] w-[60vw] max-h-screen max-w-screen flex flex-col gap-4">
							<DialogHeader>
								<DialogTitle>Création de groupes</DialogTitle>
								<DialogDescription>
									Entrez le nombre de personnes par groupe :
								</DialogDescription>
							</DialogHeader>

							<div class="flex flex-col gap-4">
								<div class="flex items-start gap-2">
									<div class="relative">
									<NumberField
										defaultValue={2}
										onRawValueChange={(value) => {
											setPeoplePerGroup(value);
											setGroups(
												createGroups(
													value,
													includeAbsents()
														? attendances()
														: attendances().filter(
															(a: { attendance_status: string }) =>
																a.attendance_status === "Present" || a.attendance_status === "Late",
														),
												),
											);
										}}
										validationState={peoplePerGroup() <= 0 ? "invalid" : "valid"}
										class="w-36"
									>
											<NumberFieldGroup>
												<NumberFieldInput type="number" min={1} step="1" />
											</NumberFieldGroup>
											<NumberFieldErrorMessage>
												Veuillez entrer un nombre valide de personnes par
												groupe.
											</NumberFieldErrorMessage>
										</NumberField>
									</div>

									<div class="flex items-center self-start">
										<Button
											variant="outline"
											class="w-10 h-10 flex items-center justify-center p-0"
											title="Refresh"
											onClick={() => {
												const filteredStudents = includeAbsents()
													? attendances()
													: attendances().filter(
														(a: { attendance_status: string }) =>
															a.attendance_status === "Present" || a.attendance_status === "Late",
													);
										
												const newGroups = createGroups(peoplePerGroup(), filteredStudents);
												setGroups(newGroups);
												setOpenDialog(true);
											}}
										>
											<IoRefreshSharp class="h-5 w-5" />
										</Button>
									</div>
								</div>

								<div class="flex items-start space-x-2">
									<Checkbox
										id="include-absents"
										checked={includeAbsents()}
										onChange={(value) => {
											setIncludeAbsents(value);
											setGroups(
												createGroups(
													peoplePerGroup(),
													value === true
														? attendances()
														: attendances().filter(
																(a: { attendance_status: string }) =>
																	a.attendance_status === "Present" || a.attendance_status === "Late",
															),
												),
											);
										}}
									/>
									<div class="grid gap-1.5 leading-none">
										<Label for="include-absents">Inclure les absents</Label>
									</div>
								</div>
							</div>

							<Show when={peoplePerGroup() > 0}>
								<div class="mt-4 max-w-full overflow-x-auto flex flex-wrap ">
									<For each={groups()}>
										{(group, groupIndex) => (
											<div class="flex items-start gap-4 flex-wrap w-full">
												<div class="flex-shrink-0 flex flex-col justify-center items-center w-32 h-20 bg-blue-500 text-white font-bold rounded overflow-hidden mt-4">
													Groupe {groupIndex() + 1}
												</div>
												<div class="flex flex-wrap gap-2">
													<For each={group}>
														{(studentName) => {
															const student = attendances().find(
																(a: { student_full_name: string }) =>
																	a.student_full_name === studentName,
															);

															return (
																<div class="flex flex-col items-center border rounded-lg w-32 px-2 py-2 mt-4">
																	<Avatar class="w-20 h-20 mb-1">
																		<AvatarImage
																			src={getPictureUrl(
																				`students/${student?.matricule}.jpg`,
																			)}
																			class="object-cover w-20 h-20"
																		/>
																		<AvatarFallback>Photo</AvatarFallback>
																	</Avatar>
																	<div class="text-base text-center truncate">
																		{studentName
																			.split(" ")
																			.map((name, index) => (
																				<div key={index}>{name}</div>
																			))}
																	</div>
																</div>
															);
														}}
													</For>
												</div>
											</div>
										)}
									</For>
								</div>
							</Show>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={exportGroupsToExcel}
									class="bg-black text-white font-bold rounded-lg hover:bg-gray-900"
								>
									Exporter les groupes
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
			<div class="flex justify-center m-2">
				<Show
					when={attendances() && Object.keys(attendances()).length !== 0}
					fallback={"No Data"}
				>
					<div class="flex flex-col">
						<div class="flex justify-center items-center">
							<span class="flex flex-wrap gap-2 text-lg font-semibold">
								<span>Nombre d'étudiants présents:</span>
								<span>
									<span
										class={
											presentAttendances().length > 0
												? "text-green-600"
												: "text-red-600"
										}
									>
										{presentAttendances().length}
									</span>
									<span class="text-gray-500"> / {attendances().length}</span>
								</span>
							</span>
						</div>
						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 m-5 gap-5 max-w-screen-2xl">
							<For each={attendances()}>
								{(attendance) => (
									<Card
										class="flex flex-col justify-center items-center space-y-3 p-2 min-w-fit"
										tabindex="0"
										aria-label={attendance.student_full_name}
										onKeyDown={(e) => {
											if (e.key === "+" || e.key === "p") {
												setSelectedStudent(attendance);
												setOpen(true);
												e.preventDefault();
											}
											if (e.key === "Enter" || e.key === " ") {
												updateAttendanceForClassBlock(
													attendance.student_email,
													selectedBlockId(),
													attendance.attendance_status === "Present" || attendance.attendance_status === "Late"
														? "Absent"
														: "Present",
													"manual",
												);
												e.preventDefault();
											}
										}}
									>
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
														attendance.attendance_status === "Present" || attendance.attendance_status === "Late"
															? "Absent"
															: "Present",
														"manual",
													)
												}
												class={`${attendance.attendance_status === "Present" ? "bg-green-600 text-white hover:bg-green-800" : attendance.attendance_status === "Late" ? "bg-green-600 text-white hover:bg-green-800 border-4 border-yellow-400" : ""} {} cursor-pointer`}
												variant={
													attendance.attendance_status === "Present" || attendance.attendance_status === "Late"
														? "default"
														: "destructive"
												}
											>
												{attendance.attendance_status === "Late" ? "Present" : attendance.attendance_status}
											</Badge>
										</CardFooter>
									</Card>
								)}
							</For>
						</div>
					</div>
				</Show>
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
									<span>Statut : {selectedStudent()?.attendance_status}</span>
									<Separator class="my-2"/>
									<span>Total présences : {}</span>
									<span>Total retards : {}</span>
									<span>Total absences : {}</span>
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
			{/* Carte des statistiques */}
			<div
				class="mb-6 p-4 max-w-md mx-auto border rounded-lg shadow-md"
				aria-label="Statistiques des présences de l'étudiant"
			>
				<ul class="space-y-4">
					{/* Présences */}
					<li class="flex items-center justify-between">
						<span>Nombre de présences :</span>
						{getStudentAttendancesStatus()?.present}
						<button
							onClick={() => {
								setOpen(true);
								setSelectedstats("Present");
							}}
							type="button"
							aria-label="Voir les détails des présences"
							class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
						>
							Détails
						</button>
					</li>
					{/* Absences */}
					<li class="flex items-center justify-between">
						<span>Nombre d'absences :</span>
						{getStudentAttendancesStatus()?.absent}
						<button
							onClick={() => {
								setOpen(true);
								setSelectedstats("Absent");
							}}
							type="button"
							aria-label="Voir les détails des absences"
							class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
						>
							Détails
						</button>
					</li>
					{/* Retards */}
					<li class="flex items-center justify-between">
						<span>Nombre de retards :</span>
						{getStudentAttendancesStatus()?.retard}
						<button
							onClick={() => {
								setOpen(true);
								setSelectedstats("Retard");
							}}
							type="button"
							aria-label="Voir les détails des retards"
							class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
						>
							Détails
						</button>
					</li>
				</ul>
			</div>

			{/* Section des présences individuelles */}
			<div class="p-4 rounded-xl shadow-lg" aria-label="Liste des présences">
				<h2 class="text-xl font-bold text-center mb-4">Mes présences</h2>
				<div class="flex flex-wrap gap-4" aria-live="polite">
					<For each={studentAttendances()}>
						{(attendance) => (
							<div
								class="flex-1 min-w-[250px] max-w-[300px] border rounded-lg shadow-md p-4 transition-transform transform hover:scale-105"
								tabindex="0"
								aria-label={`Présence pour le cours ${attendance.name}. Statut : ${attendance.status}. Date : ${new Date(attendance.timestamp).toLocaleString()}`}
							>
								<p>
									<strong>Cours :</strong> {attendance.name}
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

			{/* Dialog des détails par statut */}
			<Dialog
				open={open()}
				onOpenChange={setOpen}
				aria-label={`Détails des ${selectedstats}`}
			>
				<DialogContent>
					<div class="p-4 rounded-xl shadow-lg">
						<div class="flex flex-wrap gap-4" aria-live="polite">
							<For each={studentAttendencesByStatus()}>
								{(attendance) => (
									<div
										class="flex-1 min-w-[250px] max-w-[300px] border rounded-lg shadow-md p-4 transition-transform transform hover:scale-105"
										tabindex="0"
										aria-label={`Cours ${attendance.name}, Statut ${attendance.status}, Date ${new Date(attendance.timestamp).toLocaleString()}`}
									>
										<p>
											<strong>Cours :</strong> {attendance.name}
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
