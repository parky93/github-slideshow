import React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SectionList,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { ACTIVITY_TYPES, type ActivityCategory } from '@/lib/dlog/types'

interface CategorySection {
  title: string
  category: ActivityCategory
  dotColor: string
  data: typeof ACTIVITY_TYPES
}

const CATEGORY_META: Record<ActivityCategory, { title: string; dotColor: string }> = {
  'walking': { title: 'Walking', dotColor: '#4A8B28' },
  'climbing-outdoor': { title: 'Outdoor Climbing', dotColor: '#C4621A' },
  'climbing-indoor': { title: 'Indoor Climbing', dotColor: '#3B82F6' },
  'other': { title: 'Other', dotColor: '#8FA882' },
}

const CATEGORY_ORDER: ActivityCategory[] = ['walking', 'climbing-outdoor', 'climbing-indoor', 'other']

function buildSections(): CategorySection[] {
  return CATEGORY_ORDER.map(cat => ({
    title: CATEGORY_META[cat].title,
    category: cat,
    dotColor: CATEGORY_META[cat].dotColor,
    data: ACTIVITY_TYPES.filter(t => t.category === cat),
  })).filter(s => s.data.length > 0)
}

const SECTIONS = buildSections()

export default function ActivityTypeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <SectionList
        sections={SECTIONS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: section.dotColor }]} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
            onPress={() => router.push(`/dlog/log-activity?typeId=${item.id}`)}
          >
            <Text style={styles.cardLabel}>{item.label}</Text>
            <View style={styles.cardChevron}>
              <View style={styles.chevronLine1} />
              <View style={styles.chevronLine2} />
            </View>
          </Pressable>
        )}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1A0A' },
  list: { paddingHorizontal: 16, paddingBottom: 48, paddingTop: 8 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#0F1A0A',
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8FA882',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },

  card: {
    backgroundColor: '#1A2E10',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ECF0E6',
  },
  cardChevron: {
    width: 16,
    height: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronLine1: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: '#536644',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateY: -3 }],
  },
  chevronLine2: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: '#536644',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateY: 3 }],
  },
})
