"use client"
import { Badge } from '@/components/ui/badge';
import { SubmissionStatusType } from '@/types/submission';

export function SubmissionStatus({ 
  status 
}: { 
  status: SubmissionStatusType 
}) {
  
  function getStatusStyle(status: SubmissionStatusType) {
    switch (status) {
      case 'Accepted':
        return 'bg-green-500/20 text-green-500';

      case 'Wrong Answer':
      case 'Runtime Error':
      case 'Runtime Error (SIGSEGV)':
      case 'Runtime Error (SIGXFSZ)':
      case 'Runtime Error (SIGFPE)':
      case 'Runtime Error (SIGABRT)':
      case 'Runtime Error (NZEC)':
      case 'Runtime Error (Other)':
      case 'Compilation Error':
      case 'Internal Error':
      case 'Exec Format Error':
        return 'bg-red-500/20 text-red-500';
      
      case 'Time Limit':
      case 'Time Limit Exceeded':
        return 'bg-yellow-500/20 text-yellow-500';
    
      default:
        return 'bg-neutral-500/20 text-neutral-500';
    }
  };
  
  return (
    <Badge variant="secondary" className={getStatusStyle(status)}>
      {status}
    </Badge>
  );
}
  