// screens/CarStats.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, ScrollView } from 'react-native';

const BASE_URL = Platform.select({
  android: 'http://192.168.1.110:3001',
  ios: 'http://192.168.1.110:3001',
  web: 'http://192.168.1.110:3001',
  default: 'http://192.168.1.110:3001',
});

export default function CarStats() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const currency = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/cars`);
        const data = await res.json();
        setCars(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={s.loadingText}>Loading stats...</Text>
      </View>
    );
  }

  const count = cars.length || 0;
  const avgPrice = count ? cars.reduce((a, c) => a + Number(c.price || 0), 0) / count : 0;
  const maxHp = cars.reduce((m, c) => Math.max(m, Number(c.horsepower || 0)), 0);
  const minPrice = count ? Math.min(...cars.map(c => Number(c.price || 0))) : 0;
  const maxPrice = count ? Math.max(...cars.map(c => Number(c.price || 0))) : 0;
  const totalValue = cars.reduce((a, c) => a + Number(c.price || 0), 0);
  
  const fastest = cars.slice().sort((a, b) => Number(b.horsepower) - Number(a.horsepower))[0];
  const mostExpensive = cars.slice().sort((a, b) => Number(b.price) - Number(a.price))[0];
  const cheapest = cars.slice().sort((a, b) => Number(a.price) - Number(b.price))[0];

  return (
    <ScrollView style={s.root} contentContainerStyle={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.iconCircle}>
          <Text style={s.iconText}>📊</Text>
        </View>
        <Text style={s.title}>Collection Statistics</Text>
        <Text style={s.subtitle}>Your sports car collection overview</Text>
      </View>

      {/* Main Stats Grid */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Overview</Text>
        <View style={s.grid}>
          <View style={[s.statCard, s.primaryCard]}>
            <View style={s.statIcon}>
              <Text style={s.statIconText}>🚗</Text>
            </View>
            <Text style={s.statLabel}>Total Cars</Text>
            <Text style={s.statValue}>{count}</Text>
          </View>
          
          <View style={[s.statCard, s.successCard]}>
            <View style={s.statIcon}>
              <Text style={s.statIconText}>💰</Text>
            </View>
            <Text style={s.statLabel}>Total Value</Text>
            <Text style={s.statValue}>${currency(totalValue)}</Text>
          </View>
        </View>

        <View style={s.grid}>
          <View style={s.statCard}>
            <View style={s.statIcon}>
              <Text style={s.statIconText}>📈</Text>
            </View>
            <Text style={s.statLabel}>Avg Price</Text>
            <Text style={s.statValue}>${currency(avgPrice)}</Text>
          </View>
          
          <View style={s.statCard}>
            <View style={s.statIcon}>
              <Text style={s.statIconText}>⚡</Text>
            </View>
            <Text style={s.statLabel}>Max HP</Text>
            <Text style={s.statValue}>{maxHp}</Text>
            <Text style={s.statUnit}>horsepower</Text>
          </View>
        </View>
      </View>

      {/* Price Range */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Price Range</Text>
        <View style={s.rangeCard}>
          <View style={s.rangeItem}>
            <Text style={s.rangeLabel}>Lowest</Text>
            <Text style={s.rangeValue}>${currency(minPrice)}</Text>
          </View>
          <View style={s.rangeDivider} />
          <View style={s.rangeItem}>
            <Text style={s.rangeLabel}>Highest</Text>
            <Text style={s.rangeValue}>${currency(maxPrice)}</Text>
          </View>
        </View>
      </View>

      {/* Top Cars */}
      {fastest && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Top Performers</Text>
          
          {/* Fastest Car */}
          <View style={s.highlightCard}>
            <View style={s.highlightBadge}>
              <Text style={s.badgeText}>🏆 Most Powerful</Text>
            </View>
            <Text style={s.highlightTitle}>
              {fastest.make} {fastest.model}
            </Text>
            <View style={s.highlightStats}>
              <View style={s.highlightStat}>
                <Text style={s.highlightStatLabel}>Horsepower</Text>
                <Text style={s.highlightStatValue}>{fastest.horsepower} hp</Text>
              </View>
              <View style={s.highlightStat}>
                <Text style={s.highlightStatLabel}>Price</Text>
                <Text style={s.highlightStatValue}>${currency(fastest.price)}</Text>
              </View>
              <View style={s.highlightStat}>
                <Text style={s.highlightStatLabel}>Year</Text>
                <Text style={s.highlightStatValue}>{fastest.year}</Text>
              </View>
            </View>
          </View>

          {/* Most Expensive */}
          {mostExpensive && (
            <View style={[s.highlightCard, { backgroundColor: '#ecfdf5', borderColor: '#86efac' }]}>
              <View style={[s.highlightBadge, { backgroundColor: '#059669' }]}>
                <Text style={s.badgeText}>💎 Most Expensive</Text>
              </View>
              <Text style={s.highlightTitle}>
                {mostExpensive.make} {mostExpensive.model}
              </Text>
              <View style={s.highlightStats}>
                <View style={s.highlightStat}>
                  <Text style={s.highlightStatLabel}>Price</Text>
                  <Text style={s.highlightStatValue}>${currency(mostExpensive.price)}</Text>
                </View>
                <View style={s.highlightStat}>
                  <Text style={s.highlightStatLabel}>Horsepower</Text>
                  <Text style={s.highlightStatValue}>{mostExpensive.horsepower} hp</Text>
                </View>
                <View style={s.highlightStat}>
                  <Text style={s.highlightStatLabel}>Year</Text>
                  <Text style={s.highlightStatValue}>{mostExpensive.year}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Best Value */}
          {cheapest && (
            <View style={[s.highlightCard, { backgroundColor: '#fef3c7', borderColor: '#fbbf24' }]}>
              <View style={[s.highlightBadge, { backgroundColor: '#d97706' }]}>
                <Text style={s.badgeText}>⭐ Best Value</Text>
              </View>
              <Text style={s.highlightTitle}>
                {cheapest.make} {cheapest.model}
              </Text>
              <View style={s.highlightStats}>
                <View style={s.highlightStat}>
                  <Text style={s.highlightStatLabel}>Price</Text>
                  <Text style={s.highlightStatValue}>${currency(cheapest.price)}</Text>
                </View>
                <View style={s.highlightStat}>
                  <Text style={s.highlightStatLabel}>Horsepower</Text>
                  <Text style={s.highlightStatValue}>{cheapest.horsepower} hp</Text>
                </View>
                <View style={s.highlightStat}>
                  <Text style={s.highlightStatLabel}>Year</Text>
                  <Text style={s.highlightStatValue}>{cheapest.year}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Footer Note */}
      <View style={s.footer}>
        <Text style={s.footerText}>
          📱 Real-time statistics from your collection
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  container: { paddingBottom: 40 },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 15, 
    color: '#6b7280', 
    fontWeight: '500' 
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconText: { fontSize: 32 },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '400',
    textAlign: 'center',
  },

  // Section
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  // Stats Grid
  grid: { 
    flexDirection: 'row', 
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
  },
  successCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statIconText: { fontSize: 20 },
  statLabel: { 
    color: '#6b7280', 
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: { 
    fontSize: 24, 
    fontWeight: '800',
    color: '#111827',
  },
  statUnit: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
    marginTop: 2,
  },

  // Range Card
  rangeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rangeItem: {
    flex: 1,
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  rangeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  rangeDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },

  // Highlight Cards
  highlightCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  highlightBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  highlightTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  highlightStats: {
    flexDirection: 'row',
    gap: 16,
  },
  highlightStat: {
    flex: 1,
  },
  highlightStatLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
    textAlign: 'center',
  },
});