


import { columns } from '@/components/dashboard/problems/columns';
import { ProblemTable } from '@/components/dashboard/problems/problem-table';
import { getAvailableProblems } from '@/actions/problems';

export default async function ProblemManagement() {
    const data = await getAvailableProblems();

    return (
        <div className="flex items-center justify-between px-4 md:px-8 py-6">
            <div className="container mx-auto py-10 w-screen">
                <ProblemTable columns={columns} data={data} />
            </div>
        </div>
    )
}