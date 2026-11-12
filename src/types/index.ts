export type ThemeId = "xai" | "neobrutalism" | "modern";

export interface LinkItem {
  id: string;
  title: string;
  url?: string;
  endpointLabel?: string;     // 예: "ENDPOINT 01"
  displayUrl?: string;        // 예: "github.com/KimQYoung"
  description: string;
  buttonText: string;
  isActive: boolean;
  order: number;
  isAction?: boolean;         // 외부 링크 이동 대신 내부 액션(예: 이메일 복사) 여부
  actionType?: "copy-email";
}

export interface CapabilityItem {
  category: string;
  headline: string;
  desc: string;
}

export interface UserProfile {
  username: string;           // 예: "KimQYoung"
  name: string;               // 예: "Kim Kyu Young"
  callsign: string;           // 예: "@KimQYoung"
  discipline: string;         // 예: "Software Eng"
  status: string;             // 예: "Deploying Vibe Code"
  headline: string;           // 예: "Junior software engineer exploring frontier web architectures..."
  statementLead: string;      // 예: "아이디어를 코드로 실현하는 개발자 김규영입니다."
  statementBody: string;      // 상세 소개글
  avatarUrl: string;          // 예: "/avatar.png"
  email: string;              // 연락처 이메일
  theme: ThemeId;             // 선택된 테마
  links: LinkItem[];          // 링크 목록
  capabilities: CapabilityItem[]; // 역량/기술 스택 목록
}
