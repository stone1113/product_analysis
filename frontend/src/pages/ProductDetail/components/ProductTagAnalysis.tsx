import { useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Tag,
  Typography,
  Table,
  Divider,
  Tooltip,
  Space,
  Statistic,
} from 'antd';
import {
  TagsOutlined,
  ShopOutlined,
  TeamOutlined,
  BulbOutlined,
  InboxOutlined,
  RiseOutlined,
  FireOutlined,
  SearchOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { AnalysisPeriod, AnalysisCustomRange, ProductDetail, TagCategory } from '../../../types';
import { getAnalysisPeriodLabel, filterSalesDataByPeriod } from '../../../utils/analysisPeriod';

const { Title, Text } = Typography;

const C_PRIMARY = '#1677ff';
const C_LIGHT = '#4096ff';
const C_LIGHTER = '#69b1ff';
const C_BG = '#f0f5ff';
const C_TEXT = '#262626';
const C_MUTED = '#8c8c8c';

/** 总览分区统一主色与底，避免多色浅底杂乱 */
const CATEGORY_CONFIG: Record<
  Exclude<TagCategory, 'custom'>,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  attribute: { label: '基础属性', icon: <TagsOutlined />, color: C_PRIMARY, bg: C_BG },
  market: { label: '场景标签', icon: <ShopOutlined />, color: C_PRIMARY, bg: C_BG },
  competitor: { label: '竞品参照', icon: <TeamOutlined />, color: C_PRIMARY, bg: C_BG },
};

const ATTR_KW_MAP: Record<string, string[]> = {
  '主动降噪 ANC': ['KW003'],
  'IPX5防水': ['KW006'],
  '10分钟快充': [],
  '多设备连接': ['KW008'],
  '蓝牙5.3': ['KW001', 'KW002', 'KW004'],
  '30H续航': ['KW001', 'KW002'],
  '半入耳设计': ['KW001', 'KW002', 'KW004'],
  '6麦降噪通话': ['KW008'],
  'CNC铝合金充电盒': [],
};

const SCENE_KW_MAP: Record<string, string[]> = {
  通勤首选: ['KW001', 'KW002', 'KW004'],
  运动健身: ['KW006'],
  居家办公: ['KW005', 'KW008'],
  礼品市场: [],
  学生党: ['KW007'],
  商务人士: ['KW003', 'KW008'],
};

type ProfileTagType = '基础属性' | '销售表现' | '关键词需求' | '场景人群';

interface ProfileTagRow {
  tag: string;
  type: ProfileTagType;
  weight: number;
  evidence: string;
  action: string;
  source: string;
}

interface Props {
  product: ProductDetail;
  analysisPeriod: AnalysisPeriod;
  analysisCustomRange: AnalysisCustomRange;
}

function normalize(value: number, max: number, scale = 1): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((value / max) * 100 * scale));
}

function formatMonth(month?: string): string {
  return month ? month.slice(0, 7) : '--';
}

/** 画像标签统一蓝色 Tag，类型差异用旁注文案区分 */
function getTagColor(_type: ProfileTagType): string {
  return 'blue';
}

export default function ProductTagAnalysis({ product, analysisPeriod, analysisCustomRange }: Props) {
  const { tags, keywords, salesData, reviewAnalysis } = product;
  const periodLabel = getAnalysisPeriodLabel(analysisPeriod, analysisCustomRange);
  const periodSalesData = useMemo(
    () => filterSalesDataByPeriod(salesData, analysisPeriod, analysisCustomRange),
    [salesData, analysisPeriod, analysisCustomRange],
  );

  /** 暂不展示「竞品参照」分区，需要时去掉 filter 即可恢复 */
  const grouped = (Object.keys(CATEGORY_CONFIG) as Exclude<TagCategory, 'custom'>[])
    .filter((cat) => cat !== 'competitor')
    .map((cat) => ({
      category: cat,
      tags: tags.filter((t) => t.category === cat),
      ...CATEGORY_CONFIG[cat],
    }));

  const monthlySales = useMemo(() => {
    const salesByMonth: Record<string, number> = {};
    periodSalesData.forEach((item) => {
      salesByMonth[item.month] = (salesByMonth[item.month] ?? 0) + item.sales;
    });
    return Object.entries(salesByMonth)
      .map(([month, sales]) => ({ month, sales }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [periodSalesData]);

  const salesProfile = useMemo(() => {
    const year2024 = monthlySales.filter((item) => item.month.startsWith('2024'));
    const year2023 = monthlySales.filter((item) => item.month.startsWith('2023'));
    const peakMonth = [...year2024].sort((a, b) => b.sales - a.sales)[0];
    const valleyMonth = [...year2024].sort((a, b) => a.sales - b.sales)[0];
    const total2024 = year2024.reduce((sum, item) => sum + item.sales, 0);
    const total2023 = year2023.reduce((sum, item) => sum + item.sales, 0);
    const q4Sales = year2024
      .filter((item) => ['10', '11', '12'].includes(item.month.slice(5)))
      .reduce((sum, item) => sum + item.sales, 0);
    const yoyGrowth = total2023 > 0 ? Math.round(((total2024 - total2023) / total2023) * 100) : 0;
    const q4Ratio = total2024 > 0 ? Math.round((q4Sales / total2024) * 100) : 0;

    return {
      peakMonth,
      valleyMonth,
      total2024,
      yoyGrowth,
      q4Ratio,
      avgMonthlySales: year2024.length > 0 ? Math.round(total2024 / year2024.length) : 0,
    };
  }, [monthlySales]);

  const keywordProfile = useMemo(() => {
    const totalImpressions = keywords.reduce((sum, item) => sum + item.impressions, 0);
    const totalOrders = keywords.reduce((sum, item) => sum + item.orders, 0);
    const topExposureKeywords = [...keywords].sort((a, b) => b.impressions - a.impressions).slice(0, 5);
    const topOrders = [...keywords].sort((a, b) => b.orders - a.orders)[0];

    return {
      totalImpressions,
      totalOrders,
      topExposureKeywords,
      topOrders,
    };
  }, [keywords]);

  const keywordDemandTags = useMemo<ProfileTagRow[]>(() => {
    const makeRow = (
      tag: string,
      matchedWords: string[],
      action: string,
      weight: number,
    ): ProfileTagRow | null => {
      const matchedKeywords = keywordProfile.topExposureKeywords.filter((keyword) =>
        matchedWords.some((word) => keyword.keyword.includes(word)),
      );
      if (matchedKeywords.length === 0) return null;

      return {
        tag,
        type: '关键词需求',
        weight,
        evidence: `高曝光词群：${matchedKeywords.map((keyword) => keyword.keyword).join('、')}`,
        action,
        source: `${periodLabel}广告关键词 impressions 排名前列词群`,
      };
    };

    return [
      makeRow(
        '蓝牙耳机核心需求',
        ['bluetooth', 'wireless', 'true wireless'],
        '标题和主图保持蓝牙/无线耳机的核心品类表达',
        92,
      ),
      makeRow(
        '降噪功能需求',
        ['noise cancelling', 'anc'],
        '将降噪能力作为功能型卖点重点表达',
        86,
      ),
      makeRow(
        '轻运动使用场景',
        ['sport'],
        '补充运动佩戴、防水、稳定连接等场景素材',
        76,
      ),
      makeRow(
        '手机适配人群',
        ['iphone'],
        '在详情页和广告素材中说明手机兼容性',
        72,
      ),
      makeRow(
        '通话麦克风需求',
        ['microphone'],
        '突出通话降噪和麦克风表现，覆盖办公/通勤人群',
        70,
      ),
      makeRow(
        '价格敏感人群',
        ['budget'],
        '保留性价比表达，适合做促销素材和低价流量承接',
        68,
      ),
    ].filter((item): item is ProfileTagRow => item !== null);
  }, [keywordProfile.topExposureKeywords, periodLabel]);

  const profileTags = useMemo<ProfileTagRow[]>(() => {
    const attributeRows = tags
      .filter((tag) => tag.category === 'attribute')
      .map((tag) => {
        const keywordIds = ATTR_KW_MAP[tag.text] ?? [];
        const matchedKeywords = keywords.filter((keyword) => keywordIds.includes(keyword.id));
        const matchedImpressions = matchedKeywords.reduce((sum, keyword) => sum + keyword.impressions, 0);
        const weight = keywordIds.length > 0
          ? Math.max(62, normalize(matchedImpressions, keywordProfile.totalImpressions, 3))
          : 58;

        return {
          tag: tag.text,
          type: '基础属性' as const,
          weight,
          evidence: keywordIds.length > 0
            ? `命中关键词：${matchedKeywords.map((keyword) => keyword.keyword).join('、')}`
            : `来自产品五点/规格：${product.bulletPoints.find((point) => point.includes(tag.text.split(/[ A-Z]/)[0])) ?? tag.text}`,
          action: weight >= 80 ? '作为主图和标题核心卖点强化' : '作为规格卖点保留在五点描述中',
          source: `基础属性 + ${periodLabel}关键词映射`,
        };
      });

    const salesRows: ProfileTagRow[] = [
      {
        tag: salesProfile.yoyGrowth >= 30 ? '成长型爆款' : '稳定销售品',
        type: '销售表现',
        weight: Math.min(96, Math.max(65, salesProfile.yoyGrowth + 45)),
        evidence: `${periodLabel}销量 ${salesProfile.total2024.toLocaleString()} 单，较上年同期口径 ${salesProfile.yoyGrowth}%`,
        action: salesProfile.yoyGrowth >= 30 ? '维持广告投入和库存深度，避免增长期断货' : '按稳定品策略控制库存和推广预算',
        source: `${periodLabel} salesData 销量`,
      },
      {
        tag: salesProfile.q4Ratio >= 30 ? 'Q4旺季品' : '常年销售品',
        type: '销售表现',
        weight: Math.min(95, Math.max(60, salesProfile.q4Ratio * 2)),
        evidence: `${periodLabel}内 Q4 销量占比 ${salesProfile.q4Ratio}%，峰值月 ${formatMonth(salesProfile.peakMonth?.month)}`,
        action: salesProfile.q4Ratio >= 30 ? '旺季前 60 天完成备货和素材预热' : '按月均销量滚动补货',
        source: `${periodLabel} salesData 月度峰值`,
      },
    ];

    const sceneRows = tags
      .filter((tag) => tag.category === 'market')
      .map((tag) => {
        const keywordIds = SCENE_KW_MAP[tag.text] ?? [];
        const orders = keywords
          .filter((keyword) => keywordIds.includes(keyword.id))
          .reduce((sum, keyword) => sum + keyword.orders, 0);
        const weight = tag.text === '礼品市场'
          ? Math.min(92, Math.max(55, salesProfile.q4Ratio * 2))
          : Math.max(50, normalize(orders, keywordProfile.totalOrders, 4));

        return {
          tag: tag.text,
          type: '场景人群' as const,
          weight,
          evidence: tag.text === '礼品市场'
            ? `由 Q4 销量占比 ${salesProfile.q4Ratio}% 推导`
            : `关联关键词出单 ${orders} 单`,
          action: weight >= 70 ? '适合独立制作场景图和广告素材' : '作为辅助场景保留在详情页',
          source: `市场标签 + ${periodLabel}关键词出单`,
        };
      });

    return [...attributeRows, ...salesRows, ...keywordDemandTags, ...sceneRows]
      .sort((a, b) => b.weight - a.weight);
  }, [tags, keywords, keywordProfile, keywordDemandTags, periodLabel, product.bulletPoints, salesProfile]);

  const coreProfileTags = profileTags.slice(0, 6);
  const topAttributeTags = profileTags.filter((item) => item.type === '基础属性').slice(0, 4);

  const newProductSuggestions = useMemo(() => {
    const topNegative = [...reviewAnalysis.negativeTags].sort((a, b) => b.count - a.count).slice(0, 2);
    const topCoreTag = coreProfileTags[0]?.tag ?? '核心卖点';

    return [
      {
        direction: '强化主推款画像',
        basisTags: coreProfileTags.slice(0, 3),
        actions: [
          `围绕"${topCoreTag}"统一标题、首图、五点和广告关键词`,
          `将"${keywordProfile.topOrders?.keyword}"作为成交核心词持续放量`,
          `保留 ${topAttributeTags.map((item) => item.tag).join('、')} 作为主卖点组合`,
        ],
        sourceNote: `数据来源：${periodLabel}画像标签 Top3 + 关键词分析`,
      },
      {
        direction: '下一版改款方向',
        basisTags: topNegative.map((item) => ({
          tag: item.text,
          type: '基础属性' as ProfileTagType,
          weight: Math.min(95, Math.round((item.count / reviewAnalysis.totalReviews) * 100 * 12)),
          evidence: `${item.count} 条差评提及`,
          action: '纳入改款需求',
          source: `${periodLabel} VOC差评`,
        })),
        actions: [
          `优先解决"${topNegative[0]?.text}"，避免核心画像被差评稀释`,
          `结合"${topNegative[1]?.text}"补齐体验短板`,
          '改款后继续保留当前核心画像标签，避免牺牲已验证卖点',
        ],
        sourceNote: `数据来源：${periodLabel}VOC差评关键词`,
      },
    ];
  }, [coreProfileTags, keywordProfile.topOrders?.keyword, periodLabel, reviewAnalysis, topAttributeTags]);

  const stockSuggestions = useMemo(() => {
    const peakDailySales = salesProfile.peakMonth ? Math.round(salesProfile.peakMonth.sales / 30) : 0;
    const valleyDailySales = salesProfile.valleyMonth ? Math.round(salesProfile.valleyMonth.sales / 30) : 0;

    return [
      {
        period: `旺季前 60 天（峰值月 ${formatMonth(salesProfile.peakMonth?.month)}）`,
        action: `建议备货量：日均 ${peakDailySales} 单 × 90 天 ≈ ${(peakDailySales * 90).toLocaleString()} 单`,
        reason: `产品画像包含"${salesProfile.q4Ratio >= 30 ? 'Q4旺季品' : '成长型销售品'}"，需要提前锁定库存`,
        level: 'critical',
      },
      {
        period: '常规销售期',
        action: `维持 45 天安全库存 ≈ ${(salesProfile.avgMonthlySales * 1.5).toLocaleString()} 单`,
        reason: `2024 月均销量 ${salesProfile.avgMonthlySales.toLocaleString()} 单，适合滚动补货`,
        level: 'high',
      },
      {
        period: `淡季（${formatMonth(salesProfile.valleyMonth?.month)}）`,
        action: `维持基础库存 ≈ ${(valleyDailySales * 45).toLocaleString()} 单`,
        reason: '降低仓储压力，同时保留广告测试和临时放量空间',
        level: 'normal',
      },
    ];
  }, [salesProfile]);

  const profileColumns: ColumnsType<ProfileTagRow> = [
    {
      title: '画像标签',
      dataIndex: 'tag',
      key: 'tag',
      width: 190,
      render: (value: string, row) => (
        <Space size={6} style={{ whiteSpace: 'nowrap' }}>
          <Tag color={getTagColor(row.type)} style={{ margin: 0, fontSize: 12 }}>
            {value}
          </Tag>
          <Text type="secondary" style={{ fontSize: 11 }}>{row.type}</Text>
        </Space>
      ),
    },
    {
      title: '数据来源',
      dataIndex: 'evidence',
      key: 'evidence',
      render: (value: string, row) => (
        <Tooltip title={row.source}>
          <Text style={{ fontSize: 12, color: '#595959' }}>{value}</Text>
        </Tooltip>
      ),
    },
    {
      title: '运营动作',
      dataIndex: 'action',
      key: 'action',
      render: (value: string) => <Text style={{ fontSize: 12, color: '#595959' }}>{value}</Text>,
    },
  ];

  const levelColor: Record<string, string> = {
    critical: C_PRIMARY,
    high: C_LIGHT,
    normal: C_LIGHTER,
  };

  return (
    <div>
      <Card
        title={<Title level={5} style={{ margin: 0 }}>产品标签总览</Title>}
        bordered={false}
        style={{ background: '#fafafa', marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          {grouped.map(({ category, label, icon, color, bg, tags: categoryTags }) => (
            <Col span={24 / grouped.length} key={category}>
              <div style={{ background: bg, borderRadius: 8, padding: '12px 16px', minHeight: 90 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ color, fontSize: 16 }}>{icon}</span>
                  <Text style={{ fontWeight: 600, fontSize: 13, color }}>
                    {label}
                    <span style={{ marginLeft: 6, fontWeight: 400, color: C_MUTED, fontSize: 12 }}>
                      {categoryTags.length} 个
                    </span>
                  </Text>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {categoryTags.map((tag) => (
                    <Tag key={tag.id} color="blue" style={{ margin: 0, fontSize: 12 }}>{tag.text}</Tag>
                  ))}
                  {categoryTags.length === 0 && (
                    <Text type="secondary" style={{ fontSize: 12 }}>暂无标签</Text>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }} align="stretch" wrap>
        <Col xs={24} lg={14} style={{ display: 'flex' }}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ProfileOutlined style={{ color: C_PRIMARY }} />
                <Title level={5} style={{ margin: 0 }}>产品画像标签分析</Title>
              </div>
            }
            bordered={false}
            style={{ background: '#fafafa', flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minHeight: 0 } }}
          >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <div style={{ background: C_BG, borderRadius: 10, padding: 16, border: `1px solid ${C_PRIMARY}22`, height: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>核心画像</Text>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {coreProfileTags.map((item) => (
                  <Tag key={`${item.type}-${item.tag}`} color={getTagColor(item.type)} style={{ margin: 0, padding: '4px 8px' }}>
                    {item.tag}
                  </Tag>
                ))}
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" bordered={false} style={{ background: C_BG, height: '100%' }}>
              <Statistic title="画像标签数" value={profileTags.length} suffix="个" valueStyle={{ color: C_PRIMARY, fontSize: 24 }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card
              size="small"
              title={<Text strong style={{ color: C_PRIMARY }}><TagsOutlined /> 基础属性</Text>}
              bordered={false}
              style={{ background: C_BG, height: '100%' }}
            >
              <Space size={[6, 6]} wrap>
                {topAttributeTags.map((item) => (
                  <Tag key={item.tag} color="blue" style={{ margin: 0 }}>{item.tag}</Tag>
                ))}
              </Space>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              size="small"
              title={<Text strong style={{ color: C_PRIMARY }}><RiseOutlined /> 销售表现</Text>}
              bordered={false}
              style={{ background: C_BG, height: '100%' }}
            >
              <Space size={[6, 6]} wrap>
                <Tag color="blue" style={{ margin: 0 }}>{salesProfile.yoyGrowth >= 30 ? '成长型爆款' : '稳定销售品'}</Tag>
                <Tag color="blue" style={{ margin: 0 }}>峰值月 {formatMonth(salesProfile.peakMonth?.month)}</Tag>
                <Tag color="blue" style={{ margin: 0 }}>Q4占比 {salesProfile.q4Ratio}%</Tag>
              </Space>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              size="small"
              title={<Text strong style={{ color: C_PRIMARY }}><SearchOutlined /> 关键词需求画像</Text>}
              bordered={false}
              style={{ background: C_BG, height: '100%' }}
            >
              <Space size={[6, 6]} wrap>
                {keywordDemandTags.slice(0, 4).map((item) => (
                  <Tag key={item.tag} color="blue" style={{ margin: 0 }}>
                    {item.tag}
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        <div style={{ flex: 1, minHeight: 0 }}>
          <Table
            dataSource={profileTags}
            columns={profileColumns}
            rowKey={(row) => `${row.type}-${row.tag}`}
            pagination={false}
            size="small"
            bordered={false}
          />
        </div>
          </Card>
        </Col>

        <Col xs={24} lg={10} style={{ display: 'flex' }}>
          <Card
            id="tag-profile-actions"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BulbOutlined style={{ color: C_PRIMARY }} />
                <Title level={5} style={{ margin: 0 }}>运营与备货建议</Title>
              </div>
            }
            bordered={false}
            style={{
              background: '#fafafa',
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
            styles={{ body: { flex: 1, overflow: 'auto', minHeight: 0 } }}
          >
            <div>
              <Title level={5} style={{ margin: '0 0 12px', fontSize: 14 }}>
                基于画像的运营建议
              </Title>
              {newProductSuggestions.map((suggestion, index) => (
                <div key={suggestion.direction} style={{ marginBottom: index < newProductSuggestions.length - 1 ? 20 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Tag color="blue" style={{ fontSize: 12, fontWeight: 600 }}>方向 {index + 1}</Tag>
                    <Text strong style={{ fontSize: 14 }}>{suggestion.direction}</Text>
                  </div>
                  <div
                    style={{
                      background: C_BG,
                      borderRadius: 6,
                      padding: '10px 14px',
                      borderLeft: `3px solid ${C_PRIMARY}`,
                      marginBottom: 8,
                    }}
                  >
                    <Text strong style={{ color: C_PRIMARY, marginRight: 6, fontSize: 12 }}>画像依据：</Text>
                    {suggestion.basisTags.map((item) => (
                      <Tag key={`${item.type}-${item.tag}`} color={getTagColor(item.type)} style={{ fontSize: 11 }}>
                        {item.tag}
                      </Tag>
                    ))}
                    <Text style={{ display: 'block', marginTop: 6, fontSize: 11, color: C_MUTED }}>
                      {suggestion.sourceNote}
                    </Text>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {suggestion.actions.map((action) => (
                      <li key={action} style={{ fontSize: 13, color: '#595959', marginBottom: 4 }}>{action}</li>
                    ))}
                  </ul>
                  {index < newProductSuggestions.length - 1 && <Divider style={{ margin: '16px 0' }} />}
                </div>
              ))}
            </div>

            <Divider style={{ margin: '8px 0 16px' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <InboxOutlined style={{ color: C_PRIMARY }} />
                <Text strong style={{ fontSize: 13 }}>画像驱动备货建议</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                根据销量画像、旺季标签和月均销量自动推导。
              </Text>
              {stockSuggestions.map((suggestion) => (
                <div key={suggestion.period} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <FireOutlined style={{ color: levelColor[suggestion.level] }} />
                    <Text strong style={{ fontSize: 13, color: C_TEXT }}>{suggestion.period}</Text>
                  </div>
                  <div
                    style={{
                      background: C_BG,
                      borderLeft: `3px solid ${levelColor[suggestion.level]}`,
                      borderRadius: '0 6px 6px 0',
                      padding: '8px 12px',
                    }}
                  >
                    <Text strong style={{ fontSize: 13, color: C_TEXT, display: 'block', marginBottom: 4 }}>
                      {suggestion.action}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#595959' }}>{suggestion.reason}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
