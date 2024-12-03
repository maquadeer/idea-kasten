'use client';

import { JourneyTimeline } from '@/components/journey-timeline';

export default function JourneyPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Project Journey</h1>
        <p className="text-muted-foreground">
          A timeline of our project's development and milestones
        </p>
      </div>
      <JourneyTimeline />
    </div>
  );
} 