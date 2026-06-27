import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import BackgroundParticles from '../components/BackgroundParticles'

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'error' | 'success'
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY event when user lands via the reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true)
      }
    })
    // Also check for an existing session (in case page was refreshed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    setMessage('')

    if (newPassword.length < 6) {
      setMessageType('error')
      setMessage('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setMessageType('error')
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (error) {
      setMessageType('error')
      setMessage(error.message)
    } else {
      setMessageType('success')
      setMessage('Password updated successfully! Redirecting to login…')
      await supabase.auth.signOut()
      setTimeout(() => navigate('/login'), 2500)
    }
  }

  const styles = `
    .rp-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0F0F11;
      font-family: 'Inter', sans-serif;
      position: relative;
      overflow: hidden;
    }
    .rp-card {
      background: #1A1A1F;
      border: 1px solid #2A2A2F;
      border-radius: 20px;
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
      position: relative;
      z-index: 1;
    }
    .rp-title {
      color: white;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px;
    }
    .rp-subtitle {
      color: #A1A1AA;
      font-size: 14px;
      margin: 0 0 32px;
    }
    .rp-label {
      display: block;
      color: #A1A1AA;
      font-size: 13px;
      margin-bottom: 6px;
    }
    .rp-input {
      width: 100%;
      background: #0F0F11;
      border: 1px solid #2A2A2F;
      border-radius: 10px;
      padding: 12px 16px;
      color: #F4F4F5;
      font-size: 14px;
      font-family: 'Inter', sans-serif;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
      margin-bottom: 20px;
    }
    .rp-input:focus {
      border-color: #7C3AED;
      box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
    }
    .rp-btn {
      width: 100%;
      background: linear-gradient(135deg, #7C3AED, #5B21B6);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 14px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: opacity 0.2s;
      margin-top: 4px;
    }
    .rp-btn:hover { opacity: 0.9; }
    .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .rp-msg {
      margin-top: 18px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
    }
    .rp-msg.error { background: rgba(239,68,68,0.1); color: #F87171; border: 1px solid rgba(239,68,68,0.3); }
    .rp-msg.success { background: rgba(34,197,94,0.1); color: #4ADE80; border: 1px solid rgba(34,197,94,0.3); }
    .rp-waiting {
      color: #A1A1AA;
      font-size: 14px;
      text-align: center;
      padding: 20px 0;
    }
  `

  return (
    <div className="rp-page">
      <style>{styles}</style>
      <BackgroundParticles />
      <div className="rp-card">
        <h1 className="rp-title">Set New Password</h1>
        <p className="rp-subtitle">Enter your new password below to complete the reset.</p>

        {!sessionReady ? (
          <p className="rp-waiting">⏳ Verifying reset link… please wait.</p>
        ) : (
          <form onSubmit={handleReset}>
            <label className="rp-label">New Password</label>
            <input
              className="rp-input"
              type="password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label className="rp-label">Confirm Password</label>
            <input
              className="rp-input"
              type="password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button className="rp-btn" type="submit" disabled={loading}>
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}

        {message && (
          <div className={`rp-msg ${messageType}`}>{message}</div>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
