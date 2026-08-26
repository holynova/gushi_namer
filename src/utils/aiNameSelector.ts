import type { Book, GeneratedName, Namer } from './namer'
import { isEligibleNameChar } from './nameLexicon'
import {
  evaluateAiNameCandidate,
  getStaticAiCandidateScore,
  normalizeFamilyName,
  type AiNameEvaluation,
} from './aiNameScoring'

interface CharacterReference {
  char: string
  sentencePosition: number
}

interface AiCandidate extends Book {
  name: string
  sentence: string
  distance: number
  sentenceLength: number
  crossesClause: boolean
  characterPositions: [number, number]
  sourceKey: string
  sentenceKey: string
  staticScore: number
}

interface EvaluatedCandidate {
  candidate: AiCandidate
  evaluation: AiNameEvaluation
  adjustedScore: number
}

const MAX_CANDIDATES_PER_SENTENCE = 36
const MIN_AI_SCORE = 55
const SCORE_WINDOW = 14
const WEIGHT_TEMPERATURE = 5
const CLAUSE_SEPARATOR = /[，,、：:]/u

const chooseWeighted = <T>(items: T[], getWeight: (item: T) => number): T | undefined => {
  if (items.length === 0) return undefined
  const weights = items.map((item) => Math.max(0, getWeight(item)))
  const total = weights.reduce((sum, value) => sum + value, 0)
  if (total <= 0) return items[Math.floor(Math.random() * items.length)]

  let cursor = Math.random() * total
  for (let index = 0; index < items.length; index += 1) {
    cursor -= weights[index] ?? 0
    if (cursor <= 0) return items[index]
  }
  return items.at(-1)
}

export class AiNameSelector {
  private sourceData: Book[] | null = null
  private candidatePool: AiCandidate[] = []
  private evaluationCache = new Map<string, EvaluatedCandidate[]>()

  private getCharacters(sentence: string): CharacterReference[] {
    return Array.from(sentence)
      .map((char, sentencePosition) => ({ char, sentencePosition }))
      .filter((item) => /^\p{Script=Han}$/u.test(item.char))
  }

  private buildSentenceCandidates(
    passage: Book,
    sentence: string,
    sentenceKey: string
  ): AiCandidate[] {
    const sentenceChars = Array.from(sentence)
    const characters = this.getCharacters(sentence)
    const sourceKey = `${passage.title}\u0000${passage.author}`
    const byName = new Map<string, AiCandidate>()

    // Intentionally enumerate every ordered pair in the sentence. There is no
    // same-clause check and no maximum-distance cutoff for the AI candidates.
    for (let first = 0; first < characters.length - 1; first += 1) {
      const firstRef = characters[first]
      if (!firstRef || !isEligibleNameChar(firstRef.char)) continue

      for (let second = first + 1; second < characters.length; second += 1) {
        const secondRef = characters[second]
        if (!secondRef || !isEligibleNameChar(secondRef.char)) continue
        if (firstRef.char === secondRef.char) continue

        const name = `${firstRef.char}${secondRef.char}`
        const between = sentenceChars.slice(
          firstRef.sentencePosition + 1,
          secondRef.sentencePosition
        )
        const candidate: AiCandidate = {
          ...passage,
          name,
          sentence,
          distance: second - first,
          sentenceLength: characters.length,
          crossesClause: between.some((char) => CLAUSE_SEPARATOR.test(char)),
          characterPositions: [firstRef.sentencePosition, secondRef.sentencePosition],
          sourceKey,
          sentenceKey,
          staticScore: 0,
        }
        candidate.staticScore = getStaticAiCandidateScore(candidate)

        const existing = byName.get(name)
        if (!existing || candidate.staticScore > existing.staticScore) {
          byName.set(name, candidate)
        }
      }
    }

    return Array.from(byName.values())
      .filter((candidate) => candidate.staticScore > 0)
      .sort((a, b) => b.staticScore - a.staticScore)
      .slice(0, MAX_CANDIDATES_PER_SENTENCE)
  }

  private rebuildPool(namer: Namer): void {
    const data = namer.bookData
    if (!data || data === this.sourceData) return

    this.sourceData = data
    this.evaluationCache.clear()
    this.candidatePool = data.flatMap((passage, passageIndex) =>
      namer.splitSentence(passage.content).flatMap((sentence, sentenceIndex) =>
        this.buildSentenceCandidates(
          passage,
          sentence,
          `${passageIndex}:${sentenceIndex}`
        )
      )
    )
  }

  private evaluateCandidates(familyName: string): EvaluatedCandidate[] {
    const cached = this.evaluationCache.get(familyName)
    if (cached) return cached

    const bestSourceForName = new Map<string, EvaluatedCandidate>()
    this.candidatePool.forEach((candidate) => {
      const evaluation = evaluateAiNameCandidate(candidate, familyName)
      if (!evaluation || evaluation.score < MIN_AI_SCORE) return

      const item: EvaluatedCandidate = {
        candidate,
        evaluation,
        adjustedScore: evaluation.score,
      }
      const existing = bestSourceForName.get(candidate.name)
      if (!existing || item.evaluation.score > existing.evaluation.score) {
        bestSourceForName.set(candidate.name, item)
      }
    })

    const evaluated = Array.from(bestSourceForName.values()).sort(
      (a, b) => b.evaluation.score - a.evaluation.score
    )
    this.evaluationCache.set(familyName, evaluated)
    return evaluated
  }

  private toGeneratedName(item: EvaluatedCandidate): GeneratedName {
    const { candidate, evaluation } = item
    return {
      name: candidate.name,
      sentence: candidate.sentence,
      content: candidate.content,
      title: candidate.title,
      author: candidate.author,
      book: candidate.book,
      dynasty: candidate.dynasty,
      score: evaluation.score,
      scoreBreakdown: evaluation.scoreBreakdown,
      scoreReasons: evaluation.reasons,
      pronunciation: evaluation.pronunciation,
      characterPositions: candidate.characterPositions,
      generationMode: 'ai',
    }
  }

  generate(namer: Namer, rawFamilyName: string, count = 6): GeneratedName[] {
    this.rebuildPool(namer)
    if (this.candidatePool.length === 0 || count <= 0) return []

    const familyName = normalizeFamilyName(rawFamilyName)
    const evaluated = this.evaluateCandidates(familyName)
    if (evaluated.length === 0) return []

    const highestScore = evaluated[0]?.evaluation.score ?? MIN_AI_SCORE
    const qualityPool = evaluated
      .filter((item) => item.evaluation.score >= highestScore - SCORE_WINDOW)
      .slice(0, Math.max(240, count * 40))
    const selected: EvaluatedCandidate[] = []
    const usedNames = new Set<string>()
    const usedSentences = new Set<string>()
    const sourceUsage = new Map<string, number>()
    const characterUsage = new Map<string, number>()

    while (selected.length < count) {
      const unused = qualityPool.filter((item) => !usedNames.has(item.candidate.name))
      if (unused.length === 0) break

      let options = unused.filter(
        (item) =>
          !usedSentences.has(item.candidate.sentenceKey) &&
          (sourceUsage.get(item.candidate.sourceKey) ?? 0) < 2 &&
          Array.from(item.candidate.name).every(
            (char) => (characterUsage.get(char) ?? 0) < 2
          )
      )
      if (options.length === 0) options = unused

      options.forEach((item) => {
        const repeatedCharacters = Array.from(item.candidate.name).reduce(
          (sum, char) => sum + (characterUsage.get(char) ?? 0),
          0
        )
        item.adjustedScore =
          item.evaluation.score -
          (sourceUsage.get(item.candidate.sourceKey) ?? 0) * 7 -
          repeatedCharacters * 4
      })

      const shortlist = options
        .sort((a, b) => b.adjustedScore - a.adjustedScore)
        .slice(0, 100)
      const bestAdjusted = shortlist[0]?.adjustedScore ?? highestScore
      const chosen = chooseWeighted(shortlist, (item) =>
        Math.exp((item.adjustedScore - bestAdjusted) / WEIGHT_TEMPERATURE)
      )
      if (!chosen) break

      selected.push(chosen)
      usedNames.add(chosen.candidate.name)
      usedSentences.add(chosen.candidate.sentenceKey)
      sourceUsage.set(
        chosen.candidate.sourceKey,
        (sourceUsage.get(chosen.candidate.sourceKey) ?? 0) + 1
      )
      Array.from(chosen.candidate.name).forEach((char) => {
        characterUsage.set(char, (characterUsage.get(char) ?? 0) + 1)
      })
    }

    return selected.map((item) => this.toGeneratedName(item))
  }

  getCandidatePoolSize(): number {
    return this.candidatePool.length
  }

  getCandidatePoolStats(): { total: number; crossesClause: number; beyondFour: number } {
    return {
      total: this.candidatePool.length,
      crossesClause: this.candidatePool.filter((item) => item.crossesClause).length,
      beyondFour: this.candidatePool.filter((item) => item.distance > 4).length,
    }
  }
}
