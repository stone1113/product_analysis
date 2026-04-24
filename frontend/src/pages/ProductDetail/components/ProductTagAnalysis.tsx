import { Row, Col, Card, Tag, Typography, Table, Progress, Divider, Alert } from 'antd';
import {
  TagsOutlined,
  ShopOutlined,
  TeamOutlined,
  StarOutlined,
  BulbOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { ProductTag, TagCategory } from '../../../types';

const { Title, Text, Paragraph } = Typography;

interface Props {
  tags: ProductTag[];
}

// ── 分类配置 ──────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<
  TagCategory,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  attribute:  { label: '产品属性', icon: <TagsOutlined />,  color: '#1677ff', bg: '#f0f5ff' },
  market:     { label: '市场场景', icon: <ShopOutlined />,  color: '#4096ff', bg: '#e8f4ff' },
  competitor: { label: '竞品参照', icon: <TeamOutlined />,  color: '#69b1ff', bg: '#eff8ff' },
  custom:     { label: '运营标注', icon: <StarOutlined />,  color: '#2f54eb', bg: '#f0f5ff' },
};

// ── 属性标签维度得分（Mock 分析数据） ─────────────────────────────
const ATTR_ANALYSIS = [
  { attr: '主动降噪 ANC',   heat: 92, buyerDemand: 88, competitive: 75, suggestion: '核心卖点，需在标题和图片中突出，建议A+内容专项展示' },
  { attr: '30H续航',       heat: 85, buyerDemand: 82, competitive: 60, suggestion: '差异化优势明显，竞品普遍20H，续航可作为首要对比项' },
  { attr: '10分钟快充',    heat: 78, buyerDemand: 80, competitive: 55, suggestion: '买家高频提及，建议Listing五点中单独列出快充参数' },
  { attr: '蓝牙5.3',       heat: 65, buyerDemand: 60, competitive: 70, suggestion: '技术规格标注，同级竞品已普及，维持现状即可' },
  { attr: '6麦降噪通话',   heat: 72, buyerDemand: 75, competitive: 50, suggestion: '商务/通勤场景强需求，建议增加通话场景图' },
  { attr: 'IPX5防水',      heat: 68, buyerDemand: 65, competitive: 65, suggestion: '运动场景标配，搭配运动图素可提升场景点击率' },
  { attr: '多设备连接',    heat: 60, buyerDemand: 70, competitive: 58, suggestion: '居家办公用户高需求，可在Q&A中重点解答切换步骤' },
  { attr: 'CNC铝合金充电盒',heat: 55, buyerDemand: 62, competitive: 40, suggestion: '差评中充电盒做工占比高，此属性可作为改款重点方向' },
];

// ── 市场场景需求分析 ──────────────────────────────────────────────
const MARKET_ANALYSIS = [
  { scene: '通勤首选', matchScore: 95, stockSuggestion: '重点备货，旺季提前60天建仓，备货量建议 ×1.5 系数', priority: 'high' },
  { scene: '礼品市场', matchScore: 82, stockSuggestion: 'Q4节日季（11-12月）重点推广，礼品包装选项可提升转化', priority: 'high' },
  { scene: '居家办公', matchScore: 78, stockSuggestion: '常态化需求稳定，维持安全库存 45 天', priority: 'medium' },
  { scene: '运动健身', matchScore: 65, stockSuggestion: '季节性需求（春夏）稍高，Q1-Q2适当补货', priority: 'medium' },
  { scene: '学生党',   matchScore: 58, stockSuggestion: '开学季（8-9月）有小高峰，可配合促销活动', priority: 'low' },
];

// ── 开品建议 ─────────────────────────────────────────────────────
const NEW_PRODUCT_SUGGESTIONS = [
  {
    direction: '升级款 ANC 耳机',
    basis: '基于当前产品差评：充电盒做工差 + 低频降噪效果不足',
    actions: [
      '充电盒升级为 CNC 铝合金一体成型，解决用户最大痛点',
      '降噪芯片升级至新一代，低频降噪深度从 -35dB 提升至 -42dB',
      '保持快充 + 长续航优势，不降低核心竞争力',
    ],
    expectedPrice: '$39.99 – $44.99',
  },
  {
    direction: '游戏/电竞版耳机',
    basis: '关键词分析显示 "gaming headset low latency" 搜索量月增 23%',
    actions: [
      '新增游戏低延迟模式（<40ms），满足手游场景',
      'RGB 灯效设计，提升年轻用户吸引力',
      '保留 ANC 和通话降噪，一机多用',
    ],
    expectedPrice: '$34.99 – $39.99',
  },
];

// ── 备货建议 ──────────────────────────────────────────────────────
const STOCK_SUGGESTIONS = [
  { period: '旺季前60天（10月初）', action: '建议备货量为日均销量 × 90 天', reason: 'Q4 礼品 + 通勤双驱动，历史数据显示 11-12 月销量环比+60%', level: 'critical' },
  { period: '旺季前30天（11月初）', action: '补充安全库存 ×30 天', reason: '避免 Black Friday 断货，断货损失预估 $12,000+/周', level: 'high' },
  { period: '淡季（1-3月）',       action: '维持 45 天安全库存',  reason: '降低仓储成本，但不低于 30 天防止临时爆单', level: 'normal' },
  { period: '开学季（8月）',       action: '较平日增加 20% 备货',  reason: '学生场景需求小高峰，结合返校促销', level: 'normal' },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: '#1677ff', medium: '#4096ff', low: '#91caff',
  critical: '#1677ff', normal: '#69b1ff',
};

export default function ProductTagAnalysis({ tags }: Props) {
  // 按分类分组
  const grouped = (Object.keys(CATEGORY_CONFIG) as TagCategory[]).map((cat) => ({
    category: cat,
    tags: tags.filter((t) => t.category === cat),
    ...CATEGORY_CONFIG[cat],
  }));

  const attrColumns = [
    { title: '属性标签', dataIndex: 'attr', key: 'attr', width: 140,
      render: (v: string) => <Tag color="blue" style={{ fontSize: 12 }}>{v}</Tag> },
    { title: '买家热度', dataIndex: 'heat', key: 'heat', width: 130,
      render: (v: number) => <Progress percent={v} strokeColor="#1677ff" size="small" /> },
    { title: '需求强度', dataIndex: 'buyerDemand', key: 'buyerDemand', width: 130,
      render: (v: number) => <Progress percent={v} strokeColor="#4096ff" size="small" /> },
    { title: '竞品覆盖', dataIndex: 'competitive', key: 'competitive', width: 130,
      render: (v: number) => <Progress percent={v} strokeColor="#69b1ff" size="small" /> },
    { title: '分析建议', dataIndex: 'suggestion', key: 'suggestion',
      render: (v: string) => <Text style={{ fontSize: 12, color: '#595959' }}>{v}</Text> },
  ];

  const marketColumns = [
    { title: '使用场景', dataIndex: 'scene', key: 'scene', width: 110,
      render: (v: string) => <Tag color="geekblue" style={{ fontSize: 12 }}>{v}</Tag> },
    { title: '匹配度', dataIndex: 'matchScore', key: 'matchScore', width: 150,
      render: (v: number, r: typeof MARKET_ANALYSIS[0]) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress percent={v} strokeColor={PRIORITY_COLOR[r.priority]} size="small" style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, color: PRIORITY_COLOR[r.priority], width: 32 }}>{v}</Text>
        </div>
      ),
    },
    { title: '备货建议', dataIndex: 'stockSuggestion', key: 'stockSuggestion',
      render: (v: string) => <Text style={{ fontSize: 12, color: '#595959' }}>{v}</Text> },
  ];

  return (
    <div>
      {/* ── 1. 标签总览 ── */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>产品标签总览</Title>}
        bordered={false}
        style={{ background: '#fafafa', marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          {grouped.map(({ category, label, icon, color, bg, tags: catTags }) => (
            <Col span={6} key={category}>
              <div style={{ background: bg, borderRadius: 8, padding: '12px 16px', minHeight: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ color, fontSize: 16 }}>{icon}</span>
                  <Text style={{ fontWeight: 600, fontSize: 13, color }}>
                    {label}
                    <span style={{ marginLeft: 6, fontWeight: 400, color: '#8c8c8c', fontSize: 12 }}>
                      {catTags.length} 个
                    </span>
                  </Text>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {catTags.map((t) => (
                    <Tag key={t.id} color="blue" style={{ margin: 0, fontSize: 12 }}>{t.text}</Tag>
                  ))}
                  {catTags.length === 0 && (
                    <Text type="secondary" style={{ fontSize: 12 }}>暂无标签</Text>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* ── 2. 属性标签深度分析 ── */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TagsOutlined style={{ color: '#1677ff' }} />
            <Title level={5} style={{ margin: 0 }}>属性标签深度分析</Title>
          </div>
        }
        bordered={false}
        style={{ background: '#fafafa', marginBottom: 16 }}
      >
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
          综合评论关键词、搜索热度及竞品覆盖情况，量化各属性的市场价值
        </Text>
        <Table
          dataSource={ATTR_ANALYSIS}
          columns={attrColumns}
          rowKey="attr"
          pagination={false}
          size="small"
          bordered={false}
        />
      </Card>

      {/* ── 3. 市场场景匹配分析 ── */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShopOutlined style={{ color: '#1677ff' }} />
            <Title level={5} style={{ margin: 0 }}>市场场景匹配分析</Title>
          </div>
        }
        bordered={false}
        style={{ background: '#fafafa', marginBottom: 16 }}
      >
        <Table
          dataSource={MARKET_ANALYSIS}
          columns={marketColumns}
          rowKey="scene"
          pagination={false}
          size="small"
          bordered={false}
        />
      </Card>

      <Row gutter={16}>
        {/* ── 4. 开品建议 ── */}
        <Col span={14}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BulbOutlined style={{ color: '#1677ff' }} />
                <Title level={5} style={{ margin: 0 }}>开品建议</Title>
              </div>
            }
            bordered={false}
            style={{ background: '#fafafa', height: '100%' }}
          >
            {NEW_PRODUCT_SUGGESTIONS.map((s, i) => (
              <div key={i} style={{ marginBottom: i < NEW_PRODUCT_SUGGESTIONS.length - 1 ? 20 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Tag color="blue" style={{ fontSize: 12, fontWeight: 600 }}>方向 {i + 1}</Tag>
                  <Text strong style={{ fontSize: 14 }}>{s.direction}</Text>
                  <Tag color="geekblue" style={{ fontSize: 11 }}>预估售价 {s.expectedPrice}</Tag>
                </div>
                <div style={{
                  background: '#f0f5ff',
                  borderRadius: 6,
                  padding: '10px 14px',
                  borderLeft: '3px solid #1677ff',
                  marginBottom: 8,
                }}>
                  <Text style={{ fontSize: 12, color: '#595959' }}>
                    <Text strong style={{ color: '#1677ff', marginRight: 4 }}>立项依据：</Text>
                    {s.basis}
                  </Text>
                </div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {s.actions.map((a, j) => (
                    <li key={j} style={{ fontSize: 13, color: '#595959', marginBottom: 4 }}>{a}</li>
                  ))}
                </ul>
                {i < NEW_PRODUCT_SUGGESTIONS.length - 1 && <Divider style={{ margin: '16px 0' }} />}
              </div>
            ))}
          </Card>
        </Col>

        {/* ── 5. 备货建议 ── */}
        <Col span={10}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <InboxOutlined style={{ color: '#1677ff' }} />
                <Title level={5} style={{ margin: 0 }}>备货建议</Title>
              </div>
            }
            bordered={false}
            style={{ background: '#fafafa', height: '100%' }}
          >
            {STOCK_SUGGESTIONS.map((s, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: PRIORITY_COLOR[s.level], flexShrink: 0,
                  }} />
                  <Text strong style={{ fontSize: 13, color: '#262626' }}>{s.period}</Text>
                </div>
                <Alert
                  message={s.action}
                  description={s.reason}
                  type="info"
                  showIcon={false}
                  style={{
                    background: '#f0f5ff',
                    border: 'none',
                    borderLeft: `3px solid ${PRIORITY_COLOR[s.level]}`,
                    borderRadius: '0 6px 6px 0',
                    padding: '8px 12px',
                  }}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
