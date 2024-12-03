'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Component } from '@/lib/types';
import { Progress } from './ui/progress';

interface SummaryCardsProps {
  components: Component[];
}

export function SummaryCards({ components }: SummaryCardsProps) {
  const assignees = Array.from(new Set(components.map(c => c.assignee)));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {assignees.map(assignee => {
        const assigneeComponents = components.filter(c => c.assignee === assignee);
        const total = assigneeComponents.length;
        const completed = assigneeComponents.filter(c => c.status === 'done').length;
        const progress = total ? (completed / total) * 100 : 0;

        const stats = {
          easy: assigneeComponents.filter(c => c.difficulty === 'easy').length,
          medium: assigneeComponents.filter(c => c.difficulty === 'medium').length,
          hard: assigneeComponents.filter(c => c.difficulty === 'hard').length,
        };

        return (
          <Card key={assignee}>
            <CardHeader>
              <CardTitle className="text-lg">{assignee}&apos;s Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="space-y-1">
                  <p className="text-green-500">Easy</p>
                  <p className="font-medium">{stats.easy}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-yellow-500">Medium</p>
                  <p className="font-medium">{stats.medium}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-red-500">Hard</p>
                  <p className="font-medium">{stats.hard}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}