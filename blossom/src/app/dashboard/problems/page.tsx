


import { columns } from '@/components/dashboard/problems/columns';
import { ProblemTable } from '@/components/dashboard/problems/problem-table';
import { getAvailableProblems } from '@/actions/problems';
import { verifySession } from '@/lib/dal';

export default async function ProblemManagement() {
    const [data, session] = await Promise.all([
        getAvailableProblems(),
        verifySession(),
    ]);

    return (
        <div className="flex items-center justify-between px-4 md:px-8 py-6">
            <div className="container mx-auto py-10 w-screen">
                <ProblemTable columns={columns} data={data} permissions={session.permissions} />
            </div>
        </div>
    )
}