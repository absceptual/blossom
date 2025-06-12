
import React from "react";
import Editor from '@monaco-editor/react';
import Widgets from '@/components/editor/widgets';
import { EditorInfo } from "@/types/editor";
import { getSavedCode } from "@/actions/editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export async function downloadLocalCode(code: string) {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Main.java`
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function downloadCode(problemId: string) {
    const blob = new Blob([await getSavedCode(problemId)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${problemId}.java`
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export default function Container({
    problemId,
    editorInfo
}: {
    problemId: string,
    editorInfo: EditorInfo
}) {
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
                            <Widgets problemId={problemId} editorInfo={editorInfo} />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                        : <Widgets problemId={problemId} editorInfo={editorInfo} />}
                    </ResizablePanel>
                
            </ResizablePanelGroup>   
        </div>
    )
}