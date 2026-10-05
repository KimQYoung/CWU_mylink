# [PRD] 링크트리 클론 서비스 "마이링크 (MyLink)" 기능 정의서

---

## 1. 프로젝트 개요 (Overview)

### 1.1 서비스 목적 및 시연 시나리오
- **서비스명**: 마이링크 (MyLink)
- **개념**: 개발자 및 크리에이터 개인을 위한 노션(Notion) 감성의 1인 맞춤형 바이오 링크 및 포트폴리오 웹 애플리케이션
- **시연 목적 및 개발 방향**:
  - 현재 진행 중인 **단계별 라이브 시연**에 최적화하여 점진적으로 기능을 구축합니다.
  - **1단계(현재 목표)**에서는 복잡한 관리자 대시보드, 서버 API, 인증, 통계 기능은 모두 배제하고, **브라우저 로컬 스토리지(LocalStorage) 기반의 완성도 높은 프로필 페이지**를 단독 구현하는 데 집중합니다.
  - 2단계 이후에서 관리자 대시보드, 순서 변경, 통계 분석 등으로 점진 확장합니다.

### 1.2 핵심 가치 (1단계 시연 관점)
1. **완성도 높은 Notion 디자인 시스템**:
   - 종이 질감 캔버스(`colors.canvas-soft`), 세련된 타이포그래피, 헤어라인 보더, 포인트 컬러 스티커 팔레트 적용
2. **독립적이고 빠른 로컬 스토리지 연동**:
   - 별도 백엔드/DB 설정 없이 브라우저 `localStorage`를 통해 기본 프로필 데이터를 읽고 보존
   - 시연 시 네트워크 지연 없는 즉각적인 데이터 반응성 확보
3. **사용자 친화적 마이크로 인터랙션**:
   - 이메일 원클릭 클립보드 복사(토스트 피드백), 링크 새 탭 이동 및 호버 인터랙션

### 1.3 사용자 시나리오 (User Scenarios)

#### 🧑‍💻 시나리오 A: 방문자 (채용 담당자 / 협업 제안자)
> *"GitHub 리포지토리나 SNS 프로필에 걸린 마이링크를 통해 지원자의 핵심 역량과 포트폴리오를 빠르게 파악하고 연락하고 싶다."*
1. **접속 및 첫인상**: 방문자가 SNS/이력서의 대표 URL(`https://...`)을 클릭하여 접속하면, 지연 없이 노션 특유의 차분하고 단정한 프로필 카드가 렌더링된다.
2. **상태 및 역량 탐색**: 상단의 초록색 펄스 뱃지(`Open for Projects`)를 통해 현재 프로젝트 제안이 가능한 상태임을 확인하고, 콜아웃 소개글과 기술 스택(React, Next.js 등) 태그를 훑어본다.
3. **포트폴리오 탐색**: 주요 링크 목록에서 `GitHub 프로필` 및 `기술 블로그` 버튼을 클릭하여 새 탭에서 프로젝트 소스 코드와 기술 글을 확인한다.
4. **연락처 복사**: 상단 헤더의 `이메일 복사` 버튼을 클릭하여 `contact@example.com`을 원클릭으로 클립보드에 복사하고, 토스트 피드백(`복사됨`)을 확인한 뒤 메일을 발송한다.

#### 🎤 시나리오 B: 프로필 소유자 / 발표자 (라이브 시연 환경)
> *"외부 백엔드나 복잡한 설정 없이, 브라우저 로컬 스토리지만으로 데이터가 어떻게 유지되고 표시되는지 청중에게 명확히 시연하고 싶다."*
1. **초기 페이지 로드**: 발표자가 브라우저에서 서비스에 접속한다. 로컬 스토리지에 데이터가 없더라도 시스템이 기본 프로필 데이터(`DEFAULT_PROFILE_DATA`)를 자동으로 로컬 스토리지에 생성하고 매끄럽게 화면을 렌더링한다.
2. **데이터 영속성 확인**: 브라우저 개발자 도구(Application > Local Storage)를 열어 `mylink_profile_data` 키로 데이터가 저장되어 있음을 보여준다.
3. **데이터 반응성 검증**: 로컬 스토리지 내의 텍스트나 링크를 수정한 뒤 페이지를 새로고침하면, 수정한 내용이 즉시 반영되어 유지되는 모습을 시연한다.

#### 🚀 시나리오 C: 향후 확장 시나리오 (Phase 2+ 관리자 편집 및 통계)
> *"웹 브라우저에서 직접 링크를 추가하고 클릭 수 통계를 확인하고 싶다."*
1. 관리자 모드에 진입하여 링크 추가 폼에 새로운 프로젝트 URL을 입력하고 드래그 앤 드롭으로 최상단에 배치한다.
2. 통계 탭에서 지금까지 어떤 링크(GitHub vs 블로그)가 몇 번 클릭되었는지 시각화된 차트로 확인한다.

---

## 2. 단계별 개발 범위 (Phased Scope)

| 단계 | 구분 | 주요 내용 | 진행 상태 |
|---|---|---|---|
| **Phase 1** | **[현재 목표] 로컬스토리지 프로필 페이지 (MVP)** | • 기본 프로필 데이터 구조 정의<br>• LocalStorage 읽기 및 기본값 폴백 구조<br>• 노션 스타일 프로필 페이지 완성(배너, 아바타, 뱃지, 소개, 메타타일, 스킬, 링크 목록)<br>• 이메일 복사 인터랙션 | **진행 예정** |
| **Phase 2** | **간이 편집 / 대시보드 (후속 단계)** | • 프로필/링크 수정을 위한 관리자 화면 구성<br>• 링크 추가/수정/삭제 및 드래그 앤 드롭 정렬 | 후속 진행 |
| **Phase 3** | **인증 및 통계 분석 (후속 단계)** | • 관리자 인증(NextAuth 등)<br>• 방문자 수 및 링크별 클릭 수 트래킹 | 후속 진행 |

---

## 3. Phase 1 세부 기능 요구사항 (Functional Requirements)

### 3.1 로컬 스토리지 데이터 관리 (`localStorage`)
1. **스토리지 키**: `mylink_profile_data`
2. **초기 로딩 시나리오**:
   - 브라우저 로컬 스토리지에서 `mylink_profile_data` 조회
   - 데이터가 없을 경우: 미리 정의된 기본 프로필 데이터(`DEFAULT_PROFILE_DATA`)를 로컬 스토리지에 자동 초기화하여 저장 후 렌더링
   - 데이터가 있을 경우: 저장된 JSON 데이터를 파싱하여 화면에 렌더링
3. **SSR(Server-Side Rendering) 하이드레이션 대비**:
   - Next.js 환경에서 서버/클라이언트 불일치(Hydration Mismatch)를 방지할 수 있도록 클라이언트 마운트 이후 안전하게 로컬 스토리지 데이터를 동기화

### 3.2 메인 프로필 페이지 구성 요소
1. **상단 네비게이션 바**:
   - 노션 스타일 문서 아이콘(`📄`) 및 경로 표시 (`[이름] / Profile`)
   - **이메일 복사 버튼**: 클릭 시 클립보드에 이메일 주소 복사 및 `이메일 복사` → `복사됨` 일시적 상태 변경 (2.4초 딜레이)
2. **히어로 커버 배너 (Hero Cover Band)**:
   - 노션의 딥 인디고(Deep Indigo, `#213183`) 배경 또는 커스텀 배경
   - 컨스텔레이션 도트 패턴 및 장식용 스티커 뱃지
3. **프로필 아이덴티티 영역**:
   - **아바타 이미지**: 배너 하단과 오버랩되는 원형 프로필 이미지 (화이트 보더 & 섀도우)
   - **상태 뱃지 (Status Pill Badge)**: 예: `Open for Projects` (그린 펄스 닷 포함)
   - **직무/소속 (Eyebrow)**: 카테고리 텍스트(예: `Student & Developer`) 및 소속
   - **이름 & 서브 타이틀**: 대형 타이틀 헤드라인
4. **노션 콜아웃 박스 (Callout Box)**:
   - 이모지 아이콘(`💡`)과 함께 본인을 소개하는 강조 인용 문구 블록
5. **메타 정보 요약 타일 (Summary Tiles)**:
   - 전공, 위치, 관심 분야 등 3개의 핵심 메타데이터 카드
   - 장식용 스티커 컬러 닷(보라, 틸, 오렌지) 적용
6. **보유 기술 스택 태그 (Skills & Tech Stack)**:
   - React, Next.js, TypeScript, Tailwind CSS 등 태그별 전용 컬러 닷과 함께 노션 태그 스타일로 렌더링
7. **링크 목록 (Links & Contact)**:
   - GitHub, 블로그(Velog 등), 포트폴리오, SNS 등 활성화된 링크 버튼 목록
   - 각 링크별 아이콘, 타이틀, 화살표 호버 인터랙션
   - 클릭 시 새 창 열림 (`target="_blank"`, `rel="noopener noreferrer"`)

---

## 4. 데이터 모델 정의 (Phase 1 LocalStorage Schema)

```typescript
export interface ProfileData {
  profile: {
    name: string;
    subTitle: string; // 예: "QYoung Kim · @KimQYoung"
    role: string;     // 예: "Student & Developer"
    affiliation: string; // 예: "컴퓨터공학과 2학년"
    statusBadge: {
      text: string;
      isActive: boolean;
    };
    avatarUrl: string;
    bannerBg: string; // 색상 코드(#213183) 또는 이미지 경로
    bioCallout: {
      emoji: string;
      text: string;
    };
    metaTiles: Array<{
      id: string;
      label: string;
      value: string;
      dotColor: string;
    }>;
    techStacks: Array<{
      name: string;
      dotColor: string;
    }>;
    contactEmail: string;
  };
  links: Array<{
    id: string;
    title: string;
    url: string;
    icon: "github" | "velog" | "blog" | "custom";
    isPrimary?: boolean; // Notion Blue 강조 버튼 여부
  }>;
}
```

---

## 5. UI/UX 디자인 가이드라인 (Notion Design System)

- **배경 캔버스**: `#f6f5f4` (Warm Paper Canvas - 종이 질감 오프화이트)
- **카드 및 패널 표면**: `#ffffff` (White)
- **보더**: `#e6e6e6` (1px Hairline)
- **타이포그래피**: `Inter`, Near-black `#000000`, Tight Tracking
- **포인트 액션**: `#0075de` (Notion Blue - Primary 버튼 전용)
- **스티커 팔레트**: Sky(`#62aef0`), Purple(`#d6b6f6`), Pink(`#ff64c8`), Orange(`#dd5b00`), Teal(`#2a9d99`), Green(`#1aae39`)

---

## 6. Phase 1 작업 목록 (Action Checklist)

- [ ] `DEFAULT_PROFILE_DATA` 상수 정의 및 타입 인터페이스 선언 (`src/types/profile.ts`, `src/constants/defaultProfile.ts`)
- [ ] 브라우저 `localStorage`에서 데이터를 읽어오고 초기화하는 클라이언트 훅/유틸리티 작성
- [ ] 기존 정적 `app/page.tsx`를 로컬 스토리지 상태를 구독하는 반응형 프로필 페이지로 리팩토링
- [ ] 하이드레이션 깜빡임 방지 및 로딩 스켈레톤(또는 초기 부드러운 전환) 처리
- [ ] 브라우저 환경에서 시연 검증
