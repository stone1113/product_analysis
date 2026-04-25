import type { AnalysisPeriod, AnalysisCustomRange, SalesDataPoint } from '../types';

export const ANALYSIS_PERIOD_LABEL: Record<AnalysisPeriod, string> = {
  last7: '近7天',
  last30: '近30天',
  thisMonth: '本月',
  monthBeforeLast: '上上月',
  custom: '自定义时间范围',
};

export const ANALYSIS_PERIOD_OPTIONS: { label: string; value: AnalysisPeriod }[] = [
  { label: ANALYSIS_PERIOD_LABEL.last7, value: 'last7' },
  { label: ANALYSIS_PERIOD_LABEL.last30, value: 'last30' },
  { label: ANALYSIS_PERIOD_LABEL.thisMonth, value: 'thisMonth' },
  { label: ANALYSIS_PERIOD_LABEL.monthBeforeLast, value: 'monthBeforeLast' },
  { label: ANALYSIS_PERIOD_LABEL.custom, value: 'custom' },
];

export function getAnalysisPeriodLabel(
  period: AnalysisPeriod,
  customRange: AnalysisCustomRange,
): string {
  if (period === 'custom' && customRange) {
    return `${customRange[0]} ~ ${customRange[1]}`;
  }
  return ANALYSIS_PERIOD_LABEL[period];
}

function itemYm(p: SalesDataPoint): string {
  return p.date.slice(0, 7); // "YYYY-MM"
}

function latestYm(salesData: SalesDataPoint[]): string {
  return salesData.reduce((max, p) => {
    const ym = itemYm(p);
    return ym > max ? ym : max;
  }, itemYm(salesData[0]!));
}

function monthBounds(ym: string): { start: Date; end: Date } {
  const [y, m] = ym.split('-').map(Number);
  return {
    start: new Date(y, m - 1, 1, 0, 0, 0, 0),
    end:   new Date(y, m, 0, 23, 59, 59, 999),
  };
}

function addMonthsToYm(ym: string, delta: number): string {
  const [y, mo] = ym.split('-').map(Number);
  const d = new Date(y, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function formatYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function endOfLatestData(salesData: SalesDataPoint[]): Date {
  return monthBounds(latestYm(salesData)).end;
}

export function defaultCustomRangeForData(salesData: SalesDataPoint[]): [string, string] {
  if (salesData.length === 0) {
    const end = new Date();
    return [formatYmd(addDays(end, -30)), formatYmd(end)];
  }
  const end = endOfLatestData(salesData);
  return [formatYmd(addDays(end, -30)), formatYmd(end)];
}

function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function dateInRange(dateStr: string, rangeStart: Date, rangeEnd: Date): boolean {
  const d = parseYmd(dateStr);
  return d >= rangeStart && d <= rangeEnd;
}

export function filterSalesDataByPeriod(
  salesData: SalesDataPoint[],
  period: AnalysisPeriod,
  customRange: AnalysisCustomRange = null,
): SalesDataPoint[] {
  if (salesData.length === 0) return [];

  const thisYm    = latestYm(salesData);
  const anchorEnd = endOfLatestData(salesData);

  if (period === 'custom') {
    if (!customRange) return salesData;
    let rs = parseYmd(customRange[0]);
    let re = parseYmd(customRange[1]);
    if (re < rs) [rs, re] = [re, rs];
    re = new Date(re.getFullYear(), re.getMonth(), re.getDate(), 23, 59, 59, 999);
    return salesData.filter((item) => dateInRange(item.date, rs, re));
  }

  if (period === 'thisMonth') {
    return salesData.filter((item) => itemYm(item) === thisYm);
  }

  if (period === 'monthBeforeLast') {
    const targetYm = addMonthsToYm(thisYm, -2);
    return salesData.filter((item) => itemYm(item) === targetYm);
  }

  if (period === 'last7') {
    const rangeStart = addDays(anchorEnd, -6);
    rangeStart.setHours(0, 0, 0, 0);
    return salesData.filter((item) => dateInRange(item.date, rangeStart, anchorEnd));
  }

  if (period === 'last30') {
    const rangeStart = addDays(anchorEnd, -29);
    rangeStart.setHours(0, 0, 0, 0);
    return salesData.filter((item) => dateInRange(item.date, rangeStart, anchorEnd));
  }

  return salesData;
}
