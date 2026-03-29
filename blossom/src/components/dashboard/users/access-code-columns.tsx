/* eslint-disable */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { EllipsisHorizontalIcon, PlusIcon } from "@heroicons/react/24/outline";
import { UserPermissions } from "@/lib/types";
import { useState, useEffect } from "react";
import { createAccessCode, updateAccessCode, deleteAccessCode } from "@/actions/users";

export type AccessCodeRow = {
    code: string;
    current_uses: number;
    maximum_uses: number;
    permissions: number[];
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

function PermissionsCheckboxes({ selected, onChange }: { selected: number[]; onChange: (perms: number[]) => void }) {
    return (
        <div className="grid gap-2">
            {allPermissions.map((perm) => (
                <div key={perm} className="flex items-center space-x-2">
                    <Checkbox
                        id={`code-perm-${perm}`}
                        checked={selected.includes(perm)}
                        onCheckedChange={(checked) => {
                            onChange(checked ? [...selected, perm] : selected.filter(p => p !== perm));
                        }}
                    />
                    <Label htmlFor={`code-perm-${perm}`} className="text-sm">{permissionLabels[perm]}</Label>
                </div>
            ))}
        </div>
    );
}

function EditAccessCodeDialog({ codeRow, trigger }: { codeRow: AccessCodeRow; trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [maxUses, setMaxUses] = useState(codeRow.maximum_uses);
    const [permissions, setPermissions] = useState<number[]>(codeRow.permissions || []);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setMaxUses(codeRow.maximum_uses);
            setPermissions(codeRow.permissions || []);
            setError(null);
        }
    }, [open, codeRow]);

    async function handleSave() {
        setSaving(true);
        const result = await updateAccessCode(codeRow.code, maxUses, permissions);
        if (result) setError(result);
        else { setOpen(false); window.location.reload(); }
        setSaving(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Edit Access Code</DialogTitle>
                    <DialogDescription>Code: <span className="font-mono">{codeRow.code}</span></DialogDescription>
                </DialogHeader>
                {error && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-500">{error}</div>}
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Maximum Uses</Label>
                        <Input type="number" value={maxUses} onChange={(e) => setMaxUses(parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Permissions</Label>
                        <PermissionsCheckboxes selected={permissions} onChange={setPermissions} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function CreateAccessCodeDialog() {
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");
    const [maxUses, setMaxUses] = useState(1);
    const [permissions, setPermissions] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) { setCode(""); setMaxUses(1); setPermissions([]); setError(null); }
    }, [open]);

    async function handleCreate() {
        setSaving(true);
        const result = await createAccessCode(code, maxUses, permissions);
        if (result) setError(result);
        else { setOpen(false); window.location.reload(); }
        setSaving(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default"><PlusIcon className="h-4 w-4 mr-1" />Create Access Code</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Create Access Code</DialogTitle>
                    <DialogDescription>New users will use this code to register</DialogDescription>
                </DialogHeader>
                {error && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-500">{error}</div>}
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Code</Label>
                        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter access code" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Maximum Uses</Label>
                        <Input type="number" value={maxUses} onChange={(e) => setMaxUses(parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Permissions</Label>
                        <PermissionsCheckboxes selected={permissions} onChange={setPermissions} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleCreate} disabled={saving || !code}>{saving ? "Creating..." : "Create"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const dropdownItemClass = "hover:bg-accent focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export const accessCodeColumns: ColumnDef<AccessCodeRow>[] = [
    {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <span className="font-mono">{row.original.code}</span>,
    },
    {
        accessorKey: "permissions",
        header: "Permissions",
        cell: ({ row }) => {
            const perms: number[] = row.original.permissions || [];
            return (
                <div className="flex flex-wrap gap-1">
                    {perms.length > 0
                        ? perms.map((p) => <Badge key={p} variant="secondary" className="text-xs">{permissionLabels[p] || p}</Badge>)
                        : <span className="text-xs text-muted-foreground">None</span>
                    }
                </div>
            );
        },
    },
    {
        id: "usage",
        header: "Usage",
        cell: ({ row }) => (
            <span className="text-sm">{row.original.current_uses} / {row.original.maximum_uses}</span>
        ),
    },
    {
        id: "actions",
        cell({ row }) {
            const codeRow = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <EllipsisHorizontalIcon className="h-4 w-4 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                        <EditAccessCodeDialog
                            codeRow={codeRow}
                            trigger={<div className={dropdownItemClass}>Edit</div>}
                        />
                        <DropdownMenuItem className="text-destructive" onClick={async () => {
                            if (confirm(`Delete access code "${codeRow.code}"?`)) {
                                await deleteAccessCode(codeRow.code);
                                window.location.reload();
                            }
                        }}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
