import React from 'react'
import { Tabs } from 'expo-router'
import { Platform, Pressable } from 'react-native'
import Svg, { Path, Rect, Circle } from 'react-native-svg'
import * as Haptics from 'expo-haptics'
import { C } from '@/lib/theme'

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z"
        fill={color}
      />
    </Svg>
  )
}

function LogbookIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 3h12a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 1-2Z"
        fill={color}
      />
      <Rect x={8} y={7} width={8} height={1.8} rx={0.9} fill={C.bg} />
      <Rect x={8} y={11} width={6} height={1.8} rx={0.9} fill={C.bg} />
    </Svg>
  )
}

function OverviewIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={12} width={4.5} height={9} rx={1.5} fill={color} />
      <Rect x={9.75} y={6} width={4.5} height={15} rx={1.5} fill={color} />
      <Rect x={16.5} y={9} width={4.5} height={12} rx={1.5} fill={color} />
    </Svg>
  )
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm9 3.5a7.6 7.6 0 0 0-.13-1.4l2-1.55-2-3.46-2.36.95a7.5 7.5 0 0 0-2.42-1.4L13.7 2h-3.4l-.39 2.74a7.5 7.5 0 0 0-2.42 1.4L5.13 5.2l-2 3.46 2 1.55a7.7 7.7 0 0 0 0 2.8l-2 1.55 2 3.46 2.36-.95a7.5 7.5 0 0 0 2.42 1.4L10.3 22h3.4l.39-2.74a7.5 7.5 0 0 0 2.42-1.4l2.36.95 2-3.46-2-1.55c.08-.46.13-.93.13-1.4Z"
        fill={color}
      />
      <Circle cx={12} cy={12} r={2.4} fill={C.bg} />
    </Svg>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: C.bg },
        headerTintColor: C.text,
        headerTitleStyle: { fontWeight: '800', color: C.text, fontSize: 18 },
        headerShadowVisible: false,
        tabBarActiveTintColor: C.greenBright,
        tabBarInactiveTintColor: C.textMuted,
        tabBarStyle: {
          backgroundColor: C.bgElevated,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.5,
        },
        tabBarButton: (props) => {
          const { onPress, ...rest } = props as any
          return (
            <Pressable
              {...rest}
              onPress={(e) => {
                Haptics.selectionAsync()
                onPress?.(e)
              }}
            />
          )
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="logbook"
        options={{
          title: 'Logbook',
          headerShown: false,
          tabBarIcon: ({ color }) => <LogbookIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <OverviewIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
    </Tabs>
  )
}
