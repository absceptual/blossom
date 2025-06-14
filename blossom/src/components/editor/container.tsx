import React, { useContext } from "react";
import Editor from '@monaco-editor/react';
import Widgets from '@/components/editor/side-editor';
import { EditorInfo } from "@/types/editor";
import SideEditor from "@/components/editor/side-editor";
import { ProblemContext } from "@/components/editor/contextprovider";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"


export default function Container({
    editorInfo
}: {
    editorInfo: EditorInfo
}) {
    const problemId = useContext(ProblemContext);
    
    return (
        <div className="flex flex-row flex-auto ">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel className="flex-1 overflow-hidden">
                    <Editor theme="vs-dark" defaultLanguage="java" value={editorInfo.code.content} onChange={editorInfo.code.updater} />
                </ResizablePanel>
                <ResizableHandle className="bg-neutral-950" />
                    <ResizablePanel className="flex flex-col flex-1">
                        {problemId ? 
                        <ResizablePanelGroup direction="vertical">
                            <ResizablePanel  className="flex-1">
                                { /* TODO: Replace with the single PDF of the current problem statement */}
                                <iframe src={`/problem_statements/${problemId}.pdf`} className="w-full h-full" title="PDF Viewer"></iframe>
                            </ResizablePanel >
                            <ResizableHandle className="bg-neutral-950"/>
                            <ResizablePanel className="flex-1">
                            <SideEditor editorInfo={editorInfo} />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                        : <Widgets editorInfo={editorInfo} />}
                    </ResizablePanel>
                
            </ResizablePanelGroup>   
        </div>
    )
}

export async function downloadCode(code: string) {
    const blob = new Blob([code], { 
        type: "text/java"
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Main.java`
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
