"use client";

import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
} from "@tanstack/react-table";
import { DataTable } from "../layout/DataTable";
import { Tabs } from "../ui/tabs";
import SecurdFormat from "../utils/SecurdFormat";
import PercentageFormat from "../utils/PercentageFormat";
import PairIcon from "../farm/PairIcon";
import {
	type PoolTableRows,
	analyticsToCollateralInfoClient,
} from "@/lib/helpers/analytics.helper";
import MrmScore from "./score";
import { Input } from "../ui/input";
import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";

const columns: ColumnDef<PoolTableRows>[] = [
	{
		id: "pool",
		accessorFn: (row: PoolTableRows) =>
			`${row.pool?.token_0?.token_symbol}/${row.pool?.token_1?.token_symbol}`,
		header: ({ column }) => {
			const sorted = column.getIsSorted();
			const canSort = column.getCanSort();
			return (
				<button
					type="button"
					className="inline-flex items-center gap-1"
					onClick={column.getToggleSortingHandler()}
				>
					<span>Pool</span>
					{canSort && (
						<>
							{sorted === "asc" && <ArrowUp className="w-3 h-3" />}
							{sorted === "desc" && <ArrowDown className="w-3 h-3" />}
							{!sorted && <ArrowUpDown className="w-3 h-3 opacity-40" />}
						</>
					)}
				</button>
			);
		},
		cell: ({ row }) => {
			const userCollateralInfo = analyticsToCollateralInfoClient(
				row.original.pool,
				row.original,
			);

			return (
				<div className="w-full text-left">
					<PairIcon
						userCollateralsInfo={userCollateralInfo}
						reservesInfo={row.original.pool?.reservesInfo}
						symbol={true}
						size="normal"
					/>
				</div>
			);
		},
	},
	{
		id: "tvl",
		accessorFn: (row: PoolTableRows) => {
			const qToken0 = row?.quantity_token_0 ?? 0;
			const qToken1 = row?.quantity_token_1 ?? 0;

			const tvl =
				qToken0 * (row?.pool?.token_0?.prices?.[0]?.price ?? 0) +
				qToken1 * (row.pool?.token_1?.prices?.[0]?.price ?? 0);

			return tvl;
		},
		header: ({ column }) => {
			const sorted = column.getIsSorted();
			const canSort = column.getCanSort();
			return (
				<button
					type="button"
					className="inline-flex items-center gap-1"
					onClick={column.getToggleSortingHandler()}
				>
					<span>TVL</span>
					{canSort && (
						<>
							{sorted === "asc" && <ArrowUp className="w-3 h-3" />}
							{sorted === "desc" && <ArrowDown className="w-3 h-3" />}
							{!sorted && <ArrowUpDown className="w-3 h-3 opacity-40" />}
						</>
					)}
				</button>
			);
		},
		cell: ({ row }) => (
			<div className="w-full text-left">
				<SecurdFormat value={row.getValue("tvl")} />
			</div>
		),
	},
	{
		id: "score",
		accessorFn: (row: PoolTableRows) => row.mrm,
		header: ({ column }) => {
			const sorted = column.getIsSorted();
			const canSort = column.getCanSort();
			return (
				<button
					type="button"
					className="inline-flex items-center gap-1"
					onClick={column.getToggleSortingHandler()}
				>
					<span>Score</span>
					{canSort && (
						<>
							{sorted === "asc" && <ArrowUp className="w-3 h-3" />}
							{sorted === "desc" && <ArrowDown className="w-3 h-3" />}
							{!sorted && <ArrowUpDown className="w-3 h-3 opacity-40" />}
						</>
					)}
				</button>
			);
		},
		cell: ({ row }) => (
			<div className="w-full text-left">
				<MrmScore score={row.getValue("score")} />
			</div>
		),
	},
	{
		id: "apy",
		accessorFn: (row: PoolTableRows) => row.lp_vs_hold_apy_3m,
		header: ({ column }) => {
			const sorted = column.getIsSorted();
			const canSort = column.getCanSort();
			return (
				<button
					type="button"
					className="inline-flex items-center gap-1"
					onClick={column.getToggleSortingHandler()}
				>
					<span>APY</span>
					{canSort && (
						<>
							{sorted === "asc" && <ArrowUp className="w-3 h-3" />}
							{sorted === "desc" && <ArrowDown className="w-3 h-3" />}
							{!sorted && <ArrowUpDown className="w-3 h-3 opacity-40" />}
						</>
					)}
				</button>
			);
		},
		cell: ({ row }) => (
			<div className="w-full text-left">
				<PercentageFormat value={row.getValue("apy")} />
			</div>
		),
	},
];

export default function PoolsTableClient({ data }: { data: PoolTableRows[] }) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	return (
		<Tabs defaultValue="table" className="text-xl font-bold">
			<div className="w-full flex flex-col-reverse gap-2 md:gap-0 md:flex-row justify-between my-4">
				<div className="relative flex items-center">
					<Input
						placeholder="Search"
						className="pl-8 md:w-48 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-b-black focus-visible:border-b-2"
						value={
							(columnFilters.find((f) => f.id === "pool")?.value ||
								"") as string
						}
						onChange={(e) => {
							const value = e.target.value;
							setColumnFilters((prev) => {
								const newFilters = prev.filter((f) => f.id !== "pool");
								if (value) {
									newFilters.push({ id: "pool", value });
								}
								return newFilters;
							});
						}}
					/>
					<Search className="absolute left-0 w-4 h-4 ml-2" />
				</div>
			</div>
			<DataTable
				columns={columns}
				data={data}
				sorting={sorting}
				setSorting={setSorting}
				columnFilters={columnFilters}
				setColumnFilters={setColumnFilters}
				linkFn={(row) => `/analytics/${row.id_pool}`}
			/>
		</Tabs>
	);
}
