import React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'

const FEATURES = [
  { label: 'Activity logger', desc: 'walking, climbing, indoor sessions' },
  { label: 'GPX builder', desc: 'route planner with OpenTopoMap' },
  { label: 'DLOG export', desc: 'pre-filled summaries and file downloads' },
  { label: 'Personal logbook', desc: 'filter by discipline, date, QMD status' },
]

export default function PaywallScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Lock icon */}
        <View style={styles.lockWrap}>
          <View style={styles.lockBody}>
            <View style={styles.lockHole} />
          </View>
          <View style={styles.lockShackle} />
        </View>

        <Text style={styles.title}>Unlock the DLOG Toolkit</Text>
        <Text style={styles.subtitle}>
          Keep a digital logbook, build GPX files, and export DLOG-ready activity summaries.
        </Text>

        {/* Feature list */}
        <View style={styles.featureList}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              {/* Checkmark drawn with Views */}
              <View style={styles.checkWrap}>
                <View style={styles.checkShort} />
                <View style={styles.checkLong} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingRow}>
          <View style={[styles.priceCard, styles.priceCardActive]}>
            <Text style={styles.pricePeriod}>Monthly</Text>
            <Text style={styles.priceAmount}>£2.99</Text>
            <Text style={styles.priceUnit}>per month</Text>
          </View>
          <View style={styles.priceCard}>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save 44%</Text>
            </View>
            <Text style={styles.pricePeriod}>Annual</Text>
            <Text style={styles.priceAmount}>£19.99</Text>
            <Text style={styles.priceUnit}>per year</Text>
          </View>
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.7 }]}
          onPress={() => Alert.alert('Coming Soon', 'Stripe payment coming soon!')}
        >
          <Text style={styles.ctaText}>Upgrade to Pro</Text>
        </Pressable>

        <Text style={styles.freeNote}>Free plan includes full self-assessment tool</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1A0A' },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },

  /* Lock icon */
  lockWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },
  lockShackle: {
    width: 28,
    height: 16,
    borderWidth: 4,
    borderColor: '#4A8B28',
    borderBottomWidth: 0,
    borderRadius: 14,
    marginBottom: -2,
  },
  lockBody: {
    width: 44,
    height: 34,
    backgroundColor: '#4A8B28',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockHole: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F1A0A',
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ECF0E6',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#8FA882',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  /* Feature list */
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 32,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1A2E10',
    borderWidth: 1,
    borderColor: '#4A8B28',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 2,
  },
  checkShort: {
    position: 'absolute',
    width: 5,
    height: 2,
    backgroundColor: '#4A8B28',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateX: -2 }, { translateY: 1 }],
  },
  checkLong: {
    position: 'absolute',
    width: 9,
    height: 2,
    backgroundColor: '#4A8B28',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateX: 2 }, { translateY: -1 }],
  },
  featureText: { flex: 1 },
  featureLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ECF0E6',
  },
  featureDesc: {
    fontSize: 13,
    color: '#8FA882',
    marginTop: 2,
  },

  /* Pricing */
  pricingRow: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
    marginBottom: 28,
  },
  priceCard: {
    flex: 1,
    backgroundColor: '#1A2E10',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  priceCardActive: {
    borderColor: '#4A8B28',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#4A8B28',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  pricePeriod: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8FA882',
    marginBottom: 6,
    marginTop: 8,
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ECF0E6',
  },
  priceUnit: {
    fontSize: 12,
    color: '#536644',
    marginTop: 2,
  },

  /* CTA */
  ctaBtn: {
    backgroundColor: '#4A8B28',
    borderRadius: 16,
    paddingVertical: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
  freeNote: {
    fontSize: 12,
    color: '#536644',
    textAlign: 'center',
  },
})
