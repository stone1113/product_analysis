// ────────────────────────────────────────────────
// 在售状态
// ────────────────────────────────────────────────
export type SaleStatus =
  | 'push-success'   // 推送成功
  | 'push-failed'    // 推送失败
  | 'pushing'        // 推送中
  | 'pending'        // 待推送
  | 'removed';       // 已下架

export const SALE_STATUS_LABEL: Record<SaleStatus, string> = {
  'push-success': '推送成功',
  'push-failed':  '推送失败',
  'pushing':      '推送中',
  'pending':      '待推送',
  'removed':      '已下架',
};

export const SALE_STATUS_COLOR: Record<SaleStatus, string> = {
  'push-success': 'success',
  'push-failed':  'error',
  'pushing':      'processing',
  'pending':      'warning',
  'removed':      'default',
};

// ────────────────────────────────────────────────
// 统一分析口径
// ────────────────────────────────────────────────
export type AnalysisPeriod =
  | 'last7'
  | 'last30'
  | 'thisMonth'
  | 'monthBeforeLast'
  | 'custom';

/** 自定义口径：闭区间 yyyy-MM-dd，仅当 period === 'custom' 时有效 */
export type AnalysisCustomRange = [string, string] | null;

// ────────────────────────────────────────────────
// 生命周期阶段
// ────────────────────────────────────────────────
export type LifecycleStage = 'introduction' | 'growth' | 'maturity' | 'decline';

export const LIFECYCLE_LABEL: Record<LifecycleStage, string> = {
  introduction: '导入期',
  growth: '成长期',
  maturity: '成熟期',
  decline: '衰退期',
};

export const LIFECYCLE_COLOR: Record<LifecycleStage, string> = {
  introduction: '#722ed1',
  growth: '#52c41a',
  maturity: '#faad14',
  decline: '#ff4d4f',
};

// ────────────────────────────────────────────────
// 产品列表项（含 ERP 管理字段）
// ────────────────────────────────────────────────
export interface Product {
  // ── ERP 管理字段 ──
  id: string;                      // 公库ID
  companyId: string;               // 公司ID（如 NS25580）
  name: string;                    // 产品名称
  imageUrl?: string;
  companyCategory: string;         // 公司分类（如 电商>>家居>>大家居）
  sku: string;                     // SKU
  initialPrice: number;            // 初售价格（¥）
  purchaseCost?: number;           // 采购成本（¥）
  productType: string;             // 产品类型
  launchPlatforms: string[];       // 开品平台（如 ["shopee:TW","shopee:PH"]）
  creator: string;                 // 创建人
  developer: string;               // 开发员
  source: string;                  // 开品来源（如 1688、速卖通）
  saleStatus: SaleStatus;          // 在售状态
  isFBAStock: boolean;             // FBA 备货品
  isOldProduct: boolean;           // 是否为老品标识
  isOpsRecommended: boolean;       // 是否运营推荐品
  hasCertificate: boolean;         // 是否有证书
  devCompletionTime?: string;      // 开发完成时间
  createdAt: string;               // 创建时间
  updatedAt: string;               // 更新时间
  standardLibCreatedAt?: string;   // 标准库创建时间

  // ── 运营扩展字段 ──
  salesTags?: string[];          // 销售标签
  hotSalesPeriod?: number[];     // 热销周期（月份，如 [2,3]）
  hotSalesKeywords?: number;     // 热销关键词数量
  importanceLevel?: string;      // 重要等级（核心 / 重要 / 一般 / 低优）
  processName?: string;          // 流程名称

  // ── 分析字段（详情页使用）──
  asin: string;
  category: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  monthlySales: number;
  monthlyRevenue: number;
  lifecycle: LifecycleStage;
  status: 'active' | 'inactive';
  launchDate: string;
}

// ────────────────────────────────────────────────
// 销量数据点
// ────────────────────────────────────────────────
export type SalesSource = 'amazon' | 'independent';
export type SalesRegion = 'us' | 'europe' | 'japan' | 'germany' | 'uk' | 'southeast_asia' | 'other';

export const SALES_SOURCE_LABEL: Record<SalesSource, string> = {
  amazon: 'Amazon',
  independent: '独立站',
};

export const SALES_REGION_LABEL: Record<SalesRegion, string> = {
  us: '美国',
  europe: '欧洲',
  japan: '日本',
  germany: '德国',
  uk: '英国',
  southeast_asia: '东南亚',
  other: '其他',
};

export interface SalesDataPoint {
  date: string;   // "2024-01-15"
  source: SalesSource;
  region: SalesRegion;
  sales: number;
  revenue: number;
  returnRate: number; // 0~1，退损率合计
}

// ────────────────────────────────────────────────
// 评分分布
// ────────────────────────────────────────────────
export interface RatingDistribution {
  stars: number;
  count: number;
  percentage: number;
}

// ────────────────────────────────────────────────
// 评论标签
// ────────────────────────────────────────────────
export interface ReviewTag {
  text: string;
  count: number;
  sentiment: 'positive' | 'negative';
}

// ────────────────────────────────────────────────
// 评论条目
// ────────────────────────────────────────────────
export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

// ────────────────────────────────────────────────
// 评论分析汇总
// ────────────────────────────────────────────────
export interface ReviewAnalysis {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution[];
  positiveTags: ReviewTag[];
  negativeTags: ReviewTag[];
  recentReviews: ReviewItem[];
}

export interface Keyword {
  id: string;
  /** 站点原文（如英文、日文搜索词） */
  keyword: string;
  /** 母语对照（如中文），与 keyword 双语展示；接口未返回时可省略 */
  nativeLabel?: string;
  impressions: number;
  clicks: number;
  orders: number;
  conversion: number;   // 转化率 %
  acos: number;         // 广告费用销售比 %
  spend: number;        // 广告花费 USD
  revenue: number;      // 广告收入 USD
  cpc: number;          // 单次点击成本
}

// ────────────────────────────────────────────────
// 竞品
// ────────────────────────────────────────────────
export interface Competitor {
  name: string;
  price: number;
  specs: string[];                       // 竞品具备的属性关键词
}

// ────────────────────────────────────────────────
// 产品标签
// ────────────────────────────────────────────────
export type TagCategory = 'attribute' | 'market' | 'competitor' | 'custom';

export interface ProductTag {
  id: string;
  text: string;
  category: TagCategory;
  color?: string;
}

// ────────────────────────────────────────────────
// 生命周期评估
// ────────────────────────────────────────────────
/** 好评率等指标相对上一完整自然月的环比方向 */
export type ReviewRateMomDirection = 'up' | 'down' | 'flat';

/** 可由数据侧直接给出的运营趋势 */
export interface LifecycleIndicators {
  /** 销量按月环比变化率（%）：相对上一完整自然月，正为上升、负为下降 */
  salesMomChangePercent: number;
  /**
   * 好评率（%），口径由后端约定（如 4★+5★ 占比）
   */
  positiveReviewRatePercent: number;
  /** 好评率相对上一完整自然月的环比方向 */
  positiveReviewRateMom: ReviewRateMomDirection;
}

export interface LifecycleAssessment {
  stage: LifecycleStage;
  /** 0–100，示意曲线打点 */
  score: number;
  indicators: LifecycleIndicators;
  recommendations?: string[];
}

// ────────────────────────────────────────────────
// 产品详情（扩展自列表项）
// ────────────────────────────────────────────────
export interface ProductDetail extends Product {
  description: string;
  bulletPoints: string[];
  weight: string;
  dimensions: string;
  material: string;
  color: string;
  rankCategory: string;
  bsr: number;                           // Best Seller Rank
  variationCount: number;
  fulfillmentType: 'FBA' | 'FBM';

  salesData: SalesDataPoint[];
  reviewAnalysis: ReviewAnalysis;
  keywords: Keyword[];
  tags: ProductTag[];
  competitors: Competitor[];
  lifecycleAssessment: LifecycleAssessment;
}
