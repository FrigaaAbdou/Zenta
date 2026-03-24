import AsyncStorage from '@react-native-async-storage/async-storage'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
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
  colors,
  type IconName,
} from './components/ui'

type Sport = 'Swim' | 'Bike' | 'Run' | 'Strength' | 'Mobility' | 'Rest'
type SessionStatus = 'Planned' | 'Completed' | 'Skipped'
type ExerciseSideMode = 'none' | 'per-side' | 'both-sides'

type SessionExercise = {
  id: string
  exerciseId: string
  sets: number
  reps: number
  restSeconds: number
  sideMode: ExerciseSideMode
  sideLabel: string
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
  exerciseEntries: SessionExercise[]
}

type SessionDraft = Omit<Session, 'id'>

type Exercise = {
  id: string
  title: string
  sport: Sport
  category: string
  description: string
  tags: string[]
}

const storageKey = 'zenta-mobile-sessions-v3'
const legacyStorageKeys = ['zenta-mobile-sessions-v2']
const sportOrder: Sport[] = ['Swim', 'Bike', 'Run', 'Strength', 'Mobility', 'Rest']
const statusOrder: SessionStatus[] = ['Planned', 'Completed', 'Skipped']
const exerciseFilters: Array<Sport | 'All'> = ['All', ...sportOrder]
const sideModeOptions: Array<{ value: ExerciseSideMode; label: string }> = [
  { value: 'none', label: 'Single' },
  { value: 'per-side', label: 'Per side' },
  { value: 'both-sides', label: 'Both sides' },
]

const sportMeta: Record<Sport, { icon: IconName; color: string }> = {
  Swim: { icon: 'waves', color: colors.swim },
  Bike: { icon: 'bike-fast', color: colors.bike },
  Run: { icon: 'run-fast', color: colors.run },
  Strength: { icon: 'dumbbell', color: colors.strength },
  Mobility: { icon: 'meditation', color: colors.recovery },
  Rest: { icon: 'moon-waning-crescent', color: colors.recovery },
}

const exercises: Exercise[] = [
  {
    id: 'zone-2-run',
    title: 'Zone 2 Run',
    sport: 'Run',
    category: 'Endurance',
    description: 'Steady aerobic running to build base without excess fatigue.',
    tags: ['easy', 'aerobic', 'endurance'],
  },
  {
    id: 'brick-workout',
    title: 'Brick Workout',
    sport: 'Bike',
    category: 'Race Specific',
    description: 'Bike into a short run to train the transition and pacing control.',
    tags: ['brick', 'transition', 'triathlon'],
  },
  {
    id: 'cadence-drill',
    title: 'Cadence Drill',
    sport: 'Run',
    category: 'Technique',
    description: 'Quick rhythm work to improve turnover and reduce overstriding.',
    tags: ['cadence', 'drill', 'form'],
  },
  {
    id: 'swim-technique',
    title: 'Swim Technique',
    sport: 'Swim',
    category: 'Technique',
    description: 'Drill-focused pool work to improve catch and breathing rhythm.',
    tags: ['swim', 'drills', 'pool'],
  },
  {
    id: 'pull-buoy-set',
    title: 'Pull Buoy Set',
    sport: 'Swim',
    category: 'Strength Endurance',
    description: 'Upper-body swim set with a pull buoy to reinforce alignment and a clean catch.',
    tags: ['pool', 'pull buoy', 'catch'],
  },
  {
    id: 'interval-bike',
    title: 'Interval Bike',
    sport: 'Bike',
    category: 'Threshold',
    description: 'Structured efforts to raise threshold and improve sustainable power.',
    tags: ['bike', 'tempo', 'threshold'],
  },
  {
    id: 'strength-foundation',
    title: 'Strength Foundation',
    sport: 'Strength',
    category: 'Durability',
    description: 'Single-leg and trunk work to support swim-bike-run volume.',
    tags: ['strength', 'durability', 'gym'],
  },
  {
    id: 'mobility-hips',
    title: 'Mobility Hips',
    sport: 'Mobility',
    category: 'Recovery',
    description: 'Hip, glute, and lower-back mobility to absorb training load.',
    tags: ['mobility', 'hips', 'recovery'],
  },
  {
    id: 'full-rest',
    title: 'Full Rest',
    sport: 'Rest',
    category: 'Recovery',
    description: 'A recovery day with no training load beyond easy walking.',
    tags: ['rest', 'recovery'],
  },
]

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(buildSeedSessions())
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => toDateKey(startOfWeek(new Date())))
  const [exerciseQuery, setExerciseQuery] = useState('')
  const [exerciseFilter, setExerciseFilter] = useState<(typeof exerciseFilters)[number]>('All')
  const [showForm, setShowForm] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [draft, setDraft] = useState<SessionDraft>(createEmptyDraft(toDateKey(new Date())))
  const [hydrated, setHydrated] = useState(false)

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
    if (!hydrated) return
    AsyncStorage.setItem(storageKey, JSON.stringify(sessions)).catch(() => undefined)
  }, [hydrated, sessions])

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

  const selectedExerciseEntries =
    selectedSession?.exerciseEntries
      .map((entry) => ({
        entry,
        exercise: exercises.find((exercise) => exercise.id === entry.exerciseId),
      }))
      .filter(
        (
          item,
        ): item is {
          entry: SessionExercise
          exercise: Exercise
        } => Boolean(item.exercise),
      ) ?? []

  const draftExerciseOptions = useMemo(
    () => sortExercisesForSport(draft.sport),
    [draft.sport],
  )

  const visibleExercises = exercises.filter((exercise) => {
    const matchesFilter = exerciseFilter === 'All' || exercise.sport === exerciseFilter
    const query = exerciseQuery.trim().toLowerCase()

    if (!query) return matchesFilter

    const searchText = [exercise.title, exercise.category, exercise.description, ...exercise.tags]
      .join(' ')
      .toLowerCase()

    return matchesFilter && searchText.includes(query)
  })

  const completedCount = weekSessions.filter((session) => session.status === 'Completed').length
  const totalWeekMinutes = weekSessions.reduce((sum, session) => sum + session.durationMin, 0)
  const todayMinutes = todaySessions.reduce((sum, session) => sum + session.durationMin, 0)
  const completionRate = weekSessions.length
    ? Math.round((completedCount / weekSessions.length) * 100)
    : 0

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

  const todayHeadline = todaySessions.length
    ? `${todaySessions.length} session${todaySessions.length > 1 ? 's' : ''} · ${formatMinutes(todayMinutes)}`
    : 'No session scheduled today'

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <CardContent style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <View style={styles.brandRow}>
                <Image source={require('./assets/zenta_logo.png')} style={styles.logoImage} />
                <View style={styles.brandCopy}>
                  <Text style={styles.eyebrow}>Zenta</Text>
                </View>
              </View>

              <Button
                icon="plus"
                onPress={() =>
                  openCreateSession(setDraft, setEditingSessionId, setShowForm, toDateKey(new Date()))
                }
              >
                Add session
              </Button>
            </View>

            <Separator />

            <View style={styles.todayFocusRow}>
              <View style={styles.todayCopy}>
                <Badge label="Today" icon="calendar-today" tint={colors.swim} />
                <Text style={styles.todayTitle}>
                  {todaySessions[0]?.title ?? preferredSession?.title ?? 'Recovery window'}
                </Text>
                <Text style={styles.todayBody}>{todayHeadline}</Text>
              </View>

              {todaySessions[0] ?? preferredSession ? (
                <View style={styles.todayBadgeStack}>
                  <SportBadge sport={(todaySessions[0] ?? preferredSession)!.sport} />
                  <StatusBadge status={(todaySessions[0] ?? preferredSession)!.status} />
                </View>
              ) : null}
            </View>
          </CardContent>
        </Card>

        <View style={styles.metricsGrid}>
          {weekSummary.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} icon={item.icon} />
          ))}
        </View>

        <Card>
          <CardHeader style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <CardTitle>Week plan</CardTitle>
              <CardDescription>{formatWeekRange(weekStart)}</CardDescription>
            </View>

            <View style={styles.weekActions}>
              <IconButton icon="chevron-left" onPress={() => setWeekStart(shiftWeek(weekStart, -7))} />
              <Button variant="outline" size="sm" onPress={() => setWeekStart(toDateKey(startOfWeek(new Date())))}>
                This week
              </Button>
              <IconButton icon="chevron-right" onPress={() => setWeekStart(shiftWeek(weekStart, 7))} />
            </View>
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
                    selectedSessionId={selectedSession?.id ?? null}
                    onAdd={() => openCreateSession(setDraft, setEditingSessionId, setShowForm, day.date)}
                    onSelect={(sessionId) => setSelectedSessionId(sessionId)}
                  />
                )
              })}
            </ScrollView>
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
                </View>

                <View style={styles.segmentRow}>
                  {statusOrder.map((status) => (
                    <SegmentButton
                      key={status}
                      label={status}
                      active={selectedSession.status === status}
                      tint={statusColor(status)}
                      onPress={() =>
                        setSessions((current) =>
                          current.map((session) =>
                            session.id === selectedSession.id ? { ...session, status } : session,
                          ),
                        )
                      }
                    />
                  ))}
                </View>

                <View style={styles.subsection}>
                  <View style={styles.subsectionHeader}>
                    <Text style={styles.subsectionTitle}>Session exercises</Text>
                    <Text style={styles.subsectionMeta}>{selectedExerciseEntries.length}</Text>
                  </View>

                  {selectedExerciseEntries.length ? (
                    <View style={styles.linkedExerciseList}>
                      {selectedExerciseEntries.map(({ entry, exercise }) => (
                        <View key={entry.id} style={styles.linkedExerciseRow}>
                          <View style={styles.linkedExerciseCopy}>
                            <Text style={styles.itemTitle}>{exercise.title}</Text>
                            <Text style={styles.caption}>{formatExercisePrescription(entry)}</Text>
                            <Text style={styles.caption}>{exercise.description}</Text>
                          </View>
                          <IconButton
                            icon="close"
                            onPress={() =>
                              setSessions((current) =>
                                current.map((session) =>
                                  session.id === selectedSession.id
                                    ? {
                                      ...session,
                                        exerciseEntries: session.exerciseEntries.filter(
                                          (sessionEntry) => sessionEntry.id !== entry.id,
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
                  ) : (
                    <Text style={styles.emptyText}>No exercises added yet.</Text>
                  )}
                </View>

                <Button
                  variant="outline"
                  icon="pencil-outline"
                  onPress={() => {
                    setEditingSessionId(selectedSession.id)
                    setDraft(toDraft(selectedSession))
                    setShowForm(true)
                  }}
                >
                  Edit session
                </Button>
              </>
            ) : (
              <Text style={styles.emptyText}>No session selected.</Text>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exercise library</CardTitle>
            <CardDescription>Search workouts and attach them to the selected session.</CardDescription>
          </CardHeader>

          <Separator />

          <CardContent>
            <Input
              value={exerciseQuery}
              onChangeText={setExerciseQuery}
              placeholder="Search exercises"
            />

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

            <View style={styles.exerciseList}>
              {visibleExercises.map((exercise) => {
                const attached = Boolean(selectedSession?.exerciseIds.includes(exercise.id))

                return (
                  <View key={exercise.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                      <View style={styles.exerciseCopy}>
                        <Text style={styles.itemTitle}>{exercise.title}</Text>
                        <Text style={styles.caption}>{exercise.category}</Text>
                      </View>
                      <SportBadge sport={exercise.sport} />
                    </View>

                    <Text style={styles.bodyText}>{exercise.description}</Text>

                    <View style={styles.tagRow}>
                      {exercise.tags.map((tag) => (
                        <Badge key={tag} label={tag} />
                      ))}
                    </View>

                    <Button
                      variant="outline"
                      icon={attached ? 'check-circle-outline' : 'plus'}
                      disabled={!selectedSession || attached}
                      onPress={() => {
                        if (!selectedSession) return

                        setSessions((current) =>
                          current.map((session) =>
                            session.id === selectedSession.id
                              ? {
                                  ...session,
                                  exerciseIds: session.exerciseIds.includes(exercise.id)
                                    ? session.exerciseIds
                                    : [...session.exerciseIds, exercise.id],
                                }
                              : session,
                          ),
                        )
                      }}
                    >
                      {attached ? 'Attached' : 'Attach to session'}
                    </Button>
                  </View>
                )
              })}
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favorite workouts</CardTitle>
            <CardDescription>Quick access to sessions you reuse often.</CardDescription>
          </CardHeader>

          <Separator />

          <CardContent>
            {favoriteSessions.length ? (
              <View style={styles.favoriteList}>
                {favoriteSessions.map((session) => (
                  <Pressable
                    key={session.id}
                    style={({ pressed }) => [styles.favoriteRow, pressed && styles.pressedState]}
                    onPress={() => focusSession(session, setSelectedSessionId, setWeekStart)}
                  >
                    <View style={styles.favoriteCopy}>
                      <Text style={styles.itemTitle}>{session.title}</Text>
                      <Text style={styles.caption}>
                        {formatShortDate(session.date)} · {session.startTime}
                      </Text>
                    </View>
                    <SportBadge sport={session.sport} />
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No favorites yet.</Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>

      <Modal transparent animationType="fade" visible={showForm} onRequestClose={() => setShowForm(false)}>
        <SafeAreaView style={styles.sheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowForm(false)} />
          <View style={styles.sheetContainer}>
            <Card style={styles.sheetCard}>
              <CardHeader style={styles.sheetHeader}>
                <View style={styles.sectionCopy}>
                  <CardTitle>{editingSessionId ? 'Edit session' : 'Add session'}</CardTitle>
                  <CardDescription>
                    Keep it clean: sport, time, intensity, then the workout structure.
                  </CardDescription>
                </View>
                <IconButton icon="close" onPress={() => setShowForm(false)} />
              </CardHeader>

              <Separator />

              <ScrollView
                contentContainerStyle={styles.sheetContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Field label="Title">
                  <Input
                    value={draft.title}
                    onChangeText={(value) => setDraft((current) => ({ ...current, title: value }))}
                    placeholder="Session title"
                  />
                </Field>

                <Field label="Sport">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                  >
                    {sportOrder.map((sport) => (
                      <SegmentButton
                        key={sport}
                        label={sport}
                        active={draft.sport === sport}
                        tint={sportMeta[sport].color}
                        onPress={() => setDraft((current) => ({ ...current, sport }))}
                      />
                    ))}
                  </ScrollView>
                </Field>

                <View style={styles.formGrid}>
                  <Field label="Date" compact>
                    <Input
                      value={draft.date}
                      onChangeText={(value) => setDraft((current) => ({ ...current, date: value }))}
                      placeholder="YYYY-MM-DD"
                    />
                  </Field>

                  <Field label="Start time" compact>
                    <Input
                      value={draft.startTime}
                      onChangeText={(value) => setDraft((current) => ({ ...current, startTime: value }))}
                      placeholder="07:00"
                    />
                  </Field>
                </View>

                <View style={styles.formGrid}>
                  <Field label="Duration (min)" compact>
                    <Input
                      value={String(draft.durationMin)}
                      onChangeText={(value) =>
                        setDraft((current) => ({
                          ...current,
                          durationMin: Number(value) || 0,
                        }))
                      }
                      placeholder="45"
                      keyboardType="numeric"
                    />
                  </Field>

                  <Field label="Intensity" compact>
                    <Input
                      value={draft.intensity}
                      onChangeText={(value) => setDraft((current) => ({ ...current, intensity: value }))}
                      placeholder="Zone 2"
                    />
                  </Field>
                </View>

                <Field label="Status">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                  >
                    {statusOrder.map((status) => (
                      <SegmentButton
                        key={status}
                        label={status}
                        active={draft.status === status}
                        tint={statusColor(status)}
                        onPress={() => setDraft((current) => ({ ...current, status }))}
                      />
                    ))}
                  </ScrollView>
                </Field>

                <Field label="Description">
                  <TextArea
                    value={draft.description}
                    onChangeText={(value) => setDraft((current) => ({ ...current, description: value }))}
                    placeholder="Short description"
                  />
                </Field>

                <Field label="Warm-up">
                  <TextArea
                    value={draft.warmup}
                    onChangeText={(value) => setDraft((current) => ({ ...current, warmup: value }))}
                    placeholder="Warm-up"
                  />
                </Field>

                <Field label="Main set">
                  <TextArea
                    value={draft.mainSet}
                    onChangeText={(value) => setDraft((current) => ({ ...current, mainSet: value }))}
                    placeholder="Main set"
                  />
                </Field>

                <Field label="Cooldown">
                  <TextArea
                    value={draft.cooldown}
                    onChangeText={(value) => setDraft((current) => ({ ...current, cooldown: value }))}
                    placeholder="Cooldown"
                  />
                </Field>

                <Field label="Notes">
                  <TextArea
                    value={draft.notes}
                    onChangeText={(value) => setDraft((current) => ({ ...current, notes: value }))}
                    placeholder="Notes"
                  />
                </Field>

                <Button
                  variant="outline"
                  icon={draft.favorite ? 'heart' : 'heart-outline'}
                  onPress={() => setDraft((current) => ({ ...current, favorite: !current.favorite }))}
                >
                  {draft.favorite ? 'Favorite workout' : 'Mark as favorite'}
                </Button>

                <View style={styles.sheetActions}>
                  {editingSessionId ? (
                    <Button
                      variant="destructive"
                      icon="trash-can-outline"
                      onPress={() => {
                        setSessions((current) => current.filter((session) => session.id !== editingSessionId))
                        setEditingSessionId(null)
                        setShowForm(false)
                      }}
                    >
                      Delete
                    </Button>
                  ) : null}

                  <Button
                    icon="check-circle-outline"
                    onPress={() => {
                      const nextSession: Session = {
                        ...draft,
                        id: editingSessionId ?? createId(),
                      }

                      setSessions((current) => {
                        if (editingSessionId) {
                          return current.map((session) =>
                            session.id === editingSessionId ? nextSession : session,
                          )
                        }

                        return sortSessions([...current, nextSession])
                      })

                      setSelectedSessionId(nextSession.id)
                      setWeekStart(toDateKey(startOfWeek(new Date(`${nextSession.date}T00:00:00`))))
                      setEditingSessionId(null)
                      setShowForm(false)
                    }}
                  >
                    {editingSessionId ? 'Save changes' : 'Create session'}
                  </Button>
                </View>
              </ScrollView>
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

function DayCard({
  day,
  sessions,
  selectedSessionId,
  onAdd,
  onSelect,
}: {
  day: { date: string; label: string; shortDate: string }
  sessions: Session[]
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
            <IconButton icon="plus" onPress={onAdd} />
          </View>
        </View>

        <View style={styles.daySessionList}>
          {sessions.length ? (
            sessions.map((session) => (
              <Pressable
                key={session.id}
                style={({ pressed }) => [
                  styles.timelineSession,
                  {
                    borderColor:
                      selectedSessionId === session.id ? `${sportMeta[session.sport].color}66` : colors.border,
                    backgroundColor:
                      selectedSessionId === session.id ? colors.surfaceMuted : colors.bg,
                  },
                  pressed && styles.pressedState,
                ]}
                onPress={() => onSelect(session.id)}
              >
                <View style={styles.timelineSessionRow}>
                  <View
                    style={[
                      styles.timelineSessionDot,
                      { backgroundColor: sportMeta[session.sport].color },
                    ]}
                  />
                  <View style={styles.timelineSessionCopy}>
                    <Text style={styles.itemTitle}>{session.title}</Text>
                    <Text style={styles.caption}>
                      {session.sport} · {session.startTime} · {formatMinutes(session.durationMin)}
                    </Text>
                  </View>
                  <StatusBadge status={session.status} />
                </View>
              </Pressable>
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

function StatusBadge({ status }: { status: SessionStatus }) {
  return <Badge label={status} tint={statusColor(status)} />
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Empty'}</Text>
    </View>
  )
}

function statusColor(status: SessionStatus) {
  if (status === 'Completed') return colors.run
  if (status === 'Skipped') return colors.bike
  return colors.recovery
}

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
      description: 'Technical pool work to improve feel for the water and relaxed pacing.',
      warmup: '300m easy + 4 x 50m drills',
      mainSet: '6 x 100m aerobic with 20s rest, then 8 x 50m pull buoy',
      cooldown: '200m easy backstroke or freestyle',
      notes: 'Stay long through the stroke and keep breathing controlled.',
      favorite: false,
      exerciseIds: ['swim-technique', 'pull-buoy-set'],
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
      description: 'Build sustained power for triathlon bike pacing.',
      warmup: '15 min progressive spin',
      mainSet: '4 x 8 min threshold / 3 min easy',
      cooldown: '10 min easy spin',
      notes: 'Hold stable cadence and do not surge early.',
      favorite: true,
      exerciseIds: ['interval-bike'],
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
      description: 'Single-leg strength and trunk control for endurance durability.',
      warmup: '5 min mobility flow',
      mainSet: 'Split squats, rows, dead bug circuit',
      cooldown: 'Band work and hip mobility',
      notes: 'Keep quality high and stop short of grinding reps.',
      favorite: false,
      exerciseIds: ['strength-foundation', 'mobility-hips'],
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
      description: 'Controlled tempo work to build race durability and confidence.',
      warmup: '10 min easy jog + drills',
      mainSet: '2 x 12 min tempo with 4 min easy',
      cooldown: '8 min easy + strides',
      notes: 'Stay relaxed through the shoulders.',
      favorite: true,
      exerciseIds: ['zone-2-run', 'cadence-drill'],
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
      description: 'Light recovery work to absorb the week before the brick session.',
      warmup: '5 min easy walk',
      mainSet: 'Hips, thoracic rotation, glute activation',
      cooldown: '2 min breathing reset',
      notes: 'This should leave you fresher, not tired.',
      favorite: false,
      exerciseIds: ['mobility-hips'],
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
      description: 'Race-specific bike to run transition workout.',
      warmup: '15 min easy spin',
      mainSet: '65 min bike + 15 min run off the bike',
      cooldown: '5 min easy walk',
      notes: 'Fuel early and keep the first run minutes controlled.',
      favorite: true,
      exerciseIds: ['brick-workout'],
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
      description: 'A full recovery day to let the previous training block settle.',
      warmup: 'None',
      mainSet: 'Rest',
      cooldown: 'Optional walk or gentle mobility',
      notes: 'Protect sleep and hydration.',
      favorite: false,
      exerciseIds: ['full-rest'],
    },
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
    description: '',
    warmup: '',
    mainSet: '',
    cooldown: '',
    notes: '',
    favorite: false,
    exerciseIds: [],
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
    description: session.description,
    warmup: session.warmup,
    mainSet: session.mainSet,
    cooldown: session.cooldown,
    notes: session.notes,
    favorite: session.favorite,
    exerciseIds: session.exerciseIds,
  }
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

function formatMinutes(minutes: number) {
  if (!minutes) return 'Rest'
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (!hours) return `${remainingMinutes} min`
  if (!remainingMinutes) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
}

function createId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroContent: {
    paddingTop: 20,
  },
  heroTopRow: {
    gap: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brandCopy: {
    flex: 1,
    gap: 4,
  },
  logoImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  heroBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  todayFocusRow: {
    gap: 14,
  },
  todayCopy: {
    gap: 10,
  },
  todayTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  todayBody: {
    color: colors.muted,
    fontSize: 14,
  },
  todayBadgeStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47.5%',
  },
  metricContent: {
    paddingTop: 18,
    gap: 10,
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  metricValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHeader: {
    gap: 14,
  },
  sectionCopy: {
    flex: 1,
    gap: 6,
  },
  weekActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeline: {
    gap: 12,
    paddingRight: 4,
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
  timelineSession: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  timelineSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineSessionDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  timelineSessionCopy: {
    flex: 1,
    gap: 4,
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
  exerciseCopy: {
    flex: 1,
    gap: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  emptyText: {
    color: colors.muted,
    fontSize: 14,
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
  field: {
    gap: 8,
  },
  fieldCompact: {
    flex: 1,
  },
  formGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  sheetActions: {
    gap: 10,
    paddingBottom: 8,
  },
  pressedState: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
})
