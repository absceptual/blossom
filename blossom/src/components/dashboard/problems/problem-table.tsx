/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { DropdownMenu,  DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger  } from "@/components/ui/dropdown-menu";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/solid";

import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}


const levels = ["Invitational A", "Invitational B", "District", "Region", "State"];
const years  = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013];
const initialColumnFilters: ColumnFiltersState = [
    { id: "competition_level", value: [...levels] },
    { id: "problem_year", value: [...years] }
];

export function ProblemTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);

    const table = useReactTable<TData>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableMultiRowSelection: false,
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
          columnFilters
        },
    });

    function handleFilterChange(columnId: string, itemToToggle, shouldAdd: boolean) {
      const column = table.getColumn(columnId);
      if (!column) return;
      const filter = [...(column.getFilterValue() as any[] || [])]; // Create a copy

      if (shouldAdd) {
          if (!filter.includes(itemToToggle)) {
              filter.push(itemToToggle);
          }
      } else {
          const index = filter.indexOf(itemToToggle);
          if (index !== -1) {
              filter.splice(index, 1);
          }
      }
      
      column.setFilterValue(filter);
    }

    return (
    <div className="w-full">
        <div className="flex flex-col items-left py-4 gap-3">
            <div className="flex flex-row items-center justify-between">
                <Input
                    placeholder="Search by problem name..."
                    value={(table.getColumn("problem_name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("problem_name")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />

                <div className="grid grid-cols-1 items-center gap-2 justify-between">
                    {
                      /*
                        <ModifyProblemDialog
                      title="Create Problem"
                      description="Create a new problem to add to the database"
                    />
                      */
                    }
                    
                    <Button variant="default" onClick={() => { 
                        table.resetColumnFilters();
                        setColumnFilters(initialColumnFilters);
                    }}>
                        Reset Filters
                    </Button>
                </div>
            </div>
            
            <div className="w-sm flex gap-1 justify-start flex-row">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            Filter by Competition Level
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                    {levels.map((level) => {
                            const column = table.getColumn("competition_level");
                            const filter = column.getFilterValue() as string[];

                            return ( 
                                <DropdownMenuCheckboxItem
                                    key={level}
                                    className="capitalize"
                                    checked={filter.includes(level)}
                                    onCheckedChange={(value) => {handleFilterChange("competition_level", level, value)}}
                                >
                                    {level}
                                </DropdownMenuCheckboxItem> 
                            )
                        })
                    }
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                        Filter by Year
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        {years.map((year) => {
                            const column = table.getColumn("problem_year");
                            const filter = column.getFilterValue() as number[];

                            return ( 
                                <DropdownMenuCheckboxItem
                                    key={year}
                                    className="capitalize"
                                    checked={filter.includes(year)}
                                    onCheckedChange={(value) => {handleFilterChange("problem_year", year, value)}}
                                >
                                    {year}
                                </DropdownMenuCheckboxItem> 
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
   
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id}>
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
                    <TableBody >
                        {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            onClick={() => row.toggleSelected()}
                            
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

                <div className="flex items-center justify-center space-x-2 py-4">
                    <DataTablePagination table={table} />
                </div>
            </div>
        </div>
    </div>
  )
}



interface DataTablePaginationProps<TData> {
  table: TanstackTable<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronDoubleLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronDoubleRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
