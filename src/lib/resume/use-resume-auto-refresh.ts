'use client';

import { resumeQueryKey, resumeSectionsQueryKey } from '@/lib/builder-resume-keys';
import storage from '@/lib/storage';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { subscribeResumeUpdates } from './stream-updates';

const API_V1 = '/api/v1';
const RECONNECT_DELAY_MS = 1500;

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function useResumeAutoRefresh(resumeId: number | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (resumeId == null) return;

    const token = storage.getToken()?.value;
    if (!token) return;

    const ac = new AbortController();

    const run = async () => {
      while (!ac.signal.aborted) {
        try {
          await subscribeResumeUpdates({
            baseUrl: API_V1,
            token,
            resumeId,
            signal: ac.signal,
            handlers: {
              onResumeUpdated: (event) => {
                if (event.resumeId !== resumeId) return;
                void queryClient.invalidateQueries({
                  queryKey: resumeQueryKey(resumeId),
                });
                void queryClient.invalidateQueries({
                  queryKey: resumeSectionsQueryKey(resumeId),
                });
                void queryClient.invalidateQueries({ queryKey: ['resume-list'] });
              },
              onError: (error) => {
                if (!ac.signal.aborted) {
                  console.error(error);
                }
              },
            },
          });
        } catch (error) {
          if (!ac.signal.aborted) {
            console.error(error);
          }
        }

        if (ac.signal.aborted) break;
        await wait(RECONNECT_DELAY_MS);
      }
    };

    void run();

    return () => {
      ac.abort();
    };
  }, [queryClient, resumeId]);
}
