import React, { useEffect, useRef, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { seedDatabase } from '@/lib/db/seed'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function RootLayout() {
  const [ready, setReady] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const router = useRouter()
  const hasRedirected = useRef(false)

  useEffect(() => {
    async function init() {
      try {
        await seedDatabase()
        const onboarded = await AsyncStorage.getItem('mta:onboarded')
        if (onboarded !== 'true') {
          setNeedsOnboarding(true)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setReady(true)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (ready && needsOnboarding && !hasRedirected.current) {
      hasRedirected.current = true
      router.replace('/onboarding')
    }
  }, [ready, needsOnboarding, router])

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
        <Stack.Screen name="coaching-needs" options={{ title: 'Coaching Needs' }} />
        <Stack.Screen name="stats" options={{ title: 'Overview' }} />
        <Stack.Screen name="qualification/[slug]/index" options={{ title: 'Qualification' }} />
        <Stack.Screen name="qualification/[slug]/checklist" options={{ title: 'Checklist' }} />
        <Stack.Screen name="qualification/[slug]/history" options={{ title: 'Progress History' }} />
        <Stack.Screen name="qualification/[slug]/quickrate" options={{ title: 'Quick Rate' }} />
        <Stack.Screen name="search" options={{ title: 'Search' }} />
        <Stack.Screen name="onboarding" options={{ title: 'Get Started', headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </View>
  )
}
