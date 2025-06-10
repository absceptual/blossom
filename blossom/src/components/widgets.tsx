'use client';
// React imports
import React, { useState, Fragment, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

// shadcn/ui imports
import { Button } from "@/components/ui/button";


export default function Widgets({ 
    inputContent, 
    outputContent, 
    compilationContent,
    errorContent,
    setInputContent,
    onDownloadCode
}: {
    inputContent?: string,
    outputContent?: string,
    compilationContent?: string,
    errorContent?: string
    setInputContent: (content: string) => void
    onDownloadCode: () => void   
}) {
    
    const [activeFileId, setActiveFileId] = useState('input');
    const activeFileIdRef = useRef(activeFileId);
    
    useEffect(() => {
        activeFileIdRef.current = activeFileId;
    }, [activeFileId]);

    const editorRef = useRef(null);
    const monacoRef = useRef(null);

    const contentMap: { [key: string]: string } = {
        input: inputContent ?? "1 2 3",
        output: outputContent ?? "",
        compilation: compilationContent ?? "",
        error: errorContent ?? "",
    };

    function onWidgetClick(event: React.MouseEvent<HTMLButtonElement>) {
        console.log("Widget clicked:", event.currentTarget.id);
        setActiveFileId(event.currentTarget.id);
    }
    
    function handleEditorWillMount(monaco) {
        'use client';
        console.log(monaco.editor);
        // This function is called before the editor is mounted
        // You can use this to register custom languages, themes, etc.
        monaco.editor.addEditorAction({
            id: 'download-code',
            label: 'Download Code',
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
            ],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: "navigation",

	        contextMenuOrder: 1.5,
            run: onDownloadCode
        })

    }


    function handleEditorMount(editor, monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;
    }

    function handleEditorChange(newValue: string | undefined) {
        if (activeFileIdRef.current === "input")  {
            setInputContent(newValue ?? "");
        }
    }



    return (
        <Fragment>
            <div className="flex bg-neutral-900 h-5">
                {Object.keys(contentMap).map((buttonId) => 
                    <Button 
                        key={buttonId} 
                        id={buttonId} 
                        onClick={onWidgetClick}
                        className={`h-full text-[.70rem] rounded-none data-[state=open]:bg-[#1f1f1f] text-gray-200 hover:text-gray-200 hover:bg-[#1f1f1f] shadow-sm ${activeFileId === buttonId ? 'bg-[#1f1f1f]' : ''}`}
                    >
                        {buttonId}
                    </Button>
                )}
            </div>
            <Editor
                key={activeFileId}
                className="h-full"
                path={activeFileId}
                value={contentMap[activeFileId] ?? ''}
                theme="vs-dark"
                onMount={handleEditorMount}
                onChange={handleEditorChange}
                beforeMount={handleEditorWillMount}
                options={{readOnly: activeFileId === "input" ? false : true}}
            />
        </Fragment>
    );
}