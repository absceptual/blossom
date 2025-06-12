'use client'
import React, { useState, useRef, Fragment } from 'react';
import { HomeIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { PlayCircleIcon } from '@heroicons/react/24/solid';
import { Button } from "@/components/ui/button"
import { redirect } from 'next/navigation';
import { submitTestcase, submitCustomTestcase, submitLocal, submitJudge } from '@/actions/editor';
import { EditorInfo, SubmissionResult } from '@/types/editor';
import { downloadCode, downloadLocalCode } from '@/components/editor/container'; 

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function updateEditors(editorInfo: EditorInfo, result: SubmissionResult)  {
    if (!result) {
      editorInfo.compilation.updater("An unknown error occurred during submission.");
      editorInfo.setActiveFileId('compilation')
      return;
    }

    editorInfo.output.updater( atob(result.stdout || "")); // Decode from base64
    editorInfo.compilation.updater(result.compile_output ? atob(result.compile_output) : (result.status?.description ?? "No compilation output available."));
    editorInfo.error.updater(atob(result.stderr || ""));

    const statusId = result.status?.id;
    switch (statusId) {
      case 3: // Accepted
        editorInfo.setActiveFileId('output');
        break;
      
      case 4: // Wrong Answer
        editorInfo.setActiveFileId('output');
        break;
      
      case 5: // Time Limit Exceeded
        editorInfo.setActiveFileId('compilation');
        break;
      
      case 6: // Compilation Error
        editorInfo.setActiveFileId('compilation');
        break;
      
      case 7: // Runtime Error (SIGSEGV)
      case 8: // Runtime Error (SIGXFSZ)
      case 9: // Runtime Error (SIGFPE)
      case 10: // Runtime Error (SIGABRT)
      case 11: // Runtime Error (NZEC)
      case 12: // Runtime Error (Other)
        editorInfo.setActiveFileId('error');
        break;
      
      case 13: // Internal Error
      case 14: // Exec Format Error
        editorInfo.setActiveFileId('compilation');
        break;
      
      default:
        // For unknown status or processing, show compilation
        editorInfo.setActiveFileId('compilation');
        break;
    }
  };

function HomeButton() {
  return (
    <div onClick={() => redirect('/dashboard')} className="flex h-full items-center justify-center px-4 bg-neutral-800 hover:bg-neutral-700">
        <HomeIcon className="size-4 items-center text-white" />
    </div>
  );
}

function RunButton({ editorInfo, problemId }) {
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);
  
  async function runCustomTestcase() {
    const result = await submitCustomTestcase(problemId, editorInfo.input.content)
    updateEditors(editorInfo, result);
  }

  async function runSampleTestcase() {
    const result = await submitTestcase(problemId);
    updateEditors(editorInfo, result);
  }
  
  return (
    <div className="flex h-full align-items-left">
        <DropdownMenu open={codeDropdownOpen} onOpenChange={setCodeDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-neutral-800 h-full text-xs rounded-none data-[state=open]:bg-neutral-800 text-gray-200 hover:text-gray-200  hover:bg-neutral-700 shadow-sm">
            Run Code 
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56 rounded-none' align='start'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem className="text-xs" onClick={runCustomTestcase}>
              Run Custom Testcase
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={runSampleTestcase}>
              Run Sample Testcase
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
  
}

function FileButton({ 
  problemId, 
  editorInfo 
}: { 
  problemId: string,
  editorInfo: EditorInfo
}) {
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const onOpenCodeFile = async (file: Blob) => editorInfo.code.updater(await file.text());
  const onOpenInputFile =  async (file: Blob) => editorInfo.input.updater(await file.text());

  return ( 
    <div className="flex h-full align-items-left">
          <Fragment>
                  <input 
                    type="file" 
                    accept=".in,.dat,.txt" 
                    id="fileInput" 
                    style={{display: "none"}} 
                    ref={fileInputRef} 
                    onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) 
                            onOpenInputFile(file);
                        }}
                  />
                  <input 
                    type="file" 
                    accept=" .java" 
                    id="codeInput" 
                    style={{display: "none"}} 
                    ref={codeInputRef} 
                    onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) 
                            onOpenCodeFile(file);
                    }}
                  />
          </Fragment>
          <DropdownMenu open={fileDropdownOpen} onOpenChange={setFileDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button className="bg-neutral-800 h-full text-xs rounded-none data-[state=open]:bg-neutral-800 text-gray-200 hover:text-gray-200  hover:bg-neutral-700 shadow-sm ">
              File {fileDropdownOpen ? <ChevronUpIcon className="size-3 ml-1" /> : <ChevronDownIcon className="size-3 ml-1" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56 rounded-none' align='start'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-xs" disabled>
                New Problem
                <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => codeInputRef.current?.click()} className="text-xs">
                Open File
                <DropdownMenuShortcut>Ctrl+O</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="text-xs">
                Open Input File
                <DropdownMenuShortcut>Ctrl+Shift+O</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => problemId ? downloadCode(problemId) : downloadLocalCode(editorInfo.code.content)} className="text-xs">
                Save File
                <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
  );
}

function SubmitButton({ problemId, editorInfo }: { problemId: string, editorInfo: EditorInfo }) {
  // Turn this into a real submission button (popup modal)

  async function _submitJudge() {
    const result = await submitJudge(problemId);
    updateEditors(editorInfo, result);
  }

  async function _submitLocal() {
    const result = await submitLocal(problemId, editorInfo.code.content, editorInfo.input.content);
    updateEditors(editorInfo, result);
  }

  return (
    <Button onClick={problemId ? _submitJudge : _submitLocal} className="w-35 h-full flex items-center  bg-[#d47aa3] rounded-none  text-white  text-xs  hover:text-white  hover:bg-[#f590bd] shadow-sm ">
        <PlayCircleIcon />Submit Code 
    </Button>
  )
}

export default function Topbar({ 
  problemId, 
  editorInfo,
}: { 
  problemId: string,
  editorInfo: EditorInfo
}) {
  return (
    <div className="flex bg-neutral-800 divide-x-1 border-b border-neutral-900 divide-neutral-700 h-10 ">
      <HomeButton />
      <FileButton problemId={problemId} editorInfo={editorInfo}/>
      {problemId ? <RunButton problemId={problemId} editorInfo={editorInfo}/> : null }
      <SubmitButton problemId={problemId} editorInfo={editorInfo}/>      
    </div>
  );
}