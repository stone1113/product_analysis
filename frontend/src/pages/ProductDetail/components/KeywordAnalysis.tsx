import { useNavigate } from 'react-router-dom';
import {
  Table,
  Tag,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Progress,
} from 'antd';
import {
  SearchOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { ColumnsType } from 'antd/es/table';
import type { Keyword, KeywordMatchType } from '../../../types';

const { Title, Text } = Typography;

const C_PRIMARY  = '#1677ff';
const C_LIGHT    = '#4096ff';
const C_LIGHTER  = '#69b1ff';
const C_BG       = '#f0f5ff';

const MATCH_TYPE_COLOR: Record<KeywordMatchType, string> = {
  exact: 'blue',
  phrase: 'geekblue',
  broad: 'cyan',
};

const MATCH_TYPE_LABEL: Record<KeywordMatchType, string> = {
  exact: '精准',
  phrase: '词组',
  broad: '广泛',
};

interface Props {
  keywords: Keyword[];
  productId: string;
}

export default function KeywordAnalysis({ keywords, productId }: Props) {
  const navigate = useNavigate();

  const totalSpend = keywords.reduce((s, k) => s + k.spend, 0);
  const totalRevenue = keywords.reduce((s, k) => s + k.revenue, 0);
  const totalOrders = keywords.reduce((s, k) => s + k.orders, 0);
  const avgAcos = keywords.reduce((s, k) => s + k.acos, 0) / keywords.length;

  // Top 6 by orders for bar chart
  const topKeywords = [...keywords]
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 6)
    .map((k) => ({ name: k.keyword.length > 18 ? k.keyword.slice(0, 18) + '…' : k.keyword, orders: k.orders }));

  const columns: ColumnsType<Keyword> = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (val: string, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>
            {val}
          </Text>
          <br />
          <Tag color={MATCH_TYPE_COLOR[record.matchType]} style={{ fontSize: 11, marginTop: 2 }}>
            {MATCH_TYPE_LABEL[record.matchType]}匹配
          </Tag>
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
      title: '出单量',
      dataIndex: 'orders',
      key: 'orders',
      sorter: (a, b) => a.orders - b.orders,
      defaultSortOrder: 'descend',
      render: (v: number) => (
        <Text strong style={{ color: '#1677ff' }}>
          {v.toLocaleString()}
        </Text>
      ),
      align: 'right',
    },
    {
      title: '转化率',
      dataIndex: 'conversion',
      key: 'conversion',
      sorter: (a, b) => a.conversion - b.conversion,
      render: (v: number) => (
        <div style={{ minWidth: 80 }}>
          <Text style={{ fontSize: 12 }}>{v.toFixed(1)}%</Text>
          <Progress
            percent={v}
            showInfo={false}
            size="small"
            strokeColor={C_PRIMARY}
            style={{ margin: 0 }}
          />
        </div>
      ),
    },
    {
      title: 'ACOS',
      dataIndex: 'acos',
      key: 'acos',
      sorter: (a, b) => a.acos - b.acos,
      render: (v: number) => (
        <Tag color="blue">{v.toFixed(1)}%</Tag>
      ),
      align: 'center',
    },
    {
      title: '广告花费',
      dataIndex: 'spend',
      key: 'spend',
      sorter: (a, b) => a.spend - b.spend,
      render: (v: number) => (
        <Text style={{ color: C_LIGHTER }}>${v.toLocaleString()}</Text>
      ),
      align: 'right',
    },
    {
      title: '广告收入',
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a, b) => a.revenue - b.revenue,
      render: (v: number) => (
        <Text strong style={{ color: C_PRIMARY }}>
          ${v.toLocaleString()}
        </Text>
      ),
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
      {/* 汇总 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small" bordered={false} style={{ background: C_BG, borderRadius: 8 }}>
            <Statistic
              title={<Text style={{ fontSize: 12 }}>广告总花费</Text>}
              value={`$${totalSpend.toLocaleString()}`}
              prefix={<DollarOutlined />}
              valueStyle={{ color: C_PRIMARY, fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bordered={false} style={{ background: C_BG, borderRadius: 8 }}>
            <Statistic
              title={<Text style={{ fontSize: 12 }}>广告总收入</Text>}
              value={`$${totalRevenue.toLocaleString()}`}
              prefix={<RiseOutlined />}
              valueStyle={{ color: C_PRIMARY, fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bordered={false} style={{ background: C_BG, borderRadius: 8 }}>
            <Statistic
              title={<Text style={{ fontSize: 12 }}>广告总出单</Text>}
              value={totalOrders.toLocaleString()}
              prefix={<ThunderboltOutlined />}
              suffix="单"
              valueStyle={{ color: C_PRIMARY, fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bordered={false} style={{ background: C_BG, borderRadius: 8 }}>
            <Statistic
              title={<Text style={{ fontSize: 12 }}>平均 ACOS</Text>}
              value={avgAcos.toFixed(1)}
              suffix="%"
              valueStyle={{ color: C_LIGHT, fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Top 出单关键词柱图 */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>Top 关键词出单量</Title>}
        bordered={false}
        style={{ background: '#fafafa', marginBottom: 20 }}
        extra={
          <Button
            type="primary"
            ghost
            size="small"
            icon={<SearchOutlined />}
            onClick={() =>
              navigate(`/products/${productId}/deep-analysis?type=keywords`)
            }
          >
            关键词深度分析
          </Button>
        }
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={topKeywords}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={(v: number) => [`${v.toLocaleString()} 单`, '出单量']} />
            <Bar dataKey="orders" fill="#1677ff" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 关键词明细表 */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>关键词明细</Title>}
        bordered={false}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          dataSource={keywords}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
