'use client';

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation'
import { getSavedCode, getTestcaseInput, saveCode } from "@/actions/editor";
import Topbar from "@/components/editor/topbar";
import Container from "@/components/editor/container";
import PageSuspense from '@/components/shared/PageSuspense';
import { EditorInfo } from "@/types/editor";

const JAVA_BOILERPLATE = `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st;
        
        // Read input
        // Example: int n = Integer.parseInt(br.readLine());
        // Example: st = new StringTokenizer(br.readLine());
        // Example: int a = Integer.parseInt(st.nextToken());
        
        // Your solution here
        
        // Output result
        // System.out.println(result);
    }
}`;



function EditorInstance() {
  const searchParams = useSearchParams();
  const problemId = searchParams.get("id");

  const [code, setCode] = useState<string>("// Loading code...");
  const [codeLoaded, setCodeLoaded] = useState<boolean>(false);
  const [activeFileId, setActiveFileId] = useState('input');

  const [inputContent, setInputContent] = useState<string>("");
  const [outputContent, setOutputContent] = useState<string>("");
  const [compilationContent, setCompilationContent] = useState<string>("");
  const [errorContent, setErrorContent] = useState<string>("");
  
  useEffect(() => {
    if (problemId) {
      console.log("Loading code for problem ID:", problemId);
      getSavedCode(problemId).then(setCode);
      getTestcaseInput(problemId).then(setInputContent);
      setCodeLoaded(true);
    }
    else {
      setCode(JAVA_BOILERPLATE)
    }
  }, [problemId]); // Re-run if the problem ID changes

  useEffect(() => {
    if ( !codeLoaded ) 
      return; 

    const timer = setTimeout(() => {
      if (problemId) {
        // TODO: Replace with dynamic username retrieval
        saveCode(problemId, code)
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    }
  }, [code, problemId, codeLoaded]); // Re-run if code or problem ID changes
  // This function will be called by the Topbar after the submission

  const editorInfo: EditorInfo = {
    code: { content: code, updater: setCode },
    input: { content: inputContent, updater: setInputContent },
    output: { content: outputContent, updater: setOutputContent },
    compilation: { content: compilationContent, updater: setCompilationContent },
    error: { content: errorContent, updater: setErrorContent },
    codeLoaded: true,
    setActiveFileId: setActiveFileId,
    activeFileId: activeFileId
  };

  
  return (
    <div className="flex h-screen bg-neutral-800 flex-col">
          <Topbar
            editorInfo={editorInfo}
            problemId={problemId} 
          />
          <div className="w-py-10"></div>
          <Container
            editorInfo={editorInfo}
            problemId={problemId}
          />
      </div>
  )
}
export default function Page() {
  return (
    <Suspense fallback={PageSuspense()}>
      <EditorInstance />
    </Suspense>
  );
}