import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

import { verifySession } from "@/lib/dal"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import Component from "@/components/dashboard/submissions";
import QuickLaunch from "@/components/dashboard/quickLaunch";

// Only top 5 recent submissions
const submissions = [
    { id: "hanika", problem: "Hanika", status: "Accepted", time: "2 hours ago", difficulty: "District", year: 2023 },
    { id: "anisha", problem: "Anisha", status: "Accepted", time: "4 hours ago", difficulty: "Invitational B", year: 2024 },
    { id: "elena", problem: "Elena", status: "Wrong Answer", time: "6 hours ago", difficulty: "Region", year: 2022 },
    { id: "marcus", problem: "Marcus", status: "Runtime Error", time: "1 day ago", difficulty: "State", year: 2021 },
    { id: "sophia", problem: "Sophia", status: "Compilation Error", time: "2 days ago", difficulty: "District", year: 2024 }
];

function RecentSubmissionsCard({ title, description, submissions}) {
    const getStatusBadge = (status) => {
        const variants = {
            "Accepted": "default",
            "Wrong Answer": "destructive", 
            "Time Limit": "secondary",
            "Runtime Error": "destructive",
            "Compilation Error": "destructive"
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
        <Card className="flex-1 min-w-0 flex flex-col">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {submissions.map((submission) => (
                        <div key={submission.id} className="flex items-center">
                            <div className="flex items-center space-x-4 flex-1">
                                <div className="space-y-1">
                                    <Link href={`/editor/?id=${submission.id}`} className="text-sm font-semibold hover:underline">
                                        {submission.problem}
                                    </Link>
                                    <p className={`text-xs ${getDifficultyColor(submission.difficulty)}`}>
                                        {submission.difficulty}, {submission.year}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-10 justify-end">
                                <div className="flex justify-end">
                                    <Dialog>
                                        <DialogTrigger className="hover:cursor-pointer" asChild>
                                            {getStatusBadge(submission.status)}
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Submission Details</DialogTitle>
                                                <DialogDescription>
                                                    View details about this submission.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label>Problem</Label>
                                                    <div className="text-sm font-medium">{submission.problem}</div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Competition</Label>
                                                    <div className="text-sm">{submission.difficulty}, {submission.year}</div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Status</Label>
                                                    <div className="text-sm">{getStatusBadge(submission.status)}</div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Submitted</Label>
                                                    <div className="text-sm text-muted-foreground">{submission.time}</div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Close</Button>
                                                </DialogClose>
                                                <Button asChild>
                                                    <Link href={`/editor/?id=${submission.id}`}>
                                                        Open in Editor
                                                    </Link>
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
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

function GlobalSubmissionsCard({ title, description, submissions}) {
    const getStatusBadge = (status) => {
        const variants = {
            "Accepted": "default",
            "Wrong Answer": "destructive", 
            "Time Limit": "secondary",
            "Runtime Error": "destructive",
            "Compilation Error": "destructive"
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

    const users = ["absceptual", "codemaster", "algoking", "debugger42", "syntaxhero"];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 ">
                    {submissions.map((submission, index) => (
                        <div key={submission.id} className="flex items-center">
                            <div className="flex items-center space-x-4 flex-1 ">
                                {/* Fixed width for username to align submissions */}
                                <div className="w-20">
                                    <span className="text-muted-foreground text-sm">
                                        {users[index % users.length]}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <Link href={`/editor/?id=${submission.id}`} className="text-sm font-semibold hover:underline">
                                        {submission.problem}
                                    </Link>
                                    <p className={`text-xs ${getDifficultyColor(submission.difficulty)}`}>
                                        {submission.difficulty}, {submission.year}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-10 justify-end">
                                <div className="flex justify-end">
                                    <Dialog>
                                        <DialogTrigger className="hover:cursor-pointer" asChild>
                                            {getStatusBadge(submission.status)}
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Submission Details</DialogTitle>
                                                <DialogDescription>
                                                    View details about this submission.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label>Problem</Label>
                                                    <div className="text-sm font-medium">{submission.problem}</div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Competition</Label>
                                                    <div className="text-sm">{submission.difficulty}, {submission.year}</div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Status</Label>
                                                    <div className="text-sm">{getStatusBadge(submission.status)}</div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Submitted</Label>
                                                    <div className="text-sm text-muted-foreground">{submission.time}</div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
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
    const session = await verifySession();

    return (
        <div className="grid grid-rows-[auto_1fr] min-h-screen">
            <div className="w-screen px-4 md:px-8 py-6">
                <QuickLaunch />
            </div>
            {/* Top section with constrained width */}
            <div className="grid grid-cols-4 gap-6 p-4 md:p-8 pt-6">
                <div className="col-span-3">
                    <RecentSubmissionsCard title="Your Recent Submissions" description="Your recently submitted problems." submissions={submissions} />
                </div>
                <div className="col-span-1"><Component /></div>
            </div>
            {/* Bottom section full width */}
            <div className="w-screen grid grid-cols-4 py-6 items-stretch">
                <div className="col-span-2 px-2 md:px-8">
                    <GlobalSubmissionsCard title="Site Recent Submissions" description="Site recently submitted problems." submissions={submissions} />
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