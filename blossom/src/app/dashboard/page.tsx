import { verifySession } from "@/lib/dal"

import Component from "@/components/dashboard/submissions-chart";
import QuickLaunch from "@/components/dashboard/launch-card";
import { SubmissionsCard } from "@/components/dashboard/submissions-card";
import { getGlobalRecentSubmissions, getLeaderboardData, getRecentSubmissionsByUser } from "@/actions/problems";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { RankProfile } from "@/types/dashboard";


export default async function Dashboard() {
    const session = await verifySession();
    

    const leaderboardData = await getLeaderboardData(session?.username as string) 
    const currentUserData: RankProfile = leaderboardData?.currentUser;
    const topUsers: RankProfile[] = leaderboardData?.topUsers;

    return (
        <div className="grid grid-rows-[auto_1fr] min-h-screen overflow-hidden">
            <div className="w-full px-4 md:px-8 py-6">
                <QuickLaunch username={session?.username as string} />
            </div>
            {/* Top section with constrained width */}
            <div className="grid grid-cols-4 gap-6 p-4 md:p-8 pt-6">
                <div className="col-span-3">
                    <SubmissionsCard title="Your Recent Submissions" description="Your recently submitted problems." username={session?.username} submissions={await getRecentSubmissionsByUser(session?.username as string, 5)} showUser={false} />
                </div>
                <div className="col-span-1"><Component username={session?.username as string} /></div>
            </div>
            {/* Bottom section full width */}
            <div className="w-full grid grid-cols-4 py-6 items-stretch">
                <div className="col-span-2 px-2 md:px-8">
                    <SubmissionsCard title="Site Recent Submissions" description="Site recently submitted problems." username={session?.username}  submissions={await getGlobalRecentSubmissions(7)} showUser={true} />
                </div>

                <div className="col-span-2 px-4 md:px-8">
                    <Leaderboard currentUser={currentUserData} topUsers={topUsers} />
                </div>
            </div>
        </div>
    )
}

