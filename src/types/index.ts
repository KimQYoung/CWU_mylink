export type ThemeId = "xai" | "neobrutalism" | "modern";

export interface LinkItem {
  id: string;
  title: string;
  url?: string;
  endpointLabel?: string;     // 예: "ENDPOINT 01"
  displayUrl?: string;        // 예: "github.com/KimQYoung"
  description: string;
  buttonText: string;
  icon?: string;              // 아이콘 식별자 (예: "github", "code", "file-text")
  isActive: boolean;
  order: number;
  createdAt?: number;         // 생성 시각 (Unix timestamp, ms)
  updatedAt?: number;         // 최종 수정 시각 (Unix timestamp, ms)
  clicks?: number;            // 링크별 누적 클릭수
  isAction?: boolean;         // 외부 링크 이동 대신 내부 액션(예: 이메일 복사) 여부
  actionType?: "copy-email";
}

export interface DailyStat {
  date: string;               // 'YYYY-MM-DD' 형식
  views: number;              // 해당 일자 프로필 조회수
  clicks: number;             // 해당 일자 링크 클릭수
}

export interface AnalyticsSummary {
  totalViews: number;         // 누적 프로필 조회수
  totalClicks: number;        // 누적 링크 클릭 총합
  dailyHistory: DailyStat[];  // 최근 7~14일간 일별 통계
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
  analytics?: AnalyticsSummary;   // 통계 및 애널리틱스 데이터
}
