'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import type { ReactNode } from 'react';

type TRegister = (id: string, exitToView: () => Promise<void>) => () => void;

type TResumeSnapshotContext = {
  register: TRegister;
  exitAllToView: () => Promise<void>;
};

const ResumeSnapshotContext = createContext<TResumeSnapshotContext | null>(
  null,
);

export function ResumeSnapshotProvider(props: { children: ReactNode }) {
  const handlersRef = useRef(
    new Map<string, () => Promise<void>>(),
  );

  const register = useCallback<TRegister>((id, exitToView) => {
    handlersRef.current.set(id, exitToView);
    return () => {
      if (handlersRef.current.get(id) === exitToView) {
        handlersRef.current.delete(id);
      }
    };
  }, []);

  const exitAllToView = useCallback(async () => {
    const fns = [...handlersRef.current.values()];
    await Promise.all(fns.map((f) => f()));
  }, []);

  const value = useMemo<TResumeSnapshotContext>(
    () => ({ register, exitAllToView }),
    [register, exitAllToView],
  );
  return (
    <ResumeSnapshotContext.Provider value={value}>
      {props.children}
    </ResumeSnapshotContext.Provider>
  );
}

export function useRegisterResumeSnapshotExit(
  id: string,
  exitToView: () => Promise<void>,
) {
  const ctx = useContext(ResumeSnapshotContext);
  useEffect(() => {
    if (!ctx) return;
    return ctx.register(id, exitToView);
  }, [ctx, id, exitToView]);
}

export function useResumeSnapshotOptional() {
  return useContext(ResumeSnapshotContext);
}
