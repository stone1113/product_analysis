import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Rate,
  Tag,
  Button,
  Typography,
  List,
  Avatar,
  Progress,
  Space,
  Divider,
} from 'antd';
import {
  UserOutlined,
  LikeOutlined,
  SearchOutlined,
  StarFilled,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import type { AnalysisPeriod, AnalysisCustomRange, ReviewAnalysis as ReviewAnalysisType } from '../../../types';
import { getAnalysisPeriodLabel } from '../../../utils/analysisPeriod';

const { Title, Text, Paragraph } = Typography;

interface Props {
  analysis: ReviewAnalysisType;
  productId: string;
  analysisPeriod: AnalysisPeriod;
  analysisCustomRange: AnalysisCustomRange;
}

// 蓝色梯度：1星最浅 → 5星最深
const RATING_COLORS = ['#bae0ff', '#91caff', '#69b1ff', '#4096ff', '#1677ff'];
const C_PRIMARY = '#1677ff';
const C_BG      = '#f0f5ff';

export default function ReviewAnalysis({ analysis, productId, analysisPeriod, analysisCustomRange }: Props) {
  const navigate = useNavigate();

  const pieData = analysis.ratingDistribution.map((d) => ({
    name: `${d.stars}星`,
    value: d.count,
    percentage: d.percentage,
  }));

  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
        当前口径：{getAnalysisPeriodLabel(analysisPeriod, analysisCustomRange)}。评论评分、VOC 标签和近期评论按该口径分析。
      </Text>
      <Row gutter={[20, 20]}>
        {/* 左：总体评分 + 分布 */}
        <Col span={10}>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>总体评分</Title>}
            bordered={false}
            style={{ background: '#fafafa', height: '100%' }}
          >
            {/* 大评分展示 */}
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Text style={{ fontSize: 60, fontWeight: 700, color: C_PRIMARY, lineHeight: 1 }}>
                {analysis.averageRating.toFixed(1)}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Rate
                  disabled
                  allowHalf
                  value={analysis.averageRating}
                  character={<StarFilled style={{ color: C_PRIMARY }} />}
                />
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                共 {analysis.totalReviews.toLocaleString()} 条评论
              </Text>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* 星级分布条形 */}
            {[...analysis.ratingDistribution].reverse().map((d) => (
              <div
                key={d.stars}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}
              >
                <Text style={{ width: 28, fontSize: 12, textAlign: 'right', flexShrink: 0 }}>
                  {d.stars}星
                </Text>
                <Progress
                  percent={d.percentage}
                  strokeColor={RATING_COLORS[d.stars - 1]}
                  showInfo={false}
                  style={{ flex: 1, margin: 0 }}
                  size="small"
                />
                <Text type="secondary" style={{ width: 32, fontSize: 12, flexShrink: 0 }}>
                  {d.percentage}%
                </Text>
              </div>
            ))}
          </Card>
        </Col>

        {/* 右上：饼图 + 标签云 */}
        <Col span={14}>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>评分占比</Title>}
            bordered={false}
            style={{ background: '#fafafa', marginBottom: 16 }}
          >
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={false}
                  labelLine={false}
                >
                  {pieData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={RATING_COLORS[analysis.ratingDistribution[idx].stars - 1]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const item = analysis.ratingDistribution.find(
                      (d) => `${d.stars}星` === name,
                    );
                    return [`${value.toLocaleString()} 条（${item?.percentage ?? 0}%）`, name];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* 评论标签 */}
          <Row gutter={12}>
            <Col span={12}>
              <Card
                size="small"
                title={<Text style={{ color: C_PRIMARY, fontWeight: 600 }}>好评关键词</Text>}
                bordered={false}
                style={{ background: C_BG }}
              >
                <Space size={[6, 6]} wrap>
                  {analysis.positiveTags.map((tag) => (
                    <Tag key={tag.text} color="blue" style={{ margin: 0, fontSize: 12 }}>
                      {tag.text}
                      <Text style={{ color: C_PRIMARY, fontSize: 11, marginLeft: 4 }}>
                        {tag.count}
                      </Text>
                    </Tag>
                  ))}
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                size="small"
                title={<Text style={{ color: C_PRIMARY, fontWeight: 600 }}>差评关键词</Text>}
                bordered={false}
                style={{ background: C_BG }}
              >
                <Space size={[6, 6]} wrap>
                  {analysis.negativeTags.map((tag) => (
                    <Tag key={tag.text} color="geekblue" style={{ margin: 0, fontSize: 12 }}>
                      {tag.text}
                      <Text style={{ color: '#2f54eb', fontSize: 11, marginLeft: 4 }}>
                        {tag.count}
                      </Text>
                    </Tag>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider />

      {/* 近期评论列表 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          近期评论
        </Title>
        <Button
          type="primary"
          ghost
          icon={<SearchOutlined />}
          onClick={() =>
            navigate(`/products/${productId}/deep-analysis?type=reviews`)
          }
        >
          评论深度分析
        </Button>
      </div>

      <List
        dataSource={analysis.recentReviews}
        renderItem={(review) => (
          <List.Item style={{ padding: '16px 0', alignItems: 'flex-start' }}>
            <List.Item.Meta
              avatar={
                <Avatar icon={<UserOutlined />} style={{ background: '#1677ff' }} />
              }
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Text strong style={{ fontSize: 13 }}>
                    {review.author}
                  </Text>
                  <Rate
                    disabled
                    value={review.rating}
                    style={{ fontSize: 12 }}
                    character={<StarFilled style={{ color: C_PRIMARY }} />}
                  />
                  <Tag color="blue" style={{ fontSize: 11 }}>
                    {review.sentiment === 'positive'
                      ? '好评'
                      : review.sentiment === 'negative'
                      ? '差评'
                      : '中性'}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {review.date}
                  </Text>
                </div>
              }
              description={
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 4, color: '#262626' }}>
                    {review.title}
                  </Text>
                  <Paragraph
                    ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
                    style={{ margin: 0, color: '#595959', fontSize: 13 }}
                  >
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
    </div>
  );
}
