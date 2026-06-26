import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
        <Icon size={24} className="text-gray-400" aria-hidden="true" />
      </div>
      <p className="text-[14px] font-medium text-gray-700">{title}</p>
      {description && (
        <p className="mt-1 text-[12px] text-gray-400 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
