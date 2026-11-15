import { ImageResponse } from "next/og";
import { OG_COLORS, OG_SIZE } from "@/lib/og-utils";

export const alt = "MyLink — Development in One Link";
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * 일반 경로(/, /stats, /links 등)에 상속되는 MyLink 기본 Open Graph 이미지
 * - 랜딩 페이지(SiteHeader + LandingView 히어로 섹션)의 타이포그래피와 여백을 1200x630 캔버스에 간결하게 재현합니다.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: OG_COLORS.canvas,
          color: OG_COLORS.ink,
          fontWeight: 400,
        }}
      >
        {/* 상단 헤더 바 (MyLink 워드마크) */}
        <div
          style={{
            height: 68,
            padding: "0 72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            borderBottom: `1px solid ${OG_COLORS.hairline}`,
            backgroundColor: OG_COLORS.canvas,
          }}
        >
          <span
            style={{
              fontSize: 20,
              letterSpacing: "-0.02em",
              color: OG_COLORS.ink,
            }}
          >
            MyLink
          </span>
        </div>

        {/* 메인 히어로 섹션 (LandingView HERO SECTION 기반) */}
        <div
          style={{
            flex: 1,
            padding: "0 72px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 32,
          }}
        >
          {/* 1) 상단 아이브로우 필 (LandingEyebrowPill 재현) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 9999,
              border: `1px solid ${OG_COLORS.hairline}`,
              backgroundColor: OG_COLORS.canvasCard,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: 9999,
                backgroundColor: OG_COLORS.sunset,
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: 13,
                letterSpacing: "1.4px",
                color: OG_COLORS.bodyMid,
              }}
            >
              {"// PERSONAL LINK ENDPOINT SYSTEM"}
            </span>
          </div>

          {/* 2) 메인 디스플레이 헤드라인 & 리드 문구 그룹 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 18,
                fontSize: 86,
                fontWeight: 400,
                letterSpacing: "-0.04em",
                lineHeight: 1.04,
              }}
            >
              <span style={{ color: OG_COLORS.ink }}>Development in</span>
              <span style={{ color: OG_COLORS.sunset }}>One Link.</span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                fontSize: 24,
                fontWeight: 400,
                color: OG_COLORS.body,
                lineHeight: 1.55,
              }}
            >
              <span>GitHub, 기술 블로그, 포트폴리오, 이메일 복사까지.</span>
              <span>
                흩어진 개발자의 링크를 단 하나의 엔드포인트로 연결하고 클릭
                통계를 확인하세요.
              </span>
            </div>
          </div>

          {/* 3) 하단 모노 스펙 라인 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              paddingTop: 4,
              fontSize: 13,
              letterSpacing: "1.3px",
              color: OG_COLORS.bodyMid,
            }}
          >
            <span>GOOGLE OAUTH 2.0</span>
            <span style={{ color: OG_COLORS.canvasMid }}>/</span>
            <span>{"CUSTOM /{HANDLE}"}</span>
            <span style={{ color: OG_COLORS.canvasMid }}>/</span>
            <span>CLICK TELEMETRY</span>
          </div>
        </div>

        {/* 하단 헤어라인 바 (푸터 크롬) */}
        <div
          style={{
            height: 52,
            padding: "0 72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${OG_COLORS.hairline}`,
            backgroundColor: OG_COLORS.canvas,
            fontSize: 12,
            letterSpacing: "1.2px",
            color: OG_COLORS.bodyMid,
          }}
        >
          <span>© 2026 MyLink. All rights reserved.</span>
          <span>{"MYLINK // PERSONAL ENDPOINT HUB"}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
