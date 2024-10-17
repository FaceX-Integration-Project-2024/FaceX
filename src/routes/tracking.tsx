import { Title } from "@solidjs/meta";
import { For, Show, createResource, createSignal } from "solid-js";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
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
} from "~/supabase-client";

export default function TrackingPage() {
	const [selectedBlockId, setSelectedBlockId] = createSignal(1);
	const [blockids] = createResource(async () => {
		return getAllClassBlocksIds();
	}, {initialValue: [1]});
	const [attendances, { refetch }] = createResource(
		selectedBlockId,
		async (blockId) => {
			if (!blockId) return null;
			return getAttendanceForClassBlock(blockId);
		},
	);

	return (
		<div class="flex flex-col p-5">
			<Title>FaceX - Tracking</Title>
			<Select<number>
				value={selectedBlockId()}
				onChange={setSelectedBlockId}
				options={
					blockids()
				}
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
			<div class="flex flex-wrap justify-center m-5 gap-5">
				<Show
					when={attendances() && Object.keys(attendances()).length !== 0}
					fallback={"No Data"}
				>
					<For each={attendances()}>
						{(attendance) => (
							<Card class="flex flex-col justify-center items-center w-52">
								<Avatar class="w-48 h-48 p-5">
									<AvatarImage src="https://bucketurl.facex/matricule.jpg" />
									<AvatarFallback>Photo</AvatarFallback>
								</Avatar>
								<CardTitle>{attendance.student_full_name}</CardTitle>
								<CardFooter
									class={
										attendance.attendance_status === "Present"
											? "text-green-600"
											: "text-red-600"
									}
								>
									{attendance.attendance_status}
								</CardFooter>
							</Card>
						)}
					</For>
				</Show>
			</div>
		</div>
	);
}
