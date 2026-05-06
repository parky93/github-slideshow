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
    Animated.spring(pillAnim, { toValue: idx, useNativeDriver: false, tension: 80, friction: 10 }).start()
  }

  const TAB_WIDTH = 80

  const filteredFlat = activeTab === 'Walking'
    ? allQuals.filter(q => q.category === 'walking')
    : allQuals.filter(q => q.category !== 'walking')

  const favourites = allQuals.filter(q => q.isFavourite)

  const navigateTo = (item: QualificationWithMeta) =>
    router.push(`/qualification/${item.slug}`)

  const Hero = (
    <View style={styles.hero}>
      <Text style={styles.heroTitle}>MTA Ready</Text>
      <Text style={styles.heroSub}>{allQuals.length} qualifications tracked</Text>

      {/* Filter tabs */}
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabPill,
            {
              width: TAB_WIDTH,
              transform: [{
                translateX: pillAnim.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [0, TAB_WIDTH, TAB_WIDTH * 2],
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

      {/* Favourites section — only visible in All tab */}
      {activeTab === 'All' && favourites.length > 0 && (
        <View style={styles.favSection}>
          <Text style={styles.favHeading}>Favourites</Text>
          {favourites.map(item => (
            <QualCard key={item.slug} qual={item} onPress={() => navigateTo(item)} />
          ))}
        </View>
      )}
    </View>
  )

  if (activeTab !== 'All') {
    return (
      <FlatList
        data={filteredFlat}
        keyExtractor={item => item.slug}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2d7d2d" />}
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
    )
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.slug}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2d7d2d" />}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <QualCard qual={item} onPress={() => navigateTo(item)} />
      )}
      ListHeaderComponent={Hero}
    />
  )
}

const BRAND = '#2d7d2d'
const TAB_W = 80

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  hero: { paddingTop: 24, paddingBottom: 8 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 20 },

  /* Filter tabs */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#e9eef0',
    borderRadius: 12,
    padding: 3,
    width: TAB_W * 3 + 6,
    position: 'relative',
    marginBottom: 20,
  },
  tabPill: {
    position: 'absolute',
    top: 3,
    left: 3,
    height: '100%',
    backgroundColor: BRAND,
    borderRadius: 10,
  },
  tab: {
    width: TAB_W,
    paddingVertical: 8,
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

  /* Favourites */
  favSection: { marginBottom: 8 },
  favHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingBottom: 8,
  },

  /* Section headers */
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: '#f5f5f5',
  },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
})
