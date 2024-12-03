import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}