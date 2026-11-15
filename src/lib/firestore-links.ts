import { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { LinkItem } from "@/types";

export const ANONYMOUS_USER_ID = "anonymous";
export const FIRESTORE_LINKS_PATH = `users/${ANONYMOUS_USER_ID}/links` as const;

export interface CreateAnonymousLinkInput {
  title: string;
  url: string;
  displayUrl: string;
  endpointLabel?: string;
  description: string;
  buttonText: string;
  icon: string;
  isActive: boolean;
  order: number;
  clicks?: number;
}

export interface UpdateAnonymousLinkInput {
  title: string;
  url: string;
  displayUrl: string;
  description: string;
  buttonText: string;
  icon: string;
  isActive: boolean;
}

function getLinksCollectionRef(db: Firestore) {
  return collection(db, "users", ANONYMOUS_USER_ID, "links");
}

function getLinkDocRef(db: Firestore, linkId: string) {
  return doc(db, "users", ANONYMOUS_USER_ID, "links", linkId);
}

function requireFirestoreDb(): Firestore {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error(
      "Firebase 환경 변수(NEXT_PUBLIC_FIREBASE_*)가 설정되지 않아 Firestore에 연결할 수 없습니다."
    );
  }
  return db;
}

function extractCreatedAtMs(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis?: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function mapDocToLinkItem(docSnap: QueryDocumentSnapshot<DocumentData>): LinkItem {
  const data = docSnap.data();

  const order =
    typeof data.order === "number" && Number.isFinite(data.order)
      ? data.order
      : Number.MAX_SAFE_INTEGER;

  return {
    id: docSnap.id,
    title:
      typeof data.title === "string" && data.title.trim()
        ? data.title
        : "Untitled Link",
    description: typeof data.description === "string" ? data.description : "",
    buttonText:
      typeof data.buttonText === "string" && data.buttonText.trim()
        ? data.buttonText
        : "Open Link",
    isActive: typeof data.isActive === "boolean" ? data.isActive : true,
    order,
    createdAt: extractCreatedAtMs(data.createdAt),
    clicks:
      typeof data.clicks === "number" && Number.isFinite(data.clicks)
        ? data.clicks
        : 0,
    ...(typeof data.url === "string" ? { url: data.url } : {}),
    ...(typeof data.displayUrl === "string"
      ? { displayUrl: data.displayUrl }
      : {}),
    ...(typeof data.endpointLabel === "string"
      ? { endpointLabel: data.endpointLabel }
      : {}),
    ...(typeof data.icon === "string" ? { icon: data.icon } : { icon: "globe" }),
    ...(typeof data.isAction === "boolean" ? { isAction: data.isAction } : {}),
    ...(data.actionType === "copy-email"
      ? { actionType: "copy-email" as const }
      : {}),
  };
}

/**
 * 링크 목록을 createdAt 기준 최신순(내림차순)으로 정렬합니다.
 * createdAt이 없거나 동일한 항목은 order 오름차순으로 보조 정렬합니다.
 */
export function sortLinksByCreatedAtDesc(links: LinkItem[]): LinkItem[] {
  return [...links].sort((a, b) => {
    const createdDiff = (b.createdAt ?? 0) - (a.createdAt ?? 0);
    if (createdDiff !== 0) {
      return createdDiff;
    }
    return a.order - b.order;
  });
}

/**
 * Firestore `users/anonymous/links` 컬렉션에서 createdAt 최신순으로 링크 목록을 1회 조회합니다.
 */
export async function fetchAnonymousLinks(): Promise<LinkItem[]> {
  const db = requireFirestoreDb();
  const linksQuery = query(
    getLinksCollectionRef(db),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(linksQuery);
  return sortLinksByCreatedAtDesc(snapshot.docs.map(mapDocToLinkItem));
}

/**
 * 새 링크를 Firestore `users/anonymous/links` 컬렉션에 저장합니다.
 */
export async function createAnonymousLink(
  input: CreateAnonymousLinkInput
): Promise<LinkItem> {
  const db = requireFirestoreDb();
  const endpointLabel =
    input.endpointLabel ?? `ENDPOINT ${String(input.order).padStart(2, "0")}`;
  const buttonText = input.buttonText.trim() || "Open Link";
  const icon = input.icon || "globe";
  const clicks = input.clicks ?? 0;

  const payload = {
    title: input.title,
    url: input.url,
    displayUrl: input.displayUrl,
    endpointLabel,
    description: input.description,
    buttonText,
    icon,
    isActive: input.isActive,
    order: input.order,
    clicks,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(getLinksCollectionRef(db), payload);

  return {
    id: docRef.id,
    title: input.title,
    url: input.url,
    displayUrl: input.displayUrl,
    endpointLabel,
    description: input.description,
    buttonText,
    icon,
    isActive: input.isActive,
    order: input.order,
    createdAt: Date.now(),
    clicks,
  };
}

/**
 * Firestore `users/anonymous/links` 컬렉션의 특정 링크 문서를 수정합니다.
 */
export async function updateAnonymousLink(
  linkId: string,
  input: UpdateAnonymousLinkInput
): Promise<void> {
  const db = requireFirestoreDb();
  const buttonText = input.buttonText.trim() || "Open Link";
  const icon = input.icon || "globe";

  await updateDoc(getLinkDocRef(db, linkId), {
    title: input.title,
    url: input.url,
    displayUrl: input.displayUrl,
    description: input.description,
    buttonText,
    icon,
    isActive: input.isActive,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Firestore에 저장된 링크의 공개 활성화 상태를 업데이트합니다.
 */
export async function updateAnonymousLinkActive(
  linkId: string,
  isActive: boolean
): Promise<void> {
  const db = requireFirestoreDb();
  await updateDoc(getLinkDocRef(db, linkId), {
    isActive,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Firestore에 저장된 링크의 클릭 수를 원자적으로 1 증가시킵니다.
 */
export async function incrementAnonymousLinkClicks(
  linkId: string
): Promise<void> {
  const db = requireFirestoreDb();
  await updateDoc(getLinkDocRef(db, linkId), {
    clicks: increment(1),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Firestore에서 특정 링크 문서를 삭제합니다.
 */
export async function deleteAnonymousLink(linkId: string): Promise<void> {
  const db = requireFirestoreDb();
  await deleteDoc(getLinkDocRef(db, linkId));
}

/**
 * Firebase/Firestore 오류를 사용자에게 안내할 수 있는 한국어 메시지로 변환합니다.
 */
export function getFirestoreErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "permission-denied":
        return "Firestore 저장 권한이 없습니다. Firebase 보안 규칙(users/anonymous/links)을 확인해 주세요.";
      case "unavailable":
        return "Firestore 서버에 연결할 수 없습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.";
      case "unauthenticated":
        return "Firestore 인증이 필요합니다. 보안 규칙 또는 인증 설정을 확인해 주세요.";
      case "not-found":
        return "대상 Firestore 문서를 찾을 수 없습니다.";
      default:
        return `Firestore 요청 중 오류가 발생했습니다. (${error.code})`;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Firestore에 링크를 저장하는 중 알 수 없는 오류가 발생했습니다.";
}
