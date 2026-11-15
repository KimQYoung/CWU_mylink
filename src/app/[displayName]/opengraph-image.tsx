import { ImageResponse } from "next/og";
import {
  OG_COLORS,
  OG_SIZE,
  OgArrowUpRightIcon,
  OgLinkIcon,
  resolvePublicProfileForOg,
  truncateText,
} from "@/lib/og-utils";

export const alt = "MyLink 공개 프로필";
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * Display Name 길이에 따라 2단 레이아웃에 균형 있게 들어가도록 타이틀 크기를 계산합니다.
 */
function getDisplayNameFontSize(name: string): number {
  const length = name.length;
  if (length <= 12) return 52;
  if (length <= 20) return 44;
  return 38;
}

/**
 * 동적 경로(/[displayName]) 전용 맞춤형 Open Graph 이미지
 * - Firestore 프로필·아바타·활성 엔드포인트를 반영하여 xAI Minimal Dark 스타일 카드를 생성합니다.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ displayName: string }>;
}) {
  const { displayName: rawDisplayName } = await params;
  const profileData = await resolvePublicProfileForOg(rawDisplayName);

  const safeDisplayName = truncateText(profileData.displayName, 28);
  const shortHandle = truncateText(profileData.displayName, 18);
  const routeBadgeLabel = `LIVE ROUTE · /${truncateText(profileData.displayName, 20)}`;
  const bioCopy = truncateText(profileData.bio, 110);
  const titleFontSize = getDisplayNameFontSize(safeDisplayName);
  const fallbackInitial =
    (safeDisplayName.trim().charAt(0) || "M").toUpperCase();
  const endpointCountText = String(profileData.totalActiveCount).padStart(
    2,
    "0"
  );

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
        {/* 상단 크롬 헤더 바 */}
        <div
          style={{
            height: 68,
            padding: "0 56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${OG_COLORS.hairline}`,
            backgroundColor: OG_COLORS.canvas,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
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
              {"// PUBLIC PROFILE ENDPOINT"}
            </span>
            <span
              style={{
                fontSize: 13,
                color: OG_COLORS.canvasMid,
              }}
            >
              /
            </span>
            <span
              style={{
                fontSize: 14,
                letterSpacing: "1.2px",
                color: OG_COLORS.ink,
              }}
            >
              MYLINK
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 9999,
              border: `1px solid ${OG_COLORS.emeraldBorder}`,
              backgroundColor: OG_COLORS.emeraldBg,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: 9999,
                backgroundColor: OG_COLORS.emerald,
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: 12,
                letterSpacing: "1.1px",
                color: OG_COLORS.emerald,
              }}
            >
              {routeBadgeLabel}
            </span>
          </div>
        </div>

        {/* 메인 좌우 비대칭 2단 레이아웃 */}
        <div
          style={{
            flex: 1,
            padding: "44px 56px",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            gap: 44,
          }}
        >
          {/* 좌측: 사용자 프로필 아이덴티티 영역 */}
          <div
            style={{
              width: 550,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            {/* 상단 프로필 블록 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 22,
              }}
            >
              {/* 아바타 + 핸들 헤더 행 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 9999,
                    border: `1px solid ${OG_COLORS.pillBorder}`,
                    backgroundColor: OG_COLORS.canvasSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  {profileData.avatarDataUri ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileData.avatarDataUri}
                      alt={`${safeDisplayName} 프로필 아바타`}
                      width={86}
                      height={86}
                      style={{
                        width: 86,
                        height: 86,
                        borderRadius: 9999,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 36,
                          color: OG_COLORS.ink,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {fallbackInitial}
                      </span>
                      <div
                        style={{
                          position: "absolute",
                          right: 5,
                          bottom: 5,
                          width: 12,
                          height: 12,
                          borderRadius: 9999,
                          backgroundColor: OG_COLORS.sunset,
                          border: `2px solid ${OG_COLORS.canvas}`,
                          display: "flex",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 아바타 우측 메타 컬럼 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      alignSelf: "flex-start",
                      gap: 7,
                      padding: "5px 12px",
                      borderRadius: 9999,
                      border: `1px solid ${OG_COLORS.hairline}`,
                      backgroundColor: OG_COLORS.canvasCard,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 9999,
                        backgroundColor: OG_COLORS.sunset,
                        display: "flex",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        letterSpacing: "1.2px",
                        color: OG_COLORS.bodyMid,
                      }}
                    >
                      PUBLIC HANDLE
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 22,
                      color: OG_COLORS.sunset,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {`@${truncateText(profileData.displayName, 22)}`}
                  </span>
                </div>
              </div>

              {/* 사용자 Display Name 타이틀 */}
              <div
                style={{
                  display: "flex",
                  fontSize: titleFontSize,
                  fontWeight: 400,
                  letterSpacing: "-0.035em",
                  color: OG_COLORS.ink,
                  lineHeight: 1.1,
                }}
              >
                {safeDisplayName}
              </div>

              {/* 한 줄 소개 (bio) */}
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: OG_COLORS.body,
                  lineHeight: 1.55,
                }}
              >
                {bioCopy}
              </div>
            </div>

            {/* 하단 액션 & 지표 필 스트립 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 22px",
                  borderRadius: 9999,
                  backgroundColor: OG_COLORS.ink,
                  color: OG_COLORS.canvas,
                  fontSize: 16,
                }}
              >
                <span>
                  {`프로필 방문하기 · /${truncateText(profileData.displayName, 16)}`}
                </span>
                <OgArrowUpRightIcon color={OG_COLORS.canvas} size={15} />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 20px",
                  borderRadius: 9999,
                  border: `1px solid ${OG_COLORS.pillBorder}`,
                  backgroundColor: OG_COLORS.canvas,
                  color: OG_COLORS.ink,
                  fontSize: 15,
                  letterSpacing: "0.7px",
                }}
              >
                {`${endpointCountText} ACTIVE ENDPOINTS`}
              </div>
            </div>
          </div>

          {/* 우측: 엔드포인트 레지스트리 프리뷰 프레임 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: OG_COLORS.canvasCard,
              border: `1px solid ${OG_COLORS.hairline}`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* 프레임 상단 바 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: `1px solid ${OG_COLORS.hairline}`,
                backgroundColor: OG_COLORS.canvasSoft,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 9999,
                    backgroundColor: OG_COLORS.sunset,
                    display: "flex",
                  }}
                />
                <span style={{ fontSize: 13, color: OG_COLORS.bodyMid }}>
                  {"endpoints //"}
                </span>
                <span style={{ fontSize: 13, color: OG_COLORS.ink }}>
                  {`@${shortHandle}`}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 11px",
                  borderRadius: 9999,
                  border: `1px solid ${OG_COLORS.hairline}`,
                  backgroundColor: OG_COLORS.canvas,
                  fontSize: 11,
                  letterSpacing: "1px",
                  color: OG_COLORS.body,
                }}
              >
                {`${endpointCountText} ENDPOINTS`}
              </div>
            </div>

            {/* 엔드포인트 카드 리스트 */}
            <div
              style={{
                flex: 1,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 12,
              }}
            >
              {profileData.previewLinks.map((item) => (
                <div
                  key={`${item.endpointLabel}-${item.title}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    padding: "13px 16px",
                    borderRadius: 8,
                    border: `1px solid ${OG_COLORS.hairline}`,
                    backgroundColor: OG_COLORS.canvas,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 13,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        border: `1px solid ${OG_COLORS.hairline}`,
                        backgroundColor: OG_COLORS.canvasSoft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <OgLinkIcon
                        icon={item.icon}
                        color={item.accentColor}
                        size={18}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          letterSpacing: "1px",
                        }}
                      >
                        <span style={{ color: item.accentColor }}>
                          {item.endpointLabel}
                        </span>
                        <span style={{ color: OG_COLORS.bodyMid }}>
                          {`· ${item.subtitle}`}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 17,
                          color: OG_COLORS.ink,
                          letterSpacing: "-0.015em",
                        }}
                      >
                        {item.title}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 9999,
                      border: `1px solid ${OG_COLORS.hairline}`,
                      backgroundColor: OG_COLORS.canvasCard,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <OgArrowUpRightIcon color={OG_COLORS.bodyMid} size={13} />
                  </div>
                </div>
              ))}
            </div>

            {/* 프레임 하단 상태 바 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 20px",
                borderTop: `1px solid ${OG_COLORS.hairline}`,
                backgroundColor: OG_COLORS.canvasFooter,
                fontSize: 11,
                letterSpacing: "1px",
              }}
            >
              <span style={{ color: OG_COLORS.bodyMid }}>
                {profileData.extraCount > 0
                  ? `+${profileData.extraCount} MORE ENDPOINTS REGISTERED`
                  : "FIRESTORE ENDPOINT DIRECTORY"}
              </span>
              <span style={{ color: OG_COLORS.sunset }}>
                {profileData.totalClicks > 0
                  ? `${profileData.totalClicks.toLocaleString()} TOTAL CLICKS`
                  : "READY TO CONNECT"}
              </span>
            </div>
          </div>
        </div>

        {/* 하단 푸터 바 */}
        <div
          style={{
            height: 54,
            padding: "0 56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${OG_COLORS.hairline}`,
            backgroundColor: OG_COLORS.canvas,
            fontSize: 12,
            letterSpacing: "1.3px",
            color: OG_COLORS.bodyMid,
          }}
        >
          <span>{"MYLINK // PERSONAL LINK ENDPOINT SYSTEM"}</span>
          <span>
            {`PUBLIC PROFILE · @${truncateText(profileData.displayName, 24).toUpperCase()}`}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
