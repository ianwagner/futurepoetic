'use client';

import { useEffect, useState } from 'react';
import BackButton from './BackButton';

export default function BackButtonClient() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return <BackButton />;
}
