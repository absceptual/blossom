export interface Problem {
  id?: number;
  problem_id: string;
  problem_year: number;
  competition_level: 'Invitational A' | 'Invitational B' | 'District' | 'Region' | 'State' | 'OTher';
  tags: string[];
  problem_name: string;
}

export interface FetchedProblem {
  problem_id: string;
  problem_name: string;
  competition_level: string;
  problem_year: number;
  last_worked: Date;
}


export interface Submission {
  id?: number;
  problem_id: string;
  username: string;
  status: SubmissionStatusType
  date: Date;
}

export interface SubmissionResult {
  status: {
    id: number;
    description: SubmissionStatusType;
  }
  stdout?: string;
  stderr?: string;
  compile_output?: string;  
  message?: string;
}

export type SubmissionStatusType = 
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit'
  | 'Time Limit Exceeded'
  | 'Runtime Error'
  | 'Runtime Error (SIGSEGV)'
  | 'Runtime Error (SIGXFSZ)'
  | 'Runtime Error (SIGFPE)'
  | 'Runtime Error (SIGABRT)'
  | 'Runtime Error (NZEC)'
  | 'Runtime Error (Other)'
  | 'Compilation Error'
  | 'Internal Error'
  | 'Exec Format Error' 
  | 'Submitting'
  | 'Not Submitted';