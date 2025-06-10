import React from "react";

import Editor from '@monaco-editor/react';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"


import Widgets from '@/components/widgets';

export default function Container() {

    return (
        <div className="flex flex-row flex-auto ">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel className="flex-1 overflow-hidden">
                    <Editor theme="vs-dark" defaultLanguage="javascript" defaultValue="// Default editor code" />
                </ResizablePanel>
                <ResizableHandle className="bg-neutral-950" />
                <ResizablePanel className="flex flex-col flex-1">
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel  className="flex-1">
                            <Editor theme="vs-dark" defaultLanguage="javascript" defaultValue="// Maybe a comment?"  />
                        </ResizablePanel >
                        <ResizableHandle className="bg-neutral-950"/>
                        <ResizablePanel className="flex-1">
                            <Widgets editors={["input", "output", "compilation"]}  />

                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>   
        </div>
    )
}