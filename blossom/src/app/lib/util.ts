import { UserPermissions  } from "@/app/lib/definitions";

export function hasPermission(current: UserPermissions[], requested: UserPermissions[]): boolean {
    if (requested.length === 0) 
        return true;
    
    return current.every(permission => requested.includes(permission));
}