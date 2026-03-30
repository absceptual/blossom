
export type RankProfile = {
    name: string;
    rank: number;
}

export const SubmissionStatusBadgeVariants = {
    "Accepted": {
        variant: "outline",
        className: "bg-green-400 text-white"
    },
    "Wrong Answer": {
        variant: "destructive",
    },
    "Time Limit": {
        variant: "secondary",
        className: "bg-yellow-200 text-yellow-800"
    },
    "Runtime Error": {
        variant: "destructive",
    },
    "Compilation Error": {
        variant: "destructive",
    },
    "Internal Error": {
        variant: "destructive",
    },
    "Exec Format Error": {
        variant: "destructive",
    },
    "Time Limit Exceeded": {
        variant: "secondary",
        className: "bg-yellow-200 text-yellow-800"
    },
    "Runtime Error (SIGSEGV)": {
        variant: "destructive",
    },
    "Runtime Error (SIGXFSZ)": {
        variant: "destructive",
    },
    "Runtime Error (SIGFPE)": {
        variant: "destructive",
    },
    "Runtime Error (SIGABRT)": {
        variant: "destructive",
    },
    "Runtime Error (NZEC)": {
        variant: "destructive",
    },
    "Runtime Error (Other)": {
        variant: "destructive",
    },
    
};

export const CompetitionLevelColors = {
    "Invitational A": "text-neutral-700",
    "Invitational B": "text-[#e7a2c2]",
    "District": "text-[#ea78ab]",
    "Region": "text-[#e45093]",
    "State": "text-[#e42079]",
    "Other": "text-neutral-700",
};