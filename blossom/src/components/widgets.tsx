import React, { useState, Fragment } from 'react';

import { Button } from "@/components/ui/button";
import Editor from '@monaco-editor/react';

const initialFiles = [
    {
        id: 'input',
        name: 'input',
        language: 'html',
        content: '\n<h1>Hello, World!</h1>'
    },
    {
        id: 'output',
        name: 'output',
        language: 'css',
        content: '/* CSS Content */\nbody {\n  background-color: #2a2a2a;\n}'
    },
    {
        id: 'compilation',
        name: 'compilation',
        language: 'javascript',
        content: '// JavaScript Content\nconsole.log("Hello from the editor!");'
    },
];

export default function Widgets({ editors }: { editors: string[] }) {
    
    const [files, setFiles] = useState(initialFiles);
    
    // 1. Use ONLY ONE state variable for the active file/widget.
    // Initialize it to a consistent value.
    const [activeFileId, setActiveFileId] = useState('input');

    const activeFile = files.find(file => file.id === activeFileId);


    // 2. Simplify the click handler to only update the single state.
    function onWidgetClick(event: React.MouseEvent<HTMLButtonElement>) {
        setActiveFileId(event.currentTarget.id);
    }

    return (
        <Fragment>
            <div className="flex bg-neutral-900 h-5">
                {editors.map((buttonId) => 
                    <Button 
                        key={buttonId} 
                        id={buttonId} 
                        onClick={onWidgetClick}
                        // 3. Base the "active" style on the single `activeFileId` state.
                        className={`h-full text-[.70rem] rounded-none data-[state=open]:bg-[#1f1f1f] text-gray-200 hover:text-gray-200 hover:bg-[#1f1f1f] shadow-sm ${activeFileId === buttonId ? 'bg-[#1f1f1f]' : ''}`}
                    >
                        {buttonId}
                    </Button>
                )}
            </div>
            {/* 4. The editor now correctly displays the content for the activeFileId. */}
            <Editor
                className="h-full"
                path={activeFile?.id}
                defaultLanguage={activeFile?.language}
                defaultValue={activeFile?.content}
                theme="vs-dark"
                options={{readOnly: true}}
            />
        </Fragment>
    );
}