import { Badge } from "@/components/ui/badge";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Component from "./submissions";
import Link from "next/link";


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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Fragment } from "react";

const submissions = [
        { id: "hanika", problem: "Hanika", status: "Accepted", time: "2 hours ago", difficulty: "Invitational A" },
        { id: "anisha", problem: "Anisha", status: "Accepted", time: "4 hours ago", difficulty: "Invitational B" },
        { id: 3, problem: "Binary Tree Traversal", status: "Wrong Answer", time: "6 hours ago", difficulty: "District" },
        { id: 4, problem: "Merge Sort", status: "Runtime Error", time: "1 day ago", difficulty: "Region" },
        { id: 5, problem: "Dynamic Programming", status: "Time Limit", time: "2 days ago", difficulty: "State" }
    ];

function RecentSubmissionsCard({ title, description, submissions})z         
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
        <Card className="flex-1 min-w-0 flex flex-col">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4" >
                    {submissions.map((submission) => (
                        <div key={submission.id} className="flex items-center">
                            <div className="flex items-center space-x-4 flex-1">
                                <div className="space-y-1">
                                    <Link href={`/editor/?id=${submission.id}`} className="text-sm font-semibold hover:underline">{submission.problem}</Link>
                                    <p className={`text-xs ${getDifficultyColor(submission.difficulty)}`}>
                                        {submission.difficulty}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-10 justify-end ">
                               <div className="flex justify-end">{
                                <Dialog>
                                    <DialogTrigger className="hover:cursor-pointer" asChild>
                                            {getStatusBadge(submission.status)}
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Edit profile</DialogTitle>
                                        <DialogDescription>
                                        Make changes to your profile here. Click save when you&apos;re
                                        done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4">
                                        <div className="grid gap-3">
                                        <Label htmlFor="name-1">Name</Label>
                                        <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                                        </div>
                                        <div className="grid gap-3">
                                        <Label htmlFor="username-1">Username</Label>
                                        <Input id="username-1" name="username" defaultValue="@peduarte" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit">Save changes</Button>
                                    </DialogFooter>
                                    </DialogContent>
                                    </Dialog>
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
        <div>
            <div className="flex-1 flex flex-row space-x-6 p-4 md:p-8 pt-6 items-stretch">
                <RecentSubmissionsCard title="Your Recent Submissions" description="Your recently submitted problems." submissions={submissions} />
                <div className="w-80 flex-shrink-0">
                    <Component />
                </div>
            </div>
            <div className="flex-1 flex flex-col space-y-6 p-4 md:p-8 pt-6">
                <RecentSubmissionsCard title="Site Recent Submissions" description="Site recently submitted problems." submissions={submissions} />
            </div>
        </div>
            
        
    )
}