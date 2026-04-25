import { useMemo, useState } from 'react';
import {
  Row, Col, Card, Statistic, Typography, Select, Space,
  Radio, Tooltip, DatePicker,
} from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  ResponsiveContainer, ComposedChart,
  Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend,
} from 'recharts';
import type { SalesDataPoint, SalesSource, SalesRegion } from '../../../types';
import { SALES_SOURCE_LABEL, SALES_REGION_LABEL } from '../../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const C_PRIMARY  = '#1677ff';
const C_RETURN   = '#ff4d4f';
const C_BG       = '#f0f5ff';
const C_WARN_BG  = '#fff2f0';
const RETURN_WARN_THRESHOLD = 4; // 退损率超过4%时警示

// ── 时间快捷选项 ────────────────────────────────────────────────────

type QuickRange = '7d' | '30d' | 'curMonth' | 'lastMonth' | 'last2Month' | '3m' | '6m' | '12m';

interface DateRange { start: Dayjs; end: Dayjs }

function getQuickRange(key: QuickRange): DateRange {
  const today = dayjs();
  switch (key) {
    case '7d':        return { start: today.subtract(6, 'day'),   end: today };
    case '30d':       return { start: today.subtract(29, 'day'),  end: today };
    case 'curMonth':  return { start: today.startOf('month'),     end: today };
    case 'lastMonth': {
      const lm = today.subtract(1, 'month');
      return { start: lm.startOf('month'), end: lm.endOf('month') };
    }
    case 'last2Month': {
      const l2m = today.subtract(2, 'month');
      return { start: l2m.startOf('month'), end: l2m.endOf('month') };
    }
    case '3m':  return { start: today.subtract(3,  'month').startOf('day'), end: today };
    case '6m':  return { start: today.subtract(6,  'month').startOf('day'), end: today };
    case '12m': return { start: today.subtract(12, 'month').startOf('day'), end: today };
  }
}

const QUICK_OPTIONS: { label: string; value: QuickRange }[] = [
  { label: '7天',    value: '7d'         },
  { label: '30天',   value: '30d'        },
  { label: '本月',   value: 'curMonth'   },
  { label: '上月',   value: 'lastMonth'  },
  { label: '上上月', value: 'last2Month' },
  { label: '近3月',  value: '3m'         },
  { label: '近6月',  value: '6m'         },
  { label: '近12月', value: '12m'        },
];

// ── 聚合粒度：≤60天用日，>60天用月 ──────────────────────────────────

function shouldUseDaily(start: Dayjs, end: Dayjs): boolean {
  return end.diff(start, 'day') <= 60;
}

// ── 数据聚合 ─────────────────────────────────────────────────────────

interface AggPoint {
  label: string;
  sales: number;
  revenue: number;
  returnRate: number; // 百分比，已乘以100
}

function aggregateData(data: SalesDataPoint[], useDaily: boolean): AggPoint[] {
  const map = new Map<string, { sales: number; revenue: number; returnWeightedSum: number }>();

  for (const d of data) {
    const key = useDaily ? d.date : d.date.slice(0, 7);
    const cur = map.get(key) ?? { sales: 0, revenue: 0, returnWeightedSum: 0 };
    map.set(key, {
      sales:              cur.sales + d.sales,
      revenue:            cur.revenue + d.revenue,
      returnWeightedSum:  cur.returnWeightedSum + d.returnRate * d.sales,
    });
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, v]) => ({
      label:      useDaily ? key.slice(5) : key.replace('-', '/'),
      sales:      v.sales,
      revenue:    Math.round(v.revenue),
      returnRate: v.sales > 0
        ? Math.round((v.returnWeightedSum / v.sales) * 10000) / 100
        : 0,
    }));
}

// ── 自定义 Tooltip ────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name === '退损率'
            ? `退损率：${p.value.toFixed(2)}%`
            : `销量：${p.value.toLocaleString()} 单`}
        </div>
      ))}
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────────

interface Props {
  salesData: SalesDataPoint[];
  totalReviews: number;
}

export default function SalesAnalysis({ salesData, totalReviews }: Props) {
  const [quickRange, setQuickRange]   = useState<QuickRange | null>('30d');
  const [customRange, setCustomRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SalesSource | 'all'>('all');
  const [regionFilter, setRegionFilter] = useState<SalesRegion | 'all'>('all');

  const dateRange = useMemo<DateRange>(() => {
    if (customRange) return { start: customRange[0], end: customRange[1] };
    return getQuickRange(quickRange ?? '30d');
  }, [quickRange, customRange]);

  const sourceOptions = useMemo(() => {
    const sources = Array.from(new Set(salesData.map((d) => d.source))) as SalesSource[];
    return [
      { label: '全部来源', value: 'all' },
      ...sources.map((s) => ({ label: SALES_SOURCE_LABEL[s], value: s })),
    ];
  }, [salesData]);

  const regionOptions = useMemo(() => {
    const regions = Array.from(new Set(
      salesData
        .filter((d) => sourceFilter === 'all' || d.source === sourceFilter)
        .map((d) => d.region),
    )) as SalesRegion[];
    return [
      { label: '全部地区', value: 'all' },
      ...regions.map((r) => ({ label: SALES_REGION_LABEL[r], value: r })),
    ];
  }, [salesData, sourceFilter]);

  const filtered = useMemo(() => {
    const startStr = dateRange.start.format('YYYY-MM-DD');
    const endStr   = dateRange.end.format('YYYY-MM-DD');
    return salesData.filter(
      (d) =>
        d.date >= startStr &&
        d.date <= endStr &&
        (sourceFilter === 'all' || d.source === sourceFilter) &&
        (regionFilter === 'all' || d.region === regionFilter),
    );
  }, [salesData, dateRange, sourceFilter, regionFilter]);

  const useDaily  = shouldUseDaily(dateRange.start, dateRange.end);
  const chartData = useMemo(() => aggregateData(filtered, useDaily), [filtered, useDaily]);

  const totalSales   = filtered.reduce((s, d) => s + d.sales, 0);
  const totalRevenue = filtered.reduce((s, d) => s + d.revenue, 0);

  const avgReturnRate = useMemo(() => {
    const ws = filtered.reduce((s, d) => s + d.returnRate * d.sales, 0);
    return totalSales > 0 ? (ws / totalSales) * 100 : 0;
  }, [filtered, totalSales]);

  const days          = Math.max(1, dateRange.end.diff(dateRange.start, 'day') + 1);
  const avgDailySales = Math.round(totalSales / days);

  const lastPt    = chartData[chartData.length - 1];
  const prevPt    = chartData[chartData.length - 2];
  const growthRate = prevPt && prevPt.sales > 0
    ? (((lastPt.sales - prevPt.sales) / prevPt.sales) * 100).toFixed(1)
    : null;
  const isGrowing = lastPt && prevPt ? lastPt.sales >= prevPt.sales : true;

  const totalSalesAll = salesData.reduce((s, d) => s + d.sales, 0);
  const months = Math.max(1, days / 30);
  const avgReviews = useMemo(() => {
    if (totalSalesAll <= 0 || totalReviews <= 0) return 0;
    return Math.max(0, Math.round((totalReviews * (totalSales / totalSalesAll)) / months));
  }, [totalSales, totalSalesAll, totalReviews, months]);

  const returnWarn = avgReturnRate > RETURN_WARN_THRESHOLD;

  // X轴 label 过密时自动稀疏
  const xInterval = chartData.length > 60
    ? Math.floor(chartData.length / 20)
    : chartData.length > 20
      ? Math.floor(chartData.length / 10)
      : 'preserveStartEnd';

  return (
    <div>
      {/* 控制栏 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          size="small"
          value={quickRange}
          onChange={(e) => { setQuickRange(e.target.value); setCustomRange(null); }}
          options={QUICK_OPTIONS}
        />
        <RangePicker
          size="small"
          value={customRange}
          onChange={(v) => {
            if (v?.[0] && v?.[1]) {
              setCustomRange([v[0], v[1]]);
              setQuickRange(null);
            } else {
              setCustomRange(null);
              if (!quickRange) setQuickRange('30d');
            }
          }}
          style={{ width: 210 }}
          placeholder={['开始日期', '结束日期']}
          allowClear
        />
        <Space size={8} style={{ marginLeft: 'auto' }}>
          <Select
            size="small"
            value={sourceFilter}
            onChange={(v) => { setSourceFilter(v); setRegionFilter('all'); }}
            options={sourceOptions}
            style={{ width: 120 }}
          />
          <Select
            size="small"
            value={regionFilter}
            onChange={setRegionFilter}
            options={regionOptions}
            style={{ width: 120 }}
          />
        </Space>
      </div>

      {/* KPI 卡片 */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { key: 'sales',   label: '期间总销量', value: `${totalSales.toLocaleString()} 单` },
          { key: 'revenue', label: '期间总收入', value: `$${(totalRevenue / 1000).toFixed(1)}K` },
          { key: 'daily',   label: '日均销量',   value: `${avgDailySales.toLocaleString()} 单` },
          {
            key: 'reviews',
            label: (
              <Tooltip title="按期间销量占全量比例折算累计评论，再除以月份数（估算值）">
                <span>月均评论数</span>
              </Tooltip>
            ),
            value: `${avgReviews.toLocaleString()} 条`,
          },
        ].map((item) => (
          <Col key={item.key} flex="1 1 130px">
            <Card size="small" styles={{ body: { border: 'none' } }} style={{ background: C_BG, borderRadius: 8, border: 'none' }}>
              <Statistic
                title={<Text style={{ fontSize: 12 }}>{item.label}</Text>}
                value={item.value}
                valueStyle={{ color: C_PRIMARY, fontSize: 18 }}
              />
            </Card>
          </Col>
        ))}

        <Col flex="1 1 130px">
          <Card size="small" style={{ background: returnWarn ? C_WARN_BG : C_BG, borderRadius: 8, border: 'none' }}>
            <Statistic
              title={
                <Text style={{ fontSize: 12 }}>
                  平均退损率
                  {returnWarn && (
                    <Tooltip title={`退损率超过 ${RETURN_WARN_THRESHOLD}%，请关注`}>
                      <WarningOutlined style={{ color: C_RETURN, marginLeft: 4 }} />
                    </Tooltip>
                  )}
                </Text>
              }
              value={avgReturnRate.toFixed(2)}
              suffix="%"
              valueStyle={{ color: returnWarn ? C_RETURN : C_PRIMARY, fontSize: 18 }}
            />
          </Card>
        </Col>

        <Col flex="1 1 130px">
          <Card size="small" style={{ background: C_BG, borderRadius: 8, border: 'none' }}>
            <Statistic
              title={
                <Tooltip title={prevPt ? `${prevPt.label} → ${lastPt?.label} 的环比` : '数据点不足，无法计算环比'}>
                  <span style={{ fontSize: 12 }}>最新周期环比</span>
                </Tooltip>
              }
              value={growthRate !== null ? Math.abs(Number(growthRate)) : '-'}
              suffix={growthRate !== null ? '%' : ''}
              precision={growthRate !== null ? 1 : 0}
              prefix={
                growthRate !== null
                  ? isGrowing
                    ? <ArrowUpOutlined style={{ color: C_PRIMARY }} />
                    : <ArrowDownOutlined style={{ color: C_PRIMARY }} />
                  : null
              }
              valueStyle={{ color: C_PRIMARY, fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 销量 + 退损率双轴趋势图 */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>销量 & 退损率趋势</Title>}
        style={{ background: '#fafafa', border: 'none' }}
        extra={
          <Text type="secondary" style={{ fontSize: 12 }}>
            {useDaily ? '按日聚合' : '按月聚合'} · 左轴：销量 / 右轴：退损率
          </Text>
        }
      >
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 50, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              interval={xInterval}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v.toFixed(1)}%`}
              domain={[0, 'auto']}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="sales"
              name="销量"
              fill={C_PRIMARY}
              fillOpacity={0.75}
              radius={[2, 2, 0, 0]}
              maxBarSize={28}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="returnRate"
              name="退损率"
              stroke={C_RETURN}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
