import { TradingRule } from '../types';

export const defaultRules: TradingRule[] = [
  {
    id: 'entry-asset',
    category: 'Entry Rules',
    title: 'Trade only planned assets',
    description: 'The instrument must be from the watchlist and have enough liquidity.',
    required: true
  },
  {
    id: 'entry-trend',
    category: 'Entry Rules',
    title: 'Confirm trend context',
    description: 'Higher and lower timeframe direction must be checked before entry.',
    required: true
  },
  {
    id: 'entry-poi',
    category: 'Entry Rules',
    title: 'Enter from a point of interest',
    description: 'A clear POI, imbalance, supply/demand zone, or structure level must be marked.',
    required: true
  },
  {
    id: 'risk-size',
    category: 'Risk Management Rules',
    title: 'Define risk before entry',
    description: 'Risk must be entered before saving the trade.',
    required: true
  },
  {
    id: 'risk-limit',
    category: 'Risk Management Rules',
    title: 'Respect maximum risk',
    description: 'Default max risk is 2% unless the trade has exceptional written justification.',
    required: true
  },
  {
    id: 'psych-conviction',
    category: 'Psychology Rules',
    title: 'Avoid low-conviction trades',
    description: 'Conviction below 6 is treated as an emotional or unclear setup.',
    required: true
  },
  {
    id: 'manage-notes',
    category: 'Trade Management Rules',
    title: 'Write a post-trade note',
    description: 'Record what went right or wrong immediately after the outcome.',
    required: false
  }
];

export const mistakeTags = ['FOMO', 'Early entry', 'Late exit', 'Over-risk', 'Revenge trade', 'No patience'];
