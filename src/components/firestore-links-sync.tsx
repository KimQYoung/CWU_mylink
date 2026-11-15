"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { mapFirebaseUser } from "@/lib/firebase-auth";
import { userQueryKeys } from "@/lib/queries/user-data";
import { useProfileStore } from "@/lib/store";

/**
 * 클라이언트 마운트 시점에 Firebase Authentication 세션을 구독하고,
 * 로그인/로그아웃 전환에 맞춰 인증 상태와 TanStack Query 캐시를 동기화하는 컴포넌트
 */
export function FirestoreLinksSync() {
  const queryClient = useQueryClient();
  const setAuthState = useProfileStore((state) => state.setAuthState);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthState("unauthenticated", null);
      return;
    }

    let previousUid: string | null = null;

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          const authUser = mapFirebaseUser(user);
          if (previousUid && previousUid !== authUser.uid) {
            queryClient.removeQueries({ queryKey: userQueryKeys.all });
          }
          previousUid = authUser.uid;
          setAuthState("authenticated", authUser);
        } else {
          previousUid = null;
          queryClient.removeQueries({ queryKey: userQueryKeys.all });
          setAuthState("unauthenticated", null);
        }
      },
      () => {
        previousUid = null;
        queryClient.removeQueries({ queryKey: userQueryKeys.all });
        setAuthState("unauthenticated", null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient, setAuthState]);

  return null;
}
