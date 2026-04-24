import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  Typography,
  Space,
  Card,
  Statistic,
  Row,
  Col,
  Tooltip,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { mockProducts } from '../../mock/products';
import {
  type Product,
  type SaleStatus,
  SALE_STATUS_LABEL,
  SALE_STATUS_COLOR,
} from '../../types';
import ProductAvatar from '../../components/ProductAvatar';

const { Title, Text } = Typography;
const { Search } = Input;

// ── 筛选选项 ─────────────────────────────────────
const CATEGORY_OPTIONS = [...new Set(mockProducts.map((p) => p.companyCategory))].map((c) => ({
  label: c,
  value: c,
}));

const PLATFORM_OPTIONS = [
  ...new Set(mockProducts.flatMap((p) => p.launchPlatforms)),
].sort().map((v) => ({ label: v, value: v }));

const SOURCE_OPTIONS = [...new Set(mockProducts.map((p) => p.source))].map((s) => ({
  label: s,
  value: s,
}));

const STATUS_OPTIONS = (['push-success', 'push-failed', 'pushing', 'pending', 'removed'] as SaleStatus[]).map((s) => ({
  label: SALE_STATUS_LABEL[s],
  value: s,
}));

const STATUS_ICONS: Record<SaleStatus, React.ReactNode> = {
  'push-success': <CheckCircleOutlined />,
  'push-failed':  <CloseCircleOutlined />,
  'pushing':      <ClockCircleOutlined />,
  'pending':      <ClockCircleOutlined />,
  'removed':      <MinusCircleOutlined />,
};

// ── 布尔字段展示 ─────────────────────────────────
function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <Text style={{ fontSize: 12 }}>是</Text>
  ) : (
    <Text type="secondary" style={{ fontSize: 12 }}>否</Text>
  );
}

export default function ProductList() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<SaleStatus[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    return mockProducts.filter((p) => {
      const q = searchText.toLowerCase();
      const matchText =
        !searchText ||
        p.name.toLowerCase().includes(q) ||
        p.id.includes(q) ||
        p.companyId.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      const matchCategory =
        categoryFilter.length === 0 || categoryFilter.includes(p.companyCategory);
      const matchPlatform =
        platformFilter.length === 0 ||
        platformFilter.some((pl) => p.launchPlatforms.includes(pl));
      const matchStatus =
        statusFilter.length === 0 || statusFilter.includes(p.saleStatus);
      const matchSource =
        sourceFilter.length === 0 || sourceFilter.includes(p.source);
      return matchText && matchCategory && matchPlatform && matchStatus && matchSource;
    });
  }, [searchText, categoryFilter, platformFilter, statusFilter, sourceFilter]);

  // ── 汇总统计 ────────────────────────────────────
  const stats = useMemo(() => ({
    total: mockProducts.length,
    pushSuccess: mockProducts.filter((p) => p.saleStatus === 'push-success').length,
    pushFailed:  mockProducts.filter((p) => p.saleStatus === 'push-failed').length,
    pending:     mockProducts.filter((p) => p.saleStatus === 'pending').length,
    opsRecommended: mockProducts.filter((p) => p.isOpsRecommended).length,
  }), []);

  // ── 表格列定义 ──────────────────────────────────
  const columns: ColumnsType<Product> = [
    // ── 固定左侧 ──
    {
      title: '公库ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
      render: (val: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#1677ff' }}>{val}</Text>
      ),
    },
    {
      title: '产品信息',
      key: 'info',
      width: 280,
      fixed: 'left',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <ProductAvatar productId={record.id} name={record.name} size={44} borderRadius={6} />
          <div style={{ minWidth: 0 }}>
            <Tooltip title={record.name}>
              <Text
                strong
                style={{
                  fontSize: 12,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 200,
                  lineHeight: 1.4,
                }}
              >
                {record.name}
              </Text>
            </Tooltip>
            <Text type="secondary" style={{ fontSize: 11 }}>
              产品ID：{record.companyId}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              开品来源ID：{record.companyId}
            </Text>
          </div>
        </div>
      ),
    },

    // ── 中间列 ──
    {
      title: '公司分类',
      dataIndex: 'companyCategory',
      key: 'companyCategory',
      width: 160,
      ellipsis: true,
      render: (val: string) => {
        const parts = val.split('>>');
        return (
          <Tooltip title={val}>
            <Text style={{ fontSize: 12 }}>
              {parts.map((p, i) => (
                <span key={i}>
                  {i > 0 && <Text type="secondary" style={{ margin: '0 2px', fontSize: 10 }}>{'>>'}</Text>}
                  {p}
                </span>
              ))}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 145,
      render: (val: string) => (
        <Text copyable style={{ fontSize: 11, fontFamily: 'monospace' }}>{val}</Text>
      ),
    },
    {
      title: '销售标签',
      dataIndex: 'salesTags',
      key: 'salesTags',
      width: 140,
      render: (tags?: string[]) =>
        tags && tags.length > 0 ? (
          <Space size={[4, 4]} wrap>
            {tags.map((t) => (
              <Tag key={t} style={{ fontSize: 11, margin: 0 }}>{t}</Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>-</Text>
        ),
    },
    {
      title: '采购成本(¥)',
      dataIndex: 'purchaseCost',
      key: 'purchaseCost',
      width: 100,
      sorter: (a, b) => (a.purchaseCost ?? 0) - (b.purchaseCost ?? 0),
      render: (val?: number) =>
        val != null ? (
          <Text style={{ fontSize: 13 }}>¥{val.toFixed(2)}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>-</Text>
        ),
      align: 'right',
    },
    {
      title: '热销周期',
      dataIndex: 'hotSalesPeriod',
      key: 'hotSalesPeriod',
      width: 120,
      render: (months?: number[]) =>
        months && months.length > 0 ? (
          <Text style={{ fontSize: 12 }}>{months.join(', ')} 月</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>-</Text>
        ),
    },
    {
      title: '热销关键词',
      dataIndex: 'hotSalesKeywords',
      key: 'hotSalesKeywords',
      width: 90,
      align: 'center' as const,
      sorter: (a, b) => (a.hotSalesKeywords ?? 0) - (b.hotSalesKeywords ?? 0),
      render: (val?: number) =>
        val != null && val > 0 ? (
          <Text style={{ fontSize: 13, color: '#1677ff' }}>{val}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>-</Text>
        ),
    },
    {
      title: '重要等级',
      dataIndex: 'importanceLevel',
      key: 'importanceLevel',
      width: 90,
      render: (val?: string) =>
        val ? (
          <Tag style={{ fontSize: 11 }}>{val}</Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>-</Text>
        ),
    },
    {
      title: '流程名称',
      dataIndex: 'processName',
      key: 'processName',
      width: 130,
      ellipsis: true,
      render: (val?: string) =>
        val ? (
          <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: val }}>{val}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>-</Text>
        ),
    },
    {
      title: '产品类型',
      dataIndex: 'productType',
      key: 'productType',
      width: 90,
      render: (val: string) => (
        <Tag style={{ fontSize: 11 }}>{val}</Tag>
      ),
    },
    {
      title: '开品平台',
      dataIndex: 'launchPlatforms',
      key: 'launchPlatforms',
      width: 200,
      render: (platforms: string[]) => (
        <Space size={[4, 4]} wrap>
          {platforms.map((p) => {
            const [, region] = p.split(':');
            return (
              <Tag
                key={p}
                style={{ fontSize: 10, padding: '0 5px', margin: 0, textTransform: 'uppercase' }}
              >
                {region}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 80,
      render: (val: string) => <Text style={{ fontSize: 12 }}>{val}</Text>,
    },
    {
      title: '开发员',
      dataIndex: 'developer',
      key: 'developer',
      width: 80,
      render: (val: string) => <Text style={{ fontSize: 12 }}>{val}</Text>,
    },
    {
      title: '开品来源',
      dataIndex: 'source',
      key: 'source',
      width: 90,
      render: (val: string) => (
        <Tag style={{ fontSize: 11 }}>{val}</Tag>
      ),
    },
    {
      title: '在售状态',
      dataIndex: 'saleStatus',
      key: 'saleStatus',
      width: 105,
      render: (val: SaleStatus) => (
        <Tag
          icon={STATUS_ICONS[val]}
          color={SALE_STATUS_COLOR[val]}
          style={{ fontSize: 11 }}
        >
          {SALE_STATUS_LABEL[val]}
        </Tag>
      ),
    },
    {
      title: 'FBA备货品',
      dataIndex: 'isFBAStock',
      key: 'isFBAStock',
      width: 88,
      align: 'center',
      render: (val: boolean) => <BoolCell value={val} />,
    },
    {
      title: '是否为老品标识',
      dataIndex: 'isOldProduct',
      key: 'isOldProduct',
      width: 110,
      align: 'center',
      render: (val: boolean) => <BoolCell value={val} />,
    },
    {
      title: '是否运营推荐品',
      dataIndex: 'isOpsRecommended',
      key: 'isOpsRecommended',
      width: 115,
      align: 'center',
      render: (val: boolean) => <BoolCell value={val} />,
    },
    {
      title: '是否有证书',
      dataIndex: 'hasCertificate',
      key: 'hasCertificate',
      width: 88,
      align: 'center',
      render: (val: boolean) => <BoolCell value={val} />,
    },
    {
      title: '开发完成时间',
      dataIndex: 'devCompletionTime',
      key: 'devCompletionTime',
      width: 155,
      sorter: (a, b) =>
        (a.devCompletionTime ?? '').localeCompare(b.devCompletionTime ?? ''),
      render: (val?: string) =>
        val ? (
          <Text style={{ fontSize: 11 }}>{val}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>-</Text>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 155,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (val: string) => <Text style={{ fontSize: 11 }}>{val}</Text>,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 155,
      sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
      defaultSortOrder: 'descend',
      render: (val: string) => <Text style={{ fontSize: 11 }}>{val}</Text>,
    },
    {
      title: '标准库创建时间',
      dataIndex: 'standardLibCreatedAt',
      key: 'standardLibCreatedAt',
      width: 155,
      render: (val?: string) =>
        val ? (
          <Text style={{ fontSize: 11 }}>{val}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>-</Text>
        ),
    },

    // ── 固定右侧 ──
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" size="small" style={{ padding: '0 4px', fontSize: 12 }}>
            组合商品
          </Button>
          <Button type="link" size="small" style={{ padding: '0 4px', fontSize: 12 }}>
            配对库
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            style={{ padding: '0 4px', fontSize: 12 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${record.id}`);
            }}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* ── 页头 ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>产品数据中心</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            多维度产品数据分析 · 助力开品与运营决策
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          新增产品
        </Button>
      </div>

      {/* ── 汇总统计 ── */}
      <Row gutter={12} style={{ marginBottom: 20 }}>
        {[
          { label: '全部产品', value: stats.total, icon: <AppstoreOutlined /> },
          { label: '推送成功', value: stats.pushSuccess, icon: <CheckCircleOutlined /> },
          { label: '推送失败', value: stats.pushFailed, icon: <CloseCircleOutlined /> },
          { label: '待推送', value: stats.pending, icon: <ClockCircleOutlined /> },
          { label: '运营推荐品', value: stats.opsRecommended, icon: <CheckCircleOutlined /> },
        ].map((item) => (
          <Col key={item.label} flex={1}>
            <Card
              size="small"
              bordered={false}
              style={{ borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              bodyStyle={{ padding: '12px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Statistic
                  title={<Text style={{ fontSize: 12, color: '#8c8c8c' }}>{item.label}</Text>}
                  value={item.value}
                  valueStyle={{ fontSize: 22, fontWeight: 600, color: '#262626' }}
                />
                <span style={{ fontSize: 20, color: '#d9d9d9' }}>{item.icon}</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── 筛选栏 ── */}
      <Card
        bordered={false}
        style={{ marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Space wrap size={10}>
          <Search
            placeholder="搜索产品名称 / 公品ID / SKU / 公司ID"
            allowClear
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={setSearchText}
          />
          <Select
            mode="multiple"
            placeholder="公司分类"
            options={CATEGORY_OPTIONS}
            style={{ minWidth: 180 }}
            allowClear
            maxTagCount={1}
            onChange={setCategoryFilter}
          />
          <Select
            mode="multiple"
            placeholder="开品平台"
            options={PLATFORM_OPTIONS}
            style={{ minWidth: 180 }}
            allowClear
            maxTagCount={2}
            onChange={setPlatformFilter}
          />
          <Select
            mode="multiple"
            placeholder="在售状态"
            options={STATUS_OPTIONS}
            style={{ minWidth: 160 }}
            allowClear
            onChange={setStatusFilter}
          />
          <Select
            mode="multiple"
            placeholder="开品来源"
            options={SOURCE_OPTIONS}
            style={{ minWidth: 140 }}
            allowClear
            onChange={setSourceFilter}
          />
          <Text type="secondary" style={{ fontSize: 13 }}>
            共 <Text strong>{filteredData.length}</Text> 条
          </Text>
        </Space>
      </Card>

      {/* ── 产品表格 ── */}
      <Card
        bordered={false}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          size="small"
          scroll={{ x: 3000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/products/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          rowClassName={(record) =>
            record.saleStatus === 'removed' ? 'ant-table-row-disabled' : ''
          }
        />
      </Card>
    </div>
  );
}
