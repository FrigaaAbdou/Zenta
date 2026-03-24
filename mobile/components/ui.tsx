import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useState, type ComponentProps, type ReactNode } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native'

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name']

export const colors = {
  bg: '#0B0F14',
  surface: '#121821',
  surfaceMuted: '#151D28',
  border: '#1E2632',
  text: '#E6EDF3',
  muted: '#9AA4B2',
  run: '#22C55E',
  swim: '#3B82F6',
  bike: '#F97316',
  strength: '#A855F7',
  recovery: '#94A3B8',
  destructive: '#EF4444',
  ring: 'rgba(230, 237, 243, 0.18)',
}

type CardProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

type ButtonProps = {
  children?: ReactNode
  icon?: IconName
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'icon'
  onPress?: () => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

type BadgeProps = {
  label: string
  icon?: IconName
  tint?: string
  style?: StyleProp<ViewStyle>
}

type FieldProps = TextInputProps & {
  style?: StyleProp<TextStyle>
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function CardHeader({
  children,
  style,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}) {
  return <View style={[styles.cardHeader, style]}>{children}</View>
}

export function CardContent({
  children,
  style,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}) {
  return <View style={[styles.cardContent, style]}>{children}</View>
}

export function CardTitle({
  children,
  style,
}: {
  children: ReactNode
  style?: StyleProp<TextStyle>
}) {
  return <Text style={[styles.cardTitle, style]}>{children}</Text>
}

export function CardDescription({
  children,
  style,
}: {
  children: ReactNode
  style?: StyleProp<TextStyle>
}) {
  return <Text style={[styles.cardDescription, style]}>{children}</Text>
}

export function Separator({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.separator, style]} />
}

export function Label({
  children,
  style,
}: {
  children: ReactNode
  style?: StyleProp<TextStyle>
}) {
  return <Text style={[styles.label, style]}>{children}</Text>
}

export function Badge({ label, icon, tint = colors.muted, style }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: `${tint}18`, borderColor: `${tint}30` }, style]}>
      {icon ? <MaterialCommunityIcons name={icon} size={14} color={tint} /> : null}
      <Text style={[styles.badgeText, { color: tint }]}>{label}</Text>
    </View>
  )
}

export function Button({
  children,
  icon,
  variant = 'default',
  size = 'default',
  onPress,
  disabled,
  style,
  textStyle,
}: ButtonProps) {
  const content = (
    <>
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={size === 'icon' ? 18 : 16}
          color={resolveButtonTextColor(variant, disabled)}
        />
      ) : null}
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text style={[styles.buttonText, buttonTextStyles[variant], textStyle]}>{children}</Text>
      ) : children ? (
        children
      ) : null}
    </>
  )

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        sizeStyles[size],
        buttonVariantStyles[variant],
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <View style={[styles.buttonFill, sizeFillStyles[size]]}>{content}</View>
    </Pressable>
  )
}

export function IconButton({
  icon,
  onPress,
  variant = 'outline',
  disabled,
  style,
}: {
  icon: IconName
  onPress?: () => void
  variant?: ButtonProps['variant']
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}) {
  return (
    <Button
      icon={icon}
      variant={variant}
      size="icon"
      onPress={onPress}
      disabled={disabled}
      style={style}
    />
  )
}

export function Input({ style, onBlur, onFocus, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false)

  return (
    <TextInput
      {...props}
      placeholderTextColor="#6B7787"
      onFocus={(event) => {
        setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={[styles.input, focused && styles.inputFocused, style]}
    />
  )
}

export function TextArea({ style, onBlur, onFocus, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false)

  return (
    <TextInput
      {...props}
      multiline
      placeholderTextColor="#6B7787"
      textAlignVertical="top"
      onFocus={(event) => {
        setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={[styles.textArea, focused && styles.inputFocused, style]}
    />
  )
}

function resolveButtonTextColor(variant: NonNullable<ButtonProps['variant']>, disabled?: boolean) {
  if (disabled) return colors.muted
  if (variant === 'default') return colors.bg
  if (variant === 'destructive') return '#FFFFFF'
  return colors.text
}

const buttonVariantStyles = StyleSheet.create({
  default: {
    borderWidth: 1,
    borderColor: 'rgba(230, 237, 243, 0.14)',
    backgroundColor: colors.text,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.destructive,
  },
})

const buttonTextStyles = StyleSheet.create({
  default: {
    color: colors.bg,
  },
  outline: {
    color: colors.text,
  },
  secondary: {
    color: colors.text,
  },
  ghost: {
    color: colors.text,
  },
  destructive: {
    color: '#FFFFFF',
  },
})

const sizeStyles = StyleSheet.create({
  default: {
    borderRadius: 999,
  },
  sm: {
    borderRadius: 999,
  },
  icon: {
    borderRadius: 999,
  },
})

const sizeFillStyles = StyleSheet.create({
  default: {
    minHeight: 50,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  sm: {
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  icon: {
    width: 44,
    height: 44,
  },
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 6,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 14,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  cardDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    minHeight: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonBase: {
    overflow: 'hidden',
  },
  buttonFill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
  },
  textArea: {
    minHeight: 104,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
  },
  inputFocused: {
    borderColor: '#334155',
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
})
