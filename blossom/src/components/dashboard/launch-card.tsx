// review chatgpt code

'use client';
'use strict';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, PlayIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as React from "react";
import { Combobox } from "../ui/combobox";
import { redirect } from "next/navigation";
import { getAvailableProblems, getUserStartedProblems } from "@/actions/problems";
import { formatTimeAgo } from "./submissions-card";
import { Problem, FetchedProblem } from "@/types/submission";


export default function LaunchCard({ username }: { username: string }) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [startedProblems, setStartedProblems] = useState<FetchedProblem[]>([]);
  const [availableProblems, setAvailableProblems] = useState([]);

  useEffect(() => {
    const fetchStartedProblems = async () => {
      getUserStartedProblems(username)
        .then(setStartedProblems);
    };
    const fetchAvailableProblems = async () => {
      const result = await getAvailableProblems();
      setAvailableProblems(result as unknown as Problem[]);
    }
    fetchStartedProblems();
    fetchAvailableProblems();
  }, [username]);

  const handleNewProblem = async (problemId: string) => {
    redirect(`/editor?id=${problemId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      "Invitational A": "text-neutral-700 bg-neutral-100",
      "Invitational B": "text-[#e7a2c2] bg-pink-50",
      "District": "text-[#ea78ab] bg-pink-100",
      "Region": "text-[#e45093] bg-pink-200",
      "State": "text-[#e42079] bg-pink-300",
      "Other": "text-gray-600 bg-gray-100",
    };
    return colors[difficulty];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PlayIcon className="h-5 w-5" />
              Quick Launch
            </CardTitle>
            <CardDescription className="mt-1">
              Continue working on UIL Computer Science problems or start a new one.
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            New Problem
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {startedProblems.length > 0 ? 
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {startedProblems.map((problem: FetchedProblem, index) => {
                
                return ( <Link key={index} href={`/editor?id=${problem.problem_id}`}>
                  <div className="group flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {problem.problem_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getDifficultyColor(problem.competition_level)}`}
                          >
                            {problem.competition_level}, {problem.problem_year}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {formatTimeAgo(problem.last_worked)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )})}
            </div>
          </ScrollArea>
         :
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
        }
      </CardContent>
      <NewProblemDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onComplete={handleNewProblem}
        problems={availableProblems}
      />
    </Card>
  );
}

export function NewProblemDialog({ 
  open, 
  onOpenChange,
  onComplete,
  problems,
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  onComplete: (problemId: string) => void,
  problems: Problem[]
}) {
  const [level, setLevel] = React.useState("")
  const [year, setYear] = React.useState("") // Change from number to string
  const [problem, setProblem] = React.useState("")
  const [filteredProblems, setFilteredProblems] = React.useState<{ value: string; label: string; }[]>([]);
  const [availableYears, setAvailableYears] = React.useState<{ value: string; label: string; }[]>([]); // Change value type to string
  const [availableLevels, setAvailableLevels] = React.useState<{ value: string; label: string; }[]>([]);

  // Reset problem when level changes
  useEffect(() => {
    setProblem("");
  }, [level]);

  // Reset problem when year changes
  useEffect(() => {
    setProblem("");
  }, [year]);

  // Update available problems whenever the dialog opens or problems data changes
  useEffect(() => {
    if (!open || !problems) {
      setFilteredProblems([]);
      setAvailableLevels([]);
      setAvailableYears([]);
      return;
    }

    // Show all problems initially
    const allProblems = problems.map((problem: Problem) => ({
      value: problem.problem_id,
      label: problem.problem_name
    }));
    setFilteredProblems(allProblems);

    // Get all unique years from problems - convert to strings
    const years = [...new Set(problems.map(p => p.problem_year))]
      .sort((a, b) => b - a)
      .map(year => ({
        value: year.toString(), // Convert to string
        label: year.toString()
      }));
    setAvailableYears(years);

    // Get all unique competition levels from problems
    const levels = [...new Set(problems.map(p => p.competition_level))]
      .sort() // Sort alphabetically
      .map(level => ({
        value: level,
        label: level
      }));
    setAvailableLevels(levels);
  }, [open, problems]);

  // Filter problems when level or year changes
  useEffect(() => {
    if (!problems) return;

    let filtered = problems;

    if (level) {
      filtered = filtered.filter(p => p.competition_level === level);
    }

    if (year) {
      // Convert year string back to number for comparison
      filtered = filtered.filter(p => p.problem_year === parseInt(year));
    }
    
    setFilteredProblems(filtered.map((problem: Problem) => ({
      value: problem.problem_id,
      label: problem.problem_name
    })));
  }, [problems, level, year]);

  const handleCreateProblem = () => {
    onComplete(problem);
    onOpenChange(false);
    setLevel("");
    setYear(""); // Reset to empty string
    setProblem("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start a new UIL Problem</DialogTitle>
          <DialogDescription>
            Choose a competition level, year, and problem name to begin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="problem-name">Problem Name</Label>
            <Combobox 
              disabled={false}
              value={problem} 
              setValue={setProblem} 
              searchPlaceholder="Search problem name..." 
              selectPlaceholder="Select problem name..." 
              emptyPlaceholder="No problems found" 
              options={filteredProblems} 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="competiton-level">Filter by Competition Level</Label>
            <Combobox 
              disabled={false} 
              value={level} 
              setValue={setLevel} 
              searchPlaceholder="Search competition level..." 
              selectPlaceholder="Select competition level..." 
              emptyPlaceholder="No competition levels found" 
              options={availableLevels} 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="year">Filter by Year</Label>
            <Combobox 
              disabled={false}
              value={year} 
              setValue={setYear} 
              searchPlaceholder="Search year..." 
              selectPlaceholder="Select year..." 
              emptyPlaceholder="No years found" 
              options={availableYears} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateProblem}
            disabled={!problem}
          >
            Start
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}