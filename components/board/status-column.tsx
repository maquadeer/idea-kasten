'use client';

import { Component, Status } from '@/lib/types';
import { ComponentCard } from '@/components/component-card';

interface StatusColumnProps {
  status: Status;
  components: Component[];
}

export function StatusColumn({ status, components }: StatusColumnProps) {
  const filteredComponents = components.filter(
    (component) => component.status === status
  );

  return (
    <div className="bg-card rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4 capitalize">
        {status.replace('inprogress', 'In Progress')}
      </h2>
      <div className="space-y-4">
        {filteredComponents.map((component) => (
          <ComponentCard key={component.$id} component={component} />
        ))}
      </div>
    </div>
  );
}