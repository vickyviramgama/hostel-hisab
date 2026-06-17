import { useState } from 'react'
import { signIn, signUp, sendPasswordReset, updatePassword } from './supabase'
import { IconBuilding, IconWarning, IconCheck, IconBell, IconShield } from './icons.jsx'

// ── Shared logo/header ───────────────────────────────────────────
function AuthHeader({ title, subtitle }) {
  return (
    <div style={{ textAlign:'center', marginBottom:32 }}>
      <div style={{
        width:72, height:72, borderRadius:20,
        background:'linear-gradient(135deg,#7C3AED,#5B21B6)',
        display:'flex', alignItems:'center', justifyContent:'center',
        margin:'0 auto 16px',
        boxShadow:'0 8px 32px rgba(124,58,237,0.4)'
      }}><IconBuilding size={36} color="white"/></div>
      <div style={{ fontSize:24, fontWeight:800, letterSpacing:-0.5, color:'var(--text-primary)' }}>{title}</div>
      {subtitle && <div style={{ fontSize:14, color:'var(--text-muted)', marginTop:6 }}>{subtitle}</div>}
    </div>
  )
}

// ── Input field ──────────────────────────────────────────────────
function Field({ label, type='text', value, onChange, placeholder, autoFocus }) {
  const [show, setShow] = useState(false)
  const isPass = type === 'password'
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</div>
      <div style={{ position:'relative' }}>
        <input
          className="form-input"
          type={isPass ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{ height:50, paddingRight: isPass ? 48 : 16 }}
        />
        {isPass && (
          <div onClick={() => setShow(s => !s)}
            style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', cursor:'pointer', color:'var(--text-muted)', fontSize:13, fontWeight:700, userSelect:'none', letterSpacing:0.5 }}>
            {show ? 'HIDE' : 'SHOW'}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Error/Success banner ─────────────────────────────────────────
function Banner({ msg, type='error' }) {
  if (!msg) return null
  return (
    <div style={{
      padding:'12px 16px', borderRadius:12, marginBottom:16, fontSize:13,
      background: type==='success' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
      border: `1px solid ${type==='success' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
      color: type==='success' ? 'var(--success)' : 'var(--danger)'
    }}>
      {type==='success' ? <IconCheck size={14} color='var(--success)' style={{verticalAlign:'middle',marginRight:4}}/> : <IconWarning size={14} color='var(--danger)' style={{verticalAlign:'middle',marginRight:4}}/>}{msg}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  LOGIN SCREEN
// ═══════════════════════════════════════════════════════════
export function LoginScreen({ onForgot, onSignup, onSuccess }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter email and password'); return }
    setLoading(true); setError('')
    try {
      await signIn(email.trim().toLowerCase(), password)
      onSuccess()
    } catch (e) {
      setError(e.message === 'Invalid login credentials'
        ? 'Wrong email or password. Try again.'
        : e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-screen">
      <AuthHeader title="Welcome Back" subtitle="Log in to HostelKhata"/>
      <Banner msg={error}/>
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus/>
      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password"/>
      <div style={{ textAlign:'right', marginTop:-8, marginBottom:20 }}>
        <span onClick={onForgot}
          style={{ fontSize:13, color:'var(--brand-light)', cursor:'pointer', fontWeight:600 }}>
          Forgot password?
        </span>
      </div>
      <button className="btn-primary" disabled={loading} onClick={handleLogin}
        style={{ height:52, fontSize:15, fontWeight:700 }}>
        {loading ? 'Logging in…' : 'Log In →'}
      </button>
      <div style={{ textAlign:'center', marginTop:24, fontSize:14, color:'var(--text-muted)' }}>
        New staff member?{' '}
        <span onClick={onSignup}
          style={{ color:'var(--brand-light)', fontWeight:700, cursor:'pointer' }}>
          Create account
        </span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  SIGNUP SCREEN
// ═══════════════════════════════════════════════════════════
export function SignupScreen({ onBack, onSuccess }) {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  const handleSignup = async () => {
    if (!name || !email || !password) { setError('All fields are required'); return }
    if (password.length < 6)          { setError('Password must be at least 6 characters'); return }
    if (password !== confirm)          { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim(), 'staff')
      setDone(true)
    } catch (e) {
      setError(e.message.includes('already registered')
        ? 'This email is already registered. Try logging in.'
        : e.message)
    } finally { setLoading(false) }
  }

  if (done) return (
    <div className="auth-screen">
      <AuthHeader title="Check your email!" subtitle=""/>
      <div style={{ textAlign:'center', padding:'24px 0' }}>
        <div style={{ marginBottom:16 }}><IconBell size={64} color="var(--brand-light)"/></div>
        <div style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>Almost there!</div>
        <div style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.6, marginBottom:8 }}>
          We sent a confirmation link to
        </div>
        <div style={{ fontSize:15, fontWeight:700, color:'var(--brand-light)', marginBottom:16 }}>{email}</div>
        <div style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>
          Click the link in the email to activate your account, then come back and log in.
        </div>
      </div>
      <button className="btn-primary" onClick={onBack} style={{ height:52, fontSize:15, fontWeight:700 }}>
        Go to Login →
      </button>
    </div>
  )

  return (
    <div className="auth-screen">
      <div onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-muted)', cursor:'pointer', marginBottom:24, fontSize:14, fontWeight:600 }}>
        ← Back to login
      </div>
      <AuthHeader title="Create Account" subtitle="Join your hostel team"/>
      <Banner msg={error}/>
      <Field label="Full Name" value={name} onChange={setName} placeholder="e.g. Ramesh Patel" autoFocus/>
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com"/>
      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 6 characters"/>
      <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat password"/>
      <div style={{ background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:12, padding:'12px 14px', marginBottom:20, fontSize:13, color:'var(--text-muted)', lineHeight:1.5 }}>
        New accounts start as <strong style={{ color:'var(--text-secondary)' }}>Staff</strong>. An admin will upgrade your role if needed.
      </div>
      <button className="btn-primary" disabled={loading} onClick={handleSignup}
        style={{ height:52, fontSize:15, fontWeight:700 }}>
        {loading ? 'Creating account…' : 'Create Account →'}
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  FORGOT PASSWORD SCREEN
// ═══════════════════════════════════════════════════════════
export function ForgotScreen({ onBack }) {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [sent, setSent]     = useState(false)

  const handleReset = async () => {
    if (!email) { setError('Please enter your email'); return }
    setLoading(true); setError('')
    try {
      await sendPasswordReset(email.trim().toLowerCase())
      setSent(true)
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  if (sent) return (
    <div className="auth-screen">
      <AuthHeader title="Email sent!" subtitle=""/>
      <div style={{ textAlign:'center', padding:'24px 0' }}>
        <div style={{ marginBottom:16 }}><IconShield size={64} color="var(--brand-light)"/></div>
        <div style={{ fontSize:15, color:'var(--text-muted)', lineHeight:1.7 }}>
          Check your inbox at<br/>
          <strong style={{ color:'var(--brand-light)' }}>{email}</strong><br/>
          for a password reset link.
        </div>
      </div>
      <button className="btn-primary" onClick={onBack} style={{ height:52, fontSize:15, fontWeight:700 }}>
        ← Back to Login
      </button>
    </div>
  )

  return (
    <div className="auth-screen">
      <div onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-muted)', cursor:'pointer', marginBottom:24, fontSize:14, fontWeight:600 }}>
        ← Back to login
      </div>
      <AuthHeader title="Forgot Password?" subtitle="Enter your email to get a reset link"/>
      <Banner msg={error}/>
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus/>
      <button className="btn-primary" disabled={loading || !email} onClick={handleReset}
        style={{ height:52, fontSize:15, fontWeight:700 }}>
        {loading ? 'Sending…' : 'Send Reset Link →'}
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  RESET PASSWORD SCREEN (after clicking email link)
// ═══════════════════════════════════════════════════════════
export function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  const handleUpdate = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm)  { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      await updatePassword(password)
      setDone(true)
      setTimeout(onDone, 2000)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (done) return (
    <div className="auth-screen">
      <div style={{ textAlign:'center', padding:'48px 0' }}>
        <div style={{ marginBottom:16 }}><IconCheck size={64} color="var(--success)"/></div>
        <div style={{ fontSize:18, fontWeight:700, color:'var(--success)' }}>Password updated!</div>
        <div style={{ fontSize:14, color:'var(--text-muted)', marginTop:8 }}>Redirecting to login…</div>
      </div>
    </div>
  )

  return (
    <div className="auth-screen">
      <AuthHeader title="Set New Password" subtitle="Choose a strong password"/>
      <Banner msg={error}/>
      <Field label="New Password" type="password" value={password} onChange={setPassword} placeholder="Min. 6 characters" autoFocus/>
      <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat password"/>
      <button className="btn-primary" disabled={loading || !password} onClick={handleUpdate}
        style={{ height:52, fontSize:15, fontWeight:700 }}>
        {loading ? 'Updating…' : 'Update Password →'}
      </button>
    </div>
  )
}
