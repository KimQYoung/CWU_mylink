"use client";

import { useMemo } from "react";
import { BarChart3, PieChart as PieChartIcon, Plus } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { LinkItem } from "@/types";

interface StatsChartsProps {
  links: LinkItem[];
  totalClicks: number;
  onAddLink?: () => void;
}

const CHART_PALETTE = [
  "var(--chart-2)", // sunset orange (#ff7a17)
  "var(--chart-1)", // ink white (#ffffff)
  "var(--chart-3)", // breeze blue (#a0c3ec)
  "var(--chart-4)", // twilight violet (#c4b5fd)
  "var(--chart-5)", // muted gray (#7d8187)
] as const;

const BAR_CHART_CONFIG = {
  clicks: {
    label: "클릭수",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function truncateLabel(text: string, maxLength: number = 14): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

/**
 * shadcn/ui Chart 컴포넌트 기반 링크별 클릭수 · 클릭 비중 분포 시각화 섹션
 */
export function StatsCharts({ links, totalClicks, onAddLink }: StatsChartsProps) {
  const barData = useMemo(() => {
    const sorted = [...links].sort(
      (a, b) => (b.clicks ?? 0) - (a.clicks ?? 0) || a.order - b.order
    );

    return sorted.slice(0, 8).map((link, index) => {
      const clicks = link.clicks ?? 0;
      const endpoint =
        link.endpointLabel || `ENDPOINT ${String(link.order).padStart(2, "0")}`;

      return {
        id: link.id,
        title: link.title,
        shortTitle: truncateLabel(link.title, 15),
        endpoint,
        isActive: link.isActive,
        clicks,
        fill:
          index === 0 && clicks > 0
            ? "var(--chart-2)"
            : link.isActive
            ? "var(--chart-1)"
            : "var(--chart-5)",
      };
    });
  }, [links]);

  const { pieData, pieConfig } = useMemo(() => {
    const clickedLinks = [...links]
      .filter((link) => (link.clicks ?? 0) > 0)
      .sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0) || a.order - b.order);

    const topSlices = clickedLinks.slice(0, 4);
    const remainingClicks = clickedLinks
      .slice(4)
      .reduce((sum, link) => sum + (link.clicks ?? 0), 0);

    const entries = topSlices.map((link, index) => ({
      key: `link_${index}`,
      name: link.title,
      clicks: link.clicks ?? 0,
      fill: CHART_PALETTE[index % CHART_PALETTE.length],
    }));

    if (remainingClicks > 0) {
      entries.push({
        key: "others",
        name: "기타 링크",
        clicks: remainingClicks,
        fill: CHART_PALETTE[4],
      });
    }

    const config: ChartConfig = {
      clicks: {
        label: "클릭수",
      },
    };

    entries.forEach((entry) => {
      config[entry.key] = {
        label: truncateLabel(entry.name, 16),
        color: entry.fill,
      };
    });

    return { pieData: entries, pieConfig: config };
  }, [links]);

  const barChartHeight = Math.max(240, barData.length * 40 + 36);

  return (
    <section
      aria-label="클릭 통계 차트"
      className="grid grid-cols-1 lg:grid-cols-12 gap-4"
    >
      {/* 좌측: 링크별 클릭수 막대 차트 */}
      <Card className="lg:col-span-7 flex flex-col">
        <CardHeader className="p-5 sm:p-6 pb-3 flex-row items-start justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <p className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid">
              {"// CLICKS BY ENDPOINT"}
            </p>
            <CardTitle className="text-lg sm:text-xl">링크별 클릭수</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {links.length > 8
                ? "클릭수 상위 8개 링크의 누적 클릭 현황입니다."
                : "등록된 전체 링크의 누적 클릭 현황입니다."}
            </CardDescription>
          </div>
          <span className="inline-flex size-8 items-center justify-center rounded-full border border-hairline bg-canvas-soft text-body-mid shrink-0">
            <BarChart3 className="size-4" strokeWidth={1.5} />
          </span>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 pt-2 flex-1 flex flex-col justify-center">
          {barData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 border border-dashed border-hairline rounded-lg bg-canvas/40">
              <p className="font-mono text-xs uppercase tracking-[1.2px] text-body-mid">
                {"// NO ENDPOINT DATA"}
              </p>
              <p className="text-sm text-body-mid">
                등록된 링크가 없어 차트를 표시할 수 없습니다.
              </p>
              {onAddLink && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddLink}
                >
                  <Plus className="size-3.5" strokeWidth={1.5} />
                  <span>첫 링크 추가하기</span>
                </Button>
              )}
            </div>
          ) : (
            <ChartContainer
              config={BAR_CHART_CONFIG}
              className="w-full aspect-auto"
              style={{ height: `${barChartHeight}px` }}
            >
              <BarChart
                accessibilityLayer
                data={barData}
                layout="vertical"
                margin={{ top: 6, right: 38, left: 4, bottom: 6 }}
              >
                <CartesianGrid
                  horizontal={false}
                  stroke="#212327"
                  strokeDasharray="3 3"
                />
                <XAxis
                  type="number"
                  domain={[0, (dataMax: number) => Math.max(dataMax, 4)]}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#7d8187", fontSize: 11 }}
                />
                <YAxis
                  dataKey="shortTitle"
                  type="category"
                  width={118}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#dadbdf", fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
                  content={
                    <ChartTooltipContent
                      className="border-hairline bg-canvas text-ink shadow-none"
                      labelFormatter={(_value, payload) => {
                        const item = payload?.[0]?.payload as
                          | (typeof barData)[number]
                          | undefined;
                        if (!item) return "";
                        return `${item.title} (${item.isActive ? "공개" : "숨김"})`;
                      }}
                      formatter={(value) => (
                        <div className="flex items-center justify-between gap-4 w-full">
                          <span className="text-body-mid">누적 클릭</span>
                          <span className="font-mono text-ink tabular-nums">
                            {Number(value).toLocaleString()}회
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="clicks"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={26}
                  minPointSize={totalClicks > 0 ? 2 : 0}
                >
                  {barData.map((entry) => (
                    <Cell key={entry.id} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="clicks"
                    position="right"
                    offset={8}
                    className="fill-body-mid font-mono text-[11px]"
                    formatter={(value: unknown) =>
                      typeof value === "number" ? value.toLocaleString() : String(value ?? 0)
                    }
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* 우측: 클릭 비중 분포 도넛 차트 */}
      <Card className="lg:col-span-5 flex flex-col">
        <CardHeader className="p-5 sm:p-6 pb-3 flex-row items-start justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <p className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid">
              {"// CLICK SHARE DISTRIBUTION"}
            </p>
            <CardTitle className="text-lg sm:text-xl">클릭 비중 분포</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              전체 {totalClicks.toLocaleString()}회 클릭 중 링크별 점유율입니다.
            </CardDescription>
          </div>
          <span className="inline-flex size-8 items-center justify-center rounded-full border border-hairline bg-canvas-soft text-body-mid shrink-0">
            <PieChartIcon className="size-4" strokeWidth={1.5} />
          </span>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 pt-2 flex-1 flex flex-col justify-center">
          {totalClicks === 0 || pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-2 border border-dashed border-hairline rounded-lg bg-canvas/40">
              <p className="font-mono text-xs uppercase tracking-[1.2px] text-body-mid">
                {"// NO CLICKS RECORDED"}
              </p>
              <p className="text-sm text-body-mid leading-relaxed">
                아직 발생한 클릭이 없습니다. 공개 페이지에서 링크가 클릭되면
                비중 차트가 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              <ChartContainer
                config={pieConfig}
                className="w-full h-[270px] aspect-auto"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        nameKey="key"
                        className="border-hairline bg-canvas text-ink shadow-none"
                        formatter={(value, _name, item) => {
                          const numericValue = Number(value) || 0;
                          const share =
                            totalClicks > 0
                              ? ((numericValue / totalClicks) * 100).toFixed(1)
                              : "0.0";
                          const entryName =
                            (item?.payload as { name?: string } | undefined)
                              ?.name ?? "";

                          return (
                            <div className="flex items-center justify-between gap-4 w-full">
                              <span className="text-body truncate max-w-36">
                                {entryName}
                              </span>
                              <span className="font-mono text-ink tabular-nums">
                                {numericValue.toLocaleString()}회 ({share}%)
                              </span>
                            </div>
                          );
                        }}
                      />
                    }
                  />
                  <Pie
                    data={pieData}
                    dataKey="clicks"
                    nameKey="key"
                    cx="50%"
                    cy="46%"
                    innerRadius={56}
                    outerRadius={86}
                    paddingAngle={2}
                    stroke="#191919"
                    strokeWidth={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={
                      <ChartLegendContent
                        nameKey="key"
                        className="flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-body-mid pt-2"
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
