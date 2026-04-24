import { useState, useMemo } from 'react';
import { Row, Col, Card, Statistic, Typography, Radio, Select, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { SalesDataPoint, SalesSource, SalesRegion } from '../../../types';
import {
  SALES_SOURCE_LABEL,
  SALES_REGION_LABEL,
} from '../../../types';

const { Title, Text } = Typography;

const C_PRIMARY  = '#1677ff';
const C_LIGHT    = '#4096ff';
const C_LIGHTER  = '#69b1ff';
const C_BG       = '#f0f5ff';

// 按来源区分的颜色（Amazon 主蓝，独立站次蓝）
const SOURCE_COLOR: Record<SalesSource, string> = {
  amazon:      '#1677ff',
  independent: '#4096ff',
};

interface Props {
  salesData: SalesDataPoint[];
}

const fmtMonth = (m: string) => m.replace(/^(\d{4})-(\d{2})$/, '$1/$2');

// ── 聚合：按 key 函数分组求和 ────────────────────────────────────
function aggregate(
  data: SalesDataPoint[],
  keyFn: (d: SalesDataPoint) => string,
): { key: string; sales: number; revenue: number }[] {
  const map = new Map<string, { sales: number; revenue: number }>();
  for (const d of data) {
    const k = keyFn(d);
    const cur = map.get(k) ?? { sales: 0, revenue: 0 };
    map.set(k, { sales: cur.sales + d.sales, revenue: cur.revenue + d.revenue });
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, v]) => ({ key, ...v, revenue: Math.round(v.revenue) }));
}

export default function SalesAnalysis({ salesData }: Props) {
  // ── 视角切换 ─────────────────────────────────────────────────────
  const [mode, setMode] = useState<'annual' | 'monthly'>('annual');

  // ── 筛选：来源（null = 全部） ────────────────────────────────────
  const [sourceFilter, setSourceFilter] = useState<SalesSource | 'all'>('all');
  // ── 筛选：地区（null = 全部） ────────────────────────────────────
  const [regionFilter, setRegionFilter] = useState<SalesRegion | 'all'>('all');

  // ── 年份列表 ─────────────────────────────────────────────────────
  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(salesData.map((d) => d.month.slice(0, 4)))).sort(
      (a, b) => Number(b) - Number(a),
    );
    return years;
  }, [salesData]);

  const [selectedYear, setSelectedYear] = useState<string>(yearOptions[0] ?? '');

  // ── 来源 / 地区选项 ──────────────────────────────────────────────
  const sourceOptions = useMemo(() => {
    const sources = Array.from(new Set(salesData.map((d) => d.source))) as SalesSource[];
    return [
      { label: '全部来源', value: 'all' },
      ...sources.map((s) => ({ label: SALES_SOURCE_LABEL[s], value: s })),
    ];
  }, [salesData]);

  const regionOptions = useMemo(() => {
    const regions = Array.from(
      new Set(
        salesData
          .filter((d) => sourceFilter === 'all' || d.source === sourceFilter)
          .map((d) => d.region),
      ),
    ) as SalesRegion[];
    return [
      { label: '全部地区', value: 'all' },
      ...regions.map((r) => ({ label: SALES_REGION_LABEL[r], value: r })),
    ];
  }, [salesData, sourceFilter]);

  // ── 过滤后数据 ───────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      salesData.filter(
        (d) =>
          (sourceFilter === 'all' || d.source === sourceFilter) &&
          (regionFilter === 'all' || d.region === regionFilter),
      ),
    [salesData, sourceFilter, regionFilter],
  );

  // ── 年度汇总数据（用于年度对比视角） ─────────────────────────────
  const yearData = useMemo(
    () => aggregate(filtered, (d) => d.month.slice(0, 4)),
    [filtered],
  );

  // ── 月度数据（选定年） ────────────────────────────────────────────
  const monthlyData = useMemo(
    () =>
      aggregate(
        filtered.filter((d) => d.month.startsWith(selectedYear)),
        (d) => d.month,
      ).map((r) => ({ ...r, month: fmtMonth(r.key) })),
    [filtered, selectedYear],
  );

  // ── 来源对比数据（用于堆叠图，月度） ─────────────────────────────
  const sourceMonthlyData = useMemo(() => {
    const months = Array.from(
      new Set(
        salesData
          .filter((d) => d.month.startsWith(selectedYear))
          .map((d) => d.month),
      ),
    ).sort();
    return months.map((m) => {
      const fmted = fmtMonth(m);
      const amazon = salesData
        .filter((d) => d.month === m && d.source === 'amazon' && (regionFilter === 'all' || d.region === regionFilter))
        .reduce((s, d) => s + d.sales, 0);
      const independent = salesData
        .filter((d) => d.month === m && d.source === 'independent' && (regionFilter === 'all' || d.region === regionFilter))
        .reduce((s, d) => s + d.sales, 0);
      return { month: fmted, Amazon: amazon, 独立站: independent };
    });
  }, [salesData, selectedYear, regionFilter]);

  // ── 汇总指标 ─────────────────────────────────────────────────────
  const totalSales   = filtered.reduce((s, d) => s + d.sales, 0);
  const totalRevenue = filtered.reduce((s, d) => s + d.revenue, 0);

  const mFiltered    = filtered.filter((d) => d.month.startsWith(selectedYear));
  const mTotalSales  = mFiltered.reduce((s, d) => s + d.sales, 0);
  const mTotalRev    = mFiltered.reduce((s, d) => s + d.revenue, 0);
  const mAvgSales    = monthlyData.length ? Math.round(mTotalSales / monthlyData.length) : 0;
  const mPeak        = monthlyData.length
    ? monthlyData.reduce((b, d) => (d.sales > b.sales ? d : b))
    : null;
  const mLast        = monthlyData[monthlyData.length - 1];
  const mPrev        = monthlyData[monthlyData.length - 2];
  const growthRate   = mPrev && mPrev.sales > 0
    ? (((mLast.sales - mPrev.sales) / mPrev.sales) * 100).toFixed(1)
    : '0.0';
  const isGrowing    = mLast && mPrev ? mLast.sales >= mPrev.sales : true;

  // ── 公共筛选器 UI ────────────────────────────────────────────────
  const filterBar = (
    <Space size={8} wrap>
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
  );

  return (
    <div>
      {/* ── 顶部控制栏 ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space size={8}>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            size="small"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            options={[
              { label: '年度对比', value: 'annual' },
              { label: '月度明细', value: 'monthly' },
            ]}
          />
          {mode === 'monthly' && (
            <Select
              size="small"
              value={selectedYear}
              onChange={setSelectedYear}
              options={yearOptions.map((y) => ({ label: y + ' 年', value: y }))}
              style={{ width: 100 }}
            />
          )}
        </Space>
        {filterBar}
      </div>

      {/* ════════════════════ 年度对比 ════════════════════════════════ */}
      {mode === 'annual' && (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={8}>
              <Card size="small" bordered={false} style={{ background: C_BG, borderRadius: 8 }}>
                <Statistic
                  title={<Text style={{ fontSize: 12 }}>累计总销量</Text>}
                  value={totalSales.toLocaleString()}
                  suffix="单"
                  valueStyle={{ color: C_PRIMARY, fontSize: 20 }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" bordered={false} style={{ background: C_BG, borderRadius: 8 }}>
                <Statistic
                  title={<Text style={{ fontSize: 12 }}>累计总收入</Text>}
                  value={`$${(totalRevenue / 1000).toFixed(1)}K`}
                  valueStyle={{ color: C_PRIMARY, fontSize: 20 }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" bordered={false} style={{ background: C_BG, borderRadius: 8 }}>
                <Statistic
                  title={<Text style={{ fontSize: 12 }}>统计年数</Text>}
                  value={yearData.length}
                  suffix="年"
                  valueStyle={{ color: C_PRIMARY, fontSize: 20 }}
                />
              </Card>
            </Col>
          </Row>

          {/* 年度销量柱状图 */}
          <Card
            title={<Title level={5} style={{ margin: 0 }}>年度销量对比</Title>}
            bordered={false}
            style={{ background: '#fafafa', marginBottom: 16 }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yearData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} 单`, '年度销量']} />
                <Bar dataKey="sales" name="年度销量" fill={C_PRIMARY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* 年度收入趋势 */}
          <Card
            title={<Title level={5} style={{ margin: 0 }}>年度收入趋势（USD）</Title>}
            bordered={false}
            style={{ background: '#fafafa' }}
          >
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={yearData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '年度收入']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="年度收入" stroke={C_LIGHT}
                  strokeWidth={2.5} dot={{ r: 5, fill: C_LIGHT }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {/* ════════════════════ 月度明细 ════════════════════════════════ */}
      {mode === 'monthly' && (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            {[
              { label: `${selectedYear} 年累计销量`, value: `${mTotalSales.toLocaleString()} 单` },
              { label: `${selectedYear} 年累计收入`, value: `$${(mTotalRev / 1000).toFixed(1)}K` },
              { label: '月均销量', value: `${mAvgSales.toLocaleString()} 单` },
            ].map((item) => (
              <Col span={6} key={item.label}>
                <Card size="small" bordered={false} style={{ background: C_BG, borderRadius: 8 }}>
                  <Statistic
                    title={<Text style={{ fontSize: 12 }}>{item.label}</Text>}
                    value={item.value}
                    valueStyle={{ color: C_PRIMARY, fontSize: 18 }}
                  />
                </Card>
              </Col>
            ))}
            <Col span={6}>
              <Card size="small" bordered={false} style={{ background: C_BG, borderRadius: 8 }}>
                <Statistic
                  title={<Text style={{ fontSize: 12 }}>环比增长</Text>}
                  value={Math.abs(Number(growthRate))}
                  suffix="%"
                  precision={1}
                  prefix={
                    isGrowing
                      ? <ArrowUpOutlined style={{ color: C_PRIMARY }} />
                      : <ArrowDownOutlined style={{ color: C_PRIMARY }} />
                  }
                  valueStyle={{ color: C_PRIMARY, fontSize: 20 }}
                />
              </Card>
            </Col>
          </Row>

          {/* 月度销量趋势（带来源对比） */}
          <Card
            title={<Title level={5} style={{ margin: 0 }}>月度销量趋势</Title>}
            bordered={false}
            style={{ background: '#fafafa', marginBottom: 16 }}
            extra={
              mPeak ? (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  峰值：{mPeak.month}（{mPeak.sales.toLocaleString()} 单）
                </Text>
              ) : null
            }
          >
            <ResponsiveContainer width="100%" height={270}>
              {sourceFilter === 'all' ? (
                /* 全部来源时展示 Amazon / 独立站 堆叠柱状图 */
                <BarChart data={sourceMonthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number, name: string) => [`${v.toLocaleString()} 单`, name]} />
                  <Legend />
                  <Bar dataKey="Amazon"  stackId="a" fill={SOURCE_COLOR.amazon}      radius={[0, 0, 0, 0]} />
                  <Bar dataKey="独立站" stackId="a" fill={SOURCE_COLOR.independent} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                /* 单来源时展示折线图 */
                <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} 单`, '销量']} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" name="销量"
                    stroke={C_PRIMARY} strokeWidth={2.5}
                    dot={{ r: 4, fill: C_PRIMARY }} activeDot={{ r: 6 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </Card>

          {/* 月度收入柱状图 */}
          <Card
            title={<Title level={5} style={{ margin: 0 }}>月度收入（USD）</Title>}
            bordered={false}
            style={{ background: '#fafafa' }}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '月收入']} />
                <Bar dataKey="revenue" name="月收入" fill={C_LIGHTER} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}
