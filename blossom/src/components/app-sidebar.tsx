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


const general = [
    {
        label: 'Home',
        icon: HomeIcon,
        url: '#',
        permissions: [] as UserPermissions[]
    },
    {
        label: 'Leaderboard',
        icon: ChartBarIcon,
        url: '#',
        permissions: [] as UserPermissions[]
    },
    {
        label: 'Problems',
        icon: CodeBracketIcon,
        url: '#',
        permissions: [] as UserPermissions[],
    },
    {
        label: 'Editor',
        icon: CodeBracketSquareIcon,
        url: 'editor',
        permissions: [] as UserPermissions[],
    },
    {
        label: 'Settings',
        icon: Cog6ToothIcon,
        url: '#',
        permissions: [] as UserPermissions[],
    },
]

const serverManagement = [
    {
        label: 'Judge0',
        icon: ServerStackIcon,
        url: '#',
        permissions: [] as UserPermissions[]
    },
    {
        label: 'Users',
        icon: UserGroupIcon,
        url: '#',
        permissions: [] as UserPermissions[]
    },
    {
        label: 'Problems',
        icon: ClipboardIcon,
        url: '#',
        permissions: [] as UserPermissions[],
    },
]



import { 
    HomeIcon, 
    ChartBarIcon, 
    CodeBracketIcon, 
    Cog6ToothIcon, 
    ServerStackIcon,
    UserGroupIcon,
    ClipboardIcon,
    CodeBracketSquareIcon,
} from "@heroicons/react/24/outline";
import { cookies } from 'next/headers';
import { decrypt } from '@/app/lib/session';
import { hasPermission } from '@/app/lib/util';
import { SessionPayload, UserPermissions } from '@/app/lib/definitions';

import User from '@/components/user';


function SidebarGroupWrapper({ name, menus, permissions }) {
    return (
        <SidebarGroup>
                    <SidebarGroupLabel>{name}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menus.map((item) => {
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
                        })}
                        </SidebarMenu>
                    </SidebarGroupContent>
        </SidebarGroup>
    )
}


export async function AppSidebar() {
    
    const cookie = (await cookies()).get('session')?.value;
    const session: SessionPayload = await decrypt(cookie) as SessionPayload;

    const permissions: UserPermissions[] = session?.permissions ?? [];

    return (
        <Sidebar>
            <SidebarHeader>
                <span className="flex items-center justify-center scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight">
                    blossom
                </span>
            </SidebarHeader>
            <SidebarContent >
                <SidebarGroupWrapper name="General" menus={general} permissions={permissions} />
                <SidebarGroupWrapper name="Server Management" menus={serverManagement} permissions={permissions} />
            </SidebarContent>
            <SidebarFooter>
                <User username={session?.username} permissions={permissions} />
            </SidebarFooter>
        </Sidebar>
    )
}

