import type { AnalysisPeriod, AnalysisCustomRange, ProductDetail, SalesDataPoint } from '../types';
import { getAnalysisPeriodLabel, filterSalesDataByPeriod } from './analysisPeriod';

export type OpsRecommendationPart = { text: string; highlight?: boolean };

/** 一条建议由多段组成，highlight 段在 UI 中加粗并强调 */
export type OpsRecommendationLine = { parts: OpsRecommendationPart[] };

export function flattenOpsLine(line: OpsRecommendationLine): string {
  return line.parts.map((p) => p.text).join('');
}

function aggregateSalesByMonth(points: SalesDataPoint[]): { month: string; sales: number }[] {
  const map = new Map<string, number>();
  for (const p of points) {
    map.set(p.month, (map.get(p.month) ?? 0) + p.sales);
  }
  return [...map.entries()]
    .map(([month, sales]) => ({ month, sales }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function pctChange(prev: number, next: number): number | null {
  if (prev <= 0) return null;
  return ((next - prev) / prev) * 100;
}

/**
 * 根据当前产品标签、口径内销量、评论 VOC、关键词分析归纳运营建议（可解释、可追溯至上述模块）。
 */
export function buildOpsRecommendations(
  product: ProductDetail,
  period: AnalysisPeriod,
  customRange: AnalysisCustomRange = null,
): OpsRecommendationLine[] {
  const periodLabel = getAnalysisPeriodLabel(period, customRange);
  const lines: OpsRecommendationLine[] = [];

  const attrTags = product.tags.filter((t) => t.category === 'attribute').map((t) => t.text);
  const marketTags = product.tags.filter((t) => t.category === 'market').map((t) => t.text);
  const attrSample = attrTags.slice(0, 5);
  const marketSample = marketTags.slice(0, 3);
  if (attrSample.length > 0 || marketSample.length > 0) {
    const parts: OpsRecommendationPart[] = [{ text: '结合产品标签（' }];
    if (attrSample.length > 0) {
      parts.push({
        text: `属性向标签「${attrSample.join('、')}」`,
        highlight: true,
      });
    }
    if (attrSample.length > 0 && marketSample.length > 0) {
      parts.push({ text: '；' });
    }
    if (marketSample.length > 0) {
      parts.push({
        text: `场景向标签「${marketSample.join('、')}」`,
        highlight: true,
      });
    }
    parts.push({
      text: '），建议在 Listing、主图与广告创意中与标签表述一致，避免卖点与评论预期脱节。',
    });
    lines.push({ parts });
  }

  const filteredSales = filterSalesDataByPeriod(product.salesData, period, customRange);
  const series = aggregateSalesByMonth(filteredSales);
  const totalInPeriod = series.reduce((s, r) => s + r.sales, 0);
  if (series.length >= 2) {
    const last = series[series.length - 1];
    const prev = series[series.length - 2];
    const ch = pctChange(prev.sales, last.sales);
    if (ch != null) {
      const dir = ch > 1 ? '上升' : ch < -1 ? '回落' : '基本持平';
      lines.push({
        parts: [
          { text: `在${periodLabel}口径下，口径内总销量约 ` },
          { text: `${totalInPeriod.toLocaleString()} 单`, highlight: true },
          { text: '；最近完整月（' },
          { text: last.month, highlight: true },
          { text: '）较上月 ' },
          { text: dir, highlight: true },
          { text: '约 ' },
          { text: `${Math.abs(ch).toFixed(1)}%`, highlight: true },
          { text: '，可对照库存与促销节奏做滚动备货与投放。' },
        ],
      });
    } else {
      lines.push({
        parts: [
          { text: `在${periodLabel}口径下，口径内总销量约 ` },
          { text: `${totalInPeriod.toLocaleString()} 单`, highlight: true },
          { text: '（汇总各月），建议结合「销量分析」看来源与地区结构。' },
        ],
      });
    }
  } else if (series.length === 1) {
    lines.push({
      parts: [
        { text: `在${periodLabel}口径下，可见月份销量约 ` },
        { text: `${series[0].sales.toLocaleString()} 单`, highlight: true },
        { text: '（' },
        { text: series[0].month, highlight: true },
        { text: '），数据覆盖较窄时可放宽口径或等待更多账期。' },
      ],
    });
  }

  const neg = [...product.reviewAnalysis.negativeTags].sort((a, b) => b.count - a.count)[0];
  if (neg) {
    lines.push({
      parts: [
        { text: '评论 VOC 中' },
        { text: `「${neg.text}」`, highlight: true },
        { text: '提及相对集中（约 ' },
        { text: `${neg.count} 条`, highlight: true },
        { text: '），建议优先排查品控、包装或详情页是否对该痛点说明不足。' },
      ],
    });
  }

  const pos = [...product.reviewAnalysis.positiveTags].sort((a, b) => b.count - a.count)[0];
  if (pos) {
    lines.push({
      parts: [
        { text: '正向 VOC 中' },
        { text: `「${pos.text}」`, highlight: true },
        { text: '反馈突出（约 ' },
        { text: `${pos.count} 条`, highlight: true },
        { text: '），适合作为图文/A+与短视频的主打话术，并在广告中做一致性强化。' },
      ],
    });
  }

  const kwSorted = [...product.keywords].sort((a, b) => b.orders - a.orders);
  const topKw = kwSorted.slice(0, 2).filter((k) => k.orders > 0);
  if (topKw.length > 0) {
    const parts: OpsRecommendationPart[] = [{ text: '以 ' }];
    topKw.forEach((k, i) => {
      if (i > 0) parts.push({ text: '、' });
      parts.push({ text: `「${k.keyword}」`, highlight: true });
    });
    parts.push({
      text: ' 等为主力词（按订单量），建议保住核心词排名并系统扩展邻近长尾，',
    });
    parts.push({
      text: '避免过度依赖单一词根',
      highlight: true,
    });
    parts.push({ text: '。' });
    lines.push({ parts });
  }

  const highAcos = kwSorted.find((k) => k.orders >= 100 && k.acos >= 24);
  if (highAcos) {
    lines.push({
      parts: [
        { text: '「' },
        { text: highAcos.keyword, highlight: true },
        { text: '」已有一定出单（' },
        { text: `${highAcos.orders} 单`, highlight: true },
        { text: '）但 ACOS 约 ' },
        { text: `${highAcos.acos.toFixed(1)}%`, highlight: true },
        { text: '，建议复查出价、详情页转化与搜索词否词，' },
        { text: '避免利润被广告稀释', highlight: true },
        { text: '。' },
      ],
    });
  }

  const lowCtr = kwSorted.find(
    (k) => k.impressions >= 20000 && k.clicks > 0 && k.orders > 0 && k.clicks / k.impressions < 0.025,
  );
  if (lowCtr) {
    const ctr = ((lowCtr.clicks / lowCtr.impressions) * 100).toFixed(2);
    lines.push({
      parts: [
        { text: '「' },
        { text: lowCtr.keyword, highlight: true },
        { text: '」曝光较高但 CTR 约 ' },
        { text: `${ctr}%`, highlight: true },
        { text: '，可尝试主图/标题与词义对齐度，或区分品牌词与泛词投放结构。' },
      ],
    });
  }

  const unique: OpsRecommendationLine[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const k = flattenOpsLine(line);
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(line);
  }

  return unique.slice(0, 8);
}
