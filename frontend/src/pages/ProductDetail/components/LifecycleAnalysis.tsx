import { Row, Col, Card, Tag, Typography, Progress, List, Divider } from 'antd';
import {
  RocketOutlined,
  RiseOutlined,
  CheckCircleFilled,
  BulbOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ReferenceDot,
} from 'recharts';
import type { LifecycleAssessment } from '../../../types';
import { LIFECYCLE_LABEL } from '../../../types';

const { Title, Text } = Typography;

// 统一蓝色系
const C_PRIMARY  = '#1677ff';
const C_LIGHT    = '#4096ff';
const C_LIGHTER  = '#69b1ff';
const C_BG       = '#f0f5ff';

// 生命周期曲线数据（S 形曲线）
const CURVE_DATA = [
  { x: 0, y: 2 },  { x: 5, y: 3 },  { x: 10, y: 5 },  { x: 15, y: 8 },
  { x: 20, y: 13 },{ x: 25, y: 22 },{ x: 30, y: 33 },  { x: 35, y: 46 },
  { x: 40, y: 58 },{ x: 45, y: 69 },{ x: 50, y: 78 },  { x: 55, y: 85 },
  { x: 60, y: 90 },{ x: 65, y: 93 },{ x: 70, y: 94 },  { x: 75, y: 93 },
  { x: 80, y: 88 },{ x: 85, y: 78 },{ x: 90, y: 62 },  { x: 95, y: 42 },
  { x: 100, y: 25 },
];

const INTENSITY_LABEL: Record<string, string> = {
  low: '低', medium: '中', high: '高', 'very-high': '极高',
};

const INDICATOR_LABEL: Record<string, Record<string, string>> = {
  salesTrend:    { 'rapid-growth': '快速增长', 'slow-growth': '缓慢增长', stable: '趋于稳定', declining: '持续下降' },
  reviewGrowth:  { accelerating: '加速增长', stable: '平稳增长', slowing: '增速放缓', declining: '负增长' },
  priceStability:{ volatile: '价格波动', stable: '价格稳定', compressing: '价格内卷' },
  marketShare:   { gaining: '份额提升', stable: '份额稳定', losing: '份额流失' },
};

const INDICATOR_SENTIMENT: Record<string, 'positive' | 'neutral' | 'negative'> = {
  'rapid-growth': 'positive', 'slow-growth': 'positive',
  stable: 'neutral', declining: 'negative',
  accelerating: 'positive', slowing: 'neutral',
  gaining: 'positive', losing: 'negative',
  volatile: 'neutral', compressing: 'negative',
};

// 全部使用蓝色系 tag，不再用 success/warning/error
const SENTIMENT_TAG: Record<string, string> = {
  positive: 'blue',
  neutral:  'geekblue',
  negative: 'cyan',
};

export default function LifecycleAnalysis({ assessment }: Props) {
  const stageLabel = LIFECYCLE_LABEL[assessment.stage];

  const currentCurvePoint = CURVE_DATA.reduce((closest, p) =>
    Math.abs(p.x - assessment.score) < Math.abs(closest.x - assessment.score) ? p : closest,
  );

  const indicators = [
    { key: 'salesTrend',     label: '销量趋势', value: assessment.indicators.salesTrend },
    { key: 'reviewGrowth',   label: '评论增速', value: assessment.indicators.reviewGrowth },
    { key: 'priceStability', label: '价格稳定', value: assessment.indicators.priceStability },
    { key: 'marketShare',    label: '市场份额', value: assessment.indicators.marketShare },
  ];

  return (
    <div>
      <Row gutter={[20, 20]}>
        {/* 左：阶段概览 */}
        <Col span={8}>
          <Card bordered={false} style={{ background: '#fafafa', height: '100%' }}>
            {/* 当前阶段 */}
            <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `${C_PRIMARY}18`,
                border: `3px solid ${C_PRIMARY}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <RocketOutlined style={{ fontSize: 32, color: C_PRIMARY }} />
              </div>
              <Title level={3} style={{ margin: '0 0 4px', color: C_PRIMARY }}>
                {stageLabel}
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>产品生命周期当前阶段</Text>
            </div>

            <Divider style={{ margin: '0 0 16px' }} />

            <Row gutter={[12, 16]}>
              <Col span={24}>
                <Text type="secondary" style={{ fontSize: 12 }}>月均增长率</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  {assessment.monthlyGrowthRate >= 0
                    ? <RiseOutlined style={{ color: C_PRIMARY }} />
                    : <ArrowDownOutlined style={{ color: C_LIGHTER }} />
                  }
                  <Text strong style={{ fontSize: 18, color: C_PRIMARY }}>
                    +{assessment.monthlyGrowthRate}%
                  </Text>
                </div>
              </Col>
              <Col span={24}>
                <Text type="secondary" style={{ fontSize: 12 }}>市场成熟度</Text>
                <Progress
                  percent={assessment.marketMaturity}
                  strokeColor={C_PRIMARY}
                  style={{ marginTop: 4 }}
                />
              </Col>
              <Col span={24}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  竞争激烈程度
                </Text>
                <Tag color="blue" style={{ fontSize: 13 }}>
                  {INTENSITY_LABEL[assessment.competitiveIntensity]}
                </Tag>
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <Title level={5} style={{ margin: '0 0 12px' }}>关键指标</Title>
            {indicators.map(({ key, label, value }) => {
              const sentiment = INDICATOR_SENTIMENT[value as keyof typeof INDICATOR_SENTIMENT] ?? 'neutral';
              return (
                <div key={key} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 8,
                }}>
                  <Text style={{ fontSize: 13, color: '#595959' }}>{label}</Text>
                  <Tag color={SENTIMENT_TAG[sentiment]} style={{ fontSize: 12, margin: 0 }}>
                    {INDICATOR_LABEL[key][value]}
                  </Tag>
                </div>
              );
            })}
          </Card>
        </Col>

        {/* 右：生命周期曲线 + 建议 */}
        <Col span={16}>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>生命周期曲线</Title>}
            bordered={false}
            style={{ background: '#fafafa', marginBottom: 16 }}
          >
            {/* 阶段标注 */}
            <div style={{ display: 'flex', marginBottom: 8 }}>
              {(['introduction', 'growth', 'maturity', 'decline'] as const).map((s) => (
                <div key={s} style={{
                  flex: 1, textAlign: 'center', padding: '4px 0',
                  background: s === assessment.stage ? `${C_PRIMARY}12` : 'transparent',
                  borderRadius: 4,
                  border: s === assessment.stage ? `1px solid ${C_LIGHTER}` : 'none',
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: s === assessment.stage ? 600 : 400,
                    color: s === assessment.stage ? C_PRIMARY : '#8c8c8c',
                  }}>
                    {LIFECYCLE_LABEL[s]}
                  </Text>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={CURVE_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="lifecycleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C_PRIMARY} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C_PRIMARY} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <ReferenceLine x={25} stroke="#d9d9d9" strokeDasharray="4 4" />
                <ReferenceLine x={50} stroke="#d9d9d9" strokeDasharray="4 4" />
                <ReferenceLine x={75} stroke="#d9d9d9" strokeDasharray="4 4" />
                <ReferenceDot
                  x={assessment.score}
                  y={currentCurvePoint.y}
                  r={7}
                  fill={C_PRIMARY}
                  stroke="#fff"
                  strokeWidth={2}
                  label={{ value: '当前', position: 'top', fontSize: 11, fill: C_PRIMARY }}
                />
                <XAxis dataKey="x" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={() => null} />
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke={C_PRIMARY}
                  strokeWidth={2.5}
                  fill="url(#lifecycleGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>产品上市初期</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>产品生命末期</Text>
            </div>
          </Card>

          {/* 运营建议 */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BulbOutlined style={{ color: C_PRIMARY }} />
                <Title level={5} style={{ margin: 0 }}>运营建议</Title>
              </div>
            }
            bordered={false}
            style={{ background: C_BG }}
          >
            <List
              dataSource={assessment.recommendations}
              renderItem={(item, idx) => (
                <List.Item style={{ padding: '8px 0', borderBottom: 'none' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <CheckCircleFilled
                      style={{ color: idx < 3 ? C_PRIMARY : C_LIGHT, fontSize: 14, marginTop: 3 }}
                    />
                    <Text style={{ color: '#595959', lineHeight: 1.7, fontSize: 13 }}>{item}</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

interface Props {
  assessment: LifecycleAssessment;
}
