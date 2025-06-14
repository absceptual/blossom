import { Dialog, DialogTrigger, DialogHeader, DialogFooter, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getProblem } from "@/actions/problems";
import { Submission } from "@/types/submission";
import { CompetitionLevelColors, SubmissionStatusBadgeVariants } from "@/types/dashboard";



export async function SubmissionsCard({ title, description, submissions, username, showUser }) {
    const problems = await Promise.all(submissions.map(async (submission: Submission) => await getProblem(submission.problem_id)));

    return (
        <Card className="h-full flex-1 min-w-0 flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {submissions.map((submission: Submission, index) => {
                        const problem = problems[index];
                        const submissionDate = typeof submission.date === 'string' ? 
                            new Date(submission.date) : submission.date;

                        return ( 
                        <div key={index} className="flex items-center">
                            <div className="flex items-center space-x-4 flex-1">
                                {showUser && 
                                    <div className="w-25">
                                        <span className="text-sm text-muted-foreground">
                                            {submission.username}
                                        </span>
                                    </div>
                                }
                                <div className="space-y-1">
                                    <Link href={`/editor/?id=${submission.problem_id}`} className="text-sm font-semibold hover:underline">
                                        {problem.problem_name}
                                    </Link>
                                    <p className={`text-xs ${getDifficultyColor(problem.competition_level)}`}>
                                        {problem.competition_level}, {problem.problem_year}
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
                                            <SubmissionDetailsCard submission={submission} problem={problem} /> 
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Close</Button>
                                                </DialogClose>
                                                { submission.username === username && 
                                                    <Button asChild>
                                                        <Link href={`/editor/?id=${submission.problem_id}`}>
                                                            Open in Editor
                                                        </Link>
                                                    </Button>
                                                }
                                            </DialogFooter>                                      
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="w-25 text-xs text-muted-foreground">
                                    {formatTimeAgo(submissionDate)}
                                </div>
                            </div>
                        </div>
                        );
                })}
                </div>
            </CardContent>
        </Card>
    );
}


export function SubmissionDetailsCard({ submission, problem, showUser = true }) {
    const submissionDate = typeof submission.date === 'string' ? 
        new Date(submission.date) : submission.date;

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(submissionDate);

    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label>Problem</Label>
                <div className="text-sm font-medium">{problem.problem_name}</div>
            </div>
            <div className="grid gap-2">
                <Label>Competition</Label>
                <div className="text-sm">{problem.competition_level}, {problem.problem_year}</div>
            </div>
            <div className="grid gap-2">
                <Label>Status</Label>
                <div className="text-sm">{getStatusBadge(submission.status)}</div>
            </div>
            <div className="grid gap-2">
                <Label>Submitted</Label>
                <div className="text-sm text-muted-foreground">{formattedDate}</div>
            </div>
            {showUser && 
                <div className="grid gap-2">
                    <Label>Submitted By</Label>
                    <div className="text-sm text-muted-foreground">
                        {submission.username}
                    </div>
                </div>
            }
        </div>
    )
}

export function formatTimeAgo(dateStr: string | Date): string {
    // Parse the date string as UTC (which is how it's stored in the database)
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const now = new Date();

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
}


export function getStatusBadge(status) {
    const properties = SubmissionStatusBadgeVariants[status];
    return <Badge {...properties}>{status}</Badge>;
};

export function getDifficultyColor(difficulty) {
    return CompetitionLevelColors[difficulty];
};
