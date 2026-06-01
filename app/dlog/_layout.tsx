import { Stack } from 'expo-router'
import { C } from '@/lib/theme'

export default function DlogLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: C.bg },
        headerTintColor: C.text,
        headerTitleStyle: { fontWeight: '800', color: C.text, fontSize: 18 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: C.bg },
      }}
    >
      <Stack.Screen name="activity-type" options={{ title: 'Log Activity' }} />
      <Stack.Screen name="log-activity" options={{ title: 'Activity Details' }} />
      <Stack.Screen name="location-search" options={{ title: 'Search Location' }} />
      <Stack.Screen name="gpx-builder" options={{ title: 'GPX Builder' }} />
      <Stack.Screen name="export" options={{ title: 'DLOG Export' }} />
      <Stack.Screen name="logbook" options={{ title: 'My Logbook' }} />
    </Stack>
  )
}
