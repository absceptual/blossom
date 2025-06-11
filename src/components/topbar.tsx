'use client'

import React, { useState, useRef, Fragment } from 'react';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { HomeIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { PlayCircleIcon } from '@heroicons/react/24/solid';

import { submitTestcase, submitCustomTestcase, SubmissionResult } from '@/app/actions/editor';

export default function Topbar({ 
  problemId, 
  customTestcase,
  onSaveCode,
  onOpenCode,
  onOpenInput,
  onSubmissionComplete 
}: { 
  problemId?: string,
  customTestcase?: string,
  onSaveCode: () => void,
  onOpenCode: (file: Blob) => void,
  onOpenInput: (file: Blob) => void,
  onSubmissionComplete: (result: SubmissionResult) => void 
}) {
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);

  const codeInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleOpenCodeClick() {
    codeInputRef.current?.click();
  }

  function handleOpenInputClick() {
    fileInputRef.current?.click();
  }
 
  async function handleRunTestcase() {
    // TODO: Replace with dynamic username retrival
    const result = await submitTestcase(problemId ?? "");
    onSubmissionComplete(result)
  }

  async function handleRunCustomTestcase() {
    // TODO: Replace with dynamic username retrival
    const result = await submitCustomTestcase(problemId ?? "", customTestcase ?? "");
    onSubmissionComplete(result)
  }

  return (
    <div className="flex bg-neutral-800 divide-x-1 border-b border-neutral-900 divide-neutral-700 h-10 ">
      {
        <Fragment>
          <input type="file" accept=".in,.dat,.txt" id="fileInput" style={{display: "none"}} ref={fileInputRef} onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) 
                    onOpenInput(file);
                }}
          />
          <input type="file" accept=" .java" id="codeInput" style={{display: "none"}} ref={codeInputRef} onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) 
                    onOpenCode(file);
                }}/>
        </Fragment>
        
      }
      <div className="flex  h-full items-center justify-center px-4 bg-neutral-800 hover:bg-neutral-700">
        <HomeIcon className="size-4 items-center text-white" />
      </div>
      <div className="flex h-full align-items-left">
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
            <DropdownMenuItem onClick={handleOpenCodeClick} className="text-xs">
              Open File
              <DropdownMenuShortcut>Ctrl+O</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenInputClick} className="text-xs">
              Open Input File
              <DropdownMenuShortcut>Ctrl+Shift+O</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSaveCode} className="text-xs">
              Save File
              <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
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
            <DropdownMenuItem className="text-xs" onClick={handleRunCustomTestcase}>
              Run Custom Testcase
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={handleRunTestcase}>
              Run Sample Testcase
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>

      {/* Turn into a popup modal */}
      <Button className="w-35 h-full flex items-center  bg-[#d47aa3] rounded-none  text-white  text-xs  hover:text-white  hover:bg-[#f590bd] shadow-sm ">
            <PlayCircleIcon />Submit Code 
      </Button>
    </div>
  );
}