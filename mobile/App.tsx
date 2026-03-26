import AsyncStorage from '@react-native-async-storage/async-storage'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Calendar from 'expo-calendar'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import {
  Alert,
  Animated,
  Easing,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  IconButton,
  Input,
  Label,
  Separator,
  TextArea,
  colors,
  layout,
  radii,
  spacing,
  typography,
  type IconName,
} from './components/ui'

type Sport = 'Swim' | 'Bike' | 'Run' | 'Strength' | 'Mobility' | 'Rest'
type SessionStatus = 'Planned' | 'Completed' | 'Skipped'
type ExerciseSideMode = 'none' | 'per-side' | 'both-sides'
type TabKey = 'today' | 'plan' | 'exercises' | 'progress'
type WorkoutSection = 'Warm-up' | 'Main' | 'Cooldown'
type ExerciseLibraryQuickFilter =
  | 'All'
  | 'Favorites'
  | 'Recent'
  | 'Technique'
  | 'Endurance'
  | 'Threshold'
  | 'Recovery'
  | 'Brick'
  | 'Drill'
type ExerciseTemplateKind =
  | 'swim_set'
  | 'bike_workout'
  | 'run_workout'
  | 'strength_exercise'
  | 'mobility_drill'
  | 'recovery_block'
type SwimDistanceUnit = 'm' | 'yd'
type RunDistanceUnit = 'm' | 'km'
type SwimEnvironment = 'pool' | 'open_water'
type RunFormat = 'continuous' | 'intervals'

type SessionExercise = {
  id: string
  exerciseId: string | null
  title: string
  sets: number
  reps: number
  restSeconds: number
  sideMode: ExerciseSideMode
  sideLabel: string
}

type SessionBlock = SessionExercise & {
  section: WorkoutSection
}

type Session = {
  id: string
  title: string
  sport: Sport
  date: string
  startTime: string
  durationMin: number
  intensity: string
  status: SessionStatus
  favorite: boolean
  notificationsEnabled: boolean
  notificationOffsetMinutes: number
  notificationId: string | null
  blocks: SessionBlock[]
}

type SessionDraft = Omit<Session, 'id' | 'notificationId'>

type SessionTemplate = {
  id: string
  title: string
  sport: Sport
  startTime: string
  durationMin: number
  intensity: string
  favorite: boolean
  blocks: SessionBlock[]
}

type SessionTemplateDraft = Omit<SessionTemplate, 'id'>

type WeekTemplateSession = {
  dayOffset: number
  title: string
  sport: Sport
  startTime: string
  durationMin: number
  intensity: string
  favorite: boolean
  blocks: SessionBlock[]
}

type WeekTemplate = {
  id: string
  title: string
  objective: string
  favorite: boolean
  sessions: WeekTemplateSession[]
}

type WeekTemplateDraft = Omit<WeekTemplate, 'id'>
type BackupMode = 'export' | 'import'
type FeedbackTone = 'success' | 'info' | 'warning' | 'error'

type SwimPrescription = {
  kind: 'swim_set'
  reps: number
  distance: number
  distanceUnit: SwimDistanceUnit
  restSeconds: number
  equipment: string
  stroke: string
  focus: string
  intensity: string
  environment: SwimEnvironment
}

type BikePrescription = {
  kind: 'bike_workout'
  reps: number
  workDurationMin: number
  recoveryDurationMin: number
  zone: string
  cadence: number
  terrain: string
  indoor: boolean
  focus: string
}

type RunPrescription = {
  kind: 'run_workout'
  format: RunFormat
  reps: number
  distance: number
  distanceUnit: RunDistanceUnit
  durationMin: number
  recoverySeconds: number
  zone: string
  terrain: string
  brick: boolean
  focus: string
}

type StrengthPrescription = {
  kind: 'strength_exercise'
  sets: number
  reps: number
  restSeconds: number
  sideMode: ExerciseSideMode
  bodyPart: string
  loadType: string
  equipment: string
  focus: string
}

type MobilityPrescription = {
  kind: 'mobility_drill'
  sets: number
  reps: number
  durationSeconds: number
  sideMode: ExerciseSideMode
  bodyPart: string
  focus: string
}

type RecoveryPrescription = {
  kind: 'recovery_block'
  durationMin: number
  focus: string
}

type ExercisePrescription =
  | SwimPrescription
  | BikePrescription
  | RunPrescription
  | StrengthPrescription
  | MobilityPrescription
  | RecoveryPrescription

type Exercise = {
  id: string
  title: string
  sport: Sport
  templateKind: ExerciseTemplateKind
  category: string
  description: string
  tags: string[]
  favorite: boolean
  isCustom: boolean
  prescription: ExercisePrescription
  useCount: number
  lastUsedAt: string | null
}

type ExerciseTemplatePreset = {
  id: string
  title: string
  sport: Sport
  templateKind: ExerciseTemplateKind
  category: string
  description: string
  tags: string[]
  prescription: ExercisePrescription
}

const storageKey = 'zenta-mobile-sessions-v3'
const exerciseTemplatesStorageKey = 'zenta-mobile-exercise-templates-v1'
const sessionTemplatesStorageKey = 'zenta-mobile-session-templates-v1'
const weekTemplatesStorageKey = 'zenta-mobile-week-templates-v1'
const legacyStorageKeys = ['zenta-mobile-sessions-v2']
const sportOrder: Sport[] = ['Swim', 'Bike', 'Run', 'Strength', 'Mobility', 'Rest']
const statusOrder: SessionStatus[] = ['Planned', 'Completed', 'Skipped']
const exerciseFilters: Array<Sport | 'All'> = ['All', ...sportOrder]
const exerciseTypeFilters: Array<ExerciseTemplateKind | 'All'> = [
  'All',
  'swim_set',
  'bike_workout',
  'run_workout',
  'strength_exercise',
  'mobility_drill',
  'recovery_block',
]
const exerciseQuickFilters: ExerciseLibraryQuickFilter[] = [
  'All',
  'Favorites',
  'Recent',
  'Technique',
  'Endurance',
  'Threshold',
  'Recovery',
  'Brick',
  'Drill',
]
const sideModeOptions: Array<{ value: ExerciseSideMode; label: string }> = [
  { value: 'none', label: 'Single' },
  { value: 'per-side', label: 'Per side' },
  { value: 'both-sides', label: 'Both sides' },
]
const workoutSectionOrder: WorkoutSection[] = ['Warm-up', 'Main', 'Cooldown']
const reminderOffsetOptions = [15, 60, 180]
const durationStep = 5
const intensityOptions = ['Recovery', 'Easy', 'Zone 2', 'Zone 3', 'Zone 4', 'Threshold', 'Controlled']
const exerciseCategoryOptions = [
  'Technique',
  'Endurance',
  'Threshold',
  'Recovery',
  'Durability',
  'Race Specific',
  'Custom',
]
const bodyPartOptions = ['leg', 'arm', 'shoulder', 'hip', 'core', 'side']
const tabItems: Array<{ key: TabKey; label: string; icon: IconName }> = [
  { key: 'today', label: 'Today', icon: 'calendar-today' },
  { key: 'plan', label: 'Plan', icon: 'calendar-week' },
  { key: 'exercises', label: 'Templates', icon: 'dumbbell' },
  { key: 'progress', label: 'Progress', icon: 'chart-box-outline' },
]

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

const sportMeta: Record<Sport, { icon: IconName; color: string }> = {
  Swim: { icon: 'waves', color: colors.swim },
  Bike: { icon: 'bike-fast', color: colors.bike },
  Run: { icon: 'run-fast', color: colors.run },
  Strength: { icon: 'dumbbell', color: colors.strength },
  Mobility: { icon: 'meditation', color: colors.recovery },
  Rest: { icon: 'moon-waning-crescent', color: colors.recovery },
}

const seedExerciseTemplates: Exercise[] = [
  {
    id: 'zone-2-run',
    title: 'Zone 2 Run',
    sport: 'Run',
    templateKind: 'run_workout',
    category: 'Endurance',
    description: 'Steady aerobic running to build base without excess fatigue.',
    tags: ['easy', 'aerobic', 'endurance'],
    favorite: false,
    isCustom: false,
    useCount: 0,
    lastUsedAt: null,
    prescription: {
      kind: 'run_workout',
      format: 'continuous',
      reps: 1,
      distance: 0,
      distanceUnit: 'km',
      durationMin: 45,
      recoverySeconds: 0,
      zone: 'Zone 2',
      terrain: 'road',
      brick: false,
      focus: 'Aerobic base',
    },
  },
  {
    id: 'brick-workout',
    title: 'Brick Workout',
    sport: 'Bike',
    templateKind: 'bike_workout',
    category: 'Race Specific',
    description: 'Bike into a short run to train the transition and pacing control.',
    tags: ['brick', 'transition', 'triathlon'],
    favorite: false,
    isCustom: false,
    useCount: 0,
    lastUsedAt: null,
    prescription: {
      kind: 'bike_workout',
      reps: 1,
      workDurationMin: 60,
      recoveryDurationMin: 0,
      zone: 'Zone 3',
      cadence: 90,
      terrain: 'road',
      indoor: false,
      focus: 'Brick pacing',
    },
  },
  {
    id: 'cadence-drill',
    title: 'Cadence Drill',
    sport: 'Run',
    templateKind: 'run_workout',
    category: 'Technique',
    description: 'Quick rhythm work to improve turnover and reduce overstriding.',
    tags: ['cadence', 'drill', 'form'],
    favorite: false,
    isCustom: false,
    useCount: 0,
    lastUsedAt: null,
    prescription: {
      kind: 'run_workout',
      format: 'intervals',
      reps: 4,
      distance: 200,
      distanceUnit: 'm',
      durationMin: 0,
      recoverySeconds: 30,
      zone: 'Zone 3',
      terrain: 'track',
      brick: false,
      focus: 'Turnover',
    },
  },
  {
    id: 'swim-technique',
    title: 'Swim Technique',
    sport: 'Swim',
    templateKind: 'swim_set',
    category: 'Technique',
    description: 'Drill-focused pool work to improve catch and breathing rhythm.',
    tags: ['swim', 'drills', 'pool'],
    favorite: false,
    isCustom: false,
    useCount: 0,
    lastUsedAt: null,
    prescription: {
      kind: 'swim_set',
      reps: 6,
      distance: 50,
      distanceUnit: 'm',
      restSeconds: 20,
      equipment: 'none',
      stroke: 'freestyle',
      focus: 'Catch and breathing',
      intensity: 'Easy',
      environment: 'pool',
    },
  },
  {
    id: 'pull-buoy-set',
    title: 'Pull Buoy Set',
    sport: 'Swim',
    templateKind: 'swim_set',
    category: 'Strength Endurance',
    description: 'Upper-body swim set with a pull buoy to reinforce alignment and a clean catch.',
    tags: ['pool', 'pull buoy', 'catch'],
    favorite: false,
    isCustom: false,
    useCount: 0,
    lastUsedAt: null,
    prescription: {
      kind: 'swim_set',
      reps: 8,
      distance: 100,
      distanceUnit: 'm',
      restSeconds: 15,
      equipment: 'pull buoy',
      stroke: 'freestyle',
      focus: 'Alignment',
      intensity: 'Threshold',
      environment: 'pool',
    },
  },
  {
    id: 'interval-bike',
    title: 'Interval Bike',
    sport: 'Bike',
    templateKind: 'bike_workout',
    category: 'Threshold',
    description: 'Structured efforts to raise threshold and improve sustainable power.',
    tags: ['bike', 'tempo', 'threshold'],
    favorite: false,
    isCustom: false,
    useCount: 0,
    lastUsedAt: null,
    prescription: {
      kind: 'bike_workout',
      reps: 4,
      workDurationMin: 8,
      recoveryDurationMin: 3,
      zone: 'Zone 4',
      cadence: 90,
      terrain: 'trainer',
      indoor: true,
      focus: 'Threshold power',
    },
  },
  {
    id: 'strength-foundation',
    title: 'Strength Foundation',
    sport: 'Strength',
    templateKind: 'strength_exercise',
    category: 'Durability',
    description: 'Single-leg and trunk work to support swim-bike-run volume.',
    tags: ['strength', 'durability', 'gym'],
    favorite: false,
    isCustom: false,
    useCount: 0,
    lastUsedAt: null,
    prescription: {
      kind: 'strength_exercise',
      sets: 3,
      reps: 8,
      restSeconds: 60,
      sideMode: 'per-side',
      bodyPart: 'leg',
      loadType: 'moderate',
      equipment: 'dumbbell',
      focus: 'Stability',
    },
  },
  {
    id: 'mobility-hips',
    title: 'Mobility Hips',
    sport: 'Mobility',
    templateKind: 'mobility_drill',
    category: 'Recovery',
    description: 'Hip, glute, and lower-back mobility to absorb training load.',
    tags: ['mobility', 'hips', 'recovery'],
    favorite: false,
    isCustom: false,
    useCount: 0,
    lastUsedAt: null,
    prescription: {
      kind: 'mobility_drill',
      sets: 2,
      reps: 6,
      durationSeconds: 45,
      sideMode: 'per-side',
      bodyPart: 'hip',
      focus: 'Hip opening',
    },
  },
  {
    id: 'full-rest',
    title: 'Full Rest',
    sport: 'Rest',
    templateKind: 'recovery_block',
    category: 'Recovery',
    description: 'A recovery day with no training load beyond easy walking.',
    tags: ['rest', 'recovery'],
    favorite: false,
    isCustom: false,
    useCount: 0,
    lastUsedAt: null,
    prescription: {
      kind: 'recovery_block',
      durationMin: 0,
      focus: 'Full recovery',
    },
  },
]

const exerciseTemplatePresets: Record<ExerciseTemplateKind, ExerciseTemplatePreset[]> = {
  swim_set: [
    {
      id: 'swim-technique-preset',
      title: 'Technique Swim Set',
      sport: 'Swim',
      templateKind: 'swim_set',
      category: 'Technique',
      description: 'Short drill repeats to improve catch, alignment, and breathing rhythm.',
      tags: ['swim', 'technique', 'drill'],
      prescription: {
        kind: 'swim_set',
        reps: 8,
        distance: 50,
        distanceUnit: 'm',
        restSeconds: 20,
        equipment: 'none',
        stroke: 'drill',
        focus: 'Technique',
        intensity: 'Easy',
        environment: 'pool',
      },
    },
    {
      id: 'swim-threshold-preset',
      title: 'Threshold Swim Set',
      sport: 'Swim',
      templateKind: 'swim_set',
      category: 'Threshold',
      description: 'Sustainable hard repeats to build swim-specific threshold tolerance.',
      tags: ['swim', 'threshold', 'pool'],
      prescription: {
        kind: 'swim_set',
        reps: 10,
        distance: 100,
        distanceUnit: 'm',
        restSeconds: 15,
        equipment: 'none',
        stroke: 'freestyle',
        focus: 'Threshold',
        intensity: 'Threshold',
        environment: 'pool',
      },
    },
    {
      id: 'swim-pull-preset',
      title: 'Pull Buoy Set',
      sport: 'Swim',
      templateKind: 'swim_set',
      category: 'Endurance',
      description: 'Pull-focused repeat set for alignment and upper-body endurance.',
      tags: ['swim', 'pull buoy', 'endurance'],
      prescription: {
        kind: 'swim_set',
        reps: 8,
        distance: 100,
        distanceUnit: 'm',
        restSeconds: 20,
        equipment: 'pull buoy',
        stroke: 'freestyle',
        focus: 'Catch',
        intensity: 'Zone 3',
        environment: 'pool',
      },
    },
    {
      id: 'swim-recovery-preset',
      title: 'Recovery Swim',
      sport: 'Swim',
      templateKind: 'swim_set',
      category: 'Recovery',
      description: 'Easy aerobic swimming to reset after hard bike or run load.',
      tags: ['swim', 'recovery', 'easy'],
      prescription: {
        kind: 'swim_set',
        reps: 6,
        distance: 100,
        distanceUnit: 'm',
        restSeconds: 25,
        equipment: 'none',
        stroke: 'mixed',
        focus: 'Breathing',
        intensity: 'Recovery',
        environment: 'pool',
      },
    },
  ],
  bike_workout: [
    {
      id: 'bike-endurance-preset',
      title: 'Endurance Ride',
      sport: 'Bike',
      templateKind: 'bike_workout',
      category: 'Endurance',
      description: 'Steady aerobic ride for base volume and fueling practice.',
      tags: ['bike', 'endurance', 'aerobic'],
      prescription: {
        kind: 'bike_workout',
        reps: 1,
        workDurationMin: 90,
        recoveryDurationMin: 0,
        zone: 'Zone 2',
        cadence: 90,
        terrain: 'road',
        indoor: false,
        focus: 'Aerobic control',
      },
    },
    {
      id: 'bike-threshold-preset',
      title: 'Threshold Intervals',
      sport: 'Bike',
      templateKind: 'bike_workout',
      category: 'Threshold',
      description: 'Long controlled intervals to lift sustainable race power.',
      tags: ['bike', 'threshold', 'trainer'],
      prescription: {
        kind: 'bike_workout',
        reps: 4,
        workDurationMin: 10,
        recoveryDurationMin: 4,
        zone: 'Zone 4',
        cadence: 90,
        terrain: 'trainer',
        indoor: true,
        focus: 'Threshold power',
      },
    },
    {
      id: 'bike-vo2-preset',
      title: 'VO2 Set',
      sport: 'Bike',
      templateKind: 'bike_workout',
      category: 'Threshold',
      description: 'Short high-pressure repeats for top-end aerobic capacity.',
      tags: ['bike', 'vo2', 'intervals'],
      prescription: {
        kind: 'bike_workout',
        reps: 6,
        workDurationMin: 3,
        recoveryDurationMin: 3,
        zone: 'Zone 4',
        cadence: 100,
        terrain: 'trainer',
        indoor: true,
        focus: 'Cadence',
      },
    },
    {
      id: 'bike-brick-preset',
      title: 'Brick Bike',
      sport: 'Bike',
      templateKind: 'bike_workout',
      category: 'Race Specific',
      description: 'Race-oriented ride designed to lead directly into a run.',
      tags: ['bike', 'brick', 'triathlon'],
      prescription: {
        kind: 'bike_workout',
        reps: 1,
        workDurationMin: 60,
        recoveryDurationMin: 0,
        zone: 'Zone 3',
        cadence: 92,
        terrain: 'road',
        indoor: false,
        focus: 'Brick pacing',
      },
    },
  ],
  run_workout: [
    {
      id: 'run-zone2-preset',
      title: 'Zone 2 Run',
      sport: 'Run',
      templateKind: 'run_workout',
      category: 'Endurance',
      description: 'Easy steady running for aerobic durability and low stress volume.',
      tags: ['run', 'zone2', 'endurance'],
      prescription: {
        kind: 'run_workout',
        format: 'continuous',
        reps: 1,
        distance: 0,
        distanceUnit: 'km',
        durationMin: 50,
        recoverySeconds: 0,
        zone: 'Zone 2',
        terrain: 'road',
        brick: false,
        focus: 'Aerobic base',
      },
    },
    {
      id: 'run-tempo-preset',
      title: 'Tempo Run',
      sport: 'Run',
      templateKind: 'run_workout',
      category: 'Threshold',
      description: 'Controlled sustained tempo effort to improve race pace comfort.',
      tags: ['run', 'tempo', 'threshold'],
      prescription: {
        kind: 'run_workout',
        format: 'continuous',
        reps: 1,
        distance: 0,
        distanceUnit: 'km',
        durationMin: 40,
        recoverySeconds: 0,
        zone: 'Zone 3',
        terrain: 'road',
        brick: false,
        focus: 'Threshold',
      },
    },
    {
      id: 'run-threshold-preset',
      title: 'Threshold Intervals',
      sport: 'Run',
      templateKind: 'run_workout',
      category: 'Threshold',
      description: 'Track-style repeats to build threshold speed with controlled recovery.',
      tags: ['run', 'threshold', 'track'],
      prescription: {
        kind: 'run_workout',
        format: 'intervals',
        reps: 6,
        distance: 800,
        distanceUnit: 'm',
        durationMin: 0,
        recoverySeconds: 90,
        zone: 'Zone 4',
        terrain: 'track',
        brick: false,
        focus: 'Threshold',
      },
    },
    {
      id: 'run-brick-preset',
      title: 'Brick Run',
      sport: 'Run',
      templateKind: 'run_workout',
      category: 'Race Specific',
      description: 'Short post-bike run to lock in triathlon rhythm and pacing.',
      tags: ['run', 'brick', 'transition'],
      prescription: {
        kind: 'run_workout',
        format: 'continuous',
        reps: 1,
        distance: 0,
        distanceUnit: 'km',
        durationMin: 20,
        recoverySeconds: 0,
        zone: 'Zone 3',
        terrain: 'road',
        brick: true,
        focus: 'Brick pace',
      },
    },
  ],
  strength_exercise: [
    {
      id: 'strength-lower-body-preset',
      title: 'Lower Body Stability',
      sport: 'Strength',
      templateKind: 'strength_exercise',
      category: 'Durability',
      description: 'Single-leg lower-body work to support run durability and bike stability.',
      tags: ['strength', 'stability', 'legs'],
      prescription: {
        kind: 'strength_exercise',
        sets: 3,
        reps: 8,
        restSeconds: 60,
        sideMode: 'per-side',
        bodyPart: 'leg',
        loadType: 'moderate',
        equipment: 'dumbbell',
        focus: 'Stability',
      },
    },
    {
      id: 'strength-trunk-preset',
      title: 'Trunk Strength',
      sport: 'Strength',
      templateKind: 'strength_exercise',
      category: 'Durability',
      description: 'Core and trunk-focused work to stay stable through swim, bike, and run.',
      tags: ['strength', 'core', 'durability'],
      prescription: {
        kind: 'strength_exercise',
        sets: 3,
        reps: 10,
        restSeconds: 45,
        sideMode: 'none',
        bodyPart: 'core',
        loadType: 'bodyweight',
        equipment: 'none',
        focus: 'Core',
      },
    },
    {
      id: 'strength-single-leg-preset',
      title: 'Single-Leg Durability',
      sport: 'Strength',
      templateKind: 'strength_exercise',
      category: 'Durability',
      description: 'Triathlon-specific single-leg strength to handle repetitive load cleanly.',
      tags: ['strength', 'single-leg', 'durability'],
      prescription: {
        kind: 'strength_exercise',
        sets: 4,
        reps: 6,
        restSeconds: 75,
        sideMode: 'per-side',
        bodyPart: 'leg',
        loadType: 'moderate',
        equipment: 'kettlebell',
        focus: 'Durability',
      },
    },
  ],
  mobility_drill: [
    {
      id: 'mobility-hips-preset',
      title: 'Hip Reset',
      sport: 'Mobility',
      templateKind: 'mobility_drill',
      category: 'Recovery',
      description: 'Open hips and glutes after heavy run or bike work.',
      tags: ['mobility', 'hips', 'recovery'],
      prescription: {
        kind: 'mobility_drill',
        sets: 2,
        reps: 6,
        durationSeconds: 45,
        sideMode: 'per-side',
        bodyPart: 'hip',
        focus: 'Hip opening',
      },
    },
    {
      id: 'mobility-calves-preset',
      title: 'Calf Release',
      sport: 'Mobility',
      templateKind: 'mobility_drill',
      category: 'Recovery',
      description: 'Calf and ankle reset to absorb repetitive run impact better.',
      tags: ['mobility', 'calves', 'recovery'],
      prescription: {
        kind: 'mobility_drill',
        sets: 2,
        reps: 8,
        durationSeconds: 30,
        sideMode: 'per-side',
        bodyPart: 'leg',
        focus: 'Ankles',
      },
    },
    {
      id: 'mobility-shoulders-preset',
      title: 'Shoulder Opener',
      sport: 'Mobility',
      templateKind: 'mobility_drill',
      category: 'Recovery',
      description: 'Short shoulder and thoracic opener for better swim position.',
      tags: ['mobility', 'shoulders', 'swim'],
      prescription: {
        kind: 'mobility_drill',
        sets: 2,
        reps: 6,
        durationSeconds: 40,
        sideMode: 'both-sides',
        bodyPart: 'shoulder',
        focus: 'Shoulders',
      },
    },
    {
      id: 'mobility-post-ride-preset',
      title: 'Post-Ride Reset',
      sport: 'Mobility',
      templateKind: 'mobility_drill',
      category: 'Recovery',
      description: 'Quick mobility sequence to open hips and thoracic rotation after riding.',
      tags: ['mobility', 'post-ride', 'recovery'],
      prescription: {
        kind: 'mobility_drill',
        sets: 2,
        reps: 5,
        durationSeconds: 45,
        sideMode: 'per-side',
        bodyPart: 'hip',
        focus: 'Thoracic rotation',
      },
    },
  ],
  recovery_block: [
    {
      id: 'recovery-full-rest-preset',
      title: 'Full Rest',
      sport: 'Rest',
      templateKind: 'recovery_block',
      category: 'Recovery',
      description: 'No training load beyond walking, fueling, and sleep focus.',
      tags: ['rest', 'recovery'],
      prescription: {
        kind: 'recovery_block',
        durationMin: 0,
        focus: 'Full recovery',
      },
    },
    {
      id: 'recovery-walk-preset',
      title: 'Walk Reset',
      sport: 'Rest',
      templateKind: 'recovery_block',
      category: 'Recovery',
      description: 'Easy walk and light circulation session to stay loose without adding stress.',
      tags: ['walk', 'recovery', 'easy'],
      prescription: {
        kind: 'recovery_block',
        durationMin: 25,
        focus: 'Walk',
      },
    },
  ],
}

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(buildSeedSessions())
  const [exerciseTemplates, setExerciseTemplates] = useState<Exercise[]>(seedExerciseTemplates)
  const [sessionTemplates, setSessionTemplates] = useState<SessionTemplate[]>(buildSeedSessionTemplates())
  const [weekTemplates, setWeekTemplates] = useState<WeekTemplate[]>(buildSeedWeekTemplates())
  const [activeTab, setActiveTab] = useState<TabKey>('today')
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => toDateKey(startOfWeek(new Date())))
  const [exerciseQuery, setExerciseQuery] = useState('')
  const [exerciseFilter, setExerciseFilter] = useState<(typeof exerciseFilters)[number]>('All')
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<(typeof exerciseTypeFilters)[number]>('All')
  const [exerciseQuickFilter, setExerciseQuickFilter] = useState<ExerciseLibraryQuickFilter>('All')
  const [customExerciseTitle, setCustomExerciseTitle] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showExerciseTemplateForm, setShowExerciseTemplateForm] = useState(false)
  const [showSessionTemplateForm, setShowSessionTemplateForm] = useState(false)
  const [showWeekTemplateForm, setShowWeekTemplateForm] = useState(false)
  const [showBackupSheet, setShowBackupSheet] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingExerciseTemplateId, setEditingExerciseTemplateId] = useState<string | null>(null)
  const [editingSessionTemplateId, setEditingSessionTemplateId] = useState<string | null>(null)
  const [draft, setDraft] = useState<SessionDraft>(createEmptyDraft(toDateKey(new Date())))
  const [exerciseTemplateDraft, setExerciseTemplateDraft] = useState<Exercise>(() =>
    createExerciseTemplateDraft(),
  )
  const [sessionTemplateDraft, setSessionTemplateDraft] = useState<SessionTemplateDraft>(() =>
    createEmptySessionTemplateDraft(),
  )
  const [weekTemplateDraft, setWeekTemplateDraft] = useState<WeekTemplateDraft>(() =>
    createEmptyWeekTemplateDraft(),
  )
  const [exerciseTemplateTagsInput, setExerciseTemplateTagsInput] = useState('')
  const [draftCustomExerciseTitle, setDraftCustomExerciseTitle] = useState('')
  const [templateCustomExerciseTitle, setTemplateCustomExerciseTitle] = useState('')
  const [exerciseAttachSection, setExerciseAttachSection] = useState<WorkoutSection>('Main')
  const [hydrated, setHydrated] = useState(false)
  const [templatesHydrated, setTemplatesHydrated] = useState(false)
  const [sessionTemplatesHydrated, setSessionTemplatesHydrated] = useState(false)
  const [weekTemplatesHydrated, setWeekTemplatesHydrated] = useState(false)
  const [editingWeekTemplateId, setEditingWeekTemplateId] = useState<string | null>(null)
  const [backupMode, setBackupMode] = useState<BackupMode>('export')
  const [backupText, setBackupText] = useState('')
  const [backupNotice, setBackupNotice] = useState<string | null>(null)
  const [showSessionDatePicker, setShowSessionDatePicker] = useState(false)
  const [showSessionTimePicker, setShowSessionTimePicker] = useState(false)
  const [showSessionTemplateTimePicker, setShowSessionTemplateTimePicker] = useState(false)
  const [appFeedback, setAppFeedback] = useState<{ tone: FeedbackTone; message: string } | null>(null)
  const screenTransition = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (Platform.OS !== 'android') return

    Notifications.setNotificationChannelAsync('zenta-reminders', {
      name: 'Zenta reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: colors.swim,
    }).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }, [])

  useEffect(() => {
    if (!appFeedback) return

    const timeout = setTimeout(() => {
      setAppFeedback(null)
    }, 3200)

    return () => clearTimeout(timeout)
  }, [appFeedback])

  useEffect(() => {
    screenTransition.setValue(0)
    Animated.timing(screenTransition, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [activeTab, screenTransition])

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        let raw: string | null = null

        for (const key of [storageKey, ...legacyStorageKeys]) {
          raw = await AsyncStorage.getItem(key)
          if (raw) break
        }

        if (active && raw) {
          const parsed = JSON.parse(raw) as unknown
          if (Array.isArray(parsed)) {
            const normalized = parsed
              .map((session) => normalizeSession(session))
              .filter((session): session is Session => Boolean(session))

            if (normalized.length) {
              setSessions(sortSessions(normalized))
            }
          }
        }
      } finally {
        if (active) {
          setHydrated(true)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(weekTemplatesStorageKey)

        if (active && raw) {
          const parsed = JSON.parse(raw) as unknown

          if (Array.isArray(parsed)) {
            const normalized = parsed
              .map((template) => normalizeWeekTemplate(template))
              .filter((template): template is WeekTemplate => Boolean(template))

            if (normalized.length) {
              setWeekTemplates(sortWeekTemplates(normalized))
            }
          }
        }
      } finally {
        if (active) {
          setWeekTemplatesHydrated(true)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(sessionTemplatesStorageKey)

        if (active && raw) {
          const parsed = JSON.parse(raw) as unknown

          if (Array.isArray(parsed)) {
            const normalized = parsed
              .map((template) => normalizeSessionTemplate(template))
              .filter((template): template is SessionTemplate => Boolean(template))

            if (normalized.length) {
              setSessionTemplates(sortSessionTemplates(normalized))
            }
          }
        }
      } finally {
        if (active) {
          setSessionTemplatesHydrated(true)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(exerciseTemplatesStorageKey)

        if (active && raw) {
          const parsed = JSON.parse(raw) as unknown

          if (Array.isArray(parsed)) {
            const normalized = parsed
              .map((template) => normalizeExerciseTemplate(template))
              .filter((template): template is Exercise => Boolean(template))

            if (normalized.length) {
              setExerciseTemplates(sortExerciseTemplates(normalized))
            }
          }
        }
      } finally {
        if (active) {
          setTemplatesHydrated(true)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    AsyncStorage.setItem(storageKey, JSON.stringify(sessions)).catch(() => undefined)
  }, [hydrated, sessions])

  useEffect(() => {
    if (!templatesHydrated) return
    AsyncStorage.setItem(exerciseTemplatesStorageKey, JSON.stringify(exerciseTemplates)).catch(() => undefined)
  }, [exerciseTemplates, templatesHydrated])

  useEffect(() => {
    if (!sessionTemplatesHydrated) return
    AsyncStorage.setItem(sessionTemplatesStorageKey, JSON.stringify(sessionTemplates)).catch(() => undefined)
  }, [sessionTemplates, sessionTemplatesHydrated])

  useEffect(() => {
    if (!weekTemplatesHydrated) return
    AsyncStorage.setItem(weekTemplatesStorageKey, JSON.stringify(weekTemplates)).catch(() => undefined)
  }, [weekTemplates, weekTemplatesHydrated])

  const allSessions = useMemo(() => sortSessions(sessions), [sessions])
  const todayKey = toDateKey(new Date())
  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart])
  const weekSessions = useMemo(
    () => allSessions.filter((session) => isDateWithinWeek(session.date, weekStart)),
    [allSessions, weekStart],
  )
  const todaySessions = useMemo(
    () => allSessions.filter((session) => session.date === todayKey),
    [allSessions, todayKey],
  )
  const favoriteSessions = useMemo(
    () => allSessions.filter((session) => session.favorite).slice(0, 4),
    [allSessions],
  )

  const preferredSession = useMemo(
    () => todaySessions[0] ?? weekSessions[0] ?? allSessions[0] ?? null,
    [allSessions, todaySessions, weekSessions],
  )

  useEffect(() => {
    if (!preferredSession) {
      if (selectedSessionId !== null) {
        setSelectedSessionId(null)
      }
      return
    }

    if (!selectedSessionId || !allSessions.some((session) => session.id === selectedSessionId)) {
      setSelectedSessionId(preferredSession.id)
    }
  }, [allSessions, preferredSession, selectedSessionId])

  const selectedSession =
    allSessions.find((session) => session.id === selectedSessionId) ?? preferredSession

  const selectedBlocks =
    selectedSession?.blocks.map((block) => ({
      block,
      exercise: block.exerciseId
        ? exerciseTemplates.find((exercise) => exercise.id === block.exerciseId) ?? null
        : null,
    })) ?? []
  const selectedBlocksBySection = groupSessionBlockDetailsBySection(selectedBlocks)
  const exerciseTemplateMap = useMemo(
    () => new Map(exerciseTemplates.map((exercise) => [exercise.id, exercise])),
    [exerciseTemplates],
  )

  const draftExerciseOptions = useMemo(
    () => sortExercisesForSport(exerciseTemplates, draft.sport),
    [draft.sport, exerciseTemplates],
  )
  const sessionTemplateExerciseOptions = useMemo(
    () => sortExercisesForSport(exerciseTemplates, sessionTemplateDraft.sport),
    [exerciseTemplates, sessionTemplateDraft.sport],
  )
  const canAddCustomExercise = Boolean(customExerciseTitle.trim())
  const canAddDraftCustomExercise = Boolean(draftCustomExerciseTitle.trim())
  const canAddTemplateCustomExercise = Boolean(templateCustomExerciseTitle.trim())

  const visibleExercises = useMemo(() => {
    const query = exerciseQuery.trim().toLowerCase()

    return exerciseTemplates.filter((exercise) => {
      const matchesSport = exerciseFilter === 'All' || exercise.sport === exerciseFilter
      const matchesType =
        exerciseTypeFilter === 'All' || exercise.templateKind === exerciseTypeFilter
      const matchesQuick = matchesExerciseLibraryQuickFilter(exercise, exerciseQuickFilter)

      if (!matchesSport || !matchesType || !matchesQuick) return false
      if (!query) return true

      const searchText = [
        exercise.title,
        exercise.category,
        exercise.description,
        formatExerciseTemplateKindLabel(exercise.templateKind),
        formatExerciseTemplateSummary(exercise),
        ...exercise.tags,
      ]
        .join(' ')
        .toLowerCase()

      return searchText.includes(query)
    })
  }, [exerciseFilter, exerciseQuickFilter, exerciseQuery, exerciseTemplates, exerciseTypeFilter])
  const canSaveExerciseTemplate = Boolean(exerciseTemplateDraft.title.trim())
  const canSaveSessionTemplate = Boolean(sessionTemplateDraft.title.trim())
  const canSaveWeekTemplate =
    Boolean(weekTemplateDraft.title.trim()) && weekTemplateDraft.sessions.length > 0
  const parsedExerciseTemplateTags = exerciseTemplateTagsInput
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const currentExercisePresets = useMemo(
    () => exerciseTemplatePresets[exerciseTemplateDraft.templateKind] ?? [],
    [exerciseTemplateDraft.templateKind],
  )
  const templateTargetDate = selectedSession?.date ?? todayKey
  const templateTargetDateLabel = formatDetailDate(templateTargetDate)
  const visibleSessionTemplates = useMemo(
    () =>
      sortSessionTemplates(sessionTemplates).sort((left, right) => {
        const leftScore = selectedSession && left.sport === selectedSession.sport ? 0 : 1
        const rightScore = selectedSession && right.sport === selectedSession.sport ? 0 : 1
        if (leftScore !== rightScore) return leftScore - rightScore
        return left.title.localeCompare(right.title)
      }),
    [selectedSession, sessionTemplates],
  )
  const visibleWeekTemplates = useMemo(() => sortWeekTemplates(weekTemplates), [weekTemplates])
  const favoriteVisibleExercises = useMemo(
    () => visibleExercises.filter((exercise) => exercise.favorite).slice(0, 4),
    [visibleExercises],
  )
  const templateFocusSport = selectedSession?.sport ?? (exerciseFilter !== 'All' ? exerciseFilter : 'Run')
  const featuredTemplatePresets = useMemo(
    () =>
      Object.values(exerciseTemplatePresets)
        .flat()
        .filter((preset) => preset.sport === templateFocusSport)
        .slice(0, 3),
    [templateFocusSport],
  )
  const recommendedVisibleExercises = useMemo(
    () =>
      visibleExercises
        .filter((exercise) => exercise.sport === templateFocusSport)
        .slice(0, 4),
    [templateFocusSport, visibleExercises],
  )
  const recentlyUsedExercises = useMemo(
    () =>
      [...visibleExercises]
        .filter((exercise) => Boolean(exercise.lastUsedAt))
        .sort((left, right) => {
          const leftTime = left.lastUsedAt ? new Date(left.lastUsedAt).getTime() : 0
          const rightTime = right.lastUsedAt ? new Date(right.lastUsedAt).getTime() : 0
          return rightTime - leftTime
        })
        .slice(0, 4),
    [visibleExercises],
  )
  const librarySectionPinnedIds = useMemo(() => {
    if (exerciseQuery.trim() || exerciseQuickFilter !== 'All') return new Set<string>()
    return new Set([
      ...recommendedVisibleExercises.map((exercise) => exercise.id),
      ...favoriteVisibleExercises.map((exercise) => exercise.id),
      ...recentlyUsedExercises.map((exercise) => exercise.id),
    ])
  }, [
    exerciseQuery,
    exerciseQuickFilter,
    favoriteVisibleExercises,
    recommendedVisibleExercises,
    recentlyUsedExercises,
  ])
  const browseExercises = useMemo(
    () =>
      visibleExercises.filter((exercise) =>
        librarySectionPinnedIds.size ? !librarySectionPinnedIds.has(exercise.id) : true,
      ),
    [librarySectionPinnedIds, visibleExercises],
  )
  const currentWeekLabel = formatWeekRange(weekStart)

  const completedCount = weekSessions.filter((session) => session.status === 'Completed').length
  const totalWeekMinutes = weekSessions.reduce((sum, session) => sum + session.durationMin, 0)
  const todayMinutes = todaySessions.reduce((sum, session) => sum + session.durationMin, 0)
  const completionRate = weekSessions.length
    ? Math.round((completedCount / weekSessions.length) * 100)
    : 0
  const todayCompletedCount = todaySessions.filter((session) => session.status === 'Completed').length
  const todayFocusSession = todaySessions[0] ?? preferredSession
  const weekSportBalance = sportOrder
    .map((sport) => ({
      sport,
      minutes: weekSessions
        .filter((session) => session.sport === sport)
        .reduce((sum, session) => sum + session.durationMin, 0),
    }))
    .filter((item) => item.minutes > 0)

  const weekSummary = [
    {
      label: 'Sessions',
      value: String(weekSessions.length),
      icon: 'calendar-blank-outline' as IconName,
    },
    {
      label: 'Completed',
      value: `${completedCount}/${weekSessions.length || 0}`,
      icon: 'check-circle-outline' as IconName,
    },
    {
      label: 'Hours',
      value: formatMinutes(totalWeekMinutes),
      icon: 'clock-outline' as IconName,
    },
    {
      label: 'Rate',
      value: `${completionRate}%`,
      icon: 'chart-box-outline' as IconName,
    },
  ]
  const previousWeekSessions = useMemo(
    () => allSessions.filter((session) => isDateWithinWeek(session.date, shiftWeek(weekStart, -7))),
    [allSessions, weekStart],
  )
  const recentWeekHistory = useMemo(() => buildWeeklyHistory(allSessions, weekStart, 4), [allSessions, weekStart])
  const completionStreak = useMemo(() => calculateCompletionStreak(allSessions, todayKey), [allSessions, todayKey])
  const previousWeekMinutes = previousWeekSessions.reduce((sum, session) => sum + session.durationMin, 0)
  const previousWeekCompleted = previousWeekSessions.filter((session) => session.status === 'Completed').length
  const volumeDelta = totalWeekMinutes - previousWeekMinutes
  const completionDelta = completedCount - previousWeekCompleted
  const averageRecentCompletion = recentWeekHistory.length
    ? Math.round(
        recentWeekHistory.reduce((sum, item) => sum + item.completionRate, 0) / recentWeekHistory.length,
      )
    : 0
  const nextReminderSession = useMemo(
    () =>
      allSessions.find(
        (session) =>
          session.notificationsEnabled &&
          session.status === 'Planned' &&
          createSessionDateTime(session).start.getTime() > Date.now(),
      ) ?? null,
    [allSessions],
  )
  const orderedSportBalance = useMemo(
    () => [...weekSportBalance].sort((left, right) => right.minutes - left.minutes),
    [weekSportBalance],
  )
  const leadSportBalance = orderedSportBalance[0] ?? null
  const largestSportVolume = leadSportBalance?.minutes ?? 0

  const todayHeadline = todaySessions.length
    ? `${todaySessions.length} session${todaySessions.length > 1 ? 's' : ''} · ${formatMinutes(todayMinutes)}`
    : 'No session scheduled today'
  const headerSummary =
    activeTab === 'today'
      ? todayHeadline
      : activeTab === 'plan'
        ? formatWeekRange(weekStart)
        : activeTab === 'exercises'
          ? selectedSession
            ? `Templates for ${selectedSession.title}`
            : `${exerciseTemplates.length} templates in your library`
          : `${completedCount}/${weekSessions.length || 0} sessions completed this week`

  function showAppFeedback(message: string, tone: FeedbackTone = 'info') {
    setAppFeedback({ tone, message })
  }

  function animateLayout() {
    LayoutAnimation.configureNext({
      duration: 220,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    })
  }

  function openExerciseTemplateForm(template?: Exercise, preferredSport?: Sport) {
    const draftValue = template
      ? { ...template, tags: [...template.tags] }
      : createExerciseTemplateDraft(preferredSport ?? selectedSession?.sport ?? draft.sport)

    setExerciseTemplateDraft(draftValue)
    setExerciseTemplateTagsInput(draftValue.tags.join(', '))
    setEditingExerciseTemplateId(template?.id ?? null)
    setShowExerciseTemplateForm(true)
  }

  function openExerciseTemplateFormFromPreset(preset: ExerciseTemplatePreset) {
    const draftValue = createExerciseTemplateDraft(preset.sport)

    setExerciseTemplateDraft({
      ...draftValue,
      title: preset.title,
      sport: preset.sport,
      templateKind: preset.templateKind,
      category: preset.category,
      description: preset.description,
      tags: [...preset.tags],
      prescription: cloneExercisePrescription(preset.prescription),
    })
    setExerciseTemplateTagsInput(preset.tags.join(', '))
    setEditingExerciseTemplateId(null)
    setShowExerciseTemplateForm(true)
  }

  function markExerciseTemplateUsed(templateId: string) {
    setExerciseTemplates((current) =>
      sortExerciseTemplates(
        current.map((template) =>
          template.id === templateId ? registerExerciseTemplateUse(template) : template,
        ),
      ),
    )
  }

  function attachExerciseToSelectedSession(exercise: Exercise, section: WorkoutSection) {
    if (!selectedSession) return

    setSessions((current) =>
      current.map((session) =>
        session.id === selectedSession.id
          ? {
              ...session,
              blocks: session.blocks.some((block) => block.exerciseId === exercise.id)
                ? session.blocks
                : [...session.blocks, createSessionBlock(exercise, section)],
            }
          : session,
      ),
    )

    markExerciseTemplateUsed(exercise.id)
  }

  function attachExerciseToDraft(exercise: Exercise, section: WorkoutSection = 'Main') {
    setDraft((current) => ({
      ...current,
      blocks: [...current.blocks, createSessionBlock(exercise, section)],
    }))
    markExerciseTemplateUsed(exercise.id)
  }

  function attachExerciseToSessionTemplateDraft(
    exercise: Exercise,
    section: WorkoutSection = 'Main',
  ) {
    setSessionTemplateDraft((current) => ({
      ...current,
      blocks: [...current.blocks, createSessionBlock(exercise, section)],
    }))
    markExerciseTemplateUsed(exercise.id)
  }

  function saveExerciseTemplate() {
    const normalizedTitle = exerciseTemplateDraft.title.trim()
    if (!normalizedTitle) return
    const wasEditing = Boolean(editingExerciseTemplateId)

    const nextTemplate: Exercise = {
      ...exerciseTemplateDraft,
      id: editingExerciseTemplateId ?? createExerciseTemplateId(),
      title: normalizedTitle,
      tags: exerciseTemplateTagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      isCustom: editingExerciseTemplateId ? exerciseTemplateDraft.isCustom : true,
    }

    animateLayout()
    setExerciseTemplates((current) => {
      const nextItems = editingExerciseTemplateId
        ? current.map((template) => (template.id === editingExerciseTemplateId ? nextTemplate : template))
        : [...current, nextTemplate]

      return sortExerciseTemplates(nextItems)
    })

    setShowExerciseTemplateForm(false)
    setEditingExerciseTemplateId(null)
    setExerciseTemplateDraft(createExerciseTemplateDraft())
    setExerciseTemplateTagsInput('')
    showAppFeedback(
      wasEditing ? 'Template updated.' : 'Template created and ready to reuse.',
      'success',
    )
  }

  function applyExerciseTemplatePreset(preset: ExerciseTemplatePreset) {
    setExerciseTemplateDraft((current) => ({
      ...current,
      title: preset.title,
      sport: preset.sport,
      templateKind: preset.templateKind,
      category: preset.category,
      description: preset.description,
      tags: [...preset.tags],
      prescription: cloneExercisePrescription(preset.prescription),
    }))
    setExerciseTemplateTagsInput(preset.tags.join(', '))
  }

  function openSessionTemplateForm(template?: SessionTemplate, preferredSport?: Sport) {
    setSessionTemplateDraft(
      template
        ? toSessionTemplateDraft(template)
        : createEmptySessionTemplateDraft(preferredSport ?? selectedSession?.sport ?? draft.sport),
    )
    setTemplateCustomExerciseTitle('')
    setEditingSessionTemplateId(template?.id ?? null)
    setShowSessionTemplateTimePicker(false)
    setShowSessionTemplateForm(true)
  }

  function saveSessionTemplate() {
    const normalizedTitle = sessionTemplateDraft.title.trim()
    if (!normalizedTitle) return
    const wasEditing = Boolean(editingSessionTemplateId)

    const nextTemplate: SessionTemplate = {
      ...sessionTemplateDraft,
      id: editingSessionTemplateId ?? createSessionTemplateId(),
      title: normalizedTitle,
      blocks: cloneSessionBlocks(sessionTemplateDraft.blocks),
    }

    animateLayout()
    setSessionTemplates((current) =>
      sortSessionTemplates(
        editingSessionTemplateId
          ? current.map((template) =>
              template.id === editingSessionTemplateId ? nextTemplate : template,
            )
          : [...current, nextTemplate],
      ),
    )

    setEditingSessionTemplateId(null)
    setShowSessionTemplateForm(false)
    setSessionTemplateDraft(createEmptySessionTemplateDraft())
    setTemplateCustomExerciseTitle('')
    showAppFeedback(
      wasEditing ? 'Session template updated.' : 'Session template created.',
      'success',
    )
  }

  function saveCurrentSessionAsTemplate(source: Session | SessionDraft) {
    animateLayout()
    setSessionTemplates((current) =>
      sortSessionTemplates([...current, createSessionTemplateFromSource(source)]),
    )
    showAppFeedback('Session saved as a reusable template.', 'success')
  }

  function openSessionDialog(session: Session) {
    setSelectedSessionId(session.id)
    setEditingSessionId(session.id)
    setDraft(toDraft(session))
    setShowSessionDatePicker(false)
    setShowSessionTimePicker(false)
    setShowForm(true)
  }

  function openNewSessionDialog(date: string) {
    setShowSessionDatePicker(false)
    setShowSessionTimePicker(false)
    openCreateSession(setDraft, setEditingSessionId, setShowForm, date)
  }

  function handleSessionDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowSessionDatePicker(false)
    }
    if (event.type !== 'set' || !selectedDate) return

    setDraft((current) => ({
      ...current,
      date: toDateKey(selectedDate),
    }))
  }

  function handleSessionTimeChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowSessionTimePicker(false)
    }
    if (event.type !== 'set' || !selectedDate) return

    setDraft((current) => ({
      ...current,
      startTime: toTimeKey(selectedDate),
    }))
  }

  function handleSessionTemplateTimeChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowSessionTemplateTimePicker(false)
    }
    if (event.type !== 'set' || !selectedDate) return

    setSessionTemplateDraft((current) => ({
      ...current,
      startTime: toTimeKey(selectedDate),
    }))
  }

  async function upsertSessionWithNotifications(nextSession: Session, previousSession?: Session) {
    const preparedSession = await prepareSessionForNotifications(nextSession, previousSession)

    animateLayout()
    setSessions((current) => {
      if (previousSession) {
        return sortSessions(
          current.map((session) => (session.id === previousSession.id ? preparedSession : session)),
        )
      }

      return sortSessions([...current, preparedSession])
    })

    setSelectedSessionId(preparedSession.id)
    setWeekStart(toDateKey(startOfWeek(new Date(`${preparedSession.date}T00:00:00`))))
    return preparedSession
  }

  async function deleteSessionWithNotifications(session: Session) {
    await cancelSessionNotification(session.notificationId)
    animateLayout()
    setSessions((current) => current.filter((item) => item.id !== session.id))
    if (selectedSessionId === session.id) {
      setSelectedSessionId(null)
    }
    showAppFeedback('Session deleted.', 'success')
  }

  async function updateSessionStatusWithNotifications(session: Session, status: SessionStatus) {
    await upsertSessionWithNotifications({ ...session, status }, session)
  }

  async function updateSessionReminder(session: Session, notificationsEnabled: boolean, offsetMinutes?: number) {
    await upsertSessionWithNotifications(
      {
        ...session,
        notificationsEnabled,
        notificationOffsetMinutes: offsetMinutes ?? session.notificationOffsetMinutes,
      },
      session,
    )
  }

  function openWeekTemplateForm(template?: WeekTemplate) {
    setWeekTemplateDraft(
      template
        ? toWeekTemplateDraft(template)
        : createWeekTemplateDraftFromSessions(weekSessions, weekStart),
    )
    setEditingWeekTemplateId(template?.id ?? null)
    setShowWeekTemplateForm(true)
  }

  function saveWeekTemplate() {
    const normalizedTitle = weekTemplateDraft.title.trim()
    if (!normalizedTitle || !weekTemplateDraft.sessions.length) return
    const wasEditing = Boolean(editingWeekTemplateId)

    const nextTemplate: WeekTemplate = {
      ...weekTemplateDraft,
      id: editingWeekTemplateId ?? createWeekTemplateId(),
      title: normalizedTitle,
      sessions: cloneWeekTemplateSessions(weekTemplateDraft.sessions),
    }

    animateLayout()
    setWeekTemplates((current) =>
      sortWeekTemplates(
        editingWeekTemplateId
          ? current.map((template) =>
              template.id === editingWeekTemplateId ? nextTemplate : template,
            )
          : [...current, nextTemplate],
      ),
    )

    setEditingWeekTemplateId(null)
    setShowWeekTemplateForm(false)
    setWeekTemplateDraft(createEmptyWeekTemplateDraft())
    showAppFeedback(
      wasEditing ? 'Week template updated.' : 'Week template saved.',
      'success',
    )
  }

  function saveCurrentWeekAsTemplate() {
    if (!weekSessions.length) {
      Alert.alert('No sessions', 'Add sessions to this week before saving it as a template.')
      return
    }

    openWeekTemplateForm()
  }

  function insertWeekTemplate(template: WeekTemplate, replaceCurrentWeek: boolean) {
    const nextSessions = createSessionsFromWeekTemplate(template, weekStart)

    animateLayout()
    setSessions((current) => {
      const base = replaceCurrentWeek
        ? current.filter((session) => !isDateWithinWeek(session.date, weekStart))
        : current

      return sortSessions([...base, ...nextSessions])
    })

    if (nextSessions[0]) {
      setSelectedSessionId(nextSessions[0].id)
    }
    setActiveTab('plan')
    showAppFeedback(
      replaceCurrentWeek ? `Week replaced with ${template.title}.` : `${template.title} added to this week.`,
      'success',
    )
  }

  function applyWeekTemplate(template: WeekTemplate) {
    if (!template.sessions.length) {
      Alert.alert('Empty template', 'This week template does not contain any sessions yet.')
      return
    }

    if (!weekSessions.length) {
      insertWeekTemplate(template, false)
      return
    }

    Alert.alert(
      'Apply week template',
      `Apply "${template.title}" to ${currentWeekLabel}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Keep existing',
          onPress: () => insertWeekTemplate(template, false),
        },
        {
          text: 'Replace week',
          style: 'destructive',
          onPress: () => insertWeekTemplate(template, true),
        },
      ],
    )
  }

  function confirmDeleteExerciseTemplate(exerciseId: string) {
    const template = exerciseTemplates.find((item) => item.id === exerciseId)
    if (!template) return

    Alert.alert('Delete template', `Delete "${template.title}" from your library?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          animateLayout()
          setExerciseTemplates((current) => current.filter((item) => item.id !== exerciseId))
          if (editingExerciseTemplateId === exerciseId) {
            setEditingExerciseTemplateId(null)
            setShowExerciseTemplateForm(false)
          }
          showAppFeedback('Template deleted.', 'success')
        },
      },
    ])
  }

  function confirmDeleteSessionTemplate(templateId: string) {
    const template = sessionTemplates.find((item) => item.id === templateId)
    if (!template) return

    Alert.alert('Delete session template', `Delete "${template.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          animateLayout()
          setSessionTemplates((current) => current.filter((item) => item.id !== templateId))
          if (editingSessionTemplateId === templateId) {
            setEditingSessionTemplateId(null)
            setShowSessionTemplateForm(false)
          }
          showAppFeedback('Session template deleted.', 'success')
        },
      },
    ])
  }

  function confirmDeleteWeekTemplate(templateId: string) {
    const template = weekTemplates.find((item) => item.id === templateId)
    if (!template) return

    Alert.alert('Delete week template', `Delete "${template.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          animateLayout()
          setWeekTemplates((current) => current.filter((item) => item.id !== templateId))
          if (editingWeekTemplateId === templateId) {
            setEditingWeekTemplateId(null)
            setShowWeekTemplateForm(false)
          }
          showAppFeedback('Week template deleted.', 'success')
        },
      },
    ])
  }

  function confirmDeleteSession(session: Session) {
    Alert.alert('Delete session', `Delete "${session.title}" from your plan?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteSessionWithNotifications(session)
          setEditingSessionId(null)
          setShowForm(false)
        },
      },
    ])
  }

  function openExportBackup() {
    const payload = buildBackupPayload({
      sessions,
      exerciseTemplates,
      sessionTemplates,
      weekTemplates,
    })

    setBackupMode('export')
    setBackupText(JSON.stringify(payload, null, 2))
    setBackupNotice('Share or copy this JSON somewhere safe.')
    setShowBackupSheet(true)
  }

  function openImportBackup() {
    setBackupMode('import')
    setBackupText('')
    setBackupNotice('Importing will replace the local data on this phone.')
    setShowBackupSheet(true)
  }

  async function submitSessionDraft() {
    const nextSession: Session = {
      ...draft,
      id: editingSessionId ?? createId(),
      notificationId:
        editingSessionId
          ? allSessions.find((session) => session.id === editingSessionId)?.notificationId ?? null
          : null,
    }

    const previousSession =
      editingSessionId
        ? allSessions.find((session) => session.id === editingSessionId) ?? undefined
        : undefined

    const wasEditing = Boolean(editingSessionId)

    await upsertSessionWithNotifications(nextSession, previousSession)
    setEditingSessionId(null)
    setShowForm(false)
    showAppFeedback(wasEditing ? 'Session updated.' : 'Session created.', 'success')
  }

  async function shareBackup() {
    if (!backupText.trim()) return

    try {
      await Share.share({
        message: backupText,
      })
      showAppFeedback('Backup ready to share.', 'info')
    } catch (_error) {
      setBackupNotice('Unable to open the share sheet for this backup.')
      showAppFeedback('Unable to open the share sheet.', 'error')
    }
  }

  async function importBackup() {
    const parsed = normalizeBackupPayload(backupText)

    if (!parsed) {
      setBackupNotice('Invalid backup JSON. Check the content and try again.')
      showAppFeedback('Backup JSON is invalid.', 'error')
      return
    }

    for (const session of sessions) {
      await cancelSessionNotification(session.notificationId)
    }

    const preparedSessions = await Promise.all(
      parsed.sessions.map((session) =>
        prepareSessionForNotifications({ ...session, notificationId: null }),
      ),
    )

    animateLayout()
    setSessions(sortSessions(preparedSessions))
    setExerciseTemplates(sortExerciseTemplates(parsed.exerciseTemplates))
    setSessionTemplates(sortSessionTemplates(parsed.sessionTemplates))
    setWeekTemplates(sortWeekTemplates(parsed.weekTemplates))
    setSelectedSessionId(preparedSessions[0]?.id ?? null)
    setWeekStart(
      preparedSessions[0]
        ? toDateKey(startOfWeek(new Date(`${preparedSessions[0].date}T00:00:00`)))
        : toDateKey(startOfWeek(new Date())),
    )
    setShowBackupSheet(false)
    setBackupNotice(null)
    showAppFeedback('Backup imported successfully.', 'success')
  }

  function confirmImportBackup() {
    Alert.alert('Replace local data?', 'Importing a backup will replace the sessions and templates saved on this phone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Import backup',
        style: 'destructive',
        onPress: () => {
          void importBackup()
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.appShell}>
        <Animated.View
          style={[
            styles.screenTransitionWrap,
            {
              opacity: screenTransition,
              transform: [
                {
                  translateY: screenTransition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
          <Card>
            <CardContent style={styles.appHeaderContent}>
              <View style={styles.appHeaderRow}>
                <View style={styles.brandRow}>
                  <Image source={require('./assets/zenta_logo.png')} style={styles.logoImage} />
                  <View style={styles.brandCopy}>
                    <Text style={styles.eyebrow}>Zenta</Text>
                    <Text style={styles.screenTitle}>
                      {activeTab === 'today'
                        ? 'Today'
                        : activeTab === 'plan'
                          ? 'Plan'
                          : activeTab === 'exercises'
                            ? 'Templates'
                            : 'Progress'}
                    </Text>
                    <Text style={styles.headerSummary}>{headerSummary}</Text>
                  </View>
                </View>

                <Button
                  icon="plus"
                  onPress={() => openNewSessionDialog(toDateKey(new Date()))}
                >
                  Add session
                </Button>
              </View>
            </CardContent>
          </Card>

          {appFeedback ? (
            <FeedbackBanner
              tone={appFeedback.tone}
              message={appFeedback.message}
              onDismiss={() => setAppFeedback(null)}
            />
          ) : null}

          {activeTab === 'today' ? (
            <>
              <Card style={styles.todayHeroCard}>
                <CardContent style={styles.todayHeroContent}>
                  {todayFocusSession ? (
                    <>
                      <View style={styles.todayHeroTop}>
                        <View style={styles.todayHeroCopy}>
                          <Text style={styles.eyebrow}>Today&apos;s Focus</Text>
                          <Text style={styles.todayHeroTitle}>{todayFocusSession.title}</Text>
                          <Text style={styles.todayHeroMeta}>
                            {formatDetailDate(todayFocusSession.date)} · {todayFocusSession.startTime}
                          </Text>
                        </View>
                        <View style={styles.todayHeroStats}>
                          <View style={styles.todayStatChip}>
                            <Text style={styles.todayStatValue}>{todaySessions.length}</Text>
                            <Text style={styles.todayStatLabel}>sessions</Text>
                          </View>
                          <View style={styles.todayStatChip}>
                            <Text style={styles.todayStatValue}>{todayCompletedCount}</Text>
                            <Text style={styles.todayStatLabel}>done</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.todayBadgeStack}>
                        <SportBadge sport={todayFocusSession.sport} />
                        <StatusBadge status={todayFocusSession.status} />
                        <Badge label={formatMinutes(todayFocusSession.durationMin)} icon="clock-outline" />
                        <Badge label={todayFocusSession.intensity} icon="speedometer" />
                        {todayFocusSession.notificationsEnabled ? (
                          <Badge
                            label={`Reminder ${formatReminderOffset(todayFocusSession.notificationOffsetMinutes)}`}
                            icon="bell-outline"
                          />
                        ) : null}
                      </View>

                      <View style={styles.todaySummaryCard}>
                        <Text style={styles.todaySummaryLabel}>Session focus</Text>
                        <Text style={styles.todaySummaryBody}>
                          {buildSessionPreview(todayFocusSession, exerciseTemplateMap)}
                        </Text>
                      </View>

                      {todayFocusSession.blocks.length ? (
                        <View style={styles.todayBlockList}>
                          {todayFocusSession.blocks.slice(0, 3).map((block) => {
                            const exercise = getExerciseForSessionBlock(block, exerciseTemplateMap)

                            return (
                              <View key={block.id} style={styles.todayBlockRow}>
                                <View
                                  style={[
                                    styles.timelineSessionDot,
                                    { backgroundColor: sportMeta[todayFocusSession.sport].color },
                                  ]}
                                />
                                <View style={styles.linkedExerciseCopy}>
                                  <Text style={styles.itemTitle}>{block.title}</Text>
                                  <Text style={styles.caption}>
                                    {formatSessionBlockSummary(block, exercise)}
                                  </Text>
                                </View>
                              </View>
                            )
                          })}
                        </View>
                      ) : (
                        <Text style={styles.emptyText}>No workout blocks attached yet.</Text>
                      )}

                      <View style={styles.segmentRow}>
                        {statusOrder.map((status) => (
                          <SegmentButton
                            key={status}
                            label={status}
                            active={todayFocusSession.status === status}
                            tint={statusColor(status)}
                            onPress={() => void updateSessionStatusWithNotifications(todayFocusSession, status)}
                          />
                        ))}
                      </View>

                      <View style={styles.todayPrimaryActions}>
                        <Button
                          icon="arrow-top-right"
                          style={styles.flexButton}
                          onPress={() => {
                            setSelectedSessionId(todayFocusSession.id)
                            setActiveTab('plan')
                          }}
                        >
                          Open session
                        </Button>
                        <Button
                          variant="outline"
                          icon="calendar-plus"
                          style={styles.flexButton}
                          onPress={() => void addSessionToSystemCalendar(todayFocusSession, exerciseTemplateMap)}
                        >
                          Add to calendar
                        </Button>
                      </View>

                      <Button
                        variant="outline"
                        icon={todayFocusSession.notificationsEnabled ? 'bell-ring-outline' : 'bell-outline'}
                        onPress={() =>
                          void updateSessionReminder(
                            todayFocusSession,
                            !todayFocusSession.notificationsEnabled,
                            todayFocusSession.notificationOffsetMinutes,
                          )
                        }
                      >
                        {todayFocusSession.notificationsEnabled
                          ? `Reminder ${formatReminderOffset(todayFocusSession.notificationOffsetMinutes)}`
                          : 'Enable reminder'}
                      </Button>
                    </>
                  ) : (
                    <View style={styles.todayEmptyState}>
                      <Text style={styles.eyebrow}>Today</Text>
                      <Text style={styles.todayHeroTitle}>No training today</Text>
                      <Text style={styles.todayHeroBody}>
                        Keep the day open for recovery, or add a session if you want to plan something extra.
                      </Text>
                      <Button
                        icon="plus"
                        onPress={() => openNewSessionDialog(toDateKey(new Date()))}
                      >
                        Add session
                      </Button>
                    </View>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today&apos;s Queue</CardTitle>
                  <CardDescription>
                    {todaySessions.length
                      ? 'Everything scheduled for today, in one quick scan.'
                      : 'No sessions are scheduled for today.'}
                  </CardDescription>
                </CardHeader>

                <Separator />

                <CardContent>
                  {todaySessions.length ? (
                    <View style={styles.favoriteList}>
                      {todaySessions.map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          exerciseTemplatesById={exerciseTemplateMap}
                          metaLabel={`${session.startTime} · ${formatMinutes(session.durationMin)} · ${session.intensity}`}
                          onPress={() => {
                            setSelectedSessionId(session.id)
                            setActiveTab('plan')
                          }}
                        />
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>No session scheduled today.</Text>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}

          {activeTab === 'plan' ? (
            <>
              <Card>
                <CardHeader style={styles.sectionHeader}>
                  <View style={styles.sectionCopy}>
                    <CardTitle>Week plan</CardTitle>
                    <CardDescription>{formatWeekRange(weekStart)}</CardDescription>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.weekActions}
                  >
                    <IconButton size="icon-sm" icon="chevron-left" onPress={() => setWeekStart(shiftWeek(weekStart, -7))} />
                    <Button variant="outline" size="sm" onPress={() => setWeekStart(toDateKey(startOfWeek(new Date())))}>
                      This week
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon="calendar-plus"
                      onPress={() => void addWeekToSystemCalendar(weekSessions, exerciseTemplateMap)}
                    >
                      Add week
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon="content-save-outline"
                      disabled={!weekSessions.length}
                      onPress={saveCurrentWeekAsTemplate}
                    >
                      Save week
                    </Button>
                    <IconButton size="icon-sm" icon="chevron-right" onPress={() => setWeekStart(shiftWeek(weekStart, 7))} />
                  </ScrollView>
                </CardHeader>

                <Separator />

                <CardContent>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timeline}
                  >
                    {weekDays.map((day) => {
                      const daySessions = weekSessions.filter((session) => session.date === day.date)

                      return (
                        <DayCard
                          key={day.date}
                          day={day}
                          sessions={daySessions}
                          exerciseTemplatesById={exerciseTemplateMap}
                          selectedSessionId={selectedSession?.id ?? null}
                          onAdd={() => openNewSessionDialog(day.date)}
                          onSelect={(sessionId) => {
                            const session = allSessions.find((item) => item.id === sessionId)
                            if (!session) return
                            openSessionDialog(session)
                          }}
                        />
                      )
                    })}
                  </ScrollView>
                </CardContent>
              </Card>

              <Card>
                <CardHeader style={styles.sectionHeader}>
                  <View style={styles.sectionCopy}>
                    <CardTitle>Week templates</CardTitle>
                    <CardDescription>
                      Save full training weeks and apply them to {currentWeekLabel}.
                    </CardDescription>
                  </View>
                  <Button
                    variant="outline"
                    size="sm"
                    icon="content-save-outline"
                    disabled={!weekSessions.length}
                    onPress={saveCurrentWeekAsTemplate}
                  >
                    Save current
                  </Button>
                </CardHeader>

                <Separator />

                <CardContent>
                  {visibleWeekTemplates.length ? (
                    <View style={styles.exerciseList}>
                      {visibleWeekTemplates.map((template) => (
                        <View key={template.id} style={styles.exerciseCard}>
                          <View style={styles.exerciseHeader}>
                            <View style={styles.exerciseCopy}>
                              <Text style={styles.itemTitle}>{template.title}</Text>
                              <Text style={styles.caption}>
                                {template.sessions.length} session{template.sessions.length > 1 ? 's' : ''} ·{' '}
                                {formatWeekTemplateMinutes(template.sessions)}
                              </Text>
                            </View>
                            <View style={styles.exerciseHeaderActions}>
                              <Badge label={`${countUniqueDays(template.sessions)} days`} icon="calendar-week" />
                              <IconButton
                                size="icon-sm"
                                icon={template.favorite ? 'heart' : 'heart-outline'}
                                onPress={() =>
                                  setWeekTemplates((current) =>
                                    sortWeekTemplates(
                                      current.map((item) =>
                                        item.id === template.id
                                          ? { ...item, favorite: !item.favorite }
                                          : item,
                                      ),
                                    ),
                                  )
                                }
                              />
                            </View>
                          </View>

                          {template.objective ? (
                            <Text style={styles.bodyText}>{template.objective}</Text>
                          ) : (
                            <Text style={styles.bodyText}>No objective saved for this training week.</Text>
                          )}

                          <View style={styles.tagRow}>
                            {summarizeWeekTemplateDays(template.sessions).map((label) => (
                              <Badge key={label} label={label} />
                            ))}
                          </View>

                          <View style={styles.exerciseActionRow}>
                            <Button
                              variant="outline"
                              size="sm"
                              icon="playlist-plus"
                              style={styles.flexButton}
                              onPress={() => applyWeekTemplate(template)}
                            >
                              Apply
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon="content-copy"
                              onPress={() =>
                                setWeekTemplates((current) =>
                                  sortWeekTemplates([
                                    ...current,
                                    duplicateWeekTemplate(template),
                                  ]),
                                )
                              }
                            >
                              Duplicate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon="pencil-outline"
                              onPress={() => openWeekTemplateForm(template)}
                            >
                              Edit
                            </Button>
                              <IconButton
                                size="icon-sm"
                                icon="trash-can-outline"
                                onPress={() => confirmDeleteWeekTemplate(template.id)}
                              />
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>
                      Save the visible week first, then reuse it across future training blocks.
                    </Text>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader style={styles.sectionHeader}>
                  <View style={styles.sectionCopy}>
                    <CardTitle>Session templates</CardTitle>
                    <CardDescription>
                      Reuse saved sessions and drop the next one into {templateTargetDateLabel}.
                    </CardDescription>
                  </View>
                  <Button
                    variant="outline"
                    size="sm"
                    icon="plus"
                    onPress={() => openSessionTemplateForm(undefined, selectedSession?.sport)}
                  >
                    New template
                  </Button>
                </CardHeader>

                <Separator />

                <CardContent>
                  {visibleSessionTemplates.length ? (
                    <View style={styles.exerciseList}>
                      {visibleSessionTemplates.map((template) => (
                        <View key={template.id} style={styles.exerciseCard}>
                          <View style={styles.exerciseHeader}>
                            <View style={styles.exerciseCopy}>
                              <Text style={styles.itemTitle}>{template.title}</Text>
                              <Text style={styles.caption}>
                                {template.startTime} · {formatMinutes(template.durationMin)} · {template.intensity}
                              </Text>
                            </View>
                            <View style={styles.exerciseHeaderActions}>
                              <SportBadge sport={template.sport} />
                              <IconButton
                                size="icon-sm"
                                icon={template.favorite ? 'heart' : 'heart-outline'}
                                onPress={() =>
                                  setSessionTemplates((current) =>
                                    sortSessionTemplates(
                                      current.map((item) =>
                                        item.id === template.id
                                          ? { ...item, favorite: !item.favorite }
                                          : item,
                                      ),
                                    ),
                                  )
                                }
                              />
                            </View>
                          </View>

                          {template.blocks.length ? (
                            <Text style={styles.bodyText}>
                              {template.blocks.length} block
                              {template.blocks.length > 1 ? 's' : ''} ready to copy into a new
                              session.
                            </Text>
                          ) : (
                            <Text style={styles.bodyText}>No workout blocks saved in this template yet.</Text>
                          )}

                          <View style={styles.exerciseActionRow}>
                            <Button
                              variant="outline"
                              size="sm"
                              icon="playlist-plus"
                              style={styles.flexButton}
                              onPress={() => {
                                setDraft(createDraftFromSessionTemplate(template, templateTargetDate))
                                setEditingSessionId(null)
                                setShowForm(true)
                              }}
                            >
                              Use
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon="pencil-outline"
                              onPress={() => openSessionTemplateForm(template)}
                            >
                              Edit
                            </Button>
                            <IconButton
                              size="icon-sm"
                              icon="trash-can-outline"
                              onPress={() => confirmDeleteSessionTemplate(template.id)}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>
                      Save a session as a template, then reuse it for future weeks.
                    </Text>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader style={styles.sectionHeader}>
                  <View style={styles.sectionCopy}>
                    <CardTitle>{selectedSession ? selectedSession.title : 'Select a session'}</CardTitle>
                    <CardDescription>
                      {selectedSession
                        ? `${formatDetailDate(selectedSession.date)} · ${selectedSession.startTime}`
                        : 'Choose a session from the week plan to see the workout details.'}
                    </CardDescription>
                  </View>

                  {selectedSession ? (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={selectedSession.favorite ? 'heart' : 'heart-outline'}
                      onPress={() =>
                        setSessions((current) =>
                          current.map((session) =>
                            session.id === selectedSession.id
                              ? { ...session, favorite: !session.favorite }
                              : session,
                          ),
                        )
                      }
                    >
                      {selectedSession.favorite ? 'Saved' : 'Favorite'}
                    </Button>
                  ) : null}
                </CardHeader>

                <Separator />

                <CardContent>
                  {selectedSession ? (
                    <>
                      <View style={styles.metaRow}>
                        <SportBadge sport={selectedSession.sport} />
                        <StatusBadge status={selectedSession.status} />
                        <Badge label={formatMinutes(selectedSession.durationMin)} icon="clock-outline" />
                        <Badge label={selectedSession.intensity} icon="speedometer" />
                        {selectedSession.notificationsEnabled ? (
                          <Badge
                            label={`Reminder ${formatReminderOffset(selectedSession.notificationOffsetMinutes)}`}
                            icon="bell-outline"
                          />
                        ) : null}
                      </View>

                      <Text style={styles.bodyText}>
                        {buildSessionPreview(selectedSession, exerciseTemplateMap)}
                      </Text>

                      <View style={styles.segmentRow}>
                        {statusOrder.map((status) => (
                          <SegmentButton
                            key={status}
                            label={status}
                            active={selectedSession.status === status}
                            tint={statusColor(status)}
                            onPress={() => void updateSessionStatusWithNotifications(selectedSession, status)}
                          />
                        ))}
                      </View>

                      <View style={styles.subsection}>
                        <View style={styles.subsectionHeader}>
                          <Text style={styles.subsectionTitle}>Reminder</Text>
                          <Text style={styles.subsectionMeta}>
                            {selectedSession.notificationsEnabled
                              ? formatReminderOffset(selectedSession.notificationOffsetMinutes)
                              : 'Off'}
                          </Text>
                        </View>

                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.filterRow}
                        >
                          <SegmentButton
                            label="Off"
                            active={!selectedSession.notificationsEnabled}
                            tint={colors.recovery}
                            onPress={() => void updateSessionReminder(selectedSession, false)}
                          />
                          {reminderOffsetOptions.map((minutes) => (
                            <SegmentButton
                              key={minutes}
                              label={formatReminderOffset(minutes)}
                              active={
                                selectedSession.notificationsEnabled &&
                                selectedSession.notificationOffsetMinutes === minutes
                              }
                              tint={colors.swim}
                              onPress={() => void updateSessionReminder(selectedSession, true, minutes)}
                            />
                          ))}
                        </ScrollView>
                      </View>

                      <View style={styles.subsection}>
                        <View style={styles.subsectionHeader}>
                          <Text style={styles.subsectionTitle}>Workout blocks</Text>
                          <Text style={styles.subsectionMeta}>{selectedBlocks.length}</Text>
                        </View>

                        {selectedBlocks.length ? (
                          <View style={styles.detailGrid}>
                            {workoutSectionOrder.map((section) => {
                              const items = selectedBlocksBySection[section]
                              if (!items.length) return null

                              return (
                                <View key={section} style={styles.subsection}>
                                  <View style={styles.subsectionHeader}>
                                    <Text style={styles.subsectionTitle}>{section}</Text>
                                    <Text style={styles.subsectionMeta}>{items.length}</Text>
                                  </View>

                                  <View style={styles.linkedExerciseList}>
                                    {items.map(({ block, exercise }) => (
                                      <View key={block.id} style={styles.linkedExerciseRow}>
                                        <View style={styles.linkedExerciseCopy}>
                                          <Text style={styles.itemTitle}>{block.title}</Text>
                                          <Text style={styles.caption}>{formatSessionBlockSummary(block, exercise)}</Text>
                                          {exercise ? <Text style={styles.caption}>{exercise.description}</Text> : null}
                                        </View>
                                        <IconButton
                                          icon="close"
                                          onPress={() =>
                                            setSessions((current) =>
                                              current.map((session) =>
                                                session.id === selectedSession.id
                                                  ? {
                                                      ...session,
                                                      blocks: session.blocks.filter(
                                                        (sessionBlock) => sessionBlock.id !== block.id,
                                                      ),
                                                    }
                                                  : session,
                                              ),
                                            )
                                          }
                                        />
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )
                            })}
                          </View>
                        ) : (
                          <Text style={styles.emptyText}>No workout blocks added yet.</Text>
                        )}
                      </View>

                      <View style={styles.dualActions}>
                        <Button
                          variant="outline"
                          icon="calendar-plus"
                          onPress={() => void addSessionToSystemCalendar(selectedSession, exerciseTemplateMap)}
                        >
                          Add to calendar
                        </Button>
                        <Button
                          variant="outline"
                          icon="dumbbell"
                          onPress={() => setActiveTab('exercises')}
                        >
                          Manage templates
                        </Button>
                        <Button
                          variant="outline"
                          icon="content-save-outline"
                          onPress={() => saveCurrentSessionAsTemplate(selectedSession)}
                        >
                          Save template
                        </Button>
                        <Button
                          variant="outline"
                          icon="content-copy"
                          onPress={() => {
                            setDraft(createDuplicateDraft(selectedSession))
                            setEditingSessionId(null)
                            setShowForm(true)
                          }}
                        >
                          Duplicate
                        </Button>
                        <Button
                          variant="outline"
                          icon="pencil-outline"
                          onPress={() => openSessionDialog(selectedSession)}
                        >
                          Edit session
                        </Button>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.emptyText}>No session selected.</Text>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}

          {activeTab === 'exercises' ? (
            <>
              <Card>
                <CardHeader style={styles.sectionHeader}>
                  <View style={styles.sectionCopy}>
                    <CardTitle>{selectedSession ? `Templates for ${selectedSession.title}` : 'Template studio'}</CardTitle>
                    <CardDescription>
                      {selectedSession
                        ? 'Use reusable swim, bike, run, strength, and mobility blocks inside this session.'
                        : 'Build the library first, then attach templates from the Plan tab when you need them.'}
                    </CardDescription>
                  </View>
                  <Button
                    variant="outline"
                    size="sm"
                    icon="plus"
                    onPress={() => openExerciseTemplateForm(undefined, selectedSession?.sport)}
                  >
                    New template
                  </Button>
                </CardHeader>

                <Separator />

                <CardContent style={styles.templatesHeroContent}>
                  {selectedSession ? (
                    <>
                      <View style={styles.templatesHeroTopRow}>
                        <View style={styles.templatesHeroCopy}>
                          <Text style={styles.itemTitle}>{selectedSession.title}</Text>
                          <Text style={styles.bodyText}>
                            {formatDetailDate(selectedSession.date)} · {selectedSession.startTime} ·{' '}
                            {formatMinutes(selectedSession.durationMin)}
                          </Text>
                        </View>
                        <SportBadge sport={selectedSession.sport} />
                      </View>

                      <View style={styles.metaRow}>
                        <Badge label={selectedSession.intensity} icon="speedometer" />
                        <Badge label={`${selectedSession.blocks.length} blocks`} icon="dumbbell" />
                        <Badge label={`Focus ${exerciseAttachSection}`} icon="layers-outline" />
                      </View>

                      <Field label="Attach to section">
                        <SelectField
                          value={exerciseAttachSection}
                          options={workoutSectionOrder.map((section) => ({ label: section, value: section }))}
                          onChange={setExerciseAttachSection}
                        />
                      </Field>

                      <View style={styles.dualActions}>
                        <Button
                          variant="outline"
                          icon="pencil-outline"
                          onPress={() => openSessionDialog(selectedSession)}
                        >
                          Open session
                        </Button>
                        <Button
                          variant="outline"
                          icon="calendar-plus"
                          onPress={() => void addSessionToSystemCalendar(selectedSession, exerciseTemplateMap)}
                        >
                          Add to calendar
                        </Button>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.bodyText}>
                        Start by selecting a session in the Plan tab. Then you can drop templates directly into warm-up, main, or cooldown work.
                      </Text>
                      <Button variant="outline" icon="calendar-week" onPress={() => setActiveTab('plan')}>
                        Go to Plan
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {featuredTemplatePresets.length ? (
                <Card>
                  <CardHeader style={styles.sectionHeader}>
                    <View style={styles.sectionCopy}>
                      <CardTitle>Featured presets</CardTitle>
                      <CardDescription>
                        Fast starting points for {templateFocusSport.toLowerCase()} work.
                      </CardDescription>
                    </View>
                  </CardHeader>

                  <Separator />

                  <CardContent>
                    <ExerciseTemplatePresetList
                      items={featuredTemplatePresets}
                      onSelect={openExerciseTemplateFormFromPreset}
                    />
                  </CardContent>
                </Card>
              ) : null}

              <Card>
                <CardHeader style={styles.sectionHeader}>
                  <View style={styles.sectionCopy}>
                    <CardTitle>Template library</CardTitle>
                    <CardDescription>
                      Find the right block quickly, then use it immediately or refine it.
                    </CardDescription>
                  </View>
                </CardHeader>

                <Separator />

                <CardContent>
                  <View style={styles.customExerciseBar}>
                    <Input
                      value={customExerciseTitle}
                      onChangeText={setCustomExerciseTitle}
                      placeholder="Custom exercise name"
                      style={styles.customExerciseInput}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon="plus"
                      disabled={!canAddCustomExercise}
                      onPress={() => {
                        const normalizedTitle = customExerciseTitle.trim()
                        if (!normalizedTitle) return

                        const template = createExerciseTemplate({
                          title: normalizedTitle,
                          sport: selectedSession?.sport ?? 'Run',
                        })
                        const nextTemplate = selectedSession ? registerExerciseTemplateUse(template) : template

                        setExerciseTemplates((current) => sortExerciseTemplates([...current, nextTemplate]))

                        if (selectedSession) {
                          setSessions((current) =>
                            current.map((session) =>
                              session.id === selectedSession.id
                                ? {
                                    ...session,
                                    blocks: [...session.blocks, createSessionBlock(nextTemplate, exerciseAttachSection)],
                                  }
                                : session,
                            ),
                          )
                        }

                        setCustomExerciseTitle('')
                      }}
                    >
                      Add Custom Exercise
                    </Button>
                  </View>

                  <Input
                    value={exerciseQuery}
                    onChangeText={setExerciseQuery}
                    placeholder="Search templates, tags, focus, or workout type"
                  />

                  <View style={styles.templatesFilterSummary}>
                    <Badge
                      label={`${visibleExercises.length} template${visibleExercises.length === 1 ? '' : 's'}`}
                      icon="shape-outline"
                    />
                    <Badge
                      label={exerciseFilter === 'All' ? 'All sports' : exerciseFilter}
                      icon="tune-variant"
                    />
                    <Badge
                      label={
                        exerciseTypeFilter === 'All'
                          ? 'All types'
                          : formatExerciseTemplateKindLabel(exerciseTypeFilter)
                      }
                      icon="filter-variant"
                    />
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                  >
                    {exerciseFilters.map((filter) => (
                      <SegmentButton
                        key={filter}
                        label={filter}
                        active={exerciseFilter === filter}
                        tint={filter === 'All' ? colors.muted : sportMeta[filter].color}
                        onPress={() => setExerciseFilter(filter)}
                      />
                    ))}
                  </ScrollView>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                  >
                    {exerciseTypeFilters.map((filter) => (
                      <SegmentButton
                        key={filter}
                        label={filter === 'All' ? 'All types' : formatExerciseTemplateKindLabel(filter)}
                        active={exerciseTypeFilter === filter}
                        tint={filter === 'All' ? colors.muted : colors.text}
                        onPress={() => setExerciseTypeFilter(filter)}
                      />
                    ))}
                  </ScrollView>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                  >
                    {exerciseQuickFilters.map((filter) => (
                      <SegmentButton
                        key={filter}
                        label={filter}
                        active={exerciseQuickFilter === filter}
                        tint={filter === 'All' ? colors.muted : colors.run}
                        onPress={() => setExerciseQuickFilter(filter)}
                      />
                    ))}
                  </ScrollView>

                  {!exerciseQuery.trim() && exerciseQuickFilter === 'All' && recommendedVisibleExercises.length ? (
                    <View style={styles.librarySection}>
                      <View style={styles.librarySectionHeader}>
                        <View style={styles.sectionCopy}>
                          <Text style={styles.formSectionTitle}>Recommended for {templateFocusSport}</Text>
                          <Text style={styles.caption}>
                            Templates that best match the current session context and filters.
                          </Text>
                        </View>
                      </View>

                      <ExerciseTemplateList
                        items={recommendedVisibleExercises}
                        selectedSession={selectedSession ?? null}
                        onAttach={(exercise) => attachExerciseToSelectedSession(exercise, exerciseAttachSection)}
                        onEdit={openExerciseTemplateForm}
                        onToggleFavorite={(exerciseId) =>
                          setExerciseTemplates((current) =>
                            sortExerciseTemplates(
                              current.map((template) =>
                                template.id === exerciseId
                                  ? { ...template, favorite: !template.favorite }
                                  : template,
                              ),
                            ),
                          )
                        }
                        onDelete={(exerciseId) =>
                          confirmDeleteExerciseTemplate(exerciseId)
                        }
                      />
                    </View>
                  ) : null}

                  {!exerciseQuery.trim() && exerciseQuickFilter === 'All' && recentlyUsedExercises.length ? (
                    <View style={styles.librarySection}>
                      <View style={styles.librarySectionHeader}>
                        <View style={styles.sectionCopy}>
                          <Text style={styles.formSectionTitle}>Recently used</Text>
                          <Text style={styles.caption}>Templates you attached most recently.</Text>
                        </View>
                      </View>

                      <ExerciseTemplateList
                        items={recentlyUsedExercises}
                        selectedSession={selectedSession ?? null}
                        onAttach={(exercise) => attachExerciseToSelectedSession(exercise, exerciseAttachSection)}
                        onEdit={openExerciseTemplateForm}
                        onToggleFavorite={(exerciseId) =>
                          setExerciseTemplates((current) =>
                            sortExerciseTemplates(
                              current.map((template) =>
                                template.id === exerciseId
                                  ? { ...template, favorite: !template.favorite }
                                  : template,
                              ),
                            ),
                          )
                        }
                        onDelete={(exerciseId) =>
                          confirmDeleteExerciseTemplate(exerciseId)
                        }
                      />
                    </View>
                  ) : null}

                  {!exerciseQuery.trim() && exerciseQuickFilter === 'All' && favoriteVisibleExercises.length ? (
                    <View style={styles.librarySection}>
                      <View style={styles.librarySectionHeader}>
                        <View style={styles.sectionCopy}>
                          <Text style={styles.formSectionTitle}>Favorites</Text>
                          <Text style={styles.caption}>Quick access to your saved go-to templates.</Text>
                        </View>
                      </View>

                      <ExerciseTemplateList
                        items={favoriteVisibleExercises}
                        selectedSession={selectedSession ?? null}
                        onAttach={(exercise) => attachExerciseToSelectedSession(exercise, exerciseAttachSection)}
                        onEdit={openExerciseTemplateForm}
                        onToggleFavorite={(exerciseId) =>
                          setExerciseTemplates((current) =>
                            sortExerciseTemplates(
                              current.map((template) =>
                                template.id === exerciseId
                                  ? { ...template, favorite: !template.favorite }
                                  : template,
                              ),
                            ),
                          )
                        }
                        onDelete={(exerciseId) =>
                          setExerciseTemplates((current) =>
                            current.filter((template) => template.id !== exerciseId),
                          )
                        }
                      />
                    </View>
                  ) : null}

                  <View style={styles.librarySection}>
                      <View style={styles.librarySectionHeader}>
                        <View style={styles.sectionCopy}>
                          <Text style={styles.formSectionTitle}>
                            {exerciseQuickFilter === 'All' && !exerciseQuery.trim()
                              ? 'Browse templates'
                              : 'Filtered templates'}
                          </Text>
                          <Text style={styles.caption}>
                            {exerciseQuickFilter === 'All' && !exerciseQuery.trim()
                              ? 'The full library, trimmed by your current sport and type filters.'
                              : 'Results from the current search and filter combination.'}
                          </Text>
                        </View>
                      </View>

                    <ExerciseTemplateList
                      items={exerciseQuickFilter === 'All' && !exerciseQuery.trim() ? browseExercises : visibleExercises}
                      selectedSession={selectedSession ?? null}
                      onAttach={(exercise) => attachExerciseToSelectedSession(exercise, exerciseAttachSection)}
                      onEdit={openExerciseTemplateForm}
                      onToggleFavorite={(exerciseId) =>
                        setExerciseTemplates((current) =>
                          sortExerciseTemplates(
                            current.map((template) =>
                              template.id === exerciseId
                                ? { ...template, favorite: !template.favorite }
                                : template,
                            ),
                          ),
                        )
                      }
                      onDelete={(exerciseId) =>
                        confirmDeleteExerciseTemplate(exerciseId)
                      }
                    />
                  </View>
                </CardContent>
              </Card>
            </>
          ) : null}

          {activeTab === 'progress' ? (
            <>
              <Card style={styles.progressHeroCard}>
                <CardContent style={styles.progressHeroContent}>
                  <Text style={styles.eyebrow}>This Week</Text>

                  <View style={styles.progressHeroTopRow}>
                    <View style={styles.progressHeroCopy}>
                      <Text style={styles.progressHeroTitle}>{completionRate}% complete</Text>
                      <Text style={styles.progressHeroBody}>
                        {weekSessions.length
                          ? `${completedCount} of ${weekSessions.length} sessions are done this week. ${leadSportBalance ? `${leadSportBalance.sport} leads the load with ${formatMinutes(leadSportBalance.minutes)}.` : ''}`
                          : 'No training is planned for this week yet. Add a session in Plan to start building momentum.'}
                      </Text>
                    </View>

                    <View style={styles.progressHeroBadgeStack}>
                      <Badge
                        label={leadSportBalance ? `${leadSportBalance.sport} lead` : 'No lead sport'}
                        tint={leadSportBalance ? sportMeta[leadSportBalance.sport].color : colors.recovery}
                      />
                      <Badge
                        label={
                          completionStreak
                            ? `${completionStreak} day${completionStreak > 1 ? 's' : ''} streak`
                            : 'No streak yet'
                        }
                        tint={completionStreak ? colors.run : colors.recovery}
                      />
                    </View>
                  </View>

                  <View style={styles.progressHeroStats}>
                    {weekSummary.map((item) => (
                      <View key={item.label} style={styles.progressStatCard}>
                        <Text style={styles.progressStatValue}>{item.value}</Text>
                        <Text style={styles.progressStatLabel}>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Momentum</CardTitle>
                  <CardDescription>Read the current block quickly before diving into the details.</CardDescription>
                </CardHeader>

                <Separator />

                <CardContent style={styles.progressSectionContent}>
                  <View style={styles.progressSignalGrid}>
                    <View style={styles.progressSignalCard}>
                      <Text style={styles.detailLabel}>Streak</Text>
                      <Text style={styles.progressSignalValue}>
                        {completionStreak
                          ? `${completionStreak} day${completionStreak > 1 ? 's' : ''}`
                          : 'No streak yet'}
                      </Text>
                      <Text style={styles.caption}>Consecutive days with at least one completed session.</Text>
                    </View>

                    <View style={styles.progressSignalCard}>
                      <Text style={styles.detailLabel}>Volume Trend</Text>
                      <Text style={styles.progressSignalValue}>{formatTrendMinutes(volumeDelta)}</Text>
                      <Text style={styles.caption}>Compared with the previous week.</Text>
                    </View>

                    <View style={styles.progressSignalCard}>
                      <Text style={styles.detailLabel}>Completion Trend</Text>
                      <Text style={styles.progressSignalValue}>{formatTrendCount(completionDelta)}</Text>
                      <Text style={styles.caption}>Sessions finished versus last week.</Text>
                    </View>

                    <View style={styles.progressSignalCard}>
                      <Text style={styles.detailLabel}>4-Week Average</Text>
                      <Text style={styles.progressSignalValue}>{averageRecentCompletion}%</Text>
                      <Text style={styles.caption}>Average completion rate across recent weeks.</Text>
                    </View>
                  </View>

                  {recentWeekHistory.length ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.progressTrendRow}
                    >
                      {recentWeekHistory.map((week) => (
                        <View
                          key={week.weekStart}
                          style={[
                            styles.progressTrendCard,
                            week.weekStart === weekStart && styles.progressTrendCardActive,
                          ]}
                        >
                          <Text style={styles.progressTrendLabel}>{week.label}</Text>
                          <Text style={styles.progressTrendValue}>{week.completionRate}%</Text>
                          <Text style={styles.caption}>
                            {week.completed}/{week.sessions || 0} complete
                          </Text>
                          <Text style={styles.caption}>{formatMinutes(week.minutes)}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    <Text style={styles.emptyText}>
                      Complete a few sessions and the weekly trend will appear here.
                    </Text>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Volume Balance</CardTitle>
                  <CardDescription>See where the week is weighted across disciplines.</CardDescription>
                </CardHeader>

                <Separator />

                <CardContent>
                  {orderedSportBalance.length ? (
                    <View style={styles.progressBalanceList}>
                      {orderedSportBalance.map((item) => (
                        <View key={item.sport} style={styles.progressBalanceRow}>
                          <View style={styles.progressBalanceHeader}>
                            <View style={styles.sportBalanceLabel}>
                              <View
                                style={[
                                  styles.timelineSessionDot,
                                  { backgroundColor: sportMeta[item.sport].color },
                                ]}
                              />
                              <Text style={styles.itemTitle}>{item.sport}</Text>
                            </View>
                            <Text style={styles.caption}>{formatMinutes(item.minutes)}</Text>
                          </View>

                          <View style={styles.progressBarTrack}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  backgroundColor: sportMeta[item.sport].color,
                                  width: `${largestSportVolume ? Math.max(12, Math.round((item.minutes / largestSportVolume) * 100)) : 0}%`,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>No volume logged this week.</Text>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Toolkit</CardTitle>
                  <CardDescription>Manage local data and keep an eye on upcoming reminders.</CardDescription>
                </CardHeader>

                <Separator />

                <CardContent style={styles.progressSectionContent}>
                  <View style={styles.progressUtilityGrid}>
                    <View style={styles.progressUtilityCard}>
                      <Text style={styles.detailLabel}>Stored locally</Text>
                      <Text style={styles.progressSignalValue}>
                        {sessions.length} sessions
                      </Text>
                      <Text style={styles.caption}>
                        {exerciseTemplates.length} templates · {sessionTemplates.length} session templates · {weekTemplates.length} week templates
                      </Text>
                    </View>

                    <View style={styles.progressUtilityCard}>
                      <Text style={styles.detailLabel}>Next reminder</Text>
                      <Text style={styles.progressSignalValue}>
                        {nextReminderSession ? nextReminderSession.title : 'No reminder'}
                      </Text>
                      <Text style={styles.caption}>
                        {nextReminderSession
                          ? `${formatShortDate(nextReminderSession.date)} · ${nextReminderSession.startTime}`
                          : 'Enable reminders on a planned session to see it here.'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dualActions}>
                    <Button variant="outline" icon="export" onPress={openExportBackup}>
                      Export JSON
                    </Button>
                    <Button variant="outline" icon="import" onPress={openImportBackup}>
                      Import JSON
                    </Button>
                  </View>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Favorite workouts</CardTitle>
                  <CardDescription>Jump back into the sessions you return to most often.</CardDescription>
                </CardHeader>

                <Separator />

                <CardContent>
                  {favoriteSessions.length ? (
                    <View style={styles.favoriteList}>
                      {favoriteSessions.map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          exerciseTemplatesById={exerciseTemplateMap}
                          metaLabel={`${formatShortDate(session.date)} · ${session.startTime} · ${formatMinutes(session.durationMin)}`}
                          onPress={() => {
                            focusSession(session, setSelectedSessionId, setWeekStart)
                            setActiveTab('plan')
                          }}
                        />
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>
                      Mark a session as favorite and it will show up here for quick reuse.
                    </Text>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
          </ScrollView>
        </Animated.View>

        <View style={styles.tabBar}>
          {tabItems.map((tab) => {
            const active = activeTab === tab.key

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={({ pressed }) => [
                  styles.tabButton,
                  active && styles.tabButtonActive,
                  pressed && styles.pressedState,
                ]}
              >
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={18}
                  color={active ? colors.bg : colors.muted}
                />
                <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={showExerciseTemplateForm}
        onRequestClose={() => setShowExerciseTemplateForm(false)}
      >
        <SafeAreaView style={styles.sheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowExerciseTemplateForm(false)} />
          <View style={styles.sheetContainer}>
            <Card style={styles.sheetCard}>
              <CardHeader style={styles.sheetHeaderCompact}>
                <View style={styles.sectionCopy}>
                  <CardTitle>{editingExerciseTemplateId ? 'Edit exercise template' : 'New exercise template'}</CardTitle>
                  <CardDescription>
                    Create reusable exercises with sport, category, notes, and tags.
                  </CardDescription>
                </View>
                <IconButton size="icon-sm" icon="close" onPress={() => setShowExerciseTemplateForm(false)} />
              </CardHeader>

              <Separator />

              <View style={styles.sheetBody}>
                <ScrollView
                  contentContainerStyle={styles.sheetContentWithFooter}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.formSection}>
                    <Text style={styles.formSectionTitle}>Basics</Text>

                    <Field label="Title">
                      <Input
                        value={exerciseTemplateDraft.title}
                        onChangeText={(value) =>
                          setExerciseTemplateDraft((current) => ({ ...current, title: value }))
                        }
                        placeholder="Exercise title"
                      />
                    </Field>

                    <Field label="What are you creating?">
                      <SelectField
                        value={exerciseTemplateDraft.templateKind}
                        options={exerciseTemplateKindOptions}
                        onChange={(templateKind) =>
                          setExerciseTemplateDraft((current) => ({
                            ...current,
                            sport: sportForExerciseTemplateKind(templateKind),
                            templateKind,
                            prescription: createDefaultExercisePrescription(templateKind),
                          }))
                        }
                      />
                    </Field>

                    {currentExercisePresets.length ? (
                      <Field label="Smart presets">
                        <Text style={styles.caption}>
                          Start from a triathlon-specific preset, then edit the details below.
                        </Text>
                        <ExerciseTemplatePresetList
                          items={currentExercisePresets}
                          onSelect={applyExerciseTemplatePreset}
                        />
                      </Field>
                    ) : null}

                    <View style={styles.formGrid}>
                      <Field label="Discipline" compact>
                        <View style={styles.inlineBadgeField}>
                          <SportBadge sport={exerciseTemplateDraft.sport} />
                        </View>
                      </Field>

                      <Field label="Category" compact>
                        <SelectField
                          value={exerciseTemplateDraft.category}
                          options={exerciseCategorySelectOptions}
                          onChange={(category) =>
                            setExerciseTemplateDraft((current) => ({ ...current, category }))
                          }
                        />
                      </Field>
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formSectionTitle}>Prescription</Text>
                    <ExerciseTemplatePrescriptionEditor
                      draft={exerciseTemplateDraft}
                      setDraft={setExerciseTemplateDraft}
                    />
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formSectionTitle}>Notes</Text>

                    <Field label="Description">
                      <TextArea
                        value={exerciseTemplateDraft.description}
                        onChangeText={(value) =>
                          setExerciseTemplateDraft((current) => ({ ...current, description: value }))
                        }
                        placeholder="Short exercise note"
                      />
                    </Field>

                    <Field label="Tags">
                      <Input
                        value={exerciseTemplateTagsInput}
                        onChangeText={setExerciseTemplateTagsInput}
                        placeholder="cadence, easy, drill"
                      />
                    </Field>

                    {parsedExerciseTemplateTags.length ? (
                      <View style={styles.tagRow}>
                        {parsedExerciseTemplateTags.map((tag) => (
                          <Badge key={tag} label={tag} />
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.caption}>Add comma-separated tags to improve search.</Text>
                    )}
                  </View>
                </ScrollView>

                <View style={styles.sheetFooter}>
                  <View style={styles.sheetFooterRow}>
                    <Button
                      variant="outline"
                      icon={exerciseTemplateDraft.favorite ? 'heart' : 'heart-outline'}
                      style={styles.flexButton}
                      onPress={() =>
                        setExerciseTemplateDraft((current) => ({
                          ...current,
                          favorite: !current.favorite,
                        }))
                      }
                    >
                      {exerciseTemplateDraft.favorite ? 'Favorite' : 'Mark favorite'}
                    </Button>

                    <Button
                      icon="check-circle-outline"
                      style={styles.flexButton}
                      disabled={!canSaveExerciseTemplate}
                      onPress={saveExerciseTemplate}
                    >
                      {editingExerciseTemplateId ? 'Save' : 'Create'}
                    </Button>
                  </View>

                  {editingExerciseTemplateId && exerciseTemplateDraft.isCustom ? (
                    <Button
                      variant="destructive"
                      icon="trash-can-outline"
                      onPress={() => confirmDeleteExerciseTemplate(editingExerciseTemplateId)}
                    >
                      Delete template
                    </Button>
                  ) : null}
                </View>
              </View>
            </Card>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={showBackupSheet}
        onRequestClose={() => setShowBackupSheet(false)}
      >
        <SafeAreaView style={styles.sheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowBackupSheet(false)} />
          <View style={styles.sheetContainer}>
            <Card style={styles.sheetCard}>
              <CardHeader style={styles.sheetHeader}>
                <View style={styles.sectionCopy}>
                  <CardTitle>{backupMode === 'export' ? 'Export backup' : 'Import backup'}</CardTitle>
                  <CardDescription>
                    {backupMode === 'export'
                      ? 'Share or copy this JSON to keep a local backup.'
                      : 'Paste a full Zenta JSON backup to replace the local data on this phone.'}
                  </CardDescription>
                </View>
                <IconButton icon="close" onPress={() => setShowBackupSheet(false)} />
              </CardHeader>

              <Separator />

              <ScrollView
                contentContainerStyle={styles.sheetContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {backupNotice ? <Text style={styles.caption}>{backupNotice}</Text> : null}

                <TextArea
                  value={backupText}
                  onChangeText={setBackupText}
                  editable={backupMode === 'import'}
                  placeholder={backupMode === 'import' ? 'Paste backup JSON here' : undefined}
                  style={styles.backupTextArea}
                />

                <View style={styles.sheetActions}>
                  {backupMode === 'export' ? (
                    <Button icon="export" onPress={() => void shareBackup()}>
                      Share backup
                    </Button>
                  ) : (
                    <Button icon="import" onPress={confirmImportBackup}>
                      Import backup
                    </Button>
                  )}
                </View>
              </ScrollView>
            </Card>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={showWeekTemplateForm}
        onRequestClose={() => setShowWeekTemplateForm(false)}
      >
        <SafeAreaView style={styles.sheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowWeekTemplateForm(false)} />
          <View style={styles.sheetContainer}>
            <Card style={styles.sheetCard}>
              <CardHeader style={styles.sheetHeaderCompact}>
                <View style={styles.sectionCopy}>
                  <CardTitle>{editingWeekTemplateId ? 'Edit week template' : 'Save week template'}</CardTitle>
                  <CardDescription>
                    Save the current visible week as a reusable training block.
                  </CardDescription>
                </View>
                <IconButton icon="close" onPress={() => setShowWeekTemplateForm(false)} />
              </CardHeader>

              <Separator />

              <View style={styles.sheetBody}>
                <ScrollView
                  contentContainerStyle={styles.sheetContentWithFooter}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <SheetSectionCard
                    title="Overview"
                    description="Name the week and keep a short objective so it is easy to reuse later."
                  >
                    <Field label="Title">
                      <Input
                        value={weekTemplateDraft.title}
                        onChangeText={(value) =>
                          setWeekTemplateDraft((current) => ({ ...current, title: value }))
                        }
                        placeholder="Build week"
                      />
                    </Field>

                    <Field label="Objective">
                      <TextArea
                        value={weekTemplateDraft.objective}
                        onChangeText={(value) =>
                          setWeekTemplateDraft((current) => ({ ...current, objective: value }))
                        }
                        placeholder="Race-specific load, recovery week..."
                      />
                    </Field>

                    <Button
                      variant="outline"
                      icon={weekTemplateDraft.favorite ? 'heart' : 'heart-outline'}
                      onPress={() =>
                        setWeekTemplateDraft((current) => ({
                          ...current,
                          favorite: !current.favorite,
                        }))
                      }
                    >
                      {weekTemplateDraft.favorite ? 'Favorite template' : 'Mark favorite'}
                    </Button>
                  </SheetSectionCard>

                  <SheetSectionCard
                    title="Included sessions"
                    description="Review the sessions that will be saved into this reusable week."
                  >
                    <View style={styles.subsectionHeader}>
                      <Text style={styles.subsectionTitle}>Sessions</Text>
                      <Text style={styles.subsectionMeta}>{weekTemplateDraft.sessions.length}</Text>
                    </View>

                    {weekTemplateDraft.sessions.length ? (
                      <View style={styles.linkedExerciseList}>
                        {weekTemplateDraft.sessions.map((session, index) => (
                          <View key={`${session.title}-${session.dayOffset}-${index}`} style={styles.linkedExerciseRow}>
                            <View style={styles.linkedExerciseCopy}>
                              <Text style={styles.itemTitle}>{session.title}</Text>
                              <Text style={styles.caption}>
                                {formatDayOffset(session.dayOffset)} · {session.startTime} ·{' '}
                                {formatMinutes(session.durationMin)} · {session.intensity}
                              </Text>
                            </View>
                            <SportBadge sport={session.sport} />
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.emptyText}>This template does not contain any sessions yet.</Text>
                    )}

                    <Button
                      variant="outline"
                      icon="refresh"
                      disabled={!weekSessions.length}
                      onPress={() =>
                        setWeekTemplateDraft((current) => ({
                          ...current,
                          sessions: createWeekTemplateDraftFromSessions(weekSessions, weekStart).sessions,
                        }))
                      }
                    >
                      Replace with visible week
                    </Button>
                  </SheetSectionCard>
                </ScrollView>

                <View style={styles.sheetFooter}>
                  <View style={styles.sheetFooterRow}>
                    {editingWeekTemplateId ? (
                      <Button
                        variant="destructive"
                        icon="trash-can-outline"
                        style={styles.flexButton}
                        onPress={() => confirmDeleteWeekTemplate(editingWeekTemplateId)}
                      >
                        Delete
                      </Button>
                    ) : null}

                    <Button
                      icon="check-circle-outline"
                      disabled={!canSaveWeekTemplate}
                      style={styles.flexButton}
                      onPress={saveWeekTemplate}
                    >
                      {editingWeekTemplateId ? 'Save template' : 'Create template'}
                    </Button>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={showSessionTemplateForm}
        onRequestClose={() => setShowSessionTemplateForm(false)}
      >
        <SafeAreaView style={styles.sheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowSessionTemplateForm(false)} />
          <View style={styles.sheetContainer}>
            <Card style={styles.sheetCard}>
              <CardHeader style={styles.sheetHeaderCompact}>
                <View style={styles.sectionCopy}>
                  <CardTitle>{editingSessionTemplateId ? 'Edit session template' : 'New session template'}</CardTitle>
                  <CardDescription>
                    Save a workout structure you can reuse and drop into future weeks.
                  </CardDescription>
                </View>
                <IconButton icon="close" onPress={() => setShowSessionTemplateForm(false)} />
              </CardHeader>

              <Separator />

              <View style={styles.sheetBody}>
                <ScrollView
                  contentContainerStyle={styles.sheetContentWithFooter}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <SheetSectionCard
                    title="Overview"
                    description="Set the structure for this reusable session before adding workout blocks."
                  >
                    <Field label="Title">
                      <Input
                        value={sessionTemplateDraft.title}
                        onChangeText={(value) =>
                          setSessionTemplateDraft((current) => ({ ...current, title: value }))
                        }
                        placeholder="Template title"
                      />
                    </Field>

                    <Field label="Sport">
                      <SelectField
                        value={sessionTemplateDraft.sport}
                        options={sportSelectOptions}
                        onChange={(sport) =>
                          setSessionTemplateDraft((current) => ({
                            ...current,
                            sport,
                          }))
                        }
                      />
                    </Field>

                    <View style={styles.formGrid}>
                      <Field label="Start time" compact>
                        <Pressable
                          onPress={() => setShowSessionTemplateTimePicker((current) => !current)}
                          style={({ pressed }) => [styles.selectField, pressed && styles.pressedState]}
                        >
                          <Text style={styles.selectFieldText}>
                            {formatTimeInputLabel(sessionTemplateDraft.startTime)}
                          </Text>
                          <MaterialCommunityIcons name="clock-outline" size={18} color={colors.muted} />
                        </Pressable>
                      </Field>

                      <Field label="Duration (min)" compact>
                        <NumberStepper
                          value={sessionTemplateDraft.durationMin}
                          min={0}
                          max={480}
                          step={durationStep}
                          onChange={(durationMin) =>
                            setSessionTemplateDraft((current) => ({ ...current, durationMin }))
                          }
                        />
                      </Field>
                    </View>

                    {showSessionTemplateTimePicker ? (
                      <DateTimePicker
                        value={parseTimeKey(sessionTemplateDraft.startTime)}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleSessionTemplateTimeChange}
                      />
                    ) : null}

                    <Field label="Intensity">
                      <SelectField
                        value={sessionTemplateDraft.intensity}
                        options={intensitySelectOptions}
                        onChange={(intensity) =>
                          setSessionTemplateDraft((current) => ({ ...current, intensity }))
                        }
                      />
                    </Field>

                    <Button
                      variant="outline"
                      icon={sessionTemplateDraft.favorite ? 'heart' : 'heart-outline'}
                      onPress={() =>
                        setSessionTemplateDraft((current) => ({
                          ...current,
                          favorite: !current.favorite,
                        }))
                      }
                    >
                      {sessionTemplateDraft.favorite ? 'Favorite template' : 'Mark favorite'}
                    </Button>
                  </SheetSectionCard>

                  <SheetSectionCard
                    title="Workout builder"
                    description="Attach reusable templates or add a custom movement, then tune each block."
                  >
                    <Field label="Add exercises">
                      <View style={styles.customExerciseBar}>
                        <Input
                          value={templateCustomExerciseTitle}
                          onChangeText={setTemplateCustomExerciseTitle}
                          placeholder="Custom exercise name"
                          style={styles.customExerciseInput}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          icon="plus"
                          disabled={!canAddTemplateCustomExercise}
                          onPress={() => {
                            const normalizedTitle = templateCustomExerciseTitle.trim()
                            if (!normalizedTitle) return

                            const template = createExerciseTemplate({
                              title: normalizedTitle,
                              sport: sessionTemplateDraft.sport,
                            })
                            const usedTemplate = registerExerciseTemplateUse(template)

                            setExerciseTemplates((current) => sortExerciseTemplates([...current, usedTemplate]))
                            setSessionTemplateDraft((current) => ({
                              ...current,
                              blocks: [...current.blocks, createSessionBlock(usedTemplate, 'Main')],
                            }))
                            setTemplateCustomExerciseTitle('')
                          }}
                        >
                          Add Custom Exercise
                        </Button>
                      </View>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterRow}
                      >
                        {sessionTemplateExerciseOptions.map((exercise) => {
                          const alreadyAdded = sessionTemplateDraft.blocks.some(
                            (block) => block.exerciseId === exercise.id,
                          )

                          return (
                            <Button
                              key={exercise.id}
                              variant="outline"
                              size="sm"
                              icon={alreadyAdded ? 'check-circle-outline' : 'plus'}
                              disabled={alreadyAdded}
                              onPress={() => attachExerciseToSessionTemplateDraft(exercise)}
                            >
                              {exercise.title}
                            </Button>
                          )
                        })}
                      </ScrollView>
                    </Field>

                    <Field label="Workout blocks">
                      {sessionTemplateDraft.blocks.length ? (
                        <View style={styles.editorExerciseList}>
                          {sessionTemplateDraft.blocks.map((block) => {
                            const exercise =
                              block.exerciseId
                                ? exerciseTemplates.find((item) => item.id === block.exerciseId) ?? null
                                : null

                            return (
                              <View key={block.id} style={styles.editorExerciseCard}>
                                <View style={styles.editorExerciseHeader}>
                                  <View style={styles.exerciseCopy}>
                                    <Text style={styles.itemTitle}>{block.title}</Text>
                                    <Text style={styles.caption}>{exercise?.category ?? 'Custom exercise'}</Text>
                                  </View>
                                  <IconButton
                                    icon="close"
                                    onPress={() =>
                                      setSessionTemplateDraft((current) => ({
                                        ...current,
                                        blocks: current.blocks.filter(
                                          (currentBlock) => currentBlock.id !== block.id,
                                        ),
                                      }))
                                    }
                                  />
                                </View>

                                <Field label="Section">
                                  <SelectField
                                    value={block.section}
                                    options={workoutSectionSelectOptions}
                                    onChange={(section) =>
                                      updateTemplateExercise(setSessionTemplateDraft, block.id, { section })
                                    }
                                  />
                                </Field>

                                <View style={styles.formGrid}>
                                  <Field label="Sets" compact>
                                    <NumberStepper
                                      value={block.sets}
                                      min={1}
                                      max={20}
                                      onChange={(sets) =>
                                        updateTemplateExercise(setSessionTemplateDraft, block.id, {
                                          sets,
                                        })
                                      }
                                    />
                                  </Field>

                                  <Field label="Reps" compact>
                                    <NumberStepper
                                      value={block.reps}
                                      min={1}
                                      max={200}
                                      onChange={(reps) =>
                                        updateTemplateExercise(setSessionTemplateDraft, block.id, {
                                          reps,
                                        })
                                      }
                                    />
                                  </Field>
                                </View>

                                <View style={styles.formGrid}>
                                  <Field label="Rest (sec)" compact>
                                    <NumberStepper
                                      value={block.restSeconds}
                                      min={0}
                                      max={600}
                                      step={15}
                                      onChange={(restSeconds) =>
                                        updateTemplateExercise(setSessionTemplateDraft, block.id, {
                                          restSeconds,
                                        })
                                      }
                                    />
                                  </Field>

                                  <Field label="Body part" compact>
                                    <SelectField
                                      value={block.sideLabel || 'leg'}
                                      options={bodyPartSelectOptions}
                                      onChange={(sideLabel) =>
                                        updateTemplateExercise(setSessionTemplateDraft, block.id, {
                                          sideLabel,
                                        })
                                      }
                                    />
                                  </Field>
                                </View>

                                <Field label="Side mode">
                                  <SelectField
                                    value={block.sideMode}
                                    options={sideModeSelectOptions}
                                    onChange={(sideMode) =>
                                      updateTemplateExercise(setSessionTemplateDraft, block.id, {
                                        sideMode,
                                        sideLabel: sideMode === 'none' ? '' : block.sideLabel || 'leg',
                                      })
                                    }
                                  />
                                </Field>
                              </View>
                            )
                          })}
                        </View>
                      ) : (
                        <Text style={styles.emptyText}>
                          Add one or more blocks to make this template reusable.
                        </Text>
                      )}
                    </Field>
                  </SheetSectionCard>
                </ScrollView>

                <View style={styles.sheetFooter}>
                  <View style={styles.sheetFooterRow}>
                    {editingSessionTemplateId ? (
                      <Button
                        variant="destructive"
                        icon="trash-can-outline"
                        style={styles.flexButton}
                        onPress={() => confirmDeleteSessionTemplate(editingSessionTemplateId)}
                      >
                        Delete
                      </Button>
                    ) : null}

                    <Button
                      icon="check-circle-outline"
                      disabled={!canSaveSessionTemplate}
                      style={styles.flexButton}
                      onPress={saveSessionTemplate}
                    >
                      {editingSessionTemplateId ? 'Save template' : 'Create template'}
                    </Button>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal transparent animationType="fade" visible={showForm} onRequestClose={() => setShowForm(false)}>
        <SafeAreaView style={styles.sheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowForm(false)} />
          <View style={styles.sheetContainer}>
            <Card style={styles.sheetCard}>
              <CardHeader style={styles.sheetHeaderCompact}>
                <View style={styles.sectionCopy}>
                  <CardTitle>{editingSessionId ? 'Edit session' : 'Add session'}</CardTitle>
                  <CardDescription>
                    Set the basics, then build the exercise plan with sets, reps, side mode, and rest.
                  </CardDescription>
                </View>
                <IconButton icon="close" onPress={() => setShowForm(false)} />
              </CardHeader>

              <Separator />

              <View style={styles.sheetBody}>
                <ScrollView
                  contentContainerStyle={styles.sheetContentWithFooter}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <SheetSectionCard
                    title="Overview"
                    description="Capture the basics first so the workout sits correctly in your calendar."
                  >
                    <Field label="Title">
                      <Input
                        value={draft.title}
                        onChangeText={(value) => setDraft((current) => ({ ...current, title: value }))}
                        placeholder="Session title"
                      />
                    </Field>

                    <Field label="Sport">
                      <SelectField
                        value={draft.sport}
                        options={sportSelectOptions}
                        onChange={(sport) => setDraft((current) => ({ ...current, sport }))}
                      />
                    </Field>

                    <View style={styles.formGrid}>
                      <Field label="Date" compact>
                        <Pressable
                          onPress={() => {
                            setShowSessionTimePicker(false)
                            setShowSessionDatePicker((current) => !current)
                          }}
                          style={({ pressed }) => [styles.selectField, pressed && styles.pressedState]}
                        >
                          <Text style={styles.selectFieldText}>{formatDateInputLabel(draft.date)}</Text>
                          <MaterialCommunityIcons name="calendar-month-outline" size={18} color={colors.muted} />
                        </Pressable>
                      </Field>

                      <Field label="Start time" compact>
                        <Pressable
                          onPress={() => {
                            setShowSessionDatePicker(false)
                            setShowSessionTimePicker((current) => !current)
                          }}
                          style={({ pressed }) => [styles.selectField, pressed && styles.pressedState]}
                        >
                          <Text style={styles.selectFieldText}>{formatTimeInputLabel(draft.startTime)}</Text>
                          <MaterialCommunityIcons name="clock-outline" size={18} color={colors.muted} />
                        </Pressable>
                      </Field>
                    </View>

                    {showSessionDatePicker ? (
                      <DateTimePicker
                        value={parseDateKey(draft.date)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleSessionDateChange}
                      />
                    ) : null}

                    {showSessionTimePicker ? (
                      <DateTimePicker
                        value={parseTimeKey(draft.startTime)}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleSessionTimeChange}
                      />
                    ) : null}

                    <View style={styles.formGrid}>
                      <Field label="Duration (min)" compact>
                        <NumberStepper
                          value={draft.durationMin}
                          min={0}
                          max={480}
                          step={durationStep}
                          onChange={(durationMin) =>
                            setDraft((current) => ({
                              ...current,
                              durationMin,
                            }))
                          }
                        />
                      </Field>

                      <Field label="Intensity" compact>
                        <SelectField
                          value={draft.intensity}
                          options={intensitySelectOptions}
                          onChange={(intensity) => setDraft((current) => ({ ...current, intensity }))}
                        />
                      </Field>
                    </View>
                  </SheetSectionCard>

                  <SheetSectionCard
                    title="Tracking"
                    description="Set the completion state and decide whether this session should trigger a reminder."
                  >
                    <Field label="Status">
                      <SelectField
                        value={draft.status}
                        options={statusSelectOptions}
                        onChange={(status) => setDraft((current) => ({ ...current, status }))}
                      />
                    </Field>

                    <Field label="Reminder">
                      <SelectField
                        value={draft.notificationsEnabled ? String(draft.notificationOffsetMinutes) : 'off'}
                        options={[{ label: 'Off', value: 'off' }, ...reminderSelectOptions]}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            notificationsEnabled: value !== 'off',
                            notificationOffsetMinutes:
                              value === 'off' ? current.notificationOffsetMinutes : Number(value),
                          }))
                        }
                      />
                    </Field>

                    <Button
                      variant="outline"
                      icon={draft.favorite ? 'heart' : 'heart-outline'}
                      onPress={() => setDraft((current) => ({ ...current, favorite: !current.favorite }))}
                    >
                      {draft.favorite ? 'Favorite workout' : 'Mark as favorite'}
                    </Button>
                  </SheetSectionCard>

                  <SheetSectionCard
                    title="Workout builder"
                    description="Build warm-up, main, and cooldown work from reusable templates or custom blocks."
                  >
                    <Field label="Add exercises">
                      <View style={styles.customExerciseBar}>
                        <Input
                          value={draftCustomExerciseTitle}
                          onChangeText={setDraftCustomExerciseTitle}
                          placeholder="Custom exercise name"
                          style={styles.customExerciseInput}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          icon="plus"
                          disabled={!canAddDraftCustomExercise}
                          onPress={() => {
                            const normalizedTitle = draftCustomExerciseTitle.trim()
                            if (!normalizedTitle) return

                            const template = createExerciseTemplate({
                              title: normalizedTitle,
                              sport: draft.sport,
                            })
                            const usedTemplate = registerExerciseTemplateUse(template)

                            setExerciseTemplates((current) => sortExerciseTemplates([...current, usedTemplate]))
                            setDraft((current) => ({
                              ...current,
                              blocks: [...current.blocks, createSessionBlock(usedTemplate, 'Main')],
                            }))
                            setDraftCustomExerciseTitle('')
                          }}
                        >
                          Add Custom Exercise
                        </Button>
                      </View>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterRow}
                      >
                        {draftExerciseOptions.map((exercise) => {
                          const alreadyAdded = draft.blocks.some((block) => block.exerciseId === exercise.id)

                          return (
                            <Button
                              key={exercise.id}
                              variant="outline"
                              size="sm"
                              icon={alreadyAdded ? 'check-circle-outline' : 'plus'}
                              disabled={alreadyAdded}
                              onPress={() => attachExerciseToDraft(exercise)}
                            >
                              {exercise.title}
                            </Button>
                          )
                        })}
                      </ScrollView>
                    </Field>

                    <Field label="Workout blocks">
                      {draft.blocks.length ? (
                        <View style={styles.editorExerciseList}>
                          {draft.blocks.map((block) => {
                            const exercise =
                              block.exerciseId
                                ? exerciseTemplates.find((item) => item.id === block.exerciseId) ?? null
                                : null

                            return (
                              <View key={block.id} style={styles.editorExerciseCard}>
                                <View style={styles.editorExerciseHeader}>
                                  <View style={styles.exerciseCopy}>
                                    <Text style={styles.itemTitle}>{block.title}</Text>
                                    <Text style={styles.caption}>{exercise?.category ?? 'Custom exercise'}</Text>
                                  </View>
                                  <IconButton
                                    icon="close"
                                    onPress={() =>
                                      setDraft((current) => ({
                                        ...current,
                                        blocks: current.blocks.filter(
                                          (currentBlock) => currentBlock.id !== block.id,
                                        ),
                                      }))
                                    }
                                  />
                                </View>

                                <Field label="Section">
                                  <SelectField
                                    value={block.section}
                                    options={workoutSectionSelectOptions}
                                    onChange={(section) => updateDraftExercise(setDraft, block.id, { section })}
                                  />
                                </Field>

                                <View style={styles.formGrid}>
                                  <Field label="Sets" compact>
                                    <NumberStepper
                                      value={block.sets}
                                      min={1}
                                      max={20}
                                      onChange={(sets) =>
                                        updateDraftExercise(setDraft, block.id, {
                                          sets,
                                        })
                                      }
                                    />
                                  </Field>

                                  <Field label="Reps" compact>
                                    <NumberStepper
                                      value={block.reps}
                                      min={1}
                                      max={200}
                                      onChange={(reps) =>
                                        updateDraftExercise(setDraft, block.id, {
                                          reps,
                                        })
                                      }
                                    />
                                  </Field>
                                </View>

                                <View style={styles.formGrid}>
                                  <Field label="Rest (sec)" compact>
                                    <NumberStepper
                                      value={block.restSeconds}
                                      min={0}
                                      max={600}
                                      step={15}
                                      onChange={(restSeconds) =>
                                        updateDraftExercise(setDraft, block.id, {
                                          restSeconds,
                                        })
                                      }
                                    />
                                  </Field>

                                  <Field label="Body part" compact>
                                    <SelectField
                                      value={block.sideLabel || 'leg'}
                                      options={bodyPartSelectOptions}
                                      onChange={(sideLabel) =>
                                        updateDraftExercise(setDraft, block.id, { sideLabel })
                                      }
                                    />
                                  </Field>
                                </View>

                                <Field label="Side mode">
                                  <SelectField
                                    value={block.sideMode}
                                    options={sideModeSelectOptions}
                                    onChange={(sideMode) =>
                                      updateDraftExercise(setDraft, block.id, {
                                        sideMode,
                                        sideLabel: sideMode === 'none' ? '' : block.sideLabel || 'leg',
                                      })
                                    }
                                  />
                                </Field>
                              </View>
                            )
                          })}
                        </View>
                      ) : (
                        <Text style={styles.emptyText}>
                          Add one or more blocks to define warm-up, main, and cooldown work.
                        </Text>
                      )}
                    </Field>
                  </SheetSectionCard>
                </ScrollView>

                <View style={styles.sheetFooter}>
                  <Button
                    variant="outline"
                    icon="content-save-outline"
                    style={styles.flexButton}
                    onPress={() => saveCurrentSessionAsTemplate(draft)}
                  >
                    Save as template
                  </Button>

                  <View style={styles.sheetFooterRow}>
                    {editingSessionId ? (
                      <Button
                        variant="destructive"
                        icon="trash-can-outline"
                        style={styles.flexButton}
                        onPress={() => {
                          const sessionToDelete =
                            editingSessionId
                              ? allSessions.find((session) => session.id === editingSessionId) ?? null
                              : null
                          if (!sessionToDelete) return
                          confirmDeleteSession(sessionToDelete)
                        }}
                      >
                        Delete
                      </Button>
                    ) : null}

                    <Button
                      icon="check-circle-outline"
                      style={styles.flexButton}
                      onPress={() => void submitSessionDraft()}
                    >
                      {editingSessionId ? 'Save changes' : 'Create session'}
                    </Button>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: IconName }) {
  return (
    <Card style={styles.metricCard}>
      <CardContent style={styles.metricContent}>
        <View style={styles.metricIconWrap}>
          <MaterialCommunityIcons name={icon} size={18} color={colors.text} />
        </View>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </CardContent>
    </Card>
  )
}

function FeedbackBanner({
  tone,
  message,
  onDismiss,
}: {
  tone: FeedbackTone
  message: string
  onDismiss: () => void
}) {
  const toneColor =
    tone === 'success'
      ? colors.run
      : tone === 'warning'
        ? colors.bike
        : tone === 'error'
          ? colors.destructive
          : colors.swim
  const icon =
    tone === 'success'
      ? 'check-circle-outline'
      : tone === 'warning'
        ? 'alert-outline'
        : tone === 'error'
          ? 'close-circle-outline'
          : 'information-outline'

  return (
    <View style={[styles.feedbackBanner, { borderColor: `${toneColor}55`, backgroundColor: `${toneColor}12` }]}>
      <View style={styles.feedbackCopy}>
        <MaterialCommunityIcons name={icon} size={18} color={toneColor} />
        <Text style={styles.feedbackMessage}>{message}</Text>
      </View>
      <IconButton size="icon-sm" icon="close" onPress={onDismiss} />
    </View>
  )
}

function SheetSectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <View style={styles.sheetSectionCard}>
      <View style={styles.sheetSectionHeader}>
        <Text style={styles.sheetSectionTitle}>{title}</Text>
        {description ? <Text style={styles.sheetSectionDescription}>{description}</Text> : null}
      </View>
      <View style={styles.sheetSectionBody}>{children}</View>
    </View>
  )
}

function SessionCard({
  session,
  exerciseTemplatesById,
  metaLabel,
  onPress,
  selected = false,
  variant = 'list',
}: {
  session: Session
  exerciseTemplatesById: Map<string, Exercise>
  metaLabel: string
  onPress: () => void
  selected?: boolean
  variant?: 'list' | 'compact'
}) {
  const accentColor = sportMeta[session.sport].color

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sessionCard,
        variant === 'compact' ? styles.sessionCardCompact : styles.sessionCardList,
        {
          borderColor: selected ? `${accentColor}66` : colors.border,
          backgroundColor: selected ? colors.surfaceMuted : colors.bg,
        },
        pressed && styles.pressedState,
      ]}
    >
      <View style={[styles.sessionCardAccent, { backgroundColor: accentColor }]} />

      <View style={styles.sessionCardMain}>
        <Text style={styles.sessionCardMeta}>{metaLabel}</Text>
        <Text style={styles.sessionCardTitle} numberOfLines={variant === 'compact' ? 2 : 1}>
          {session.title}
        </Text>
        <Text style={styles.sessionCardSummary} numberOfLines={variant === 'compact' ? 2 : 3}>
          {buildSessionPreview(session, exerciseTemplatesById)}
        </Text>

        <View style={styles.sessionCardFooter}>
          <SportBadge sport={session.sport} />
          <StatusBadge status={session.status} compact />
        </View>
      </View>
    </Pressable>
  )
}

function DayCard({
  day,
  sessions,
  exerciseTemplatesById,
  selectedSessionId,
  onAdd,
  onSelect,
}: {
  day: { date: string; label: string; shortDate: string }
  sessions: Session[]
  exerciseTemplatesById: Map<string, Exercise>
  selectedSessionId: string | null
  onAdd: () => void
  onSelect: (sessionId: string) => void
}) {
  const isToday = day.date === toDateKey(new Date())

  return (
    <Card style={[styles.dayCard, isToday && styles.dayCardToday]}>
      <CardContent style={styles.dayContent}>
        <View style={styles.dayHeader}>
          <View style={styles.dayCopy}>
            <Text style={styles.dayLabel}>{day.label}</Text>
            <Text style={styles.caption}>{day.shortDate}</Text>
          </View>
          <View style={styles.dayHeaderActions}>
            {isToday ? <Badge label="Today" tint={colors.swim} /> : null}
            <IconButton size="icon-sm" icon="plus" onPress={onAdd} />
          </View>
        </View>

        <View style={styles.daySessionList}>
          {sessions.length ? (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                exerciseTemplatesById={exerciseTemplatesById}
                metaLabel={`${session.startTime} · ${formatMinutes(session.durationMin)} · ${session.intensity}`}
                selected={selectedSessionId === session.id}
                variant="compact"
                onPress={() => onSelect(session.id)}
              />
            ))
          ) : (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyText}>No session planned.</Text>
            </View>
          )}
        </View>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  children,
  compact = false,
}: {
  label: string
  children: React.ReactNode
  compact?: boolean
}) {
  return (
    <View style={[styles.field, compact && styles.fieldCompact]}>
      <Label>{label}</Label>
      {children}
    </View>
  )
}

function SelectField<T extends string>({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: T
  options: Array<{ label: string; value: T }>
  onChange: (value: T) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder ?? 'Select'

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.selectField,
          pressed && styles.pressedState,
        ]}
      >
        <Text style={styles.selectFieldText}>{selectedLabel}</Text>
        <MaterialCommunityIcons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.sheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.sheetContainer}>
            <Card style={styles.selectSheetCard}>
              <CardHeader style={styles.sheetHeader}>
                <View style={styles.sectionCopy}>
                  <CardTitle>Select</CardTitle>
                  <CardDescription>Choose one option.</CardDescription>
                </View>
                <IconButton icon="close" onPress={() => setOpen(false)} />
              </CardHeader>

              <Separator />

              <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
                <View style={styles.selectOptionList}>
                  {options.map((option) => {
                    const active = option.value === value

                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => {
                          onChange(option.value)
                          setOpen(false)
                        }}
                        style={({ pressed }) => [
                          styles.selectOption,
                          active && styles.selectOptionActive,
                          pressed && styles.pressedState,
                        ]}
                      >
                        <Text style={[styles.selectOptionText, active && styles.selectOptionTextActive]}>
                          {option.label}
                        </Text>
                        {active ? (
                          <MaterialCommunityIcons name="check" size={18} color={colors.text} />
                        ) : null}
                      </Pressable>
                    )
                  })}
                </View>
              </ScrollView>
            </Card>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  )
}

function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}) {
  const decrementDisabled = value <= min
  const incrementDisabled = value >= max

  return (
    <View style={styles.stepper}>
      <IconButton
        size="icon-sm"
        icon="minus"
        disabled={decrementDisabled}
        onPress={() => onChange(Math.max(min, value - step))}
      />
      <Text style={styles.stepperValue}>{value}</Text>
      <IconButton
        size="icon-sm"
        icon="plus"
        disabled={incrementDisabled}
        onPress={() => onChange(Math.min(max, value + step))}
      />
    </View>
  )
}

function ExerciseTemplatePrescriptionEditor({
  draft,
  setDraft,
}: {
  draft: Exercise
  setDraft: Dispatch<SetStateAction<Exercise>>
}) {
  const prescription = draft.prescription

  if (prescription.kind === 'swim_set') {
    return (
      <>
        <View style={styles.formGrid}>
          <Field label="Reps" compact>
            <NumberStepper
              value={prescription.reps}
              min={1}
              max={40}
              onChange={(reps) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as SwimPrescription),
                    reps,
                  },
                }))
              }
            />
          </Field>

          <Field label="Distance" compact>
            <NumberStepper
              value={prescription.distance}
              min={25}
              max={2000}
              step={25}
              onChange={(distance) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as SwimPrescription),
                    distance,
                  },
                }))
              }
            />
          </Field>
        </View>

        <View style={styles.formGrid}>
          <Field label="Unit" compact>
            <SelectField
              value={prescription.distanceUnit}
              options={swimDistanceUnitOptions}
              onChange={(distanceUnit) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as SwimPrescription),
                    distanceUnit,
                  },
                }))
              }
            />
          </Field>

          <Field label="Rest (sec)" compact>
            <NumberStepper
              value={prescription.restSeconds}
              min={0}
              max={180}
              step={5}
              onChange={(restSeconds) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as SwimPrescription),
                    restSeconds,
                  },
                }))
              }
            />
          </Field>
        </View>

        <Field label="Equipment">
          <SelectField
            value={prescription.equipment}
            options={swimEquipmentOptions}
            onChange={(equipment) =>
              setDraft((current) => ({
                ...current,
                prescription: {
                  ...(current.prescription as SwimPrescription),
                  equipment,
                },
              }))
            }
          />
        </Field>

        <View style={styles.formGrid}>
          <Field label="Stroke" compact>
            <SelectField
              value={prescription.stroke}
              options={swimStrokeOptions}
              onChange={(stroke) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as SwimPrescription),
                    stroke,
                  },
                }))
              }
            />
          </Field>

          <Field label="Environment" compact>
            <SelectField
              value={prescription.environment}
              options={swimEnvironmentOptions}
              onChange={(environment) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as SwimPrescription),
                    environment,
                  },
                }))
              }
            />
          </Field>
        </View>

        <View style={styles.formGrid}>
          <Field label="Intensity" compact>
            <SelectField
              value={prescription.intensity}
              options={intensitySelectOptions}
              onChange={(intensity) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as SwimPrescription),
                    intensity,
                  },
                }))
              }
            />
          </Field>

          <Field label="Focus" compact>
            <SelectField
              value={prescription.focus}
              options={swimFocusOptions}
              onChange={(focus) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as SwimPrescription),
                    focus,
                  },
                }))
              }
            />
          </Field>
        </View>
      </>
    )
  }

  if (prescription.kind === 'bike_workout') {
    return (
      <>
        <View style={styles.formGrid}>
          <Field label="Reps" compact>
            <NumberStepper
              value={prescription.reps}
              min={1}
              max={20}
              onChange={(reps) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as BikePrescription),
                    reps,
                  },
                }))
              }
            />
          </Field>

          <Field label="Cadence" compact>
            <NumberStepper
              value={prescription.cadence}
              min={50}
              max={120}
              step={5}
              onChange={(cadence) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as BikePrescription),
                    cadence,
                  },
                }))
              }
            />
          </Field>
        </View>

        <View style={styles.formGrid}>
          <Field label="Work (min)" compact>
            <NumberStepper
              value={prescription.workDurationMin}
              min={1}
              max={120}
              onChange={(workDurationMin) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as BikePrescription),
                    workDurationMin,
                  },
                }))
              }
            />
          </Field>

          <Field label="Recovery (min)" compact>
            <NumberStepper
              value={prescription.recoveryDurationMin}
              min={0}
              max={60}
              onChange={(recoveryDurationMin) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as BikePrescription),
                    recoveryDurationMin,
                  },
                }))
              }
            />
          </Field>
        </View>

        <View style={styles.formGrid}>
          <Field label="Zone" compact>
            <SelectField
              value={prescription.zone}
              options={intensitySelectOptions}
              onChange={(zone) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as BikePrescription),
                    zone,
                  },
                }))
              }
            />
          </Field>

          <Field label="Terrain" compact>
            <SelectField
              value={prescription.terrain}
              options={bikeTerrainOptions}
              onChange={(terrain) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as BikePrescription),
                    terrain,
                  },
                }))
              }
            />
          </Field>
        </View>

        <View style={styles.formGrid}>
          <Field label="Location" compact>
            <SelectField
              value={prescription.indoor ? 'indoor' : 'outdoor'}
              options={bikeLocationOptions}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as BikePrescription),
                    indoor: value === 'indoor',
                  },
                }))
              }
            />
          </Field>

          <Field label="Focus" compact>
            <SelectField
              value={prescription.focus}
              options={bikeFocusOptions}
              onChange={(focus) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as BikePrescription),
                    focus,
                  },
                }))
              }
            />
          </Field>
        </View>
      </>
    )
  }

  if (prescription.kind === 'run_workout') {
    return (
      <>
        <View style={styles.formGrid}>
          <Field label="Format" compact>
            <SelectField
              value={prescription.format}
              options={runFormatOptions}
              onChange={(format) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as RunPrescription),
                    format,
                  },
                }))
              }
            />
          </Field>

          <Field label="Zone" compact>
            <SelectField
              value={prescription.zone}
              options={intensitySelectOptions}
              onChange={(zone) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as RunPrescription),
                    zone,
                  },
                }))
              }
            />
          </Field>
        </View>

        {prescription.format === 'continuous' ? (
          <Field label="Duration (min)">
            <NumberStepper
              value={prescription.durationMin}
              min={5}
              max={240}
              step={5}
              onChange={(durationMin) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as RunPrescription),
                    durationMin,
                  },
                }))
              }
            />
          </Field>
        ) : (
          <>
            <View style={styles.formGrid}>
              <Field label="Reps" compact>
                <NumberStepper
                  value={prescription.reps}
                  min={1}
                  max={20}
                  onChange={(reps) =>
                    setDraft((current) => ({
                      ...current,
                      prescription: {
                        ...(current.prescription as RunPrescription),
                        reps,
                      },
                    }))
                  }
                />
              </Field>

              <Field label="Distance" compact>
                <NumberStepper
                  value={prescription.distance}
                  min={100}
                  max={5000}
                  step={100}
                  onChange={(distance) =>
                    setDraft((current) => ({
                      ...current,
                      prescription: {
                        ...(current.prescription as RunPrescription),
                        distance,
                      },
                    }))
                  }
                />
              </Field>
            </View>

            <View style={styles.formGrid}>
              <Field label="Unit" compact>
                <SelectField
                  value={prescription.distanceUnit}
                  options={runDistanceUnitOptions}
                  onChange={(distanceUnit) =>
                    setDraft((current) => ({
                      ...current,
                      prescription: {
                        ...(current.prescription as RunPrescription),
                        distanceUnit,
                      },
                    }))
                  }
                />
              </Field>

              <Field label="Recovery (sec)" compact>
                <NumberStepper
                  value={prescription.recoverySeconds}
                  min={0}
                  max={300}
                  step={15}
                  onChange={(recoverySeconds) =>
                    setDraft((current) => ({
                      ...current,
                      prescription: {
                        ...(current.prescription as RunPrescription),
                        recoverySeconds,
                      },
                    }))
                  }
                />
              </Field>
            </View>
          </>
        )}

        <View style={styles.formGrid}>
          <Field label="Terrain" compact>
            <SelectField
              value={prescription.terrain}
              options={runTerrainOptions}
              onChange={(terrain) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as RunPrescription),
                    terrain,
                  },
                }))
              }
            />
          </Field>

          <Field label="Brick" compact>
            <SelectField
              value={prescription.brick ? 'yes' : 'no'}
              options={brickOptions}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as RunPrescription),
                    brick: value === 'yes',
                  },
                }))
              }
            />
          </Field>
        </View>

        <Field label="Focus">
          <SelectField
            value={prescription.focus}
            options={runFocusOptions}
            onChange={(focus) =>
              setDraft((current) => ({
                ...current,
                prescription: {
                  ...(current.prescription as RunPrescription),
                  focus,
                },
              }))
            }
          />
        </Field>
      </>
    )
  }

  if (prescription.kind === 'strength_exercise') {
    return (
      <>
        <View style={styles.formGrid}>
          <Field label="Sets" compact>
            <NumberStepper
              value={prescription.sets}
              min={1}
              max={20}
              onChange={(sets) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as StrengthPrescription),
                    sets,
                  },
                }))
              }
            />
          </Field>

          <Field label="Reps" compact>
            <NumberStepper
              value={prescription.reps}
              min={1}
              max={30}
              onChange={(reps) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as StrengthPrescription),
                    reps,
                  },
                }))
              }
            />
          </Field>
        </View>

        <View style={styles.formGrid}>
          <Field label="Rest (sec)" compact>
            <NumberStepper
              value={prescription.restSeconds}
              min={0}
              max={240}
              step={15}
              onChange={(restSeconds) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as StrengthPrescription),
                    restSeconds,
                  },
                }))
              }
            />
          </Field>

          <Field label="Side mode" compact>
            <SelectField
              value={prescription.sideMode}
              options={sideModeSelectOptions}
              onChange={(sideMode) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as StrengthPrescription),
                    sideMode,
                  },
                }))
              }
            />
          </Field>
        </View>

        <View style={styles.formGrid}>
          <Field label="Body part" compact>
            <SelectField
              value={prescription.bodyPart}
              options={bodyPartSelectOptions}
              onChange={(bodyPart) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as StrengthPrescription),
                    bodyPart,
                  },
                }))
              }
            />
          </Field>

          <Field label="Load" compact>
            <SelectField
              value={prescription.loadType}
              options={strengthLoadTypeOptions}
              onChange={(loadType) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as StrengthPrescription),
                    loadType,
                  },
                }))
              }
            />
          </Field>
        </View>

        <View style={styles.formGrid}>
          <Field label="Equipment" compact>
            <SelectField
              value={prescription.equipment}
              options={strengthEquipmentOptions}
              onChange={(equipment) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as StrengthPrescription),
                    equipment,
                  },
                }))
              }
            />
          </Field>

          <Field label="Focus" compact>
            <SelectField
              value={prescription.focus}
              options={strengthFocusOptions}
              onChange={(focus) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as StrengthPrescription),
                    focus,
                  },
                }))
              }
            />
          </Field>
        </View>
      </>
    )
  }

  if (prescription.kind === 'mobility_drill') {
    return (
      <>
        <View style={styles.formGrid}>
          <Field label="Sets" compact>
            <NumberStepper
              value={prescription.sets}
              min={1}
              max={10}
              onChange={(sets) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as MobilityPrescription),
                    sets,
                  },
                }))
              }
            />
          </Field>

          <Field label="Reps" compact>
            <NumberStepper
              value={prescription.reps}
              min={1}
              max={20}
              onChange={(reps) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as MobilityPrescription),
                    reps,
                  },
                }))
              }
            />
          </Field>
        </View>

        <View style={styles.formGrid}>
          <Field label="Hold (sec)" compact>
            <NumberStepper
              value={prescription.durationSeconds}
              min={10}
              max={180}
              step={5}
              onChange={(durationSeconds) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as MobilityPrescription),
                    durationSeconds,
                  },
                }))
              }
            />
          </Field>

          <Field label="Side mode" compact>
            <SelectField
              value={prescription.sideMode}
              options={sideModeSelectOptions}
              onChange={(sideMode) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as MobilityPrescription),
                    sideMode,
                  },
                }))
              }
            />
          </Field>
        </View>

        <View style={styles.formGrid}>
          <Field label="Body part" compact>
            <SelectField
              value={prescription.bodyPart}
              options={bodyPartSelectOptions}
              onChange={(bodyPart) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as MobilityPrescription),
                    bodyPart,
                  },
                }))
              }
            />
          </Field>

          <Field label="Focus" compact>
            <SelectField
              value={prescription.focus}
              options={mobilityFocusOptions}
              onChange={(focus) =>
                setDraft((current) => ({
                  ...current,
                  prescription: {
                    ...(current.prescription as MobilityPrescription),
                    focus,
                  },
                }))
              }
            />
          </Field>
        </View>
      </>
    )
  }

  return (
    <View style={styles.formGrid}>
      <Field label="Duration (min)" compact>
        <NumberStepper
          value={prescription.durationMin}
          min={0}
          max={180}
          step={5}
          onChange={(durationMin) =>
            setDraft((current) => ({
              ...current,
              prescription: {
                ...(current.prescription as RecoveryPrescription),
                durationMin,
              },
            }))
          }
        />
      </Field>

      <Field label="Focus" compact>
        <SelectField
          value={prescription.focus}
          options={recoveryFocusOptions}
          onChange={(focus) =>
            setDraft((current) => ({
              ...current,
              prescription: {
                ...(current.prescription as RecoveryPrescription),
                focus,
              },
            }))
          }
        />
      </Field>
    </View>
  )
}

function SegmentButton({
  label,
  active,
  tint,
  onPress,
}: {
  label: string
  active: boolean
  tint: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.segmentButton,
        {
          borderColor: active ? `${tint}55` : colors.border,
          backgroundColor: active ? `${tint}18` : colors.bg,
        },
        pressed && styles.pressedState,
      ]}
    >
      <Text style={[styles.segmentText, { color: active ? tint : colors.text }]}>{label}</Text>
    </Pressable>
  )
}

function SportBadge({ sport }: { sport: Sport }) {
  return <Badge label={sport} icon={sportMeta[sport].icon} tint={sportMeta[sport].color} />
}

function StatusBadge({ status, compact = false }: { status: SessionStatus; compact?: boolean }) {
  return <Badge label={status} tint={statusColor(status)} style={compact ? styles.compactBadge : undefined} />
}

function ExerciseTemplateList({
  items,
  selectedSession,
  onAttach,
  onEdit,
  onToggleFavorite,
  onDelete,
}: {
  items: Exercise[]
  selectedSession: Session | null
  onAttach: (exercise: Exercise) => void
  onEdit: (exercise: Exercise) => void
  onToggleFavorite: (exerciseId: string) => void
  onDelete: (exerciseId: string) => void
}) {
  if (!items.length) {
    return <Text style={styles.emptyText}>No templates match the current filters.</Text>
  }

  return (
    <View style={styles.exerciseList}>
      {items.map((exercise) => {
        const attached = Boolean(
          selectedSession?.blocks.some((block) => block.exerciseId === exercise.id),
        )
        const primaryLabel = !selectedSession ? 'Select a session' : attached ? 'Added to session' : 'Use now'
        const primaryIcon = !selectedSession
          ? 'calendar-week'
          : attached
            ? 'check-circle-outline'
            : 'playlist-plus'

        return (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseCopy}>
                <Text style={styles.itemTitle}>{exercise.title}</Text>
                <Text style={styles.caption}>{formatExerciseTemplateKindLabel(exercise.templateKind)}</Text>
                <Text style={styles.exerciseSummaryText}>{formatExerciseTemplateSummary(exercise)}</Text>
              </View>
              <View style={styles.exerciseHeaderActions}>
                <IconButton
                  size="icon-sm"
                  icon={exercise.favorite ? 'heart' : 'heart-outline'}
                  onPress={() => onToggleFavorite(exercise.id)}
                />
              </View>
            </View>

            <View style={styles.exerciseMetaRow}>
              <SportBadge sport={exercise.sport} />
              <Badge label={exercise.category} />
              <Badge label={formatExerciseTemplateKindLabel(exercise.templateKind)} />
              <Badge label={formatExerciseUseLabel(exercise)} />
            </View>

            <Text style={styles.bodyText}>{exercise.description}</Text>

            {exercise.tags.length ? (
              <View style={styles.tagRow}>
                {exercise.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} label={tag} />
                ))}
              </View>
            ) : null}

            <View style={styles.exerciseActionRow}>
              <Button
                size="sm"
                icon={primaryIcon}
                disabled={!selectedSession || attached}
                style={styles.flexButton}
                onPress={() => onAttach(exercise)}
              >
                {primaryLabel}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon="pencil-outline"
                onPress={() => onEdit(exercise)}
              >
                Edit
              </Button>
              <IconButton
                size="icon-sm"
                icon="trash-can-outline"
                disabled={!exercise.isCustom}
                onPress={() => onDelete(exercise.id)}
              />
            </View>
          </View>
        )
      })}
    </View>
  )
}

function ExerciseTemplatePresetList({
  items,
  onSelect,
}: {
  items: ExerciseTemplatePreset[]
  onSelect: (preset: ExerciseTemplatePreset) => void
}) {
  return (
    <View style={styles.presetList}>
      {items.map((preset) => (
        <Pressable
          key={preset.id}
          onPress={() => onSelect(preset)}
          style={({ pressed }) => [styles.presetCard, pressed && styles.pressedState]}
        >
          <View style={styles.presetCardHeader}>
            <View style={styles.presetCardCopy}>
              <Text style={styles.itemTitle}>{preset.title}</Text>
              <Text style={styles.caption}>{preset.category}</Text>
            </View>
            <SportBadge sport={preset.sport} />
          </View>

          <Text style={styles.caption}>{formatExercisePrescriptionSummary(preset.prescription)}</Text>
          <Text style={styles.bodyText}>{preset.description}</Text>
        </Pressable>
      ))}
    </View>
  )
}

function statusColor(status: SessionStatus) {
  if (status === 'Completed') return colors.run
  if (status === 'Skipped') return colors.bike
  return colors.recovery
}

const sportSelectOptions = sportOrder.map((sport) => ({
  label: sport,
  value: sport,
}))

const exerciseTemplateKindOptions: Array<{ label: string; value: ExerciseTemplateKind }> = [
  { label: 'Swim set', value: 'swim_set' },
  { label: 'Bike workout', value: 'bike_workout' },
  { label: 'Run workout', value: 'run_workout' },
  { label: 'Strength exercise', value: 'strength_exercise' },
  { label: 'Mobility drill', value: 'mobility_drill' },
  { label: 'Recovery block', value: 'recovery_block' },
]

const statusSelectOptions = statusOrder.map((status) => ({
  label: status,
  value: status,
}))

const intensitySelectOptions = intensityOptions.map((intensity) => ({
  label: intensity,
  value: intensity,
}))

const reminderSelectOptions = reminderOffsetOptions.map((minutes) => ({
  label: formatReminderOffset(minutes),
  value: String(minutes),
}))

const exerciseCategorySelectOptions = exerciseCategoryOptions.map((category) => ({
  label: category,
  value: category,
}))

const bodyPartSelectOptions = bodyPartOptions.map((bodyPart) => ({
  label: bodyPart[0].toUpperCase() + bodyPart.slice(1),
  value: bodyPart,
}))

const sideModeSelectOptions = sideModeOptions.map((option) => ({
  label: option.label,
  value: option.value,
}))

const workoutSectionSelectOptions = workoutSectionOrder.map((section) => ({
  label: section,
  value: section,
}))

const swimDistanceUnitOptions: Array<{ label: string; value: SwimDistanceUnit }> = [
  { label: 'Meters', value: 'm' },
  { label: 'Yards', value: 'yd' },
]

const runDistanceUnitOptions: Array<{ label: string; value: RunDistanceUnit }> = [
  { label: 'Meters', value: 'm' },
  { label: 'Kilometers', value: 'km' },
]

const swimEnvironmentOptions: Array<{ label: string; value: SwimEnvironment }> = [
  { label: 'Pool', value: 'pool' },
  { label: 'Open water', value: 'open_water' },
]

const runFormatOptions: Array<{ label: string; value: RunFormat }> = [
  { label: 'Continuous', value: 'continuous' },
  { label: 'Intervals', value: 'intervals' },
]

const swimEquipmentOptions = [
  'none',
  'pull buoy',
  'paddles',
  'kickboard',
  'fins',
].map((value) => ({ label: titleCase(value), value }))

const swimStrokeOptions = [
  'freestyle',
  'backstroke',
  'breaststroke',
  'butterfly',
  'mixed',
  'drill',
].map((value) => ({ label: titleCase(value), value }))

const swimFocusOptions = [
  'Technique',
  'Catch',
  'Breathing',
  'Threshold',
  'Endurance',
]
.map((value) => ({ label: value, value }))

const bikeTerrainOptions = ['road', 'trainer', 'hills', 'rolling', 'gravel']
  .map((value) => ({ label: titleCase(value), value }))

const bikeFocusOptions = [
  'Aerobic control',
  'Threshold power',
  'Cadence',
  'Brick pacing',
  'Recovery spin',
].map((value) => ({ label: value, value }))

const bikeLocationOptions = [
  { label: 'Outdoor', value: 'outdoor' },
  { label: 'Indoor', value: 'indoor' },
]

const runTerrainOptions = ['road', 'track', 'trail', 'treadmill', 'hills']
  .map((value) => ({ label: titleCase(value), value }))

const runFocusOptions = [
  'Aerobic base',
  'Threshold',
  'Turnover',
  'Brick pace',
  'Recovery',
].map((value) => ({ label: value, value }))

const brickOptions = [
  { label: 'No brick', value: 'no' },
  { label: 'Brick workout', value: 'yes' },
]

const strengthLoadTypeOptions = ['bodyweight', 'light', 'moderate', 'heavy', 'band']
  .map((value) => ({ label: titleCase(value), value }))

const strengthEquipmentOptions = ['none', 'dumbbell', 'barbell', 'kettlebell', 'bands', 'cable']
  .map((value) => ({ label: titleCase(value), value }))

const strengthFocusOptions = [
  'Durability',
  'Stability',
  'Power',
  'Posterior chain',
  'Core',
].map((value) => ({ label: value, value }))

const mobilityFocusOptions = [
  'Hip opening',
  'Thoracic rotation',
  'Ankles',
  'Shoulders',
  'Recovery',
].map((value) => ({ label: value, value }))

const recoveryFocusOptions = [
  'Full recovery',
  'Sleep',
  'Mobility',
  'Walk',
  'Stretch',
].map((value) => ({ label: value, value }))

function openCreateSession(
  setDraft: Dispatch<SetStateAction<SessionDraft>>,
  setEditingSessionId: Dispatch<SetStateAction<string | null>>,
  setShowForm: Dispatch<SetStateAction<boolean>>,
  date: string,
) {
  setDraft(createEmptyDraft(date))
  setEditingSessionId(null)
  setShowForm(true)
}

function focusSession(
  session: Session,
  setSelectedSessionId: Dispatch<SetStateAction<string | null>>,
  setWeekStart: Dispatch<SetStateAction<string>>,
) {
  setSelectedSessionId(session.id)
  setWeekStart(toDateKey(startOfWeek(new Date(`${session.date}T00:00:00`))))
}

function updateDraftExercise(
  setDraft: Dispatch<SetStateAction<SessionDraft>>,
  entryId: string,
  nextValues: Partial<SessionBlock>,
) {
  setDraft((current) => ({
    ...current,
    blocks: current.blocks.map((block) =>
      block.id === entryId ? { ...block, ...nextValues } : block,
    ),
  }))
}

function updateTemplateExercise(
  setDraft: Dispatch<SetStateAction<SessionTemplateDraft>>,
  entryId: string,
  nextValues: Partial<SessionBlock>,
) {
  setDraft((current) => ({
    ...current,
    blocks: current.blocks.map((block) =>
      block.id === entryId ? { ...block, ...nextValues } : block,
    ),
  }))
}

function buildSeedSessions(): Session[] {
  const weekStart = startOfWeek(new Date())

  return [
    {
      id: 'swim-technique-seed',
      title: 'Technique Swim',
      sport: 'Swim',
      date: toDateKey(addDays(weekStart, 0)),
      startTime: '06:30',
      durationMin: 60,
      intensity: 'Zone 2',
      status: 'Planned',
      favorite: false,
      notificationsEnabled: false,
      notificationOffsetMinutes: 15,
      notificationId: null,
      blocks: [
        createSessionBlock({ id: 'swim-technique', title: 'Swim Technique' }, 'Warm-up', { sets: 4, reps: 50, restSeconds: 20 }),
        createSessionBlock({ id: 'pull-buoy-set', title: 'Pull Buoy Set' }, 'Main', { sets: 8, reps: 50, restSeconds: 15 }),
      ],
    },
    {
      id: 'bike-threshold-seed',
      title: 'Threshold Bike',
      sport: 'Bike',
      date: toDateKey(addDays(weekStart, 1)),
      startTime: '18:15',
      durationMin: 75,
      intensity: 'Zone 4',
      status: 'Planned',
      favorite: true,
      notificationsEnabled: false,
      notificationOffsetMinutes: 15,
      notificationId: null,
      blocks: [createSessionBlock({ id: 'interval-bike', title: 'Interval Bike' }, 'Main', { sets: 4, reps: 8, restSeconds: 180 })],
    },
    {
      id: 'strength-seed',
      title: 'Strength Foundation',
      sport: 'Strength',
      date: toDateKey(addDays(weekStart, 2)),
      startTime: '07:00',
      durationMin: 45,
      intensity: 'Controlled',
      status: 'Completed',
      favorite: false,
      notificationsEnabled: false,
      notificationOffsetMinutes: 15,
      notificationId: null,
      blocks: [
        createSessionBlock({ id: 'strength-foundation', title: 'Strength Foundation' }, 'Main', {
          sets: 3,
          reps: 8,
          restSeconds: 60,
          sideMode: 'per-side',
          sideLabel: 'leg',
        }),
        createSessionBlock({ id: 'mobility-hips', title: 'Mobility Hips' }, 'Cooldown', { sets: 2, reps: 6, restSeconds: 30 }),
      ],
    },
    {
      id: 'tempo-run-seed',
      title: 'Tempo Run',
      sport: 'Run',
      date: toDateKey(addDays(weekStart, 3)),
      startTime: '19:00',
      durationMin: 55,
      intensity: 'Zone 3',
      status: 'Planned',
      favorite: true,
      notificationsEnabled: false,
      notificationOffsetMinutes: 15,
      notificationId: null,
      blocks: [
        createSessionBlock({ id: 'zone-2-run', title: 'Zone 2 Run' }, 'Warm-up', { sets: 1, reps: 40, restSeconds: 0 }),
        createSessionBlock({ id: 'cadence-drill', title: 'Cadence Drill' }, 'Main', { sets: 4, reps: 20, restSeconds: 30 }),
      ],
    },
    {
      id: 'mobility-seed',
      title: 'Mobility Reset',
      sport: 'Mobility',
      date: toDateKey(addDays(weekStart, 4)),
      startTime: '12:30',
      durationMin: 25,
      intensity: 'Easy',
      status: 'Planned',
      favorite: false,
      notificationsEnabled: false,
      notificationOffsetMinutes: 15,
      notificationId: null,
      blocks: [createSessionBlock({ id: 'mobility-hips', title: 'Mobility Hips' }, 'Main', { sets: 2, reps: 8, restSeconds: 20 })],
    },
    {
      id: 'brick-seed',
      title: 'Brick Session',
      sport: 'Bike',
      date: toDateKey(addDays(weekStart, 5)),
      startTime: '08:00',
      durationMin: 95,
      intensity: 'Zone 2 to 3',
      status: 'Planned',
      favorite: true,
      notificationsEnabled: false,
      notificationOffsetMinutes: 15,
      notificationId: null,
      blocks: [createSessionBlock({ id: 'brick-workout', title: 'Brick Workout' }, 'Main', { sets: 1, reps: 1, restSeconds: 0 })],
    },
    {
      id: 'rest-seed',
      title: 'Full Rest',
      sport: 'Rest',
      date: toDateKey(addDays(weekStart, 6)),
      startTime: '09:00',
      durationMin: 0,
      intensity: 'Recovery',
      status: 'Planned',
      favorite: false,
      notificationsEnabled: false,
      notificationOffsetMinutes: 15,
      notificationId: null,
      blocks: [createSessionBlock({ id: 'full-rest', title: 'Full Rest' }, 'Main', { sets: 1, reps: 1, restSeconds: 0 })],
    },
  ]
}

function buildSeedSessionTemplates(): SessionTemplate[] {
  return [
    createSessionTemplateFromSource(buildSeedSessions()[0]),
    createSessionTemplateFromSource(buildSeedSessions()[1]),
    createSessionTemplateFromSource(buildSeedSessions()[3]),
  ]
}

function buildSeedWeekTemplates(): WeekTemplate[] {
  const seedSessions = buildSeedSessions()
  const currentWeekStart = toDateKey(startOfWeek(new Date()))

  return [
    createWeekTemplateFromSessions(seedSessions, currentWeekStart, {
      title: 'Triathlon build week',
      objective: 'Balanced swim, bike, run, and durability work.',
      favorite: true,
    }),
  ]
}

function createEmptyDraft(date: string): SessionDraft {
  return {
    title: 'New session',
    sport: 'Run',
    date,
    startTime: '07:00',
    durationMin: 45,
    intensity: 'Zone 2',
    status: 'Planned',
    favorite: false,
    notificationsEnabled: false,
    notificationOffsetMinutes: 15,
    blocks: [],
  }
}

function createEmptySessionTemplateDraft(sport: Sport = 'Run'): SessionTemplateDraft {
  return {
    title: 'New template',
    sport,
    startTime: '07:00',
    durationMin: 45,
    intensity: 'Zone 2',
    favorite: false,
    blocks: [],
  }
}

function createEmptyWeekTemplateDraft(): WeekTemplateDraft {
  return {
    title: 'New week template',
    objective: '',
    favorite: false,
    sessions: [],
  }
}

function toDraft(session: Session): SessionDraft {
  return {
    title: session.title,
    sport: session.sport,
    date: session.date,
    startTime: session.startTime,
    durationMin: session.durationMin,
    intensity: session.intensity,
    status: session.status,
    favorite: session.favorite,
    notificationsEnabled: session.notificationsEnabled,
    notificationOffsetMinutes: session.notificationOffsetMinutes,
    blocks: cloneSessionBlocks(session.blocks),
  }
}

function toSessionTemplateDraft(template: SessionTemplate): SessionTemplateDraft {
  return {
    title: template.title,
    sport: template.sport,
    startTime: template.startTime,
    durationMin: template.durationMin,
    intensity: template.intensity,
    favorite: template.favorite,
    blocks: cloneSessionBlocks(template.blocks),
  }
}

function toWeekTemplateDraft(template: WeekTemplate): WeekTemplateDraft {
  return {
    title: template.title,
    objective: template.objective,
    favorite: template.favorite,
    sessions: cloneWeekTemplateSessions(template.sessions),
  }
}

function createSessionTemplateFromSource(source: Session | SessionDraft): SessionTemplate {
  return {
    id: createSessionTemplateId(),
    title: source.title.trim() || 'New template',
    sport: source.sport,
    startTime: source.startTime,
    durationMin: source.durationMin,
    intensity: source.intensity,
    favorite: source.favorite,
    blocks: cloneSessionBlocks(source.blocks),
  }
}

function createDraftFromSessionTemplate(template: SessionTemplate, date: string): SessionDraft {
  return {
    title: template.title,
    sport: template.sport,
    date,
    startTime: template.startTime,
    durationMin: template.durationMin,
    intensity: template.intensity,
    status: 'Planned',
    favorite: template.favorite,
    notificationsEnabled: false,
    notificationOffsetMinutes: 15,
    blocks: cloneSessionBlocks(template.blocks, { regenerateIds: true }),
  }
}

function createWeekTemplateDraftFromSessions(sessions: Session[], weekStart: string): WeekTemplateDraft {
  return {
    title: defaultWeekTemplateTitle(weekStart),
    objective: '',
    favorite: false,
    sessions: sessions.map((session) => createWeekTemplateSessionFromSession(session, weekStart)),
  }
}

function createDuplicateDraft(session: Session): SessionDraft {
  return {
    ...toDraft(session),
    title: `${session.title} copy`,
    status: 'Planned',
    favorite: false,
    notificationsEnabled: false,
    notificationOffsetMinutes: 15,
    blocks: cloneSessionBlocks(session.blocks, { regenerateIds: true }),
  }
}

function createWeekTemplateFromSessions(
  sessions: Session[],
  weekStart: string,
  options: Partial<Pick<WeekTemplate, 'title' | 'objective' | 'favorite'>> = {},
): WeekTemplate {
  return {
    id: createWeekTemplateId(),
    title: options.title ?? defaultWeekTemplateTitle(weekStart),
    objective: options.objective ?? '',
    favorite: options.favorite ?? false,
    sessions: sessions.map((session) => createWeekTemplateSessionFromSession(session, weekStart)),
  }
}

function createWeekTemplateSessionFromSession(session: Session, weekStart: string): WeekTemplateSession {
  return {
    dayOffset: getDayOffset(session.date, weekStart),
    title: session.title,
    sport: session.sport,
    startTime: session.startTime,
    durationMin: session.durationMin,
    intensity: session.intensity,
    favorite: session.favorite,
    blocks: cloneSessionBlocks(session.blocks),
  }
}

function readStringValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return null
}

function readNumberValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }

  return null
}

function normalizeTagsValue(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean)
}

function normalizeSportValue(value: unknown): Sport | null {
  if (typeof value !== 'string') return null

  const normalized = value.trim().toLowerCase()
  if (normalized === 'swim') return 'Swim'
  if (normalized === 'bike' || normalized === 'cycling' || normalized === 'ride') return 'Bike'
  if (normalized === 'run' || normalized === 'running') return 'Run'
  if (normalized === 'strength') return 'Strength'
  if (normalized === 'mobility') return 'Mobility'
  if (normalized === 'rest' || normalized === 'recovery') return 'Rest'

  return null
}

function secondsToRoundedMinutes(value: unknown) {
  const seconds = readNumberValue(value)
  if (seconds === null) return null
  return Math.max(0, Math.round(seconds / 60))
}

function createSessionsFromWeekTemplate(template: WeekTemplate, weekStart: string): Session[] {
  return template.sessions.map((session) => ({
    id: createId(),
    title: session.title,
    sport: session.sport,
    date: toDateKey(addDays(new Date(`${weekStart}T00:00:00`), session.dayOffset)),
    startTime: session.startTime,
    durationMin: session.durationMin,
    intensity: session.intensity,
    status: 'Planned',
    favorite: session.favorite,
    notificationsEnabled: false,
    notificationOffsetMinutes: 15,
    notificationId: null,
    blocks: cloneSessionBlocks(session.blocks, { regenerateIds: true }),
  }))
}

function duplicateWeekTemplate(template: WeekTemplate): WeekTemplate {
  return {
    ...template,
    id: createWeekTemplateId(),
    title: `${template.title} copy`,
    favorite: false,
    sessions: cloneWeekTemplateSessions(template.sessions),
  }
}

function normalizeSession(input: unknown): Session | null {
  if (!input || typeof input !== 'object') return null

  const session = input as Record<string, unknown>
  const title = typeof session.title === 'string' ? session.title : null
  const sport = normalizeSportValue(session.sport) ?? 'Run'
  const status = isSessionStatus(session.status) ? session.status : 'Planned'

  if (!title) return null

  const blocks = Array.isArray(session.blocks)
    ? session.blocks
        .map((entry) => normalizeSessionBlock(entry))
        .filter((entry): entry is SessionBlock => Boolean(entry))
    : Array.isArray(session.exerciseEntries)
      ? session.exerciseEntries
          .map((entry) => normalizeSessionExercise(entry))
          .filter((entry): entry is SessionExercise => Boolean(entry))
          .map((entry) => ({ ...entry, section: 'Main' as WorkoutSection }))
    : Array.isArray(session.exerciseIds)
      ? session.exerciseIds
          .filter((entry): entry is string => typeof entry === 'string')
          .map((exerciseId) => {
            const exercise = seedExerciseTemplates.find((item) => item.id === exerciseId)
            return exercise ? createSessionBlock(exercise, 'Main') : null
          })
          .filter((entry): entry is SessionBlock => Boolean(entry))
      : []

  return {
    id: typeof session.id === 'string' ? session.id : createId(),
    title,
    sport,
    date: typeof session.date === 'string' ? session.date : toDateKey(new Date()),
    startTime: typeof session.startTime === 'string' ? session.startTime : '07:00',
    durationMin: typeof session.durationMin === 'number' ? session.durationMin : 45,
    intensity: typeof session.intensity === 'string' ? session.intensity : 'Zone 2',
    status,
    favorite: Boolean(session.favorite),
    notificationsEnabled: Boolean(session.notificationsEnabled),
    notificationOffsetMinutes:
      typeof session.notificationOffsetMinutes === 'number' ? session.notificationOffsetMinutes : 15,
    notificationId: typeof session.notificationId === 'string' ? session.notificationId : null,
    blocks,
  }
}

function normalizeSessionExercise(input: unknown): SessionExercise | null {
  if (!input || typeof input !== 'object') return null

  const entry = input as Record<string, unknown>
  const exerciseId = typeof entry.exerciseId === 'string' ? entry.exerciseId : null
  const libraryExercise =
    exerciseId
      ? seedExerciseTemplates.find((exercise) => exercise.id === exerciseId) ?? null
      : null
  const title =
    typeof entry.title === 'string'
      ? entry.title
      : libraryExercise?.title ?? null

  if (!title) return null

  return {
    id: typeof entry.id === 'string' ? entry.id : createExerciseEntryId(),
    exerciseId,
    title,
    sets: typeof entry.sets === 'number' ? entry.sets : 1,
    reps: typeof entry.reps === 'number' ? entry.reps : 1,
    restSeconds: typeof entry.restSeconds === 'number' ? entry.restSeconds : 0,
    sideMode: isSideMode(entry.sideMode) ? entry.sideMode : 'none',
    sideLabel: typeof entry.sideLabel === 'string' ? entry.sideLabel : '',
  }
}

function normalizeSessionBlock(input: unknown): SessionBlock | null {
  const entry = normalizeSessionExercise(input)
  if (!entry || !input || typeof input !== 'object') return null
  const block = input as Record<string, unknown>

  return {
    ...entry,
    section: isWorkoutSection(block.section) ? block.section : 'Main',
  }
}

function normalizeSessionTemplate(input: unknown): SessionTemplate | null {
  if (!input || typeof input !== 'object') return null

  const template = input as Record<string, unknown>
  const sport = normalizeSportValue(template.sport)
  if (typeof template.title !== 'string' || !sport) return null

  const blocks = Array.isArray(template.blocks)
    ? template.blocks
        .map((entry) => normalizeSessionBlock(entry))
        .filter((entry): entry is SessionBlock => Boolean(entry))
    : Array.isArray(template.exerciseEntries)
      ? template.exerciseEntries
          .map((entry) => normalizeSessionExercise(entry))
          .filter((entry): entry is SessionExercise => Boolean(entry))
          .map((entry) => ({ ...entry, section: 'Main' as WorkoutSection }))
      : []

  return {
    id: typeof template.id === 'string' ? template.id : createSessionTemplateId(),
    title: template.title,
    sport,
    startTime: typeof template.startTime === 'string' ? template.startTime : '07:00',
    durationMin: typeof template.durationMin === 'number' ? template.durationMin : 45,
    intensity: typeof template.intensity === 'string' ? template.intensity : 'Zone 2',
    favorite: Boolean(template.favorite),
    blocks,
  }
}

function normalizeWeekTemplate(input: unknown): WeekTemplate | null {
  if (!input || typeof input !== 'object') return null

  const template = input as Record<string, unknown>
  if (typeof template.title !== 'string') return null

  const sessions = Array.isArray(template.sessions)
    ? template.sessions
        .map((session) => normalizeWeekTemplateSession(session))
        .filter((session): session is WeekTemplateSession => Boolean(session))
    : []

  return {
    id: typeof template.id === 'string' ? template.id : createWeekTemplateId(),
    title: template.title,
    objective: typeof template.objective === 'string' ? template.objective : '',
    favorite: Boolean(template.favorite),
    sessions,
  }
}

function normalizeWeekTemplateSession(input: unknown): WeekTemplateSession | null {
  if (!input || typeof input !== 'object') return null

  const session = input as Record<string, unknown>
  const sport = normalizeSportValue(session.sport)
  if (typeof session.title !== 'string' || !sport) return null

  const blocks = Array.isArray(session.blocks)
    ? session.blocks
        .map((entry) => normalizeSessionBlock(entry))
        .filter((entry): entry is SessionBlock => Boolean(entry))
    : Array.isArray(session.exerciseEntries)
      ? session.exerciseEntries
          .map((entry) => normalizeSessionExercise(entry))
          .filter((entry): entry is SessionExercise => Boolean(entry))
          .map((entry) => ({ ...entry, section: 'Main' as WorkoutSection }))
      : []

  return {
    dayOffset:
      typeof session.dayOffset === 'number'
        ? Math.max(0, Math.min(6, Math.round(session.dayOffset)))
        : 0,
    title: session.title,
    sport,
    startTime: typeof session.startTime === 'string' ? session.startTime : '07:00',
    durationMin: typeof session.durationMin === 'number' ? session.durationMin : 45,
    intensity: typeof session.intensity === 'string' ? session.intensity : 'Zone 2',
    favorite: Boolean(session.favorite),
    blocks,
  }
}

function createSessionExercise(
  exercise: Pick<Exercise, 'id' | 'title'> | { title: string },
  overrides: Partial<SessionExercise> = {},
): SessionExercise {
  return {
    id: createExerciseEntryId(),
    exerciseId: 'id' in exercise ? exercise.id : null,
    title: exercise.title,
    sets: 3,
    reps: 10,
    restSeconds: 45,
    sideMode: 'none',
    sideLabel: '',
    ...overrides,
  }
}

function createSessionBlock(
  exercise: Pick<Exercise, 'id' | 'title'> | { title: string },
  section: WorkoutSection = 'Main',
  overrides: Partial<SessionExercise> = {},
): SessionBlock {
  return {
    ...createSessionExercise(exercise, overrides),
    section,
  }
}

function createExerciseEntryId() {
  return `exercise-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createExerciseTemplateId() {
  return `template-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createSessionTemplateId() {
  return `session-template-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createWeekTemplateId() {
  return `week-template-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function cloneSessionBlocks(
  entries: SessionBlock[],
  options: { regenerateIds?: boolean } = {},
) {
  return entries.map((entry) => ({
    ...entry,
    id: options.regenerateIds ? createExerciseEntryId() : entry.id,
  }))
}

function cloneWeekTemplateSessions(entries: WeekTemplateSession[]) {
  return entries.map((entry) => ({
    ...entry,
    blocks: cloneSessionBlocks(entry.blocks),
  }))
}

function groupSessionBlockDetailsBySection(
  items: Array<{ block: SessionBlock; exercise: Exercise | null }>,
) {
  return workoutSectionOrder.reduce(
    (groups, section) => ({
      ...groups,
      [section]: items.filter((item) => item.block.section === section),
    }),
    {
      'Warm-up': [] as Array<{ block: SessionBlock; exercise: Exercise | null }>,
      Main: [] as Array<{ block: SessionBlock; exercise: Exercise | null }>,
      Cooldown: [] as Array<{ block: SessionBlock; exercise: Exercise | null }>,
    },
  )
}

function createExerciseTemplateDraft(sport: Sport = 'Run'): Exercise {
  const templateKind = defaultExerciseTemplateKind(sport)

  return {
    id: '',
    title: '',
    sport,
    templateKind,
    category: 'Custom',
    description: '',
    tags: [],
    favorite: false,
    isCustom: true,
    prescription: createDefaultExercisePrescription(templateKind),
    useCount: 0,
    lastUsedAt: null,
  }
}

function createExerciseTemplate({
  title,
  sport,
  templateKind,
}: {
  title: string
  sport: Sport
  templateKind?: ExerciseTemplateKind
}): Exercise {
  const resolvedKind = templateKind ?? defaultExerciseTemplateKind(sport)

  return {
    id: createExerciseTemplateId(),
    title,
    sport,
    templateKind: resolvedKind,
    category: 'Custom',
    description: '',
    tags: [],
    favorite: false,
    isCustom: true,
    prescription: createDefaultExercisePrescription(resolvedKind),
    useCount: 0,
    lastUsedAt: null,
  }
}

function normalizeExerciseTemplate(input: unknown): Exercise | null {
  if (!input || typeof input !== 'object') return null

  const template = input as Record<string, unknown>
  const title = readStringValue(template.title)
  const resolvedSport =
    normalizeSportValue(template.sport) ??
    (isExerciseTemplateKind(template.templateKind)
      ? sportForExerciseTemplateKind(template.templateKind)
      : null)

  if (!title || !resolvedSport) return null

  const templateKind = normalizeExerciseTemplateKind(template.templateKind, resolvedSport)
  const category = readStringValue(template.category) ?? inferLegacyExerciseCategory(templateKind)
  const description = readStringValue(template.description, template.notes, template.note) ?? ''
  const tags = normalizeTagsValue(template.tags)
  const legacySource = buildLegacyExerciseTemplateSource({
    template,
    title,
    sport: resolvedSport,
    templateKind,
    category,
    description,
    tags,
  })

  return {
    id: typeof template.id === 'string' ? template.id : createExerciseTemplateId(),
    title,
    sport: resolvedSport,
    templateKind,
    category,
    description,
    tags,
    favorite: Boolean(template.favorite),
    isCustom: typeof template.isCustom === 'boolean' ? template.isCustom : true,
    prescription: normalizeExercisePrescription(legacySource, templateKind),
    useCount:
      typeof template.useCount === 'number' && Number.isFinite(template.useCount)
        ? Math.max(0, Math.round(template.useCount))
        : 0,
    lastUsedAt: typeof template.lastUsedAt === 'string' ? template.lastUsedAt : null,
  }
}

function defaultExerciseTemplateKind(sport: Sport): ExerciseTemplateKind {
  if (sport === 'Swim') return 'swim_set'
  if (sport === 'Bike') return 'bike_workout'
  if (sport === 'Run') return 'run_workout'
  if (sport === 'Strength') return 'strength_exercise'
  if (sport === 'Mobility') return 'mobility_drill'
  return 'recovery_block'
}

function sportForExerciseTemplateKind(templateKind: ExerciseTemplateKind): Sport {
  if (templateKind === 'swim_set') return 'Swim'
  if (templateKind === 'bike_workout') return 'Bike'
  if (templateKind === 'run_workout') return 'Run'
  if (templateKind === 'strength_exercise') return 'Strength'
  if (templateKind === 'mobility_drill') return 'Mobility'
  return 'Rest'
}

function normalizeExerciseTemplateKind(
  value: unknown,
  sport: Sport,
): ExerciseTemplateKind {
  return isExerciseTemplateKind(value) ? value : defaultExerciseTemplateKind(sport)
}

function inferLegacyExerciseCategory(templateKind: ExerciseTemplateKind) {
  if (templateKind === 'swim_set') return 'Technique'
  if (templateKind === 'bike_workout') return 'Endurance'
  if (templateKind === 'run_workout') return 'Endurance'
  if (templateKind === 'strength_exercise') return 'Durability'
  if (templateKind === 'mobility_drill') return 'Recovery'
  return 'Recovery'
}

function buildLegacyExerciseTemplateSource({
  template,
  title,
  sport,
  templateKind,
  category,
  description,
  tags,
}: {
  template: Record<string, unknown>
  title: string
  sport: Sport
  templateKind: ExerciseTemplateKind
  category: string
  description: string
  tags: string[]
}) {
  const nested =
    template.prescription && typeof template.prescription === 'object'
      ? (template.prescription as Record<string, unknown>)
      : {}
  const merged: Record<string, unknown> = {
    ...template,
    ...nested,
  }
  const searchText = [title, sport, category, description, ...tags].join(' ').toLowerCase()

  if (templateKind === 'swim_set') {
    return {
      ...merged,
      reps: readNumberValue(merged.reps, merged.sets),
      distance: readNumberValue(merged.distance),
      restSeconds: readNumberValue(merged.restSeconds, merged.recoverySeconds),
      equipment:
        readStringValue(
          merged.equipment,
          searchText.includes('pull buoy')
            ? 'pull buoy'
            : searchText.includes('paddles')
              ? 'paddles'
              : searchText.includes('fins')
                ? 'fins'
                : searchText.includes('kickboard')
                  ? 'kickboard'
                  : null,
        ) ?? undefined,
      stroke:
        readStringValue(
          merged.stroke,
          searchText.includes('backstroke')
            ? 'backstroke'
            : searchText.includes('breaststroke')
              ? 'breaststroke'
              : searchText.includes('butterfly')
                ? 'butterfly'
                : searchText.includes('drill')
                  ? 'drill'
                  : null,
        ) ?? undefined,
      focus: readStringValue(merged.focus, merged.category, merged.intensity),
      intensity: readStringValue(merged.intensity, merged.zone),
      environment:
        merged.environment === 'pool' || merged.environment === 'open_water'
          ? merged.environment
          : searchText.includes('open water')
            ? 'open_water'
            : 'pool',
    }
  }

  if (templateKind === 'bike_workout') {
    return {
      ...merged,
      reps: readNumberValue(merged.reps, merged.sets),
      workDurationMin: readNumberValue(merged.workDurationMin, merged.durationMin),
      recoveryDurationMin: readNumberValue(
        merged.recoveryDurationMin,
        secondsToRoundedMinutes(merged.restSeconds),
        secondsToRoundedMinutes(merged.recoverySeconds),
      ),
      zone: readStringValue(merged.zone, merged.intensity, merged.category),
      cadence: readNumberValue(merged.cadence),
      terrain:
        readStringValue(
          merged.terrain,
          searchText.includes('trainer')
            ? 'trainer'
            : searchText.includes('gravel')
              ? 'gravel'
              : searchText.includes('hills')
                ? 'hills'
                : searchText.includes('rolling')
                  ? 'rolling'
                  : null,
        ) ?? undefined,
      indoor:
        typeof merged.indoor === 'boolean'
          ? merged.indoor
          : searchText.includes('trainer') || searchText.includes('indoor'),
      focus: readStringValue(merged.focus, merged.category, merged.description),
    }
  }

  if (templateKind === 'run_workout') {
    const distance = readNumberValue(merged.distance)
    const recoverySeconds = readNumberValue(merged.recoverySeconds, merged.restSeconds)
    const reps = readNumberValue(merged.reps, merged.sets)

    return {
      ...merged,
      format:
        merged.format === 'continuous' || merged.format === 'intervals'
          ? merged.format
          : distance || recoverySeconds || (reps && reps > 1)
            ? 'intervals'
            : 'continuous',
      reps,
      distance,
      durationMin: readNumberValue(merged.durationMin),
      recoverySeconds,
      zone: readStringValue(merged.zone, merged.intensity, merged.category),
      terrain:
        readStringValue(
          merged.terrain,
          searchText.includes('track')
            ? 'track'
            : searchText.includes('trail')
              ? 'trail'
              : searchText.includes('treadmill')
                ? 'treadmill'
                : searchText.includes('hills')
                  ? 'hills'
                  : null,
        ) ?? undefined,
      brick:
        typeof merged.brick === 'boolean'
          ? merged.brick
          : searchText.includes('brick') || searchText.includes('transition'),
      focus: readStringValue(merged.focus, merged.category, merged.description),
    }
  }

  if (templateKind === 'strength_exercise') {
    return {
      ...merged,
      sets: readNumberValue(merged.sets, merged.reps),
      reps: readNumberValue(merged.reps),
      restSeconds: readNumberValue(merged.restSeconds, merged.recoverySeconds),
      sideMode: isSideMode(merged.sideMode)
        ? merged.sideMode
        : searchText.includes('single-leg') || searchText.includes('per side')
          ? 'per-side'
          : undefined,
      bodyPart:
        readStringValue(
          merged.bodyPart,
          merged.sideLabel,
          searchText.includes('core')
            ? 'core'
            : searchText.includes('shoulder')
              ? 'shoulder'
              : searchText.includes('hip')
                ? 'hip'
                : searchText.includes('arm')
                  ? 'arm'
                  : null,
        ) ?? undefined,
      loadType: readStringValue(merged.loadType, merged.intensity),
      equipment: readStringValue(merged.equipment),
      focus: readStringValue(merged.focus, merged.category),
    }
  }

  if (templateKind === 'mobility_drill') {
    return {
      ...merged,
      sets: readNumberValue(merged.sets),
      reps: readNumberValue(merged.reps),
      durationSeconds: readNumberValue(
        merged.durationSeconds,
        merged.restSeconds,
        readNumberValue(merged.durationMin) !== null ? readNumberValue(merged.durationMin)! * 60 : null,
      ),
      sideMode: isSideMode(merged.sideMode) ? merged.sideMode : undefined,
      bodyPart: readStringValue(merged.bodyPart, merged.sideLabel),
      focus: readStringValue(merged.focus, merged.category),
    }
  }

  return {
    ...merged,
    durationMin: readNumberValue(merged.durationMin),
    focus: readStringValue(merged.focus, merged.category, merged.description),
  }
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function createDefaultExercisePrescription(
  templateKind: ExerciseTemplateKind,
): ExercisePrescription {
  if (templateKind === 'swim_set') {
    return {
      kind: 'swim_set',
      reps: 6,
      distance: 50,
      distanceUnit: 'm',
      restSeconds: 20,
      equipment: 'none',
      stroke: 'freestyle',
      focus: 'Technique',
      intensity: 'Easy',
      environment: 'pool',
    }
  }

  if (templateKind === 'bike_workout') {
    return {
      kind: 'bike_workout',
      reps: 4,
      workDurationMin: 8,
      recoveryDurationMin: 3,
      zone: 'Zone 3',
      cadence: 90,
      terrain: 'road',
      indoor: false,
      focus: 'Aerobic control',
    }
  }

  if (templateKind === 'run_workout') {
    return {
      kind: 'run_workout',
      format: 'continuous',
      reps: 1,
      distance: 0,
      distanceUnit: 'km',
      durationMin: 45,
      recoverySeconds: 0,
      zone: 'Zone 2',
      terrain: 'road',
      brick: false,
      focus: 'Aerobic base',
    }
  }

  if (templateKind === 'strength_exercise') {
    return {
      kind: 'strength_exercise',
      sets: 3,
      reps: 8,
      restSeconds: 60,
      sideMode: 'none',
      bodyPart: 'leg',
      loadType: 'bodyweight',
      equipment: 'none',
      focus: 'Durability',
    }
  }

  if (templateKind === 'mobility_drill') {
    return {
      kind: 'mobility_drill',
      sets: 2,
      reps: 6,
      durationSeconds: 45,
      sideMode: 'none',
      bodyPart: 'hip',
      focus: 'Mobility',
    }
  }

  return {
    kind: 'recovery_block',
    durationMin: 0,
    focus: 'Recovery',
  }
}

function cloneExercisePrescription<T extends ExercisePrescription>(prescription: T): T {
  return { ...prescription }
}

function normalizeExercisePrescription(
  input: unknown,
  templateKind: ExerciseTemplateKind,
): ExercisePrescription {
  const fallback = createDefaultExercisePrescription(templateKind)

  if (!input || typeof input !== 'object') return fallback
  const prescription = input as Record<string, unknown>

  if (templateKind === 'swim_set') {
    const defaults = fallback as SwimPrescription

    return {
      kind: 'swim_set',
      reps: readNumberValue(prescription.reps) ?? defaults.reps,
      distance: readNumberValue(prescription.distance) ?? defaults.distance,
      distanceUnit:
        prescription.distanceUnit === 'm' || prescription.distanceUnit === 'yd'
          ? prescription.distanceUnit
          : defaults.distanceUnit,
      restSeconds: readNumberValue(prescription.restSeconds) ?? defaults.restSeconds,
      equipment: readStringValue(prescription.equipment) ?? defaults.equipment,
      stroke: readStringValue(prescription.stroke) ?? defaults.stroke,
      focus: readStringValue(prescription.focus) ?? defaults.focus,
      intensity: readStringValue(prescription.intensity) ?? defaults.intensity,
      environment:
        prescription.environment === 'pool' || prescription.environment === 'open_water'
          ? prescription.environment
          : defaults.environment,
    }
  }

  if (templateKind === 'bike_workout') {
    const defaults = fallback as BikePrescription

    return {
      kind: 'bike_workout',
      reps: readNumberValue(prescription.reps) ?? defaults.reps,
      workDurationMin: readNumberValue(prescription.workDurationMin) ?? defaults.workDurationMin,
      recoveryDurationMin:
        readNumberValue(prescription.recoveryDurationMin) ?? defaults.recoveryDurationMin,
      zone: readStringValue(prescription.zone) ?? defaults.zone,
      cadence: readNumberValue(prescription.cadence) ?? defaults.cadence,
      terrain: readStringValue(prescription.terrain) ?? defaults.terrain,
      indoor: typeof prescription.indoor === 'boolean' ? prescription.indoor : defaults.indoor,
      focus: readStringValue(prescription.focus) ?? defaults.focus,
    }
  }

  if (templateKind === 'run_workout') {
    const defaults = fallback as RunPrescription

    return {
      kind: 'run_workout',
      format:
        prescription.format === 'continuous' || prescription.format === 'intervals'
          ? prescription.format
          : defaults.format,
      reps: readNumberValue(prescription.reps) ?? defaults.reps,
      distance: readNumberValue(prescription.distance) ?? defaults.distance,
      distanceUnit:
        prescription.distanceUnit === 'm' || prescription.distanceUnit === 'km'
          ? prescription.distanceUnit
          : defaults.distanceUnit,
      durationMin: readNumberValue(prescription.durationMin) ?? defaults.durationMin,
      recoverySeconds: readNumberValue(prescription.recoverySeconds) ?? defaults.recoverySeconds,
      zone: readStringValue(prescription.zone) ?? defaults.zone,
      terrain: readStringValue(prescription.terrain) ?? defaults.terrain,
      brick: typeof prescription.brick === 'boolean' ? prescription.brick : defaults.brick,
      focus: readStringValue(prescription.focus) ?? defaults.focus,
    }
  }

  if (templateKind === 'strength_exercise') {
    const defaults = fallback as StrengthPrescription

    return {
      kind: 'strength_exercise',
      sets: readNumberValue(prescription.sets) ?? defaults.sets,
      reps: readNumberValue(prescription.reps) ?? defaults.reps,
      restSeconds: readNumberValue(prescription.restSeconds) ?? defaults.restSeconds,
      sideMode: isSideMode(prescription.sideMode) ? prescription.sideMode : defaults.sideMode,
      bodyPart: readStringValue(prescription.bodyPart) ?? defaults.bodyPart,
      loadType: readStringValue(prescription.loadType) ?? defaults.loadType,
      equipment: readStringValue(prescription.equipment) ?? defaults.equipment,
      focus: readStringValue(prescription.focus) ?? defaults.focus,
    }
  }

  if (templateKind === 'mobility_drill') {
    const defaults = fallback as MobilityPrescription

    return {
      kind: 'mobility_drill',
      sets: readNumberValue(prescription.sets) ?? defaults.sets,
      reps: readNumberValue(prescription.reps) ?? defaults.reps,
      durationSeconds: readNumberValue(prescription.durationSeconds) ?? defaults.durationSeconds,
      sideMode: isSideMode(prescription.sideMode) ? prescription.sideMode : defaults.sideMode,
      bodyPart: readStringValue(prescription.bodyPart) ?? defaults.bodyPart,
      focus: readStringValue(prescription.focus) ?? defaults.focus,
    }
  }

  const defaults = fallback as RecoveryPrescription

  return {
    kind: 'recovery_block',
    durationMin: readNumberValue(prescription.durationMin) ?? defaults.durationMin,
    focus: readStringValue(prescription.focus) ?? defaults.focus,
  }
}

function isSport(value: unknown): value is Sport {
  return typeof value === 'string' && sportOrder.includes(value as Sport)
}

function isExerciseTemplateKind(value: unknown): value is ExerciseTemplateKind {
  return (
    value === 'swim_set' ||
    value === 'bike_workout' ||
    value === 'run_workout' ||
    value === 'strength_exercise' ||
    value === 'mobility_drill' ||
    value === 'recovery_block'
  )
}

function isWorkoutSection(value: unknown): value is WorkoutSection {
  return value === 'Warm-up' || value === 'Main' || value === 'Cooldown'
}

function isSessionStatus(value: unknown): value is SessionStatus {
  return typeof value === 'string' && statusOrder.includes(value as SessionStatus)
}

function isSideMode(value: unknown): value is ExerciseSideMode {
  return value === 'none' || value === 'per-side' || value === 'both-sides'
}

function sortExerciseTemplates(items: Exercise[]) {
  return [...items].sort((left, right) => {
    if (left.favorite !== right.favorite) return left.favorite ? -1 : 1
    const leftUsedTime = left.lastUsedAt ? new Date(left.lastUsedAt).getTime() : 0
    const rightUsedTime = right.lastUsedAt ? new Date(right.lastUsedAt).getTime() : 0
    if (leftUsedTime !== rightUsedTime) return rightUsedTime - leftUsedTime
    if (left.useCount !== right.useCount) return right.useCount - left.useCount
    if (left.sport !== right.sport) return left.sport.localeCompare(right.sport)
    return left.title.localeCompare(right.title)
  })
}

function sortSessionTemplates(items: SessionTemplate[]) {
  return [...items].sort((left, right) => {
    if (left.favorite !== right.favorite) return left.favorite ? -1 : 1
    if (left.sport !== right.sport) return left.sport.localeCompare(right.sport)
    return left.title.localeCompare(right.title)
  })
}

function sortWeekTemplates(items: WeekTemplate[]) {
  return [...items].sort((left, right) => {
    if (left.favorite !== right.favorite) return left.favorite ? -1 : 1
    return left.title.localeCompare(right.title)
  })
}

function sortExercisesForSport(items: Exercise[], sport: Sport) {
  return sortExerciseTemplates(items).sort((left, right) => {
    const leftScore = left.sport === sport ? 0 : 1
    const rightScore = right.sport === sport ? 0 : 1
    if (leftScore !== rightScore) return leftScore - rightScore
    return left.title.localeCompare(right.title)
  })
}

function parsePositiveNumber(value: string, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.round(parsed)
}

function parseNonNegativeNumber(value: string, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.round(parsed)
}

function sortSessions(items: Session[]) {
  return [...items].sort((left, right) =>
    `${left.date}-${left.startTime}`.localeCompare(`${right.date}-${right.startTime}`),
  )
}

function buildWeekDays(weekStart: string) {
  const monday = new Date(`${weekStart}T00:00:00`)

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index)
    return {
      date: toDateKey(date),
      label: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date),
      shortDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date),
    }
  })
}

function getDayOffset(date: string, weekStart: string) {
  const target = new Date(`${date}T00:00:00`).getTime()
  const start = new Date(`${weekStart}T00:00:00`).getTime()
  return Math.max(0, Math.round((target - start) / (1000 * 60 * 60 * 24)))
}

function startOfWeek(date: Date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function shiftWeek(weekStart: string, days: number) {
  return toDateKey(addDays(new Date(`${weekStart}T00:00:00`), days))
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toTimeKey(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function parseDateKey(date: string) {
  return new Date(`${date}T00:00:00`)
}

function parseTimeKey(time: string) {
  const [hours = '07', minutes = '00'] = time.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)
  return date
}

function isDateWithinWeek(date: string, weekStart: string) {
  const target = new Date(`${date}T00:00:00`).getTime()
  const start = new Date(`${weekStart}T00:00:00`).getTime()
  const end = addDays(new Date(`${weekStart}T00:00:00`), 7).getTime()
  return target >= start && target < end
}

function formatWeekRange(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`)
  const end = addDays(start, 6)
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' })
  return `${formatter.format(start)} to ${formatter.format(end)}`
}

function defaultWeekTemplateTitle(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`)
  return `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(start)} build week`
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(`${date}T00:00:00`),
  )
}

function formatDetailDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function formatDateInputLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(parseDateKey(date))
}

function formatTimeInputLabel(time: string) {
  const [hours = '07', minutes = '00'] = time.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatMinutes(minutes: number) {
  if (!minutes) return 'Rest'
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (!hours) return `${remainingMinutes} min`
  if (!remainingMinutes) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
}

function formatDayOffset(dayOffset: number) {
  const reference = addDays(new Date('2026-01-05T00:00:00'), dayOffset)
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(reference)
}

function summarizeWeekTemplateDays(sessions: WeekTemplateSession[]) {
  const counts = Array.from({ length: 7 }, (_, index) => ({
    dayOffset: index,
    count: sessions.filter((session) => session.dayOffset === index).length,
  })).filter((item) => item.count > 0)

  return counts.map((item) => `${formatDayOffset(item.dayOffset).slice(0, 3)} ${item.count}`)
}

function countUniqueDays(sessions: WeekTemplateSession[]) {
  return new Set(sessions.map((session) => session.dayOffset)).size
}

function formatWeekTemplateMinutes(sessions: WeekTemplateSession[]) {
  const total = sessions.reduce((sum, session) => sum + session.durationMin, 0)
  return formatMinutes(total)
}

function formatTrendMinutes(delta: number) {
  if (!delta) return 'No change'
  const direction = delta > 0 ? '+' : '-'
  return `${direction}${formatMinutes(Math.abs(delta))}`
}

function formatTrendCount(delta: number) {
  if (!delta) return 'No change'
  const direction = delta > 0 ? '+' : '-'
  return `${direction}${Math.abs(delta)} session${Math.abs(delta) > 1 ? 's' : ''}`
}

function calculateCompletionStreak(sessions: Session[], todayKey: string) {
  let streak = 0
  let cursor = new Date(`${todayKey}T00:00:00`)

  while (true) {
    const key = toDateKey(cursor)
    const daySessions = sessions.filter((session) => session.date === key)
    if (!daySessions.some((session) => session.status === 'Completed')) break
    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}

function buildWeeklyHistory(sessions: Session[], referenceWeekStart: string, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const targetWeekStart = shiftWeek(referenceWeekStart, -7 * (count - index - 1))
    const weekSessions = sessions.filter((session) => isDateWithinWeek(session.date, targetWeekStart))
    const completed = weekSessions.filter((session) => session.status === 'Completed').length
    const minutes = weekSessions.reduce((sum, session) => sum + session.durationMin, 0)
    const completionRate = weekSessions.length ? Math.round((completed / weekSessions.length) * 100) : 0

    return {
      weekStart: targetWeekStart,
      label: formatWeekRange(targetWeekStart),
      sessions: weekSessions.length,
      completed,
      minutes,
      completionRate,
    }
  })
}

type BackupPayload = {
  version: number
  exportedAt: string
  sessions: Session[]
  exerciseTemplates: Exercise[]
  sessionTemplates: SessionTemplate[]
  weekTemplates: WeekTemplate[]
}

function buildBackupPayload({
  sessions,
  exerciseTemplates,
  sessionTemplates,
  weekTemplates,
}: Omit<BackupPayload, 'version' | 'exportedAt'>): BackupPayload {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    sessions,
    exerciseTemplates,
    sessionTemplates,
    weekTemplates,
  }
}

function normalizeBackupPayload(input: string): BackupPayload | null {
  try {
    const parsed = JSON.parse(input) as unknown
    if (!parsed || typeof parsed !== 'object') return null

    const payload = parsed as Record<string, unknown>
    const sessions = Array.isArray(payload.sessions)
      ? payload.sessions
          .map((session) => normalizeSession(session))
          .filter((session): session is Session => Boolean(session))
      : []
    const exerciseTemplates = Array.isArray(payload.exerciseTemplates)
      ? payload.exerciseTemplates
          .map((template) => normalizeExerciseTemplate(template))
          .filter((template): template is Exercise => Boolean(template))
      : []
    const sessionTemplates = Array.isArray(payload.sessionTemplates)
      ? payload.sessionTemplates
          .map((template) => normalizeSessionTemplate(template))
          .filter((template): template is SessionTemplate => Boolean(template))
      : []
    const weekTemplates = Array.isArray(payload.weekTemplates)
      ? payload.weekTemplates
          .map((template) => normalizeWeekTemplate(template))
          .filter((template): template is WeekTemplate => Boolean(template))
      : []

    return {
      version: typeof payload.version === 'number' ? payload.version : 1,
      exportedAt: typeof payload.exportedAt === 'string' ? payload.exportedAt : new Date().toISOString(),
      sessions,
      exerciseTemplates,
      sessionTemplates,
      weekTemplates,
    }
  } catch (_error) {
    return null
  }
}

function formatExercisePrescription(entry: SessionExercise) {
  const repLabel = `${entry.sets} set${entry.sets > 1 ? 's' : ''} x ${entry.reps} rep${entry.reps > 1 ? 's' : ''}`
  const sideLabel =
    entry.sideMode === 'none'
      ? null
      : entry.sideMode === 'per-side'
        ? `per ${entry.sideLabel || 'side'}`
        : `both ${entry.sideLabel || 'sides'}`
  const restLabel = entry.restSeconds ? `${entry.restSeconds}s rest` : 'no rest'

  return [repLabel, sideLabel, restLabel].filter(Boolean).join(' · ')
}

function formatExercisePrescriptionSummary(prescription: ExercisePrescription) {
  if (prescription.kind === 'swim_set') {
    return `${prescription.reps} x ${prescription.distance}${prescription.distanceUnit} · ${prescription.restSeconds}s rest · ${prescription.equipment}`
  }

  if (prescription.kind === 'bike_workout') {
    return `${prescription.reps} x ${prescription.workDurationMin} min · ${prescription.recoveryDurationMin} min easy · ${prescription.zone}`
  }

  if (prescription.kind === 'run_workout') {
    if (prescription.format === 'continuous') {
      return `${prescription.durationMin} min continuous · ${prescription.zone}${prescription.brick ? ' · brick' : ''}`
    }

    return `${prescription.reps} x ${prescription.distance}${prescription.distanceUnit} · ${prescription.recoverySeconds}s recovery · ${prescription.zone}`
  }

  if (prescription.kind === 'strength_exercise') {
    const sideLabel =
      prescription.sideMode === 'none'
        ? null
        : prescription.sideMode === 'per-side'
          ? `per ${prescription.bodyPart}`
          : `both ${prescription.bodyPart}s`

    return [`${prescription.sets} x ${prescription.reps}`, sideLabel, `${prescription.restSeconds}s rest`]
      .filter(Boolean)
      .join(' · ')
  }

  if (prescription.kind === 'mobility_drill') {
    return [`${prescription.sets} x ${prescription.reps}`, `${prescription.durationSeconds}s hold`, prescription.bodyPart]
      .filter(Boolean)
      .join(' · ')
  }

  return prescription.durationMin ? `${prescription.durationMin} min recovery` : 'Recovery block'
}

function formatExerciseTemplateSummary(exercise: Exercise) {
  return formatExercisePrescriptionSummary(exercise.prescription)
}

function registerExerciseTemplateUse(exercise: Exercise): Exercise {
  return {
    ...exercise,
    useCount: (exercise.useCount ?? 0) + 1,
    lastUsedAt: new Date().toISOString(),
  }
}

function formatExerciseTemplateKindLabel(templateKind: ExerciseTemplateKind) {
  return exerciseTemplateKindOptions.find((option) => option.value === templateKind)?.label ?? 'Template'
}

function formatExerciseUseLabel(exercise: Exercise) {
  if (!exercise.lastUsedAt || exercise.useCount <= 0) return 'Not used yet'
  if (exercise.useCount === 1) return 'Used once'
  return `Used ${exercise.useCount} times`
}

function getExerciseForSessionBlock(
  block: SessionBlock,
  exerciseTemplatesById: Map<string, Exercise>,
) {
  return block.exerciseId ? exerciseTemplatesById.get(block.exerciseId) ?? null : null
}

function formatSessionBlockSummary(block: SessionBlock, exercise: Exercise | null) {
  const summary = exercise ? formatExerciseTemplateSummary(exercise) : formatExercisePrescription(block)
  return `${block.section} · ${summary}`
}

function buildSessionPreview(session: Session, exerciseTemplatesById: Map<string, Exercise>) {
  const leadBlock =
    session.blocks.find((block) => block.section === 'Main') ??
    session.blocks.find((block) => block.section === 'Warm-up') ??
    session.blocks[0]

  if (!leadBlock) return 'No workout blocks yet'

  const leadExercise = getExerciseForSessionBlock(leadBlock, exerciseTemplatesById)
  const leadSummary = leadExercise
    ? formatExerciseTemplateSummary(leadExercise)
    : formatExercisePrescription(leadBlock)

  return session.blocks.length > 1
    ? `${leadSummary} · +${session.blocks.length - 1} more block${session.blocks.length > 2 ? 's' : ''}`
    : leadSummary
}

function matchesExerciseLibraryQuickFilter(
  exercise: Exercise,
  filter: ExerciseLibraryQuickFilter,
) {
  if (filter === 'All') return true
  if (filter === 'Favorites') return exercise.favorite
  if (filter === 'Recent') return Boolean(exercise.lastUsedAt)

  const searchText = [
    exercise.title,
    exercise.category,
    exercise.description,
    formatExerciseTemplateSummary(exercise),
    ...exercise.tags,
  ]
    .join(' ')
    .toLowerCase()

  if (filter === 'Technique') return searchText.includes('technique')
  if (filter === 'Endurance') return searchText.includes('endurance') || searchText.includes('aerobic')
  if (filter === 'Threshold') return searchText.includes('threshold') || searchText.includes('tempo')
  if (filter === 'Recovery') return searchText.includes('recovery') || searchText.includes('easy')
  if (filter === 'Brick') return searchText.includes('brick') || searchText.includes('transition')
  return searchText.includes('drill')
}

function createSessionDateTime(session: Session) {
  const [hours = '7', minutes = '0'] = session.startTime.split(':')
  const start = new Date(`${session.date}T00:00:00`)
  start.setHours(Number(hours), Number(minutes), 0, 0)

  const durationMinutes = Math.max(session.durationMin, 30)
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + durationMinutes)

  return { start, end }
}

function buildSessionCalendarNotes(
  session: Session,
  exerciseTemplatesById: Map<string, Exercise>,
) {
  const blockLines = workoutSectionOrder.flatMap((section) => {
    const items = session.blocks.filter((block) => block.section === section)
    if (!items.length) return []

    return [
      `${section}:`,
      ...items.map((block) => {
        const exercise = getExerciseForSessionBlock(block, exerciseTemplatesById)
        return `- ${block.title}: ${formatSessionBlockSummary(block, exercise)}`
      }),
    ]
  })

  const lines = [
    `Sport: ${session.sport}`,
    `Intensity: ${session.intensity}`,
    `Focus: ${buildSessionPreview(session, exerciseTemplatesById)}`,
    blockLines.length ? 'Workout blocks:' : null,
    ...blockLines,
  ].filter((line): line is string => Boolean(line))

  return lines.join('\n')
}

async function ensureNotificationPermissions() {
  if (Platform.OS === 'web') {
    Alert.alert('Unavailable', 'Local reminders are only available on iPhone and Android.')
    return false
  }

  const current = await Notifications.getPermissionsAsync()
  if (current.granted) return true

  const requested = await Notifications.requestPermissionsAsync()
  return requested.granted
}

function formatReminderOffset(minutes: number) {
  if (minutes < 60) return `${minutes}m before`
  const hours = minutes / 60
  return Number.isInteger(hours) ? `${hours}h before` : `${minutes}m before`
}

async function cancelSessionNotification(notificationId: string | null) {
  if (!notificationId || Platform.OS === 'web') return

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  } catch (_error) {
    return
  }
}

async function scheduleSessionNotification(session: Session): Promise<{
  notificationId: string | null
  permissionDenied: boolean
}> {
  if (Platform.OS === 'web') {
    return { notificationId: null, permissionDenied: false }
  }

  if (!session.notificationsEnabled || session.status !== 'Planned') {
    return { notificationId: null, permissionDenied: false }
  }

  const { start } = createSessionDateTime(session)
  const triggerDate = new Date(start.getTime() - session.notificationOffsetMinutes * 60 * 1000)

  if (triggerDate.getTime() <= Date.now()) {
    return { notificationId: null, permissionDenied: false }
  }

  const granted = await ensureNotificationPermissions()
  if (!granted) {
    Alert.alert('Permission needed', 'Enable notifications on your phone to use reminders.')
    return { notificationId: null, permissionDenied: true }
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: session.title,
      body: `${session.sport} starts at ${session.startTime}. ${formatReminderOffset(
        session.notificationOffsetMinutes,
      )}.`,
      data: {
        sessionId: session.id,
      },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: 'zenta-reminders',
    },
  })

  return { notificationId, permissionDenied: false }
}

async function prepareSessionForNotifications(nextSession: Session, previousSession?: Session) {
  if (previousSession?.notificationId) {
    await cancelSessionNotification(previousSession.notificationId)
  }

  const { notificationId, permissionDenied } = await scheduleSessionNotification(nextSession)

  return {
    ...nextSession,
    notificationsEnabled: permissionDenied ? false : nextSession.notificationsEnabled,
    notificationId,
  }
}

async function addSessionToSystemCalendar(
  session: Session,
  exerciseTemplatesById: Map<string, Exercise>,
) {
  if (Platform.OS === 'web') {
    Alert.alert('Unavailable', 'Phone calendar integration is only available on iPhone and Android.')
    return
  }

  try {
    const { start, end } = createSessionDateTime(session)

    await Calendar.createEventInCalendarAsync({
      title: session.title,
      startDate: start,
      endDate: end,
      notes: buildSessionCalendarNotes(session, exerciseTemplatesById),
    })
  } catch (error) {
    Alert.alert('Calendar error', 'Unable to open the system calendar for this session.')
  }
}

async function addWeekToSystemCalendar(
  sessions: Session[],
  exerciseTemplatesById: Map<string, Exercise>,
) {
  if (!sessions.length) {
    Alert.alert('No sessions', 'There are no sessions in this week to add.')
    return
  }

  if (Platform.OS === 'web') {
    Alert.alert('Unavailable', 'Phone calendar integration is only available on iPhone and Android.')
    return
  }

  try {
    for (const session of sortSessions(sessions)) {
      const { start, end } = createSessionDateTime(session)

      await Calendar.createEventInCalendarAsync({
        title: session.title,
        startDate: start,
        endDate: end,
        notes: buildSessionCalendarNotes(session, exerciseTemplatesById),
      })
    }
  } catch (error) {
    Alert.alert('Calendar error', 'Unable to finish adding the week to your calendar.')
  }
}

function createId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  appShell: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screenTransitionWrap: {
    flex: 1,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 124,
    gap: layout.sectionGap,
  },
  appHeaderContent: {
    paddingTop: spacing.lg,
  },
  appHeaderRow: {
    gap: layout.sectionGap,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  feedbackCopy: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  feedbackMessage: {
    flex: 1,
    color: colors.text,
    ...typography.bodyStrong,
  },
  screenTitle: {
    color: colors.text,
    ...typography.titleLg,
  },
  headerSummary: {
    color: colors.muted,
    ...typography.label,
  },
  heroContent: {
    paddingTop: spacing.lg,
  },
  heroTopRow: {
    gap: layout.sectionGap,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  brandCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  logoImage: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
  },
  eyebrow: {
    color: colors.muted,
    ...typography.eyebrow,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  heroBody: {
    color: colors.muted,
    ...typography.body,
  },
  todayFocusRow: {
    gap: spacing.sm + 2,
  },
  todayCopy: {
    gap: spacing.xs + 2,
  },
  todayTitle: {
    color: colors.text,
    ...typography.titleMd,
  },
  todayBody: {
    color: colors.muted,
    ...typography.body,
  },
  todayBadgeStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  todayHeroCard: {
    overflow: 'hidden',
  },
  todayHeroContent: {
    gap: spacing.sm + 2,
  },
  todayHeroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  todayHeroCopy: {
    flex: 1,
    gap: spacing.xs - 2,
  },
  todayHeroTitle: {
    color: colors.text,
    ...typography.titleLg,
  },
  todayHeroMeta: {
    color: colors.muted,
    ...typography.label,
  },
  todayHeroBody: {
    color: colors.muted,
    ...typography.body,
  },
  todayHeroStats: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  todayStatChip: {
    minWidth: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xxs,
    alignItems: 'flex-start',
  },
  todayStatValue: {
    color: colors.text,
    ...typography.titleSm,
  },
  todayStatLabel: {
    color: colors.muted,
    ...typography.caption,
    textTransform: 'uppercase',
  },
  todaySummaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.bg,
    padding: spacing.sm,
    gap: spacing.xs - 2,
  },
  todaySummaryLabel: {
    color: colors.muted,
    ...typography.caption,
    textTransform: 'uppercase',
  },
  todaySummaryBody: {
    color: colors.text,
    ...typography.bodyStrong,
  },
  todayBlockList: {
    gap: spacing.xs,
  },
  todayBlockRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.bg,
    padding: spacing.sm,
  },
  todayPrimaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  todayEmptyState: {
    gap: spacing.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    width: '47.5%',
  },
  metricContent: {
    paddingTop: 18,
    gap: spacing.xs + 2,
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  metricLabel: {
    color: colors.muted,
    ...typography.caption,
  },
  metricValue: {
    color: colors.text,
    ...typography.titleMd,
  },
  sectionHeader: {
    gap: spacing.sm + 2,
  },
  sectionCopy: {
    flex: 1,
    gap: spacing.xs - 2,
  },
  templatesHeroContent: {
    gap: spacing.sm + 2,
  },
  templatesHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  templatesHeroCopy: {
    flex: 1,
    gap: spacing.xs - 2,
  },
  templatesFilterSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  progressHeroCard: {
    overflow: 'hidden',
  },
  progressHeroContent: {
    gap: spacing.md,
  },
  progressHeroTopRow: {
    gap: spacing.sm,
  },
  progressHeroCopy: {
    gap: spacing.xs,
  },
  progressHeroTitle: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
  },
  progressHeroBody: {
    color: colors.muted,
    ...typography.body,
  },
  progressHeroBadgeStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  progressHeroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  progressStatCard: {
    minWidth: '47%',
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xxs,
  },
  progressStatValue: {
    color: colors.text,
    ...typography.titleSm,
  },
  progressStatLabel: {
    color: colors.muted,
    ...typography.caption,
    textTransform: 'uppercase',
  },
  progressSectionContent: {
    gap: spacing.md,
  },
  progressSignalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  progressSignalCard: {
    minWidth: '47%',
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.bg,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  progressSignalValue: {
    color: colors.text,
    ...typography.titleMd,
  },
  progressTrendRow: {
    gap: spacing.sm,
    paddingRight: spacing.xxs,
  },
  progressTrendCard: {
    width: 168,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.bg,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  progressTrendCardActive: {
    borderColor: '#334155',
    backgroundColor: colors.surfaceMuted,
  },
  progressTrendLabel: {
    color: colors.muted,
    ...typography.caption,
  },
  progressTrendValue: {
    color: colors.text,
    ...typography.titleSm,
  },
  progressBalanceList: {
    gap: spacing.sm,
  },
  progressBalanceRow: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.bg,
    padding: spacing.sm,
  },
  progressBalanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: radii.pill,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  progressUtilityGrid: {
    gap: spacing.sm,
  },
  progressUtilityCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.bg,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  weekActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.xxs,
  },
  timeline: {
    gap: spacing.sm,
    paddingRight: spacing.xxs,
  },
  dayCard: {
    width: 282,
  },
  dayCardToday: {
    borderColor: '#334155',
  },
  dayContent: {},
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  dayCopy: {
    gap: 4,
  },
  dayHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  daySessionList: {
    gap: 10,
  },
  sessionCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  sessionCardCompact: {
    minHeight: 122,
  },
  sessionCardList: {
    minHeight: 116,
  },
  sessionCardAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  sessionCardMain: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs - 2,
  },
  sessionCardMeta: {
    color: colors.muted,
    ...typography.caption,
  },
  sessionCardTitle: {
    color: colors.text,
    ...typography.titleSm,
  },
  sessionCardSummary: {
    color: colors.muted,
    ...typography.body,
  },
  sessionCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  timelineSession: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  timelineSessionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  timelineSessionDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 6,
  },
  timelineSessionCopy: {
    flex: 1,
    gap: 4,
  },
  timelineSessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  caption: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.bg,
    padding: 14,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dualActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bodyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  detailGrid: {
    gap: 10,
  },
  detailCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.bg,
    padding: 14,
    gap: 8,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subsection: {
    gap: 12,
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  subsectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  subsectionMeta: {
    color: colors.muted,
    fontSize: 13,
  },
  linkedExerciseList: {
    gap: 10,
  },
  linkedExerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.bg,
    padding: 12,
  },
  linkedExerciseCopy: {
    flex: 1,
    gap: 4,
  },
  editorExerciseList: {
    gap: 12,
  },
  editorExerciseCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.bg,
    padding: 14,
    gap: 12,
  },
  editorExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  customExerciseBar: {
    gap: 10,
  },
  customExerciseInput: {
    width: '100%',
  },
  filterRow: {
    gap: 8,
    paddingRight: 4,
  },
  exerciseList: {
    gap: 12,
  },
  exerciseCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.bg,
    padding: 14,
    gap: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  exerciseHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseSummaryText: {
    color: colors.text,
    ...typography.bodyStrong,
  },
  presetList: {
    gap: 10,
  },
  presetCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.bg,
    padding: 14,
    gap: 10,
  },
  presetCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  presetCardCopy: {
    flex: 1,
    gap: 4,
  },
  exerciseCopy: {
    flex: 1,
    gap: 4,
  },
  exerciseActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flexButton: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  librarySection: {
    gap: 12,
  },
  librarySectionHeader: {
    gap: 4,
  },
  favoriteList: {
    gap: 10,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.bg,
    padding: 12,
  },
  favoriteCopy: {
    flex: 1,
    gap: 4,
  },
  sportBalanceList: {
    gap: 10,
  },
  sportBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.bg,
    padding: 12,
  },
  sportBalanceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
  },
  compactBadge: {
    minHeight: 28,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: 'rgba(18, 24, 33, 0.96)',
  },
  tabButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.text,
  },
  tabButtonText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: colors.bg,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 20, 0.84)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  sheetCard: {
    maxHeight: '92%',
    overflow: 'hidden',
  },
  sheetBody: {
    flexShrink: 1,
  },
  selectSheetCard: {
    maxHeight: '72%',
    overflow: 'hidden',
  },
  sheetHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
  },
  sheetContentWithFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 24,
    gap: 18,
  },
  sheetSectionCard: {
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    padding: 16,
  },
  sheetSectionHeader: {
    gap: 4,
  },
  sheetSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  sheetSectionDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  sheetSectionBody: {
    gap: 14,
  },
  backupTextArea: {
    minHeight: 240,
    fontSize: 12,
    lineHeight: 18,
  },
  formSection: {
    gap: 14,
  },
  formSectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  inlineBadgeField: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  field: {
    gap: 8,
  },
  fieldCompact: {
    flex: 1,
  },
  selectField: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  selectFieldText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  selectOptionList: {
    gap: 10,
  },
  selectOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectOptionActive: {
    backgroundColor: colors.surfaceMuted,
    borderColor: '#334155',
  },
  selectOptionText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  selectOptionTextActive: {
    fontWeight: '600',
  },
  formGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  stepper: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  sheetActions: {
    gap: 10,
    paddingBottom: 8,
  },
  sheetFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 10,
    backgroundColor: colors.surface,
  },
  sheetFooterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pressedState: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
})
