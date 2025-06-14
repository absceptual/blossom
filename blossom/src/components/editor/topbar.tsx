'use client'
import React, { useState, Fragment, useEffect, useContext } from 'react';
import { HomeIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button"
import { redirect } from 'next/navigation';
import { submitJudge, saveCode, submitTestcase, submitCustomTestcase } from '@/actions/editor';
import { EditorInfo } from '@/types/editor';
import { downloadCode } from '@/components/editor/container'; 
import { SubmissionStatus } from '@/components/shared/submission-status';
import { NewProblemDialog } from '@/components/dashboard/launch-card';
import { Badge } from '@/components/ui/badge';
import { SubmissionStatusType, SubmissionResult } from '@/types/submission';
import { getCurrentEditorSubmission } from '@/actions/problems';
import { ProblemContext } from '@/app/editor/page';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Topbar({ 
  editorInfo,
}: { 
  editorInfo: EditorInfo,
}) {
  const [status, setStatus] = useState<SubmissionStatusType>("Not Submitted");
  const problemId = useContext(ProblemContext);

  // Fetch the submission status for the current problem when it first loads
  useEffect(() => {
    const fetchSubmission = async () => {
      const submission = await getCurrentEditorSubmission(problemId);
      setStatus(submission.status);
    };
    fetchSubmission();
  }, [problemId]);

  return (
    <div className="flex bg-neutral-800 divide-x-1 border-b border-neutral-900 divide-neutral-700 h-10 ">
      <HomeButton />
      <FileButton editorInfo={editorInfo}/>
      {problemId ? <RunButton editorInfo={editorInfo} setStatus={setStatus}/> : null }
      <SubmitButton editorInfo={editorInfo} setStatus={setStatus}/>      
      <div className="flex-1 flex justify-end items-center pr-4 gap-4">
        <SubmissionStatus status={status} />
        <AutosaveStatus editorInfo={editorInfo}/>
      </div>
    </div>
  );
}

function HomeButton() {
  return (
    <div onClick={() => redirect('/dashboard')} className="flex hover:cursor-pointer h-full items-center justify-center px-4 bg-neutral-800 hover:bg-neutral-700">
        <HomeIcon className="size-4 items-center text-white" />
    </div>
  );
}

function RunButton({ 
  editorInfo, 
  setStatus 
}: { 
  editorInfo: EditorInfo, 
  setStatus: React.Dispatch<React.SetStateAction<SubmissionStatusType>>
}) {
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);
  const problemId = useContext(ProblemContext);

  async function run(useSample = true) {
    if (editorInfo.saveStatus !== 'saved' && editorInfo.saveStatus !== 'saving') {
      saveCode(problemId, editorInfo.code.content);
    }

    let result = null;
    if (useSample) 
      result = await submitTestcase(problemId, editorInfo.code.content);
    else
      result = await submitCustomTestcase(problemId, editorInfo.code.content, editorInfo.input.content);

    setStatus(result.status.description as SubmissionStatusType);
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
            <DropdownMenuItem className="text-xs" onClick={() => run(false)}>
              Run Custom Testcase
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={() => run(true)}>
              Run Sample Testcase
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function FileButton({ 
  editorInfo,
}: { 
  editorInfo: EditorInfo,
}) {
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);
  
  const openCodeFileCallback  = async (file: Blob) => editorInfo.code.updater(await file.text());
  const openInputFileCallback = async (file: Blob) => editorInfo.input.updater(await file.text());

  function handleNewProblem(problemId: string) {
    editorInfo.setIsCreateDialogOpen(false);
    redirect(`/editor?id=${problemId}`);
  };
  
  return ( 
    <div className="flex h-full align-items-left">
      { /* Invisible file inputs to open files */ }
      <Fragment>
        <input type="file" 
          accept=".in,.dat,.txt" 
          id="fileInput" 
          style={{display: "none"}} 
          ref={editorInfo.fileInputRef} 
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) 
              openInputFileCallback(file);
          }}
        />
        <input 
          type="file" 
          accept=".java" 
          id="codeInput" 
          style={{display: "none"}} 
          ref={editorInfo.codeInputRef} 
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) 
              openCodeFileCallback(file);
          }}
        />
      </Fragment>
      <DropdownMenu open={fileDropdownOpen} onOpenChange={setFileDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-neutral-800 h-full text-xs hover:cursor-pointer rounded-none data-[state=open]:bg-neutral-800 text-gray-200 hover:text-gray-200  hover:bg-neutral-700 shadow-sm ">
            File {fileDropdownOpen ? <ChevronUpIcon className="size-3 ml-1" /> : <ChevronDownIcon className="size-3 ml-1" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56 rounded-none' align='start'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem 
              className="text-xs"
              onClick={(e) => {
                editorInfo.setIsCreateDialogOpen(true);
                e.stopPropagation();
              }}
            >
              New Problem
              <DropdownMenuShortcut>Ctrl+D</DropdownMenuShortcut>
            </DropdownMenuItem>    
            <DropdownMenuItem onClick={() => editorInfo.codeInputRef.current?.click()} className="text-xs">
              Open Java File
              <DropdownMenuShortcut>Ctrl+O</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editorInfo.fileInputRef.current?.click()} className="text-xs">
              Open Input File
              <DropdownMenuShortcut>Ctrl+Shift+O</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadCode(editorInfo.code.content)} className="text-xs">
              Save File
              <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <NewProblemDialog 
        open={editorInfo.isCreateDialogOpen}
        onOpenChange={editorInfo.setIsCreateDialogOpen}
        onComplete={handleNewProblem}
      />
    </div>
  );
}

function SubmitButton({ 
  editorInfo, 
  setStatus 
}: { 
  editorInfo: EditorInfo, 
  setStatus: React.Dispatch<React.SetStateAction<SubmissionStatusType>>
}) {
  const problemId = useContext(ProblemContext);

  async function submit() {
    setStatus("Submitting");
    
    const result = await submitJudge(editorInfo.code.content, editorInfo.input.content, problemId);
    setStatus(result?.status.description as SubmissionStatusType);
    updateEditors(editorInfo, result);
  }

  return (
    <Button onClick={submit} className="w-35 hover:cursor-pointer h-full flex items-centerbg-[#d47aa3] rounded-none bg-[#db699b] text-white  text-xs  hover:text-white  hover:bg-[#f590bd] shadow-sm ">
      <PlayCircleIcon />Submit Code 
    </Button>
  )
}

function AutosaveStatus({ 
  editorInfo 
}: { 
  editorInfo: EditorInfo 
}) {

  const problemId = useContext(ProblemContext);
  if (!problemId) return null;
  
    switch (editorInfo.saveStatus) {
      case 'saving':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">Saving...</Badge>;
      case 'error':
        return <Badge variant="secondary" className="bg-red-500/20 text-red-500">Save failed</Badge>;
      case 'saved':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-500">Saved</Badge>;
      default:
        return null;
    }
}

function updateEditors(editorInfo: EditorInfo, result: SubmissionResult)  {
  if (!result) {
    editorInfo.error.updater("An unknown error occurred during submission.");
    editorInfo.setActiveFileId('compilation')
    return;
  }

  editorInfo.output.updater( atob(result.stdout || "")); // Decode from base64
  editorInfo.compilation.updater(result.compile_output ? atob(result.compile_output) : (result.status?.description ?? "No compilation output available."));
  editorInfo.error.updater(atob(result.stderr || result.message || ""));

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
