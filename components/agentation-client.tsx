'use client';

import {
  type ComponentType,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import type { AgentationProps } from 'agentation';

const emptySubscribe = () => () => {};

export function AgentationClient() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [Component, setComponent] =
    useState<ComponentType<AgentationProps> | null>(null);

  const isEnabled =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ENABLE_AGENTATION === 'true';

  useEffect(() => {
    if (isMounted && isEnabled) {
      void import('agentation').then((mod) => {
        setComponent(() => mod.Agentation);
      });
    }
  }, [isMounted, isEnabled]);

  if (!isMounted || !isEnabled || !Component) {
    return null;
  }

  return <Component endpoint="http://localhost:4747" />;
}
