import { Card } from "../ui/card";
import PoolsTable from "./PoolsTable";

export default function InfoCard() {
	return (
		<>
			<h2 className="text-xl font-bold text-white mt-4">Summary</h2>
			<Card className="my-4 p-4">
				<div className="text-center flex flex-col justify-center gap-4">
					<PoolsTable />
				</div>
			</Card>
		</>
	);
}
