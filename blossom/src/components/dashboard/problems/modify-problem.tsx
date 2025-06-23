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
import { getExistingProblemFiles, getProblem } from "@/actions/problems";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "@heroicons/react/24/solid";

const programmingTags = [
    // Data Structures
    "Arrays", "Strings", "Linked Lists", "Stacks", "Queues", "Trees", "Binary Trees", 
    "Heaps", "Hash Tables", "Graphs", "Sets", "Maps",
];


const problemSchema = object({
    id: string(),
    name: string(),
    level: string(),
    tags: array().of(string()).default([]),
    sampleFiles: array().default([]),
    judgeFiles: array().default([]),
})

type ProblemFormValues = {
    id: string;
    name: string;
    level: string;
    tags: string[];
    sampleFiles: File[];
    judgeFiles: File[];
};

export function ModifyProblemDialog({ title, description, problemId, trigger }: {
    title: string;
    description: string;
    problemId?: string; // Optional prop for problem ID, if needed
    trigger?: React.ReactNode; // Optional trigger prop
}) { 
    return (
        <Dialog>
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
                <ModifyProblem problemId={problemId} />
            </DialogContent>
        </Dialog>
    )
}

export function ModifyProblem({
    problemId
}: {
    problemId?: string; // Optional prop for problem ID, if needed
}) {



    const form = useForm<ProblemFormValues>({
        resolver: yupResolver(problemSchema),
        defaultValues: {
            id: "",
            name: "",
            level: "",
            tags: [],
            sampleFiles: [],
            judgeFiles: [],
        },
    });

    useEffect(() => {
    if (problemId) {
        Promise.all([
            getProblem(problemId),
            getExistingProblemFiles(problemId)
        ]).then(async ([problem, files]) => {
            if (files) {
                // Convert metadata to File objects on the client
                const sampleFiles = await Promise.all(
                    files.sampleFiles.map(async (fileData) => {
                        const response = await fetch(fileData.url);
                        const arrayBuffer = await response.arrayBuffer();
                        return new File([arrayBuffer], fileData.name, {
                            type: fileData.type,
                            lastModified: fileData.uploadedAt
                        });
                    })
                );

                const judgeFiles = await Promise.all(
                    files.judgeFiles.map(async (fileData) => {
                        const response = await fetch(fileData.url);
                        const arrayBuffer = await response.arrayBuffer();
                        return new File([arrayBuffer], fileData.name, {
                            type: fileData.type,
                            lastModified: fileData.uploadedAt
                        });
                    })
                );


                
                form.reset({
                    id: problem.problem_id || "",
                    name: problem.problem_name || "",
                    level: problem.competition_level || "",
                    tags: problem.tags || [],
                    sampleFiles: sampleFiles,
                    judgeFiles: judgeFiles,
                });
            }
        });
    }
}, [problemId, form]);
        function handleSubmit(values: ProblemFormValues) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log("Form submitted with values:", values);   
    }

    return (
        <div className="w-full">
            <Form {...form} >
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">
                    <FormField 
                        control={form.control}
                        name="id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter the problem ID" {...field} />
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
                    
                            
                    <div className="flex flex-row gap-4">
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="sampleFiles"
                                render={({ field }) => (
                                    <FormItem className="text-center block">
                                        <FormLabel className="text-center block">Sample Files</FormLabel>                                        <FormControl>
                                            <FileUpload 
                                                id="sample-upload" 
                                                existingFiles={field.value || []}
                                                accept=".in,.out,.dat"
                                                onChange={(files) => {
                                                    const currentFiles = field.value || [];
                                                    const allFiles = [...currentFiles, ...files];
                                                    const uniqueFiles = allFiles.filter((file, index, self) => 
                                                        index === self.findIndex(f => f.name === file.name && f.size === file.size)
                                                    );
                                                    field.onChange(uniqueFiles);
                                                }} 
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Accepts a maximum of two sample files (input/output). These files will be shown to the user.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />      
                        </div>
                        
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="judgeFiles"
                                render={({ field }) => (
                                    <FormItem className="text-center block">
                                        <FormLabel className="text-center block">Judge Files</FormLabel>                                        <FormControl>
                                            <FileUpload 
                                                id="judge-upload" 
                                                existingFiles={field.value || []}
                                                accept=".in,.out,.dat"
                                                onChange={(files) => {
                                                    const currentFiles = field.value || [];
                                                    const allFiles = [...currentFiles, ...files];
                                                    const uniqueFiles = allFiles.filter((file, index, self) => 
                                                        index === self.findIndex(f => f.name === file.name && f.size === file.size)
                                                    );
                                                    field.onChange(uniqueFiles);
                                                }} 
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Accepts a maximum of two sample files (input/output). These files will NOT be shown to the user.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>  
                    </div>
                               
                    <Button variant="default" type="submit" className="gap-y-4 w-full" >Submit</Button>         
                </form>
            </Form>
        </div>
    )
}