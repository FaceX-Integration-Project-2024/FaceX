import { Title } from "@solidjs/meta";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

export default function TrackingPage() {
	return (
		<div class="flex col">
			<Title>FaceX - Tracking</Title>
			<h1>Hello world!</h1>
			<Card>
				<CardContent>Test</CardContent>
			</Card>
		</div>
	);
}
