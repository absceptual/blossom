import { SubmissionStatusType } from "@/types/submission";
import { useState } from "react";


export function useSubmissionStatus(initialStatus: SubmissionStatusType) {
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatusType>(initialStatus);

    return [ submissionStatus, setSubmissionStatus ];
}