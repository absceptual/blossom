
"use client";

import { Problem } from "@/types/submission";
import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Problem>[] = [
    {
        accessorKey: "problem_name",
        header: "Problem Name"
    },
    {
        accessorKey: "competition_level",
        header: "Competition Level",
    },
    {
        accessorKey: "problem_year",
        header: "Year",
    },
    {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
            const problem = row.original;
            const tags = problem.tags || [];

            return (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <Badge
                            variant="secondary"
                            className={`text-xs`}
                            key={index} 
                          >
                            {tag}
                          </Badge>
                    ))}
                </div>
            );
        }
    },
]