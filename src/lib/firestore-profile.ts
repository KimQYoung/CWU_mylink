import { FirebaseError } from "firebase/app";
import { updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type DocumentData,
  type Firestore,
} from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase";
import {
  normalizeDisplayNameKey,
  parseProfileAvatarUrl,
  sanitizeDisplayName,
} from "@/lib/schemas/profile";

export const DEFAULT_USER_PROFILE_PATH = "users/{user.uid}" as const;
export const DISPLAY_NAMES_COLLECTION = "displayNames" as const;

export interface FirestoreUserProfile {
  displayName: string;
  normalizedDisplayName: string;
  bio: string;
  avatarUrl: string;
  email?: string;
  updatedAt?: number;
}

export interface ResolvedPublicUser {
  uid: string;
  profile: FirestoreUserProfile;
}

export interface SaveUserProfileInput {
  displayName: string;
  bio: string;
  avatarUrl: string;
  email?: string | null;
}

export interface DisplayNameCheckResult {
  available: boolean;
  isOwnCurrent: boolean;
  normalizedDisplayName: string;
  reason?: "taken";
}

export class DuplicateDisplayNameError extends Error {
  constructor(
    message: string = "이미 다른 사용자가 사용 중인 Display Name입니다."
  ) {
    super(message);
    this.name = "DuplicateDisplayNameError";
  }
}

export class DisplayNamePermissionError extends Error {
  constructor(
    message: string = "Firestore 보안 규칙에서 Display Name 중복 확인(displayNames 또는 users 컬렉션 읽기/쓰기) 권한이 필요합니다."
  ) {
    super(message);
    this.name = "DisplayNamePermissionError";
  }
}

/**
 * 사용자 UID에 매핑된 Firestore 프로필 문서 경로를 반환합니다.
 */
export function getUserProfilePath(uid?: string | null): string {
  const normalizedUid = uid?.trim();
  return normalizedUid
    ? `users/${normalizedUid}`
    : DEFAULT_USER_PROFILE_PATH;
}

/**
 * Display Name으로부터 개인 공개 페이지 경로(`/[displayName]`)를 생성합니다.
 */
export function buildPublicProfileHref(displayName: string): string {
  const cleaned = sanitizeDisplayName(displayName);
  return cleaned ? `/${encodeURIComponent(cleaned)}` : "/";
}

/**
 * Display Name 정규화 키로부터 안전한 Firestore 문서 ID를 생성합니다.
 */
export function getDisplayNameDocId(displayName: string): string {
  const normalized = normalizeDisplayNameKey(displayName);
  // Firestore 문서 ID 예약어(., ..) 및 '/' 문자를 피하기 위해 prefix와 URL 인코딩을 함께 적용합니다.
  return `dn_${encodeURIComponent(normalized).replace(/\./g, "%2E")}`;
}

function requireUserId(uid: string): string {
  const normalizedUid = uid.trim();
  if (!normalizedUid) {
    throw new Error("로그인이 필요합니다. 사용자 UID를 확인할 수 없습니다.");
  }
  return normalizedUid;
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

function extractTimestampMs(value: unknown): number {
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
  return 0;
}

function isPermissionDeniedError(error: unknown): boolean {
  return error instanceof FirebaseError && error.code === "permission-denied";
}

async function findOtherUserWithDisplayName(
  db: Firestore,
  normalizedDisplayName: string,
  currentUid: string
): Promise<boolean> {
  const usersQuery = query(
    collection(db, "users"),
    where("normalizedDisplayName", "==", normalizedDisplayName),
    limit(2)
  );
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.some((docSnap) => docSnap.id !== currentUid);
}

function mapUserDataToProfile(data: DocumentData): FirestoreUserProfile {
  const displayName =
    typeof data.displayName === "string"
      ? sanitizeDisplayName(data.displayName)
      : "";
  const normalizedDisplayName =
    typeof data.normalizedDisplayName === "string" &&
    data.normalizedDisplayName.trim()
      ? data.normalizedDisplayName.trim().toLowerCase()
      : normalizeDisplayNameKey(displayName);
  const bio = typeof data.bio === "string" ? data.bio.trim() : "";
  const avatarUrl =
    typeof data.avatarUrl === "string" ? data.avatarUrl.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : undefined;
  const updatedAt = extractTimestampMs(data.updatedAt);

  return {
    displayName,
    normalizedDisplayName,
    bio,
    avatarUrl,
    ...(email ? { email } : {}),
    ...(updatedAt > 0 ? { updatedAt } : {}),
  };
}

/**
 * Firestore `users/{uid}` 문서에서 사용자의 저장된 프로필 정보를 조회합니다.
 */
export async function fetchUserProfile(
  uid: string
): Promise<FirestoreUserProfile | null> {
  const db = requireFirestoreDb();
  const normalizedUid = requireUserId(uid);
  const userSnap = await getDoc(doc(db, "users", normalizedUid));

  if (!userSnap.exists()) {
    return null;
  }

  return mapUserDataToProfile(userSnap.data());
}

/**
 * Display Name으로 Firestore에서 사용자(`uid` 및 프로필)를 검색합니다.
 * - `displayNames/{docId}` 인덱스 문서를 1차 조회하고, 미존재 또는 권한 제한 시 `users` 컬렉션을 조회합니다.
 */
export async function findUserByDisplayName(
  displayName: string
): Promise<ResolvedPublicUser | null> {
  const db = requireFirestoreDb();
  const cleanedDisplayName = sanitizeDisplayName(displayName);
  const normalizedDisplayName = normalizeDisplayNameKey(cleanedDisplayName);

  if (!normalizedDisplayName) {
    return null;
  }

  const docId = getDisplayNameDocId(normalizedDisplayName);
  const nameDocRef = doc(db, DISPLAY_NAMES_COLLECTION, docId);

  let displayNamesPermissionDenied = false;

  try {
    const nameSnap = await getDoc(nameDocRef);
    if (nameSnap.exists()) {
      const nameData = nameSnap.data();
      const uid =
        typeof nameData?.uid === "string" ? nameData.uid.trim() : "";
      if (uid) {
        try {
          const userProfile = await fetchUserProfile(uid);
          if (userProfile) {
            return {
              uid,
              profile: userProfile,
            };
          }
        } catch (userError) {
          if (!isPermissionDeniedError(userError)) {
            throw userError;
          }
        }

        const fallbackDisplayName =
          typeof nameData?.displayName === "string" &&
          nameData.displayName.trim()
            ? sanitizeDisplayName(nameData.displayName)
            : cleanedDisplayName;

        return {
          uid,
          profile: {
            displayName: fallbackDisplayName,
            normalizedDisplayName,
            bio: "",
            avatarUrl: "",
          },
        };
      }
    }
  } catch (error) {
    if (!isPermissionDeniedError(error)) {
      throw error;
    }
    displayNamesPermissionDenied = true;
  }

  // displayNames 인덱스 문서가 없는 기존 사용자나 권한 폴백을 위해 users 컬렉션 조회
  try {
    const normalizedQuery = query(
      collection(db, "users"),
      where("normalizedDisplayName", "==", normalizedDisplayName),
      limit(1)
    );
    const normalizedSnap = await getDocs(normalizedQuery);
    if (!normalizedSnap.empty) {
      const userDoc = normalizedSnap.docs[0];
      return {
        uid: userDoc.id,
        profile: mapUserDataToProfile(userDoc.data()),
      };
    }

    const exactQuery = query(
      collection(db, "users"),
      where("displayName", "==", cleanedDisplayName),
      limit(1)
    );
    const exactSnap = await getDocs(exactQuery);
    if (!exactSnap.empty) {
      const userDoc = exactSnap.docs[0];
      return {
        uid: userDoc.id,
        profile: mapUserDataToProfile(userDoc.data()),
      };
    }

    return null;
  } catch (usersQueryError) {
    if (isPermissionDeniedError(usersQueryError)) {
      if (displayNamesPermissionDenied) {
        throw new DisplayNamePermissionError(
          "Firestore 보안 규칙에서 사용자 프로필 조회(displayNames 또는 users 컬렉션 읽기) 권한이 필요합니다."
        );
      }
      return null;
    }
    throw usersQueryError;
  }
}

/**
 * 입력한 Display Name이 다른 사용자와 중복되는지 Firestore에서 확인합니다.
 * - `displayNames/{docId}` 인덱스 문서를 1차로 조회하고, 필요 시 `users` 컬렉션을 보조 조회합니다.
 */
export async function checkDisplayNameAvailability(
  displayName: string,
  currentUid: string
): Promise<DisplayNameCheckResult> {
  const db = requireFirestoreDb();
  const normalizedUid = requireUserId(currentUid);
  const normalizedDisplayName = normalizeDisplayNameKey(displayName);
  if (!normalizedDisplayName) {
    throw new Error("중복 확인할 Display Name을 입력해 주세요.");
  }

  const docId = getDisplayNameDocId(normalizedDisplayName);
  const nameDocRef = doc(db, DISPLAY_NAMES_COLLECTION, docId);

  try {
    const nameSnap = await getDoc(nameDocRef);
    if (nameSnap.exists()) {
      const ownerUid = nameSnap.data()?.uid;
      if (ownerUid === normalizedUid) {
        return {
          available: true,
          isOwnCurrent: true,
          normalizedDisplayName,
        };
      }
      return {
        available: false,
        isOwnCurrent: false,
        normalizedDisplayName,
        reason: "taken",
      };
    }

    // 인덱스 문서가 없는 기존 사용자 프로필과의 충돌도 가능 범위 내에서 추가 점검
    try {
      const takenInUsers = await findOtherUserWithDisplayName(
        db,
        normalizedDisplayName,
        normalizedUid
      );
      if (takenInUsers) {
        return {
          available: false,
          isOwnCurrent: false,
          normalizedDisplayName,
          reason: "taken",
        };
      }
    } catch (usersQueryError) {
      if (!isPermissionDeniedError(usersQueryError)) {
        throw usersQueryError;
      }
    }

    return {
      available: true,
      isOwnCurrent: false,
      normalizedDisplayName,
    };
  } catch (error) {
    if (!isPermissionDeniedError(error)) {
      throw error;
    }

    // displayNames 컬렉션 권한이 막혀 있는 경우 users 컬렉션 조회로 폴백 시도
    try {
      const takenInUsers = await findOtherUserWithDisplayName(
        db,
        normalizedDisplayName,
        normalizedUid
      );
      return takenInUsers
        ? {
            available: false,
            isOwnCurrent: false,
            normalizedDisplayName,
            reason: "taken",
          }
        : {
            available: true,
            isOwnCurrent: false,
            normalizedDisplayName,
          };
    } catch (fallbackError) {
      if (isPermissionDeniedError(fallbackError)) {
        throw new DisplayNamePermissionError();
      }
      throw fallbackError;
    }
  }
}

/**
 * Firestore 트랜잭션을 통해 Display Name 중복 여부를 원자적으로 검증한 뒤
 * `displayNames/{docId}` 예약과 `users/{uid}` 프로필 저장을 함께 수행합니다.
 */
export async function saveUserProfile(
  uid: string,
  input: SaveUserProfileInput
): Promise<FirestoreUserProfile> {
  const db = requireFirestoreDb();
  const normalizedUid = requireUserId(uid);

  const cleanedDisplayName = sanitizeDisplayName(input.displayName);
  const normalizedDisplayName = normalizeDisplayNameKey(cleanedDisplayName);
  const cleanedBio = input.bio.trim();
  const parsedAvatar = parseProfileAvatarUrl(input.avatarUrl);
  if (!parsedAvatar.valid) {
    throw new Error("올바른 프로필 이미지 URL을 입력해 주세요.");
  }
  const cleanedAvatarUrl = parsedAvatar.url;
  const cleanedEmail = input.email?.trim() || "";

  if (!normalizedDisplayName) {
    throw new Error("Display Name을 입력해 주세요.");
  }

  const newDocId = getDisplayNameDocId(normalizedDisplayName);
  const userRef = doc(db, "users", normalizedUid);
  const newNameRef = doc(db, DISPLAY_NAMES_COLLECTION, newDocId);

  try {
    await runTransaction(db, async (tx) => {
      const userSnap = await tx.get(userRef);
      const newNameSnap = await tx.get(newNameRef);

      const previousData = userSnap.exists() ? userSnap.data() : null;
      const previousNormalized =
        typeof previousData?.normalizedDisplayName === "string" &&
        previousData.normalizedDisplayName.trim()
          ? previousData.normalizedDisplayName.trim().toLowerCase()
          : typeof previousData?.displayName === "string" &&
            previousData.displayName.trim()
          ? normalizeDisplayNameKey(previousData.displayName)
          : "";

      const oldDocId = previousNormalized
        ? getDisplayNameDocId(previousNormalized)
        : null;
      const oldNameRef =
        oldDocId && oldDocId !== newDocId
          ? doc(db, DISPLAY_NAMES_COLLECTION, oldDocId)
          : null;
      const oldNameSnap = oldNameRef ? await tx.get(oldNameRef) : null;

      if (newNameSnap.exists() && newNameSnap.data()?.uid !== normalizedUid) {
        throw new DuplicateDisplayNameError();
      }

      if (
        oldNameRef &&
        oldNameSnap?.exists() &&
        oldNameSnap.data()?.uid === normalizedUid
      ) {
        tx.delete(oldNameRef);
      }

      tx.set(newNameRef, {
        uid: normalizedUid,
        displayName: cleanedDisplayName,
        normalizedDisplayName,
        updatedAt: serverTimestamp(),
      });

      tx.set(
        userRef,
        {
          displayName: cleanedDisplayName,
          normalizedDisplayName,
          bio: cleanedBio,
          avatarUrl: cleanedAvatarUrl,
          ...(cleanedEmail ? { email: cleanedEmail } : {}),
          updatedAt: serverTimestamp(),
          ...(!userSnap.exists() ? { createdAt: serverTimestamp() } : {}),
        },
        { merge: true }
      );
    });
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      throw new DisplayNamePermissionError(
        `프로필 저장 및 Display Name 중복 방지(${getUserProfilePath(normalizedUid)}, ${DISPLAY_NAMES_COLLECTION})에 대한 Firestore 권한이 필요합니다.`
      );
    }
    throw error;
  }

  // Firebase Auth 기본 프로필 displayName도 가능한 경우 동기화 (실패 시 Firestore 저장 결과는 유지)
  try {
    const auth = getFirebaseAuth();
    if (auth?.currentUser && auth.currentUser.uid === normalizedUid) {
      await updateProfile(auth.currentUser, {
        displayName: cleanedDisplayName,
      });
    }
  } catch {
    // Auth 보조 동기화 실패는 무시
  }

  return {
    displayName: cleanedDisplayName,
    normalizedDisplayName,
    bio: cleanedBio,
    avatarUrl: cleanedAvatarUrl,
    ...(cleanedEmail ? { email: cleanedEmail } : {}),
    updatedAt: Date.now(),
  };
}

/**
 * 프로필 조회/중복확인/저장 과정에서 발생한 오류를 한국어 메시지로 변환합니다.
 */
export function getProfileFirestoreErrorMessage(
  error: unknown,
  profilePath: string = DEFAULT_USER_PROFILE_PATH
): string {
  if (
    error instanceof DuplicateDisplayNameError ||
    error instanceof DisplayNamePermissionError
  ) {
    return error.message;
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "permission-denied":
        return `Firestore 프로필 접근 권한이 없습니다. 로그인 상태 및 보안 규칙(${profilePath})을 확인해 주세요.`;
      case "unavailable":
        return "Firestore 서버에 연결할 수 없습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.";
      case "unauthenticated":
        return "Firestore 인증이 필요합니다. Google 계정으로 로그인한 뒤 다시 시도해 주세요.";
      case "aborted":
        return "동시 요청으로 인해 저장이 중단되었습니다. 다시 한 번 시도해 주세요.";
      default:
        return `Firestore 프로필 처리 중 오류가 발생했습니다. (${error.code})`;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "프로필 정보를 처리하는 중 알 수 없는 오류가 발생했습니다.";
}
