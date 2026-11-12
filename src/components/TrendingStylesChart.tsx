import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Flame,
  Calendar,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

export interface StyleTrendMetric {
  id: string;
  name: string;
  category: string;
  growthPct: number;
  color: string;
  gradientId: string;
  weeklyTryOns: number;
  dataPoints7D: number[];
  dataPoints30D: number[];
  dataPoints90D: number[];
  topBoutique: string;
  keyFeature: string;
}

export const TREND_STYLES_DATA: StyleTrendMetric[] = [
  {
    id: 'trench',
    name: 'Archival Trench & Overcoats',
    category: 'outerwear',
    growthPct: 54,
    color: '#f43f5e', // rose-500
    gradientId: 'grad-trench',
    weeklyTryOns: 840,
    dataPoints7D: [45, 52, 68, 74, 92, 110, 138],
    dataPoints30D: [180, 210, 240, 290, 360, 480, 610, 750, 840],
    dataPoints90D: [520, 640, 890, 1120, 1480, 1890, 2450],
    topBoutique: 'Atelier Soho',
    keyFeature: 'Weatherproof Gabardine & Sculpted Collars',
  },
  {
    id: 'cashmere',
    name: 'Mongolian Cashmere & Knits',
    category: 'tops',
    growthPct: 38,
    color: '#f59e0b', // amber-500
    gradientId: 'grad-cashmere',
    weeklyTryOns: 620,
    dataPoints7D: [38, 41, 50, 58, 70, 84, 96],
    dataPoints30D: [140, 170, 210, 250, 310, 390, 470, 550, 620],
    dataPoints90D: [410, 520, 710, 930, 1150, 1420, 1780],
    topBoutique: 'Nordic Minimal',
    keyFeature: 'Ribbed Mockneck & Untreated Fibers',
  },
  {
    id: 'denim',
    name: 'High-Rise Barrel Raw Denim',
    category: 'bottoms',
    growthPct: 29,
    color: '#3b82f6', // blue-500
    gradientId: 'grad-denim',
    weeklyTryOns: 495,
    dataPoints7D: [30, 34, 42, 49, 56, 68, 77],
    dataPoints30D: [110, 130, 160, 190, 240, 310, 380, 430, 495],
    dataPoints90D: [320, 410, 560, 740, 920, 1180, 1430],
    topBoutique: 'Le Marais NYC',
    keyFeature: 'Rigid 27" Organic Cotton Selvedge',
  },
  {
    id: 'silk',
    name: 'Bias-Cut Silk & Column Gowns',
    category: 'dresses',
    growthPct: 22,
    color: '#a855f7', // purple-500
    gradientId: 'grad-silk',
    weeklyTryOns: 370,
    dataPoints7D: [24, 28, 33, 39, 44, 51, 60],
    dataPoints30D: [90, 110, 130, 160, 200, 250, 290, 330, 370],
    dataPoints90D: [260, 340, 470, 610, 780, 960, 1120],
    topBoutique: 'Harlem Vintage Archive',
    keyFeature: 'Mulberry Silk Crepe with Natural Hourglass Drape',
  },
];

interface Props {
  onSelectTrendCategory?: (category: string) => void;
  onSelectSearchQuery?: (query: string) => void;
}

export const TrendingStylesChart: React.FC<Props> = ({
  onSelectTrendCategory,
  onSelectSearchQuery,
}) => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [activeStyleId, setActiveStyleId] = useState<string>('trench');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const activeStyle = useMemo(() => {
    return TREND_STYLES_DATA.find((s) => s.id === activeStyleId) || TREND_STYLES_DATA[0];
  }, [activeStyleId]);

  // Selected data series based on time range
  const rawData = useMemo(() => {
    if (timeRange === '7D') return activeStyle.dataPoints7D;
    if (timeRange === '30D') return activeStyle.dataPoints30D;
    return activeStyle.dataPoints90D;
  }, [timeRange, activeStyle]);

  // Labels for X-axis
  const labels = useMemo(() => {
    if (timeRange === '7D') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
    if (timeRange === '30D') {
      return ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'Now'];
    }
    return ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Now'];
  }, [timeRange]);

  // SVG Chart Geometry
  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartPoints = useMemo(() => {
    const minVal = Math.min(...rawData) * 0.85;
    const maxVal = Math.max(...rawData) * 1.1;
    const stepX = (svgWidth - paddingX * 2) / (rawData.length - 1);

    return rawData.map((val, idx) => {
      const x = paddingX + idx * stepX;
      const normalizedY = (val - minVal) / (maxVal - minVal || 1);
      const y = svgHeight - paddingY - normalizedY * (svgHeight - paddingY * 2);
      return { x, y, value: val, label: labels[idx] };
    });
  }, [rawData, labels, svgWidth, svgHeight, paddingX, paddingY]);

  // Smooth spline path generator
  const { linePath, areaPath } = useMemo(() => {
    if (chartPoints.length === 0) return { linePath: '', areaPath: '' };

    let line = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const p0 = chartPoints[i];
      const p1 = chartPoints[i + 1];
      const cx = (p0.x + p1.x) / 2;
      line += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const last = chartPoints[chartPoints.length - 1];
    const first = chartPoints[0];
    const bottomY = svgHeight - paddingY;
    const area = `${line} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;

    return { linePath: line, areaPath: area };
  }, [chartPoints, svgHeight, paddingY]);

  const currentHoveredPoint = hoverIndex !== null ? chartPoints[hoverIndex] : chartPoints[chartPoints.length - 1];

  return (
    <div className="w-full bg-gradient-to-b from-[#11131a] to-[#0c0d12] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden mb-6">
      {/* Background Subtle Ambient Glow */}
      <div
        className="absolute top-0 right-0 w-96 h-64 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: activeStyle.color }}
      />

      {/* Header Row: Title, Live Trend Badge, and Time Range Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Live Try-On Velocity Tracker
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                <ArrowUpRight className="w-3 h-3" />
                +{activeStyle.growthPct}% This Week
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif-editorial text-white tracking-tight">
              Trending Silhouettes on Virdrobe
            </h3>
          </div>
        </div>

        {/* Time Range Pills: 7D / 30D / 90D */}
        <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded-full p-1 text-xs font-mono">
          {(['7D', '30D', '90D'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-full transition ${
                timeRange === range
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Style Tabs: Select which silhouette's velocity to chart */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none border-b border-white/5">
        {TREND_STYLES_DATA.map((style) => {
          const isActive = style.id === activeStyleId;
          return (
            <button
              key={style.id}
              onClick={() => {
                setActiveStyleId(style.id);
                setHoverIndex(null);
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs whitespace-nowrap transition border ${
                isActive
                  ? 'bg-zinc-900 border-white/20 text-white shadow-lg'
                  : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: style.color }}
              />
              <span className="font-medium text-white">{style.name}</span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.2 rounded"
                style={{
                  backgroundColor: `${style.color}20`,
                  color: style.color,
                }}
              >
                +{style.growthPct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Chart Section & Current Point Metric Hover Callout */}
      <div className="relative pt-4">
        {/* Metric Inspector Callout on Top of Chart */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-2 px-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
              Virtual Try-On Frequency ({currentHoveredPoint.label})
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black font-serif-editorial text-white">
                {currentHoveredPoint.value.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400 font-mono">digital fits recorded</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
              Featured Boutique Hub
            </span>
            <span className="text-sm font-semibold text-rose-300 font-mono">
              {activeStyle.topBoutique}
            </span>
            <span className="text-[11px] text-zinc-400 block truncate max-w-xs">
              {activeStyle.keyFeature}
            </span>
          </div>
        </div>

        {/* Responsive Interactive SVG Line Chart */}
        <div className="relative w-full aspect-[2.8/1] min-h-[180px] select-none">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id={activeStyle.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeStyle.color} stopOpacity="0.4" />
                <stop offset="70%" stopColor={activeStyle.color} stopOpacity="0.05" />
                <stop offset="100%" stopColor={activeStyle.color} stopOpacity="0.0" />
              </linearGradient>

              {/* Glowing stroke filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle Grid Horizontal Lines */}
            {[0.2, 0.5, 0.8].map((ratio, i) => {
              const y = paddingY + ratio * (svgHeight - paddingY * 2);
              return (
                <line
                  key={i}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Gradient Area Fill */}
            <path
              d={areaPath}
              fill={`url(#${activeStyle.gradientId})`}
              className="transition-all duration-500 ease-out"
            />

            {/* Spline Line Path */}
            <path
              d={linePath}
              fill="none"
              stroke={activeStyle.color}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="transition-all duration-500 ease-out"
            />

            {/* Data Points & Interactive Touch Zones */}
            {chartPoints.map((pt, idx) => {
              const isHovered = hoverIndex === idx || (hoverIndex === null && idx === chartPoints.length - 1);
              return (
                <g key={idx}>
                  {/* Invisible broad hitbox for effortless hover/touch */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="24"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverIndex(idx)}
                  />

                  {/* Visible Point */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 3.5}
                    fill={isHovered ? '#ffffff' : activeStyle.color}
                    stroke={activeStyle.color}
                    strokeWidth={isHovered ? 3 : 1}
                    className="transition-all duration-200 pointer-events-none"
                  />

                  {/* Hovered Vertical Indicator Line */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingY}
                      x2={pt.x}
                      y2={svgHeight - paddingY}
                      stroke="rgba(255,255,255,0.2)"
                      strokeDasharray="2 2"
                      strokeWidth="1.5"
                      className="pointer-events-none"
                    />
                  )}

                  {/* X-Axis Time Label */}
                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fill={isHovered ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                    fontSize="10"
                    fontFamily="monospace"
                    className="pointer-events-none transition-colors"
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Footer Action Strip: Direct Filter Action */}
      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Shoppers with exact 27" waist and 35" bust are trying on{' '}
            <strong className="text-white">{activeStyle.name}</strong> 3.4x more this week.
          </span>
        </div>

        <button
          onClick={() => {
            if (onSelectTrendCategory) onSelectTrendCategory(activeStyle.category);
            if (onSelectSearchQuery) onSelectSearchQuery(activeStyle.name.split(' ')[0]);
          }}
          className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition flex items-center gap-1.5 border border-white/10"
        >
          <span>Explore Trending {activeStyle.name.split(' ')[0]} Pins</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
