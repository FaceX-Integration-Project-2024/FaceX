import {
	For,
	createResource,
	createSignal,
	onCleanup,
	onMount,
} from "solid-js";
import { getSessionEmail } from "~/components/context";

import { Dialog, DialogContent } from "~/components/ui/dialog";
import {
	getAttendanceByEmail,
	getAttendanceByStatus,
	getStudentAttenceStatus,
	supabase,
} from "~/supabase-client";

export default function StudentView() {
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
