import { useState } from 'react';
import {
  Tabs,
  Button,
  Checkbox,
  Select,
  Input,
  InputNumber,
  Tag,
  Space,
  Typography,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import ProductAvatar from '../../../components/ProductAvatar';

const { Text } = Typography;

// ─── Types ───────────────────────────────────────────────────────
interface SkuVariant {
  id: string;
  color: string;
  size: string;
  dimL: number | null;
  dimW: number | null;
  dimH: number | null;
  weight: number | null;
  cost: number | null;
  estPrice: number | null;
  deliveryRate: number | null;
  status: string;
  barcode: string;
}

interface SkuGroup {
  id: string;
  name: string;
  code: string;
  variants: SkuVariant[];
}

// ─── Mock data ────────────────────────────────────────────────────
const INIT_SKU_GROUPS: SkuGroup[] = [
  {
    id: 'grp1',
    name: '型品 M',
    code: '532736-2156000',
    variants: [
      { id: 'v1a', color: '颜色', size: '颜色', dimL: 20, dimW: 15, dimH: 10, weight: 200, cost: null, estPrice: null, deliveryRate: null, status: '型品', barcode: '0737' },
      { id: 'v1b', color: '图片', size: 'M',    dimL: 20, dimW: 15, dimH: 10, weight: 200, cost: null, estPrice: null, deliveryRate: null, status: '颜色', barcode: '' },
    ],
  },
  {
    id: 'grp2',
    name: '商品 L',
    code: '532736-2156001',
    variants: [
      { id: 'v2a', color: '颜色', size: '颜色', dimL: 0, dimW: 0, dimH: 0, weight: 200, cost: 0.00, estPrice: 1, deliveryRate: null, status: '产品', barcode: '6344' },
      { id: 'v2b', color: '图片', size: 'L',    dimL: 0, dimW: 0, dimH: 0, weight: 200, cost: null, estPrice: null, deliveryRate: null, status: '包量', barcode: '' },
    ],
  },
  {
    id: 'grp3',
    name: '标品 S',
    code: '532736-2156002',
    variants: [
      { id: 'v3a', color: '黑色', size: 'S',    dimL: 18, dimW: 12, dimH: 8, weight: 180, cost: 23.50, estPrice: 1, deliveryRate: 0.95, status: '产品', barcode: '0829' },
    ],
  },
];

const COLOR_OPTIONS = ['颜色', '图片', '黑色', '白色', '红色', '蓝色'].map(v => ({ label: v, value: v }));
const SIZE_OPTIONS  = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '颜色', '图片'].map(v => ({ label: v, value: v }));
const STATUS_OPTIONS = ['产品', '型品', '颜色', '包量', '应置', '停产'].map(v => ({ label: v, value: v }));
const GENDER_OPTIONS = ['女', '男', '中性'].map(v => ({ label: v, value: v }));
const SITE_OPTIONS   = ['成人', '儿童', '全站'].map(v => ({ label: v, value: v }));

// ─── Column header ────────────────────────────────────────────────
const TH = ({ children }: { children: React.ReactNode }) => (
  <th
    style={{
      background: '#fafafa',
      borderBottom: '1px solid #f0f0f0',
      borderRight: '1px solid #f0f0f0',
      padding: '8px 10px',
      fontSize: 12,
      fontWeight: 500,
      color: '#595959',
      whiteSpace: 'nowrap',
      textAlign: 'center',
    }}
  >
    {children}
  </th>
);

const TD = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <td
    style={{
      borderBottom: '1px solid #f0f0f0',
      borderRight: '1px solid #f0f0f0',
      padding: '6px 8px',
      fontSize: 12,
      verticalAlign: 'middle',
      ...style,
    }}
  >
    {children}
  </td>
);

// ─── Main component ───────────────────────────────────────────────
export default function SkuSection() {
  const [groups, setGroups] = useState<SkuGroup[]>(INIT_SKU_GROUPS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [gender, setGender] = useState('女');
  const [site, setSite] = useState('成人');

  const totalVariants = groups.reduce((s, g) => s + g.variants.length, 0);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addGroup = () => {
    const newId = `grp_${Date.now()}`;
    setGroups(prev => [
      ...prev,
      {
        id: newId,
        name: `新品 -`,
        code: '',
        variants: [
          { id: `${newId}_v1`, color: '颜色', size: '颜色', dimL: null, dimW: null, dimH: null, weight: null, cost: null, estPrice: null, deliveryRate: null, status: '产品', barcode: '' },
        ],
      },
    ]);
  };

  const deleteSelected = () => {
    setGroups(prev =>
      prev.map(g => ({
        ...g,
        variants: g.variants.filter(v => !selectedIds.has(v.id)),
      })).filter(g => g.variants.length > 0)
    );
    setSelectedIds(new Set());
  };

  const addVariant = (groupId: string) => {
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? {
              ...g,
              variants: [
                ...g.variants,
                { id: `${groupId}_${Date.now()}`, color: '颜色', size: '颜色', dimL: null, dimW: null, dimH: null, weight: null, cost: null, estPrice: null, deliveryRate: null, status: '产品', barcode: '' },
              ],
            }
          : g
      )
    );
  };

  return (
    <div style={{ marginTop: 12 }}>
      <Tabs
        size="small"
        defaultActiveKey="launch"
        style={{ marginBottom: 0 }}
        tabBarStyle={{ paddingLeft: 0 }}
        items={[
          { key: 'launch', label: '开品SKU' },
          { key: 'sold',   label: '已售合SKU' },
        ]}
      />

      {/* ── 区块头 ── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: 6,
          padding: '14px 16px',
        }}
      >
        {/* 标题行 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ background: '#f5f7fa', borderLeft: '3px solid #1677ff', padding: '5px 12px', borderRadius: '0 4px 4px 0' }}>
            <Text strong style={{ fontSize: 13 }}>产品基本信息-SKU信息</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            总数：<Text strong>{totalVariants}</Text> 已选：<Text strong>{selectedIds.size}</Text>
          </Text>
        </div>

        {/* 操作按钮 */}
        <Space size={8} style={{ marginBottom: 12 }}>
          <Button type="primary" ghost size="small" icon={<PlusOutlined />} onClick={addGroup}>
            新建SKU
          </Button>
          <Button size="small" danger ghost icon={<DeleteOutlined />} onClick={deleteSelected} disabled={selectedIds.size === 0}>
            删除
          </Button>
        </Space>

        {/* 过滤条件 */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 12, color: '#ff4d4f' }}>*</Text>
            <Text style={{ fontSize: 12 }}>开品环境性别</Text>
            <Select value={gender} onChange={setGender} options={GENDER_OPTIONS} style={{ width: 80 }} size="small" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 12, color: '#ff4d4f' }}>*</Text>
            <Text style={{ fontSize: 12 }}>SKU可运站点</Text>
            <Select value={site} onChange={setSite} options={SITE_OPTIONS} style={{ width: 80 }} size="small" />
          </div>
        </div>

        {/* ── SKU 表格 ── */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px solid #f0f0f0', borderLeft: '1px solid #f0f0f0' }}>
            <thead>
              <tr>
                <TH> </TH>
                <TH>SKU</TH>
                <TH>材质颜色</TH>
                <TH>尺码选择</TH>
                <TH>操作</TH>
                <TH>粘贴1688变体值</TH>
                <TH>长(cm)</TH>
                <TH>宽(cm)</TH>
                <TH>高(cm)</TH>
                <TH>重量(g)</TH>
                <TH>采购成本(¥)</TH>
                <TH>估计单价确认</TH>
                <TH>1688交货率</TH>
                <TH>产品状态</TH>
                <TH>编号</TH>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) =>
                group.variants.map((variant, vi) => (
                  <tr key={variant.id} style={{ background: selectedIds.has(variant.id) ? '#f0f7ff' : undefined }}>
                    {/* Checkbox */}
                    <TD style={{ width: 36, textAlign: 'center' }}>
                      <Checkbox
                        checked={selectedIds.has(variant.id)}
                        onChange={() => toggleSelect(variant.id)}
                      />
                    </TD>

                    {/* SKU – first variant shows group info */}
                    <TD style={{ minWidth: 160 }}>
                      {vi === 0 ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <ProductAvatar productId={group.id} name={group.name} size={36} borderRadius={4} />
                            <div>
                              <Text strong style={{ fontSize: 12, display: 'block' }}>{group.name}</Text>
                              <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>{group.code}</Text>
                            </div>
                          </div>
                          <button
                            onClick={() => addVariant(group.id)}
                            style={{ background: 'none', border: 'none', color: '#1677ff', fontSize: 11, cursor: 'pointer', padding: 0 }}
                          >
                            <PlusOutlined style={{ fontSize: 10 }} /> 添加图片
                          </button>
                        </div>
                      ) : (
                        <div style={{ paddingLeft: 8 }}>
                          <Tag icon={<PictureOutlined />} style={{ fontSize: 10 }}>图片</Tag>
                        </div>
                      )}
                    </TD>

                    {/* 材质颜色 */}
                    <TD style={{ width: 100 }}>
                      <Select
                        value={variant.color}
                        options={COLOR_OPTIONS}
                        size="small"
                        style={{ width: '100%' }}
                      />
                    </TD>

                    {/* 尺码选择 */}
                    <TD style={{ width: 90 }}>
                      <Select
                        value={variant.size}
                        options={SIZE_OPTIONS}
                        size="small"
                        style={{ width: '100%' }}
                      />
                    </TD>

                    {/* 操作 */}
                    <TD style={{ width: 56, textAlign: 'center' }}>
                      <Button type="primary" size="small" style={{ fontSize: 11 }}>应用</Button>
                    </TD>

                    {/* 粘贴1688变体值 */}
                    <TD style={{ minWidth: 130 }}>
                      <Space.Compact size="small" style={{ width: '100%' }}>
                        <Input placeholder="变体值" size="small" style={{ fontSize: 11 }} />
                        <Tooltip title="粘贴">
                          <Button size="small" icon={<CopyOutlined />} />
                        </Tooltip>
                      </Space.Compact>
                    </TD>

                    {/* 尺寸 L / W / H */}
                    {(['dimL', 'dimW', 'dimH'] as const).map((dim) => (
                      <TD key={dim} style={{ width: 72 }}>
                        <InputNumber
                          value={variant[dim]}
                          min={0}
                          size="small"
                          style={{ width: '100%' }}
                          controls={false}
                        />
                      </TD>
                    ))}

                    {/* 重量 */}
                    <TD style={{ width: 80 }}>
                      <InputNumber
                        value={variant.weight}
                        min={0}
                        size="small"
                        style={{ width: '100%' }}
                        controls={false}
                      />
                    </TD>

                    {/* 采购成本 */}
                    <TD style={{ width: 90 }}>
                      <InputNumber
                        value={variant.cost}
                        min={0}
                        precision={2}
                        size="small"
                        style={{ width: '100%' }}
                        controls={false}
                        placeholder="0.00"
                      />
                    </TD>

                    {/* 估计单价确认 */}
                    <TD style={{ width: 90 }}>
                      <InputNumber
                        value={variant.estPrice}
                        min={0}
                        size="small"
                        style={{ width: '100%' }}
                        controls={false}
                        placeholder="0"
                      />
                    </TD>

                    {/* 1688交货率 */}
                    <TD style={{ width: 90 }}>
                      <InputNumber
                        value={variant.deliveryRate}
                        min={0}
                        max={1}
                        step={0.01}
                        size="small"
                        style={{ width: '100%' }}
                        controls={false}
                        placeholder="-"
                      />
                    </TD>

                    {/* 产品状态 */}
                    <TD style={{ width: 90 }}>
                      <Select
                        value={variant.status}
                        options={STATUS_OPTIONS}
                        size="small"
                        style={{ width: '100%' }}
                      />
                    </TD>

                    {/* 编号 */}
                    <TD style={{ width: 80 }}>
                      <Input
                        defaultValue={variant.barcode}
                        size="small"
                        style={{ fontFamily: 'monospace', fontSize: 11 }}
                      />
                    </TD>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
