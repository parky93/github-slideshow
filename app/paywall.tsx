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
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { C, RADIUS, GRAD } from '@/lib/theme'

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
          <View style={styles.lockShackle} />
          <LinearGradient
            colors={GRAD.cta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lockBody}
          >
            <View style={styles.lockHole} />
          </LinearGradient>
        </View>

        <View style={styles.proPill}>
          <Text style={styles.proPillText}>PRO</Text>
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
              <LinearGradient
                colors={GRAD.cta}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.checkWrap}
              >
                <View style={styles.checkShort} />
                <View style={styles.checkLong} />
              </LinearGradient>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingRow}>
          <View style={styles.priceCard}>
            <Text style={styles.pricePeriod}>Monthly</Text>
            <Text style={styles.priceAmount}>£2.99</Text>
            <Text style={styles.priceUnit}>per month</Text>
          </View>
          {/* Highlighted annual card with gradient border */}
          <LinearGradient
            colors={GRAD.cta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.priceCardHighlight}
          >
            <View style={styles.priceCardInner}>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>SAVE 44%</Text>
              </View>
              <Text style={styles.pricePeriod}>Annual</Text>
              <Text style={styles.priceAmount}>£19.99</Text>
              <Text style={styles.priceUnit}>per year</Text>
            </View>
          </LinearGradient>
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [styles.ctaShadow, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
          onPress={() => Alert.alert('Coming Soon', 'Stripe payment coming soon!')}
        >
          <LinearGradient
            colors={GRAD.cta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>Upgrade to Pro</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.freeNote}>Free plan includes full self-assessment tool</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },

  /* Lock icon */
  lockWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lockShackle: {
    width: 28,
    height: 16,
    borderWidth: 4,
    borderColor: C.green,
    borderBottomWidth: 0,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    marginBottom: -2,
  },
  lockBody: {
    width: 48,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  lockHole: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.bg,
  },

  proPill: {
    backgroundColor: C.green + '26',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  proPillText: { fontSize: 11, fontWeight: '800', color: C.greenBright, letterSpacing: 1.4 },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: C.textSec,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  /* Feature list */
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 32,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 1,
  },
  checkShort: {
    position: 'absolute',
    width: 5,
    height: 2,
    backgroundColor: '#0A0F08',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateX: -2 }, { translateY: 1 }],
  },
  checkLong: {
    position: 'absolute',
    width: 9,
    height: 2,
    backgroundColor: '#0A0F08',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateX: 2 }, { translateY: -1 }],
  },
  featureText: { flex: 1 },
  featureLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  featureDesc: {
    fontSize: 13,
    color: C.textSec,
    marginTop: 2,
  },

  /* Pricing */
  pricingRow: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
    marginBottom: 28,
    alignItems: 'stretch',
  },
  priceCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceCardHighlight: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: 2,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
  },
  priceCardInner: {
    flex: 1,
    backgroundColor: C.surfaceHi,
    borderRadius: RADIUS.lg - 2,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  saveBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: C.greenBright,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0A0F08',
    letterSpacing: 0.8,
  },
  pricePeriod: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textSec,
    marginBottom: 6,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  priceAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.8,
  },
  priceUnit: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },

  /* CTA */
  ctaShadow: {
    alignSelf: 'stretch',
    marginBottom: 16,
    borderRadius: RADIUS.lg,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaBtn: {
    borderRadius: RADIUS.lg,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0A0F08',
    letterSpacing: 0.2,
  },
  freeNote: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: 'center',
  },
})
