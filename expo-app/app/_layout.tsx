import React, { useEffect } from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { initDatabase } from '@/lib/db/client'
import { seedDatabase } from '@/lib/db/seed'

export default function RootLayout() {
  useEffect(() => {
    initDatabase()
    seedDatabase()
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#2d7d2d',
          headerTitleStyle: { fontWeight: '700', color: '#111827' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#f9fafb' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Mountain Training' }} />
        <Stack.Screen name="qualification/[slug]/index" options={{ title: '' }} />
        <Stack.Screen name="qualification/[slug]/checklist" options={{ title: 'Checklist' }} />
        <Stack.Screen name="qualification/[slug]/history" options={{ title: 'Progress History' }} />
      </Stack>
    </View>
  )
}
