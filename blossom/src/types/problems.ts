export interface Problem {
  id: string;
  name: string;
  difficulty: 'Invitational A' | 'Invitational B' | 'District' | 'Region' | 'State';
  year: number;
  lastWorked: string;
  progress: number;
}

export interface Submission {
  id: string;
  problem: string;
  difficulty: 'Invitational A' | 'Invitational B' | 'District' | 'Region' | 'State';
  year: number;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit' | 'Runtime Error' | 'Compilation Error';
  time: string;
  user: string;
}
