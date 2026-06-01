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
import { C } from '@/lib/theme'

interface CategorySection {
  title: string
  category: ActivityCategory
  dotColor: string
  data: typeof ACTIVITY_TYPES
}

const CATEGORY_META: Record<ActivityCategory, { title: string; dotColor: string }> = {
  'walking': { title: 'Walking', dotColor: C.green },
  'climbing-outdoor': { title: 'Outdoor Climbing', dotColor: C.orange },
  'climbing-indoor': { title: 'Indoor Climbing', dotColor: C.blue },
  'other': { title: 'Other', dotColor: C.textSec },
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
  safe: { flex: 1, backgroundColor: C.bg },
  list: { paddingHorizontal: 16, paddingBottom: 48, paddingTop: 8 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: C.bg,
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
    color: C.textSec,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
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
    color: C.text,
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
    backgroundColor: C.textMuted,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateY: -3 }],
  },
  chevronLine2: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: C.textMuted,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateY: 3 }],
  },
})
