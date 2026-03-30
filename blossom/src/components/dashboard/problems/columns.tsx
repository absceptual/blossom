"use client";
import { Problem, Submission } from "@/types/submission";
import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { redirect } from "next/navigation";
import { ModifyProblemDialog } from "./modify-problem";
import { deleteProblem, getSubmissionsByProblem } from "@/actions/problems";
import { UserPermissions } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getStatusBadge, formatTimeAgo } from "@/components/dashboard/submissions-card";
import { useState, useEffect } from "react";

function ViewSubmissionsDialog({ problemId, problemName, trigger }: { problemId: string; problemName: string; trigger: React.ReactNode }) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setLoading(true);
            getSubmissionsByProblem(problemId, 50).then((result) => {
                setSubmissions(result || []);
                setLoading(false);
            });
        }
    }, [open, problemId]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Submissions for {problemName}</DialogTitle>
                    <DialogDescription>
                        {submissions.length} submission{submissions.length !== 1 ? "s" : ""} found
                    </DialogDescription>
                </DialogHeader>
                {loading ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
                ) : submissions.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">No submissions yet.</div>
                ) : (
                    <div className="space-y-3">
                        {submissions.map((submission, index) => {
                            const submissionDate = typeof submission.date === 'string'
                                ? new Date(submission.date) : submission.date;
                            return (
                                <div key={index} className="flex items-center justify-between rounded-md border p-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">{submission.username}</span>
                                        {getStatusBadge(submission.status)}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {formatTimeAgo(submissionDate)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

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
        cell({ row, table }) {
            interface session { username: string, expires: Date, permissions: UserPermissions[] };
            const permissions: number[] = (table.options.meta as session)?.permissions || [];
            const canManage = permissions.includes(UserPermissions.MANAGE_PROBLEMS);
            const canDelete = permissions.includes(UserPermissions.DELETE_PROBLEMS);

            return (
            <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <EllipsisHorizontalIcon className="h-4 w-4 mr-2" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => redirect(`/editor?id=${row.original.problem_id}`)}>Launch Problem</DropdownMenuItem>
                    {canManage && (
                        <ModifyProblemDialog
                            title="Edit Problem"
                            description="Edit an existing problem in the database."
                            problemId={row.original.problem_id}
                            trigger={
                                <div className="hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">Edit Problem</div>
                            }
                        />
                    )}
                    {canManage && (
                        <ViewSubmissionsDialog
                            problemId={row.original.problem_id}
                            problemName={row.original.problem_name}
                            trigger={
                                <div className="hover:bg-accent focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">View Submissions</div>
                            }
                        />
                    )}
                    {canDelete && (
                        <DropdownMenuItem onClick={async () => {
                            if (confirm("Are you sure you want to delete this problem?")) {
                                await deleteProblem(row.original.problem_id);
                                window.location.reload();
                            }
                        }}>Delete Problem</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    },
]
