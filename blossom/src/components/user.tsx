'use client'


import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, ChevronUpIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { UserPermissions } from "@/app/lib/definitions";

import { logout } from "@/app/actions/auth";

function getUserRole(permissions) {
    return permissions.includes(UserPermissions.MANAGEMENT_ACCESS) ? 'Administrator' : 'User';
}

export default function User({ username, permissions }) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                    <UserIcon />
                    <div className="flex flex-col items-start justify-items-start">
                        <span>{username}</span>
                        <p className="text-muted-foreground text-xs">{getUserRole(permissions)}</p>
                    </div>
                    {isOpen ? <ChevronDownIcon className="ml-auto h-4 w-4" /> : <ChevronUpIcon className="ml-auto h-4 w-4" />} 
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="py-2 w-[var(--radix-dropdown-menu-trigger-width)]" >
                <DropdownMenuItem>
                    <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={logout}>
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}