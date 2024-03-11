"use client"

import {
    ColumnDef,
    ColumnFiltersState,
    OnChangeFn,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "../ui/card"
import { TabsContent } from "../ui/tabs"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
    sorting = [],
    columnFilters = [],
    columnVisibility = {},
    setSorting,
    setColumnFilters,
    setColumnVisibility,
    linkFn,
}: DataTableProps<TData, TValue> & {
    sorting?: SortingState,
    columnFilters?: ColumnFiltersState,
    columnVisibility?: VisibilityState,
    setSorting?: (sorting: SortingState) => void,
    setColumnFilters?: (columnFilters: ColumnFiltersState) => void,
    setColumnVisibility?: (columnVisibility: VisibilityState) => void,
    linkFn?: (row: TData) => string
}) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting as OnChangeFn<SortingState>,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters as OnChangeFn<ColumnFiltersState>,
        onColumnVisibilityChange: setColumnVisibility as OnChangeFn<VisibilityState>,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    })

    const router = useRouter()

    return (
        <div>
            <TabsContent value="table">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="font-bold text-securdPrimary">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => linkFn && router.push(linkFn(row.original))}
                                    className={linkFn && linkFn(row.original) && "cursor-pointer"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TabsContent>
            <TabsContent value="grid">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <Card key={row.id} onClick={() => linkFn && router.push(linkFn(row.original))} className={linkFn && linkFn(row.original) && "cursor-pointer"}>
                                <CardContent className="flex flex-row gap-4 flex-wrap pt-4">
                                    {row.getVisibleCells().map((cell, i) => (
                                        <div key={cell.id} className={i === 0 ? "w-full" : ""}>
                                            {(() => {
                                                if (i === 0) return null;
                                                const header = table.getHeaderGroups()[0].headers[i];
                                                if (header.isPlaceholder) return null;
                                                return flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )
                                            })()}
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="h-24 text-center">
                            No results.
                        </div>
                    )}
                </div>
            </TabsContent>
        </div>
    )
}