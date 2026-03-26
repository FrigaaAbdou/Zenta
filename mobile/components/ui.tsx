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

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
} as const

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const

export const typography = {
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 1.6,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodyStrong: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500' as const,
  },
  button: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  titleSm: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  titleMd: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  titleLg: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700' as const,
  },
} as const

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  focus: {
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
} as const

export const layout = {
  screenPadding: spacing.md,
  sectionGap: spacing.md,
  controlMinHeight: 46,
  buttonHeights: {
    default: 50,
    sm: 42,
    icon: 44,
    iconSm: 36,
  },
} as const

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
  layout,
} as const

type CardProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

type ButtonProps = {
  children?: ReactNode
  icon?: IconName
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'icon' | 'icon-sm'
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
          size={size === 'icon' ? 18 : size === 'icon-sm' ? 16 : 16}
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
  size = 'icon',
  disabled,
  style,
}: {
  icon: IconName
  onPress?: () => void
  variant?: ButtonProps['variant']
  size?: Extract<ButtonProps['size'], 'icon' | 'icon-sm'>
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}) {
  return (
    <Button
      icon={icon}
      variant={variant}
      size={size}
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
    borderRadius: radii.pill,
  },
  sm: {
    borderRadius: radii.pill,
  },
  icon: {
    borderRadius: radii.pill,
  },
  'icon-sm': {
    borderRadius: radii.pill,
  },
})

const sizeFillStyles = StyleSheet.create({
  default: {
    minHeight: layout.buttonHeights.default,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 1,
  },
  sm: {
    minHeight: layout.buttonHeights.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  icon: {
    width: layout.buttonHeights.icon,
    height: layout.buttonHeights.icon,
  },
  'icon-sm': {
    width: layout.buttonHeights.iconSm,
    height: layout.buttonHeights.iconSm,
  },
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    ...shadows.card,
  },
  cardHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.xs - 2,
  },
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm + 2,
  },
  cardTitle: {
    color: colors.text,
    ...typography.titleMd,
  },
  cardDescription: {
    color: colors.muted,
    ...typography.label,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    color: colors.muted,
    ...typography.label,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs - 2,
    alignSelf: 'flex-start',
    minHeight: 30,
    paddingHorizontal: spacing.sm - 2,
    paddingVertical: spacing.xs - 2,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  badgeText: {
    ...typography.caption,
  },
  buttonBase: {
    overflow: 'hidden',
  },
  buttonFill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  buttonText: {
    ...typography.button,
  },
  buttonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  input: {
    minHeight: layout.controlMinHeight,
    borderRadius: radii.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    color: colors.text,
    ...typography.body,
  },
  textArea: {
    minHeight: 104,
    borderRadius: radii.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    color: colors.text,
    ...typography.body,
  },
  inputFocused: {
    borderColor: '#334155',
    ...shadows.focus,
  },
})
