import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase().trim();
  
  let bgClass = 'bg-gray-100';
  let textClass = 'text-gray-700';
  let dotClass = 'bg-gray-500';

  switch (normalizedStatus) {
    case 'CONFIRMED':
    case 'VALID':
    case 'VERIFIED':
      bgClass = 'bg-green-100';
      textClass = 'text-green-800';
      dotClass = 'bg-green-500';
      break;
    case 'CANCELLED':
    case 'REJECTED':
      bgClass = 'bg-red-100';
      textClass = 'text-red-800';
      dotClass = 'bg-red-500';
      break;
    case 'PENDING':
      bgClass = 'bg-amber-100';
      textClass = 'text-amber-800';
      dotClass = 'bg-amber-500';
      break;
    case 'OPEN':
      bgClass = 'bg-[var(--play-brand-light)]';
      textClass = 'text-[var(--play-brand-dark)]';
      dotClass = 'bg-[var(--play-brand)]';
      break;
    case 'INVITE_ONLY':
      bgClass = 'bg-blue-100';
      textClass = 'text-blue-800';
      dotClass = 'bg-blue-500';
      break;
    case 'COMPLETED':
      bgClass = 'bg-gray-100';
      textClass = 'text-gray-700';
      dotClass = 'bg-gray-500';
      break;
    default:
      // Default gray colors handled above
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[var(--play-radius-pill)] px-2.5 py-0.5 text-xs font-medium ${bgClass} ${textClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {status}
    </span>
  );
}
