import React, { useCallback, useState, useRef } from 'react'
import {
  View,
  Text,
  SectionList,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Animated,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, useFocusEffect, Link } from 'expo-router'
import { QualCard } from '@/components/QualCard'
import { getAllQualifications } from '@/lib/db/queries/qualifications'
import { getJSON } from '@/lib/db/client'
import { getIsPro } from '@/lib/dlog/storage'
import { C, RADIUS, GRAD } from '@/lib/theme'
import type { QualificationWithMeta } from '@/lib/types'

type FilterTab = 'All' | 'Walking' | 'Climbing'
const TABS: FilterTab[] = ['All', 'Walking', 'Climbing']

const TAB_W = 104

interface ListSection { title: string; data: QualificationWithMeta[] }

export default function HomeScreen() {
  const router = useRouter()
  const [allQuals, setAllQuals] = useState<QualificationWithMeta[]>([])
  const [sections, setSections] = useState<ListSection[]>([])
  const [activeTab, setActiveTab] = useState<FilterTab>('All')
  const [refreshing, setRefreshing] = useState(false)
  const pillAnim = useRef(new Animated.Value(0)).current

  const buildSections = useCallback((quals: QualificationWithMeta[]) => {
    const walking = quals.filter(q => q.category === 'walking')
    const climbing = quals.filter(q => q.category !== 'walking')
    const built: ListSection[] = []
    if (walking.length) built.push({ title: 'Walking', data: walking })
    if (climbing.length) built.push({ title: 'Climbing & Coaching', data: climbing })
    return built
  }, [])

  const load = useCallback(async () => {
    const all = await getAllQualifications()
    const activeIds = await getJSON<number[]>('mta:active-quals')
    const filtered = activeIds && activeIds.length > 0
      ? all.filter(q => activeIds.includes(q.id))
      : all
    setAllQuals(filtered)
    setSections(buildSections(filtered))
  }, [buildSections])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const onTabPress = (tab: FilterTab, idx: number) => {
    setActiveTab(tab)
    Animated.spring(pillAnim, {
      toValue: idx,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start()
  }

  const handleDlogPress = async () => {
    const isPro = await getIsPro()
    if (isPro) {
      router.push('/dlog/activity-type')
    } else {
      router.push('/paywall')
    }
  }

  const filteredFlat = activeTab === 'Walking'
    ? allQuals.filter(q => q.category === 'walking')
    : allQuals.filter(q => q.category !== 'walking')

  const favourites = allQuals.filter(q => q.isFavourite)

  const navigateTo = (item: QualificationWithMeta) =>
    router.push(`/qualification/${item.slug}`)

  // Overall readiness across tracked quals (those with a checklist)
  const tracked = allQuals.filter(q => q.totalItems > 0)
  const overall = tracked.length
    ? tracked.reduce((s, q) => s + q.readinessScore, 0) / tracked.length
    : 0
  const overallPct = Math.round(overall * 100)
  const totalItems = allQuals.reduce((s, q) => s + q.totalItems, 0)
  const totalRated = allQuals.reduce((s, q) => s + q.ratedItems, 0)
  const greenCount = tracked.filter(q => q.readinessScore >= 0.65).length

  const Hero = (
    <View style={styles.hero}>
      {/* Greeting header */}
      <View style={styles.heroRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroEyebrow}>MTA Ready</Text>
          <Text style={styles.heroTitle}>Your Readiness</Text>
        </View>
        <View style={styles.heroActions}>
          <Pressable
            onPress={() => router.push('/search')}
            style={({ pressed }) => [styles.heroIconBtn, pressed && { opacity: 0.7 }]}
            accessibilityLabel="Search"
          >
            <View style={styles.searchIconContainer}>
              <View style={styles.searchCircleHero} />
              <View style={styles.searchHandleHero} />
            </View>
          </Pressable>
          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [styles.heroIconBtn, pressed && { opacity: 0.7 }]}
            accessibilityLabel="Settings"
          >
            <View style={styles.gearOuter}>
              <View style={styles.gearInner} />
              <View style={[styles.gearTooth, { top: -3, left: 7 }]} />
              <View style={[styles.gearTooth, { bottom: -3, left: 7 }]} />
              <View style={[styles.gearTooth, { left: -3, top: 7, width: 6, height: 4 }]} />
              <View style={[styles.gearTooth, { right: -3, top: 7, width: 6, height: 4 }]} />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Hero readiness card */}
      <View style={styles.readinessCard}>
        <LinearGradient
          colors={GRAD.greenGlow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.readinessTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.readinessLabel}>Overall readiness</Text>
            <View style={styles.readinessNumRow}>
              <Text style={styles.readinessNum}>{overallPct}</Text>
              <Text style={styles.readinessPct}>%</Text>
            </View>
            <Text style={styles.readinessSub}>
              {tracked.length} of {allQuals.length} qualifications tracked
            </Text>
          </View>
        </View>
        <View style={styles.bigTrack}>
          <LinearGradient
            colors={GRAD.cta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.bigFill, { width: `${Math.max(overallPct, 2)}%` as any }]}
          />
        </View>
        <View style={styles.miniStatRow}>
          <MiniStat value={`${totalRated}/${totalItems}`} label="Items rated" />
          <View style={styles.miniDivider} />
          <MiniStat value={String(greenCount)} label="Ready" valueColor={C.greenStatus} />
          <View style={styles.miniDivider} />
          <MiniStat value={String(allQuals.length)} label="Tracked" />
        </View>
      </View>

      {/* Segmented filter pills */}
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabPill,
            {
              width: TAB_W,
              transform: [{
                translateX: pillAnim.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [3, TAB_W + 3, TAB_W * 2 + 3],
                }),
              }],
            },
          ]}
        />
        {TABS.map((tab, idx) => (
          <Pressable key={tab} style={styles.tab} onPress={() => onTabPress(tab, idx)}>
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Shortcut cards */}
      <View style={styles.shortcutRow}>
        <Link href="/coaching-needs" asChild>
          <Pressable style={({ pressed }) => [styles.shortcutCard, pressed && { opacity: 0.85 }]}>
            <View style={[styles.shortcutIcon, { backgroundColor: C.orange + '26' }]}>
              <View style={[styles.iconDot, { backgroundColor: C.orange }]} />
            </View>
            <Text style={styles.shortcutLabel}>Coaching</Text>
            <Text style={styles.shortcutSub}>Needs review</Text>
          </Pressable>
        </Link>
        <Link href="/stats" asChild>
          <Pressable style={({ pressed }) => [styles.shortcutCard, pressed && { opacity: 0.85 }]}>
            <View style={[styles.shortcutIcon, { backgroundColor: C.green + '26' }]}>
              <View style={[styles.iconDot, { backgroundColor: C.greenBright }]} />
            </View>
            <Text style={styles.shortcutLabel}>Overview</Text>
            <Text style={styles.shortcutSub}>Your stats</Text>
          </Pressable>
        </Link>
      </View>

      {/* DLOG Toolkit — prominent gradient card */}
      <Pressable
        style={({ pressed }) => [styles.dlogCard, pressed && { transform: [{ scale: 0.98 }] }]}
        onPress={handleDlogPress}
      >
        <LinearGradient
          colors={GRAD.cta}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.dlogIcon}>
          <View style={styles.dlogIconBar} />
          <View style={[styles.dlogIconBar, { height: 14 }]} />
          <View style={[styles.dlogIconBar, { height: 9 }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.dlogTitle}>DLOG Toolkit</Text>
          <Text style={styles.dlogSub}>Log activities, build GPX, export DLOG</Text>
        </View>
        <View style={styles.proTag}>
          <Text style={styles.proTagText}>PRO</Text>
        </View>
      </Pressable>

      {/* Favourites section — only in All tab */}
      {activeTab === 'All' && favourites.length > 0 && (
        <View style={styles.favSection}>
          <Text style={styles.sectionLabel}>Favourites</Text>
          {favourites.map(item => (
            <QualCard key={item.slug} qual={item} onPress={() => navigateTo(item)} />
          ))}
        </View>
      )}
    </View>
  )

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.greenBright} />
  )

  if (activeTab !== 'All') {
    return (
      <SafeAreaView style={styles.screen}>
        <FlatList
          data={filteredFlat}
          keyExtractor={item => item.slug}
          contentContainerStyle={styles.list}
          refreshControl={refreshControl}
          ListHeaderComponent={Hero}
          renderItem={({ item }) => (
            <QualCard qual={item} onPress={() => navigateTo(item)} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No qualifications in this category</Text>
            </View>
          }
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.slug}
        contentContainerStyle={styles.list}
        refreshControl={refreshControl}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <QualCard qual={item} onPress={() => navigateTo(item)} />
        )}
        ListHeaderComponent={Hero}
      />
    </SafeAreaView>
  )
}

function MiniStat({ value, label, valueColor }: { value: string; label: string; valueColor?: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={[styles.miniStatValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  list: { paddingHorizontal: 20, paddingBottom: 48 },

  /* Hero */
  hero: { paddingTop: 24, paddingBottom: 4 },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.8,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  gearOuter: {
    width: 18,
    height: 18,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: C.textSec,
    backgroundColor: 'transparent',
  },
  gearTooth: {
    position: 'absolute',
    width: 4,
    height: 6,
    backgroundColor: C.textSec,
    borderRadius: 1,
  },
  searchIconContainer: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  searchCircleHero: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.textSec,
    backgroundColor: 'transparent',
  },
  searchHandleHero: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 6,
    height: 2,
    backgroundColor: C.textSec,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },

  /* Hero readiness card */
  readinessCard: {
    borderRadius: RADIUS.xl,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  readinessTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  readinessLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  readinessNumRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  readinessNum: {
    fontSize: 72,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -3,
    lineHeight: 74,
    fontVariant: ['tabular-nums'],
  },
  readinessPct: {
    fontSize: 28,
    fontWeight: '800',
    color: C.greenBright,
    marginTop: 10,
    marginLeft: 2,
    fontVariant: ['tabular-nums'],
  },
  readinessSub: {
    fontSize: 13,
    color: C.textSec,
    marginTop: 4,
    fontWeight: '600',
  },
  bigTrack: {
    height: 10,
    backgroundColor: C.bg,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 18,
    marginBottom: 18,
  },
  bigFill: {
    height: '100%',
    borderRadius: 5,
  },
  miniStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniStat: { flex: 1 },
  miniStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  miniStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 3,
  },
  miniDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 12,
  },

  /* Filter tabs */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    padding: 3,
    width: TAB_W * 3 + 6,
    position: 'relative',
    marginBottom: 24,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: C.borderSubtle,
  },
  tabPill: {
    position: 'absolute',
    top: 3,
    left: 0,
    height: 38,
    backgroundColor: C.surfaceHi,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.border,
  },
  tab: {
    width: TAB_W,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textMuted,
  },
  tabLabelActive: {
    color: C.greenBright,
  },

  /* Section headers */
  sectionLabelRow: {
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: C.bg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  favSection: { marginBottom: 4 },

  /* Shortcut cards */
  shortcutRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  shortcutCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconDot: { width: 12, height: 12, borderRadius: 6 },
  shortcutLabel: { fontSize: 15, fontWeight: '700', color: C.text },
  shortcutSub: { fontSize: 12, color: C.textSec, marginTop: 2, fontWeight: '600' },

  /* DLOG card */
  dlogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 24,
    gap: 14,
    overflow: 'hidden',
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  dlogIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.18)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 11,
    gap: 3,
  },
  dlogIconBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#0A0F08',
  },
  dlogTitle: { fontSize: 17, fontWeight: '800', color: '#0A0F08', letterSpacing: -0.3 },
  dlogSub: { fontSize: 12, color: '#10210A', marginTop: 2, fontWeight: '600' },
  proTag: {
    backgroundColor: 'rgba(10,15,8,0.85)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  proTagText: { fontSize: 10, fontWeight: '800', color: C.greenBright, letterSpacing: 1 },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: C.textMuted },
})
