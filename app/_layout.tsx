import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { seedDatabase } from '@/lib/db/seed'

export default function RootLayout() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    seedDatabase()
      .catch(console.error)
      .finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#2d7d2d" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1a5c2a' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700', color: '#ffffff', fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#f0f5f0' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'MTA Ready', headerLargeTitle: false }} />
        <Stack.Screen name="qualification/[slug]/index" options={{ title: 'Qualification' }} />
        <Stack.Screen name="qualification/[slug]/checklist" options={{ title: 'Checklist' }} />
        <Stack.Screen name="qualification/[slug]/history" options={{ title: 'Progress History' }} />
      </Stack>
    </View>
  )
}
