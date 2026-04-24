import { Row, Col, Card, Statistic, Typography } from 'antd';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
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
import type { SalesDataPoint } from '../../../types';

const { Title, Text } = Typography;

interface Props {
  salesData: SalesDataPoint[];
}

const formatMonth = (m: string) => m.replace(/^(\d{4})-(\d{2})$/, '$1/$2');

export default function SalesAnalysis({ salesData }: Props) {
  const totalSales = salesData.reduce((s, d) => s + d.sales, 0);
  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
  const avgMonthlySales = Math.round(totalSales / salesData.length);
  const peakMonth = salesData.reduce((best, d) =>
    d.sales > best.sales ? d : best,
  );
  const lastMonth = salesData[salesData.length - 1];
  const prevMonth = salesData[salesData.length - 2];
  const growthRate = (((lastMonth.sales - prevMonth.sales) / prevMonth.sales) * 100).toFixed(1);
  const isGrowing = lastMonth.sales >= prevMonth.sales;

  const chartData = salesData.map((d) => ({
    ...d,
    month: formatMonth(d.month),
    revenue: Math.round(d.revenue),
  }));

  return (
    <div>
      {/* 汇总指标 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small" bordered={false} style={{ background: '#f0f9ff', borderRadius: 8 }}>
            <Statistic
              title={<Text style={{ fontSize: 12 }}>12个月累计销量</Text>}
              value={totalSales.toLocaleString()}
              suffix="单"
              valueStyle={{ color: '#1677ff', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 8 }}>
            <Statistic
              title={<Text style={{ fontSize: 12 }}>12个月累计收入</Text>}
              value={`$${(totalRevenue / 1000).toFixed(1)}K`}
              valueStyle={{ color: '#52c41a', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bordered={false} style={{ background: '#fff7e6', borderRadius: 8 }}>
            <Statistic
              title={<Text style={{ fontSize: 12 }}>月均销量</Text>}
              value={avgMonthlySales.toLocaleString()}
              suffix="单"
              valueStyle={{ color: '#faad14', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bordered={false} style={{ background: isGrowing ? '#f6ffed' : '#fff1f0', borderRadius: 8 }}>
            <Statistic
              title={<Text style={{ fontSize: 12 }}>环比增长</Text>}
              value={Math.abs(Number(growthRate))}
              suffix="%"
              precision={1}
              prefix={
                isGrowing ? (
                  <RiseOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <FallOutlined style={{ color: '#ff4d4f' }} />
                )
              }
              valueStyle={{ color: isGrowing ? '#52c41a' : '#ff4d4f', fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 销量趋势折线图 */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>月度销量趋势</Title>}
        bordered={false}
        style={{ background: '#fafafa', marginBottom: 20 }}
        extra={
          <Text type="secondary" style={{ fontSize: 12 }}>
            峰值月份：{formatMonth(peakMonth.month)} ({peakMonth.sales.toLocaleString()} 单)
          </Text>
        }
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              formatter={(value: number, name: string) =>
                name === '销量'
                  ? [`${value.toLocaleString()} 单`, name]
                  : [`$${value.toLocaleString()}`, name]
              }
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              name="销量"
              stroke="#1677ff"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#1677ff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 月度收入柱状图 */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>月度收入（USD）</Title>}
        bordered={false}
        style={{ background: '#fafafa' }}
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, '月收入']}
            />
            <Bar dataKey="revenue" name="月收入" fill="#52c41a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
