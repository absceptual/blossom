'use client'

import React from 'react';

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


export default function Topbar() {

  const [fileDropdownOpen, setFileDropdownOpen] = React.useState(false);

  return (
    <div className="flex bg-neutral-800 divide-x-1 border-b border-neutral-900 divide-neutral-700 h-10 ">
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
        <DropdownMenuContent className='w-28 rounded-none' align='start'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              New File
              <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Open File
              <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              Save File
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
      <Button className="w-26 h-full  bg-[#d47aa3] rounded-none  text-white  text-xs  hover:text-white  hover:bg-[#f590bd] shadow-sm "><PlayCircleIcon />Run Code </Button>
    </div>
  );
}