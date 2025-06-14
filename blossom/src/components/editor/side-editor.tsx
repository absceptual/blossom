'use client';
import React, { useRef, useEffect, Fragment } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from "@/components/ui/button";
import { EditorInfo } from '@/types/editor';
import { downloadCode } from '@/components/editor/container';

function EditorButtons({ editorInfo, fileId, setFileId }) {
    const miniEditors = ['input', 'output', 'compilation', 'error'];

    return (
        <div className="flex bg-neutral-900 h-5">
                {Object.keys(editorInfo).map((buttonId) => {
                    if (!miniEditors.includes(buttonId)) 
                        return null; 
                    return <Button 
                        key={buttonId} 
                        id={buttonId} 
                        onClick={(e) => { setFileId(e.currentTarget.id)}}
                        className={`h-full text-[.70rem] rounded-none  text-gray-200 hover:text-gray-200 hover:bg-[#1f1f1f] shadow-sm ${fileId === buttonId ? 'bg-[#1f1f1f]' : ''}`}
                    >
                        {buttonId}
                    </Button>
                })}
            </div>
    )
}

export default function SideEditor({ 
    editorInfo,
}: {
    editorInfo: EditorInfo 
}) {
    const activeFileIdRef = useRef(editorInfo.activeFileId);
    const editorRef = useRef(null);
    const codeRef = useRef(editorInfo.code.content);
    const areCommandsAdded = useRef(false);  
    
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
        if (!areCommandsAdded.current) {
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
                run: () => downloadCode(codeRef.current)
            });

            monaco.editor.addEditorAction({
                id: 'open-code',
                label: 'Open Code',
                keybindings: [
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO
                ],
                precondition: null,
                keybindingContext: null,
                contextMenuGroupId: "navigation",

                contextMenuOrder: 1.5,
                run: () => {editorInfo.codeInputRef.current?.click()}
            });

            monaco.editor.addEditorAction({
                id: 'open-input-file',
                label: 'Open Input File',
                keybindings: [
                    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyO
                ],
                precondition: null,
                keybindingContext: null,
                contextMenuGroupId: "navigation",

                contextMenuOrder: 1.5,
                run: () => {editorInfo.fileInputRef.current?.click()}
            });

            monaco.editor.addEditorAction({
                id: 'new-problem',
                label: 'New Problem',
                keybindings: [
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD
                ],
                precondition: null,
                keybindingContext: null,
                contextMenuGroupId: "navigation",

                contextMenuOrder: 1.5,
                run: () => {editorInfo.setIsCreateDialogOpen(true)}
            });
            areCommandsAdded.current = true;
        }
    }

    function handleEditorMount(editor) {
        editorRef.current = editor;
    }

    function handleEditorChange(newValue: string | undefined) {
        if (activeFileIdRef.current === "input")  {
            editorInfo[activeFileIdRef.current].updater(newValue ?? "");
        }
    }

    return (
        <Fragment>
            <EditorButtons editorInfo={editorInfo} fileId={editorInfo.activeFileId} setFileId={editorInfo.setActiveFileId}/>
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