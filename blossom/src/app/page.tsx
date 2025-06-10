'use client';

import React from "react";

import Topbar from "@/components/topbar";
import Container from "@/components/container";


export default function Home() {
  
  return (
    <div className="flex h-screen bg-neutral-800 flex-col">
      <Topbar />
      <div className="w-py-10"></div>
      <Container  />
    </div>
  )
}