import { NextRequest, NextResponse } from 'next/server'

// Simple logger to mirror production route
const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
}

type ExtractedSkill = {
  name: string
  category?: string
  confidence?: number
}

type ExtractionResult = {
  skills: ExtractedSkill[]
  totalSkillsFound: number
  meta?: Record<string, any>
}

function mockExtractSkills(text: string): ExtractionResult {
  const KNOWN: Array<{ key: RegExp; name: string; category?: string }> = [
    { key: /typescript?/i, name: 'TypeScript', category: 'language' },
    { key: /javascript|js\b/i, name: 'JavaScript', category: 'language' },
    { key: /react\b/i, name: 'React', category: 'framework' },
    { key: /next\.js|nextjs|\bnext\b/i, name: 'Next.js', category: 'framework' },
    { key: /node\.js|nodejs|\bnode\b/i, name: 'Node.js', category: 'runtime' },
    { key: /postgres(?:ql)?/i, name: 'PostgreSQL', category: 'database' },
    { key: /docker/i, name: 'Docker', category: 'devops' },
    { key: /aws|amazon web services/i, name: 'AWS', category: 'cloud' },
    { key: /python/i, name: 'Python', category: 'language' },
    { key: /ai|machine learning|ml\b/i, name: 'AI/ML', category: 'domain' },
  ]

  const found: ExtractedSkill[] = []
  for (const { key, name, category } of KNOWN) {
    if (key.test(text)) {
      found.push({ name, category, confidence: 0.9 })
    }
  }

  return {
    skills: found,
    totalSkillsFound: found.length,
    meta: { source: 'mock' },
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { userQuery } = body as { userQuery?: string }

    if (!userQuery || typeof userQuery !== 'string') {
      return NextResponse.json(
        { error: 'userQuery parameter is required and must be a string' },
        { status: 400 },
      )
    }

    console.log('🔍 [MOCK] Extracting skills from user query:', userQuery)

    const result = mockExtractSkills(userQuery)

    logger.info('Skill extraction completed', {
      totalSkillsFound: result.totalSkillsFound,
      sample: result.skills.slice(0, 5).map((s) => s.name),
    })

    console.log(`✅ [MOCK] Extracted ${result.totalSkillsFound} skills from query`)
    console.log('📋 [MOCK] Skills found:', result.skills.map((s) => s.name).join(', '))

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    logger.error('❌ [MOCK] Failed to extract skills from user query:', error)
    return NextResponse.json(
      { error: 'Failed to extract skills from user query' },
      { status: 500 },
    )
  }
}


