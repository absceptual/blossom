/* eslint-disable */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { UserPermissions } from "@/lib/types";
import { useState, useEffect } from "react";
import {
    getUser,
    updateUserPermissions,
    updateUsername,
    resetUserPassword,
    getUserSubmissions,
    deleteSubmissions,
    deleteUserData,
    deleteUser,
} from "@/actions/users";
import { getStatusBadge, formatTimeAgo } from "@/components/dashboard/submissions-card";
import { Submission } from "@/types/submission";

export type UserRow = {
    id: number;
    username: string;
    code: string;
    permissions: number[];
    rank: number | null;
};

const permissionLabels: Record<number, string> = {
    [UserPermissions.UPLOAD_PROBLEMS]: "Upload Problems",
    [UserPermissions.ADMINISTRATOR]: "Administrator",
    [UserPermissions.VIEW_JUDGE0_CONFIG]: "View Judge0 Config",
    [UserPermissions.MANAGE_USERS]: "Manage Users",
    [UserPermissions.MANAGE_PROBLEMS]: "Manage Problems",
    [UserPermissions.MANAGEMENT_ACCESS]: "Management Access",
    [UserPermissions.DELETE_PROBLEMS]: "Delete Problems",
};

const allPermissions = Object.keys(permissionLabels).map(Number);

// ─── Dialogs ───

function ViewDetailsDialog({ username, trigger }: { username: string; trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setLoading(true);
            getUser(username).then((data) => {
                setDetails(data);
                setLoading(false);
            });
        }
    }, [open, username]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                    <DialogDescription>{username}</DialogDescription>
                </DialogHeader>
                {loading ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>
                ) : details ? (
                    <div className="grid gap-3 py-4">
                        <div className="grid gap-1">
                            <Label>Username</Label>
                            <div className="text-sm">{details.username}</div>
                        </div>
                        <div className="grid gap-1">
                            <Label>Access Code</Label>
                            <div className="text-sm font-mono">{details.code}</div>
                        </div>
                        <div className="grid gap-1">
                            <Label>Rank</Label>
                            <div className="text-sm">{details.rank ?? "Unranked"}</div>
                        </div>
                        <div className="grid gap-1">
                            <Label>Permissions</Label>
                            <div className="flex flex-wrap gap-1">
                                {details.permissions?.length > 0
                                    ? details.permissions.map((p: number) => (
                                        <Badge key={p} variant="secondary" className="text-xs">{permissionLabels[p] || p}</Badge>
                                    ))
                                    : <span className="text-sm text-muted-foreground">None</span>
                                }
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{details.totalSubmissions}</div>
                                <div className="text-xs text-muted-foreground">Submissions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{details.acceptedProblems}</div>
                                <div className="text-xs text-muted-foreground">Accepted</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{details.problemsStarted}</div>
                                <div className="text-xs text-muted-foreground">Started</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">User not found</div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function EditPermissionsDialog({ username, currentPermissions, trigger }: { username: string; currentPermissions: number[]; trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<number[]>(currentPermissions);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) setSelected(currentPermissions);
    }, [open, currentPermissions]);

    async function handleSave() {
        setSaving(true);
        setError(null);
        const result = await updateUserPermissions(username, selected);
        if (result) setError(result);
        else { setOpen(false); window.location.reload(); }
        setSaving(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Edit Permissions</DialogTitle>
                    <DialogDescription>Modify permissions for {username}</DialogDescription>
                </DialogHeader>
                {error && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-500">{error}</div>}
                <div className="grid gap-3 py-4">
                    {allPermissions.map((perm) => (
                        <div key={perm} className="flex items-center space-x-2">
                            <Checkbox
                                id={`perm-${perm}`}
                                checked={selected.includes(perm)}
                                onCheckedChange={(checked) => {
                                    setSelected(prev =>
                                        checked ? [...prev, perm] : prev.filter(p => p !== perm)
                                    );
                                }}
                            />
                            <Label htmlFor={`perm-${perm}`} className="text-sm">{permissionLabels[perm]}</Label>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function RenameUserDialog({ username, trigger }: { username: string; trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { if (open) { setNewName(""); setError(null); } }, [open]);

    async function handleSave() {
        setSaving(true);
        setError(null);
        const result = await updateUsername(username, newName);
        if (result) setError(result);
        else { setOpen(false); window.location.reload(); }
        setSaving(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Rename User</DialogTitle>
                    <DialogDescription>Current username: {username}</DialogDescription>
                </DialogHeader>
                {error && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-500">{error}</div>}
                <div className="grid gap-3 py-4">
                    <Label>New Username</Label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter new username" />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave} disabled={saving || !newName}>{saving ? "Saving..." : "Rename"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ResetPasswordDialog({ username, trigger }: { username: string; trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { if (open) { setPassword(""); setError(null); } }, [open]);

    async function handleSave() {
        setSaving(true);
        setError(null);
        const result = await resetUserPassword(username, password);
        if (result) setError(result);
        else setOpen(false);
        setSaving(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>Set a new password for {username}</DialogDescription>
                </DialogHeader>
                {error && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-500">{error}</div>}
                <div className="grid gap-3 py-4">
                    <Label>New Password</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave} disabled={saving || password.length < 8}>{saving ? "Saving..." : "Reset Password"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteSubmissionsDialog({ username, trigger }: { username: string; trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (open) {
            setLoading(true);
            setSelected(new Set());
            getUserSubmissions(username).then((data) => {
                setSubmissions(data);
                setLoading(false);
            });
        }
    }, [open, username]);

    function toggleSelect(id: number) {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleAll() {
        if (selected.size === submissions.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(submissions.map(s => s.id!)));
        }
    }

    async function handleDelete() {
        setDeleting(true);
        await deleteSubmissions(Array.from(selected));
        setDeleting(false);
        setOpen(false);
        window.location.reload();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Delete Submissions</DialogTitle>
                    <DialogDescription>Select submissions to delete for {username}</DialogDescription>
                </DialogHeader>
                {loading ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
                ) : submissions.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">No submissions found.</div>
                ) : (
                    <>
                        <div className="flex items-center justify-between pb-2">
                            <Button variant="outline" size="sm" onClick={toggleAll}>
                                {selected.size === submissions.length ? "Deselect All" : "Select All"}
                            </Button>
                            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
                        </div>
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                            {submissions.map((sub) => {
                                const date = typeof sub.date === 'string' ? new Date(sub.date) : sub.date;
                                return (
                                    <div
                                        key={sub.id}
                                        className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer ${selected.has(sub.id!) ? 'border-red-300 bg-red-50' : ''}`}
                                        onClick={() => toggleSelect(sub.id!)}
                                    >
                                        <Checkbox checked={selected.has(sub.id!)} />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{sub.problem_id}</div>
                                            <div className="text-xs text-muted-foreground">{formatTimeAgo(date)}</div>
                                        </div>
                                        {getStatusBadge(sub.status)}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleting || selected.size === 0}>
                        {deleting ? "Deleting..." : `Delete ${selected.size} submission${selected.size !== 1 ? 's' : ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Helper for dropdown items that trigger dialogs
const dropdownItemClass = "hover:bg-accent focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

// ─── Columns ───

export const userColumns: ColumnDef<UserRow>[] = [
    {
        accessorKey: "username",
        header: "Username",
    },
    {
        accessorKey: "permissions",
        header: "Permissions",
        cell: ({ row }) => {
            const perms: number[] = row.original.permissions || [];
            return (
                <div className="flex flex-wrap gap-1">
                    {perms.length > 0
                        ? perms.map((p) => (
                            <Badge key={p} variant="secondary" className="text-xs">{permissionLabels[p] || p}</Badge>
                        ))
                        : <span className="text-xs text-muted-foreground">None</span>
                    }
                </div>
            );
        },
    },
    {
        accessorKey: "rank",
        header: "Rank",
        cell: ({ row }) => <span className="text-sm">{row.original.rank ?? "—"}</span>,
    },
    {
        accessorKey: "code",
        header: "Access Code",
        cell: ({ row }) => <span className="text-sm font-mono">{row.original.code}</span>,
    },
    {
        id: "actions",
        cell({ row }) {
            const user = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <EllipsisHorizontalIcon className="h-4 w-4 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <ViewDetailsDialog
                            username={user.username}
                            trigger={<div className={dropdownItemClass}>View Details</div>}
                        />
                        <EditPermissionsDialog
                            username={user.username}
                            currentPermissions={user.permissions || []}
                            trigger={<div className={dropdownItemClass}>Edit Permissions</div>}
                        />
                        <RenameUserDialog
                            username={user.username}
                            trigger={<div className={dropdownItemClass}>Rename User</div>}
                        />
                        <ResetPasswordDialog
                            username={user.username}
                            trigger={<div className={dropdownItemClass}>Reset Password</div>}
                        />
                        <DropdownMenuSeparator />
                        <DeleteSubmissionsDialog
                            username={user.username}
                            trigger={<div className={dropdownItemClass}>Delete Submissions</div>}
                        />
                        <DropdownMenuItem onClick={async () => {
                            if (confirm(`Delete ALL data for ${user.username}? This removes submissions and started problems.`)) {
                                await deleteUserData(user.username);
                                window.location.reload();
                            }
                        }}>Delete All Data</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={async () => {
                            if (confirm(`Permanently delete user ${user.username}? This cannot be undone.`)) {
                                await deleteUser(user.username);
                                window.location.reload();
                            }
                        }}>Delete User</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
