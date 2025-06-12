import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifySession } from "@/lib/dal"
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import Component from "@/components/dashboard/submissions-chart";
import QuickLaunch from "@/components/dashboard/quickLaunch";
import { SubmissionsCard } from "@/components/dashboard/submissions-card";

const submissions = [
    { id: "hanika", problem: "Hanika", status: "Accepted", time: "2 hours ago", difficulty: "District", year: 2023, user: "absceptual" },
    { id: "anisha", problem: "Anisha", status: "Accepted", time: "4 hours ago", difficulty: "Invitational B", year: 2024, user: "allievo_429" },
    { id: "elena", problem: "Elena", status: "Wrong Answer", time: "6 hours ago", difficulty: "Region", year: 2022, user: "mind_numbing" },
    { id: "marcus", problem: "Marcus", status: "Runtime Error", time: "1 day ago", difficulty: "State", year: 2021, user: "myaltaccountsthis" },
    { id: "sophia", problem: "Sophia", status: "Compilation Error", time: "2 days ago", difficulty: "District", year: 2024, user: "yoyoy" }
];

export default async function Dashboard() {
    const session = await verifySession();

    return (
        <div className="grid grid-rows-[auto_1fr] min-h-screen">
            <div className="w-screen px-4 md:px-8 py-6">
                <QuickLaunch />
            </div>
            {/* Top section with constrained width */}
            <div className="grid grid-cols-4 gap-6 p-4 md:p-8 pt-6">
                <div className="col-span-3">
                    <SubmissionsCard title="Your Recent Submissions" description="Your recently submitted problems." submissions={submissions} showUser={false} />
                </div>
                <div className="col-span-1"><Component /></div>
            </div>
            {/* Bottom section full width */}
            <div className="w-screen grid grid-cols-4 py-6 items-stretch">
                <div className="col-span-2 px-2 md:px-8">
                    <SubmissionsCard title="Site Recent Submissions" description="Site recently submitted problems." submissions={submissions} />
                </div>

                <div className="col-span-2 px-4 md:px-8">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="flex-shrink-0">
                            <CardTitle>Global Leaderboard</CardTitle>
                            <CardDescription>
                                View the top ranking users on the site.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <Rank name={session?.username} rank={7} isCurrentUser={true} />
                            <Separator className="my-4" />
                            <div className="space-y-2">
                                <Rank name="absceptual" rank={1} />
                                <Rank name="allievo_429" rank={2} />
                                <Rank name="mind_numbing" rank={3} />
                                <Rank name="myaltaccountsthis" rank={4} />
                                <Rank name="walrusramen" rank={5} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function Rank({ name, rank, isCurrentUser = false }) {
    const getRankStyle = (rank) => {
        if (rank === 1) return "text-yellow-600 font-bold";
        if (rank === 2) return "text-gray-500 font-semibold";
        if (rank === 3) return "text-amber-600 font-semibold";
        return "text-muted-foreground";
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return `#${rank}`;
    };

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors ${
            isCurrentUser ? 'bg-primary/5 border border-primary/20' : ''
        }`}>
            <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    rank <= 3 ? 'bg-primary/10' : 'bg-muted'
                }`}>
                    <span className={`text-sm ${getRankStyle(rank)}`}>
                        {getRankIcon(rank)}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                            {name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className={`text-sm font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                        {name} {isCurrentUser && <Badge variant="secondary" className="ml-1">You</Badge>}
                    </span>
                </div>
            </div>
        </div>
    );
}