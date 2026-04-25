import { useState, useMemo, useRef } from 'react';
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
  Tooltip,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  FilterOutlined,
  CloseOutlined,
  ThunderboltOutlined,
  DownOutlined,
  UpOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { InputRef } from 'antd/es/input';
import { mockProducts } from '../../mock/products';
import {
  type Product,
  type SaleStatus,
  SALE_STATUS_LABEL,
} from '../../types';
import ProductAvatar from '../../components/ProductAvatar';
import {
  parseQuery,
  applyNLFilters,
  NL_EXAMPLES,
  type NLFilters,
  type NLCondition,
} from '../../components/NLSearch/parser';

const { Title, Text } = Typography;

// ── 筛选选项 ─────────────────────────────────────
const mkOpts = (arr: string[]) => arr.map((v) => ({ label: v, value: v }));

const CATEGORY_OPTIONS = mkOpts([...new Set(mockProducts.map((p) => p.companyCategory))]);

const PLATFORM_OPTIONS = [...new Set(mockProducts.flatMap((p) => p.launchPlatforms))]
  .sort()
  .map((v) => ({ label: v.split(':')[1], value: v }));

const SOURCE_OPTIONS = mkOpts([...new Set(mockProducts.map((p) => p.source))]);

const PRODUCT_TYPE_OPTIONS = mkOpts([...new Set(mockProducts.map((p) => p.productType))]);

const DEVELOPER_OPTIONS = mkOpts([...new Set(mockProducts.map((p) => p.developer))].sort());

const CREATOR_OPTIONS = mkOpts([...new Set(mockProducts.map((p) => p.creator))].sort());

const IMPORTANCE_OPTIONS = mkOpts(['核心', '重要', '一般', '低优']);

const BOOL_OPTIONS = [
  { label: '是', value: 'true' },
  { label: '否', value: 'false' },
];

const STATUS_OPTIONS = (
  ['push-success', 'push-failed', 'pushing', 'pending', 'removed'] as SaleStatus[]
).map((s) => ({
  label: SALE_STATUS_LABEL[s],
  value: s,
}));


// ── 布尔字段展示 ─────────────────────────────────
function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <Text style={{ fontSize: 12 }}>是</Text>
  ) : (
    <Text type="secondary" style={{ fontSize: 12 }}>
      否
    </Text>
  );
}

// ── 自然语言搜索区 ─────────────────────────────────
interface NLSearchBarProps {
  onSearch: (filters: NLFilters, conditions: NLCondition[]) => void;
  conditions: NLCondition[];
  onRemoveCondition: (key: string) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
}

function NLSearchBar({
  onSearch,
  conditions,
  onRemoveCondition,
  onClear,
  resultCount,
  totalCount,
}: NLSearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    const result = parseQuery(trimmed);
    onSearch(result.filters, result.conditions);
  };

  const handleExampleClick = (example: string) => {
    setInputValue(example);
    const result = parseQuery(example);
    onSearch(result.filters, result.conditions);
  };

  const hasConditions = conditions.length > 0;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
        border: '1px solid #e8eeff',
        borderRadius: 10,
        padding: '20px 24px',
        marginBottom: 12,
        position: 'relative',
      }}
    >
      {/* 标题行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <ThunderboltOutlined style={{ color: '#1677ff', fontSize: 15 }} />
        <Text strong style={{ fontSize: 13, color: '#1677ff' }}>
          智能搜索
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          用自然语言描述你想找的产品，自动识别筛选条件
        </Text>
      </div>

      {/* 搜索框 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          ref={inputRef}
          value={inputValue}
          size="large"
          placeholder='例如：11月12月热销的核心运营品、台湾平台1688来源在售产品...'
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          onChange={(e) => {
            setInputValue(e.target.value);
            handleSearch(e.target.value);
          }}
          onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
          style={{
            flex: 1,
            borderRadius: 8,
            fontSize: 14,
            border: '1px solid #d0d9ff',
            boxShadow: 'none',
          }}
          allowClear
          onClear={() => {
            setInputValue('');
            onClear();
          }}
        />
        <Button
          type="primary"
          size="large"
          style={{ borderRadius: 8, paddingLeft: 24, paddingRight: 24 }}
          onClick={() => handleSearch(inputValue)}
        >
          搜索
        </Button>
      </div>

      {/* 快捷示例 */}
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
          常用：
        </Text>
        {NL_EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => handleExampleClick(ex)}
            style={{
              background: 'none',
              border: '1px solid #d0d9ff',
              borderRadius: 4,
              padding: '2px 10px',
              fontSize: 12,
              color: '#1677ff',
              cursor: 'pointer',
              lineHeight: '20px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) =>
              Object.assign((e.currentTarget as HTMLElement).style, {
                background: '#e8f0ff',
                borderColor: '#1677ff',
              })
            }
            onMouseLeave={(e) =>
              Object.assign((e.currentTarget as HTMLElement).style, {
                background: 'none',
                borderColor: '#d0d9ff',
              })
            }
          >
            {ex}
          </button>
        ))}
      </div>

      {/* 识别结果 */}
      {hasConditions && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid #e8eeff',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            已识别：
          </Text>
          {conditions.map((cond) => (
            <Tag
              key={cond.id}
              closable
              onClose={() => onRemoveCondition(cond.id)}
              color="blue"
              style={{ fontSize: 12, borderRadius: 4, margin: 0 }}
            >
              {cond.label}
            </Tag>
          ))}
          <button
            onClick={onClear}
            style={{
              background: 'none',
              border: 'none',
              color: '#8c8c8c',
              fontSize: 12,
              cursor: 'pointer',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <CloseOutlined style={{ fontSize: 10 }} />
            清除
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              符合条件
            </Text>
            <Text strong style={{ fontSize: 14, color: '#1677ff' }}>
              {resultCount}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              / {totalCount} 条
            </Text>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────
export default function ProductList() {
  const navigate = useNavigate();

  // NL search state
  const [nlFilters, setNLFilters] = useState<NLFilters>({});
  const [nlConditions, setNLConditions] = useState<NLCondition[]>([]);

  // Advanced filter state
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Row 1 – text inputs
  const [companyIdText, setCompanyIdText] = useState('');
  const [idText, setIdText] = useState('');
  const [skuText, setSkuText] = useState('');
  const [nameText, setNameText] = useState('');
  // Row 2 – category / platform / source / type
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [productTypeFilter, setProductTypeFilter] = useState<string[]>([]);
  // Row 3 – people / flags
  const [developerFilter, setDeveloperFilter] = useState<string[]>([]);
  const [creatorFilter, setCreatorFilter] = useState<string[]>([]);
  const [fbaFilter, setFbaFilter] = useState<string>('');
  const [opsRecFilter, setOpsRecFilter] = useState<string>('');
  // Row 4 – status / importance
  const [statusFilter, setStatusFilter] = useState<SaleStatus[]>([]);
  const [importanceFilter, setImportanceFilter] = useState<string[]>([]);

  // Filtered data: NL + advanced filters AND-combined
  const filteredData = useMemo(() => {
    return mockProducts.filter((p) => {
      // 1. NL filters
      if (!applyNLFilters(p, nlFilters)) return false;

      // 2. Text inputs (comma-separated support)
      const matchIds = (text: string, val: string) => {
        if (!text.trim()) return true;
        return text.split(',').map((t) => t.trim()).some((t) => t && val.toLowerCase().includes(t.toLowerCase()));
      };
      if (!matchIds(companyIdText, p.companyId)) return false;
      if (!matchIds(idText, p.id)) return false;
      if (!matchIds(skuText, p.sku)) return false;
      if (nameText && !p.name.toLowerCase().includes(nameText.toLowerCase())) return false;

      // 3. Dropdown filters
      if (categoryFilter.length && !categoryFilter.includes(p.companyCategory)) return false;
      if (platformFilter.length && !platformFilter.some((pl) => p.launchPlatforms.includes(pl))) return false;
      if (sourceFilter.length && !sourceFilter.includes(p.source)) return false;
      if (productTypeFilter.length && !productTypeFilter.includes(p.productType)) return false;
      if (developerFilter.length && !developerFilter.includes(p.developer)) return false;
      if (creatorFilter.length && !creatorFilter.includes(p.creator)) return false;
      if (fbaFilter && String(p.isFBAStock) !== fbaFilter) return false;
      if (opsRecFilter && String(p.isOpsRecommended) !== opsRecFilter) return false;
      if (statusFilter.length && !statusFilter.includes(p.saleStatus)) return false;
      if (importanceFilter.length && (!p.importanceLevel || !importanceFilter.includes(p.importanceLevel))) return false;

      return true;
    });
  }, [
    nlFilters,
    companyIdText, idText, skuText, nameText,
    categoryFilter, platformFilter, sourceFilter, productTypeFilter,
    developerFilter, creatorFilter, fbaFilter, opsRecFilter,
    statusFilter, importanceFilter,
  ]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleNLSearch = (filters: NLFilters, conditions: NLCondition[]) => {
    setNLFilters(filters);
    setNLConditions(conditions);
  };

  const handleRemoveCondition = (id: string) => {
    const remaining = nlConditions.filter((c) => c.id !== id);
    setNLConditions(remaining);
    // Rebuild filters from remaining conditions
    const newFilters: NLFilters = {};
    remaining.forEach((c) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newFilters as any)[c.filterKey] = (nlFilters as any)[c.filterKey];
    });
    setNLFilters(newFilters);
  };

  const handleClearNL = () => {
    setNLFilters({});
    setNLConditions([]);
  };


  const hasAdvancedFilters =
    companyIdText || idText || skuText || nameText ||
    categoryFilter.length || platformFilter.length || sourceFilter.length ||
    productTypeFilter.length || developerFilter.length || creatorFilter.length ||
    fbaFilter || opsRecFilter || statusFilter.length || importanceFilter.length;

  const handleResetAdvanced = () => {
    setCompanyIdText(''); setIdText(''); setSkuText(''); setNameText('');
    setCategoryFilter([]); setPlatformFilter([]); setSourceFilter([]);
    setProductTypeFilter([]); setDeveloperFilter([]); setCreatorFilter([]);
    setFbaFilter(''); setOpsRecFilter('');
    setStatusFilter([]); setImportanceFilter([]);
  };

  // ── Table columns ─────────────────────────────────────────────
  const columns: ColumnsType<Product> = [
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
                  {i > 0 && (
                    <Text type="secondary" style={{ margin: '0 2px', fontSize: 10 }}>
                      {'>>'}
                    </Text>
                  )}
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
        <Text copyable style={{ fontSize: 11, fontFamily: 'monospace' }}>
          {val}
        </Text>
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
          <Text type="secondary" style={{ fontSize: 12 }}>
            -
          </Text>
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
          <Text type="secondary" style={{ fontSize: 12 }}>
            -
          </Text>
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
          <Text type="secondary" style={{ fontSize: 12 }}>
            -
          </Text>
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
          <Text type="secondary" style={{ fontSize: 12 }}>
            -
          </Text>
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
          <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: val }}>
            {val}
          </Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            -
          </Text>
        ),
    },
    {
      title: '产品类型',
      dataIndex: 'productType',
      key: 'productType',
      width: 90,
      render: (val: string) => <Tag style={{ fontSize: 11 }}>{val}</Tag>,
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
      render: (val: string) => <Tag style={{ fontSize: 11 }}>{val}</Tag>,
    },
    {
      title: '在售状态',
      dataIndex: 'saleStatus',
      key: 'saleStatus',
      width: 90,
      render: (val: SaleStatus) => (
        <Text style={{ fontSize: 12 }}>{SALE_STATUS_LABEL[val]}</Text>
      ),
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
          <Text type="secondary" style={{ fontSize: 12 }}>
            -
          </Text>
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
          <Text type="secondary" style={{ fontSize: 12 }}>
            -
          </Text>
        ),
    },
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

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="page-container">
      {/* ── 页头 ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            产品数据中心
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            多维度产品数据分析 · 助力开品与运营决策
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          新增产品
        </Button>
      </div>


      {/* ── 智能搜索 ── */}
      <NLSearchBar
        onSearch={handleNLSearch}
        conditions={nlConditions}
        onRemoveCondition={handleRemoveCondition}
        onClear={handleClearNL}
        resultCount={filteredData.length}
        totalCount={mockProducts.length}
      />

      {/* ── 高级筛选 (可折叠) ── */}
      <Card
        bordered={false}
        style={{ marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: '10px 16px' }}
      >
        {/* 折叠触发行 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => setShowAdvanced((v) => !v)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilterOutlined style={{ color: '#595959', fontSize: 13 }} />
            <Text style={{ fontSize: 13 }}>高级筛选</Text>
            {hasAdvancedFilters && (
              <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>
                已生效
              </Tag>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              共{' '}
              <Text strong style={{ color: '#262626' }}>
                {filteredData.length}
              </Text>{' '}
              条结果
            </Text>
            {showAdvanced ? (
              <UpOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
            ) : (
              <DownOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
            )}
          </div>
        </div>

        {/* 筛选控件 */}
        {showAdvanced && (
          <>
            <Divider style={{ margin: '10px 0' }} />

            {/* Row 1 – 文本查询 */}
            <Row gutter={[12, 12]}>
              <Col span={6}>
                <Input
                  placeholder="产品ID（多个逗号分隔）"
                  allowClear
                  value={companyIdText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyIdText(e.target.value)}
                />
              </Col>
              <Col span={6}>
                <Input
                  placeholder="公库ID"
                  allowClear
                  value={idText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdText(e.target.value)}
                />
              </Col>
              <Col span={6}>
                <Input
                  placeholder="SKU（多个逗号分隔）"
                  allowClear
                  value={skuText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkuText(e.target.value)}
                />
              </Col>
              <Col span={6}>
                <Input
                  placeholder="产品名称"
                  allowClear
                  value={nameText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameText(e.target.value)}
                />
              </Col>
            </Row>

            {/* Row 2 – 类目 / 平台 / 来源 / 类型 */}
            <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
              <Col span={6}>
                <Select
                  mode="multiple"
                  placeholder="公司分类"
                  options={CATEGORY_OPTIONS}
                  style={{ width: '100%' }}
                  allowClear
                  maxTagCount={1}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                />
              </Col>
              <Col span={6}>
                <Select
                  mode="multiple"
                  placeholder="开品平台"
                  options={PLATFORM_OPTIONS}
                  style={{ width: '100%' }}
                  allowClear
                  maxTagCount={2}
                  value={platformFilter}
                  onChange={setPlatformFilter}
                />
              </Col>
              <Col span={6}>
                <Select
                  mode="multiple"
                  placeholder="开品来源"
                  options={SOURCE_OPTIONS}
                  style={{ width: '100%' }}
                  allowClear
                  value={sourceFilter}
                  onChange={setSourceFilter}
                />
              </Col>
              <Col span={6}>
                <Select
                  mode="multiple"
                  placeholder="产品类型"
                  options={PRODUCT_TYPE_OPTIONS}
                  style={{ width: '100%' }}
                  allowClear
                  value={productTypeFilter}
                  onChange={setProductTypeFilter}
                />
              </Col>
            </Row>

            {/* Row 3 – 人员 / 布尔字段 */}
            <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
              <Col span={6}>
                <Select
                  mode="multiple"
                  placeholder="开发员"
                  options={DEVELOPER_OPTIONS}
                  style={{ width: '100%' }}
                  allowClear
                  value={developerFilter}
                  onChange={setDeveloperFilter}
                />
              </Col>
              <Col span={6}>
                <Select
                  mode="multiple"
                  placeholder="创建人"
                  options={CREATOR_OPTIONS}
                  style={{ width: '100%' }}
                  allowClear
                  value={creatorFilter}
                  onChange={setCreatorFilter}
                />
              </Col>
              <Col span={6}>
                <Select
                  placeholder="FBA备货品"
                  options={BOOL_OPTIONS}
                  style={{ width: '100%' }}
                  allowClear
                  value={fbaFilter || undefined}
                  onChange={(v) => setFbaFilter(v ?? '')}
                />
              </Col>
              <Col span={6}>
                <Select
                  placeholder="运营推荐品"
                  options={BOOL_OPTIONS}
                  style={{ width: '100%' }}
                  allowClear
                  value={opsRecFilter || undefined}
                  onChange={(v) => setOpsRecFilter(v ?? '')}
                />
              </Col>
            </Row>

            {/* Row 4 – 状态 / 等级 / 操作按钮 */}
            <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
              <Col span={6}>
                <Select
                  mode="multiple"
                  placeholder="在售状态"
                  options={STATUS_OPTIONS}
                  style={{ width: '100%' }}
                  allowClear
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </Col>
              <Col span={6}>
                <Select
                  mode="multiple"
                  placeholder="重要等级"
                  options={IMPORTANCE_OPTIONS}
                  style={{ width: '100%' }}
                  allowClear
                  value={importanceFilter}
                  onChange={setImportanceFilter}
                />
              </Col>
              <Col span={6} />
              <Col span={6} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={handleResetAdvanced}>重置</Button>
              </Col>
            </Row>
          </>
        )}
      </Card>

      {/* ── 操作栏 ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          padding: '0 2px',
        }}
      >
        <Space size={8}>
          <Button
            type="primary"
            ghost
            icon={<InfoCircleOutlined />}
          >
            提报任务
          </Button>
          <Button
            type="primary"
            ghost
            icon={<InfoCircleOutlined />}
          >
            FBA备货确认
          </Button>
          <Button>
            导出
          </Button>
          <Button
            type="primary"
            ghost
            icon={<InfoCircleOutlined />}
          >
            重新推送
          </Button>
        </Space>

        <Space size={8}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            共{' '}
            <Text strong style={{ color: '#262626' }}>
              {filteredData.length}
            </Text>{' '}
            条
          </Text>
        </Space>
      </div>

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
