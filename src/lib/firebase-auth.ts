import { FirebaseError } from "firebase/app";
import { signInWithPopup, signOut, type User } from "firebase/auth";
import { createGoogleAuthProvider, getFirebaseAuth } from "@/lib/firebase";

export interface AuthUserInfo {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

/**
 * Firebase Auth User 객체를 직렬화 가능한 요약 정보 객체로 변환합니다.
 */
export function mapFirebaseUser(user: User): AuthUserInfo {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

/**
 * 사용자 이메일의 앞부분(@ 이전 로컬 파트)을 우선 Display Name으로 반환합니다.
 * 이메일이 없는 경우에만 Firebase displayName 또는 기본값을 사용합니다.
 */
export function getDisplayNameFromAuthUser(
  user: Pick<AuthUserInfo, "email" | "displayName"> | null | undefined
): string {
  const emailPrefix = user?.email?.split("@")[0]?.trim();
  if (emailPrefix) {
    return emailPrefix;
  }

  return user?.displayName?.trim() || "MyLink User";
}

/**
 * 로그인된 사용자 정보로부터 URL 세그먼트에 사용할 username을 생성합니다.
 */
export function deriveUsernameFromAuthUser(user: AuthUserInfo): string {
  const emailLocal = user.email?.split("@")[0]?.trim() ?? "";
  const sanitizedEmail = emailLocal.replace(/[^a-zA-Z0-9._-]/g, "");
  if (sanitizedEmail) {
    return sanitizedEmail;
  }

  const sanitizedName =
    user.displayName?.trim().replace(/[^a-zA-Z0-9._-]/g, "") ?? "";
  if (sanitizedName) {
    return sanitizedName;
  }

  return user.uid.slice(0, 12);
}

/**
 * 로그인된 사용자 정보로부터 표시용 핸들(@callsign)을 생성합니다.
 */
export function deriveCallsignFromAuthUser(user: AuthUserInfo): string {
  return `@${deriveUsernameFromAuthUser(user)}`;
}

/**
 * Google 소셜 로그인 팝업을 실행하고 로그인된 사용자 정보를 반환합니다.
 */
export async function signInWithGoogle(): Promise<AuthUserInfo> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Firebase 환경 변수(NEXT_PUBLIC_FIREBASE_*)가 설정되지 않아 Google 로그인을 진행할 수 없습니다."
    );
  }

  const provider = createGoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return mapFirebaseUser(credential.user);
}

/**
 * 현재 로그인된 Firebase Authentication 세션에서 로그아웃합니다.
 */
export async function signOutGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

/**
 * Firebase Authentication 오류를 한국어 안내 문구로 변환합니다.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/popup-closed-by-user":
        return "Google 로그인 팝업이 닫혔습니다. 다시 로그인 버튼을 눌러 주세요.";
      case "auth/cancelled-popup-request":
        return "이미 진행 중인 로그인 창이 있습니다. 잠시 후 다시 시도해 주세요.";
      case "auth/popup-blocked":
        return "브라우저에서 로그인 팝업이 차단되었습니다. 팝업 차단을 해제한 뒤 다시 시도해 주세요.";
      case "auth/unauthorized-domain":
        return "현재 접속 도메인이 Firebase Authentication 승인 도메인에 등록되어 있지 않습니다.";
      case "auth/operation-not-allowed":
        return "Firebase Console에서 Google 로그인 제공업체가 활성화되어 있지 않습니다.";
      case "auth/network-request-failed":
        return "네트워크 연결에 실패했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.";
      case "auth/user-disabled":
        return "비활성화된 계정입니다. 관리자에게 문의해 주세요.";
      default:
        return `Google 로그인 중 오류가 발생했습니다. (${error.code})`;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Google 로그인을 처리하는 중 알 수 없는 오류가 발생했습니다.";
}
