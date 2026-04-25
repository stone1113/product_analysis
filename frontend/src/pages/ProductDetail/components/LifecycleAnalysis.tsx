import { useMemo } from 'react';
import { Row, Col, Card, Typography, List, Divider, Empty, Tag } from 'antd';
import {
  RocketOutlined,
  CheckCircleFilled,
  BulbOutlined,
  RiseOutlined,
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
import type {
  AnalysisPeriod,
  AnalysisCustomRange,
  LifecycleAssessment,
  LifecycleStage,
  ProductDetail,
} from '../../../types';
import { LIFECYCLE_LABEL } from '../../../types';
import { getAnalysisPeriodLabel } from '../../../utils/analysisPeriod';
import {
  buildOpsRecommendations,
  flattenOpsLine,
  type OpsRecommendationLine,
} from '../../../utils/opsRecommendations';

const { Title, Text } = Typography;

const C_PRIMARY = '#1677ff';
const C_LIGHT = '#4096ff';
const C_LIGHTER = '#69b1ff';
const C_BG = '#f0f5ff';

/** 无 score 时的阶段锚点 fallback */
const STAGE_ANCHOR_X: Record<LifecycleStage, number> = {
  introduction: 15,
  growth: 40,
  maturity: 65,
  decline: 88,
};

function curveXFromAssessment(assessment: LifecycleAssessment): number {
  const s = assessment.score;
  if (typeof s === 'number' && !Number.isNaN(s)) {
    return Math.min(100, Math.max(0, s));
  }
  return STAGE_ANCHOR_X[assessment.stage];
}

const REVIEW_MOM_LABEL: Record<LifecycleAssessment['indicators']['positiveReviewRateMom'], string> = {
  up: '环比上升',
  down: '环比下降',
  flat: '环比持平',
};

const REVIEW_MOM_TAG: Record<LifecycleAssessment['indicators']['positiveReviewRateMom'], string> = {
  up: 'blue',
  down: 'cyan',
  flat: 'geekblue',
};

const CURVE_DATA = [
  { x: 0, y: 2 }, { x: 5, y: 3 }, { x: 10, y: 5 }, { x: 15, y: 8 },
  { x: 20, y: 13 }, { x: 25, y: 22 }, { x: 30, y: 33 }, { x: 35, y: 46 },
  { x: 40, y: 58 }, { x: 45, y: 69 }, { x: 50, y: 78 }, { x: 55, y: 85 },
  { x: 60, y: 90 }, { x: 65, y: 93 }, { x: 70, y: 94 }, { x: 75, y: 93 },
  { x: 80, y: 88 }, { x: 85, y: 78 }, { x: 90, y: 62 }, { x: 95, y: 42 },
  { x: 100, y: 25 },
];

function RecommendationBody({ line }: { line: OpsRecommendationLine }) {
  return (
    <span style={{ color: '#595959', lineHeight: 1.75, fontSize: 13 }}>
      {line.parts.map((p, i) =>
        p.highlight ? (
          <strong
            key={i}
            style={{
              color: C_PRIMARY,
              fontWeight: 600,
              background: `linear-gradient(transparent 62%, ${C_PRIMARY}26 62%)`,
              padding: '0 1px',
            }}
          >
            {p.text}
          </strong>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </span>
  );
}

interface Props {
  assessment: LifecycleAssessment;
  analysisPeriod: AnalysisPeriod;
  analysisCustomRange: AnalysisCustomRange;
  product: ProductDetail;
}

export default function LifecycleAnalysis({
  assessment,
  analysisPeriod,
  analysisCustomRange,
  product,
}: Props) {
  const stageLabel = LIFECYCLE_LABEL[assessment.stage];
  const anchorX = curveXFromAssessment(assessment);
  const currentCurvePoint = CURVE_DATA.reduce((closest, p) =>
    Math.abs(p.x - anchorX) < Math.abs(closest.x - anchorX) ? p : closest,
  );

  const derivedRecs = useMemo(
    () => buildOpsRecommendations(product, analysisPeriod, analysisCustomRange),
    [product, analysisPeriod, analysisCustomRange],
  );
  const recs = useMemo((): OpsRecommendationLine[] => {
    const api = assessment.recommendations ?? [];
    const out: OpsRecommendationLine[] = [];
    const seen = new Set<string>();
    for (const line of derivedRecs) {
      const k = flattenOpsLine(line);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(line);
    }
    for (const s of api) {
      if (seen.has(s)) continue;
      seen.add(s);
      out.push({ parts: [{ text: s }] });
    }
    return out;
  }, [derivedRecs, assessment.recommendations]);

  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
        当前口径：{getAnalysisPeriodLabel(analysisPeriod, analysisCustomRange)}。下方销量/好评率为数据侧按约定口径提供的可观测值（销量为
        <Text strong style={{ fontSize: 12 }}>
          按月环比
        </Text>
        相对上一完整自然月）。阶段与曲线打点与 score 对齐。
      </Text>
      <Row gutter={[20, 20]}>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#fafafa', height: '100%' }}>
            <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `${C_PRIMARY}18`,
                  border: `3px solid ${C_PRIMARY}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <RocketOutlined style={{ fontSize: 32, color: C_PRIMARY }} />
              </div>
              <Title level={3} style={{ margin: '0 0 4px', color: C_PRIMARY }}>
                {stageLabel}
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                生命周期当前阶段
              </Text>
            </div>

            <Divider style={{ margin: '0 0 16px' }} />

            <Title level={5} style={{ margin: '0 0 8px' }}>
              运营趋势
            </Title>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              销量为按月环比具体幅度；好评率及环比方向按统一口径提供。
            </Text>
            {(() => {
              const { salesMomChangePercent, positiveReviewRatePercent, positiveReviewRateMom } =
                assessment.indicators;
              const salesPct = `${salesMomChangePercent >= 0 ? '+' : ''}${salesMomChangePercent.toFixed(1)}%`;
              return (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <Text style={{ fontSize: 13, color: '#595959' }}>销量趋势</Text>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                        按月环比（相对上一完整自然月）
                      </Text>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        {salesMomChangePercent >= 0 ? (
                          <RiseOutlined style={{ color: C_PRIMARY, fontSize: 14 }} />
                        ) : (
                          <ArrowDownOutlined style={{ color: C_LIGHTER, fontSize: 14 }} />
                        )}
                        <Text strong style={{ fontSize: 16, color: C_PRIMARY }}>
                          {salesPct}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <Text style={{ fontSize: 13, color: '#595959' }}>好评率</Text>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                        环比相对上一完整自然月
                      </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Text strong style={{ fontSize: 15, color: C_PRIMARY }}>
                        {positiveReviewRatePercent.toFixed(1)}%
                      </Text>
                      <Tag color={REVIEW_MOM_TAG[positiveReviewRateMom]} style={{ fontSize: 12, margin: 0 }}>
                        {REVIEW_MOM_LABEL[positiveReviewRateMom]}
                      </Tag>
                    </div>
                  </div>
                </>
              );
            })()}
          </Card>
        </Col>

        <Col span={16}>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>生命周期曲线（示意）</Title>}
            bordered={false}
            style={{ background: '#fafafa', marginBottom: 16 }}
          >
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              示意曲线用于对照阶段概念；打点横坐标为 score（0–100）；无效时按阶段锚定。不代表真实销量曲线。
            </Text>
            <div style={{ display: 'flex', marginBottom: 8 }}>
              {(['introduction', 'growth', 'maturity', 'decline'] as const).map((s) => (
                <div
                  key={s}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '4px 0',
                    background: s === assessment.stage ? `${C_PRIMARY}12` : 'transparent',
                    borderRadius: 4,
                    border: s === assessment.stage ? `1px solid ${C_LIGHTER}` : 'none',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: s === assessment.stage ? 600 : 400,
                      color: s === assessment.stage ? C_PRIMARY : '#8c8c8c',
                    }}
                  >
                    {LIFECYCLE_LABEL[s]}
                  </Text>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={CURVE_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="lifecycleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C_PRIMARY} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C_PRIMARY} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <ReferenceLine x={25} stroke="#d9d9d9" strokeDasharray="4 4" />
                <ReferenceLine x={50} stroke="#d9d9d9" strokeDasharray="4 4" />
                <ReferenceLine x={75} stroke="#d9d9d9" strokeDasharray="4 4" />
                <ReferenceDot
                  x={anchorX}
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
              <Text type="secondary" style={{ fontSize: 11 }}>
                产品上市初期
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                产品生命末期
              </Text>
            </div>
          </Card>

          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BulbOutlined style={{ color: C_PRIMARY }} />
                <Title level={5} style={{ margin: 0 }}>
                  运营建议
                </Title>
              </div>
            }
            bordered={false}
            style={{ background: C_BG }}
          >
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              由当前产品标签、口径内销量、评论 VOC、关键词分析归纳；切换统一分析口径后同步更新。若有其它补充说明，会追加在下方。
            </Text>
            {recs.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无可归纳建议。请确认标签、销量、评论与关键词数据是否齐全。"
              />
            ) : (
              <List
                dataSource={recs}
                renderItem={(item, idx) => (
                  <List.Item style={{ padding: '8px 0', borderBottom: 'none' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <CheckCircleFilled
                        style={{ color: idx < 3 ? C_PRIMARY : C_LIGHT, fontSize: 14, marginTop: 4 }}
                      />
                      <RecommendationBody line={item} />
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
