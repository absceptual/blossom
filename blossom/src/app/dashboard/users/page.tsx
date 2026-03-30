import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTable } from "@/components/dashboard/users/user-table";
import { userColumns } from "@/components/dashboard/users/user-columns";
import { AccessCodeTable } from "@/components/dashboard/users/access-code-table";
import { accessCodeColumns } from "@/components/dashboard/users/access-code-columns";
import { getAllUsers, getAllAccessCodes } from "@/actions/users";

export default async function UserManagement() {
    const [users, accessCodes] = await Promise.all([
        getAllUsers(),
        getAllAccessCodes(),
    ]);

    return (
        <div className="flex items-center justify-between px-4 md:px-8 py-6">
            <div className="container mx-auto py-10 w-screen">
                <Tabs defaultValue="users">
                    <TabsList>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="access-codes">Access Codes</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users">
                        <UserTable columns={userColumns} data={users} />
                    </TabsContent>
                    <TabsContent value="access-codes">
                        <AccessCodeTable columns={accessCodeColumns} data={accessCodes} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
