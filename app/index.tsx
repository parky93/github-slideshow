import React, { useCallback, useState } from 'react'
import { View, Text, SectionList, StyleSheet, RefreshControl } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { QualCard } from '@/components/QualCard'
import { getAllQualifications } from '@/lib/db/queries/qualifications'
import type { QualificationWithMeta } from '@/lib/types'

interface ListSection { title: string; data: QualificationWithMeta[] }

export default function HomeScreen() {
  const router = useRouter()
  const [sections, setSections] = useState<ListSection[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const all = await getAllQualifications()
    const walking = all.filter(q => q.category === 'walking')
    const climbing = all.filter(q => q.category !== 'walking')
    const built: ListSection[] = []
    if (walking.length) built.push({ title: 'Walking', data: walking })
    if (climbing.length) built.push({ title: 'Climbing & Coaching', data: climbing })
    setSections(built)
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

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
        <QualCard qual={item} onPress={() => router.push(`/qualification/${item.slug}`)} />
      )}
      ListHeaderComponent={
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Qualifications</Text>
          <Text style={styles.heroSub}>Track your assessment readiness</Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  hero: { paddingTop: 20, paddingBottom: 16 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  heroSub: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  sectionHeader: {
    fontSize: 13, fontWeight: '700', color: '#2d7d2d',
    textTransform: 'uppercase', letterSpacing: 0.8,
    paddingTop: 20, paddingBottom: 8, backgroundColor: '#f9fafb',
  },
})
