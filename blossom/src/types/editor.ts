import React from "react";

export type ReactState<T> = {
    content: T;
    updater: React.Dispatch<React.SetStateAction<T>>;
}

export type EditorInfo = {
    code: ReactState<string>;
    input: ReactState<string>;
    output: ReactState<string>;
    compilation: ReactState<string>;
    error: ReactState<string>;
    codeLoaded: boolean;
    activeFileId: string;
    setActiveFileId: React.Dispatch<React.SetStateAction<string>>;
};

export interface SubmissionResult {
  compile_output?: string;
  status: {
    id: number;
    description: string;
  };
  stdout?: string;
  stderr?: string;
}
