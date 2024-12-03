'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto py-8">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message.includes('Missing required environment variable') ? (
            <>
              <p>Missing Appwrite configuration. Please make sure to:</p>
              <ol className="list-decimal ml-6 mt-2">
                <li>Create an Appwrite project at cloud.appwrite.io</li>
                <li>Copy your Project ID and Database ID</li>
                <li>Add them to the .env.local file</li>
              </ol>
            </>
          ) : (
            'Something went wrong. Please try again.'
          )}
        </AlertDescription>
      </Alert>
      <Button onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  );
}