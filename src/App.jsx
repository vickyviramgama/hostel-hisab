import { useState, useEffect } from 'react'
import './App.css'
import {
  useHostelData, formatCurrency, formatDate, timeAgo,
  getTodayStats, getMemberBalance, getWeeklyData, getCategoryBreakdown,
  CATEGORIES, canDo, makeNotif, NOTIF_TYPES, nextColor, makeInitials
} from './data.js'
import { supabase, signOut, getProfile, signUp, updateProfile } from './supabase.js'
import { LoginScreen, SignupScreen, ForgotScreen, ResetPasswordScreen } from './AuthScreens.jsx'
import {
  IconDashboard, IconTeam, IconLedger, IconReports,
  IconAdvance, IconExpense, IconPlus, IconClose, IconArrowRight,
  IconCheck, IconWallet, IconBell, IconFilter, IconSearch,
  IconReturn, CategoryIcon, IconActivity,
  IconStar, IconShield, IconHardhat, IconTrash, IconEdit,
  IconWarning, IconBuilding, IconInbox, IconCelebrate, IconClipboard,
  IconUser, IconCart, IconMoney, IconClock, IconDownload, IconCalendar
} from './icons.jsx'

const COLORS = ['#7C3AED','#06B6D4','#10B981','#F59E0B','#F43F5E','#FB923C','#3B82F6','#EC4899']

// ── Normalise Supabase row → app shape (member_id → memberId, etc.) ──
function normTxn(t) {
  if (!t) return t
  return { ...t, memberId: t.member_id, read: t.is_read }
}
function normNotif(n) {
  if (!n) return n
  return { ...n, read: n.is_read }
}

// ─── Status Bar ──────────────────────────────────────────────────
function StatusBar() {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:false}))
  useEffect(() => { const t = setInterval(() => setTime(new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:false})),10000); return () => clearInterval(t) }, [])
  return (
    <div className="status-bar">
      <span className="status-time">{time}</span>
      <div className="status-icons">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect x="1" y="4" width="2" height="8" rx="1" fill="white" fillOpacity="0.5"/><rect x="5" y="2.5" width="2" height="9.5" rx="1" fill="white" fillOpacity="0.7"/><rect x="9" y="1" width="2" height="11" rx="1" fill="white"/><rect x="13" y="0" width="2" height="12" rx="1" fill="white"/></svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x="0.5" y="0.5" width="22" height="11" rx="3.5" stroke="white" strokeOpacity="0.35"/><rect x="2" y="2" width="17" height="8" rx="2" fill="white"/><path d="M24 4.5v3a1.5 1.5 0 000-3z" fill="white" fillOpacity="0.4"/></svg>
      </div>
    </div>
  )
}

// ─── Role Badge ───────────────────────────────────────────────────
function RoleBadge({ role }) {
  const cfg = {
    superadmin: { label:'Super Admin', bg:'rgba(245,158,11,0.15)', color:'#F59E0B', border:'rgba(245,158,11,0.3)' },
    admin:      { label:'Admin',       bg:'rgba(124,58,237,0.15)', color:'#A78BFA', border:'rgba(124,58,237,0.3)' },
    staff:      { label:'Staff',       bg:'rgba(16,185,129,0.12)', color:'#34D399', border:'rgba(16,185,129,0.25)' },
  }[role] || { label: role, bg:'var(--bg-elevated)', color:'var(--text-muted)', border:'var(--border)' }
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, whiteSpace:'nowrap' }}>
      {cfg.label}
    </span>
  )
}

// ─── PIN Pad ──────────────────────────────────────────────────────
// PinPad removed — replaced by Supabase email/password auth (AuthScreens.jsx)
function _PinPad_REMOVED({ title, subtitle, onSuccess, correctPin, onBack }) {
  const [pin, setPin] = useState('')
  const [err, setErr] = useState(false)
  const tap = (d) => {
    if (d === '⌫') { setPin(p => p.slice(0,-1)); setErr(false); return }
    if (d === '') return
    if (pin.length >= 4) return
    const np = pin + d
    setPin(np)
    setErr(false)
    if (np.length === 4) {
      setTimeout(() => {
        if (np === correctPin) onSuccess()
        else { setErr(true); setPin('') }
      }, 200)
    }
  }
  return (
    <div className="animate-in" style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      {onBack && <button className="back-btn" style={{ alignSelf:'flex-start', marginBottom:16 }} onClick={onBack}>← Back</button>}
      <div style={{ width:52,height:52,borderRadius:16,background:'var(--brand-dim)',border:'1.5px solid rgba(124,58,237,0.3)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="var(--brand-light)" strokeWidth="1.8"/><path d="M8 11V7a4 4 0 018 0v4" stroke="var(--brand-light)" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="var(--brand-light)"/></svg>
      </div>
      <div style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:28, textAlign:'center' }}>{subtitle}</div>
      <div style={{ display:'flex', gap:14, marginBottom:8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width:16,height:16,borderRadius:'50%',background:pin.length>i?(err?'var(--danger)':'var(--brand-light)'):'var(--bg-elevated)',border:`2px solid ${pin.length>i?(err?'var(--danger)':'var(--brand)'):'var(--border-strong)'}`,transition:'all 0.15s'}}/>
        ))}
      </div>
      {err && <div style={{ fontSize:13,color:'var(--danger)',marginBottom:8,fontWeight:500 }}>Incorrect PIN. Try again.</div>}
      <div style={{ height: err ? 0 : 24 }} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, width:'100%', maxWidth:260 }}>
        {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((d,i) => (
          <div key={i} onClick={() => tap(String(d))}
            style={{ height:64,borderRadius:16,background:d===''?'transparent':d==='⌫'?'var(--bg-elevated)':'var(--bg-card)',border:d===''?'none':'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:600,cursor:d===''?'default':'pointer',color:d==='⌫'?'var(--text-secondary)':'var(--text-primary)' }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ marginTop:20, fontSize:12, color:'var(--text-muted)' }}>Default PIN: 1234</div>
    </div>
  )
}

// ─── Login Screen ─────────────────────────────────────────────────
// Old PIN LoginScreen removed — replaced by AuthScreens.jsx
function _LoginScreen_REMOVED({ members, onLogin }) {
  const [step, setStep] = useState('role') // role | superadmin-pin | admin-select | admin-pin | staff-select
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const adminMembers = members.filter(m => m.role === 'admin')
  const staffMembers = members.filter(m => m.role === 'staff')

  return (
    <div className="screen animate-in" style={{ display:'flex', flexDirection:'column', height:'100%', paddingBottom:0 }}>
      <div style={{ padding:'28px 28px 0', textAlign:'center' }}>
        <div style={{ width:72,height:72,borderRadius:22,background:'linear-gradient(135deg,#7C3AED,#06B6D4)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',boxShadow:'0 12px 32px rgba(124,58,237,0.4)' }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="4" y="8" width="28" height="22" rx="3" stroke="white" strokeWidth="2"/><path d="M4 14h28" stroke="white" strokeWidth="2"/><path d="M10 20h6M10 24h4M20 20h6M20 24h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 4l4 4 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div style={{ fontSize:26, fontWeight:800, letterSpacing:-0.8 }}>HostelKhata</div>
        <div style={{ fontSize:14, color:'var(--text-muted)', marginTop:4 }}>Daily expense tracking</div>
      </div>

      <div style={{ flex:1, padding:'28px 24px 24px', display:'flex', flexDirection:'column', overflowY:'auto' }}>

        {step === 'role' && (
          <div className="animate-in">
            <div style={{ fontSize:18, fontWeight:700, textAlign:'center', marginBottom:6 }}>Who are you?</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', textAlign:'center', marginBottom:24 }}>Select your role to continue</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {/* Super Admin */}
              <div onClick={() => setStep('superadmin-pin')} style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(251,146,60,0.08))',border:'1.5px solid rgba(245,158,11,0.3)',borderRadius:'var(--radius-lg)',padding:'18px',display:'flex',alignItems:'center',gap:14,cursor:'pointer' }}>
                <div style={{ width:50,height:50,borderRadius:15,background:'rgba(245,158,11,0.15)',border:'1.5px solid rgba(245,158,11,0.35)',display:'flex',alignItems:'center',justifyContent:'center' }}><IconStar size={22} color="#F59E0B"/></div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700 }}>Super Admin</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Full control · Manage roles · All reports</div>
                </div>
                <IconArrowRight size={16} color="var(--text-muted)" />
              </div>
              {/* Admin */}
              {adminMembers.length > 0 && (
                <div onClick={() => setStep('admin-select')} style={{ background:'var(--bg-card)',border:'1.5px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'18px',display:'flex',alignItems:'center',gap:14,cursor:'pointer' }}>
                  <div style={{ width:50,height:50,borderRadius:15,background:'var(--brand-dim)',border:'1.5px solid rgba(124,58,237,0.3)',display:'flex',alignItems:'center',justifyContent:'center' }}><IconShield size={22} color="#A78BFA"/></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:700 }}>Admin</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Give advances · Approve · Reports</div>
                  </div>
                  <span style={{ fontSize:11,color:'var(--text-muted)',background:'var(--bg-elevated)',padding:'3px 8px',borderRadius:99 }}>{adminMembers.length}</span>
                  <IconArrowRight size={16} color="var(--text-muted)" />
                </div>
              )}
              {/* Staff */}
              <div onClick={() => setStep('staff-select')} style={{ background:'var(--bg-card)',border:'1.5px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'18px',display:'flex',alignItems:'center',gap:14,cursor:'pointer' }}>
                <div style={{ width:50,height:50,borderRadius:15,background:'rgba(16,185,129,0.12)',border:'1.5px solid rgba(16,185,129,0.25)',display:'flex',alignItems:'center',justifyContent:'center' }}><IconHardhat size={22} color="#34D399"/></div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700 }}>Staff Member</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Log expenses · View my balance</div>
                </div>
                <span style={{ fontSize:11,color:'var(--text-muted)',background:'var(--bg-elevated)',padding:'3px 8px',borderRadius:99 }}>{staffMembers.length}</span>
                <IconArrowRight size={16} color="var(--text-muted)" />
              </div>
            </div>
            <div style={{ marginTop:28, textAlign:'center', fontSize:12, color:'var(--text-muted)' }}>v2.0 · HostelKhata</div>
          </div>
        )}

        {step === 'superadmin-pin' && (
          <PinPad
            title="Super Admin"
            subtitle="Enter your 4-digit PIN"
            correctPin={SUPER_ADMIN_PIN}
            onBack={() => setStep('role')}
            onSuccess={() => onLogin({ id: 0, name: 'Vicky', initials:'VY', color:'#F59E0B', role:'superadmin' })}
          />
        )}

        {step === 'admin-select' && (
          <div className="animate-in">
            <button className="back-btn" style={{ marginBottom:16 }} onClick={() => setStep('role')}>← Back</button>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>Select Admin Account</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>Choose your name, then enter PIN</div>
            <div className="member-select-list">
              {adminMembers.map(m => (
                <div key={m.id} className="member-select-row" onClick={() => { setSelectedAdmin(m); setStep('admin-pin') }}>
                  <div className="avatar avatar-sm" style={{ background:m.color }}>{m.initials}</div>
                  <div style={{ flex:1 }}><div style={{ fontSize:15,fontWeight:600 }}>{m.name}</div><div style={{ fontSize:12,color:'var(--text-muted)' }}>{m.phone}</div></div>
                  <IconArrowRight size={16} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'admin-pin' && selectedAdmin && (
          <PinPad
            title={selectedAdmin.name}
            subtitle="Enter your 4-digit Admin PIN"
            correctPin={SUPER_ADMIN_PIN}
            onBack={() => { setStep('admin-select'); setSelectedAdmin(null) }}
            onSuccess={() => onLogin({ ...selectedAdmin, role:'admin' })}
          />
        )}

        {step === 'staff-select' && (
          <div className="animate-in">
            <button className="back-btn" style={{ marginBottom:16 }} onClick={() => setStep('role')}>← Back</button>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>Select Your Name</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>Tap your name to log in</div>
            <div className="member-select-list">
              {staffMembers.length === 0 && (
                <div style={{ textAlign:'center',padding:'32px 0',color:'var(--text-muted)',fontSize:14 }}>No staff added yet.<br/>Ask admin to add your account first.</div>
              )}
              {staffMembers.map(m => (
                <div key={m.id} className={`member-select-row ${selectedStaff===m.id?'selected':''}`}
                  onClick={() => { setSelectedStaff(m.id); setTimeout(() => onLogin({...m,role:'staff'}), 200) }}>
                  <div className="avatar avatar-sm" style={{ background:m.color }}>{m.initials}</div>
                  <div style={{ flex:1 }}><div style={{ fontSize:15,fontWeight:600 }}>{m.name}</div><div style={{ fontSize:12,color:'var(--text-muted)' }}>{m.phone}</div></div>
                  {selectedStaff===m.id ? <IconCheck size={18} color="var(--brand-light)"/> : <IconArrowRight size={16} color="var(--text-muted)"/>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel='Delete', confirmDanger=true, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--bg-card)',borderRadius:24,padding:'28px 24px',margin:'auto 24px',border:'1px solid var(--border)' }}>
        <div style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>{title}</div>
        <div style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:24 }}>{message}</div>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={onCancel} style={{ flex:1,height:48,borderRadius:14,background:'var(--bg-elevated)',border:'1px solid var(--border)',color:'var(--text-secondary)',fontSize:15,fontWeight:600,cursor:'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1,height:48,borderRadius:14,background:confirmDanger?'rgba(244,63,94,0.15)':'var(--brand-dim)',border:`1px solid ${confirmDanger?'rgba(244,63,94,0.35)':'rgba(124,58,237,0.35)'}`,color:confirmDanger?'var(--danger)':'var(--brand-light)',fontSize:15,fontWeight:700,cursor:'pointer' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Transaction Action Menu ──────────────────────────────────────
function TxnActionMenu({ txn, onEdit, onDelete, onApprove, canEdit, canApprove, onClose }) {
  const isPending = txn.status === 'pending'
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--bg-card)',borderRadius:24,margin:'auto 16px',border:'1px solid var(--border)',overflow:'hidden' }}>
        <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Transaction</div>
          <div style={{ fontSize:16, fontWeight:700, marginTop:4 }}>{txn.note}</div>
          <div style={{ fontSize:14, color:'var(--text-muted)', marginTop:2 }}>{formatCurrency(txn.amount)} · {txn.type}</div>
        </div>
        {canApprove && isPending && (
          <div onClick={onApprove} style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:14, cursor:'pointer', borderBottom:'1px solid var(--border)', color:'var(--success)' }}>
            <div style={{ width:36,height:36,borderRadius:11,background:'rgba(16,185,129,0.12)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <IconCheck size={18} color="#10B981"/>
            </div>
            <span style={{ fontSize:15, fontWeight:600 }}>Approve</span>
          </div>
        )}
        {canEdit && (
          <div onClick={onEdit} style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:14, cursor:'pointer', borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:36,height:36,borderRadius:11,background:'var(--brand-dim)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M13 2.5l2.5 2.5-9 9L4 15l.5-2.5 8.5-10z" stroke="var(--brand-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontSize:15, fontWeight:600 }}>Edit Transaction</span>
          </div>
        )}
        {canEdit && (
          <div onClick={onDelete} style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:14, cursor:'pointer', color:'var(--danger)' }}>
            <div style={{ width:36,height:36,borderRadius:11,background:'rgba(244,63,94,0.1)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M7 5V3.5A1.5 1.5 0 018.5 2h1A1.5 1.5 0 0111 3.5V5M14 5l-.8 9.5A1.5 1.5 0 0111.7 16H6.3a1.5 1.5 0 01-1.5-1.5L4 5" stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontSize:15, fontWeight:600 }}>Delete Transaction</span>
          </div>
        )}
        <div onClick={onClose} style={{ padding:'14px 20px', textAlign:'center', color:'var(--text-muted)', fontSize:15, fontWeight:600, cursor:'pointer' }}>Cancel</div>
      </div>
    </div>
  )
}

// ─── Edit Transaction Modal ───────────────────────────────────────
function EditTransactionModal({ txn, members, onClose, onSave }) {
  const [amount, setAmount] = useState(String(txn.amount))
  const [note, setNote] = useState(txn.note || '')
  const [category, setCategory] = useState(txn.category || 'other')
  const [status, setStatus] = useState(txn.status)
  const m = members.find(m => m.id === txn.memberId)
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-title">
          <span>Edit Transaction</span>
          <div className="icon-btn" onClick={onClose}><IconClose size={18} color="#94A3B8"/></div>
        </div>
        {m && (
          <div style={{ display:'flex',alignItems:'center',gap:10,background:'var(--bg-elevated)',borderRadius:12,padding:'10px 14px',marginBottom:16 }}>
            <div className="avatar avatar-sm" style={{ background:m.color }}>{m.initials}</div>
            <div><div style={{ fontSize:14,fontWeight:600 }}>{m.name}</div><div style={{ fontSize:11,color:'var(--text-muted)' }}>{txn.type === 'advance' ? 'Advance' : 'Expense'} · {formatDate(txn.date)}</div></div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Amount</label>
          <div className="amount-input-wrap"><span className="amount-prefix">₹</span>
            <input className="form-input amount-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} autoFocus/>
          </div>
        </div>
        {txn.type === 'expense' && (
          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-chips">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className={`category-chip ${category===cat.id?'selected':''}`}
                  style={category===cat.id?{borderColor:cat.color,color:cat.color}:{}}
                  onClick={() => setCategory(cat.id)}>
                  <CategoryIcon id={cat.id} size={13} color={category===cat.id?cat.color:'#94A3B8'}/>{cat.label}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Note</label>
          <input className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="Description..."/>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <div style={{ display:'flex',gap:10 }}>
            {['approved','pending'].map(s => (
              <div key={s} onClick={() => setStatus(s)} style={{ flex:1,padding:'10px 12px',borderRadius:12,background:status===s?(s==='approved'?'rgba(16,185,129,0.12)':'rgba(245,158,11,0.1)'):'var(--bg-elevated)',border:`1.5px solid ${status===s?(s==='approved'?'rgba(16,185,129,0.4)':'rgba(245,158,11,0.4)'):'var(--border)'}`,cursor:'pointer',textAlign:'center',transition:'all 0.15s' }}>
                <div style={{ fontSize:13,fontWeight:600,color:status===s?(s==='approved'?'var(--success)':'var(--warning)'):'var(--text-secondary)' }}>
                  {s==='approved' ? <><IconCheck size={12} color='var(--success)'/> Approved</> : <><IconClock size={12} color='var(--warning)'/> Pending</>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="btn-primary" disabled={!amount} onClick={() => { onSave({ ...txn, amount:parseFloat(amount)||txn.amount, note:note.trim()||txn.note, category, status }); onClose() }}>
          Save Changes
        </button>
      </div>
    </div>
  )
}

// ─── Add / Edit Member Modal ──────────────────────────────────────
function AddMemberModal({ onClose, onSave, onDelete, existingMember, currentUserRole }) {
  const [name,    setName]    = useState(existingMember?.name  || '')
  const [phone,   setPhone]   = useState(existingMember?.phone || '')
  const [email,   setEmail]   = useState('')
  const [password,setPassword]= useState('')
  const [role,    setRole]    = useState(existingMember?.role  || 'staff')
  const [color,   setColor]   = useState(existingMember?.color || COLORS[0])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState('')

  const initials     = makeInitials(name)
  const isSuperAdmin = currentUserRole === 'superadmin'
  const isNew        = !existingMember
  // Only superadmin can create/assign admin or superadmin roles.
  // Non-superadmin (admins) can only create staff accounts.
  const roleOptions  = isSuperAdmin
    ? [{id:'staff',label:'Staff',desc:'Log expenses'},{id:'admin',label:'Admin',desc:'Give advances & approve'},{id:'superadmin',label:'Super Admin',desc:'Full control'}]
    : [{id:'staff',label:'Staff',desc:'Log expenses'}]

  const handleSave = async () => {
    if (!name.trim()) { setErr('Name is required'); return }
    if (isNew && (!email.trim() || !password)) { setErr('Email and password required for new member'); return }
    if (isNew && password.length < 6) { setErr('Password must be at least 6 characters'); return }
    setSaving(true); setErr('')
    try {
      await onSave({ name:name.trim(), phone:phone.trim(), role, color, initials,
                     email:email.trim().toLowerCase(), password, isNew })
      onClose()
    } catch(e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  if (confirmDelete) return (
    <ConfirmDialog
      title="Remove Member"
      message={`Remove ${existingMember?.name}? Their transaction history is kept but they'll lose access.`}
      confirmLabel="Remove"
      onConfirm={() => { onDelete(existingMember.id); onClose() }}
      onCancel={() => setConfirmDelete(false)}
    />
  )

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-title">
          <span>{isNew ? 'Add Team Member' : 'Edit Member'}</span>
          <div className="icon-btn" onClick={onClose}><IconClose size={18} color="#94A3B8"/></div>
        </div>

        {/* Avatar preview */}
        <div style={{ display:'flex',justifyContent:'center',marginBottom:16 }}>
          <div style={{ width:64,height:64,borderRadius:20,background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#fff',boxShadow:`0 8px 24px ${color}55` }}>{initials}</div>
        </div>

        {err && <div style={{ background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.3)',borderRadius:10,padding:'10px 14px',fontSize:13,color:'var(--danger)',marginBottom:12,display:'flex',alignItems:'center',gap:6 }}><IconWarning size={14} color="var(--danger)"/>{err}</div>}

        {/* Color */}
        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
            {COLORS.map(c => <div key={c} onClick={() => setColor(c)} style={{ width:32,height:32,borderRadius:10,background:c,cursor:'pointer',border:color===c?'3px solid white':'2px solid transparent',boxSizing:'border-box',transition:'all 0.15s',boxShadow:color===c?`0 0 0 2px ${c}`:'none' }}/>)}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" placeholder="e.g. Ramesh Patel" value={name} onChange={e => setName(e.target.value)} autoFocus/>
        </div>

        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-input" placeholder="98765 43210" value={phone} onChange={e => setPhone(e.target.value)} type="tel"/>
        </div>

        {/* Email + Password only for NEW members */}
        {isNew && (
          <>
            <div className="form-group">
              <label className="form-label">Email * <span style={{ color:'var(--text-muted)',fontWeight:400,fontSize:11 }}>(they'll use this to log in)</span></label>
              <input className="form-input" placeholder="staff@example.com" value={email} onChange={e => setEmail(e.target.value)} type="email"/>
            </div>
            <div className="form-group">
              <label className="form-label">Temporary Password * <span style={{ color:'var(--text-muted)',fontWeight:400,fontSize:11 }}>(min 6 chars)</span></label>
              <input className="form-input" placeholder="They can change it later" value={password} onChange={e => setPassword(e.target.value)} type="password"/>
            </div>
          </>
        )}

        {/* Role */}
        <div className="form-group">
          <label className="form-label">Role</label>
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {roleOptions.map(r => (
              <div key={r.id} onClick={() => setRole(r.id)}
                style={{ padding:'12px 14px',borderRadius:12,background:role===r.id?'var(--brand-dim)':'var(--bg-elevated)',border:`1.5px solid ${role===r.id?'var(--brand-light)':'var(--border)'}`,cursor:'pointer',transition:'all 0.15s',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:14,fontWeight:600,color:role===r.id?'var(--brand-light)':'var(--text-primary)' }}>{r.label}</div>
                  <div style={{ fontSize:11,color:'var(--text-muted)',marginTop:1 }}>{r.desc}</div>
                </div>
                {role===r.id && <IconCheck size={16} color="var(--brand-light)"/>}
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={saving || !name.trim()}>
          {saving ? 'Saving…' : isNew ? 'Create Account' : 'Save Changes'}
        </button>

        {!isNew && onDelete && (
          <button onClick={() => setConfirmDelete(true)}
            style={{ width:'100%',height:44,borderRadius:14,background:'transparent',border:'none',color:'var(--danger)',fontSize:14,fontWeight:600,cursor:'pointer',marginTop:8 }}>
            Remove Member
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Bottom Nav ───────────────────────────────────────────────────
function BottomNav({ screen, onChange, pendingCount, userRole }) {
  const isStaff = userRole === 'staff'
  const tabs = isStaff
    ? [
        { id:'dashboard', label:'Home',     Icon:IconDashboard },
        { id:'ledger',    label:'Ledger',   Icon:IconLedger },
        { id:'activity',  label:'Activity', Icon:IconActivity },
      ]
    : [
        { id:'dashboard', label:'Home',     Icon:IconDashboard },
        { id:'team',      label:'Team',     Icon:IconTeam },
        { id:'ledger',    label:'Ledger',   Icon:IconLedger },
        { id:'activity',  label:'Activity', Icon:IconActivity },
        { id:'reports',   label:'Reports',  Icon:IconReports },
      ]
  return (
    <div className="bottom-nav">
      {tabs.map(({id,label,Icon}) => (
        <div key={id} className={`nav-item ${screen===id?'active':''}`} onClick={() => onChange(id)}>
          <Icon size={22} color={screen===id?'#A78BFA':'#475569'}/>
          <span className="nav-label">{label}{id==='ledger'&&pendingCount>0&&<span className="badge">{pendingCount}</span>}</span>
          {screen===id&&<div className="nav-dot"/>}
        </div>
      ))}
    </div>
  )
}

// ─── Give Advance Modal ───────────────────────────────────────────
function GiveAdvanceModal({ members, onClose, onSubmit }) {
  const [memberId, setMemberId] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const staffMembers = members.filter(m => m.role !== 'superadmin')
  const canSubmit = memberId && amount && parseFloat(amount) > 0

  const fmtQuick = (v) => v >= 1000 ? `₹${v/1000}k` : `₹${v}`

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-title"><span>Give Advance</span><div className="icon-btn" onClick={onClose}><IconClose size={18} color="#94A3B8"/></div></div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount *</label>
          <div className="amount-input-wrap"><span className="amount-prefix">₹</span>
            <input className="form-input amount-input" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} autoFocus/>
          </div>
          <div style={{ display:'flex',gap:6,marginTop:10 }}>
            {[500,1000,1500,2000,2500,3000].map(v => (
              <div key={v} onClick={() => setAmount(String(v))}
                style={{ flex:1,padding:'7px 0',borderRadius:10,background:amount===String(v)?'var(--brand-dim)':'var(--bg-elevated)',border:`1px solid ${amount===String(v)?'rgba(124,58,237,0.4)':'var(--border)'}`,textAlign:'center',fontSize:11,fontWeight:700,cursor:'pointer',color:amount===String(v)?'var(--brand-light)':'var(--text-secondary)',transition:'all 0.15s' }}>
                {fmtQuick(v)}
              </div>
            ))}
          </div>
        </div>

        {/* Member select — fixed height so button always visible */}
        <div className="form-group">
          <label className="form-label">Select Member *</label>
          <div style={{ maxHeight:200, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
            {staffMembers.map(m => (
              <div key={m.id} className={`member-select-row ${memberId===m.id?'selected':''}`} onClick={() => setMemberId(m.id)}>
                <div className="avatar avatar-sm" style={{ background:m.color }}>{m.initials}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:600 }}>{m.name}</div>
                  <div style={{ fontSize:11,color:'var(--text-muted)' }}>{m.phone}</div>
                </div>
                {memberId===m.id
                  ? <IconCheck size={18} color="var(--brand-light)"/>
                  : <div style={{ width:18,height:18,borderRadius:'50%',border:'2px solid var(--border)' }}/>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="form-group">
          <label className="form-label">Note (optional)</label>
          <input className="form-input" placeholder="e.g. For vegetables today" value={note} onChange={e => setNote(e.target.value)}/>
        </div>

        {/* Helper hint when disabled */}
        {!canSubmit && (
          <div style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', marginBottom:8, padding:'8px', background:'var(--bg-elevated)', borderRadius:10 }}>
            {!amount ? 'Enter an amount above' : 'Select a team member above'}
          </div>
        )}

        <button className="btn-primary" disabled={!canSubmit}
          onClick={() => { onSubmit({ memberId, amount:parseFloat(amount), note:note||'Cash advance' }); onClose() }}>
          Give {amount ? `₹${parseFloat(amount).toLocaleString('en-IN')}` : '₹0'} Advance
        </button>
      </div>
    </div>
  )
}

// ─── Add Expense Modal ────────────────────────────────────────────
function AddExpenseModal({ members, onClose, onSubmit, defaultMemberId }) {
  const [memberId, setMemberId] = useState(defaultMemberId || null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [note, setNote] = useState('')
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-title"><span>Add Expense</span><div className="icon-btn" onClick={onClose}><IconClose size={18} color="#94A3B8"/></div></div>
        <div className="form-group">
          <label className="form-label">Amount Spent</label>
          <div className="amount-input-wrap"><span className="amount-prefix">₹</span>
            <input className="form-input amount-input" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} autoFocus/>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-chips">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className={`category-chip ${category===cat.id?'selected':''}`}
                style={category===cat.id?{borderColor:cat.color,color:cat.color}:{}}
                onClick={() => setCategory(cat.id)}>
                <CategoryIcon id={cat.id} size={14} color={category===cat.id?cat.color:'#94A3B8'}/>{cat.label}
              </div>
            ))}
          </div>
        </div>
        {!defaultMemberId && (
          <div className="form-group">
            <label className="form-label">Team Member</label>
            <select className="form-input" value={memberId||''} onChange={e => setMemberId(e.target.value)}>
              <option value="">Select member...</option>
              {members.filter(m => m.role!=='superadmin').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">What was bought?</label>
          <input className="form-input" placeholder="e.g. Tomatoes, onions from market" value={note} onChange={e => setNote(e.target.value)}/>
        </div>
        <button className="btn-primary" disabled={!memberId||!amount} onClick={() => { onSubmit({memberId:memberId,amount:parseFloat(amount),category,note:note||'Purchase'}); onClose() }}>
          Log ₹{amount||'0'} Expense
        </button>
      </div>
    </div>
  )
}

// ─── Member Detail Modal ──────────────────────────────────────────
function MemberDetailModal({ member, transactions, onClose, onGiveAdvance, currentUser, onEditMember }) {
  const memberTxns = transactions.filter(t => t.memberId===member.id).sort((a,b) => new Date(b.date)-new Date(a.date))
  const { remaining: balance } = getMemberBalance(member.id, transactions)
  const totalAdv = memberTxns.filter(t => t.type==='advance').reduce((s,t) => s+Number(t.amount), 0)
  const totalExp = memberTxns.filter(t => t.type==='expense').reduce((s,t) => s+Number(t.amount), 0)
  const canAdmin = canDo(currentUser, 'give_advance')
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ maxHeight:'92%' }}>
        <div className="modal-handle"/>
        <div className="modal-title">
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span>{member.name}</span>
            <RoleBadge role={member.role}/>
          </div>
          <div style={{ display:'flex',gap:8 }}>
            {canDo(currentUser,'edit_member') && (
              <div className="icon-btn" onClick={onEditMember} style={{ color:'var(--text-muted)',fontSize:13,fontWeight:600 }}>Edit</div>
            )}
            <div className="icon-btn" onClick={onClose}><IconClose size={18} color="#94A3B8"/></div>
          </div>
        </div>
        <div style={{ background:'var(--bg-elevated)',borderRadius:'var(--radius-md)',padding:16,marginBottom:20 }}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px' }}>Balance</div>
              <div style={{ fontSize:28,fontWeight:800,letterSpacing:-1,color:balance>=0?'var(--success)':'var(--danger)' }}>{balance>=0?'+':''}{formatCurrency(balance)}</div>
            </div>
            <div className="avatar" style={{ background:member.color,width:52,height:52,borderRadius:16,fontSize:16 }}>{member.initials}</div>
          </div>
          <div style={{ display:'flex',gap:20 }}>
            <div><div style={{ fontSize:11,color:'rgba(255,255,255,0.4)' }}>Given</div><div style={{ fontSize:15,fontWeight:700,color:'var(--cyan)' }}>{formatCurrency(totalAdv)}</div></div>
            <div><div style={{ fontSize:11,color:'rgba(255,255,255,0.4)' }}>Spent</div><div style={{ fontSize:15,fontWeight:700,color:'var(--danger)' }}>{formatCurrency(totalExp)}</div></div>
            <div><div style={{ fontSize:11,color:'rgba(255,255,255,0.4)' }}>Txns</div><div style={{ fontSize:15,fontWeight:700,color:'var(--text-secondary)' }}>{memberTxns.length}</div></div>
          </div>
        </div>
        {canAdmin && <button className="btn-primary" style={{ marginBottom:20 }} onClick={() => { onClose(); onGiveAdvance() }}>Give More Advance</button>}
        <div style={{ fontSize:13,fontWeight:600,color:'var(--text-muted)',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.5px' }}>All Transactions</div>
        <div className="txn-list">
          {memberTxns.map(t => {
            const cat = CATEGORIES.find(c => c.id===t.category)
            const isAdv = t.type==='advance'
            return (
              <div key={t.id} className="txn-row">
                <div className="txn-icon" style={{ background:isAdv?'var(--success-dim)':(cat?cat.color+'22':'var(--brand-dim)') }}>
                  {isAdv ? <IconAdvance size={16} color="#10B981"/> : <CategoryIcon id={t.category} size={16} color={cat?.color||'#7C3AED'}/>}
                </div>
                <div className="txn-body">
                  <div style={{ fontSize:14,fontWeight:600 }}>{t.note}</div>
                  <div style={{ fontSize:11,color:'var(--text-muted)' }}>{formatDate(t.date)}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:15,fontWeight:700,color:isAdv?'var(--cyan)':'var(--danger)' }}>{isAdv?'+':'-'}{formatCurrency(t.amount)}</div>
                  {t.status==='pending' && <div style={{ fontSize:10,color:'var(--warning)',fontWeight:600 }}>PENDING</div>}
                </div>
              </div>
            )
          })}
          {memberTxns.length===0 && <div style={{ textAlign:'center',padding:'24px 0',color:'var(--text-muted)',fontSize:14 }}>No transactions yet</div>}
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────
function Dashboard({ state, currentUser, onGiveAdvance, onAddExpense, onMemberDetail, setScreen }) {
  const { transactions, members } = state
  const { totalAdvanced, totalSpent, remaining } = getTodayStats(transactions)
  const pendingCount = transactions.filter(t => t.status==='pending').length
  const today = transactions.filter(t => new Date(t.date).toDateString()===new Date().toDateString())
  const isAdmin = canDo(currentUser,'give_advance')
  const recentAll = [...transactions].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,5)

  return (
    <div className="screen animate-in">
      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
        <div>
          <div style={{ fontSize:13,color:'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
          </div>
          <div style={{ fontSize:22,fontWeight:800,letterSpacing:-0.5,marginTop:2 }}>
            Welcome, {currentUser?.name?.split(' ')[0] || 'Admin'}
          </div>
        </div>
      </div>

      {/* Hero Balance Card */}
      <div className="hero-card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
          <div>
            <div style={{ fontSize:12,color:'rgba(255,255,255,0.55)',letterSpacing:'0.5px',textTransform:'uppercase',marginBottom:4 }}>Today's Balance</div>
            <div style={{ fontSize:38,fontWeight:900,letterSpacing:-1.5,color:remaining>=0?'#fff':'#FCA5A5' }}>{formatCurrency(remaining)}</div>
            <div style={{ fontSize:13,color:'rgba(255,255,255,0.55)',marginTop:4 }}>{remaining>=0?'Remaining to spend':'Over budget'}</div>
          </div>
          <div style={{ width:48,height:48,borderRadius:14,background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <IconWallet size={22} color="white"/>
          </div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
          <div style={{ background:'rgba(0,0,0,0.2)',borderRadius:14,padding:'12px 14px' }}>
            <div style={{ fontSize:11,color:'rgba(255,255,255,0.5)' }}>Given Today</div>
            <div style={{ fontSize:20,fontWeight:800,color:'#6EE7B7' }}>{formatCurrency(totalAdvanced)}</div>
          </div>
          <div style={{ background:'rgba(0,0,0,0.2)',borderRadius:14,padding:'12px 14px' }}>
            <div style={{ fontSize:11,color:'rgba(255,255,255,0.5)' }}>Spent Today</div>
            <div style={{ fontSize:20,fontWeight:800,color:'#FCA5A5' }}>{formatCurrency(totalSpent)}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {isAdmin && (
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20 }}>
          <div className="action-card cyan" onClick={onGiveAdvance}>
            <div className="action-icon"><IconAdvance size={20} color="#06B6D4"/></div>
            <div style={{ fontSize:14,fontWeight:700 }}>Give Advance</div>
            <div style={{ fontSize:11,color:'var(--text-muted)' }}>Cash advance</div>
          </div>
          <div className="action-card purple" onClick={onAddExpense}>
            <div className="action-icon"><IconExpense size={20} color="#A78BFA"/></div>
            <div style={{ fontSize:14,fontWeight:700 }}>Add Expense</div>
            <div style={{ fontSize:11,color:'var(--text-muted)' }}>Log expense</div>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div style={{ marginBottom:20 }}>
          <div className="action-card purple" onClick={onAddExpense} style={{ maxWidth:'50%' }}>
            <div className="action-icon"><IconExpense size={20} color="#A78BFA"/></div>
            <div style={{ fontSize:14,fontWeight:700 }}>Add Expense</div>
            <div style={{ fontSize:11,color:'var(--text-muted)' }}>Log expense</div>
          </div>
        </div>
      )}

      {/* Pending Alert */}
      {pendingCount > 0 && isAdmin && (
        <div onClick={() => setScreen('ledger')} style={{ background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:16,padding:'14px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:12,cursor:'pointer' }}>
          <div style={{ width:36,height:36,borderRadius:11,background:'rgba(245,158,11,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}><IconClock size={18} color="#F59E0B"/></div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14,fontWeight:700,color:'var(--warning)' }}>{pendingCount} Pending Approval{pendingCount>1?'s':''}</div>
            <div style={{ fontSize:12,color:'var(--text-muted)',marginTop:1 }}>Tap to review and approve</div>
          </div>
          <IconArrowRight size={16} color="var(--warning)"/>
        </div>
      )}

      {/* Staff balance card */}
      {!isAdmin && currentUser?.id && (
        <div style={{ background:'var(--bg-elevated)',borderRadius:16,padding:16,marginBottom:20 }}>
          <div style={{ fontSize:12,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:4 }}>My Balance</div>
          {(() => {
            const { remaining: bal } = getMemberBalance(currentUser.id, transactions)
            return <div style={{ fontSize:32,fontWeight:800,letterSpacing:-1,color:bal>=0?'var(--success)':'var(--danger)' }}>{bal>=0?'+':''}{formatCurrency(bal)}</div>
          })()}
        </div>
      )}

      {/* Team balances (admin only) */}
      {isAdmin && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
            <div style={{ fontSize:13,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px' }}>Team Overview</div>
            <div onClick={() => setScreen('team')} style={{ fontSize:12,color:'var(--brand-light)',cursor:'pointer',fontWeight:600 }}>View all</div>
          </div>
          <div style={{ display:'flex',gap:8,overflowX:'auto',paddingBottom:4 }}>
            {members.filter(m => m.role==='staff').slice(0,5).map(m => {
              const { remaining: bal } = getMemberBalance(m.id, transactions)
              return (
                <div key={m.id} onClick={() => onMemberDetail(m)} style={{ minWidth:100,background:'var(--bg-card)',borderRadius:16,padding:'12px 14px',border:'1px solid var(--border)',cursor:'pointer',flexShrink:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                    <div style={{ width:28,height:28,borderRadius:9,background:m.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff' }}>{m.initials}</div>
                    <div style={{ fontSize:12,fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:56 }}>{m.name.split(' ')[0]}</div>
                  </div>
                  <div style={{ fontSize:16,fontWeight:800,color:bal>=0?'var(--success)':'var(--danger)',letterSpacing:-0.5 }}>{bal>=0?'+':''}{formatCurrency(bal)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div style={{ fontSize:13,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:10 }}>Recent Activity</div>
        <div className="txn-list">
          {recentAll.map(t => {
            const m = members.find(x => x.id===t.memberId)
            const cat = CATEGORIES.find(c => c.id===t.category)
            const isAdv = t.type==='advance'
            return (
              <div key={t.id} className="txn-row">
                <div className="txn-icon" style={{ background:isAdv?'var(--success-dim)':(cat?cat.color+'22':'var(--brand-dim)') }}>
                  {isAdv ? <IconAdvance size={16} color="#10B981"/> : <CategoryIcon id={t.category} size={16} color={cat?.color||'#7C3AED'}/>}
                </div>
                <div className="txn-body">
                  <div style={{ fontSize:14,fontWeight:600 }}>{t.note}</div>
                  <div style={{ fontSize:11,color:'var(--text-muted)' }}>{m?.name} · {formatDate(t.date)}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:15,fontWeight:700,color:isAdv?'var(--cyan)':'var(--danger)' }}>{isAdv?'+':'-'}{formatCurrency(t.amount)}</div>
                  {t.status==='pending' && <span style={{ fontSize:10,color:'var(--warning)',fontWeight:700 }}>PENDING</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Team Screen ──────────────────────────────────────────────────
function Team({ state, currentUser, onMemberDetail, onEditMember, onAddMember }) {
  const { members, transactions } = state
  const isAdmin = canDo(currentUser,'edit_member')
  const isSuperAdmin = currentUser?.role==='superadmin'

  const groups = [
    { label:'Super Admins', role:'superadmin', color:'#F59E0B' },
    { label:'Admins', role:'admin', color:'#A78BFA' },
    { label:'Staff', role:'staff', color:'#34D399' },
  ]

  return (
    <div className="screen animate-in">
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div>
          <div style={{ fontSize:22,fontWeight:800,letterSpacing:-0.5 }}>Team</div>
          <div style={{ fontSize:13,color:'var(--text-muted)',marginTop:2 }}>{members.length} members</div>
        </div>
        {canDo(currentUser,'add_member') && (
          <button onClick={onAddMember} style={{ height:40,padding:'0 16px',borderRadius:14,background:'var(--brand-dim)',border:'1.5px solid rgba(124,58,237,0.4)',color:'var(--brand-light)',fontSize:14,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6 }}>
            <IconPlus size={16} color="var(--brand-light)"/> Add
          </button>
        )}
      </div>

      {groups.map(g => {
        const groupMembers = members.filter(m => m.role===g.role)
        if (groupMembers.length===0 && g.role!=='staff') return null
        return (
          <div key={g.role} style={{ marginBottom:24 }}>
            <div style={{ fontSize:11,fontWeight:700,color:g.color,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:10,padding:'0 2px' }}>
              {g.label} · {groupMembers.length}
            </div>
            {groupMembers.length===0 ? (
              <div style={{ background:'var(--bg-card)',borderRadius:16,padding:'16px',border:'1px dashed var(--border)',textAlign:'center',color:'var(--text-muted)',fontSize:13 }}>No {g.label.toLowerCase()} yet</div>
            ) : (
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                {groupMembers.map(m => {
                  const { remaining: bal } = getMemberBalance(m.id, transactions)
                  const txnCount = transactions.filter(t => t.memberId===m.id).length
                  return (
                    <div key={m.id} onClick={() => onMemberDetail(m)} className="member-card">
                      <div className="avatar" style={{ background:m.color,borderRadius:16,fontSize:15 }}>{m.initials}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:2 }}>
                          <div style={{ fontSize:15,fontWeight:700 }}>{m.name}</div>
                          <RoleBadge role={m.role}/>
                        </div>
                        <div style={{ fontSize:12,color:'var(--text-muted)' }}>{m.phone} · {txnCount} txns</div>
                        {m.role==='staff' && (
                          <div style={{ marginTop:6,height:4,borderRadius:99,background:'var(--bg-elevated)',overflow:'hidden' }}>
                            <div style={{ height:'100%',borderRadius:99,background:m.color,width:`${Math.min(100,Math.abs(bal)/100)}%`,transition:'width 0.4s' }}/>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign:'right',flexShrink:0 }}>
                        <div style={{ fontSize:16,fontWeight:800,color:bal>=0?'var(--success)':'var(--danger)' }}>{bal>=0?'+':''}{formatCurrency(bal)}</div>
                        {isAdmin && (
                          <div onClick={e => { e.stopPropagation(); onEditMember(m) }} style={{ fontSize:11,color:'var(--brand-light)',marginTop:4,cursor:'pointer',fontWeight:600 }}>Edit ›</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Ledger Screen ────────────────────────────────────────────────
function Ledger({ state, currentUser, onAddExpense, onTxnAction, onApproveTxn }) {
  const { transactions, members } = state
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const isAdmin = canDo(currentUser,'approve_expense')
  const viewAll = canDo(currentUser,'view_all_members')
  const canEdit = canDo(currentUser,'edit_transaction')

  let filtered = viewAll
    ? transactions
    : transactions.filter(t => t.memberId === currentUser?.id)

  if (filter==='advance')  filtered = filtered.filter(t => t.type==='advance')
  if (filter==='expense')  filtered = filtered.filter(t => t.type==='expense')
  if (filter==='pending')  filtered = filtered.filter(t => t.status==='pending')
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(t => {
      const m = members.find(x => x.id===t.memberId)
      return t.note?.toLowerCase().includes(q) || m?.name.toLowerCase().includes(q) || CATEGORIES.find(c => c.id===t.category)?.label.toLowerCase().includes(q)
    })
  }
  filtered = [...filtered].sort((a,b) => new Date(b.date)-new Date(a.date))

  // Group by date
  const groups = {}
  filtered.forEach(t => {
    const key = new Date(t.date).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })

  const pendingTxns = transactions.filter(t => t.status==='pending')
  const pendingCount = pendingTxns.length

  return (
    <div className="screen animate-in">
      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
        <div style={{ fontSize:22,fontWeight:800,letterSpacing:-0.5 }}>Ledger</div>
        {pendingCount>0 && isAdmin && (
          <div onClick={() => setFilter('pending')}
            style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(245,158,11,0.12)',border:'1.5px solid rgba(245,158,11,0.35)',borderRadius:99,padding:'5px 12px',cursor:'pointer' }}>
            <div style={{ width:7,height:7,borderRadius:'50%',background:'var(--warning)',boxShadow:'0 0 6px var(--warning)' }}/>
            <span style={{ fontSize:12,fontWeight:800,color:'var(--warning)' }}>{pendingCount} Pending</span>
          </div>
        )}
      </div>

      {/* Pending approval banner — only for admins when pending items exist */}
      {isAdmin && pendingCount > 0 && filter !== 'pending' && (
        <div onClick={() => setFilter('pending')}
          style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.06))',border:'1.5px solid rgba(245,158,11,0.3)',borderRadius:16,padding:'14px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:12,cursor:'pointer' }}>
          <div style={{ width:40,height:40,borderRadius:12,background:'rgba(245,158,11,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><IconClock size={20} color="#F59E0B"/></div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14,fontWeight:700,color:'var(--warning)' }}>{pendingCount} expense{pendingCount>1?'s':''} waiting for approval</div>
            <div style={{ fontSize:12,color:'var(--text-muted)',marginTop:2 }}>Tap to review and approve</div>
          </div>
          <div style={{ color:'var(--warning)',fontSize:18 }}>›</div>
        </div>
      )}

      {/* Search */}
      <div style={{ position:'relative',marginBottom:12 }}>
        <div style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)' }}><IconSearch size={16} color="#475569"/></div>
        <input className="form-input" style={{ paddingLeft:40,height:44 }} placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {/* Filter chips */}
      <div style={{ display:'flex',gap:8,marginBottom:20,overflowX:'auto',paddingBottom:2 }}>
        {[
          { id:'all',     label:'All' },
          { id:'advance', label:'Advances' },
          { id:'expense', label:'Expenses' },
          { id:'pending', label:`Pending${pendingCount>0?' ('+pendingCount+')':''}`, warn:true },
        ].map(f => (
          <div key={f.id} onClick={() => setFilter(f.id)}
            style={{ padding:'8px 16px',borderRadius:99,
              background: filter===f.id ? (f.warn?'var(--warning)':'var(--brand)') : 'var(--bg-elevated)',
              border:`1px solid ${filter===f.id?(f.warn?'var(--warning)':'var(--brand)'):'var(--border)'}`,
              color: filter===f.id ? (f.warn?'#000':'#fff') : (f.warn&&pendingCount>0?'var(--warning)':'var(--text-secondary)'),
              fontSize:13,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.15s' }}>
            {f.label}
          </div>
        ))}
      </div>

      {/* Transaction groups */}
      {Object.entries(groups).length===0 && (
        <div style={{ textAlign:'center',padding:'48px 0',color:'var(--text-muted)' }}>
          <div style={{ fontSize:40,marginBottom:12 }}>{filter==='pending' ? <IconCelebrate size={40} color="var(--text-muted)"/> : <IconClipboard size={40} color="var(--text-muted)"/>}</div>
          <div style={{ fontSize:16,fontWeight:600 }}>{filter==='pending'?'All caught up!':'No transactions found'}</div>
          {filter==='pending' && <div style={{ fontSize:13,color:'var(--text-muted)',marginTop:6 }}>No pending approvals</div>}
        </div>
      )}

      {Object.entries(groups).map(([dateKey, txns]) => {
        const d = new Date(dateKey)
        const isToday = d.toDateString()===new Date().toDateString()
        const isYest  = d.toDateString()===new Date(Date.now()-86400000).toDateString()
        const dayLabel = isToday ? 'Today' : isYest ? 'Yesterday' : d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'})
        const dayTotal = txns.filter(t => t.type==='expense').reduce((s,t) => s+Number(t.amount), 0)
        const dayPending = txns.filter(t => t.status==='pending').length
        return (
          <div key={dateKey} style={{ marginBottom:24 }}>
            {/* Date row */}
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <div style={{ fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px' }}>{dayLabel}</div>
                {dayPending>0 && isAdmin && (
                  <div style={{ fontSize:10,fontWeight:700,color:'#000',background:'var(--warning)',borderRadius:99,padding:'1px 7px' }}>{dayPending} pending</div>
                )}
              </div>
              {dayTotal>0 && <div style={{ fontSize:12,color:'var(--danger)',fontWeight:600 }}>-{formatCurrency(dayTotal)}</div>}
            </div>

            {/* Txn cards */}
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {txns.map((t) => {
                const m = members.find(x => x.id===t.memberId)
                const cat = CATEGORIES.find(c => c.id===t.category)
                const isAdv = t.type==='advance'
                const isPend = t.status==='pending'
                const canApprove = isAdmin && isPend

                return (
                  <div key={t.id}
                    style={{ background:isPend?'rgba(245,158,11,0.06)':'var(--bg-card)',borderRadius:16,border:`1.5px solid ${isPend?'rgba(245,158,11,0.25)':'var(--border)'}`,overflow:'hidden',transition:'border-color 0.2s' }}>

                    {/* Main row */}
                    <div style={{ display:'flex',alignItems:'center',gap:12,padding:'14px 14px',cursor:canEdit?'pointer':'default' }}
                      onClick={() => canEdit && onTxnAction(t)}>

                      <div className="txn-icon" style={{ background:isAdv?'var(--success-dim)':(cat?cat.color+'22':'var(--brand-dim)'),flexShrink:0 }}>
                        {isAdv ? <IconAdvance size={16} color="#10B981"/> : <CategoryIcon id={t.category} size={16} color={cat?.color||'#7C3AED'}/>}
                      </div>

                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:14,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{t.note}</div>
                        <div style={{ fontSize:11,color:'var(--text-muted)',marginTop:2,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' }}>
                          {viewAll && m && <span style={{ color:m.color,fontWeight:600 }}>{m.name.split(' ')[0]}</span>}
                          {viewAll && m && <span>·</span>}
                          <span>{formatDate(t.date)}</span>
                          {cat && !isAdv && <span style={{ color:cat.color,fontWeight:600 }}>#{cat.label}</span>}
                        </div>
                      </div>

                      <div style={{ textAlign:'right',flexShrink:0 }}>
                        <div style={{ fontSize:15,fontWeight:700,color:isAdv?'var(--cyan)':'var(--danger)' }}>{isAdv?'+':'-'}{formatCurrency(t.amount)}</div>
                        {isPend ? (
                          <div style={{ fontSize:10,color:'var(--warning)',fontWeight:700,marginTop:2 }}>AWAITING</div>
                        ) : (
                          <div style={{ fontSize:10,color:'var(--success)',fontWeight:600,marginTop:2,display:'flex',alignItems:'center',gap:2 }}><IconCheck size={10} color="var(--success)"/> APPROVED</div>
                        )}
                      </div>

                      {canEdit && (
                        <div style={{ width:28,height:28,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:18,marginLeft:2,flexShrink:0 }}>⋮</div>
                      )}
                    </div>

                    {/* Approve strip — only for admins on pending transactions */}
                    {canApprove && (
                      <div style={{ borderTop:'1px solid rgba(245,158,11,0.2)',display:'flex' }}>
                        <div onClick={() => onTxnAction(t)}
                          style={{ flex:1,padding:'10px 0',textAlign:'center',fontSize:12,fontWeight:600,color:'var(--text-muted)',cursor:'pointer',borderRight:'1px solid rgba(245,158,11,0.15)',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
                          Edit
                        </div>
                        <div onClick={e => { e.stopPropagation(); onApproveTxn(t.id) }}
                          style={{ flex:2,padding:'10px 0',textAlign:'center',fontSize:13,fontWeight:700,color:'var(--success)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:'rgba(16,185,129,0.06)',transition:'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(16,185,129,0.14)'}
                          onMouseLeave={e => e.currentTarget.style.background='rgba(16,185,129,0.06)'}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Approve ₹{Number(t.amount).toLocaleString('en-IN')}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* FAB */}
      <div className="fab" onClick={onAddExpense}><IconPlus size={24} color="white"/></div>
    </div>
  )
}

// ─── Reports Screen ───────────────────────────────────────────────
function Reports({ state, currentUser, onExport }) {
  const { transactions, members } = state
  const weekly = getWeeklyData(transactions)
  const catBreakdown = getCategoryBreakdown(transactions).map(c => ({ ...c, ...(CATEGORIES.find(x => x.id===c.id)||{label:c.id,color:'#64748B',icon:null}) }))
  const totalExpenses = transactions.filter(t => t.type==='expense'&&t.status!=='rejected').reduce((s,t) => s+Number(t.amount), 0)
  const totalAdvances = transactions.filter(t => t.type==='advance').reduce((s,t) => s+Number(t.amount), 0)
  const maxSpend = Math.max(...weekly.map(d => d.expenses), 1)
  const isSuperAdmin = currentUser?.role==='superadmin'

  const topSpenders = members
    .filter(m => m.role==='staff')
    .map(m => ({ ...m, spent: transactions.filter(t => t.memberId===m.id&&t.type==='expense').reduce((s,t) => s+Number(t.amount),0) }))
    .sort((a,b) => b.spent-a.spent)
    .slice(0,5)

  return (
    <div className="screen animate-in">
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div style={{ fontSize:22,fontWeight:800,letterSpacing:-0.5 }}>Reports</div>
        {onExport && (
          <div onClick={onExport} style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:12,padding:'8px 14px',cursor:'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M1 10v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="#34D399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontSize:13,fontWeight:700,color:'#34D399' }}>Export CSV</span>
          </div>
        )}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20 }}>
        <div style={{ background:'rgba(6,182,212,0.08)',border:'1px solid rgba(6,182,212,0.2)',borderRadius:16,padding:16 }}>
          <div style={{ fontSize:11,color:'var(--text-muted)' }}>Total Advances</div>
          <div style={{ fontSize:22,fontWeight:800,color:'var(--cyan)',marginTop:4 }}>{formatCurrency(totalAdvances)}</div>
        </div>
        <div style={{ background:'rgba(244,63,94,0.08)',border:'1px solid rgba(244,63,94,0.2)',borderRadius:16,padding:16 }}>
          <div style={{ fontSize:11,color:'var(--text-muted)' }}>Total Expenses</div>
          <div style={{ fontSize:22,fontWeight:800,color:'var(--danger)',marginTop:4 }}>{formatCurrency(totalExpenses)}</div>
        </div>
        <div style={{ background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:16,padding:16 }}>
          <div style={{ fontSize:11,color:'var(--text-muted)' }}>Net Balance</div>
          <div style={{ fontSize:22,fontWeight:800,color:'var(--success)',marginTop:4 }}>{formatCurrency(totalAdvances-totalExpenses)}</div>
        </div>
        <div style={{ background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.2)',borderRadius:16,padding:16 }}>
          <div style={{ fontSize:11,color:'var(--text-muted)' }}>Transactions</div>
          <div style={{ fontSize:22,fontWeight:800,color:'var(--brand-light)',marginTop:4 }}>{transactions.length}</div>
        </div>
      </div>

      {/* Weekly chart */}
      <div style={{ background:'var(--bg-card)',borderRadius:20,padding:20,marginBottom:20,border:'1px solid var(--border)' }}>
        <div style={{ fontSize:14,fontWeight:700,marginBottom:16 }}>7-Day Spending</div>
        <div style={{ display:'flex',alignItems:'flex-end',gap:6,height:100 }}>
          {weekly.map((d,i) => (
            <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
              <div style={{ width:'100%',borderRadius:'6px 6px 0 0',background:`linear-gradient(to top,#7C3AED,#06B6D4)`,height:`${Math.max(4,(d.expenses/maxSpend)*90)}px`,transition:'height 0.4s',opacity:i===6?1:0.6 }}/>
              <div style={{ fontSize:10,color:'var(--text-muted)',fontWeight:600 }}>{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      {catBreakdown.length > 0 && (
        <div style={{ background:'var(--bg-card)',borderRadius:20,padding:20,marginBottom:20,border:'1px solid var(--border)' }}>
          <div style={{ fontSize:14,fontWeight:700,marginBottom:16 }}>By Category</div>
          {catBreakdown.slice(0,5).map(cat => (
            <div key={cat.id} style={{ marginBottom:12 }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                <div style={{ fontSize:13,fontWeight:600,color:cat.color }}>
                  <CategoryIcon id={cat.id} size={13} color={cat.color}/> {cat.label}
                </div>
                <div style={{ fontSize:13,fontWeight:700 }}>{formatCurrency(cat.amount)}</div>
              </div>
              <div style={{ height:6,borderRadius:99,background:'var(--bg-elevated)',overflow:'hidden' }}>
                <div style={{ height:'100%',borderRadius:99,background:cat.color,width:`${Math.min(100,(cat.amount/totalExpenses)*100)}%`,transition:'width 0.4s' }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top spenders (admin only) */}
      {topSpenders.length > 0 && (
        <div style={{ background:'var(--bg-card)',borderRadius:20,padding:20,marginBottom:20,border:'1px solid var(--border)' }}>
          <div style={{ fontSize:14,fontWeight:700,marginBottom:16 }}>Top Spenders</div>
          {topSpenders.map((m, i) => (
            <div key={m.id} style={{ display:'flex',alignItems:'center',gap:12,marginBottom:12 }}>
              <div style={{ width:24,height:24,borderRadius:8,background:'var(--bg-elevated)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'var(--text-muted)' }}>{i+1}</div>
              <div style={{ width:34,height:34,borderRadius:11,background:m.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff' }}>{m.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:700 }}>{m.name}</div>
                <div style={{ height:4,borderRadius:99,background:'var(--bg-elevated)',marginTop:4 }}>
                  <div style={{ height:'100%',borderRadius:99,background:m.color,width:`${topSpenders[0].spent>0?Math.min(100,(m.spent/topSpenders[0].spent)*100):0}%` }}/>
                </div>
              </div>
              <div style={{ fontSize:14,fontWeight:700,color:'var(--danger)' }}>{formatCurrency(m.spent)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Activity Screen ─────────────────────────────────────────────
// timeAgo imported from data.js

function buildActivityFeed(transactions, members) {
  return [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(t => {
      const member = members.find(m => m.id === t.memberId)
      const cat    = CATEGORIES.find(c => c.id === t.category)
      if (!member) return null
      if (t.type === 'advance') {
        return { id: t.id, txn: t, member, kind: 'advance', cat: null,
          text: ['gave ', formatCurrency(t.amount), ' advance to ', member.name],
          icon: null, iconBg: 'rgba(16,185,129,0.15)', iconColor: '#10B981',
          amount: t.amount, amountColor: 'var(--success)', sign: '+' }
      } else {
        const isPending = t.status === 'pending'
        return { id: t.id, txn: t, member, kind: 'expense', cat,
          text: isPending
            ? [member.name, ' submitted ', formatCurrency(t.amount), cat ? ' for ' + cat.label : '']
            : [member.name, ' spent ', formatCurrency(t.amount), cat ? ' on ' + cat.label : ''],
          icon: null,
          iconBg: isPending ? 'rgba(245,158,11,0.12)' : (cat ? cat.color + '22' : 'var(--brand-dim)'),
          iconColor: isPending ? 'var(--warning)' : (cat?.color || 'var(--brand-light)'),
          amount: t.amount, amountColor: isPending ? 'var(--warning)' : 'var(--danger)', sign: '-',
          pending: isPending }
      }
    })
    .filter(Boolean)
}

function Activity({ state, currentUser, onTxnAction, onMemberDetail }) {
  const { transactions, members } = state
  const [filter, setFilter] = useState('all') // all | advances | expenses | pending
  const viewAll = canDo(currentUser, 'view_all_members')

  let feed = buildActivityFeed(
    viewAll ? transactions : transactions.filter(t => t.memberId === currentUser?.id),
    members
  )
  if (filter === 'advances') feed = feed.filter(f => f.kind === 'advance')
  if (filter === 'expenses') feed = feed.filter(f => f.kind === 'expense')
  if (filter === 'pending')  feed = feed.filter(f => f.pending)

  // Group by date
  const groups = {}
  feed.forEach(f => {
    const key = new Date(f.txn.date).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(f)
  })

  const pendingCount = transactions.filter(t => t.status === 'pending').length
  const totalToday = transactions
    .filter(t => new Date(t.date).toDateString() === new Date().toDateString() && t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="screen animate-in">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Activity</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          {feed.length} actions · Today: {formatCurrency(totalToday)} spent
        </div>
      </div>

      {/* Summary strip (Splitwise-style) */}
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <div style={{ flex:1, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.18)', borderRadius:16, padding:'14px 16px' }}>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>Total Advanced</div>
          <div style={{ fontSize:20, fontWeight:800, color:'var(--success)', letterSpacing:-0.5 }}>
            {formatCurrency(transactions.filter(t => t.type==='advance').reduce((s,t) => s+Number(t.amount), 0))}
          </div>
        </div>
        <div style={{ flex:1, background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.18)', borderRadius:16, padding:'14px 16px' }}>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>Total Spent</div>
          <div style={{ fontSize:20, fontWeight:800, color:'var(--danger)', letterSpacing:-0.5 }}>
            {formatCurrency(transactions.filter(t => t.type==='expense').reduce((s,t) => s+Number(t.amount), 0))}
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display:'flex', gap:8, marginBottom:20, overflowX:'auto', paddingBottom:2 }}>
        {[
          { id:'all',      label:'All' },
          { id:'advances', label:'Advances' },
          { id:'expenses', label:'Expenses' },
          { id:'pending',  label:`Pending${pendingCount > 0 ? ' ('+pendingCount+')' : ''}` },
        ].map(f => (
          <div key={f.id} onClick={() => setFilter(f.id)}
            style={{ padding:'8px 16px', borderRadius:99, background:filter===f.id?'var(--brand)':'var(--bg-elevated)', border:`1px solid ${filter===f.id?'var(--brand)':'var(--border)'}`, color:filter===f.id?'#fff':'var(--text-secondary)', fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, transition:'all 0.15s' }}>
            {f.label}
          </div>
        ))}
      </div>

      {/* Feed */}
      {Object.keys(groups).length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text-muted)' }}>
          <div style={{ marginBottom:12 }}><IconInbox size={40} color="var(--text-muted)"/></div>
          <div style={{ fontSize:16, fontWeight:600 }}>No activity yet</div>
        </div>
      )}

      {Object.entries(groups).map(([dateKey, items]) => {
        const d = new Date(dateKey)
        const isToday = d.toDateString() === new Date().toDateString()
        const isYest  = d.toDateString() === new Date(Date.now()-86400000).toDateString()
        const dayLabel = isToday ? 'Today' : isYest ? 'Yesterday' : d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'})
        const dayExp = items.filter(i => i.kind==='expense').reduce((s,i) => s+Number(i.amount), 0)
        const dayAdv = items.filter(i => i.kind==='advance').reduce((s,i) => s+Number(i.amount), 0)

        return (
          <div key={dateKey} style={{ marginBottom:28 }}>
            {/* Date header — Splitwise style */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--brand-light)' }}/>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text-secondary)' }}>{dayLabel}</div>
              </div>
              <div style={{ display:'flex', gap:12 }}>
                {dayAdv > 0 && <div style={{ fontSize:12, color:'var(--success)', fontWeight:600 }}>+{formatCurrency(dayAdv)}</div>}
                {dayExp > 0 && <div style={{ fontSize:12, color:'var(--danger)', fontWeight:600 }}>-{formatCurrency(dayExp)}</div>}
              </div>
            </div>

            {/* Timeline line + items */}
            <div style={{ position:'relative', paddingLeft:20 }}>
              <div style={{ position:'absolute', left:3, top:0, bottom:0, width:2, background:'var(--border)', borderRadius:1 }}/>
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {items.map((item, idx) => (
                  <div key={item.id}
                    onClick={() => canDo(currentUser,'edit_transaction') && onTxnAction(item.txn)}
                    style={{ background:'var(--bg-card)', borderRadius:16, padding:'14px', border:'1px solid var(--border)', cursor: canDo(currentUser,'edit_transaction') ? 'pointer' : 'default', transition:'background 0.15s', marginBottom: idx < items.length-1 ? 8 : 0 }}>

                    <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                      {/* Member avatar */}
                      <div style={{ width:40, height:40, borderRadius:13, background:item.member.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0 }}>
                        {item.member.initials}
                      </div>

                      {/* Content */}
                      <div style={{ flex:1, minWidth:0 }}>
                        {/* Rich description */}
                        <div style={{ fontSize:14, lineHeight:1.5, marginBottom:6 }}>
                          {item.kind === 'advance' ? (
                            <>
                              <span style={{ fontWeight:500, color:'var(--text-muted)' }}>Admin gave </span>
                              <span style={{ fontWeight:800, color:'var(--success)' }}>{formatCurrency(item.amount)}</span>
                              <span style={{ fontWeight:500, color:'var(--text-muted)' }}> advance to </span>
                              <span style={{ fontWeight:700, color:item.member.color, cursor:'pointer' }}
                                onClick={e => { e.stopPropagation(); onMemberDetail(item.member) }}>
                                {item.member.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <span style={{ fontWeight:700, color:item.member.color, cursor:'pointer' }}
                                onClick={e => { e.stopPropagation(); onMemberDetail(item.member) }}>
                                {item.member.name}
                              </span>
                              <span style={{ fontWeight:500, color:'var(--text-muted)' }}>
                                {item.pending ? ' submitted ' : ' spent '}
                              </span>
                              <span style={{ fontWeight:800, color:item.pending ? 'var(--warning)' : 'var(--danger)' }}>
                                {formatCurrency(item.amount)}
                              </span>
                              {item.cat && (
                                <span style={{ fontWeight:500, color:'var(--text-muted)' }}>
                                  {item.pending ? ' for approval' : ' on '}
                                  {!item.pending && <span style={{ color:item.cat.color, fontWeight:600 }}>{item.cat.label}</span>}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Note + meta row */}
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                          {item.txn.note && (
                            <span style={{ fontSize:12, color:'var(--text-muted)', background:'var(--bg-elevated)', padding:'3px 10px', borderRadius:8 }}>
                              "{item.txn.note}"
                            </span>
                          )}
                          {item.cat && !item.pending && (
                            <span style={{ fontSize:11, fontWeight:700, color:item.cat.color, background:item.cat.color+'18', padding:'3px 10px', borderRadius:8 }}>
                              {item.cat.label}
                            </span>
                          )}
                          {item.pending && (
                            <span style={{ fontSize:11, fontWeight:700, color:'var(--warning)', background:'rgba(245,158,11,0.12)', padding:'3px 10px', borderRadius:8 }}>
                              Pending approval
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: time */}
                      <div style={{ flexShrink:0, textAlign:'right' }}>
                        <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>{timeAgo(item.txn.date)}</div>
                        {canDo(currentUser,'edit_transaction') && (
                          <div style={{ fontSize:16, color:'var(--text-muted)' }}>⋮</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Notification Panel ───────────────────────────────────────────
function NotificationPanel({ notifications, onClose, onMarkAllRead }) {
  const unread = notifications.filter(n => !n.read).length
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ maxHeight:'88%' }}>
        <div className="modal-handle"/>
        <div className="modal-title" style={{ marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span>Notifications</span>
            {unread > 0 && <span style={{ background:'var(--danger)', color:'#fff', fontSize:11, fontWeight:800, padding:'2px 8px', borderRadius:99 }}>{unread} new</span>}
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            {unread > 0 && <div onClick={onMarkAllRead} style={{ fontSize:12, color:'var(--brand-light)', fontWeight:600, cursor:'pointer' }}>Mark all read</div>}
            <div className="icon-btn" onClick={onClose}><IconClose size={18} color="#94A3B8"/></div>
          </div>
        </div>

        {notifications.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text-muted)' }}>
            <div style={{ marginBottom:12 }}><IconBell size={40} color="var(--text-muted)"/></div>
            <div style={{ fontSize:16, fontWeight:600 }}>All caught up!</div>
            <div style={{ fontSize:13, marginTop:6 }}>No notifications yet</div>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {notifications.map(n => {
            const NOTIF_CFG = {
              advance:  { Icon: IconMoney,  color:'#10B981' },
              expense:  { Icon: IconCart,   color:'#F43F5E' },
              approval: { Icon: IconCheck,  color:'#10B981' },
              edit:     { Icon: IconEdit,   color:'#06B6D4' },
              delete:   { Icon: IconTrash,  color:'#F43F5E' },
              member:   { Icon: IconUser,   color:'#7C3AED' },
              role:     { Icon: IconShield, color:'#F59E0B' },
            }
            const cfg = NOTIF_CFG[n.type] || { Icon: IconBell, color:'#7C3AED' }
            return (
              <div key={n.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px', borderRadius:16, background: n.read ? 'var(--bg-elevated)' : 'rgba(124,58,237,0.08)', border:`1px solid ${n.read ? 'var(--border)' : 'rgba(124,58,237,0.2)'}`, position:'relative' }}>
                {!n.read && <div style={{ position:'absolute', top:12, right:12, width:7, height:7, borderRadius:'50%', background:'var(--brand-light)' }}/>}
                <div style={{ width:38, height:38, borderRadius:12, background:cfg.color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><cfg.Icon size={18} color={cfg.color}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:n.read ? 500 : 700, lineHeight:1.45 }}>{n.message}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{timeAgo(n.created_at || n.date)}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── CSV / Google Sheets Export ───────────────────────────────────
function exportCSV(transactions, members, monthFilter) {
  let txns = [...transactions].sort((a,b) => new Date(a.date)-new Date(b.date))
  if (monthFilter) {
    txns = txns.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === monthFilter.month && d.getFullYear() === monthFilter.year
    })
  }

  const rows = [
    ['Date','Time','Member Name','Type','Category','Amount (₹)','Note','Status'],
    ...txns.map(t => {
      const m  = members.find(x => x.id === t.memberId)
      const d  = new Date(t.date)
      const cat = CATEGORIES.find(c => c.id === t.category)
      return [
        d.toLocaleDateString('en-IN'),
        d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}),
        m?.name || 'Unknown',
        t.type === 'advance' ? 'Advance' : 'Expense',
        cat?.label || (t.type==='advance' ? '—' : 'Other'),
        t.type==='advance' ? `+${t.amount}` : `-${t.amount}`,
        t.note || '',
        t.status,
      ]
    })
  ]

  // Summary section
  const totalAdv = txns.filter(t=>t.type==='advance').reduce((s,t)=>s+Number(t.amount),0)
  const totalExp = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
  rows.push([],[' SUMMARY','','','','','',''])
  rows.push(['Total Advances','','','','',`+${totalAdv}`,'',''])
  rows.push(['Total Expenses','','','','',`-${totalExp}`,'',''])
  rows.push(['Net Balance','','','','',`${totalAdv-totalExp}`,'',''])

  // Per-member summary
  rows.push([],[' PER MEMBER BALANCE','','','','','',''])
  rows.push(['Member','Role','Advances Given','Expenses Logged','Balance','','',''])
  members.filter(m=>m.role==='staff').forEach(m => {
    const adv = txns.filter(t=>t.memberId===m.id&&t.type==='advance').reduce((s,t)=>s+Number(t.amount),0)
    const exp = txns.filter(t=>t.memberId===m.id&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
    rows.push([m.name, m.role, adv, exp, adv-exp,'','',''])
  })

  const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  const label = monthFilter
    ? `HostelKhata_${new Date(monthFilter.year, monthFilter.month).toLocaleDateString('en-IN',{month:'long',year:'numeric'})}`
    : 'HostelKhata_AllTime'
  a.href = url; a.download = `${label}.csv`; a.click()
  URL.revokeObjectURL(url)
}

function ExportModal({ transactions, members, onClose }) {
  const months = []
  const seen = new Set()
  transactions.forEach(t => {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!seen.has(key)) {
      seen.add(key)
      months.push({ year:d.getFullYear(), month:d.getMonth(), label: d.toLocaleDateString('en-IN',{month:'long',year:'numeric'}) })
    }
  })
  months.sort((a,b) => b.year-a.year || b.month-a.month)
  const [selected, setSelected] = useState('all')

  const doExport = () => {
    if (selected==='all') exportCSV(transactions, members, null)
    else {
      const mf = months.find(m => `${m.year}-${m.month}`===selected)
      if (mf) exportCSV(transactions, members, mf)
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-title">
          <span>Export to Google Sheets</span>
          <div className="icon-btn" onClick={onClose}><IconClose size={18} color="#94A3B8"/></div>
        </div>

        {/* Steps */}
        <div style={{ background:'rgba(6,182,212,0.07)', border:'1px solid rgba(6,182,212,0.18)', borderRadius:16, padding:'14px 16px', marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--cyan)', marginBottom:10 }}>How to import into Google Sheets</div>
          {['Download the CSV file below','Open Google Sheets (sheets.google.com)','File → Import → Upload the CSV file','Select "Replace spreadsheet" → Import','Done! All your data is now in Sheets'].map((step,i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
              <div style={{ width:22, height:22, borderRadius:7, background:'var(--cyan)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#000', flexShrink:0 }}>{i+1}</div>
              <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>{step}</div>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Select Period</label>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div onClick={() => setSelected('all')} style={{ padding:'12px 16px', borderRadius:14, background:selected==='all'?'var(--brand-dim)':'var(--bg-elevated)', border:`1.5px solid ${selected==='all'?'var(--brand-light)':'var(--border)'}`, cursor:'pointer', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:14, fontWeight:600, color:selected==='all'?'var(--brand-light)':'var(--text-primary)' }}>All Time</span>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>{transactions.length} transactions</span>
            </div>
            {months.map(m => {
              const key = `${m.year}-${m.month}`
              const count = transactions.filter(t => { const d=new Date(t.date); return d.getMonth()===m.month && d.getFullYear()===m.year }).length
              return (
                <div key={key} onClick={() => setSelected(key)} style={{ padding:'12px 16px', borderRadius:14, background:selected===key?'var(--brand-dim)':'var(--bg-elevated)', border:`1.5px solid ${selected===key?'var(--brand-light)':'var(--border)'}`, cursor:'pointer', display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:14, fontWeight:600, color:selected===key?'var(--brand-light)':'var(--text-primary)' }}>{m.label}</span>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>{count} transactions</span>
                </div>
              )
            })}
          </div>
        </div>

        <button className="btn-primary" onClick={doExport} style={{ marginTop:8 }}>
          Download CSV File
        </button>
        <div style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', marginTop:12 }}>
          CSV includes all transactions, per-member balances & category totals
        </div>
      </div>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────
export default function App() {
  // ── Setup URL param: visiting ?setup=1 forces the Owner Claim screen ──
  const isSetupURL = new URLSearchParams(window.location.search).get('setup') === '1'

  // ── Supabase auth state ───────────────────────────────────────
  const [authUser,      setAuthUser]      = useState(null)
  const [currentUser,   setCurrentUser]   = useState(null)
  const [authScreen,    setAuthScreen]    = useState('login')
  const [authLoading,   setAuthLoading]   = useState(true)
  const [screen,        setScreen]        = useState('dashboard')
  const [modal,         setModal]         = useState(null)
  const [modalData,     setModalData]     = useState(null)
  const [toast,         setToast]         = useState(null)
  const [showNotifs,    setShowNotifs]    = useState(false)
  const [showOwnerClaim,setShowOwnerClaim]= useState(false)
  const [ownerClaiming, setOwnerClaiming] = useState(false)

  // Listen to Supabase auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthUser(session.user)
        try {
          const profile = await getProfile(session.user.id)
          setCurrentUser(profile)
        } catch { setCurrentUser(null) }
      } else {
        setAuthUser(null)
        setCurrentUser(null)
      }
      setAuthLoading(false)
      // Handle password reset redirect
      if (event === 'PASSWORD_RECOVERY') setAuthScreen('reset')
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Live data via Supabase hook ───────────────────────────────
  const data = useHostelData(currentUser)

  // Normalise Supabase field names → app field names for existing components
  const state = {
    members:       data.members,
    transactions:  data.transactions.map(normTxn),
    notifications: data.notifications.map(normNotif),
  }

  // ── First-time setup: show owner claim if no superadmin exists ─
  useEffect(() => {
    if (!currentUser || data.loading) return
    if (currentUser.role === 'superadmin') { setShowOwnerClaim(false); return }
    if (!data.members.some(m => m.role === 'superadmin')) setShowOwnerClaim(true)
  }, [currentUser, data.members, data.loading])

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const openModal  = (name, d=null) => { setModal(name); setModalData(d) }
  const closeModal = () => { setModal(null); setModalData(null) }

  const pendingCount = state.transactions.filter(t => t.status==='pending').length
  const unreadNotifs = state.notifications.filter(n => !n.read).length

  const handleLogout = async () => {
    await signOut()
    setScreen('dashboard')
    setAuthScreen('login')
  }

  const handleAddTransaction = async ({ memberId, amount, note, type, category }) => {
    try {
      await data.handleAddTransaction({ memberId, amount, note, type, category })
      showToast(`${type==='advance'?'Advance':'Expense'} of ${formatCurrency(amount)} added!`)
    } catch(e) { showToast(e.message, 'danger') }
  }

  const handleSaveMember = async ({ name, phone, role, color, initials, email, password, isNew }) => {
    // Role assignment enforcement: only superadmin can set admin or superadmin role
    const restrictedRoles = ['admin', 'superadmin']
    if (restrictedRoles.includes(role) && currentUser?.role !== 'superadmin') {
      throw new Error('Only the Super Admin can assign admin or superadmin roles.')
    }

    if (isNew) {
      // Save admin session BEFORE signUp (which would overwrite it)
      const { data: { session: adminSession } } = await supabase.auth.getSession()

      const { data: authData, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, role } }
      })
      if (error) throw error

      // Immediately restore admin session so admin doesn't get logged out
      if (adminSession) {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        })
      }

      if (authData.user) {
        await updateProfile(authData.user.id, { name, phone, role, color, initials })
      }
      await data.notify('member', `${currentUser.name} added ${role} — ${name}`)
      showToast(`${name} account created! They can now log in.`)
    } else {
      await data.handleUpdateMember(modalData.id, { name, phone, role, color, initials })
      showToast(`${name} updated`)
    }
  }

  const handleDeleteMember = async (id) => {
    await data.handleDeleteMember(id)
    showToast('Member removed', 'danger')
  }

  const handleUpdateTxn = async (txn) => {
    await data.handleUpdateTransaction(txn.id, {
      amount: txn.amount, note: txn.note,
      category: txn.category, status: txn.status
    })
    showToast('Transaction updated')
  }

  const handleDeleteTxn = async (id) => {
    await data.handleDeleteTransaction(id)
    showToast('Transaction deleted', 'danger')
  }

  const handleApproveTxn = async (id) => {
    await data.handleApproveTransaction(id)
    showToast('Approved!')
  }

  // ── Auth screens ─────────────────────────────────────────────
  if (authLoading) return (
    <div className="phone-wrapper">
      <div className="phone-frame" style={{ display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ marginBottom:16 }}><IconBuilding size={48} color="var(--brand-light)"/></div>
          <div style={{ fontSize:14,color:'var(--text-muted)' }}>Loading HostelKhata…</div>
        </div>
      </div>
    </div>
  )

  if (!currentUser) return (
    <div className="phone-wrapper">
      <div className="phone-frame">
        <StatusBar/>
        <div className="auth-wrapper">
          {authScreen==='login'  && <LoginScreen  onSuccess={()=>{}} onForgot={()=>setAuthScreen('forgot')} onSignup={()=>setAuthScreen('signup')}/>}
          {authScreen==='signup' && <SignupScreen onBack={()=>setAuthScreen('login')} onSuccess={()=>setAuthScreen('login')}/>}
          {authScreen==='forgot' && <ForgotScreen onBack={()=>setAuthScreen('login')}/>}
          {authScreen==='reset'  && <ResetPasswordScreen onDone={()=>setAuthScreen('login')}/>}
          {/* First-time setup hint */}
          {authScreen==='login' && (
            <div style={{ textAlign:'center', paddingBottom:20 }}>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>Setting up for the first time?</div>
              <button
                onClick={() => window.location.href = window.location.origin + '/?setup=1'}
                style={{ background:'none', border:'1px solid var(--border)', borderRadius:10, padding:'8px 18px', fontSize:13, color:'var(--brand-light)', cursor:'pointer', fontWeight:600 }}>
                Owner / First Setup →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ── Owner Claim Screen (shown when no superadmin exists, or via ?setup=1 URL) ──
  if (currentUser && (showOwnerClaim || isSetupURL)) return (
    <div className="phone-wrapper">
      <div className="phone-frame" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 28px' }}>
        {/* Logo */}
        <div style={{ width:80,height:80,borderRadius:24,background:'linear-gradient(135deg,#F59E0B,#EF4444)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:24,boxShadow:'0 12px 40px rgba(245,158,11,0.4)' }}>
          <IconStar size={38} color="white"/>
        </div>

        <div style={{ fontSize:24,fontWeight:800,letterSpacing:-0.5,marginBottom:8,textAlign:'center' }}>First Time Setup</div>
        <div style={{ fontSize:14,color:'var(--text-muted)',lineHeight:1.65,marginBottom:6,textAlign:'center' }}>
          No Super Admin found in this hostel.
        </div>
        <div style={{ background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:14,padding:'14px 16px',marginBottom:28,width:'100%' }}>
          <div style={{ fontSize:13,fontWeight:700,color:'var(--warning)',marginBottom:6 }}>Logged in as: {currentUser.name}</div>
          <div style={{ fontSize:12,color:'var(--text-muted)',lineHeight:1.6 }}>
            Tap below to become the <strong style={{ color:'var(--warning)' }}>Super Admin</strong>. You will have full control — manage members, roles, expenses, and reports.<br/><br/>
            This option disappears once an owner is set. Only one person can do this.
          </div>
        </div>

        <button
          className="btn-primary"
          disabled={ownerClaiming}
          style={{ background:'linear-gradient(135deg,#F59E0B,#EF4444)', boxShadow:'0 6px 20px rgba(245,158,11,0.4)', marginBottom:12 }}
          onClick={async () => {
            setOwnerClaiming(true)
            try {
              await updateProfile(currentUser.id, { role:'superadmin' })
              setCurrentUser({ ...currentUser, role:'superadmin' })
              setShowOwnerClaim(false)
            } catch(e) {
              alert('Error: ' + e.message)
            } finally { setOwnerClaiming(false) }
          }}>
          {ownerClaiming ? 'Setting up…' : 'Yes — Make Me Super Admin'}
        </button>

        <div
          style={{ fontSize:13,color:'var(--text-muted)',cursor:'pointer',padding:'8px 0',fontWeight:600 }}
          onClick={() => setShowOwnerClaim(false)}>
          Continue as Staff for now →
        </div>
      </div>
    </div>
  )

  // ── Main app ─────────────────────────────────────────────────
  return (
    <div className="phone-wrapper">
      <div className="phone-frame">
        <StatusBar/>

        {/* Top bar: Sheets + Bell + Logout — in layout flow, no overlap */}
        <div className="app-top-bar">
          {canDo(currentUser,'view_reports') && (
            <div onClick={() => openModal('export')}
              style={{ background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:10,padding:'5px 10px',fontSize:11,fontWeight:700,color:'#34D399',cursor:'pointer',display:'flex',alignItems:'center',gap:5 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke="#34D399" strokeWidth="1.2"/><path d="M3 6h6M6 3v6" stroke="#34D399" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Sheets
            </div>
          )}
          <div style={{ position:'relative', flexShrink:0 }}>
            <div onClick={() => setShowNotifs(true)}
              style={{ background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:10,width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a4.5 4.5 0 00-4.5 4.5v2.5L2 10h12l-1.5-1.5V6A4.5 4.5 0 008 1.5z" stroke="var(--text-secondary)" strokeWidth="1.3"/><path d="M6.5 10.5v.5a1.5 1.5 0 003 0v-.5" stroke="var(--text-secondary)" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            {unreadNotifs > 0 && (
              <div style={{ position:'absolute',top:-5,right:-5,minWidth:16,height:16,borderRadius:8,background:'var(--danger)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:'#fff',padding:'0 3px',border:'2px solid var(--bg-surface)',pointerEvents:'none' }}>{unreadNotifs>9?'9+':unreadNotifs}</div>
            )}
          </div>
          <div onClick={handleLogout}
            style={{ background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:10,padding:'5px 10px',fontSize:11,fontWeight:700,color:'var(--text-muted)',cursor:'pointer',flexShrink:0 }}>
            Logout
          </div>
        </div>

        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ flex:1, overflowY:'auto', position:'relative' }}>
            {screen==='dashboard' && (
              <Dashboard state={state} currentUser={currentUser}
                onGiveAdvance={() => openModal('advance')}
                onAddExpense={() => openModal('expense', currentUser?.role==='staff' ? currentUser : null)}
                onMemberDetail={m => openModal('memberDetail', m)}
                setScreen={setScreen}/>
            )}
            {screen==='team' && (
              <Team state={state} currentUser={currentUser}
                onMemberDetail={m => openModal('memberDetail', m)}
                onEditMember={m => openModal('editMember', m)}
                onAddMember={() => openModal('editMember', null)}/>
            )}
            {screen==='ledger' && (
              <Ledger state={state} currentUser={currentUser}
                onAddExpense={() => openModal('expense', currentUser?.role==='staff' ? currentUser : null)}
                onTxnAction={t => openModal('txnAction', t)}
                onApproveTxn={handleApproveTxn}/>
            )}
            {screen==='activity' && (
              <Activity state={state} currentUser={currentUser}
                onTxnAction={t => openModal('txnAction', t)}
                onMemberDetail={m => openModal('memberDetail', m)}/>
            )}
            {screen==='reports' && (
              <Reports state={state} currentUser={currentUser} onExport={() => openModal('export')}/>
            )}
          </div>
          <BottomNav screen={screen} onChange={setScreen} pendingCount={pendingCount} userRole={currentUser?.role}/>
        </div>

        {/* ── Modals ── */}
        {modal==='advance' && canDo(currentUser,'give_advance') && (
          <GiveAdvanceModal members={state.members} onClose={closeModal}
            onSubmit={({ memberId, amount, note }) => handleAddTransaction({ memberId, amount, note, type:'advance', category:null })}/>
        )}
        {modal==='expense' && (
          <AddExpenseModal members={state.members} onClose={closeModal}
            defaultMemberId={modalData?.id || null}
            onSubmit={({ memberId, amount, category, note }) => handleAddTransaction({ memberId, amount, note, type:'expense', category })}/>
        )}
        {modal==='memberDetail' && modalData && (
          <MemberDetailModal member={modalData} transactions={state.transactions}
            onClose={closeModal} onGiveAdvance={() => openModal('advance')}
            currentUser={currentUser} onEditMember={() => openModal('editMember', modalData)}/>
        )}
        {modal==='editMember' && (
          <AddMemberModal existingMember={modalData} currentUserRole={currentUser?.role}
            onClose={closeModal} onSave={handleSaveMember}
            onDelete={canDo(currentUser,'delete_member') ? handleDeleteMember : null}/>
        )}
        {modal==='txnAction' && modalData && (
          <TxnActionMenu txn={modalData}
            canEdit={canDo(currentUser,'edit_transaction')}
            canApprove={canDo(currentUser,'approve_expense') && modalData.status==='pending'}
            onClose={closeModal}
            onApprove={() => { handleApproveTxn(modalData.id); closeModal() }}
            onEdit={() => openModal('editTxn', modalData)}
            onDelete={() => openModal('confirmDeleteTxn', modalData)}/>
        )}
        {modal==='editTxn' && modalData && (
          <EditTransactionModal txn={modalData} members={state.members}
            onClose={closeModal} onSave={handleUpdateTxn}/>
        )}
        {modal==='confirmDeleteTxn' && modalData && (
          <ConfirmDialog
            title="Delete Transaction"
            message={`Delete "${modalData.note}" (${formatCurrency(modalData.amount)})? This cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={() => { handleDeleteTxn(modalData.id); closeModal() }}
            onCancel={closeModal}
          />
        )}

        {/* Notification Panel */}
        {showNotifs && (
          <NotificationPanel
            notifications={state.notifications}
            onClose={() => setShowNotifs(false)}
            onMarkAllRead={data.handleMarkAllRead}
          />
        )}

        {/* Export Modal */}
        {modal==='export' && (
          <ExportModal
            transactions={state.transactions}
            members={state.members}
            onClose={closeModal}
          />
        )}

        {/* Toast */}
        {toast && (
          <div className="toast" style={{ background:toast.type==='danger'?'rgba(244,63,94,0.95)':'rgba(16,185,129,0.95)' }}>
            {toast.type==='danger' ? <IconTrash size={14} color="#fff" style={{verticalAlign:'middle'}}/> : <IconCheck size={14} color="#fff" style={{verticalAlign:'middle'}}/>} {toast.msg}
          </div>
        )}
      </div>
    </div>
  )
}
