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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1A0A' }}>
        <ActivityIndicator size="large" color="#4A8B28" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0A1306' },
          headerTintColor: '#ECF0E6',
          headerTitleStyle: { fontWeight: '700', color: '#ECF0E6', fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#0F1A0A' },
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
