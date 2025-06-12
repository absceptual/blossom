'use client';

import React from "react";

import Topbar from "@/components/topbar";
import Container from "@/components/container";

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from "react";
import { getSavedCode, getTestcaseInput, saveCode, SubmissionResult } from "@/app/actions/editor";



export default function Page() {
  
  // const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const problemId = searchParams.get("id");

  const [code, setCode] = useState("// Loading code...");

  const [inputContent, setInputContent] = useState("1 2 3");
  const [outputContent, setOutputContent] = useState("");
  const [compilationContent, setCompilationContent] = useState("");
  const [errorContent, setErrorContent] = useState("");


  useEffect(() => {
    console.log("Problem ID:", problemId);
    if (problemId) {
      getSavedCode(problemId).then(setCode);
      getTestcaseInput(problemId).then(setInputContent);
    }
  }, [problemId]); // Re-run if the problem ID changes

  useEffect(() => {
    if ( code === "// Loading code...") 
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
  }, [code, problemId]); // Re-run if code or problem ID changes
  // This function will be called by the Topbar after the submission

  function handleSubmissionComplete(result: SubmissionResult)  {
    if (!result) {
      setCompilationContent("An unknown error occurred during submission.");
      return;
    }
    setOutputContent( atob(result.stdout || "")); // Decode from base64
    setCompilationContent(result.compile_output ? atob(result.compile_output) : (result.status?.description ?? "No compilation output available."));
    setErrorContent(atob(result.stderr || ""));
  };

  async function onSaveCode() {
    const blob = new Blob([await getSavedCode(problemId)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${problemId}.java`
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function onOpenCode(file: Blob) {
    const text = await file.text();
    setCode(text);
  }

  async function onOpenInput(file: Blob) {
    const text = await file.text();
    setInputContent(text);
  }

  return (
    <div className="flex h-screen bg-neutral-800 flex-col">
      {/* Pass the handler function down to Topbar */}
      <Topbar problemId={problemId} customTestcase={inputContent} onSubmissionComplete={handleSubmissionComplete} onOpenInput={onOpenInput} onOpenCode={onOpenCode} onSaveCode={onSaveCode} />
      <div className="w-py-10"></div>
      {/* Pass all the states down to Container */}
      <Container
        code={code}
        problemId={problemId}
        onCodeChange={setCode}
        inputContent={inputContent}
        outputContent={outputContent}
        compilationContent={compilationContent}
        errorContent={errorContent}
        setInputContent={setInputContent}
        onDownloadCode={onSaveCode}
      />
    </div>
  );
}