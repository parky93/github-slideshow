import React, { useRef, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Animated,
  SafeAreaView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native'
import { C, RADIUS } from '@/lib/theme'

interface Props {
  visible: boolean
  title: string
  options: string[]
  selected: string
  onSelect: (v: string) => void
  onClose: () => void
}

export function PickerModal({ visible, title, options, selected, onSelect, onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(400)).current

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 220,
        useNativeDriver: true,
      }).start()
    }
  }, [visible, slideAnim])

  const handleSelect = (option: string) => {
    onSelect(option)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        pointerEvents="box-none"
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Handle bar */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {/* Title + close */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
              onPress={onClose}
              hitSlop={12}
            >
              <View style={styles.closeX1} />
              <View style={styles.closeX2} />
            </Pressable>
          </View>

          {/* Options list */}
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item === selected
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.option,
                    isSelected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {item}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <View style={styles.checkShort} />
                      <View style={styles.checkLong} />
                    </View>
                  )}
                </Pressable>
              )
            }}
          />
        </SafeAreaView>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: C.border,
    maxHeight: '75%',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    // Elevation for Android
    elevation: 20,
  },
  safeArea: {
    flex: 1,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    flex: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  closeX1: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: C.textMuted,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  closeX2: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: C.textMuted,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    marginBottom: 4,
  },
  optionSelected: {
    backgroundColor: C.surfaceHi,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionText: {
    fontSize: 15,
    color: C.textSec,
    fontWeight: '500',
    flex: 1,
  },
  optionTextSelected: {
    color: C.text,
    fontWeight: '700',
  },
  checkmark: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  checkShort: {
    position: 'absolute',
    width: 5,
    height: 2,
    backgroundColor: C.green,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateX: -2 }, { translateY: 1 }],
  },
  checkLong: {
    position: 'absolute',
    width: 9,
    height: 2,
    backgroundColor: C.green,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateX: 2 }, { translateY: -1 }],
  },
})
