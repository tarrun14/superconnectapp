import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://glggpgrmioevcfbufdro.supabase.co"
const supabaseKey = "sb_publishable_hBwUiOEVph1ROFQOBPTLPg_V__WTX8-"

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    navigatorLock: false, 
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Detect password recovery flow IMMEDIATELY after client creation,
// BEFORE React mounts. Supabase auto-detects recovery tokens in the
// URL hash and fires PASSWORD_RECOVERY. If we don't catch it here,
// the event is lost by the time React's Layout component registers
// its own onAuthStateChange listener.
let _recoveryDetected = false
supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    _recoveryDetected = true
  }
})

export const wasRecoveryDetected = () => _recoveryDetected
export const clearRecoveryFlag = () => { _recoveryDetected = false }