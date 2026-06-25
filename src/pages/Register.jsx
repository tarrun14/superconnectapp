import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import BackgroundParticles from "../components/BackgroundParticles";
import './Login.css'

const Register = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
        setMessage("Passwords do not match");
        return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Registration successful 🎉 Please check your email to verify.")
      setTimeout(() => navigate("/login"), 3000)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    })

    if (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="login-page" style={{ position: "relative", overflow: "hidden" }}>
      <BackgroundParticles />
      <div className="login-card animate-slideUp" style={{ position: "relative", zIndex: 1 }}>

        <div className="login-header">
          <h1>Create Account</h1>
          <p>Join Connect and start building</p>
        </div>

        <div className="social-login">
          <button 
            className="social-btn google"
            onClick={handleGoogleLogin}
            type="button"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" />
            Continue with Google
          </button>
        </div>

        <div className="divider">
          <span>OR SIGN UP WITH EMAIL</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          <div className="input-group">
            <span className="input-icon">👤</span>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon">✉️</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" style={{ width: '100%', display: 'block' }}>
            Create Account
          </button>
        </form>

        <p style={{ color: "red", marginTop: "10px" }}>{message}</p>

        <p className="signup-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>

      </div>
    </div>
  )
}

export default Register
