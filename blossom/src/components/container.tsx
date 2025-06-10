'use client'

import React from "react";
import Editor from '@monaco-editor/react';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import Widgets from '@/components/widgets';

export default function Container({
    code,
    problemId,
    onCodeChange,
    inputContent,
    outputContent,
    compilationContent,
    errorContent,
    setInputContent,
    onDownloadCode
}: {
    code: string;
    problemId: string;
    onCodeChange: (newCode: string) => void;
    inputContent: string;
    outputContent: string;
    compilationContent: string;
    errorContent: string;
    onDownloadCode: () => void;
    setInputContent: (content: string) => void;
}) {
    return (
        <div className="flex flex-row flex-auto ">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel className="flex-1 overflow-hidden">
                    <Editor theme="vs-dark" defaultLanguage="java" value={code} onChange={(newValue) => onCodeChange(newValue || "")} />
                </ResizablePanel>
                <ResizableHandle className="bg-neutral-950" />
                <ResizablePanel className="flex flex-col flex-1">
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel  className="flex-1">
                            { /* TODO: Replace with the single PDF of the current problem statement */}
                            <iframe src={`/problem_statements/${problemId}.pdf`} className="w-full h-full" title="PDF Viewer"></iframe>
                        </ResizablePanel >
                        <ResizableHandle className="bg-neutral-950"/>
                        <ResizablePanel className="flex-1">
                           <Widgets
                                inputContent={inputContent}
                                outputContent={outputContent}
                                compilationContent={compilationContent}
                                errorContent={errorContent}
                                setInputContent={setInputContent}
                                onDownloadCode={onDownloadCode}
                            />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>   
        </div>
    )
}