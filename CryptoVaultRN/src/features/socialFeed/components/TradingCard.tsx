import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface TradeData {
  symbol: string;
  pnl: number;
  roi: number;
  leverage: number;
  positionSize: number;
  entryPrice: number;
  markPrice: number;
  positionSide?: 'LONG' | 'SHORT';
}

interface TradingCardProps {
  tradeData: TradeData;
}

const TradingCard: React.FC<TradingCardProps> = ({ tradeData }) => {
  const isProfit = tradeData.pnl >= 0;
  const colorPrice = isProfit ? '#0ECB81' : '#F6465D'; // Binance Green / Red

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.symbolRow}>
          <View style={[styles.sideBadge, { backgroundColor: isProfit ? 'rgba(14, 203, 129, 0.15)' : 'rgba(246, 70, 93, 0.15)' }]}>
            <Text style={[styles.sideText, { color: colorPrice }]}>
              {tradeData.positionSide === 'SHORT' ? 'S' : 'L'}
            </Text>
          </View>
          <Text style={styles.symbol}>{tradeData.symbol}</Text>
          <Text style={styles.perpText}>Perp</Text>
          <View style={styles.leverageBadge}>
            <Text style={styles.leverageText}>Cross {tradeData.leverage}x</Text>
          </View>
        </View>
        <Text style={styles.shareIcon}>🔗</Text>
      </View>

      {/* PnL and ROI */}
      <View style={styles.mainMetrics}>
        <View style={styles.metricCol}>
          <Text style={styles.label}>PnL (USDT)</Text>
          <Text style={[styles.pnlValue, { color: colorPrice }]}>
            {isProfit ? '+' : ''}{(Number(tradeData.pnl) || 0).toFixed(2)}
          </Text>
        </View>
        <View style={[styles.metricCol, { alignItems: 'flex-end' }]}>
          <Text style={styles.label}>ROI</Text>
          <Text style={[styles.roiValue, { color: colorPrice }]}>
            {isProfit ? '+' : ''}{(Number(tradeData.roi) || 0).toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Position Details */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Size</Text>
          <Text style={styles.valueText}>{tradeData.positionSize}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Entry Price</Text>
          <Text style={styles.valueText}>{(Number(tradeData.entryPrice) || 0).toFixed(4)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Mark Price</Text>
          <Text style={styles.valueText}>{(Number(tradeData.markPrice) || 0).toFixed(4)}</Text>
        </View>
      </View>
    </View>
  );
};

export default memo(TradingCard);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#07051A',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#1D1E4E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sideText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  symbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  perpText: {
    color: '#8F9BB3',
    fontSize: 12,
    marginRight: 6,
  },
  leverageBadge: {
    backgroundColor: '#131435',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leverageText: {
    color: '#9E86FF',
    fontSize: 11,
    fontWeight: '600',
  },
  shareIcon: {
    color: '#8F9BB3',
    fontSize: 16,
  },
  mainMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCol: {
    flex: 1,
  },
  label: {
    color: '#8F9BB3',
    fontSize: 12,
    marginBottom: 4,
  },
  pnlValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  roiValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1D1E4E',
    paddingTop: 12,
  },
  detailItem: {
    flex: 1,
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
});
