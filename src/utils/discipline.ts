import { Analytics, Trade, TradeDraft, TradingRule } from "../types";

export const evaluateTrade = (draft: TradeDraft, rules: TradingRule[] = []) => {
  const requiredRuleChecks = rules
    .filter((rule) => rule.required)
    .map((rule) => ({
      pass: Boolean(draft.ruleCompliance[rule.id]),
      label: `Required rule missed: ${rule.title}`,
    }));

  const checks = [
    { pass: draft.pair.trim().length > 0, label: "Pair is missing" },
    {
      pass: draft.checklist.assetSelection,
      label: "Asset was not confirmed from the plan",
    },
    {
      pass: draft.checklist.higherTimeframeTrend !== "None",
      label: "Higher timeframe trend is not defined",
    },
    {
      pass: draft.checklist.lowerTimeframeTrend !== "None",
      label: "Lower timeframe trend is not defined",
    },
    {
      pass: draft.checklist.poiIdentified,
      label: "Point of interest is not identified",
    },
    {
      pass: draft.checklist.convictionLevel >= 6,
      label: "Conviction is below the required level of 6",
    },
    {
      pass: draft.checklist.riskAmount > 0,
      label: "Risk amount must be greater than 0",
    },
    {
      pass:
        draft.checklist.riskMode === "fixed" || draft.checklist.riskAmount <= 6,
      label: "Risk is above the 6% discipline limit",
    },
    ...requiredRuleChecks,
  ];

  const passed = checks.filter((check) => check.pass).length;
  const warnings = checks
    .filter((check) => !check.pass)
    .map((check) => check.label);
  const disciplineScore = Math.round((passed / checks.length) * 100);

  return {
    disciplineScore,
    warnings,
    valid: warnings.length === 0,
  };
};

export const getConsecutiveInvalidTrades = (trades: Trade[]) => {
  let count = 0;
  for (const trade of trades) {
    if (trade.valid) break;
    count += 1;
  }
  return count;
};

export const getAnalytics = (trades: Trade[]): Analytics => {
  const totalTrades = trades.length;
  const wins = trades.filter((trade) => trade.result === "TP").length;
  const invalidTrades = trades.filter((trade) => !trade.valid).length;
  const today = new Date().toISOString().slice(0, 10);
  const todayTrades = trades.filter((trade) => trade.date === today);
  const riskTotal = trades.reduce(
    (sum, trade) => sum + trade.checklist.riskAmount,
    0,
  );
  const disciplineTotal = trades.reduce(
    (sum, trade) => sum + trade.disciplineScore,
    0,
  );

  return {
    totalTrades,
    winRate: totalTrades ? Math.round((wins / totalTrades) * 100) : 0,
    averageRisk: totalTrades ? Number((riskTotal / totalTrades).toFixed(2)) : 0,
    ruleFollowingPercentage: totalTrades
      ? Math.round(disciplineTotal / totalTrades)
      : 0,
    invalidTrades,
    todayTrades: todayTrades.length,
    todayInvalidTrades: todayTrades.filter((trade) => !trade.valid).length,
  };
};
