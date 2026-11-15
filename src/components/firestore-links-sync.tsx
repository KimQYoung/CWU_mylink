"use client";

import { useEffect } from "react";
import { useProfileStore } from "@/lib/store";

/**
 * 페이지 로드(클라이언트 마운트) 시점에 Firestore `users/anonymous/links` 컬렉션을
 * createdAt 최신순으로 1회 조회하여 Zustand 스토어에 반영하는 컴포넌트 (비실시간)
 */
export function FirestoreLinksSync() {
  const loadFirestoreLinks = useProfileStore(
    (state) => state.loadFirestoreLinks
  );

  useEffect(() => {
    void loadFirestoreLinks();
  }, [loadFirestoreLinks]);

  return null;
}
