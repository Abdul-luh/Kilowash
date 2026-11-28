/**
 * Waitlist & Referral API Service Layer
 *
 * Isolates all data access in one file so UI components stay completely decoupled.
 * Currently calls Supabase RPC (`get_waitlist_status` & `join_waitlist`).
 * When moving to a dedicated backend later, swap only the fetch calls below.
 */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, '')
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined

export const TARGET_SIGNUPS = 1000
export const REFERRAL_GOAL = 3

// Verified unique waitlist + campus survey signups (LASU), excluding internal test accounts
const SEEDED_EMAILS = new Set([
  'abdulazeezjide13@gmail.com',
  'abdurrasheedkhabbab@gmail.com',
  'ade206182@gmail.com',
  'adeaayat2706@gmail.com',
  'adeolah0328@gmail.com',
  'adexlr8@gmail.com',
  'afolabioluwadabira83@gmail.com',
  'ayetobaoladimeji@gmail.com',
  'balogunsewey4@gmail.com',
  'basitolokunola@gmail.com',
  'bellofuhad200@gmail.com',
  'benedictbanjo00@gmail.com',
  'daviesprecious202@gmail.com',
  'erinfolamizainab67@gmail.com',
  'faosideenolowolagba@gmail.com',
  'giftayomikun76@gmail.com',
  'ifeoluwaojuroye2005@gmail.com',
  'israelcabala06@gmail.com',
  'kennyclassical4real@gmail.com',
  'koikiafusattaiwo@gmail.com',
  'kolapotaofeek4@gmail.com',
  'makinderidwan0@gmail.com',
  'mathewsedicity@gmail.com',
  'mayowayusuf3004@gmail.com',
  'mimirunsewe96@gmail.com',
  'mojereolamichael1@gmail.com',
  'mujeebsanni679@gmail.com',
  'mutmainnahgiwa@gmail.com',
  'nurudeenolumegbon1@gmail.com',
  'odogiyonm@gmail.com',
  'ojugbelelateef2006@gmail.com',
  'okehabeeboluwatobiloba@gmail.com',
  'oladiposamuel1708@gmail.com',
  'olugasarah84@gmail.com',
  'omoleeniola2@gmail.com',
  'owolabititobi452@gmail.com',
  'preciousfuwa14@gmail.com',
  'savagehush007@gmail.com',
  'slamsbaba005@gmail.com',
  'taiwoireoluwakunmi@gmail.com',
  'trustypeter16@gmail.com',
  'uthmanfathiu8@gmail.com',
  'wabimbola9@gmail.com',
  'wareezahoyeshola05@gmail.com',
  'yusufhalimah78@gmail.com',
])

export const INITIAL_VERIFIED_COUNT = SEEDED_EMAILS.size // 45

export interface WaitlistStats {
  count: number
  referralCode: string
  myReferrals: number
  rewardUnlocked: boolean
  alreadyRegistered?: boolean
}

interface SupabaseRpcResponse {
  ok?: boolean
  count?: number
  referral_code?: string
  my_referrals?: number
  reward_unlocked?: boolean
  already_registered?: boolean
  error?: string
}

export function isExcludedTestEmail(emailStr: string): boolean {
  const e = emailStr.trim().toLowerCase()
  return e.startsWith('lagbaj') || e.includes('odulate')
}

export function generateReferralCode(emailStr: string): string {
  const prefix =
    emailStr
      .split('@')[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
      .slice(0, 8) || 'student'
  let hash = 0
  for (let i = 0; i < emailStr.length; i++) {
    hash = (hash * 31 + emailStr.charCodeAt(i)) % 900
  }
  const digits = String((Math.abs(hash) % 900) + 100)
  return `${prefix}${digits}`
}

function buildSupabaseHeaders(key: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    apikey: key,
    // Classic Supabase anon keys are JWTs (`eyJ...`); newer `sb_publishable_...` keys use `apikey` only
    ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
  }
}

export async function getWaitlistStats(referralCode?: string): Promise<WaitlistStats | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_waitlist_status`, {
    method: 'POST',
    headers: buildSupabaseHeaders(SUPABASE_KEY),
    body: JSON.stringify({
      p_referral_code: referralCode || null,
    }),
  })

  if (!res.ok) return null
  const data = (await res.json()) as SupabaseRpcResponse
  if (!data?.ok || typeof data.count !== 'number') return null

  return {
    count: Math.max(INITIAL_VERIFIED_COUNT, data.count),
    referralCode: data.referral_code || referralCode || '',
    myReferrals: data.my_referrals ?? 0,
    rewardUnlocked: Boolean(data.reward_unlocked),
  }
}

export async function submitWaitlistSignup(params: {
  email: string
  school: string
  referredBy?: string | null
  fallbackCurrentCount?: number
}): Promise<WaitlistStats> {
  const cleanEmail = params.email.trim().toLowerCase()
  const finalSchool = params.school.trim()
  const generatedCode = generateReferralCode(cleanEmail)
  const isExcluded = isExcludedTestEmail(cleanEmail)
  const safeReferredBy =
    params.referredBy && params.referredBy !== generatedCode ? params.referredBy : null

  // Primary database: Supabase RPC
  if (SUPABASE_URL && SUPABASE_KEY) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/join_waitlist`, {
      method: 'POST',
      headers: buildSupabaseHeaders(SUPABASE_KEY),
      body: JSON.stringify({
        p_email: cleanEmail,
        p_school: finalSchool,
        p_referral_code: generatedCode,
        p_referred_by: safeReferredBy,
      }),
    })

    if (!res.ok) {
      throw new Error('Failed to submit waitlist entry')
    }

    const data = (await res.json()) as SupabaseRpcResponse
    if (!data?.ok || typeof data.count !== 'number') {
      throw new Error(data?.error || 'Invalid waitlist response')
    }

    const alreadyRegistered = Boolean(data.already_registered)

    // Only send Web3Forms email notification for brand-new signups
    if (WEB3FORMS_KEY && !isExcluded && !alreadyRegistered) {
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          email: cleanEmail,
          school: finalSchool,
          referral_code: data.referral_code || generatedCode,
          ...(safeReferredBy ? { referred_by: safeReferredBy } : {}),
        }),
      }).catch(() => {})
    }

    return {
      count: Math.max(INITIAL_VERIFIED_COUNT, data.count),
      referralCode: data.referral_code || generatedCode,
      myReferrals: data.my_referrals ?? 0,
      rewardUnlocked: Boolean(data.reward_unlocked),
      alreadyRegistered,
    }
  }

  // Local fallback when Supabase env vars haven't been added yet
  const alreadySeeded = SEEDED_EMAILS.has(cleanEmail)
  const baseCount = params.fallbackCurrentCount ?? INITIAL_VERIFIED_COUNT
  const shouldIncrement = !isExcluded && !alreadySeeded
  return {
    count: shouldIncrement ? baseCount + 1 : baseCount,
    referralCode: generatedCode,
    myReferrals: 0,
    rewardUnlocked: false,
    alreadyRegistered: alreadySeeded,
  }
}
