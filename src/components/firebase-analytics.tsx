"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";

/**
 * 클라이언트 마운트 시점에 Firebase Analytics를 지연 초기화하는 컴포넌트
 */
export function FirebaseAnalytics() {
  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);

  return null;
}
