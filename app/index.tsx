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
} from 'react-native'
import { useRouter, useFocusEffect, Link } from 'expo-router'
import { QualCard } from '@/components/QualCard'
import { getAllQualifications } from '@/lib/db/queries/qualifications'
import { getJSON } from '@/lib/db/client'
import type { QualificationWithMeta } from '@/lib/types'

type FilterTab = 'All' | 'Walking' | 'Climbing'
const TABS: FilterTab[] = ['All', 'Walking', 'Climbing']

const BRAND = '#4A8B28'
const TAB_W = 90

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
    // Filter by active quals if set
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

  const filteredFlat = activeTab === 'Walking'
    ? allQuals.filter(q => q.category === 'walking')
    : allQuals.filter(q => q.category !== 'walking')

  const favourites = allQuals.filter(q => q.isFavourite)

  const navigateTo = (item: QualificationWithMeta) =>
    router.push(`/qualification/${item.slug}`)

  const Hero = (
    <View style={styles.hero}>
      {/* App heading */}
      <View style={styles.heroRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>MTA Ready</Text>
          <Text style={styles.heroSub}>{allQuals.length} qualifications tracked</Text>
        </View>
        <View style={styles.heroActions}>
          {/* Gear icon — navigate to settings */}
          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [styles.heroIconBtn, pressed && { opacity: 0.7 }]}
            accessibilityLabel="Settings"
          >
            {/* Gear drawn with a circle + border dash effect */}
            <View style={styles.gearOuter}>
              <View style={styles.gearInner} />
              <View style={[styles.gearTooth, { top: -3, left: 7 }]} />
              <View style={[styles.gearTooth, { bottom: -3, left: 7 }]} />
              <View style={[styles.gearTooth, { left: -3, top: 7, width: 6, height: 4 }]} />
              <View style={[styles.gearTooth, { right: -3, top: 7, width: 6, height: 4 }]} />
            </View>
          </Pressable>
          {/* Search icon */}
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
          {/* Count badge */}
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{allQuals.length}</Text>
          </View>
        </View>
      </View>

      {/* Filter tab pills */}
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabPill,
            {
              width: TAB_W,
              transform: [{
                translateX: pillAnim.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [2, TAB_W + 2, TAB_W * 2 + 2],
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

      {/* Shortcut buttons */}
      <View style={styles.shortcutRow}>
        <Link href="/coaching-needs" asChild>
          <Pressable style={[styles.shortcutBtn, styles.shortcutBtnOrange]}>
            <View style={[styles.shortcutDot, { backgroundColor: '#C4621A' }]} />
            <Text style={[styles.shortcutLabel, { color: '#E8893A' }]}>Coaching needs</Text>
          </Pressable>
        </Link>
        <Link href="/stats" asChild>
          <Pressable style={[styles.shortcutBtn, styles.shortcutBtnGreen]}>
            <View style={[styles.shortcutDot, { backgroundColor: '#4A8B28' }]} />
            <Text style={[styles.shortcutLabel, { color: '#8FA882' }]}>Overview</Text>
          </Pressable>
        </Link>
      </View>

      {/* Favourites section — only in All tab */}
      {activeTab === 'All' && favourites.length > 0 && (
        <View style={styles.favSection}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.sectionLabel}>Favourites</Text>
          </View>
          {favourites.map(item => (
            <QualCard key={item.slug} qual={item} onPress={() => navigateTo(item)} />
          ))}
        </View>
      )}
    </View>
  )

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND} />
  )

  if (activeTab !== 'All') {
    return (
      <View style={styles.screen}>
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
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.slug}
        contentContainerStyle={styles.list}
        refreshControl={refreshControl}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: BRAND }]} />
            <Text style={styles.sectionLabel}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <QualCard qual={item} onPress={() => navigateTo(item)} />
        )}
        ListHeaderComponent={Hero}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F1A0A' },
  list: { paddingHorizontal: 16, paddingBottom: 48 },

  /* Hero */
  hero: { paddingTop: 28, paddingBottom: 4 },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ECF0E6',
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    color: '#8FA882',
    marginTop: 4,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  heroIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1A2E10',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2E4A1E',
  },
  /* Gear icon */
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
    borderColor: '#8FA882',
    backgroundColor: 'transparent',
  },
  gearTooth: {
    position: 'absolute',
    width: 4,
    height: 6,
    backgroundColor: '#8FA882',
    borderRadius: 1,
  },
  /* Search icon in hero */
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
    borderColor: '#8FA882',
    backgroundColor: 'transparent',
  },
  searchHandleHero: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 6,
    height: 2,
    backgroundColor: '#8FA882',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  heroBadge: {
    backgroundColor: BRAND,
    borderRadius: 22,
    minWidth: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },

  /* Filter tabs */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1A2E10',
    borderRadius: 14,
    padding: 2,
    width: TAB_W * 3 + 4,
    position: 'relative',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  tabPill: {
    position: 'absolute',
    top: 2,
    left: 0,
    height: 36,
    backgroundColor: BRAND,
    borderRadius: 12,
  },
  tab: {
    width: TAB_W,
    paddingVertical: 9,
    alignItems: 'center',
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8FA882',
  },
  tabLabelActive: {
    color: '#ECF0E6',
  },

  /* Section headers */
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 10,
    backgroundColor: '#0F1A0A',
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8FA882',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },

  /* Favourites */
  favSection: { marginBottom: 4 },

  /* Empty */
  /* Shortcut buttons */
  shortcutRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  shortcutBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2E10', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 8, borderWidth: 1 },
  shortcutBtnOrange: { borderColor: '#C4621A44' },
  shortcutBtnGreen: { borderColor: '#4A8B2844' },
  shortcutDot: { width: 8, height: 8, borderRadius: 4 },
  shortcutLabel: { fontSize: 13, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: '#536644' },
})
