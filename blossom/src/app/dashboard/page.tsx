import { Badge } from "@/components/ui/badge";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


function RecentSubmissionsCard() {
    const submissions = [
        { id: 1, problem: "Two Sum", status: "Accepted", time: "2 hours ago", difficulty: "Invitational A" },
        { id: 2, problem: "Valid Parentheses", status: "Accepted", time: "4 hours ago", difficulty: "Invitational B" },
        { id: 3, problem: "Binary Tree Traversal", status: "Wrong Answer", time: "6 hours ago", difficulty: "District" },
        { id: 4, problem: "Merge Sort", status: "Runtime Error", time: "1 day ago", difficulty: "Region" },
        { id: 5, problem: "Dynamic Programming", status: "Time Limit", time: "2 days ago", difficulty: "State" }
    ];

    const getStatusBadge = (status) => {
        const variants = {
            "Accepted": "default",
            "Wrong Answer": "destructive", 
            "Time Limit": "secondary",
            "Runtime Error": "destructive"
        };
        return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            "Invitational A": "text-neutral-700",
            "Invitational B": "text-[#e7a2c2]",
            "District": "text-[#ea78ab]",
            "Region": "text-[#e45093]",
            "State": "text-[#e42079]",
            "Other": "text-neutral-700",
        };
        return colors[difficulty] || "text-gray-600";
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>
                    Your latest problem solving attempts
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4" >
                    {submissions.map((submission) => (
                        <div key={submission.id} className="flex items-center">
                            <div className="flex items-center space-x-4 flex-1">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {submission.problem}
                                    </p>
                                    <p className={`text-xs ${getDifficultyColor(submission.difficulty)}`}>
                                        {submission.difficulty}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-10 min-w-[200px] justify-end ">
                               <div className="min-w-[100px] flex justify-end">{
                                getStatusBadge(submission.status)
                               }
                               </div>
                                <div className="w-20 text-xs text-muted-foreground">
                                    {submission.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default async function Dashboard() {
    // const session = await verifySession();
    

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <RecentSubmissionsCard />
        </div>
    )
}