import { SALE_STATUS_LABEL } from '../../types';
import type { SaleStatus } from '../../types';

// ─── Filter shape ────────────────────────────────────────────────
export interface NLFilters {
  hotSalesPeriod?: number[];        // 月份 [1-12]
  importanceLevel?: string[];       // 核心 / 重要 / 一般 / 低优
  launchPlatforms?: string[];       // shopee:TW 等
  saleStatus?: SaleStatus[];
  source?: string[];
  productType?: string[];
  companyCategoryKeyword?: string;  // 类目关键词模糊匹配
  onlyWithHotPeriod?: boolean;      // 仅热销周期有值的产品
  onlyOpsRecommended?: boolean;     // 仅运营推荐品
}

// ─── Recognized condition（用于 tag 展示）────────────────────────
export interface NLCondition {
  id: string;
  label: string;
  filterKey: keyof NLFilters;
}

// ─── Parse result ─────────────────────────────────────────────────
export interface ParseResult {
  filters: NLFilters;
  conditions: NLCondition[];
}

// ─── Quick examples for UI ────────────────────────────────────────
export const NL_EXAMPLES = [
  '旺季核心备货品',
  '11月12月热销运营品',
  '台湾平台在售产品',
  '1688来源开发品',
  'Q4重要等级产品',
];

// ─────────────────────────────────────────────────────────────────
// Main parser
// ─────────────────────────────────────────────────────────────────
export function parseQuery(input: string): ParseResult {
  const lower = input.toLowerCase().trim();
  if (!lower) return { filters: {}, conditions: [] };

  const months = new Set<number>();
  const importanceLevels = new Set<string>();
  const platforms = new Set<string>();
  const statuses = new Set<SaleStatus>();
  const sources = new Set<string>();
  const productTypes = new Set<string>();
  const categoryMatches: string[] = [];
  let onlyWithHotPeriod = false;
  let onlyOpsRecommended = false;

  // ── 月份 / 节点 ─────────────────────────────────────────────────
  const monthRules: [string | RegExp, number[]][] = [
    ['1月', [1]], ['一月', [1]], ['正月', [1]],
    ['2月', [2]], ['二月', [2]], ['春节', [1, 2]],
    ['3月', [3]], ['三月', [3]],
    ['4月', [4]], ['四月', [4]],
    ['5月', [5]], ['五月', [5]], ['母亲节', [5]],
    ['6月', [6]], ['六月', [6]], ['618', [6]], ['端午', [5, 6]], ['父亲节', [6]],
    ['7月', [7]], ['七月', [7]],
    ['8月', [8]], ['八月', [8]],
    ['9月', [9]], ['九月', [9]], ['开学季', [9]], ['开学', [9]],
    ['10月', [10]], ['十月', [10]], ['国庆', [10]], ['万圣节', [10]],
    ['11月', [11]], ['十一月', [11]], ['双11', [11]], ['双十一', [11]],
    ['黑五', [11]], ['感恩节', [11]],
    ['12月', [12]], ['十二月', [12]], ['圣诞', [12]], ['双12', [12]], ['双十二', [12]],
    ['下半年', [7, 8, 9, 10, 11, 12]],
    ['上半年', [1, 2, 3, 4, 5, 6]],
    [/q4/i, [10, 11, 12]], ['第四季度', [10, 11, 12]], ['四季度', [10, 11, 12]],
    [/q3/i, [7, 8, 9]], ['第三季度', [7, 8, 9]],
    [/q2/i, [4, 5, 6]], ['第二季度', [4, 5, 6]],
    [/q1/i, [1, 2, 3]], ['第一季度', [1, 2, 3]],
    // 泛义旺季默认为 Q4
    ['旺季', [10, 11, 12]],
    ['淡季', [1, 2, 7, 8]],
  ];

  for (const [pattern, ms] of monthRules) {
    const hit =
      typeof pattern === 'string'
        ? lower.includes(pattern)
        : pattern.test(input);
    if (hit) ms.forEach((m) => months.add(m));
  }

  // ── 重要等级 ────────────────────────────────────────────────────
  if (lower.includes('核心')) importanceLevels.add('核心');
  if (lower.includes('重要') && !lower.includes('不重要')) importanceLevels.add('重要');
  if (lower.includes('一般品') || lower.includes('一般产品')) importanceLevels.add('一般');
  if (lower.includes('低优')) importanceLevels.add('低优');
  // "重点" 映射到 核心+重要
  if (lower.includes('重点') && !lower.includes('重要')) {
    importanceLevels.add('核心');
    importanceLevels.add('重要');
  }

  // ── 平台 ────────────────────────────────────────────────────────
  const platformRules: [string[], string][] = [
    [['台湾', ':tw', 'tw市场'], 'shopee:TW'],
    [['菲律宾', ':ph', '菲律'], 'shopee:PH'],
    [['马来西亚', '马来', ':my'], 'shopee:MY'],
    [['新加坡', ':sg', '新加'], 'shopee:SG'],
    [['印尼', ':id', '印度尼西亚'], 'shopee:ID'],
    [['泰国', ':th'], 'shopee:TH'],
    [['越南', ':vn'], 'shopee:VN'],
    [['巴西', ':br'], 'shopee:BR'],
  ];
  for (const [kws, platform] of platformRules) {
    if (kws.some((k) => lower.includes(k))) platforms.add(platform);
  }

  // ── 在售状态 ────────────────────────────────────────────────────
  if (lower.includes('推送成功') || lower.includes('在售') || lower.includes('已上架'))
    statuses.add('push-success');
  if (lower.includes('推送失败')) statuses.add('push-failed');
  if (lower.includes('待推') || lower.includes('待上架') || lower.includes('未上架'))
    statuses.add('pending');
  if (lower.includes('推送中')) statuses.add('pushing');
  if ((lower.includes('已下架') || lower.includes('下架品')) && !lower.includes('未下架'))
    statuses.add('removed');

  // ── 开品来源 ────────────────────────────────────────────────────
  if (lower.includes('1688') || input.includes('1688')) sources.add('1688');
  if (lower.includes('速卖通') || lower.includes('aliexpress')) sources.add('速卖通');
  if (lower.includes('义乌')) sources.add('义乌市场');
  if (lower.includes('广州市场') || lower.includes('广州批发')) sources.add('广州市场');
  if (lower.includes('深圳工厂') || lower.includes('深圳直供')) sources.add('深圳工厂');

  // ── 产品类型 ────────────────────────────────────────────────────
  if (lower.includes('运营品')) productTypes.add('运营品');
  if (lower.includes('开发品') || lower.includes('新品')) productTypes.add('开发品');
  if (lower.includes('清库')) productTypes.add('清库品');

  // ── 类目关键词 ──────────────────────────────────────────────────
  const categoryRules: [string[], string][] = [
    [['家居', '居家', '家具', '大家居'], '家居'],
    [['厨房', '厨具', '烹饪'], '厨'],
    [['电子', '数码', '电器', '电子产品'], '电'],
    [['运动', '健身', '户外', '运动器材'], '运动'],
    [['宠物', '宠物用品'], '宠物'],
    [['美妆', '化妆', '护肤', '美容'], '美妆'],
    [['箱包', '背包', '包包', '收纳包'], '箱包'],
    [['收纳', '整理'], '收纳'],
    [['照明', '灯具', '灯光', '台灯'], '照明'],
    [['玩具', '儿童', '儿童玩具'], '玩具'],
    [['服装', '服饰', '衣服', '穿搭'], '服装'],
    [['厨房用品', '锅具', '餐具'], '厨'],
  ];
  for (const [kws, kw] of categoryRules) {
    if (kws.some((k) => lower.includes(k)) && !categoryMatches.includes(kw)) {
      categoryMatches.push(kw);
    }
  }

  // ── 目标意图 ────────────────────────────────────────────────────
  if (lower.includes('备货') || lower.includes('热销品') || lower.includes('备货参考')) {
    onlyWithHotPeriod = true;
  }
  if (lower.includes('运营推荐') || lower.includes('推荐品')) {
    onlyOpsRecommended = true;
  }

  // ─── Build filters ────────────────────────────────────────────
  const filters: NLFilters = {};
  if (months.size > 0)
    filters.hotSalesPeriod = [...months].sort((a, b) => a - b);
  if (importanceLevels.size > 0)
    filters.importanceLevel = [...importanceLevels];
  if (platforms.size > 0)
    filters.launchPlatforms = [...platforms];
  if (statuses.size > 0)
    filters.saleStatus = [...statuses];
  if (sources.size > 0)
    filters.source = [...sources];
  if (productTypes.size > 0)
    filters.productType = [...productTypes];
  if (categoryMatches.length > 0)
    filters.companyCategoryKeyword = categoryMatches[0];
  if (onlyWithHotPeriod)
    filters.onlyWithHotPeriod = true;
  if (onlyOpsRecommended)
    filters.onlyOpsRecommended = true;

  // ─── Build display conditions ─────────────────────────────────
  const conditions: NLCondition[] = [];

  if (filters.hotSalesPeriod) {
    conditions.push({
      id: 'hotSalesPeriod',
      label: `热销月份: ${filters.hotSalesPeriod.join('、')}月`,
      filterKey: 'hotSalesPeriod',
    });
  }
  if (filters.importanceLevel) {
    conditions.push({
      id: 'importanceLevel',
      label: `重要等级: ${filters.importanceLevel.join('/')}`,
      filterKey: 'importanceLevel',
    });
  }
  if (filters.launchPlatforms) {
    const regions = filters.launchPlatforms.map((p) => p.split(':')[1]).join('、');
    conditions.push({
      id: 'launchPlatforms',
      label: `平台: ${regions}`,
      filterKey: 'launchPlatforms',
    });
  }
  if (filters.saleStatus) {
    conditions.push({
      id: 'saleStatus',
      label: `状态: ${filters.saleStatus.map((s) => SALE_STATUS_LABEL[s]).join('、')}`,
      filterKey: 'saleStatus',
    });
  }
  if (filters.source) {
    conditions.push({
      id: 'source',
      label: `来源: ${filters.source.join('、')}`,
      filterKey: 'source',
    });
  }
  if (filters.productType) {
    conditions.push({
      id: 'productType',
      label: `类型: ${filters.productType.join('、')}`,
      filterKey: 'productType',
    });
  }
  if (filters.companyCategoryKeyword) {
    conditions.push({
      id: 'companyCategoryKeyword',
      label: `类目: ${filters.companyCategoryKeyword}`,
      filterKey: 'companyCategoryKeyword',
    });
  }
  if (filters.onlyWithHotPeriod) {
    conditions.push({
      id: 'onlyWithHotPeriod',
      label: '有热销周期',
      filterKey: 'onlyWithHotPeriod',
    });
  }
  if (filters.onlyOpsRecommended) {
    conditions.push({
      id: 'onlyOpsRecommended',
      label: '运营推荐品',
      filterKey: 'onlyOpsRecommended',
    });
  }

  return { filters, conditions };
}

// ─── Apply NL filters to a product ───────────────────────────────
import type { Product } from '../../types';

export function applyNLFilters(product: Product, filters: NLFilters): boolean {
  if (
    filters.hotSalesPeriod?.length &&
    !filters.hotSalesPeriod.some((m) => product.hotSalesPeriod?.includes(m))
  )
    return false;

  if (
    filters.importanceLevel?.length &&
    (!product.importanceLevel || !filters.importanceLevel.includes(product.importanceLevel))
  )
    return false;

  if (
    filters.launchPlatforms?.length &&
    !filters.launchPlatforms.some((pl) => product.launchPlatforms.includes(pl))
  )
    return false;

  if (filters.saleStatus?.length && !filters.saleStatus.includes(product.saleStatus))
    return false;

  if (filters.source?.length && !filters.source.includes(product.source))
    return false;

  if (filters.productType?.length && !filters.productType.includes(product.productType))
    return false;

  if (
    filters.companyCategoryKeyword &&
    !product.companyCategory
      .toLowerCase()
      .includes(filters.companyCategoryKeyword.toLowerCase())
  )
    return false;

  if (filters.onlyWithHotPeriod && !product.hotSalesPeriod?.length) return false;

  if (filters.onlyOpsRecommended && !product.isOpsRecommended) return false;

  return true;
}
