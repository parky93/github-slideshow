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
import { useRouter, useFocusEffect } from 'expo-router'
import { QualCard } from '@/components/QualCard'
import { getAllQualifications } from '@/lib/db/queries/qualifications'
import type { QualificationWithMeta } from '@/lib/types'

type FilterTab = 'All' | 'Walking' | 'Climbing'
const TABS: FilterTab[] = ['All', 'Walking', 'Climbing']

const BRAND = '#2d7d2d'
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
    setAllQuals(all)
    setSections(buildSections(all))
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
        <View>
          <Text style={styles.heroTitle}>MTA Ready</Text>
          <Text style={styles.heroSub}>{allQuals.length} qualifications tracked</Text>
        </View>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>{allQuals.length}</Text>
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
  screen: { flex: 1, backgroundColor: '#f0f5f0' },
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
    color: '#111827',
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  heroBadge: {
    backgroundColor: BRAND,
    borderRadius: 22,
    minWidth: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 2,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },

  /* Filter tabs */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#e5e9eb',
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
    color: '#6b7280',
  },
  tabLabelActive: {
    color: '#fff',
  },

  /* Section headers */
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 10,
    backgroundColor: '#f0f5f0',
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
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },

  /* Favourites */
  favSection: { marginBottom: 4 },

  /* Empty */
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
})
