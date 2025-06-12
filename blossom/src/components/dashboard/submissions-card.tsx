import { Dialog, DialogTrigger, DialogHeader, DialogFooter, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { verifySession } from "@/lib/dal";


const variants = {
    "Accepted": {
        variant: "outline",
        className: "bg-green-400 text-white"
    },
    "Wrong Answer": {
        variant: "destructive",
    },
    "Time Limit": {
        variant: "secondary",
        className: "bg-yellow-200 text-yellow-800"
    },
    "Runtime Error": {
        variant: "destructive",
    },
    "Compilation Error": {
        variant: "destructive",
    }
};

const colors = {
    "Invitational A": "text-neutral-700",
    "Invitational B": "text-[#e7a2c2]",
    "District": "text-[#ea78ab]",
    "Region": "text-[#e45093]",
    "State": "text-[#e42079]",
    "Other": "text-neutral-700",
};

const getStatusBadge = (status) => {
        const properties = variants[status];
        return <Badge {...properties}>{status}</Badge>;
};

const getDifficultyColor = (difficulty) => {
    return colors[difficulty] || "text-gray-600";
};

// const users = ["absceptual", "allievo_429", "mind_numbing", "myaltaccountsthis", "walrusramen"];

export function SubmissionDetailsCard({ submission }) {
    return (
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
            <div className="grid gap-2">
                <Label>Submitted By</Label>
                <div className="text-sm text-muted-foreground">
                    {submission.user}
                </div>
            </div>
        </div>
    )
}
export async function SubmissionsCard({ title, description, submissions, showUser = true }) {
    const session = await verifySession();
    if (!session) return null;

    const username = session?.username;
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
                                {showUser && 
                                    <div className="w-30">
                                        <span className="text-sm text-muted-foreground">
                                            {submission.user}
                                        </span>
                                    </div>
                                }
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
                                            <SubmissionDetailsCard submission={submission} /> 
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Close</Button>
                                                </DialogClose>
                                                { submission.user === username && 
                                                    <Button asChild>
                                                        <Link href={`/editor/?id=${submission.id}`}>
                                                            Open in Editor
                                                        </Link>
                                                    </Button>
                                                }
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
