import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { hasPermission } from '@/lib/utilities';
import { SessionPayload, UserPermissions } from '@/lib/types';
import User from '@/components/dashboard/user';

import { 
    Sidebar, 
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
} from '@/components/ui/sidebar';

import { 
    HomeIcon, 
    ServerStackIcon,
    UserGroupIcon,
    CodeBracketSquareIcon,
    CodeBracketIcon,
} from "@heroicons/react/24/outline";


interface Section {
    label: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any,
    url: string,
    permissions: UserPermissions[]
}
const general: Section[] = [
    {
        label: 'Home',
        icon: HomeIcon,
        url: '/dashboard',
        permissions: [] as UserPermissions[]
    },
    /*
    {
        label: 'Leaderboard',
        icon: ChartBarIcon,
        url: '#',
        permissions: [] as UserPermissions[]
    },
    */
    {
        label: 'Problems',
        icon: CodeBracketIcon,
        url: '/dashboard/problems',
        permissions: [] as UserPermissions[],
    },
    {
        label: 'Editor',
        icon: CodeBracketSquareIcon,
        url: '/editor',
        permissions: [] as UserPermissions[],
    },
    /*
    {
        label: 'Settings',
        icon: Cog6ToothIcon,
        url: '#',
        permissions: [] as UserPermissions[],
    },
    */
]

const serverManagement: Section[] = [
    {
        label: 'Judge0',
        icon: ServerStackIcon,
        url: '#',
        permissions: [UserPermissions.VIEW_JUDGE0_CONFIG] as UserPermissions[]
    },
    {
        label: 'Users',
        icon: UserGroupIcon,
        url: '#',
        permissions: [UserPermissions.MANAGE_USERS] as UserPermissions[]
    },
]

function SidebarGroupWrapper({ 
    name, 
    menus, 
    permissions 
}: {
    name: string,
    menus: Section[],
    permissions: UserPermissions[]
}) {

    const items = menus.map((item: Section) => {
        return hasPermission(permissions, item.permissions) ?
        (<SidebarMenuItem key={item.label}>
            <SidebarMenuButton asChild>
                <a href={item.url}>
                    <item.icon  />
                    <span>{item.label}</span>
                </a>   
            </SidebarMenuButton>
        </SidebarMenuItem>)
        : null;
    });

    // Don't render component if we don't have permissions to see anything in this group
    return items.some((item) => item !== null) ? (
            <SidebarGroup>
                    <SidebarGroupLabel>{name}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {...items}
                        </SidebarMenu>
                    </SidebarGroupContent>
        </SidebarGroup>
        ) : null;
}

export async function AppSidebar() {
    const cookie = (await cookies()).get('session')?.value;
    const session: SessionPayload = await decrypt(cookie) as SessionPayload;
    const permissions: UserPermissions[] = session?.permissions ?? [];

    return (
        <Sidebar>
            <SidebarHeader></SidebarHeader>
            <SidebarContent >
                <SidebarGroupWrapper name="General" menus={general} permissions={permissions} />
                <SidebarGroupWrapper name="Server Management" menus={serverManagement} permissions={permissions} />
            </SidebarContent>
            <SidebarFooter>
                <div className="mb-3">
                    <User username={session?.username} permissions={permissions} />
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}

