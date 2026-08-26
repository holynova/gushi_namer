import cnchar from 'cnchar'
import { pinyin } from 'pinyin-pro'
import {
  FORBIDDEN_NAME_CHARS,
  HARD_FUNCTION_CHARS,
  KNOWN_POETIC_PAIRS,
  RESTRICTED_COMBINATION_CHARS,
  SOFT_FUNCTION_CHARS,
  UNLUCKY_HOMOPHONE_PATTERNS,
  getNameCharTier,
  getSemanticGroups,
  isEligibleNameChar,
  type NameCharTier,
} from './nameLexicon'

export interface AiNameCandidateInput {
  name: string
  distance: number
  sentenceLength: number
  crossesClause: boolean
}

export interface AiScoreBreakdown {
  meaning: number
  source: number
  pronunciation: number
  readability: number
  visual: number
}

export interface AiNameEvaluation {
  score: number
  scoreBreakdown: AiScoreBreakdown
  reasons: string[]
  pronunciation: string
}

interface PronunciationProfile {
  display: string
  syllables: string[]
  initials: string[]
  finals: string[]
  tones: number[]
}

const TIER_MEANING_POINTS: Record<NameCharTier, number> = {
  high: 6,
  common: 4,
  poetic: 5,
  'soft-function': 0,
}

const TIER_READABILITY_POINTS: Record<NameCharTier, number> = {
  high: 6,
  common: 5,
  poetic: 4,
  'soft-function': 1,
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const adjacentRepeatCount = <T>(values: T[]): number =>
  values.reduce(
    (count, value, index) => count + (index > 0 && value === values[index - 1] ? 1 : 0),
    0
  )

export const normalizeFamilyName = (value: string): string =>
  Array.from(value)
    .filter((char) => /^\p{Script=Han}$/u.test(char))
    .slice(0, 2)
    .join('')

const getPronunciationProfile = (
  familyName: string,
  givenName: string
): PronunciationProfile => {
  const text = `${familyName}${givenName}`
  const surnameOptions = familyName
    ? ({ mode: 'surname', surname: 'head' } as const)
    : ({ mode: 'normal', surname: 'off' } as const)
  const details = pinyin(text, {
    type: 'all',
    toneType: 'num',
    nonZh: 'removed',
    ...surnameOptions,
  })
  const display = pinyin(text, {
    type: 'array',
    toneType: 'symbol',
    nonZh: 'removed',
    ...surnameOptions,
  }).join(' · ')

  return {
    display,
    syllables: details.map((item) => item.result.replace(/[0-5]/g, '').toLowerCase()),
    initials: details.map((item) => item.initial.toLowerCase()),
    finals: details.map((item) => item.final.toLowerCase()),
    tones: details.map((item) => Number(item.num) || 0),
  }
}

const getStrokeCounts = (text: string): number[] => {
  try {
    const strokes = cnchar.stroke(text, 'array')
    return Array.isArray(strokes)
      ? strokes.map((value) => (typeof value === 'number' && value > 0 ? value : 10))
      : Array.from(text, () => 10)
  } catch {
    return Array.from(text, () => 10)
  }
}

const hasUnluckyHomophone = (
  profile: PronunciationProfile,
  familyLength: number
): boolean => {
  const full = profile.syllables.join('')
  const given = profile.syllables.slice(familyLength).join('')

  return Array.from(UNLUCKY_HOMOPHONE_PATTERNS).some(
    (pattern) =>
      given === pattern ||
      full === pattern ||
      full.startsWith(pattern) ||
      full.endsWith(pattern)
  )
}

const scorePronunciation = (
  profile: PronunciationProfile,
  familyLength: number
): number => {
  const toneRepeats = adjacentRepeatCount(profile.tones)
  const initialRepeats = adjacentRepeatCount(profile.initials.filter(Boolean))
  const finalRepeats = adjacentRepeatCount(profile.finals.filter(Boolean))
  const uniqueTones = new Set(profile.tones.filter(Boolean)).size
  const uniqueSyllables = new Set(profile.syllables).size
  const givenSyllables = profile.syllables.slice(familyLength)
  let score = 8

  score += toneRepeats === 0 ? 6 : Math.max(0, 4 - toneRepeats * 2)
  score += uniqueTones >= Math.min(3, profile.tones.length) ? 4 : uniqueTones >= 2 ? 2 : 0
  score += initialRepeats === 0 ? 3 : Math.max(0, 2 - initialRepeats)
  score += finalRepeats === 0 ? 2 : Math.max(0, 1 - finalRepeats)
  score += uniqueSyllables === profile.syllables.length ? 2 : 0

  if (familyLength > 0 && profile.syllables[familyLength - 1] === givenSyllables[0]) {
    score -= 5
  }

  return clamp(score, 0, 25)
}

const scoreVisualBalance = (strokes: number[], familyLength: number): number => {
  const given = strokes.slice(familyLength)
  if (given.length !== 2) return 5

  const [first = 10, second = 10] = given
  const difference = Math.abs(first - second)
  const total = first + second
  let score = 0

  score += first >= 4 && first <= 20 ? 2 : first <= 24 ? 1 : 0
  score += second >= 4 && second <= 20 ? 2 : second <= 24 ? 1 : 0
  score += difference <= 5 ? 3 : difference <= 8 ? 2 : difference <= 11 ? 1 : 0
  score += total >= 12 && total <= 32 ? 2 : total <= 38 ? 1 : 0
  score += strokes.slice(1).every(
    (stroke, index) => Math.abs(stroke - (strokes[index] ?? stroke)) <= 12
  )
    ? 1
    : 0

  return clamp(score, 0, 10)
}

// Distance and clause boundaries influence the score, but are never used as
// hard filters. This deliberately allows the AI group to select any two
// ordered characters from the same sentence.
const scoreSourceRelationship = (
  candidate: AiNameCandidateInput,
  knownPair: boolean
): number => {
  let score =
    candidate.distance <= 1
      ? 15
      : candidate.distance <= 4
        ? 13
        : candidate.distance <= 8
          ? 11
          : candidate.distance <= 16
            ? 9
            : 7

  if (!candidate.crossesClause) score += 1
  if (candidate.sentenceLength <= 24) score += 1
  if (knownPair) score += 3
  return clamp(score, 0, 20)
}

const scoreMeaning = (
  chars: string[],
  tiers: NameCharTier[],
  knownPair: boolean
): { score: number; sharedGroups: string[]; allGroups: string[] } => {
  const groups = chars.map(getSemanticGroups)
  const sharedGroups = groups[0]?.filter((group) => groups[1]?.includes(group)) ?? []
  const allGroups = Array.from(new Set(groups.flat()))
  const tierScore = tiers.reduce((sum, tier) => sum + TIER_MEANING_POINTS[tier], 0)
  const semanticScore = groups.reduce((sum, values) => sum + Math.min(4, values.length * 2), 0)

  return {
    score: clamp(
      tierScore + semanticScore + sharedGroups.length * 4 + (knownPair ? 8 : 0),
      0,
      30
    ),
    sharedGroups,
    allGroups,
  }
}

export const getStaticAiCandidateScore = (candidate: AiNameCandidateInput): number => {
  const chars = Array.from(candidate.name)
  const tiers = chars.map(getNameCharTier)
  if (tiers.some((tier) => tier === null)) return 0

  const safeTiers = tiers as NameCharTier[]
  const knownPair = KNOWN_POETIC_PAIRS.has(candidate.name)
  const meaning = scoreMeaning(chars, safeTiers, knownPair).score
  const source = scoreSourceRelationship(candidate, knownPair)
  const readability = clamp(
    safeTiers.reduce((sum, tier) => sum + TIER_READABILITY_POINTS[tier], 0) + 3,
    0,
    15
  )
  return meaning + source + readability
}

export const evaluateAiNameCandidate = (
  candidate: AiNameCandidateInput,
  rawFamilyName: string
): AiNameEvaluation | null => {
  const familyName = normalizeFamilyName(rawFamilyName)
  const chars = Array.from(candidate.name)
  if (
    chars.length !== 2 ||
    chars[0] === chars[1] ||
    chars.some((char) => !isEligibleNameChar(char))
  ) {
    return null
  }

  const knownPair = KNOWN_POETIC_PAIRS.has(candidate.name)
  if (chars.some((char) => SOFT_FUNCTION_CHARS.has(char)) && !knownPair) return null
  if (chars.some((char) => RESTRICTED_COMBINATION_CHARS.has(char)) && !knownPair) return null
  if (familyName && Array.from(familyName).at(-1) === chars[0]) return null
  if (chars.some((char) => FORBIDDEN_NAME_CHARS.has(char) || HARD_FUNCTION_CHARS.has(char))) {
    return null
  }

  const tiers = chars.map(getNameCharTier)
  if (tiers.some((tier) => tier === null)) return null
  const safeTiers = tiers as NameCharTier[]
  const familyLength = Array.from(familyName).length
  const profile = getPronunciationProfile(familyName, candidate.name)
  if (hasUnluckyHomophone(profile, familyLength)) return null

  const meaningResult = scoreMeaning(chars, safeTiers, knownPair)
  const source = scoreSourceRelationship(candidate, knownPair)
  const pronunciation = scorePronunciation(profile, familyLength)
  const readability = clamp(
    safeTiers.reduce((sum, tier) => sum + TIER_READABILITY_POINTS[tier], 0) +
      3 -
      (chars.some((char) => familyName.includes(char)) ? 3 : 0),
    0,
    15
  )
  const visual = scoreVisualBalance(getStrokeCounts(`${familyName}${candidate.name}`), familyLength)
  const scoreBreakdown: AiScoreBreakdown = {
    meaning: meaningResult.score,
    source,
    pronunciation,
    readability,
    visual,
  }
  const score = Math.round(Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0))
  const reasons: string[] = []

  if (knownPair) reasons.push('经典组合')
  if (candidate.crossesClause) reasons.push('跨分句取意')
  else if (candidate.distance > 4) reasons.push('同句遥取意象')
  else reasons.push(candidate.distance === 1 ? '原句相连' : '同句取字')
  if (meaningResult.sharedGroups[0]) reasons.push(`寓意${meaningResult.sharedGroups[0]}`)
  else if (meaningResult.allGroups.length > 0) {
    reasons.push(`意象·${meaningResult.allGroups.slice(0, 2).join('·')}`)
  }
  if (pronunciation >= 21) reasons.push('音律协调')
  if (visual >= 8) reasons.push('字形协调')

  return {
    score,
    scoreBreakdown,
    reasons: reasons.slice(0, 4),
    pronunciation: profile.display,
  }
}
