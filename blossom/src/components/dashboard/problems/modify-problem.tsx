 /* eslint-disable */
"use client";
'use strict';
import { useForm } from "react-hook-form";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Combobox } from "@/components/ui/combobox";
import { object, string, array, InferType } from 'yup';
import { yupResolver } from "@hookform/resolvers/yup"
import { getExistingProblemFiles, getProblem, createProblem, updateProblem, downloadProblemFile } from "@/actions/problems";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { number } from 'yup';

const programmingTags = [
    // Data Structures
    "Arrays", "Strings", "Linked Lists", "Stacks", "Queues", "Trees", "Binary Trees",
    "Heaps", "Hash Tables", "Graphs", "Sets", "Maps",
];


const problemSchema = object({
    id: string(),
    name: string(),
    level: string(),
    year: number().typeError("Year must be a number").integer(),
    tags: array().of(string()).default([]),
    sampleInput: array().default([]),
    sampleOutput: array().default([]),
    judgeInput: array().default([]),
    judgeOutput: array().default([]),
    statement: array().default([]),
})

type ProblemFormValues = {
    id: string;
    name: string;
    level: string;
    year: number;
    tags: string[];
    sampleInput: File[];
    sampleOutput: File[];
    judgeInput: File[];
    judgeOutput: File[];
    statement: File[];
};

export function ModifyProblemDialog({ title, description, problemId, trigger }: {
    title: string;
    description: string;
    problemId?: string;
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : <Button variant="default"><PlusIcon />Create Problem</Button> }
            </DialogTrigger>
            <DialogContent style={{ width: '90vw', maxWidth: 'none' }} className="max-w-none max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                    {description}
                </DialogDescription>
            </DialogHeader>
                <ModifyProblem problemId={problemId} onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

async function triggerDownload(problemId: string, fileType: 'sampleDat' | 'sampleOut' | 'judgeDat' | 'judgeOut' | 'statement') {
    const result = await downloadProblemFile(problemId, fileType);
    if (!result) return;

    const byteArray = Uint8Array.from(atob(result.data), c => c.charCodeAt(0));
    const blob = new Blob([byteArray], { type: result.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.name;
    a.click();
    URL.revokeObjectURL(url);
}

function DownloadButton({ problemId, fileType, label }: { problemId: string; fileType: 'sampleDat' | 'sampleOut' | 'judgeDat' | 'judgeOut' | 'statement'; label: string }) {
    const [loading, setLoading] = useState(false);
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={async () => {
                setLoading(true);
                await triggerDownload(problemId, fileType);
                setLoading(false);
            }}
        >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            {loading ? "Downloading..." : label}
        </Button>
    );
}

export function ModifyProblem({
    problemId,
    onSuccess,
}: {
    problemId?: string;
    onSuccess?: () => void;
}) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [existingFiles, setExistingFiles] = useState<{
        hasSampleDat: boolean;
        hasSampleOut: boolean;
        hasJudgeDat: boolean;
        hasJudgeOut: boolean;
        hasStatement: boolean;
    }>({ hasSampleDat: false, hasSampleOut: false, hasJudgeDat: false, hasJudgeOut: false, hasStatement: false });

    const form = useForm<ProblemFormValues>({
        resolver: yupResolver(problemSchema),
        defaultValues: {
            id: "",
            name: "",
            level: "",
            year: new Date().getFullYear(),
            tags: [],
            sampleInput: [],
            sampleOutput: [],
            judgeInput: [],
            judgeOutput: [],
            statement: [],
        },
    });

    useEffect(() => {
        if (problemId) {
            Promise.all([
                getProblem(problemId),
                getExistingProblemFiles(problemId)
            ]).then(async ([problem, files]) => {
                const sampleInput: File[] = [];
                const sampleOutput: File[] = [];
                const judgeInput: File[] = [];
                const judgeOutput: File[] = [];

                if (files) {
                    setExistingFiles({
                        hasSampleDat: files.sampleFiles.some(f => f.name.endsWith('.dat')),
                        hasSampleOut: files.sampleFiles.some(f => f.name.endsWith('.out')),
                        hasJudgeDat: files.judgeFiles.some(f => f.name.endsWith('.dat')),
                        hasJudgeOut: files.judgeFiles.some(f => f.name.endsWith('.out')),
                        hasStatement: files.hasStatement,
                    });

                    for (const f of files.sampleFiles) {
                        if (f.name.endsWith('.dat')) sampleInput.push(new File([f.content], f.name, { type: 'text/plain' }));
                        else if (f.name.endsWith('.out')) sampleOutput.push(new File([f.content], f.name, { type: 'text/plain' }));
                    }
                    for (const f of files.judgeFiles) {
                        if (f.name.endsWith('.dat')) judgeInput.push(new File([f.content], f.name, { type: 'text/plain' }));
                        else if (f.name.endsWith('.out')) judgeOutput.push(new File([f.content], f.name, { type: 'text/plain' }));
                    }
                }

                form.reset({
                    id: problem.problem_id || "",
                    name: problem.problem_name || "",
                    level: problem.competition_level || "",
                    year: problem.problem_year || new Date().getFullYear(),
                    tags: problem.tags || [],
                    sampleInput,
                    sampleOutput,
                    judgeInput,
                    judgeOutput,
                    statement: [],
                });
            });
        }
    }, [problemId, form]);

    async function handleSubmit(values: ProblemFormValues) {
        setIsSubmitting(true);
        setServerError(null);

        try {
            const formData = new FormData();
            formData.set("id", values.id);
            formData.set("name", values.name);
            formData.set("level", values.level);
            formData.set("year", String(values.year));
            formData.set("tags", JSON.stringify(values.tags));

            if (values.sampleInput?.[0]) formData.set("sampleDat", values.sampleInput[0]);
            if (values.sampleOutput?.[0]) formData.set("sampleOut", values.sampleOutput[0]);
            if (values.judgeInput?.[0]) formData.set("judgeDat", values.judgeInput[0]);
            if (values.judgeOutput?.[0]) formData.set("judgeOut", values.judgeOutput[0]);
            if (values.statement?.[0]) formData.set("statement", values.statement[0]);

            const result = problemId
                ? await updateProblem(formData)
                : await createProblem(formData);

            if (result) {
                setServerError(result);
            } else {
                router.refresh();
                onSuccess?.();
            }
        } catch (error) {
            console.error("Error submitting problem:", error);
            setServerError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-full">
            <Form {...form} >
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">
                    {serverError && (
                        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-500">
                            {serverError}
                        </div>
                    )}
                    <FormField
                        control={form.control}
                        name="id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter the problem ID" {...field} disabled={!!problemId} />
                                </FormControl>
                                <FormDescription>
                                    This is the name that will used internally to identify the problem.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                    )}/>

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter the problem name" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is the name that will be displayed when searching for this problem
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Competition Level</FormLabel>
                                <FormControl>
                                    <Combobox
                                        searchPlaceholder={"Search a level"}
                                        selectPlaceholder={"Select a level"}
                                        emptyPlaceholder={"No levels found"}
                                        options={
                                            [
                                                { value: "Invitational A", label: "Invitational A" },
                                                { value: "Invitational B", label: "Invitational B" },
                                                { value: "District", label: "District" },
                                                { value: "Region", label: "Region" },
                                                { value: "State", label: "State" },

                                            ]
                                        }
                                        value={field.value}
                                        setValue={(value) => field.onChange(value)}
                                        disabled={false}
                                    />

                                </FormControl>
                                <FormDescription>
                                    This is the name that will be displayed when searching for this problem
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                    )}/>

                    <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Enter the problem year" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                                <FormDescription>
                                    The year this problem was used in competition
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                    )}/>

                    <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full text-left">
                                                Select tag(s)
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" side="bottom" avoidCollisions={false} className="w-(--radix-dropdown-menu-trigger-width)">
                                        {
                                            programmingTags.map((tag) => {
                                            return ( <DropdownMenuCheckboxItem
                                                key={tag}
                                                className="capitalize"
                                                checked={field.value.includes(tag)}
                                                onCheckedChange={(value) => {
                                                    const newTags = value ? [tag, ...field.value] : field.value.filter(t => t !== tag);
                                                    form.setValue("tags", newTags);
                                                    field.onChange(newTags); // Connect to form
                                                }}
                                            >{tag}
                                            </DropdownMenuCheckboxItem> )})
                                        }
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </FormControl>
                            <FormDescription>These are the tags that will be used to filter for problems</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )
                    }
                    />

                    <FormField
                        control={form.control}
                        name="statement"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Problem Statement (PDF)</FormLabel>
                                {problemId && existingFiles.hasStatement && (
                                    <div className="mb-2">
                                        <DownloadButton problemId={problemId} fileType="statement" label="Download current statement" />
                                    </div>
                                )}
                                <FormControl>
                                    <FileUpload
                                        id="statement-upload"
                                        existingFiles={field.value || []}
                                        accept=".pdf"
                                        onChange={(files) => field.onChange(files.slice(-1))}
                                    />
                                </FormControl>
                                <FormDescription>
                                    {problemId ? "Upload a new PDF to replace the existing statement" : "Upload the problem statement PDF"}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="sampleInput"
                            render={({ field }) => (
                                <FormItem className="text-center">
                                    <FormLabel className="text-center block">Sample Input</FormLabel>
                                    {problemId && existingFiles.hasSampleDat && (
                                        <DownloadButton problemId={problemId} fileType="sampleDat" label="Download" />
                                    )}
                                    <FormControl>
                                        <FileUpload
                                            id="sample-input"
                                            existingFiles={field.value || []}
                                            accept=".in,.dat,.txt"
                                            onChange={(files) => field.onChange(files.slice(-1))}
                                        />
                                    </FormControl>
                                    <FormDescription>Input shown to the user</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sampleOutput"
                            render={({ field }) => (
                                <FormItem className="text-center">
                                    <FormLabel className="text-center block">Sample Output</FormLabel>
                                    {problemId && existingFiles.hasSampleOut && (
                                        <DownloadButton problemId={problemId} fileType="sampleOut" label="Download" />
                                    )}
                                    <FormControl>
                                        <FileUpload
                                            id="sample-output"
                                            existingFiles={field.value || []}
                                            accept=".out,.txt"
                                            onChange={(files) => field.onChange(files.slice(-1))}
                                        />
                                    </FormControl>
                                    <FormDescription>Expected output shown to the user</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="judgeInput"
                            render={({ field }) => (
                                <FormItem className="text-center">
                                    <FormLabel className="text-center block">Judge Input</FormLabel>
                                    {problemId && existingFiles.hasJudgeDat && (
                                        <DownloadButton problemId={problemId} fileType="judgeDat" label="Download" />
                                    )}
                                    <FormControl>
                                        <FileUpload
                                            id="judge-input"
                                            existingFiles={field.value || []}
                                            accept=".in,.dat,.txt"
                                            onChange={(files) => field.onChange(files.slice(-1))}
                                        />
                                    </FormControl>
                                    <FormDescription>Input used for grading (hidden)</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="judgeOutput"
                            render={({ field }) => (
                                <FormItem className="text-center">
                                    <FormLabel className="text-center block">Judge Output</FormLabel>
                                    {problemId && existingFiles.hasJudgeOut && (
                                        <DownloadButton problemId={problemId} fileType="judgeOut" label="Download" />
                                    )}
                                    <FormControl>
                                        <FileUpload
                                            id="judge-output"
                                            existingFiles={field.value || []}
                                            accept=".out,.txt"
                                            onChange={(files) => field.onChange(files.slice(-1))}
                                        />
                                    </FormControl>
                                    <FormDescription>Expected output for grading (hidden)</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button variant="default" type="submit" className="gap-y-4 w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : (problemId ? "Update Problem" : "Create Problem")}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
