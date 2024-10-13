import { Title } from "@solidjs/meta";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

export default function Home() {
	return (
		<main>
			<Title>FaceX</Title>
			<h1>Hello world!</h1>
			<Table>
				<TableCaption>A list of your recent invoices.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead class="w-[100px]">Invoice</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Method</TableHead>
						<TableHead class="text-right">Amount</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell class="font-medium">INV001</TableCell>
						<TableCell>Paid</TableCell>
						<TableCell>Credit Card</TableCell>
						<TableCell class="text-right">$250.00</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</main>
	);
}
