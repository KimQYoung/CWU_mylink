export { cn } from "cn";

/**
 * 브라우저 클립보드에 텍스트를 안전하게 복사합니다.
 */
export function copyTextToClipboard(text: string): void {
  try {
    void navigator.clipboard?.writeText(text);
  } catch {
    // 클립보드 권한이 제한된 환경에서도 호출 측 UI 피드백을 방해하지 않습니다.
  }
}
