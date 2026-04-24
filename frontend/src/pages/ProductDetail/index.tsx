import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Tag,
  Tabs,
  Card,
  Typography,
  Space,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { mockProductDetail } from '../../mock/productDetail';
import {
  SALE_STATUS_LABEL,
  SALE_STATUS_COLOR,
  type SaleStatus,
} from '../../types';
import ProductAvatar from '../../components/ProductAvatar';

import LaunchInfoTab from './components/LaunchInfoTab';
import SalesAnalysis from './components/SalesAnalysis';
import ReviewAnalysis from './components/ReviewAnalysis';
import KeywordAnalysis from './components/KeywordAnalysis';
import LifecycleAnalysis from './components/LifecycleAnalysis';
import ProductTagAnalysis from './components/ProductTagAnalysis';

const { Text, Title } = Typography;

const STATUS_ICONS: Record<SaleStatus, ReactNode> = {
  'push-success': <CheckCircleOutlined />,
  'push-failed': <CloseCircleOutlined />,
  pushing: <ClockCircleOutlined />,
  pending: <ClockCircleOutlined />,
  removed: <MinusCircleOutlined />,
};

// ── 任务信息 / 其他信息占位 ───────────────────────────────────────
function Placeholder({ text }: { text: string }) {
  return (
    <div style={{ padding: '60px 0' }}>
      <Empty description={text} />
    </div>
  );
}

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const product = mockProductDetail;
  void productId;

  return (
    <div className="page-container">
      {/* ── 面包屑 ── */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
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

      {/* ── 页头：产品简要信息 ── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          padding: '14px 20px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <ProductAvatar productId={product.id} name={product.name} size={52} borderRadius={8} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title
            level={5}
            style={{ margin: 0, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {product.name}
          </Title>
          <Space size={16} style={{ marginTop: 4 }} wrap>
            <Text type="secondary" style={{ fontSize: 12 }}>
              公库ID：<Text strong style={{ color: '#1677ff', fontSize: 12 }}>{product.id}</Text>
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              产品ID：<Text strong style={{ fontSize: 12, fontFamily: 'monospace' }}>{product.companyId}</Text>
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              SKU：<Text copyable strong style={{ fontSize: 12, fontFamily: 'monospace' }}>{product.sku}</Text>
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              开品来源：<Text strong style={{ fontSize: 12 }}>{product.source}</Text>
            </Text>
            <Tag
              icon={STATUS_ICONS[product.saleStatus]}
              color={SALE_STATUS_COLOR[product.saleStatus]}
              style={{ fontSize: 12 }}
            >
              {SALE_STATUS_LABEL[product.saleStatus]}
            </Tag>
            {product.isOpsRecommended && <Tag color="purple" style={{ fontSize: 12 }}>运营推荐</Tag>}
            {product.isFBAStock && <Tag color="blue" style={{ fontSize: 12 }}>FBA备货</Tag>}
          </Space>
        </div>
        <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
          {[
            { label: '月销量', value: `${product.monthlySales.toLocaleString()} 单` },
            { label: '采购成本', value: `¥${product.purchaseCost?.toFixed(2) ?? '--'}` },
            { label: '评分', value: `${product.rating} / 5.0` },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#262626' }}>{item.value}</div>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 主 Tabs ── */}
      <Card
        bordered={false}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: '0 0 24px' }}
      >
        <Tabs
          defaultActiveKey="launch"
          size="large"
          style={{ padding: '0 20px' }}
          tabBarStyle={{ marginBottom: 0, borderBottom: '1px solid #f0f0f0' }}
          items={[
            {
              key: 'launch',
              label: '开品信息',
              children: (
                <div style={{ padding: '20px 4px 0' }}>
                  <LaunchInfoTab product={product} />
                </div>
              ),
            },
            {
              key: 'analysis',
              label: '数据分析',
              children: (
                <div style={{ padding: '20px 4px 0' }}>
                  {/* 数据分析内嵌二级 Tab */}
                  <Tabs
                    defaultActiveKey="sales"
                    tabPosition="top"
                    size="middle"
                    items={[
                      {
                        key: 'sales',
                        label: '销量分析',
                        children: <SalesAnalysis salesData={product.salesData} />,
                      },
                      {
                        key: 'reviews',
                        label: '评论VOC分析',
                        children: (
                          <ReviewAnalysis
                            analysis={product.reviewAnalysis}
                            productId={product.id}
                          />
                        ),
                      },
                      {
                        key: 'tag-analysis',
                        label: '产品标签分析',
                        children: <ProductTagAnalysis tags={product.tags} />,
                      },
                      {
                        key: 'keywords',
                        label: '出单关键词',
                        children: (
                          <KeywordAnalysis
                            keywords={product.keywords}
                            productId={product.id}
                          />
                        ),
                      },
                      {
                        key: 'lifecycle',
                        label: '生命周期',
                        children: (
                          <LifecycleAnalysis assessment={product.lifecycleAssessment} />
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: 'task',
              label: '任务信息',
              children: <Placeholder text="任务信息功能开发中" />,
            },
            {
              key: 'other',
              label: '其他信息',
              children: <Placeholder text="其他信息功能开发中" />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
