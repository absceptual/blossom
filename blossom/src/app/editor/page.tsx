'use client';

import React, { Suspense, useState, useEffect, useRef, createContext } from "react";
import { useSearchParams } from 'next/navigation'
import { getSavedCode, getTestcaseInput, saveCode } from "@/actions/editor";
import Topbar from "@/components/editor/topbar";
import Container from "@/components/editor/container";
import PageSuspense from '@/components/shared/PageSuspense';
import { EditorInfo } from "@/types/editor";


const JAVA_BOILERPLATE = `import java.util.*;
import java.io.*;
import java.math.*;
import java.time.*;
import java.time.format.*;

import static java.lang.System.out;

class Solution {
    Scanner in;
    void solve() {
        
    }
}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        solution.in = new Scanner(System.in);
        solution.solve();
    }
}`;


export const ProblemContext = createContext(undefined);

export default function Page() {
  return (
    <Suspense fallback={PageSuspense()}>
      <EditorInstance />
    </Suspense>
  );
}

function EditorInstance() {
  const searchParams = useSearchParams();
  const problemId = searchParams.get("id");

  

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [code, setCode] = useState<string>("// Loading code...");
  const [codeLoaded, setCodeLoaded] = useState<boolean>(false);
  const [activeFileId, setActiveFileId] = useState('input');
  const codeInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [inputContent, setInputContent] = useState<string>("");
  const [outputContent, setOutputContent] = useState<string>("");
  const [compilationContent, setCompilationContent] = useState<string>("");
  const [errorContent, setErrorContent] = useState<string>("");
  

  useEffect(() => {
    if (problemId) {
      setCodeLoaded(false);
      console.log("Loading code for problem ID:", problemId);
      Promise.all([
        getSavedCode(problemId).then(setCode),
        getTestcaseInput(problemId).then(setInputContent)
      ]).then(() => {
        setCodeLoaded(true);  // Now this only happens after code is loaded
      });
    }
    else {
      setCode(JAVA_BOILERPLATE)
      setCodeLoaded(true);
    }
  }, [problemId]); // Re-run if the problem ID changes

  useEffect(() => {
    if ( !codeLoaded ) 
      return; 

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      if (problemId) {
        try {
          const result = await saveCode(problemId, code);
          setSaveStatus(result === 'success' ? 'saved' : 'error');
        } catch (error) {
          console.error('Save failed:', error);
          setSaveStatus('error');
        }
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
    }
  }, [code, problemId, codeLoaded]); 

  const editorInfo: EditorInfo = {
    code: { content: code, updater: setCode },
    input: { content: inputContent, updater: setInputContent },
    output: { content: outputContent, updater: setOutputContent },
    compilation: { content: compilationContent, updater: setCompilationContent },
    error: { content: errorContent, updater: setErrorContent },
    codeLoaded: true,
    setActiveFileId: setActiveFileId,
    activeFileId: activeFileId,
    codeInputRef: codeInputRef,
    fileInputRef: fileInputRef,
    isCreateDialogOpen: isCreateDialogOpen,
    setIsCreateDialogOpen: setIsCreateDialogOpen,
    saveStatus: saveStatus
  };

  
  return (
      <main className="flex h-screen bg-neutral-800 flex-col">
        <ProblemContext.Provider value={problemId}>
            <Topbar editorInfo={editorInfo} />
            <div className="w-py-10"></div>
            <Container editorInfo={editorInfo} />
        </ProblemContext.Provider>
      </main>
    );
}

