"use client";
import { Problem } from "@/types/submission";
import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { redirect } from "next/navigation";

export const columns: ColumnDef<Problem>[] = [
{
        accessorKey: "problem_name",
        header: "Problem Name"
    },
    {
        accessorKey: "competition_level",
        header: "Competition Level",
        filterFn: "arrIncludesSome",
    },
    {
        accessorKey: "problem_year",
        header: "Year",
        filterFn: (row, columnId, filterValue) => {
            const year = row.getValue(columnId) as number;
            return filterValue.includes(year);
        }
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
    {
        id: "actions",
        cell({ row }) {
            return ( 
            <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <EllipsisHorizontalIcon className="h-4 w-4 mr-2" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => redirect(`/editor?id=${row.original.problem_id}`)}>Launch Problem</DropdownMenuItem>
                    {
                        /*
                        <ModifyProblemDialog 
                            title="Edit Problem" 
                            description="Edit an existing problem in the database."
                            problemId={row.original.problem_id} 
                            trigger={
                                <div className="hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">Edit Problem</div>
                            }
                        />
                        */
                    }
                    
                    <DropdownMenuItem disabled>View Submissions</DropdownMenuItem>
                    <DropdownMenuItem disabled>Delete Problem</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> 
            )
        }
    },
]