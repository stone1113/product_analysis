import type { CSSProperties, ReactNode, ChangeEvent } from 'react';
import { useState } from 'react';
import {
  Row,
  Col,
  Input,
  Select,
  Checkbox,
  InputNumber,
  Button,
  Typography,
  Space,
  Image,
  Divider,
  Tag,
} from 'antd';
import {
  LinkOutlined,
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import type { ProductDetail } from '../../../types';
import SkuSection from './SkuSection';
import AttributeSection from './AttributeSection';
import RemarksSection from './RemarksSection';

const { Text } = Typography;
const { TextArea } = Input;

// ── Mock 开品附加数据 ────────────────────────────────────────────
const LAUNCH_MOCK = {
  supplierName: '深圳市星辰供应链有限公司 (ID: SUP20341)',
  sourceUrl: 'https://detail.1688.com/offer/627977634.html',
  sourceCategory: '家居/家具/家装>>收纳/置物架>>桌面收纳',
  opsManager: '张明',
  amazonCategory: 'Home & Kitchen',
  market: '日本',
  channels: ['简体中文', '繁体中文', '日语'],
  platforms: ['马来店', '台湾店', '菲律宾店', '新加坡店'],
  title: '',
  keywords: ['收纳架', '桌面置物架', '多功能整理架', '储物架', '办公桌收纳'],
  bulletPoints: [
    '多功能设计，桌面、壁挂两用，适合办公室、卧室、厨房等多种场景',
    '优质铁艺材质，表面喷漆处理，防锈防腐，承重能力强，耐用性佳',
    '简洁现代风格，多色可选，与各类家居风格完美搭配，提升整体美观度',
    '安装简便，无需专业工具，附带详细安装说明，5分钟轻松完成安装',
    '合理的空间利用设计，多层收纳，最大化存储空间，让桌面更整洁有序',
  ],
  functionTags: '家居收纳\n桌面整理\n置物架\n多功能收纳\n壁挂架',
  supplierInfo: '深圳市星辰供应链有限公司，多年行业经验，品质稳定，支持小批量定制',
  sampleNo: 'SAM-2025-0341',
  supplierId: 20341,
  sampleQty: 3,
  minOrderQty: 100,
  unitCost: 23.50,
  isLowestPrice: '否',
  lowestPrice: 0,
  hasBarcode: '是',
  brandName: 'NovaStar',
  originCountry: '中国大陆',
  trademark: '已注册',
};

const CHANNEL_OPTIONS = [
  '简体中文', '繁体中文', '日语', '英语', '法语',
  '德语', '泰语', '越南语', '印尼语', '俄语', '葡萄牙语',
];

const PLATFORM_OPTIONS = [
  '马来店', '菲律宾店', '台湾店', '新加坡店', '印尼店',
  '泰国店', '越南店', '巴西店',
];

// ── Section 标题 ─────────────────────────────────────────────────
function SectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        background: '#f5f7fa',
        borderLeft: '3px solid #1677ff',
        padding: '7px 14px',
        marginBottom: 16,
        borderRadius: '0 4px 4px 0',
      }}
    >
      <Text strong style={{ fontSize: 13, color: '#262626' }}>
        {title}
      </Text>
    </div>
  );
}

// ── 表单行标签 ───────────────────────────────────────────────────
function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text style={{ fontSize: 13, color: '#595959' }}>
      {required && <span style={{ color: '#ff4d4f', marginRight: 3 }}>*</span>}
      {text}
    </Text>
  );
}

// ── 只读值展示 ───────────────────────────────────────────────────
function ReadonlyVal({ value }: { value: string | number }) {
  return (
    <Text style={{ fontSize: 13, color: '#262626' }}>{value}</Text>
  );
}

// ─────────────────────────────────────────────────────────────────
interface Props {
  product: ProductDetail;
}

// ── 竞品行类型 ────────────────────────────────────────────────────
interface CompetitorRow {
  id: number;
  url: string;
  price: number;
  title: string;
  keywords: string;
  category: string;
}

// ── 图片分组 mock ─────────────────────────────────────────────────
const MOCK_IMAGES = {
  spu: Array.from({ length: 10 }, (_, i) => `spu_${i + 1}`),
  detail: Array.from({ length: 19 }, (_, i) => `detail_${i + 1}`),
  dev: [] as string[],
};

// 用 SVG data URL 作为占位图
function imgPlaceholder(seed: string) {
  const colors = ['#e8f4fd', '#f0f7e6', '#fff7e6', '#fef0f0', '#f3f0ff'];
  const bg = colors[seed.charCodeAt(seed.length - 1) % colors.length];
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='72' height='72' fill='${encodeURIComponent(bg)}'/%3E%3C/svg%3E`;
}

export default function LaunchInfoTab({ product }: Props) {
  const d = LAUNCH_MOCK;

  const [competitors, setCompetitors] = useState<CompetitorRow[]>([
    { id: 1, url: 'https://detail.1688.com/offer/917707727613.html', price: 0, title: '', keywords: '', category: '' },
    { id: 2, url: 'https://detail.1688.com/offer/104403575340.html', price: 0, title: '', keywords: '', category: '' },
    { id: 3, url: 'https://detail.1688.com/offer/102416228525312.html', price: 0, title: '', keywords: '', category: '' },
  ]);

  const addCompetitor = () => {
    setCompetitors((prev) => [
      ...prev,
      { id: Date.now(), url: '', price: 0, title: '', keywords: '', category: '' },
    ]);
  };

  const removeCompetitor = (id: number) => {
    setCompetitors((prev) => prev.filter((r) => r.id !== id));
  };

  const updateCompetitor = (id: number, field: keyof CompetitorRow, value: string | number) => {
    setCompetitors((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const formItemStyle: CSSProperties = { marginBottom: 12 };
  const labelStyle: CSSProperties = {
    minWidth: 90,
    textAlign: 'right',
    paddingRight: 8,
    flexShrink: 0,
    paddingTop: 5,
  };
  const fieldRow = (
    label: ReactNode,
    content: ReactNode,
    required = false,
  ) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', ...formItemStyle }}>
      <div style={labelStyle}>
        <FieldLabel text={label as string} required={required} />
      </div>
      <div style={{ flex: 1 }}>{content}</div>
    </div>
  );

  return (
    <div>
        {/* 产品信息 */}
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '16px 20px', marginBottom: 12 }}>
          <SectionTitle title="开品信息" />

          {/* 供应商来源 */}
          {fieldRow(
            '供应商名称ID',
            <Select
              defaultValue={d.supplierName}
              style={{ width: '100%' }}
              options={[{ label: d.supplierName, value: d.supplierName }]}
            />,
          )}

          {/* URL + 获取按钮 */}
          {fieldRow(
            '来源URL',
            <Space.Compact style={{ width: '100%' }}>
              <Input defaultValue={d.sourceUrl} style={{ flex: 1 }} />
              <Button type="primary" icon={<LinkOutlined />} />
            </Space.Compact>,
          )}

          {/* 产品预览 */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              padding: '10px 12px',
              background: '#fafafa',
              border: '1px solid #f0f0f0',
              borderRadius: 6,
              marginBottom: 12,
              marginLeft: 98,
            }}
          >
            <Image
              src={product.imageUrl || ''}
              width={60}
              height={60}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              preview={false}
            />
            <div>
              <Text strong style={{ fontSize: 13 }}>{product.name}</Text>
              <br />
              <Text style={{ color: '#ee4d2d', fontSize: 15, fontWeight: 600 }}>
                ¥{product.purchaseCost?.toFixed(2) ?? '--'}
              </Text>
            </div>
          </div>

          {/* 1688分类 */}
          {fieldRow('1688分类', <ReadonlyVal value={d.sourceCategory} />)}

          {/* 公司分类 */}
          {fieldRow(
            '公司分类',
            <Select
              defaultValue={product.companyCategory}
              style={{ width: '100%' }}
              options={[{ label: product.companyCategory, value: product.companyCategory }]}
            />,
            true,
          )}

          {/* 运营管理员 + Amazon分类 + 市场 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 8 }}>
              <div style={{ ...labelStyle, minWidth: 70 }}>
                <FieldLabel text="运营管理员" />
              </div>
              <Select
                defaultValue={d.opsManager}
                style={{ flex: 1 }}
                options={[{ label: d.opsManager, value: d.opsManager }]}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 8 }}>
              <div style={{ minWidth: 74, textAlign: 'right', paddingRight: 8, flexShrink: 0 }}>
                <FieldLabel text="Amazon分类" />
              </div>
              <Select
                defaultValue={d.amazonCategory}
                style={{ flex: 1 }}
                options={[{ label: d.amazonCategory, value: d.amazonCategory }]}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ minWidth: 30, textAlign: 'right', paddingRight: 8, flexShrink: 0 }}>
                <FieldLabel text="市场" />
              </div>
              <Select
                defaultValue={d.market}
                style={{ minWidth: 80 }}
                options={[
                  { label: '日本', value: '日本' },
                  { label: '美国', value: '美国' },
                  { label: '英国', value: '英国' },
                ]}
              />
            </div>
          </div>

          {/* FBA备货品 */}
          {fieldRow(
            'FBA备货品',
            <Checkbox defaultChecked={product.isFBAStock} />,
          )}

          {/* 运营渠道 */}
          {fieldRow(
            '运营渠道',
            <div>
              <Checkbox.Group
                defaultValue={d.channels}
                options={CHANNEL_OPTIONS}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 0' }}
              />
              <div style={{ marginTop: 6 }}>
                <Text type="secondary" style={{ fontSize: 12, color: '#ff4d4f' }}>
                  注：如果当前的店铺不显示必需求选店铺，请直接选—下都选
                </Text>
              </div>
            </div>,
          )}

          {/* 可运营平台 */}
          {fieldRow(
            '可运营平台',
            <Checkbox.Group
              defaultValue={d.platforms}
              options={PLATFORM_OPTIONS}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 0' }}
            />,
          )}
        </div>

        {/* 产品基本信息 + 供货商信息 并列两列 */}
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '16px 20px' }}>
          <SectionTitle title="产品基本信息" />
          <Row gutter={24} align="top">
            {/* 左列：产品基本信息字段 */}
            <Col span={14}>
              {/* 产品标题 */}
              {fieldRow(
                '产品标题',
                <Input defaultValue={product.name} placeholder="请输入产品标题" />,
                true,
              )}

              {/* 关键词 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', ...formItemStyle }}>
                <div style={labelStyle}>
                  <FieldLabel text="关键词" required />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {d.keywords.map((kw, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <TextArea
                        defaultValue={kw}
                        rows={1}
                        maxLength={250}
                        showCount
                        style={{ resize: 'none' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 主要卖点 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', ...formItemStyle }}>
                <div style={labelStyle}>
                  <FieldLabel text="主要卖点" required />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {d.bulletPoints.map((bp, i) => (
                    <TextArea
                      key={i}
                      defaultValue={bp}
                      rows={2}
                      maxLength={250}
                      showCount
                      style={{ resize: 'none' }}
                    />
                  ))}
                </div>
              </div>

              {/* 功能标签 */}
              {fieldRow(
                '功能标签',
                <TextArea
                  defaultValue={d.functionTags}
                  rows={4}
                  placeholder="每行一个标签"
                  style={{ resize: 'none' }}
                />,
                true,
              )}
            </Col>

            {/* 右列：供货商信息字段 */}
            <Col span={10}>
              <div style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 20 }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>供货商信息</span>
                </div>

                {fieldRow(
                  '供货商信息',
                  <TextArea defaultValue={d.supplierInfo} rows={3} style={{ resize: 'none' }} />,
                  true,
                )}
                {fieldRow('样品号', <Input defaultValue={d.sampleNo} />)}
                {fieldRow('供应商ID', <InputNumber defaultValue={d.supplierId} style={{ width: '100%' }} />)}
                {fieldRow('样品数量', <InputNumber defaultValue={d.sampleQty} min={0} style={{ width: '100%' }} />)}

                <Divider style={{ margin: '10px 0' }} />

                {fieldRow('最小起订量', <InputNumber defaultValue={d.minOrderQty} min={1} style={{ width: '100%' }} />, true)}
                {fieldRow(
                  '采购单价(¥)',
                  <InputNumber defaultValue={d.unitCost} min={0} precision={2} prefix="¥" style={{ width: '100%' }} />,
                  true,
                )}
                {fieldRow(
                  '最低报价',
                  <Select
                    defaultValue={d.isLowestPrice}
                    style={{ width: '100%' }}
                    options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]}
                  />,
                )}
                {fieldRow(
                  '最低报价(¥)',
                  <InputNumber defaultValue={d.lowestPrice} min={0} precision={2} prefix="¥" style={{ width: '100%' }} />,
                )}

                <Divider style={{ margin: '10px 0' }} />

                {fieldRow(
                  '是否条形码',
                  <Select
                    defaultValue={d.hasBarcode}
                    style={{ width: '100%' }}
                    options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]}
                  />,
                )}
                {fieldRow('品牌名', <Input defaultValue={d.brandName} />)}
                {fieldRow('产品国家/地区', <Input defaultValue={d.originCountry} />)}
                {fieldRow('注册商标', <Input defaultValue={d.trademark} />)}
              </div>
            </Col>
          </Row>
        </div>

        {/* ── 竞品参考 ── */}
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '16px 20px', marginTop: 12 }}>
          <SectionTitle title="竞品参考" />

          {competitors.map((row) => (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 1fr 1fr 1fr 32px',
                gap: 8,
                marginBottom: 8,
                alignItems: 'center',
              }}
            >
              <Input
                placeholder="竞品参考链接"
                value={row.url}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateCompetitor(row.id, 'url', e.target.value)}
              />
              <InputNumber
                placeholder="推价"
                value={row.price}
                min={0}
                precision={2}
                prefix="¥"
                style={{ width: '100%' }}
                onChange={(v) => updateCompetitor(row.id, 'price', v ?? 0)}
              />
              <Input
                placeholder="竞品标题"
                value={row.title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateCompetitor(row.id, 'title', e.target.value)}
              />
              <Input
                placeholder="竞品关键词（多个词语可分割）"
                value={row.keywords}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateCompetitor(row.id, 'keywords', e.target.value)}
              />
              <Input
                placeholder="竞品目录"
                value={row.category}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateCompetitor(row.id, 'category', e.target.value)}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeCompetitor(row.id)}
              />
            </div>
          ))}

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addCompetitor}
            style={{ marginTop: 4, width: '100%' }}
          >
            添加竞品
          </Button>
        </div>

        {/* ── 产品基本信息-图片 ── */}
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '16px 20px', marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ background: '#f5f7fa', borderLeft: '3px solid #1677ff', padding: '7px 14px', borderRadius: '0 4px 4px 0' }}>
              <Text strong style={{ fontSize: 13 }}>产品基本信息-图片</Text>
            </div>
            <Button type="primary" ghost icon={<DownloadOutlined />} size="small">
              一键下载
            </Button>
          </div>

          {/* SPU点图 */}
          <ImageGroup
            title="SPU点图"
            images={MOCK_IMAGES.spu}
          />

          {/* 详情独立图 */}
          <ImageGroup
            title="详情独立图"
            images={MOCK_IMAGES.detail}
          />

          {/* 开发图 */}
          <ImageGroup
            title="开发图"
            images={MOCK_IMAGES.dev}
          />

          {/* 视频 */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: 500 }}>视频</Text>
            </div>
            <div
              style={{
                border: '1px dashed #d9d9d9',
                borderRadius: 6,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#bfbfbf',
                gap: 6,
              }}
            >
              <PlayCircleOutlined />
              <Text type="secondary" style={{ fontSize: 12 }}>暂无视频</Text>
            </div>
          </div>
        </div>

        {/* ── SKU 信息 ── */}
        <SkuSection />

        {/* ── 属性信息 ── */}
        <AttributeSection />

        {/* ── 备注 ── */}
        <RemarksSection />

    </div>
  );
}

// ── 图片分组组件 ──────────────────────────────────────────────────
function ImageGroup({ title, images }: { title: string; images: string[] }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: 500 }}>{title}</Text>
        <Tag style={{ fontSize: 11, margin: 0 }}>共 {images.length} 张图</Tag>
      </div>
      {images.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Image.PreviewGroup>
            {images.map((key) => (
              <div
                key={key}
                style={{
                  width: 72,
                  height: 72,
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <Image
                  src={imgPlaceholder(key)}
                  width={72}
                  height={72}
                  style={{ objectFit: 'cover' }}
                  preview={{ mask: <span style={{ fontSize: 11 }}>预览</span> }}
                />
              </div>
            ))}
          </Image.PreviewGroup>
        </div>
      ) : (
        <div
          style={{
            border: '1px dashed #d9d9d9',
            borderRadius: 6,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>暂无图片</Text>
        </div>
      )}
    </div>
  );
}

