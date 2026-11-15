"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { mapFirebaseUser } from "@/lib/firebase-auth";
import { useProfileStore } from "@/lib/store";

/**
 * 클라이언트 마운트 시점에 Firebase Authentication 세션을 구독하고,
 * 로그인된 사용자 UID에 매핑된 `users/{user.uid}/links` 컬렉션을 조회하는 동기화 컴포넌트
 */
export function FirestoreLinksSync() {
  const setAuthState = useProfileStore((state) => state.setAuthState);
  const loadFirestoreLinks = useProfileStore(
    (state) => state.loadFirestoreLinks
  );

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthState("unauthenticated", null);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          const authUser = mapFirebaseUser(user);
          setAuthState("authenticated", authUser);
          void loadFirestoreLinks(authUser.uid);
        } else {
          setAuthState("unauthenticated", null);
        }
      },
      () => {
        setAuthState("unauthenticated", null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [setAuthState, loadFirestoreLinks]);

  return null;
}
