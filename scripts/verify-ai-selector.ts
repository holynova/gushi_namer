import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { AiNameSelector } from '../src/utils/aiNameSelector'
import { Namer } from '../src/utils/namer'

const books = ['shijing', 'chuci', 'tangshi', 'songci', 'yuefu', 'gushi', 'cifu']
const familyNames = ['苏', '沈', '欧阳']
const originalFetch = globalThis.fetch

globalThis.fetch = async (url) => {
  const relativePath = String(url).replace(/^\.\//, '')
  const body = await readFile(resolve('public', relativePath), 'utf8')
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

try {
  const report = []

  for (const book of books) {
    const namer = new Namer()
    const selector = new AiNameSelector()
    await namer.loadBook(book)

    const originalName = namer.genName()
    assert.ok(originalName, `${book} original generator should still work`)

    const firstBatch = selector.generate(namer, familyNames[0] ?? '', 6)
    const pool = selector.getCandidatePoolStats()
    assert.equal(firstBatch.length, 6, `${book} should return six AI names`)
    assert.ok(pool.total > 0, `${book} should build an AI candidate pool`)
    assert.ok(pool.crossesClause > 0, `${book} should retain cross-clause candidates`)
    assert.ok(pool.beyondFour > 0, `${book} should retain candidates farther than four chars`)

    const families = []
    for (const familyName of familyNames) {
      const names =
        familyName === familyNames[0]
          ? firstBatch
          : selector.generate(namer, familyName, 6)

      assert.equal(names.length, 6, `${book}/${familyName} should return six AI names`)
      assert.equal(new Set(names.map((item) => item.name)).size, 6, 'AI names must be unique')
      names.forEach((item) => {
        assert.equal(item.generationMode, 'ai')
        assert.ok((item.score ?? 0) >= 55, 'AI name should pass the score floor')
        assert.ok(item.scoreBreakdown, 'AI name should include a score breakdown')
        assert.ok(item.pronunciation, 'AI name should include full-name pronunciation')
      })

      families.push({
        familyName,
        scores: names.map((item) => item.score),
      })
    }

    report.push({ book, pool, families })
  }

  console.log(JSON.stringify(report, null, 2))
} finally {
  globalThis.fetch = originalFetch
}
