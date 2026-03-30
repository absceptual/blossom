/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getJudge0Submission, searchSubmissions, deleteSubmission } from "@/actions/judge0";

interface SubmissionRow {
    id?: number;
    problem_id?: string;
    username?: string;
    status?: string;
    date?: string;
    token?: string;
}

interface SubmissionDetail {
    source_code: string | null;
    stdin: string | null;
    expected_output: string | null;
    command_line_arguments: string | null;
    status: { id: number; description: string } | null;
    created_at: string | null;
    finished_at: string | null;
}

function decodeBase64(value: string | null): string {
    if (!value) return "";
    try {
        return atob(value);
    } catch {
        return value;
    }
}

function statusBadge(status: string) {
    if (status === "Accepted") return <Badge variant="outline" className="bg-green-400 text-white">{status}</Badge>;
    if (status.includes("Error") || status === "Wrong Answer") return <Badge variant="destructive">{status}</Badge>;
    if (status.includes("Time Limit")) return <Badge variant="secondary">{status}</Badge>;
    return <Badge variant="outline">{status}</Badge>;
}

export function StatsCard({ totalSubmissions, recentSubmissions }: { totalSubmissions: number | null; recentSubmissions: any[] | null }) {
    const router = useRouter();
    const [submissions, setSubmissions] = useState<SubmissionRow[]>(recentSubmissions as SubmissionRow[] ?? []);
    const [usernameFilter, setUsernameFilter] = useState("");
    const [problemFilter, setProblemFilter] = useState("");
    const [searching, setSearching] = useState(false);

    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
    const [loading, setLoading] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<SubmissionRow | null>(null);
    const [deleting, setDeleting] = useState(false);

    async function handleSearch() {
        setSearching(true);
        const filters: { username?: string; problemId?: string } = {};
        if (usernameFilter.trim()) filters.username = usernameFilter.trim();
        if (problemFilter.trim()) filters.problemId = problemFilter.trim();

        const results = await searchSubmissions(filters);
        if (results) setSubmissions(results as SubmissionRow[]);
        setSearching(false);
    }

    function handleClear() {
        setUsernameFilter("");
        setProblemFilter("");
        setSubmissions(recentSubmissions as SubmissionRow[] ?? []);
    }

    async function fetchDetails(token: string) {
        setLoading(token);
        setError(null);
        const result = await getJudge0Submission(token);
        setLoading(null);

        if (!result) {
            setError("Failed to fetch submission details from Judge0. The submission may have been purged.");
            setDialogOpen(true);
            setSelectedSubmission(null);
            return;
        }

        setSelectedSubmission(result);
        setDialogOpen(true);
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        const result = await deleteSubmission(deleteTarget.id);
        setDeleting(false);

        if (result) {
            setError(result);
        } else {
            setSubmissions(prev => prev.filter(s => s.id !== deleteTarget.id));
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
            router.refresh();
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                    <CardDescription>
                        {totalSubmissions !== null ? `${totalSubmissions} total submissions` : "Unable to fetch submission count"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1 block">Username</label>
                            <Input
                                placeholder="Filter by username..."
                                value={usernameFilter}
                                onChange={(e) => setUsernameFilter(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1 block">Problem ID</label>
                            <Input
                                placeholder="Filter by problem..."
                                value={problemFilter}
                                onChange={(e) => setProblemFilter(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={searching}>
                            {searching ? "Searching..." : "Search"}
                        </Button>
                        <Button variant="outline" onClick={handleClear}>
                            Clear
                        </Button>
                    </div>

                    {submissions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Problem</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((sub) => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="text-sm font-mono">{sub.problem_id}</TableCell>
                                        <TableCell className="text-sm">{sub.username}</TableCell>
                                        <TableCell>{statusBadge(sub.status)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(sub.date).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fetchDetails(sub.token)}
                                                disabled={loading === sub.token}
                                            >
                                                {loading === sub.token ? "Loading..." : "View"}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => { setDeleteTarget(sub); setDeleteDialogOpen(true); }}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground">No submissions found.</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Submission Details</DialogTitle>
                        <DialogDescription>
                            Retrieved from Judge0 instance
                        </DialogDescription>
                    </DialogHeader>
                    {error && !deleteTarget ? (
                        <p className="text-sm text-destructive">{error}</p>
                    ) : selectedSubmission ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="text-sm font-medium">{selectedSubmission.status?.description ?? "Unknown"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Command Line Arguments</p>
                                    <p className="text-sm font-mono">{selectedSubmission.command_line_arguments || "None"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="text-sm">{selectedSubmission.created_at ? new Date(selectedSubmission.created_at).toLocaleString() : "—"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Finished At</p>
                                    <p className="text-sm">{selectedSubmission.finished_at ? new Date(selectedSubmission.finished_at).toLocaleString() : "—"}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Source Code</p>
                                <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap">
                                    {decodeBase64(selectedSubmission.source_code) || "—"}
                                </pre>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Input (stdin)</p>
                                    <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                                        {decodeBase64(selectedSubmission.stdin) || "—"}
                                    </pre>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Expected Output</p>
                                    <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                                        {decodeBase64(selectedSubmission.expected_output) || "—"}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Submission</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this submission from {deleteTarget?.username} for problem {deleteTarget?.problem_id}?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {error && deleteTarget && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
