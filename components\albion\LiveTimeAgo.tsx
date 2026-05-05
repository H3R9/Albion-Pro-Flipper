'use client';

import React, { useEffect, useState } from 'react';
import { formatTimeAgo } from '@/lib/albion/utils';

interface LiveTimeAgoProps {
  dateStr: string | null | undefined;
}

export function LiveTimeAgo({ dateStr }: LiveTimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(dateStr || null));

  useEffect(() => {
    // Check if the prop changed since state initialization, theoretically not needed on mount
    const update = () => setTimeAgo(formatTimeAgo(dateStr || null));
    const timer = setTimeout(update, 0);
    
    // Update every second
    const interval = setInterval(update, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [dateStr]);

  return <>{timeAgo}</>;
}
