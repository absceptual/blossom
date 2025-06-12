'use client';
import React, { useState, useRef, useEffect, Fragment } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from "@/components/ui/button";
import { EditorInfo } from '@/types/editor';
import { downloadCode, downloadLocalCode } from '@/components/editor/container';

function EditorButtons({ editorInfo, fileId, setFileId }) {
    return (
        <div className="flex bg-neutral-900 h-5">
                {Object.keys(editorInfo).map((buttonId) => {
                    if (buttonId === 'code' || buttonId === 'codeLoaded' || buttonId === 'setActiveFileId' || buttonId === 'activeFileId') 
                        return null; 
                    return <Button 
                        key={buttonId} 
                        id={buttonId} 
                        onClick={(e) => setFileId(e.currentTarget.id)}
                        className={`h-full text-[.70rem] rounded-none data-[state=open]:bg-[#1f1f1f] text-gray-200 hover:text-gray-200 hover:bg-[#1f1f1f] shadow-sm ${fileId === buttonId ? 'bg-[#1f1f1f]' : ''}`}
                    >
                        {buttonId}
                    </Button>
                })}
            </div>
    )
}
export default function Widgets({ 
    problemId,
    editorInfo,
}: {
    problemId: string,
    editorInfo: EditorInfo 
}) {
    const activeFileIdRef = useRef(editorInfo.activeFileId);
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const codeRef = useRef(editorInfo.code.content);

    const [addedCommand, setAddedCommand] = useState(false);  
    
    useEffect(() => {
        activeFileIdRef.current = editorInfo.activeFileId;
    }, [editorInfo.activeFileId]);

    useEffect(() => {
        codeRef.current = editorInfo.code.content;
    }, [editorInfo.code]);
    
    useEffect(() => {
        if (editorRef.current) {
            const newValue = editorInfo[activeFileIdRef.current]?.content ?? '';
            const currentValue = editorRef.current.getValue();
            
            if (newValue !== currentValue) {
                editorRef.current.setValue(newValue);
            }
            
            // Update read-only state
            editorRef.current.updateOptions({
                readOnly: activeFileIdRef.current !== "input"
            });
        }
    }, [activeFileIdRef, editorInfo]);


    function handleEditorWillMount(monaco) {
        if (!addedCommand) {
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
                run: () => problemId ? downloadCode(problemId) : downloadLocalCode(codeRef.current)
            });
            setAddedCommand(true);
        }
    }

    function handleEditorMount(editor, monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;
    }

    function handleEditorChange(newValue: string | undefined) {
        if (activeFileIdRef.current === "input")  {
            editorInfo[activeFileIdRef.current].updater(newValue ?? "");
        }
    }

    return (
        <Fragment>
            <EditorButtons editorInfo={editorInfo} fileId={activeFileIdRef.current} setFileId={editorInfo.setActiveFileId}/>
            <Editor
                className="h-full"
                path={activeFileIdRef.current}
                defaultValue={editorInfo[activeFileIdRef.current]?.content ?? ''}
                theme="vs-dark"
                onMount={handleEditorMount}
                onChange={handleEditorChange}
                beforeMount={handleEditorWillMount}
                options={{readOnly: activeFileIdRef.current === "input" ? false : true, minimap: { enabled: false }, scrollBeyondLastLine: false }}
            />
        </Fragment>
    );
}