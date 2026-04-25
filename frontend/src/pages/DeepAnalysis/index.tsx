import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import {
  Breadcrumb,
  Button,
  Tabs,
  Table,
  Tag,
  Input,
  Select,
  Rate,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Progress,
  Avatar,
  List,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  SearchOutlined,
  UserOutlined,
  LikeOutlined,
  StarFilled,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import type { ColumnsType } from 'antd/es/table';
import { mockProductDetail } from '../../mock/productDetail';
import type { Keyword } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// ── 统一蓝色系 ────────────────────────────────────
const C_PRIMARY  = '#1677ff';
const C_LIGHT    = '#4096ff';
const C_LIGHTER  = '#69b1ff';
const C_BG       = '#f0f5ff';

// ── 关键词深度分析 ─────────────────────────────────
function KeywordsDeepAnalysis({ keywords }: { keywords: Keyword[] }) {
  const [searchText, setSearchText] = useState('');

  const filtered = useMemo(
    () =>
      keywords.filter((k) => {
        if (!searchText) return true;
        return (
          k.keyword.includes(searchText) ||
          (k.nativeLabel?.includes(searchText) ?? false)
        );
      }),
    [keywords, searchText],
  );

  const scatterData = keywords.map((k) => ({
    x: k.acos,
    y: k.conversion,
    z: k.orders,
    name: k.keyword,
    nativeLabel: k.nativeLabel,
  }));

  const columns: ColumnsType<Keyword> = [
    {
      title: '关键词',
      key: 'keyword',
      render: (_: unknown, r: Keyword) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.keyword}</Text>
          {r.nativeLabel ? (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{r.nativeLabel}</Text>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: '展示量',
      dataIndex: 'impressions',
      key: 'impressions',
      sorter: (a, b) => a.impressions - b.impressions,
      render: (v: number) => v.toLocaleString(),
      align: 'right',
    },
    {
      title: '点击量',
      dataIndex: 'clicks',
      key: 'clicks',
      sorter: (a, b) => a.clicks - b.clicks,
      render: (v: number) => v.toLocaleString(),
      align: 'right',
    },
    {
      title: 'CTR',
      key: 'ctr',
      sorter: (a, b) => a.clicks / a.impressions - b.clicks / b.impressions,
      render: (_: unknown, r: Keyword) => (
        <Text>{((r.clicks / r.impressions) * 100).toFixed(2)}%</Text>
      ),
      align: 'right',
    },
    {
      title: '出单量',
      dataIndex: 'orders',
      key: 'orders',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.orders - b.orders,
      render: (v: number) => (
        <Text strong style={{ color: C_PRIMARY }}>{v.toLocaleString()}</Text>
      ),
      align: 'right',
    },
    {
      title: '转化率',
      dataIndex: 'conversion',
      key: 'conversion',
      sorter: (a, b) => a.conversion - b.conversion,
      render: (v: number) => (
        <div style={{ minWidth: 90 }}>
          <Text style={{ fontSize: 12 }}>{v.toFixed(1)}%</Text>
          <Progress percent={v} showInfo={false} size="small" strokeColor={C_PRIMARY} style={{ margin: 0 }} />
        </div>
      ),
    },
    {
      title: 'ACOS',
      dataIndex: 'acos',
      key: 'acos',
      sorter: (a, b) => a.acos - b.acos,
      render: (v: number) => <Tag color="blue">{v.toFixed(1)}%</Tag>,
      align: 'center',
    },
    {
      title: 'ROAS',
      key: 'roas',
      sorter: (a, b) => a.revenue / a.spend - b.revenue / b.spend,
      render: (_: unknown, r: Keyword) => (
        <Text strong style={{ color: C_PRIMARY }}>
          {(r.revenue / r.spend).toFixed(2)}x
        </Text>
      ),
      align: 'right',
    },
    {
      title: '广告花费',
      dataIndex: 'spend',
      key: 'spend',
      sorter: (a, b) => a.spend - b.spend,
      render: (v: number) => <Text style={{ color: C_LIGHTER }}>${v.toLocaleString()}</Text>,
      align: 'right',
    },
    {
      title: 'CPC',
      dataIndex: 'cpc',
      key: 'cpc',
      render: (v: number) => `$${v.toFixed(2)}`,
      align: 'right',
    },
  ];

  return (
    <div>
      {/* ACOS vs 转化率散点图 */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>ACOS vs 转化率分布（气泡大小=出单量）</Title>}
        bordered={false}
        style={{ background: '#fafafa', marginBottom: 20 }}
      >
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="x" name="ACOS" unit="%" tick={{ fontSize: 12 }}
              label={{ value: 'ACOS (%)', position: 'bottom', offset: -5, fontSize: 12 }} />
            <YAxis dataKey="y" name="转化率" unit="%" tick={{ fontSize: 12 }}
              label={{ value: '转化率 (%)', angle: -90, position: 'insideLeft', fontSize: 12 }} />
            <ZAxis dataKey="z" range={[60, 400]} name="出单量" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload as typeof scatterData[0];
                return (
                  <Card size="small" style={{ fontSize: 12 }}>
                    <div><Text strong>{d.name}</Text></div>
                    {d.nativeLabel ? (
                      <div><Text type="secondary">{d.nativeLabel}</Text></div>
                    ) : null}
                    <div>ACOS: {d.x.toFixed(1)}%</div>
                    <div>转化率: {d.y.toFixed(1)}%</div>
                    <div>出单量: {d.z} 单</div>
                  </Card>
                );
              }}
            />
            <Scatter data={scatterData} fill={C_PRIMARY} fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* 出单量 Bar */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>关键词出单量排名</Title>}
        bordered={false}
        style={{ background: '#fafafa', marginBottom: 20 }}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={[...keywords].sort((a, b) => b.orders - a.orders).map((k) => ({
              name: k.keyword.length > 22 ? `${k.keyword.slice(0, 22)}…` : k.keyword,
              fullKeyword: k.keyword,
              nativeLabel: k.nativeLabel,
              orders: k.orders,
              spend: k.spend,
            }))}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as {
                  fullKeyword: string;
                  nativeLabel?: string;
                  orders: number;
                  spend: number;
                };
                return (
                  <Card size="small" style={{ fontSize: 12 }}>
                    <div><Text strong>{p.fullKeyword}</Text></div>
                    {p.nativeLabel ? (
                      <div><Text type="secondary">{p.nativeLabel}</Text></div>
                    ) : null}
                    <div>出单量: {p.orders.toLocaleString()} 单</div>
                    <div>花费: ${p.spend.toLocaleString()}</div>
                  </Card>
                );
              }}
            />
            <Bar dataKey="orders" name="出单量" fill={C_PRIMARY}  radius={[0, 4, 4, 0]} />
            <Bar dataKey="spend"  name="花费($)" fill={C_LIGHTER} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 筛选 + 详细表 */}
      <Card bordered={false} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: '16px 16px 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索关键词"
            allowClear
            style={{ width: 240 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Text type="secondary" style={{ fontSize: 13, alignSelf: 'center' }}>
            共 {filtered.length} 个关键词
          </Text>
        </div>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="small"
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          style={{ marginTop: 8 }}
        />
      </Card>
    </div>
  );
}

// ── 评论深度分析 ──────────────────────────────────
function ReviewsDeepAnalysis() {
  const { reviewAnalysis } = mockProductDetail;
  const [ratingFilter, setRatingFilter] = useState<number[]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  const filteredReviews = useMemo(
    () =>
      reviewAnalysis.recentReviews.filter((r) => {
        const matchRating = ratingFilter.length === 0 || ratingFilter.includes(r.rating);
        const matchSentiment = sentimentFilter.length === 0 || sentimentFilter.includes(r.sentiment);
        const matchText =
          !searchText ||
          r.title.toLowerCase().includes(searchText.toLowerCase()) ||
          r.content.toLowerCase().includes(searchText.toLowerCase());
        return matchRating && matchSentiment && matchText;
      }),
    [ratingFilter, sentimentFilter, searchText, reviewAnalysis.recentReviews],
  );

  const sentimentStats = {
    positive: reviewAnalysis.recentReviews.filter((r) => r.sentiment === 'positive').length,
    neutral:  reviewAnalysis.recentReviews.filter((r) => r.sentiment === 'neutral').length,
    negative: reviewAnalysis.recentReviews.filter((r) => r.sentiment === 'negative').length,
  };

  return (
    <div>
      {/* 汇总卡片 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { label: '总评论数', value: reviewAnalysis.totalReviews.toLocaleString() },
          { label: '好评数',   value: `${sentimentStats.positive} / ${reviewAnalysis.recentReviews.length}` },
          { label: '中性评论', value: String(sentimentStats.neutral) },
          { label: '差评数',   value: String(sentimentStats.negative) },
        ].map((item) => (
          <Col span={6} key={item.label}>
            <Card size="small" bordered={false} style={{ background: C_BG, borderRadius: 8 }}>
              <Statistic
                title={<Text style={{ fontSize: 12 }}>{item.label}</Text>}
                value={item.value}
                valueStyle={{ color: C_PRIMARY, fontSize: 20 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 星级分布柱图 */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>星级分布</Title>}
        bordered={false}
        style={{ background: '#fafafa', marginBottom: 20 }}
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={[...reviewAnalysis.ratingDistribution].reverse().map((d) => ({
              name: `${d.stars}星`,
              count: d.count,
            }))}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`${v.toLocaleString()} 条`, '评论数']} />
            <Bar dataKey="count" name="评论数" fill={C_PRIMARY} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 关键词云：好评 + 差评 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card
            title={<Text style={{ color: C_PRIMARY, fontWeight: 600 }}>好评关键词 TOP</Text>}
            bordered={false}
            style={{ background: C_BG }}
          >
            {reviewAnalysis.positiveTags.map((tag) => (
              <div key={tag.text} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 13 }}>{tag.text}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Progress
                    percent={Math.round((tag.count / reviewAnalysis.totalReviews) * 100 * 3)}
                    showInfo={false}
                    strokeColor={C_PRIMARY}
                    style={{ width: 80, margin: 0 }}
                    size="small"
                  />
                  <Text type="secondary" style={{ fontSize: 12, width: 36, textAlign: 'right' }}>{tag.count}</Text>
                </div>
              </div>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={<Text style={{ color: C_LIGHT, fontWeight: 600 }}>差评关键词 TOP</Text>}
            bordered={false}
            style={{ background: C_BG }}
          >
            {reviewAnalysis.negativeTags.map((tag) => (
              <div key={tag.text} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 13 }}>{tag.text}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Progress
                    percent={Math.round((tag.count / reviewAnalysis.totalReviews) * 100 * 10)}
                    showInfo={false}
                    strokeColor={C_LIGHT}
                    style={{ width: 80, margin: 0 }}
                    size="small"
                  />
                  <Text type="secondary" style={{ fontSize: 12, width: 36, textAlign: 'right' }}>{tag.count}</Text>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 评论列表筛选 */}
      <Card bordered={false} bodyStyle={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <Search
            placeholder="搜索评论内容"
            allowClear
            style={{ width: 260 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            mode="multiple"
            placeholder="星级筛选"
            options={[5, 4, 3, 2, 1].map((n) => ({ label: `${n}星`, value: n }))}
            style={{ minWidth: 160 }}
            allowClear
            onChange={setRatingFilter}
          />
          <Select
            mode="multiple"
            placeholder="情感倾向"
            options={[
              { label: '好评', value: 'positive' },
              { label: '中性', value: 'neutral' },
              { label: '差评', value: 'negative' },
            ]}
            style={{ minWidth: 160 }}
            allowClear
            onChange={setSentimentFilter}
          />
          <Text type="secondary" style={{ fontSize: 13, alignSelf: 'center' }}>
            {filteredReviews.length} 条评论
          </Text>
        </div>

        <Divider style={{ margin: '0 0 4px' }} />

        <List
          dataSource={filteredReviews}
          renderItem={(review) => (
            <List.Item style={{ padding: '16px 0', alignItems: 'flex-start' }}>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} style={{ background: C_PRIMARY }} />}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <Text strong style={{ fontSize: 13 }}>{review.author}</Text>
                    <Rate
                      disabled
                      value={review.rating}
                      style={{ fontSize: 12 }}
                      character={<StarFilled style={{ color: C_PRIMARY }} />}
                    />
                    <Tag color="blue" style={{ fontSize: 11 }}>
                      {review.sentiment === 'positive' ? '好评' : review.sentiment === 'negative' ? '差评' : '中性'}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 11 }}>{review.date}</Text>
                  </div>
                }
                description={
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 4, color: '#262626' }}>
                      {review.title}
                    </Text>
                    <Paragraph style={{ margin: 0, color: '#595959', fontSize: 13 }}>
                      {review.content}
                    </Paragraph>
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
                      <LikeOutlined /> {review.helpful} 人觉得有帮助
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}

// ── 主页面 ────────────────────────────────────────
export default function DeepAnalysis() {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') ?? 'keywords';
  const product = mockProductDetail;

  return (
    <div className="page-container">
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/products/${productId}`)}
          style={{ padding: '4px 8px', color: '#595959' }}
        >
          返回详情
        </Button>
        <Breadcrumb
          items={[
            { title: <HomeOutlined />, href: '/products' },
            { title: '产品数据中心', href: '/products' },
            { title: product.name, href: `/products/${productId}` },
            { title: type === 'keywords' ? '关键词深度分析' : '评论深度分析' },
          ]}
          style={{ fontSize: 13 }}
        />
      </div>

      <Card
        bordered={false}
        style={{ marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: '12px 20px' }}
      >
        <Space>
          <SearchOutlined style={{ color: C_PRIMARY, fontSize: 18 }} />
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {type === 'keywords' ? '关键词深度分析' : '评论深度分析'} ·
            </Text>{' '}
            <Text strong style={{ fontSize: 14 }}>{product.name}</Text>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>{product.asin}</Text>
          </div>
        </Space>
      </Card>

      <Card
        bordered={false}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: '0 0 24px' }}
      >
        <Tabs
          activeKey={type}
          onChange={(key) => navigate(`/products/${productId}/deep-analysis?type=${key}`)}
          size="large"
          style={{ padding: '0 24px' }}
          tabBarStyle={{ marginBottom: 0, borderBottom: '1px solid #f0f0f0' }}
          items={[
            {
              key: 'keywords',
              label: '关键词深度分析',
              children: (
                <div style={{ padding: '24px 0 0' }}>
                  <KeywordsDeepAnalysis keywords={product.keywords} />
                </div>
              ),
            },
            {
              key: 'reviews',
              label: '评论深度分析',
              children: (
                <div style={{ padding: '24px 0 0' }}>
                  <ReviewsDeepAnalysis />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
