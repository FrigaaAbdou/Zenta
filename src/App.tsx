import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Bike,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Dumbbell,
  Heart,
  MoonStar,
  PencilLine,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  Upload,
  Waves,
  X,
} from 'lucide-react'
import zentaLogoNoBg from './assets/zenta_logo_no_bg.svg'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Sport = 'Swim' | 'Bike' | 'Run' | 'Strength' | 'Mobility' | 'Rest'
type SessionStatus = 'Planned' | 'Completed' | 'Skipped'
type ExerciseSideMode = 'Not side-based' | 'Per side' | 'Both sides'

type SessionExercise = {
  id: string
  exerciseId: string | null
  title: string
  sets: number
  reps: number
  sideMode: ExerciseSideMode
  bodySideLabel: string
  restSeconds: number
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
  exercises: SessionExercise[]
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

type WeekDocument = {
  version: 1
  weekStart: string
  exportedAt: string
  sessions: Session[]
}

type LegacySessionPayload = Partial<Session> & {
  exerciseIds?: unknown
  description?: unknown
  warmup?: unknown
  mainSet?: unknown
  cooldown?: unknown
  notes?: unknown
}

const storageKey = 'zenta-sessions-v2'
const sportOrder: Sport[] = ['Swim', 'Bike', 'Run', 'Strength', 'Mobility', 'Rest']
const statusOrder: SessionStatus[] = ['Planned', 'Completed', 'Skipped']
const exerciseFilters: Array<Sport | 'All'> = ['All', ...sportOrder]
const sideModeOptions: ExerciseSideMode[] = ['Not side-based', 'Per side', 'Both sides']
const enduranceIntensityOptions = [
  'Recovery',
  'Easy',
  'Zone 2',
  'Zone 3',
  'Zone 4',
  'Zone 5',
  'Zone 2 to 3',
  'Race Pace',
] as const
const simpleIntensityOptions = ['Easy', 'Moderate', 'Hard'] as const
const restIntensityOptions = ['Recovery'] as const

const sportMeta: Record<
  Sport,
  {
    icon: LucideIcon
    label: string
    badgeClass: string
    dotClass: string
    panelClass: string
  }
> = {
  Swim: {
    icon: Waves,
    label: 'Swim',
    badgeClass: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
    dotClass: 'bg-blue-500',
    panelClass: 'border-l-blue-500',
  },
  Bike: {
    icon: Bike,
    label: 'Bike',
    badgeClass: 'border-orange-500/20 bg-orange-500/10 text-orange-300',
    dotClass: 'bg-orange-500',
    panelClass: 'border-l-orange-500',
  },
  Run: {
    icon: Activity,
    label: 'Run',
    badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    dotClass: 'bg-emerald-500',
    panelClass: 'border-l-emerald-500',
  },
  Strength: {
    icon: Dumbbell,
    label: 'Strength',
    badgeClass: 'border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300',
    dotClass: 'bg-fuchsia-500',
    panelClass: 'border-l-fuchsia-500',
  },
  Mobility: {
    icon: Sparkles,
    label: 'Mobility',
    badgeClass: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
    dotClass: 'bg-slate-400',
    panelClass: 'border-l-slate-400',
  },
  Rest: {
    icon: MoonStar,
    label: 'Rest',
    badgeClass: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
    dotClass: 'bg-slate-400',
    panelClass: 'border-l-slate-400',
  },
}

const exercises: Exercise[] = [
  {
    id: 'zone-2-run',
    title: 'Zone 2 Run',
    sport: 'Run',
    category: 'Endurance',
    description: 'Steady aerobic running to build base without accumulating too much fatigue.',
    tags: ['easy', 'aerobic', 'endurance', 'base'],
  },
  {
    id: 'brick-workout',
    title: 'Brick Workout',
    sport: 'Bike',
    category: 'Race Specific',
    description: 'Bike immediately into a short run to practice the transition and pacing control.',
    tags: ['brick', 'transition', 'triathlon', 'race pace'],
  },
  {
    id: 'cadence-drill',
    title: 'Cadence Drill',
    sport: 'Run',
    category: 'Technique',
    description: 'Quick rhythm work to improve turnover and reduce overstriding.',
    tags: ['cadence', 'drill', 'form', 'stride'],
  },
  {
    id: 'mobility-hips',
    title: 'Mobility Hips',
    sport: 'Mobility',
    category: 'Recovery',
    description: 'A short sequence for hips, glutes, and lower back after bike and run sessions.',
    tags: ['mobility', 'hips', 'recovery', 'stretch'],
  },
  {
    id: 'swim-technique',
    title: 'Swim Technique',
    sport: 'Swim',
    category: 'Technique',
    description: 'Drill-focused pool work to improve catch, balance, and breathing rhythm.',
    tags: ['swim', 'technique', 'drills', 'pool'],
  },
  {
    id: 'interval-bike',
    title: 'Interval Bike',
    sport: 'Bike',
    category: 'Threshold',
    description: 'Structured efforts on the bike to raise threshold and improve sustainable power.',
    tags: ['bike', 'interval', 'tempo', 'threshold'],
  },
  {
    id: 'pull-buoy-set',
    title: 'Pull Buoy Set',
    sport: 'Swim',
    category: 'Strength Endurance',
    description: 'Upper-body swim set with pull buoy to reinforce alignment and a clean catch.',
    tags: ['pool', 'pull buoy', 'catch', 'strength'],
  },
  {
    id: 'long-aerobic-ride',
    title: 'Long Aerobic Ride',
    sport: 'Bike',
    category: 'Endurance',
    description: 'Low-intensity ride focused on aerobic durability and fueling practice.',
    tags: ['ride', 'aerobic', 'endurance', 'fueling'],
  },
  {
    id: 'tempo-run',
    title: 'Tempo Run',
    sport: 'Run',
    category: 'Threshold',
    description: 'Controlled running at comfortably hard effort to build race durability.',
    tags: ['run', 'tempo', 'threshold', 'pace'],
  },
  {
    id: 'strength-foundation',
    title: 'Strength Foundation',
    sport: 'Strength',
    category: 'Durability',
    description: 'Single-leg and trunk work to support swim-bike-run volume.',
    tags: ['strength', 'gym', 'durability', 'stability'],
  },
  {
    id: 'thoracic-reset',
    title: 'Thoracic Reset',
    sport: 'Mobility',
    category: 'Recovery',
    description: 'Upper-back mobility to improve swim posture and bike comfort.',
    tags: ['mobility', 'thoracic', 'rotation', 'recovery'],
  },
  {
    id: 'full-rest',
    title: 'Full Rest',
    sport: 'Rest',
    category: 'Recovery',
    description: 'Intentional rest day with no training load beyond gentle walking.',
    tags: ['rest', 'recovery', 'easy'],
  },
]

function App() {
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions())
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => toDateKey(startOfWeek(new Date())))
  const [exerciseQuery, setExerciseQuery] = useState('')
  const [exerciseFilter, setExerciseFilter] = useState<(typeof exerciseFilters)[number]>('All')
  const [showForm, setShowForm] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [draft, setDraft] = useState<SessionDraft>(() => createEmptyDraft(toDateKey(new Date())))
  const [draftExerciseQuery, setDraftExerciseQuery] = useState('')
  const [draftExerciseFilter, setDraftExerciseFilter] = useState<(typeof exerciseFilters)[number]>('All')
  const [draftCustomExerciseTitle, setDraftCustomExerciseTitle] = useState('')
  const weekFileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(sessions))
  }, [sessions])

  const allSessions = useMemo(() => sortSessions(sessions), [sessions])
  const selectedSession =
    allSessions.find((session) => session.id === selectedSessionId) ?? allSessions[0] ?? null
  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart])
  const weekSessions = useMemo(
    () => allSessions.filter((session) => isDateWithinWeek(session.date, weekStart)),
    [allSessions, weekStart],
  )
  const favoriteSessions = useMemo(
    () => allSessions.filter((session) => session.favorite).slice(0, 5),
    [allSessions],
  )

  const completedCount = weekSessions.filter((session) => session.status === 'Completed').length
  const totalWeekMinutes = weekSessions.reduce((sum, session) => sum + session.durationMin, 0)
  const completionRate = weekSessions.length
    ? Math.round((completedCount / weekSessions.length) * 100)
    : 0

  const visibleExercises = exercises.filter((exercise) => {
    const matchesFilter = exerciseFilter === 'All' || exercise.sport === exerciseFilter
    const normalizedQuery = exerciseQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return matchesFilter
    }

    const searchable = [exercise.title, exercise.category, exercise.description, ...exercise.tags]
      .join(' ')
      .toLowerCase()

    return matchesFilter && searchable.includes(normalizedQuery)
  })

  const selectedSessionExercises = selectedSession?.exercises ?? []
  const draftVisibleExercises = exercises.filter((exercise) => {
    const matchesFilter = draftExerciseFilter === 'All' || exercise.sport === draftExerciseFilter
    const normalizedQuery = draftExerciseQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return matchesFilter
    }

    const searchable = [exercise.title, exercise.category, exercise.description, ...exercise.tags]
      .join(' ')
      .toLowerCase()

    return matchesFilter && searchable.includes(normalizedQuery)
  })
  const intensityOptions = getIntensityOptions(draft.sport)
  const canAddCustomExercise = Boolean(draftCustomExerciseTitle.trim())

  function addCustomExerciseToDraft() {
    const title = draftCustomExerciseTitle.trim()
    if (!title) return

    setDraft((current) => ({
      ...current,
      exercises: [...current.exercises, createSessionExercise({ title })],
    }))
    setDraftCustomExerciseTitle('')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 md:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <img className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14" src={zentaLogoNoBg} alt="Zenta logo" />
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
                Zenta
              </p>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
                Train with clarity.
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:flex md:flex-wrap">
            <Button
              className="w-full md:w-auto"
              onClick={() =>
                openCreateSession(
                  setDraft,
                  setEditingSessionId,
                  setShowForm,
                  setDraftExerciseQuery,
                  setDraftExerciseFilter,
                  setDraftCustomExerciseTitle,
                  toDateKey(new Date()),
                )
              }
            >
              <Plus />
              Add Session
            </Button>
            <Button className="w-full md:w-auto" variant="outline" onClick={() => downloadWeekDocument(weekStart, weekSessions)}>
              <Download />
              Export JSON
            </Button>
            <Button className="w-full md:w-auto" variant="outline" onClick={() => weekFileInputRef.current?.click()}>
              <Upload />
              Import JSON
            </Button>
          </div>
        </header>

        <input
          ref={weekFileInputRef}
          className="hidden"
          type="file"
          accept="application/json"
          onChange={async (event) => {
            const file = event.target.files?.[0]
            event.target.value = ''

            if (!file) {
              return
            }

            try {
              const text = await file.text()
              const importedWeek = parseWeekDocument(text)

              setSessions((current) => replaceWeekSessions(current, importedWeek.weekStart, importedWeek.sessions))
              setWeekStart(importedWeek.weekStart)
              setSelectedSessionId(importedWeek.sessions[0]?.id ?? null)
            } catch {
              // Keep failure silent in the header to avoid adding noise to the UI.
            }
          }}
        />

        <section className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={CalendarDays} label="Sessions This Week" value={String(weekSessions.length)} />
          <StatCard icon={CheckCircle2} label="Completed" value={`${completedCount}/${weekSessions.length || 0}`} />
          <StatCard icon={Clock3} label="Total Duration" value={formatMinutes(totalWeekMinutes)} />
          <StatCard icon={Target} label="Completion Rate" value={`${completionRate}%`} />
        </section>

        <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <Card className="rounded-2xl border-border/80 bg-card/80 shadow-sm">
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">Week Plan</CardTitle>
                  <CardDescription>{formatWeekRange(weekStart)}</CardDescription>
                </div>
                <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] gap-2 sm:flex sm:flex-wrap">
                  <Button variant="outline" size="icon" className="w-11" onClick={() => setWeekStart(shiftWeek(weekStart, -7))}>
                    <ChevronLeft />
                  </Button>
                  <Button className="min-w-0" variant="outline" onClick={() => setWeekStart(toDateKey(startOfWeek(new Date())))}>
                    This Week
                  </Button>
                  <Button variant="outline" size="icon" className="w-11" onClick={() => setWeekStart(shiftWeek(weekStart, 7))}>
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {weekDays.map((day) => {
                const daySessions = weekSessions.filter((session) => session.date === day.date)

                return (
                  <div
                    key={day.date}
                    className="rounded-xl border border-border/80 bg-background/50 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{day.label}</p>
                        <p className="text-xs text-muted-foreground">{day.shortDate}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          openCreateSession(
                            setDraft,
                            setEditingSessionId,
                            setShowForm,
                            setDraftExerciseQuery,
                            setDraftExerciseFilter,
                            setDraftCustomExerciseTitle,
                            day.date,
                          )
                        }
                      >
                        <Plus />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {daySessions.length ? (
                        daySessions.map((session) => (
                          <button
                            key={session.id}
                            type="button"
                            onClick={() => setSelectedSessionId(session.id)}
                            className={`w-full rounded-xl border border-border/80 bg-card px-3 py-3 text-left transition hover:border-primary/30 hover:bg-accent/30 ${
                              selectedSession?.id === session.id ? 'ring-1 ring-primary/40' : ''
                            }`}
                          >
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <SportBadge sport={session.sport} />
                              <StatusBadge status={session.status} />
                            </div>
                            <p className="font-medium">{session.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {session.startTime} · {formatMinutes(session.durationMin)} · {session.intensity}
                            </p>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                          No session
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl border-border/80 bg-card/80 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {selectedSession ? selectedSession.title : 'Select a Session'}
                    </CardTitle>
                    <CardDescription>
                      {selectedSession
                        ? `${formatDetailDate(selectedSession.date)} · ${selectedSession.startTime}`
                        : 'Choose a session from the week plan to see details.'}
                    </CardDescription>
                  </div>
                  {selectedSession ? (
                    <Button
                      className="w-full sm:w-auto"
                      variant={selectedSession.favorite ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setSessions((current) =>
                          current.map((session) =>
                            session.id === selectedSession.id
                              ? { ...session, favorite: !session.favorite }
                              : session,
                          ),
                        )
                      }
                    >
                      <Heart />
                      {selectedSession.favorite ? 'Saved' : 'Favorite'}
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {selectedSession ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <SportBadge sport={selectedSession.sport} />
                      <StatusBadge status={selectedSession.status} />
                      <Badge variant="outline" className="gap-1">
                        <Clock3 className="size-3.5" />
                        {formatMinutes(selectedSession.durationMin)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Status</p>
                      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                        {statusOrder.map((status) => (
                          <Button
                            key={status}
                            className="w-full sm:w-auto"
                            variant={selectedSession.status === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() =>
                              setSessions((current) =>
                                current.map((session) =>
                                  session.id === selectedSession.id ? { ...session, status } : session,
                                ),
                              )
                            }
                          >
                            {status}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">Workout</p>
                        <Badge variant="secondary">{selectedSessionExercises.length}</Badge>
                      </div>
                      {selectedSessionExercises.length ? (
                        <div className="space-y-2">
                          {selectedSessionExercises.map((sessionExercise) => {
                            const exercise = sessionExercise.exerciseId
                              ? exercises.find((item) => item.id === sessionExercise.exerciseId)
                              : null

                            return (
                            <div
                              key={sessionExercise.id}
                              className="flex flex-col gap-3 rounded-xl border border-border/80 bg-background/40 p-3 sm:flex-row sm:items-start sm:justify-between"
                            >
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-medium">{sessionExercise.title}</p>
                                  {exercise ? <SportBadge sport={exercise.sport} /> : null}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {formatExercisePrescription(sessionExercise)}
                                </p>
                                {exercise ? (
                                  <p className="text-xs text-muted-foreground">{exercise.description}</p>
                                ) : null}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="self-end sm:self-auto"
                                onClick={() =>
                                  setSessions((current) =>
                                    current.map((session) =>
                                      session.id === selectedSession.id
                                        ? {
                                          ...session,
                                            exercises: session.exercises.filter(
                                              (item) => item.id !== sessionExercise.id,
                                            ),
                                          }
                                        : session,
                                    ),
                                  )
                                }
                              >
                                <X />
                              </Button>
                            </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No exercises added yet.</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                      <Button
                        className="w-full sm:w-auto"
                        variant="outline"
                        onClick={() => {
                          setEditingSessionId(selectedSession.id)
                          setDraft(toDraft(selectedSession))
                          setDraftExerciseQuery('')
                          setDraftExerciseFilter('All')
                          setDraftCustomExerciseTitle('')
                          setShowForm(true)
                        }}
                      >
                        <PencilLine />
                        Edit
                      </Button>
                      <Button
                        className="w-full sm:w-auto"
                        variant="outline"
                        onClick={() => downloadCalendarFile([selectedSession], selectedSession.id)}
                      >
                        <Download />
                        Export Calendar
                      </Button>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/80 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Favorite Workouts</CardTitle>
                <CardDescription>Quick access to the sessions you reuse most.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {favoriteSessions.length ? (
                  favoriteSessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => focusSession(session, setSelectedSessionId, setWeekStart)}
                      className="flex w-full items-center justify-between rounded-xl border border-border/80 bg-background/50 px-3 py-3 text-left transition hover:bg-accent/30"
                    >
                      <div>
                        <p className="text-sm font-medium">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatShortDate(session.date)} · {session.sport}
                        </p>
                      </div>
                      <SportBadge sport={session.sport} />
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No favorites yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-2xl border-border/80 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Exercise Library</CardTitle>
              <CardDescription>Search and attach exercises to the selected session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={exerciseQuery}
                    onChange={(event) => setExerciseQuery(event.target.value)}
                    placeholder="Search exercises"
                  />
                </div>
                <Select value={exerciseFilter} onValueChange={(value) => setExerciseFilter(value as typeof exerciseFilter)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseFilters.map((filter) => (
                      <SelectItem key={filter} value={filter}>
                        {filter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {visibleExercises.map((exercise) => {
                  const isAttached = Boolean(
                    selectedSession &&
                      selectedSession.exercises.some((item) => item.exerciseId === exercise.id),
                  )

                  return (
                    <div key={exercise.id} className="rounded-xl border border-border/80 bg-background/40 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{exercise.title}</p>
                          <p className="text-xs text-muted-foreground">{exercise.category}</p>
                        </div>
                        <SportBadge sport={exercise.sport} />
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">{exercise.description}</p>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {exercise.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[11px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={!selectedSession || isAttached}
                        onClick={() => {
                          if (!selectedSession) return

                          setSessions((current) =>
                            current.map((session) =>
                              session.id === selectedSession.id
                                ? {
                                  ...session,
                                  exercises: session.exercises.some((item) => item.exerciseId === exercise.id)
                                    ? session.exercises
                                    : [...session.exercises, createSessionExercise(exercise)],
                                }
                                : session,
                            ),
                          )
                        }}
                      >
                        {isAttached ? 'Attached' : 'Attach to Session'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/80 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Storage</CardTitle>
              <CardDescription>Everything works without a backend or database.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Weeks are saved in your browser automatically.</p>
              <p>Use JSON export when you want to keep or share a specific week file.</p>
              <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                <Button variant="outline" asChild>
                  <a href="/zenta-week-template.json" target="_blank" rel="noreferrer">
                    Open JSON Template
                  </a>
                </Button>
                <Button variant="outline" onClick={() => downloadWeekDocument(weekStart, weekSessions)}>
                  <Download />
                  Download This Week
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[100dvh] w-[calc(100vw-1rem)] max-w-none overflow-y-auto rounded-2xl border-border/80 p-4 sm:max-h-[90vh] sm:max-w-2xl sm:p-6">
          <DialogHeader>
            <DialogTitle>{editingSessionId ? 'Edit session' : 'Add session'}</DialogTitle>
            <DialogDescription>
              Build the session with exercise rows instead of free text.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault()

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
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </Field>

              <Field>
                <Label>Sport</Label>
                <Select
                  value={draft.sport}
                  onValueChange={(value) =>
                    setDraft((current) => {
                      const sport = value as Sport
                      return {
                        ...current,
                        sport,
                        intensity: normalizeIntensityForSport(sport, current.intensity),
                      }
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sportOrder.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={draft.date}
                  onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="start-time">Start time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={draft.startTime}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, startTime: event.target.value }))
                  }
                />
              </Field>

              <Field>
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={draft.durationMin}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      durationMin: Number(event.target.value) || 0,
                    }))
                  }
                />
              </Field>

              <Field>
                <Label htmlFor="intensity">Intensity</Label>
                <Select
                  value={draft.intensity}
                  onValueChange={(value) =>
                    setDraft((current) => ({ ...current, intensity: value }))
                  }
                >
                  <SelectTrigger id="intensity" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {intensityOptions.map((intensity) => (
                      <SelectItem key={intensity} value={intensity}>
                        {intensity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label>Status</Label>
                <Select
                  value={draft.status}
                  onValueChange={(value) =>
                    setDraft((current) => ({ ...current, status: value as SessionStatus }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOrder.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field className="justify-end sm:col-span-2">
                <Label className="flex items-center gap-2 sm:pt-1">
                  <input
                    type="checkbox"
                    checked={draft.favorite}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, favorite: event.target.checked }))
                    }
                  />
                  Favorite workout
                </Label>
              </Field>
            </div>

            <div className="space-y-4 rounded-2xl border border-border/80 bg-background/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Workout builder</p>
                  <p className="text-sm text-muted-foreground">
                    Add exercises, then define sets, reps, side mode, and rest.
                  </p>
                </div>
                <Badge variant="secondary">{draft.exercises.length}</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={draftExerciseQuery}
                    onChange={(event) => setDraftExerciseQuery(event.target.value)}
                    placeholder="Search exercise library"
                  />
                </div>
                <Select
                  value={draftExerciseFilter}
                  onValueChange={(value) => setDraftExerciseFilter(value as typeof draftExerciseFilter)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseFilters.map((filter) => (
                      <SelectItem key={filter} value={filter}>
                        {filter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/40 p-3 md:flex-row">
                <Input
                  value={draftCustomExerciseTitle}
                  onChange={(event) => setDraftCustomExerciseTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addCustomExerciseToDraft()
                    }
                  }}
                  placeholder="Custom exercise name"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canAddCustomExercise}
                  onClick={addCustomExerciseToDraft}
                >
                  <Plus />
                  Add Custom Exercise
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {draftVisibleExercises.map((exercise) => {
                  const isAdded = draft.exercises.some((item) => item.exerciseId === exercise.id)

                  return (
                    <div key={exercise.id} className="rounded-xl border border-border/80 bg-card/40 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{exercise.title}</p>
                          <p className="text-xs text-muted-foreground">{exercise.category}</p>
                        </div>
                        <SportBadge sport={exercise.sport} />
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">{exercise.description}</p>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isAdded}
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            exercises: [...current.exercises, createSessionExercise(exercise)],
                          }))
                        }
                      >
                        {isAdded ? 'Added' : 'Add Exercise'}
                      </Button>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-3">
                {draft.exercises.length ? (
                  draft.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="rounded-xl border border-border/80 bg-card/40 p-4">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{exercise.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Exercise {index + 1} · {formatExercisePrescription(exercise)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              exercises: current.exercises.filter((item) => item.id !== exercise.id),
                            }))
                          }
                        >
                          <X />
                        </Button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                          <Label>Exercise name</Label>
                          <Input
                            value={exercise.title}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                exercises: current.exercises.map((item) =>
                                  item.id === exercise.id
                                    ? { ...item, title: event.target.value, exerciseId: null }
                                    : item,
                                ),
                              }))
                            }
                          />
                        </Field>

                        <Field>
                          <Label>Side mode</Label>
                          <Select
                            value={exercise.sideMode}
                            onValueChange={(value) =>
                              setDraft((current) => ({
                                ...current,
                                exercises: current.exercises.map((item) =>
                                  item.id === exercise.id
                                    ? {
                                        ...item,
                                        sideMode: value as ExerciseSideMode,
                                        bodySideLabel:
                                          value === 'Not side-based' ? '' : item.bodySideLabel || 'leg',
                                      }
                                    : item,
                                ),
                              }))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {sideModeOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field>
                          <Label>Sets</Label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                exercises: current.exercises.map((item) =>
                                  item.id === exercise.id
                                    ? { ...item, sets: Math.max(1, Number(event.target.value) || 1) }
                                    : item,
                                ),
                              }))
                            }
                          />
                        </Field>

                        <Field>
                          <Label>Reps</Label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.reps}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                exercises: current.exercises.map((item) =>
                                  item.id === exercise.id
                                    ? { ...item, reps: Math.max(1, Number(event.target.value) || 1) }
                                    : item,
                                ),
                              }))
                            }
                          />
                        </Field>

                        {exercise.sideMode !== 'Not side-based' ? (
                          <Field>
                            <Label>Body side label</Label>
                            <Input
                              value={exercise.bodySideLabel}
                              onChange={(event) =>
                                setDraft((current) => ({
                                  ...current,
                                  exercises: current.exercises.map((item) =>
                                    item.id === exercise.id
                                      ? { ...item, bodySideLabel: event.target.value }
                                      : item,
                                  ),
                                }))
                              }
                              placeholder="leg"
                            />
                          </Field>
                        ) : null}

                        <Field>
                          <Label>Rest between reps (sec)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={exercise.restSeconds}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                exercises: current.exercises.map((item) =>
                                  item.id === exercise.id
                                    ? { ...item, restSeconds: Math.max(0, Number(event.target.value) || 0) }
                                    : item,
                                ),
                              }))
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                    No exercises added yet.
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row">
                {editingSessionId ? (
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    variant="destructive"
                    onClick={() => {
                      setSessions((current) =>
                        current.filter((session) => session.id !== editingSessionId),
                      )
                      setEditingSessionId(null)
                      setShowForm(false)
                    }}
                  >
                    <Trash2 />
                    Delete
                  </Button>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button className="w-full sm:w-auto" type="submit">
                  <CheckCircle2 />
                  {editingSessionId ? 'Save Changes' : 'Create Session'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <Card className="rounded-2xl border-border/80 bg-card/80 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function SportBadge({ sport }: { sport: Sport }) {
  const Icon = sportMeta[sport].icon

  return (
    <Badge variant="outline" className={`gap-1 border ${sportMeta[sport].badgeClass}`}>
      <Icon className="size-3.5" />
      {sportMeta[sport].label}
    </Badge>
  )
}

function StatusBadge({ status }: { status: SessionStatus }) {
  const className =
    status === 'Completed'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
      : status === 'Skipped'
        ? 'border-orange-500/20 bg-orange-500/10 text-orange-300'
        : 'border-border bg-muted/30 text-muted-foreground'

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  )
}

function Field({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`flex flex-col gap-2 ${className}`}>{children}</div>
}

function openCreateSession(
  setDraft: Dispatch<SetStateAction<SessionDraft>>,
  setEditingSessionId: Dispatch<SetStateAction<string | null>>,
  setShowForm: Dispatch<SetStateAction<boolean>>,
  setDraftExerciseQuery: Dispatch<SetStateAction<string>>,
  setDraftExerciseFilter: Dispatch<SetStateAction<(typeof exerciseFilters)[number]>>,
  setDraftCustomExerciseTitle: Dispatch<SetStateAction<string>>,
  date: string,
) {
  setDraft(createEmptyDraft(date))
  setEditingSessionId(null)
  setDraftExerciseQuery('')
  setDraftExerciseFilter('All')
  setDraftCustomExerciseTitle('')
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

function createSessionExercise(
  exercise: Pick<Exercise, 'id' | 'title'> | { title: string },
  overrides: Partial<Omit<SessionExercise, 'id' | 'exerciseId' | 'title'>> = {},
): SessionExercise {
  return {
    id: createId(),
    exerciseId: 'id' in exercise ? exercise.id : null,
    title: exercise.title,
    sets: overrides.sets ?? 3,
    reps: overrides.reps ?? 10,
    sideMode: overrides.sideMode ?? 'Not side-based',
    bodySideLabel: overrides.bodySideLabel ?? '',
    restSeconds: overrides.restSeconds ?? 60,
  }
}

function formatExercisePrescription(exercise: SessionExercise) {
  const parts = [`${exercise.sets} sets`, `${exercise.reps} reps`]

  if (exercise.sideMode !== 'Not side-based') {
    const bodySide = exercise.bodySideLabel.trim() || 'side'
    parts.push(exercise.sideMode === 'Per side' ? `per ${bodySide}` : `both ${bodySide}s`)
  }

  if (exercise.restSeconds > 0) {
    parts.push(`${exercise.restSeconds}s rest`)
  }

  return parts.join(' · ')
}

function loadSessions(): Session[] {
  if (typeof window === 'undefined') {
    return buildSeedSessions()
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return buildSeedSessions()

    const parsed = JSON.parse(raw) as Session[]
    return Array.isArray(parsed) && parsed.length
      ? parsed.map((session, index) =>
          normalizeImportedSession(
            session,
            toDateKey(addDays(startOfWeek(new Date()), Math.min(index, 6))),
          ),
        )
      : buildSeedSessions()
  } catch {
    return buildSeedSessions()
  }
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
      exercises: [
        createSessionExercise({ id: 'swim-technique', title: 'Swim Technique' }, { sets: 6, reps: 100, restSeconds: 20 }),
        createSessionExercise({ id: 'pull-buoy-set', title: 'Pull Buoy Set' }, { sets: 8, reps: 50, restSeconds: 20 }),
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
      exercises: [
        createSessionExercise({ id: 'interval-bike', title: 'Interval Bike' }, { sets: 4, reps: 8, restSeconds: 180 }),
      ],
    },
    {
      id: 'strength-seed',
      title: 'Strength Foundation',
      sport: 'Strength',
      date: toDateKey(addDays(weekStart, 2)),
      startTime: '07:00',
      durationMin: 45,
      intensity: 'Moderate',
      status: 'Completed',
      favorite: false,
      exercises: [
        createSessionExercise({ id: 'strength-foundation', title: 'Strength Foundation' }, {
          sets: 3,
          reps: 8,
          sideMode: 'Per side',
          bodySideLabel: 'leg',
          restSeconds: 75,
        }),
        createSessionExercise({ id: 'mobility-hips', title: 'Mobility Hips' }, {
          sets: 2,
          reps: 10,
          sideMode: 'Both sides',
          bodySideLabel: 'leg',
          restSeconds: 30,
        }),
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
      exercises: [
        createSessionExercise({ id: 'tempo-run', title: 'Tempo Run' }, { sets: 2, reps: 12, restSeconds: 240 }),
        createSessionExercise({ id: 'cadence-drill', title: 'Cadence Drill' }, { sets: 4, reps: 20, restSeconds: 30 }),
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
      exercises: [
        createSessionExercise({ id: 'mobility-hips', title: 'Mobility Hips' }, {
          sets: 2,
          reps: 12,
          sideMode: 'Both sides',
          bodySideLabel: 'leg',
          restSeconds: 20,
        }),
        createSessionExercise({ id: 'thoracic-reset', title: 'Thoracic Reset' }, {
          sets: 2,
          reps: 10,
          sideMode: 'Both sides',
          bodySideLabel: 'arm',
          restSeconds: 20,
        }),
      ],
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
      exercises: [
        createSessionExercise({ id: 'brick-workout', title: 'Brick Workout' }, { sets: 3, reps: 6, restSeconds: 120 }),
      ],
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
      exercises: [createSessionExercise({ id: 'full-rest', title: 'Full Rest' }, { sets: 1, reps: 1, restSeconds: 0 })],
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
    intensity: getDefaultIntensity('Run'),
    status: 'Planned',
    favorite: false,
    exercises: [],
  }
}

function toDraft(session: Session): SessionDraft {
  return {
    title: session.title,
    sport: session.sport,
    date: session.date,
    startTime: session.startTime,
    durationMin: session.durationMin,
    intensity: normalizeIntensityForSport(session.sport, session.intensity),
    status: session.status,
    favorite: session.favorite,
    exercises: session.exercises.map((exercise) => ({ ...exercise })),
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

function toCalendarStamp(dateString: string, timeString: string) {
  return new Date(`${dateString}T${timeString || '00:00'}:00`)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
}

function addMinutes(dateString: string, timeString: string, minutes: number) {
  const date = new Date(`${dateString}T${timeString || '00:00'}:00`)
  date.setMinutes(date.getMinutes() + minutes)

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function downloadCalendarFile(items: Session[], slug: string) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zenta//Training Planner//EN',
    ...items.flatMap((session) => {
      const start = toCalendarStamp(session.date, session.startTime)
      const end = toCalendarStamp(
        session.date,
        addMinutes(session.date, session.startTime, session.durationMin),
      )

      return [
        'BEGIN:VEVENT',
        `UID:${session.id}@zenta.app`,
        `DTSTAMP:${start}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${session.title}`,
        `DESCRIPTION:${session.exercises.map((exercise) => `${exercise.title} (${formatExercisePrescription(exercise)})`).join(' | ')}`,
        'END:VEVENT',
      ]
    }),
    'END:VCALENDAR',
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${slug}.ics`
  link.click()
  URL.revokeObjectURL(url)
}

function downloadWeekDocument(weekStart: string, sessions: Session[]) {
  const payload: WeekDocument = {
    version: 1,
    weekStart,
    exportedAt: new Date().toISOString(),
    sessions,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `zenta-week-${weekStart}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function parseWeekDocument(raw: string): WeekDocument {
  const parsed = JSON.parse(raw) as Partial<WeekDocument>

  if (parsed.version !== 1 || typeof parsed.weekStart !== 'string' || !Array.isArray(parsed.sessions)) {
    throw new Error('Invalid week document')
  }

  return {
    version: 1,
    weekStart: parsed.weekStart,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
    sessions: parsed.sessions.map((session, index) =>
      normalizeImportedSession(
        session as Partial<Session>,
        toDateKey(addDays(new Date(`${parsed.weekStart}T00:00:00`), Math.min(index, 6))),
      ),
    ),
  }
}

function normalizeImportedSession(
  session: LegacySessionPayload,
  fallbackDate: string,
): Session {
  const sport = isSport(session.sport) ? session.sport : 'Run'
  const normalizedExercises = Array.isArray(session.exercises)
    ? session.exercises
        .map((exercise) => normalizeImportedSessionExercise(exercise))
        .filter((exercise): exercise is SessionExercise => Boolean(exercise))
    : []
  const legacyExerciseIds = Array.isArray(session.exerciseIds)
    ? session.exerciseIds
        .map((exerciseId) => {
          if (typeof exerciseId !== 'string') return null
          const exercise = exercises.find((item) => item.id === exerciseId)
          return exercise ? createSessionExercise(exercise) : null
        })
        .filter((exercise): exercise is SessionExercise => Boolean(exercise))
    : []

  return {
    id: typeof session.id === 'string' && session.id ? session.id : createId(),
    title: typeof session.title === 'string' && session.title ? session.title : 'Imported session',
    sport,
    date: typeof session.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(session.date) ? session.date : fallbackDate,
    startTime:
      typeof session.startTime === 'string' && /^\d{2}:\d{2}$/.test(session.startTime)
        ? session.startTime
        : '07:00',
    durationMin:
      typeof session.durationMin === 'number' && Number.isFinite(session.durationMin)
        ? session.durationMin
        : 45,
    intensity: normalizeIntensityForSport(sport, session.intensity),
    status: isSessionStatus(session.status) ? session.status : 'Planned',
    favorite: typeof session.favorite === 'boolean' ? session.favorite : false,
    exercises: normalizedExercises.length ? normalizedExercises : legacyExerciseIds,
  }
}

function normalizeImportedSessionExercise(value: unknown): SessionExercise | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const exercise = value as Partial<SessionExercise>
  const libraryExercise =
    typeof exercise.exerciseId === 'string'
      ? exercises.find((item) => item.id === exercise.exerciseId)
      : null
  const title =
    typeof exercise.title === 'string' && exercise.title.trim()
      ? exercise.title.trim()
      : libraryExercise?.title

  if (!title) {
    return null
  }

  return {
    id: typeof exercise.id === 'string' && exercise.id ? exercise.id : createId(),
    exerciseId: libraryExercise?.id ?? null,
    title,
    sets: typeof exercise.sets === 'number' && exercise.sets > 0 ? Math.round(exercise.sets) : 3,
    reps: typeof exercise.reps === 'number' && exercise.reps > 0 ? Math.round(exercise.reps) : 10,
    sideMode: isExerciseSideMode(exercise.sideMode) ? exercise.sideMode : 'Not side-based',
    bodySideLabel: typeof exercise.bodySideLabel === 'string' ? exercise.bodySideLabel : '',
    restSeconds:
      typeof exercise.restSeconds === 'number' && exercise.restSeconds >= 0
        ? Math.round(exercise.restSeconds)
        : 60,
  }
}

function replaceWeekSessions(currentSessions: Session[], weekStart: string, importedSessions: Session[]) {
  const importedIds = new Set(importedSessions.map((session) => session.id))

  return sortSessions([
    ...currentSessions.filter(
      (session) => !isDateWithinWeek(session.date, weekStart) && !importedIds.has(session.id),
    ),
    ...importedSessions,
  ])
}

function getIntensityOptions(sport: Sport) {
  if (sport === 'Strength' || sport === 'Mobility') {
    return simpleIntensityOptions
  }

  if (sport === 'Rest') {
    return restIntensityOptions
  }

  return enduranceIntensityOptions
}

function getDefaultIntensity(sport: Sport) {
  if (sport === 'Strength') {
    return 'Moderate'
  }

  if (sport === 'Mobility') {
    return 'Easy'
  }

  if (sport === 'Rest') {
    return 'Recovery'
  }

  return 'Zone 2'
}

function normalizeIntensityForSport(sport: Sport, intensity: unknown) {
  if (typeof intensity === 'string') {
    const normalized = intensity === 'Controlled' ? 'Moderate' : intensity
    if (getIntensityOptions(sport).some((option) => option === normalized)) {
      return normalized
    }
  }

  return getDefaultIntensity(sport)
}

function isSport(value: unknown): value is Sport {
  return typeof value === 'string' && sportOrder.includes(value as Sport)
}

function isSessionStatus(value: unknown): value is SessionStatus {
  return typeof value === 'string' && statusOrder.includes(value as SessionStatus)
}

function isExerciseSideMode(value: unknown): value is ExerciseSideMode {
  return typeof value === 'string' && sideModeOptions.includes(value as ExerciseSideMode)
}

export default App
