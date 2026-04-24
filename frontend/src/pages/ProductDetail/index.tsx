import { useParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Tag,
  Rate,
  Statistic,
  Tabs,
  Card,
  Row,
  Col,
  Badge,
  Typography,
  Space,
  Divider,
} from 'antd';
import ProductAvatar from '../../components/ProductAvatar';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  ShoppingOutlined,
  RiseOutlined,
  CommentOutlined,
  StarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { mockProductDetail } from '../../mock/productDetail';
import {
  LIFECYCLE_LABEL,
  LIFECYCLE_COLOR,
  SALE_STATUS_LABEL,
  SALE_STATUS_COLOR,
  type SaleStatus,
} from '../../types';

const STATUS_ICONS: Record<SaleStatus, React.ReactNode> = {
  'push-success': <CheckCircleOutlined />,
  'push-failed':  <CloseCircleOutlined />,
  'pushing':      <ClockCircleOutlined />,
  'pending':      <ClockCircleOutlined />,
  'removed':      <MinusCircleOutlined />,
};
import BasicInfo from './components/BasicInfo';
import SalesAnalysis from './components/SalesAnalysis';
import ReviewAnalysis from './components/ReviewAnalysis';
import ProductTags from './components/ProductTags';
import KeywordAnalysis from './components/KeywordAnalysis';
import LifecycleAnalysis from './components/LifecycleAnalysis';

const { Text, Title } = Typography;

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  // 目前用 P001 的 mock 数据，后续可根据 productId 请求接口
  const product = mockProductDetail;
  void productId;

  const lifecycle = product.lifecycle;

  return (
    <div className="page-container">
      {/* ── 面包屑 ── */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/products')}
          style={{ padding: '4px 8px', color: '#595959' }}
        >
          返回列表
        </Button>
        <Breadcrumb
          items={[
            { title: <HomeOutlined />, href: '/products' },
            { title: '产品数据中心', href: '/products' },
            { title: product.name },
          ]}
          style={{ fontSize: 13 }}
        />
      </div>

      {/* ── 产品头部信息卡片 ── */}
      <Card
        bordered={false}
        style={{ marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <Row gutter={[24, 16]} align="top">
          {/* 左：产品图片 */}
          <Col flex="none">
            <ProductAvatar productId={product.id} name={product.name} size={100} borderRadius={10} />
          </Col>

          {/* 中：ERP 管理信息 + 分析指标 */}
          <Col flex={1}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {/* 产品名称 + 状态标签 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Title level={4} style={{ margin: 0 }}>
                  {product.name}
                </Title>
                <Tag
                  icon={STATUS_ICONS[product.saleStatus]}
                  color={SALE_STATUS_COLOR[product.saleStatus]}
                >
                  {SALE_STATUS_LABEL[product.saleStatus]}
                </Tag>
                <Badge
                  color={LIFECYCLE_COLOR[lifecycle]}
                  text={
                    <Text style={{ color: LIFECYCLE_COLOR[lifecycle], fontWeight: 500 }}>
                      {LIFECYCLE_LABEL[lifecycle]}
                    </Text>
                  }
                />
                {product.isOpsRecommended && (
                  <Tag color="purple">运营推荐</Tag>
                )}
                {product.isFBAStock && (
                  <Tag color="blue">FBA备货</Tag>
                )}
              </div>

              {/* ERP 基础字段 */}
              <Space size={20} wrap>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  公库ID：<Text strong style={{ color: '#1677ff' }}>{product.id}</Text>
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  公司ID：<Text strong style={{ fontFamily: 'monospace' }}>{product.companyId}</Text>
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  SKU：
                  <Text copyable strong style={{ fontFamily: 'monospace' }}>
                    {product.sku}
                  </Text>
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  产品类型：
                  <Tag color="blue" style={{ marginLeft: 2 }}>{product.productType}</Tag>
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  开品来源：<Text strong>{product.source}</Text>
                </Text>
              </Space>

              {/* 开品平台 */}
              <Space size={4} wrap>
                <Text type="secondary" style={{ fontSize: 13, marginRight: 4 }}>开品平台：</Text>
                {product.launchPlatforms.map((p) => {
                  const [, region] = p.split(':');
                  return (
                    <Tag
                      key={p}
                      style={{
                        fontSize: 11,
                        padding: '0 6px',
                        background: '#fff1eb',
                        borderColor: '#ee4d2d60',
                        color: '#ee4d2d',
                      }}
                    >
                      🛒 {region?.toUpperCase()}
                    </Tag>
                  );
                })}
              </Space>

              <Divider style={{ margin: '4px 0' }} />

              {/* 分析指标行 */}
              <Space size={16} wrap>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  ASIN：
                  <Text copyable strong style={{ fontFamily: 'monospace', color: '#1677ff' }}>
                    {product.asin}
                  </Text>
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  BSR：<Text strong style={{ color: '#faad14' }}>#{product.bsr.toLocaleString()}</Text>
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Rate disabled allowHalf value={product.rating} style={{ fontSize: 13 }} />
                  <Text strong style={{ fontSize: 14, color: '#ff7a00' }}>{product.rating}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ({product.reviewCount.toLocaleString()} 评论)
                  </Text>
                </div>
              </Space>
            </Space>
          </Col>

          {/* 右：核心指标 */}
          <Col flex="none">
            <Row gutter={[20, 12]}>
              <Col span={12}>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <DollarOutlined /> 售价
                    </Text>
                  }
                  value={product.price}
                  precision={2}
                  prefix="$"
                  valueStyle={{ fontSize: 22, fontWeight: 700 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ShoppingOutlined /> 月销量
                    </Text>
                  }
                  value={product.monthlySales}
                  valueStyle={{ fontSize: 22, fontWeight: 700, color: '#1677ff' }}
                  suffix="单"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <RiseOutlined /> 月收入(估)
                    </Text>
                  }
                  value={product.monthlyRevenue}
                  prefix="$"
                  valueStyle={{ fontSize: 22, fontWeight: 700, color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <CommentOutlined /> 评论数
                    </Text>
                  }
                  value={product.reviewCount}
                  valueStyle={{ fontSize: 22, fontWeight: 700, color: '#faad14' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <StarOutlined /> 评分
                    </Text>
                  }
                  value={product.rating}
                  precision={1}
                  suffix="/ 5.0"
                  valueStyle={{ fontSize: 22, fontWeight: 700, color: '#ff7a00' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      变体数量
                    </Text>
                  }
                  value={product.variationCount}
                  suffix="款"
                  valueStyle={{ fontSize: 22, fontWeight: 700 }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* ── 分析 Tabs ── */}
      <Card
        bordered={false}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: '0 0 24px' }}
      >
        <Tabs
          defaultActiveKey="basic"
          size="large"
          style={{ padding: '0 24px' }}
          tabBarStyle={{ marginBottom: 0, borderBottom: '1px solid #f0f0f0' }}
          items={[
            {
              key: 'basic',
              label: '基础信息',
              children: (
                <div style={{ padding: '24px 0 0' }}>
                  <BasicInfo product={product} />
                </div>
              ),
            },
            {
              key: 'sales',
              label: '销量分析',
              children: (
                <div style={{ padding: '24px 0 0' }}>
                  <SalesAnalysis salesData={product.salesData} />
                </div>
              ),
            },
            {
              key: 'reviews',
              label: '评论分析',
              children: (
                <div style={{ padding: '24px 0 0' }}>
                  <ReviewAnalysis
                    analysis={product.reviewAnalysis}
                    productId={product.id}
                  />
                </div>
              ),
            },
            {
              key: 'tags',
              label: '产品标签',
              children: (
                <div style={{ padding: '24px 0 0' }}>
                  <ProductTags tags={product.tags} />
                </div>
              ),
            },
            {
              key: 'keywords',
              label: '出单关键词',
              children: (
                <div style={{ padding: '24px 0 0' }}>
                  <KeywordAnalysis
                    keywords={product.keywords}
                    productId={product.id}
                  />
                </div>
              ),
            },
            {
              key: 'lifecycle',
              label: '生命周期',
              children: (
                <div style={{ padding: '24px 0 0' }}>
                  <LifecycleAnalysis assessment={product.lifecycleAssessment} />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
