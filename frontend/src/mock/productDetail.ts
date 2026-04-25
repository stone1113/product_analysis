import type { ProductDetail, SalesSource, SalesRegion } from '../types';

// ── 日级销售数据生成器 ────────────────────────────────────────────────
// 每月总量基准（与原月度数据一致）
const MONTHLY_TOTALS: { month: string; sales: number; revenue: number; returnRate: number }[] = [
  { month: '2022-01', sales: 620,  revenue: 18598,  returnRate: 0.048 },
  { month: '2022-02', sales: 580,  revenue: 17398,  returnRate: 0.051 },
  { month: '2022-03', sales: 710,  revenue: 21298,  returnRate: 0.045 },
  { month: '2022-04', sales: 760,  revenue: 22798,  returnRate: 0.042 },
  { month: '2022-05', sales: 820,  revenue: 24598,  returnRate: 0.039 },
  { month: '2022-06', sales: 900,  revenue: 26998,  returnRate: 0.041 },
  { month: '2022-07', sales: 980,  revenue: 29398,  returnRate: 0.038 },
  { month: '2022-08', sales: 1050, revenue: 31498,  returnRate: 0.036 },
  { month: '2022-09', sales: 1100, revenue: 32998,  returnRate: 0.035 },
  { month: '2022-10', sales: 1250, revenue: 37498,  returnRate: 0.033 },
  { month: '2022-11', sales: 1480, revenue: 44398,  returnRate: 0.040 },
  { month: '2022-12', sales: 1620, revenue: 48598,  returnRate: 0.044 },
  { month: '2023-01', sales: 1050, revenue: 31498,  returnRate: 0.043 },
  { month: '2023-02', sales: 980,  revenue: 29398,  returnRate: 0.041 },
  { month: '2023-03', sales: 1100, revenue: 32998,  returnRate: 0.038 },
  { month: '2023-04', sales: 1200, revenue: 35988,  returnRate: 0.036 },
  { month: '2023-05', sales: 1450, revenue: 43486,  returnRate: 0.034 },
  { month: '2023-06', sales: 1680, revenue: 50383,  returnRate: 0.032 },
  { month: '2023-07', sales: 1920, revenue: 57581,  returnRate: 0.031 },
  { month: '2023-08', sales: 2100, revenue: 62979,  returnRate: 0.030 },
  { month: '2023-09', sales: 2350, revenue: 70476,  returnRate: 0.029 },
  { month: '2023-10', sales: 2580, revenue: 77394,  returnRate: 0.028 },
  { month: '2023-11', sales: 3100, revenue: 92969,  returnRate: 0.033 },
  { month: '2023-12', sales: 3600, revenue: 107964, returnRate: 0.037 },
  { month: '2024-01', sales: 2800, revenue: 83972,  returnRate: 0.035 },
  { month: '2024-02', sales: 2950, revenue: 88481,  returnRate: 0.033 },
  { month: '2024-03', sales: 3200, revenue: 95960,  returnRate: 0.031 },
  { month: '2024-04', sales: 3380, revenue: 101388, returnRate: 0.030 },
  { month: '2024-05', sales: 3550, revenue: 106488, returnRate: 0.028 },
  { month: '2024-06', sales: 3720, revenue: 111588, returnRate: 0.027 },
  { month: '2024-07', sales: 3900, revenue: 116988, returnRate: 0.026 },
  { month: '2024-08', sales: 4100, revenue: 122988, returnRate: 0.025 },
  { month: '2024-09', sales: 4350, revenue: 130488, returnRate: 0.024 },
  { month: '2024-10', sales: 4600, revenue: 137988, returnRate: 0.023 },
  { month: '2024-11', sales: 5200, revenue: 155988, returnRate: 0.028 },
  { month: '2024-12', sales: 5800, revenue: 173988, returnRate: 0.031 },
  { month: '2025-01', sales: 4200, revenue: 125988, returnRate: 0.034 },
  { month: '2025-02', sales: 3900, revenue: 116988, returnRate: 0.032 },
  { month: '2025-03', sales: 4500, revenue: 134988, returnRate: 0.030 },
  { month: '2025-04', sales: 4800, revenue: 143988, returnRate: 0.029 },
  { month: '2025-05', sales: 5100, revenue: 152988, returnRate: 0.027 },
  { month: '2025-06', sales: 5400, revenue: 161988, returnRate: 0.026 },
  { month: '2025-07', sales: 5700, revenue: 170988, returnRate: 0.025 },
  { month: '2025-08', sales: 6000, revenue: 179988, returnRate: 0.024 },
  { month: '2025-09', sales: 6300, revenue: 188988, returnRate: 0.023 },
  { month: '2025-10', sales: 6600, revenue: 197988, returnRate: 0.022 },
  { month: '2025-11', sales: 7200, revenue: 215988, returnRate: 0.026 },
  { month: '2025-12', sales: 7800, revenue: 233988, returnRate: 0.030 },
  { month: '2026-01', sales: 5800, revenue: 173988, returnRate: 0.032 },
  { month: '2026-02', sales: 5500, revenue: 164988, returnRate: 0.030 },
  { month: '2026-03', sales: 6100, revenue: 182988, returnRate: 0.028 },
  { month: '2026-04', sales: 3200, revenue: 95988,  returnRate: 0.027 },
];

const SPLITS: { source: SalesSource; region: SalesRegion; ratio: number }[] = [
  { source: 'amazon',      region: 'us',             ratio: 0.24 },
  { source: 'amazon',      region: 'europe',         ratio: 0.16 },
  { source: 'amazon',      region: 'japan',          ratio: 0.13 },
  { source: 'amazon',      region: 'germany',        ratio: 0.08 },
  { source: 'amazon',      region: 'uk',             ratio: 0.07 },
  { source: 'independent', region: 'southeast_asia', ratio: 0.14 },
  { source: 'independent', region: 'japan',          ratio: 0.08 },
  { source: 'independent', region: 'europe',         ratio: 0.06 },
  { source: 'independent', region: 'other',          ratio: 0.04 },
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// 将月度数据拆分为日级数据，每日销量带随机波动
const SALES_DATA = MONTHLY_TOTALS.flatMap((m) => {
  const [y, mo] = m.month.split('-').map(Number);
  const days = daysInMonth(y, mo);
  // 生成权重（周末稍高）
  const weights = Array.from({ length: days }, (_, i) => {
    const dow = new Date(y, mo - 1, i + 1).getDay();
    return dow === 0 || dow === 6 ? 1.3 : 1.0;
  });
  const weightSum = weights.reduce((a, b) => a + b, 0);

  return SPLITS.flatMap((s) => {
    const monthSales   = Math.round(m.sales   * s.ratio);
    const monthRevenue = Math.round(m.revenue * s.ratio);
    // 每月退损率在基准上加小随机扰动（来源/地区略有差异）
    const baseReturn = m.returnRate + (s.source === 'independent' ? 0.005 : 0);

    return Array.from({ length: days }, (_, i) => {
      const day     = i + 1;
      const dateStr = `${y}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const w       = weights[i] / weightSum;
      // 给销量加小随机抖动（±15%），使日级图表更真实
      const jitter  = 0.85 + Math.abs(Math.sin(y * 31 + mo * 7 + day * 3 + s.ratio * 100)) * 0.30;
      const daySales   = Math.max(0, Math.round(monthSales   * w * days * jitter));
      const dayRevenue = Math.max(0, Math.round(monthRevenue * w * days * jitter));
      const dayReturn  = Math.max(0, Math.min(0.15,
        baseReturn + (Math.sin(day * 0.7 + mo) * 0.008),
      ));
      return {
        date:       dateStr,
        source:     s.source,
        region:     s.region,
        sales:      daySales,
        revenue:    dayRevenue,
        returnRate: Math.round(dayReturn * 10000) / 10000,
      };
    });
  });
});

export const mockProductDetail: ProductDetail = {
  // ── ERP 管理字段 ──────────────────────────────
  id: '25634',
  companyId: 'NS25634',
  name: '无线蓝牙耳机主动降噪TWS半入耳式运动耳机',
  companyCategory: '电商>>电子>>耳机',
  sku: 'NS25634-88021',
  initialPrice: 128.00,
  purchaseCost: 45.80,
  productType: '运营品',
  launchPlatforms: ['shopee:TW', 'shopee:PH', 'shopee:MY', 'shopee:SG'],
  creator: '张明',
  developer: '张明',
  source: '速卖通',
  saleStatus: 'push-success',
  isFBAStock: true,
  isOldProduct: false,
  isOpsRecommended: true,
  hasCertificate: true,
  devCompletionTime: '2026-04-10 16:30:00',
  createdAt: '2026-04-10 09:00:00',
  updatedAt: '2026-04-22 11:45:20',
  standardLibCreatedAt: '2026-04-11 08:30:00',

  // ── 分析字段 ──────────────────────────────────
  asin: 'B09XK7L4NQ',
  category: '电子配件',
  price: 29.99,
  currency: 'USD',
  rating: 4.5,
  reviewCount: 2847,
  monthlySales: 3200,
  monthlyRevenue: 95960,
  lifecycle: 'growth',
  status: 'active',
  launchDate: '2023-04-10',

  // ── 产品详细信息 ─────────────────────────────
  description:
    '专业级主动降噪蓝牙耳机，采用最新一代降噪芯片，有效隔离 90% 以上环境噪音。搭载 Ø11mm 定制动圈单元，声场宽广，低频有力，高频通透。续航时间长达 30 小时，配合充电盒可达 120 小时。支持快充，充电 10 分钟即可播放 2 小时。',
  bulletPoints: [
    '主动降噪（ANC）：最高降噪深度 -35dB，有效过滤噪音',
    '超长续航：单次续航 30H，携带充电盒可达 120H',
    '快充支持：充电 10 分钟使用 2 小时',
    '多设备连接：同时连接 2 台设备，无缝切换',
    '通话降噪：6 麦克风 ENC 通话降噪，清晰还原人声',
    'IPX5 防水：轻松应对汗水与小雨',
  ],
  weight: '56g（含充电盒 220g）',
  dimensions: '充电盒：62×48×32mm',
  material: '医用级硅胶耳帽 + 工程塑料外壳',
  color: '曜石黑 / 珍珠白 / 天空蓝',
  rankCategory: 'Electronics > Headphones',
  bsr: 1240,
  variationCount: 3,
  fulfillmentType: 'FBA',

  // ── 销量趋势（近 12 个月）───────────────────
  salesData: SALES_DATA,

  // ── 评论分析 ──────────────────────────────────
  reviewAnalysis: {
    averageRating: 4.5,
    totalReviews: 2847,
    ratingDistribution: [
      { stars: 5, count: 1652, percentage: 58 },
      { stars: 4, count: 683, percentage: 24 },
      { stars: 3, count: 313, percentage: 11 },
      { stars: 2, count: 114, percentage: 4 },
      { stars: 1, count: 85, percentage: 3 },
    ],
    positiveTags: [
      { text: '音质出色', count: 834, sentiment: 'positive' },
      { text: '佩戴舒适', count: 712, sentiment: 'positive' },
      { text: '续航持久', count: 623, sentiment: 'positive' },
      { text: '连接稳定', count: 541, sentiment: 'positive' },
      { text: '降噪效果好', count: 489, sentiment: 'positive' },
      { text: '做工精致', count: 376, sentiment: 'positive' },
      { text: '性价比高', count: 298, sentiment: 'positive' },
    ],
    negativeTags: [
      { text: '充电盒做工一般', count: 156, sentiment: 'negative' },
      { text: '偶尔断连', count: 124, sentiment: 'negative' },
      { text: '低频不够劲', count: 98, sentiment: 'negative' },
      { text: 'APP功能少', count: 67, sentiment: 'negative' },
    ],
    recentReviews: [
      {
        id: 'R001',
        author: 'John M.',
        rating: 5,
        date: '2024-03-18',
        title: "Best budget ANC earbuds I've tried!",
        content:
          "I've owned many pairs of earbuds and these are by far the best value. The noise cancellation is impressive for the price point. Battery life is amazing.",
        verified: true,
        helpful: 45,
        sentiment: 'positive',
      },
      {
        id: 'R002',
        author: 'Sarah K.',
        rating: 4,
        date: '2024-03-15',
        title: 'Great sound, minor connectivity issues',
        content:
          'Sound quality is excellent and the ANC works well. Had a few dropouts when more than 5 meters from my phone, but overall very satisfied.',
        verified: true,
        helpful: 28,
        sentiment: 'positive',
      },
      {
        id: 'R003',
        author: 'Mike L.',
        rating: 3,
        date: '2024-03-10',
        title: 'Decent earbuds, charging case feels cheap',
        content:
          'The earbuds themselves are great but the charging case hinge feels flimsy. I worry about its long-term durability.',
        verified: true,
        helpful: 19,
        sentiment: 'neutral',
      },
      {
        id: 'R004',
        author: 'Emily R.',
        rating: 5,
        date: '2024-03-08',
        title: 'Perfect for commuting!',
        content:
          'Use these every day on my subway commute. The ANC blocks out most of the train noise. Call quality is also very clear.',
        verified: true,
        helpful: 33,
        sentiment: 'positive',
      },
      {
        id: 'R005',
        author: 'David W.',
        rating: 2,
        date: '2024-03-05',
        title: 'Disappointing bass response',
        content:
          'Expected more bass punch from these. The mids and highs are good but bass lovers will be disappointed. ANC is decent though.',
        verified: false,
        helpful: 12,
        sentiment: 'negative',
      },
    ],
  },

  // ── 广告关键词 ────────────────────────────────
  keywords: [
    {
      id: 'KW001',
      keyword: 'bluetooth earbuds',
      nativeLabel: '蓝牙耳塞',
      impressions: 125000,
      clicks: 3750,
      orders: 890,
      conversion: 23.7,
      acos: 18.5,
      spend: 2812,
      revenue: 15207,
      cpc: 0.75,
    },
    {
      id: 'KW002',
      keyword: 'wireless earphones',
      nativeLabel: '无线耳机',
      impressions: 89000,
      clicks: 2670,
      orders: 623,
      conversion: 23.3,
      acos: 21.2,
      spend: 2270,
      revenue: 10712,
      cpc: 0.85,
    },
    {
      id: 'KW003',
      keyword: 'noise cancelling earbuds',
      nativeLabel: '降噪耳塞',
      impressions: 67000,
      clicks: 2010,
      orders: 445,
      conversion: 22.1,
      acos: 24.8,
      spend: 3326,
      revenue: 13408,
      cpc: 1.65,
    },
    {
      id: 'KW004',
      keyword: 'true wireless earbuds',
      nativeLabel: '真无线耳塞',
      impressions: 45000,
      clicks: 1350,
      orders: 298,
      conversion: 22.1,
      acos: 19.6,
      spend: 1755,
      revenue: 8951,
      cpc: 1.30,
    },
    {
      id: 'KW005',
      keyword: 'earbuds for iphone',
      nativeLabel: '适用于 iPhone 的耳塞',
      impressions: 38000,
      clicks: 1140,
      orders: 241,
      conversion: 21.1,
      acos: 22.3,
      spend: 1596,
      revenue: 7156,
      cpc: 1.40,
    },
    {
      id: 'KW006',
      keyword: 'sport earbuds',
      nativeLabel: '运动耳塞',
      impressions: 29000,
      clicks: 870,
      orders: 178,
      conversion: 20.5,
      acos: 26.1,
      spend: 1392,
      revenue: 5337,
      cpc: 1.60,
    },
    {
      id: 'KW007',
      keyword: 'budget wireless earbuds',
      nativeLabel: '平价无线耳塞',
      impressions: 22000,
      clicks: 660,
      orders: 143,
      conversion: 21.7,
      acos: 17.8,
      spend: 726,
      revenue: 4079,
      cpc: 1.10,
    },
    {
      id: 'KW008',
      keyword: 'earbuds with microphone',
      nativeLabel: '带麦克风耳塞',
      impressions: 19000,
      clicks: 570,
      orders: 118,
      conversion: 20.7,
      acos: 23.4,
      spend: 826,
      revenue: 3539,
      cpc: 1.45,
    },
  ],

  // ── 产品标签 ──────────────────────────────────
  tags: [
    // 产品属性
    { id: 'T001', text: '主动降噪 ANC', category: 'attribute' },
    { id: 'T002', text: 'IPX5防水', category: 'attribute' },
    { id: 'T003', text: '10分钟快充', category: 'attribute' },
    { id: 'T004', text: '多设备连接', category: 'attribute' },
    { id: 'T005', text: '蓝牙5.3', category: 'attribute' },
    { id: 'T006', text: '30H续航', category: 'attribute' },
    { id: 'T007', text: '半入耳设计', category: 'attribute' },
    { id: 'T008', text: '6麦降噪通话', category: 'attribute' },
    { id: 'T009', text: 'CNC铝合金充电盒', category: 'attribute' },
    // 市场场景
    { id: 'T010', text: '通勤首选', category: 'market' },
    { id: 'T011', text: '运动健身', category: 'market' },
    { id: 'T012', text: '居家办公', category: 'market' },
    { id: 'T013', text: '礼品市场', category: 'market' },
    { id: 'T014', text: '学生党', category: 'market' },
    { id: 'T015', text: '商务人士', category: 'market' },
    // 竞品参照
    { id: 'T016', text: 'Anker Q45', category: 'competitor' },
    { id: 'T017', text: 'JLab Go Air', category: 'competitor' },
    { id: 'T018', text: 'EarFun Air Pro', category: 'competitor' },
    // 运营自定义
    { id: 'T019', text: '爆款潜力', category: 'custom' },
    { id: 'T020', text: '重点备货', category: 'custom' },
    { id: 'T021', text: 'Q4旺季品', category: 'custom' },
  ],

  // ── 竞品参照 ──────────────────────────────────
  competitors: [
    {
      name: 'Anker Q45',
      price: 55.99,
      specs: ['主动降噪', '60H续航', '蓝牙5.3', '折叠设计', '多设备连接'],
    },
    {
      name: 'JLab Go Air',
      price: 24.88,
      specs: ['IPX5防水', '32H续航', '蓝牙5.3', '多设备连接'],
    },
    {
      name: 'EarFun Air Pro',
      price: 49.99,
      specs: ['主动降噪', 'IPX5防水', '6麦降噪通话', '蓝牙5.3', '快充', '多设备连接'],
    },
  ],

  // ── 生命周期评估 ─────────────────────────────
  lifecycleAssessment: {
    stage: 'growth',
    score: 38,
    indicators: {
      salesMomChangePercent: 11.5,
      positiveReviewRatePercent: 82,
      positiveReviewRateMom: 'up',
    },
    recommendations: [],
  },
};
