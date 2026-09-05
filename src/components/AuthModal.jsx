import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { X, Smartphone, Mail, Globe, Sparkles, CheckCircle2, Lock, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const { 
    sendOtp, verifyOtp, sendEmailOtp, verifyEmailOtp, googleLogin, 
    emailLogin, emailSignup, socialLogin, adminLogin 
  } = useBooking();

  const [authTab, setAuthTab] = useState('email'); // 'email', 'mobile', 'social', 'admin'
  
  // Email OTP state
  const [emailStep, setEmailStep] = useState(1); // 1 = Input Email, 2 = Input OTP
  const [emailInput, setEmailInput] = useState('');
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailDebugOtp, setEmailDebugOtp] = useState('');
  const [emailAuthMode, setEmailAuthMode] = useState('otp'); // 'otp' or 'password'

  // Mobile state
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [debugOtp, setDebugOtp] = useState('');
  const [name, setName] = useState('');

  // Password-based Email form state
  const [emailSubTab, setEmailSubTab] = useState('login'); // 'login', 'signup'
  const [emailForm, setEmailForm] = useState({ name: '', email: '', password: '', mobile: '' });

  // Google Account Selector State
  const [showGoogleAccountPicker, setShowGoogleAccountPicker] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Admin Login state
  const [adminForm, setAdminForm] = useState({ email: 'admin@farmhousehub.in', password: '' });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Countdown timers
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    let timer;
    if (emailCooldown > 0) {
      timer = setInterval(() => setEmailCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailCooldown]);

  if (!isOpen) return null;

  // --- EMAIL OTP HANDLERS ---
  const handleSendEmailOTP = async (e) => {
    if (e) e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await sendEmailOtp(emailInput);
      if (res.success) {
        setEmailStep(2);
        setEmailCooldown(60);
        setSuccessMsg(`OTP sent to your email mailbox (${emailInput.trim().toLowerCase()})!`);
        if (res.debugOtp) setEmailDebugOtp(res.debugOtp);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP to email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOTP = async (e) => {
    e.preventDefault();
    if (!emailOtpInput || emailOtpInput.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code received in your email');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await verifyEmailOtp({ email: emailInput, otp: emailOtpInput, name });
      if (res.success) {
        if (onAuthSuccess) onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired Email OTP');
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE SELECTOR LOGIN HANDLER ---
  const handleGoogleAccountSelect = async (selectedEmail, selectedName) => {
    setErrorMsg('');
    setLoading(true);
    setShowGoogleAccountPicker(false);
    try {
      const res = await googleLogin({
        email: selectedEmail,
        name: selectedName || selectedEmail.split('@')[0],
        avatarUrl: `https://lh3.googleusercontent.com/a/default-user`
      });
      if (res.success) {
        if (onAuthSuccess) onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  // --- MOBILE OTP HANDLERS ---
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await sendOtp(mobile);
      if (res.success) {
        setStep(2);
        setCooldown(60);
        setSuccessMsg('SMS OTP code sent to your mobile number!');
        if (res.debugOtp) setDebugOtp(res.debugOtp);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.length < 4) {
      setErrorMsg('Please enter the 6-digit OTP code');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await verifyOtp({ mobile, otp: otpInput, name, email: emailInput });
      if (res.success) {
        if (onAuthSuccess) onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // --- PASSWORD EMAIL HANDLER ---
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      let res;
      if (emailSubTab === 'login') {
        res = await emailLogin(emailForm.email, emailForm.password);
      } else {
        res = await emailSignup(emailForm);
      }
      if (res.success) {
        if (onAuthSuccess) onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ADMIN LOGIN HANDLER ---
  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await adminLogin(adminForm.email, adminForm.password);
      if (res.success) {
        if (onAuthSuccess) onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid Admin Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl glass-modal relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">Sign In / Register</h3>
            <p className="text-xs text-slate-400">Access bookings, owner listings & profile</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentication Options Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 my-4 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => { setAuthTab('email'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl transition flex flex-col items-center justify-center space-y-1 ${
              authTab === 'email' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email OTP</span>
          </button>

          <button
            onClick={() => { setAuthTab('mobile'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl transition flex flex-col items-center justify-center space-y-1 ${
              authTab === 'mobile' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile OTP</span>
          </button>

          <button
            onClick={() => { setAuthTab('social'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl transition flex flex-col items-center justify-center space-y-1 ${
              authTab === 'social' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Google</span>
          </button>

          <button
            onClick={() => { setAuthTab('admin'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl transition flex flex-col items-center justify-center space-y-1 ${
              authTab === 'admin' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs rounded-xl font-medium mb-3">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs rounded-xl font-medium mb-3">
            {successMsg}
          </div>
        )}

        {/* TAB 1: EMAIL MAILBOX OTP VERIFICATION */}
        {authTab === 'email' && (
          <div className="py-2 space-y-4">
            
            {/* Mode Switcher (Email OTP vs Password) */}
            <div className="flex justify-between items-center text-xs pb-1 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Verify Email via Mailbox OTP Code</span>
              <button
                type="button"
                onClick={() => setEmailAuthMode(emailAuthMode === 'otp' ? 'password' : 'otp')}
                className="text-emerald-400 font-bold hover:underline"
              >
                {emailAuthMode === 'otp' ? 'Use Password Instead' : 'Use Email OTP Instead'}
              </button>
            </div>

            {emailAuthMode === 'otp' ? (
              emailStep === 1 ? (
                <form onSubmit={handleSendEmailOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Enter Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="user@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-3 text-sm font-mono text-white focus:outline-none transition"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition shadow-lg shadow-emerald-950 text-xs flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Sending Mailbox OTP...' : 'Send Verification OTP to Email'}</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailOTP} className="space-y-4">
                  {emailDebugOtp && (
                    <div className="bg-emerald-950/70 border border-emerald-500/60 p-3.5 rounded-2xl text-xs text-emerald-300 flex items-center justify-between shadow-xl">
                      <div>
                        <span className="text-[11px] text-slate-300 font-semibold block">Email Verification OTP Sent:</span>
                        <span className="text-xl font-extrabold font-mono text-emerald-400 tracking-widest">{emailDebugOtp}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEmailOtpInput(emailDebugOtp)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-md transition"
                      >
                        Auto-fill OTP
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Enter 6-Digit Email OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={emailOtpInput}
                      onChange={(e) => setEmailOtpInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl px-4 py-3 text-center text-xl font-mono font-extrabold tracking-widest text-white focus:outline-none transition"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition shadow-lg text-xs"
                  >
                    {loading ? 'Verifying Email OTP...' : 'Verify Email OTP & Log In'}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setEmailStep(1)}
                      className="text-slate-400 hover:text-white"
                    >
                      Change Email
                    </button>

                    <button
                      type="button"
                      disabled={emailCooldown > 0 || loading}
                      onClick={handleSendEmailOTP}
                      className={`font-semibold ${emailCooldown > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-emerald-400 hover:underline'}`}
                    >
                      {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : 'Resend Email OTP'}
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* Password Login Alternative */
              <form onSubmit={handleEmailSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl transition shadow-lg text-xs"
                >
                  {loading ? 'Authenticating...' : 'Sign In with Password'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: MOBILE OTP VERIFICATION */}
        {authTab === 'mobile' && (
          <div className="py-2 space-y-4">
            {step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Enter Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-14 pr-4 py-3 text-base font-mono font-bold text-white focus:outline-none transition"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition shadow-lg shadow-emerald-950 text-xs flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'Sending Server OTP...' : 'Send SMS OTP Code'}</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                {debugOtp && (
                  <div className="bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-2xl text-xs text-emerald-300 flex items-center justify-between">
                    <div>
                      <span>Server Generated SMS OTP Code:</span>
                      <span className="block text-base font-extrabold font-mono text-emerald-400 tracking-widest">{debugOtp}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 px-2 py-1 rounded text-emerald-200">Server API</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl px-4 py-3 text-center text-xl font-mono font-extrabold tracking-widest text-white focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition shadow-lg text-xs"
                >
                  {loading ? 'Verifying Code...' : 'Verify OTP & Log In'}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-slate-400 hover:text-white"
                  >
                    Change Number
                  </button>

                  <button
                    type="button"
                    disabled={cooldown > 0 || loading}
                    onClick={handleSendOTP}
                    className={`font-semibold ${cooldown > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-emerald-400 hover:underline'}`}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: GOOGLE DEVICE ACCOUNT SELECTOR OAUTH */}
        {authTab === 'social' && (
          <div className="py-2 space-y-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <span className="text-2xl font-bold">G</span>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">Sign in with Google</h4>
                <p className="text-xs text-slate-400 mt-0.5">Select an active Google account on your device to log in instantly.</p>
              </div>

              <button
                onClick={() => setShowGoogleAccountPicker(true)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-2xl transition shadow-lg text-xs flex items-center justify-center space-x-2"
              >
                <span>Select Google Account on Device</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN PORTAL LOGIN */}
        {authTab === 'admin' && (
          <form onSubmit={handleAdminLoginSubmit} className="py-2 space-y-3.5 text-xs">
            <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-amber-300 text-[11px] font-mono">
              Admin Portal Security • Enforces JWT Role Authorization
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Admin Email ID</label>
              <input
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Admin Hashed Password</label>
              <input
                type="password"
                placeholder="Enter password (e.g. Admin@1234)"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition shadow-lg text-xs mt-2"
            >
              {loading ? 'Verifying Admin Credentials...' : 'Authenticate Admin Access'}
            </button>

            <p className="text-[10px] text-center text-slate-400 font-mono">
              Default Admin: <span className="text-amber-400 font-bold">admin@farmhousehub.in</span> / <span className="text-amber-400 font-bold">Admin@1234</span>
            </p>
          </form>
        )}

        {/* GOOGLE ACCOUNT SELECTOR POPUP MODAL */}
        {showGoogleAccountPicker && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-6 flex flex-col justify-between animate-fade-in">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-blue-400">G</span>
                  <h4 className="font-bold text-white text-sm">Choose a Google Account</h4>
                </div>
                <button onClick={() => setShowGoogleAccountPicker(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400">Select an account to continue to FarmStay India:</p>

              <div className="space-y-2">
                {[
                  { name: 'Rahul Patel', email: 'rahul.patel@gmail.com' },
                  { name: 'Aniket Shah', email: 'aniket.shah@gmail.com' },
                  { name: 'Farmhouse Admin', email: 'admin@farmhousehub.in' }
                ].map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => handleGoogleAccountSelect(acc.email, acc.name)}
                    className="w-full text-left bg-slate-900 border border-slate-800 hover:border-blue-500/60 p-3 rounded-2xl transition flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs border border-blue-500/40">
                        {acc.name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block group-hover:text-blue-400 transition">{acc.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{acc.email}</span>
                      </div>
                    </div>
                    <UserCheck className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
                  </button>
                ))}
              </div>

              {/* Custom Email Write-In Option */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Or Sign in with another Google Email
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="custom.user@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (customGoogleEmail.includes('@')) {
                        handleGoogleAccountSelect(customGoogleEmail);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGoogleAccountPicker(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs border border-slate-800 mt-4"
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
