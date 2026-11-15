"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * TanStack Query 클라이언트 프로바이더
 * - 실시간 구독이나 백그라운드 폴링 없이, 명시적 조회·새로고침·Mutation 후 무효화로만 데이터를 갱신합니다.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchInterval: false,
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
