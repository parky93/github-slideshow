import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { seedDatabase } from '@/lib/db/seed'
import AsyncStorage from '@react-native-async-storage/async-storage'
import OnboardingScreen from './onboarding'
import { C } from '@/lib/theme'

export default function RootLayout() {
  const [ready, setReady] = useState(false)
  const [onboarded, setOnboarded] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        await seedDatabase()
        const v = await AsyncStorage.getItem('mta:onboarded')
        setOnboarded(v === 'true')
      } catch (e) {
        console.error(e)
      } finally {
        setReady(true)
      }
    }
    init()
  }, [])

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.green} />
      </View>
    )
  }

  if (!onboarded) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={() => setOnboarded(true)} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.text,
          headerTitleStyle: { fontWeight: '800', color: C.text, fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: C.bg },
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
        <Stack.Screen name="paywall" options={{ title: 'Go Pro' }} />
        <Stack.Screen name="dlog/activity-type" options={{ title: 'Log Activity' }} />
        <Stack.Screen name="dlog/log-activity" options={{ title: 'Activity Details' }} />
        <Stack.Screen name="dlog/location-search" options={{ title: 'Search Location' }} />
        <Stack.Screen name="dlog/gpx-builder" options={{ title: 'GPX Builder' }} />
        <Stack.Screen name="dlog/export" options={{ title: 'DLOG Export' }} />
        <Stack.Screen name="dlog/logbook" options={{ title: 'My Logbook' }} />
      </Stack>
    </View>
  )
}
