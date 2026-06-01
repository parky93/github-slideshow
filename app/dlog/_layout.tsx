import { Stack } from 'expo-router'

export default function DlogLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0A1306' },
        headerTintColor: '#ECF0E6',
        headerTitleStyle: { fontWeight: '700', color: '#ECF0E6', fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#0F1A0A' },
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
