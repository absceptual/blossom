
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';

export default async function Layout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <main className="w-full">
                {children}
            </main>
        </SidebarProvider>
    )
}