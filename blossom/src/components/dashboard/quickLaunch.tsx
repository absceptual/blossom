'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusIcon, PlayIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import Link from "next/link"
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Realistic UIL problem names (first names) with years - removed practice/other entries
const startedProblems = [
  { id: "hanika", name: "Hanika", difficulty: "District", year: 2023, lastWorked: "2 hours ago" },
  { id: "anisha", name: "Anisha", difficulty: "Invitational B", year: 2024, lastWorked: "1 day ago" },
  { id: "elena", name: "Elena", difficulty: "Region", year: 2022, lastWorked: "3 days ago" },
  { id: "marcus", name: "Marcus", difficulty: "State", year: 2021, lastWorked: "1 week ago" },
  { id: "sophia", name: "Sophia", difficulty: "District", year: 2024, lastWorked: "2 weeks ago" },
  { id: "david", name: "David", difficulty: "Invitational A", year: 2023, lastWorked: "3 weeks ago" },
  { id: "maya", name: "Maya", difficulty: "Region", year: 2020, lastWorked: "1 month ago" },
  { id: "carlos", name: "Carlos", difficulty: "District", year: 2022, lastWorked: "1 month ago" },
  { id: "luna", name: "Luna", difficulty: "State", year: 2019, lastWorked: "2 months ago" },
  { id: "felix", name: "Felix", difficulty: "Invitational B", year: 2024, lastWorked: "2 months ago" },
  { id: "iris", name: "Iris", difficulty: "Region", year: 2021, lastWorked: "3 months ago" },
  { id: "oscar", name: "Oscar", difficulty: "Invitational A", year: 2023, lastWorked: "3 months ago" },
];

export default function QuickLaunch() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProblemName, setNewProblemName] = useState("");
  const [newProblemDifficulty, setNewProblemDifficulty] = useState("");
  const [newProblemYear, setNewProblemYear] = useState("");

  const getDifficultyColor = (difficulty) => {
    const colors = {
      "Invitational A": "text-neutral-700 bg-neutral-100",
      "Invitational B": "text-[#e7a2c2] bg-pink-50",
      "District": "text-[#ea78ab] bg-pink-100",
      "Region": "text-[#e45093] bg-pink-200",
      "State": "text-[#e42079] bg-pink-300",
    };
    return colors[difficulty] || "text-gray-600 bg-gray-100";
  };

  const handleCreateProblem = () => {
    console.log("Creating problem:", { 
      name: newProblemName, 
      difficulty: newProblemDifficulty,
      year: newProblemYear 
    });
    
    setNewProblemName("");
    setNewProblemDifficulty("");
    setNewProblemYear("");
    setIsCreateDialogOpen(false);
  };

  // Generate year options (UIL has been around since the 1960s, but computer science started later)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PlayIcon className="h-5 w-5" />
              Quick Launch
            </CardTitle>
            <CardDescription>
              Continue working on UIL Computer Science problems or start a new one.
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <PlusIcon className="h-4 w-4" />
                New Problem
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New UIL Problem</DialogTitle>
                <DialogDescription>
                  Start working on a new UIL Computer Science problem. Choose a name, difficulty level, and year.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="problem-name">Problem Name</Label>
                  <Input
                    id="problem-name"
                    placeholder="Enter problem name (e.g., Sarah, Michael)..."
                    value={newProblemName}
                    onChange={(e) => setNewProblemName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Competition Level</Label>
                  <select
                    id="difficulty"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newProblemDifficulty}
                    onChange={(e) => setNewProblemDifficulty(e.target.value)}
                  >
                    <option value="">Select difficulty...</option>
                    <option value="Invitational A">Invitational A</option>
                    <option value="Invitational B">Invitational B</option>
                    <option value="District">District</option>
                    <option value="Region">Region</option>
                    <option value="State">State</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="year">UIL Year</Label>
                  <select
                    id="year"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newProblemYear}
                    onChange={(e) => setNewProblemYear(e.target.value)}
                  >
                    <option value="">Select year...</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProblem}
                  disabled={!newProblemName || !newProblemDifficulty || !newProblemYear}
                >
                  Create & Start
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {startedProblems.length > 0 ? (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {startedProblems.map((problem) => (
                <Link key={problem.id} href={`/editor?id=${problem.id}`}>
                  <div className="group flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {problem.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getDifficultyColor(problem.difficulty)}`}
                          >
                            {problem.difficulty}, {problem.year}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {problem.lastWorked}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <PlayIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">No UIL problems started yet</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Create Your First Problem
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}