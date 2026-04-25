// =============================================
// app.js — Talent Hunt · Firebase Auth + Routing
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── Firebase Config ──────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyB9yh7khJwz4wNypk9DANPvz2SrzSh2iPo",
  authDomain: "vivekcampus-15f78.firebaseapp.com",
  projectId: "vivekcampus-15f78",
  storageBucket: "vivekcampus-15f78.firebasestorage.app",
  messagingSenderId: "982662393161",
  appId: "1:982662393161:web:f11bdf167a178b39f8be98"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ── Page Detection ───────────────────────────
const PAGE = (() => {
  const p = location.pathname.split('/').pop() || 'landing.html';
  if (p === 'dashboard.html') return 'dashboard';
  if (p === 'login.html')     return 'login';
  return 'landing';
})();

// ── Auth State Guard ─────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    const displayName = user.displayName || user.email?.split('@')[0] || 'User';
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    // Persist to sessionStorage so all pages can read it without Firebase
    sessionStorage.setItem('th_displayName', displayName);
    sessionStorage.setItem('th_initials', initials);
  }

  if (PAGE === 'dashboard') {
    if (!user) {
      location.href = 'login.html';
      return;
    }
    const displayName = sessionStorage.getItem('th_displayName') || 'User';
    const initials    = sessionStorage.getItem('th_initials')    || 'U';

    // Sidebar user card
    const avatarEl = document.getElementById('user-avatar');
    const nameEl   = document.getElementById('user-name');
    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl)   nameEl.textContent   = displayName;

    // Leaderboard [YOU] row
    const lbAvatar = document.getElementById('lb-you-avatar');
    const lbName   = document.getElementById('lb-you-name');
    if (lbAvatar) lbAvatar.textContent = initials;
    if (lbName)   lbName.innerHTML = displayName + ' <span style="font-size:9px;color:var(--accent);font-family:\'Share Tech Mono\'">[YOU]</span>';
  }
});

// ── Global: apply saved username on any page ─
(function applyUsernameEverywhere() {
  const name     = sessionStorage.getItem('th_displayName');
  const initials = sessionStorage.getItem('th_initials');
  if (!name) return;
  document.querySelectorAll('.user-name').forEach(el => { el.textContent = name; });
  document.querySelectorAll('.avatar, .lb-av').forEach(el => { if (el.textContent === 'AK') el.textContent = initials; });
  // Update any greeting text
  document.querySelectorAll('[data-username]').forEach(el => { el.textContent = name; });
})();

// ── Routing Helpers (used in HTML onclick) ───
window.goToLogin   = () => { location.href = 'login.html'; };
window.goToDashboard = () => { location.href = 'dashboard.html'; };
window.goToLanding = () => { location.href = 'landing.html'; };

// ── Login Page Logic ─────────────────────────
if (PAGE === 'login') {

  let selectedRole = null;

  window.selectRole = (role) => {
    selectedRole = role;
    document.getElementById('card-dev').classList.remove('selected');
    document.getElementById('card-emp').classList.remove('selected');
    const cb = document.getElementById('continue-role');
    if (role === 'developer') {
      document.getElementById('card-dev').classList.add('selected');
      cb.textContent = 'CONTINUE AS DEVELOPER →';
      cb.className = 'continue-btn';
    } else {
      document.getElementById('card-emp').classList.add('selected');
      cb.textContent = 'CONTINUE AS EMPLOYER →';
      cb.className = 'continue-btn green';
    }
    cb.disabled = false;
    sessionStorage.setItem('th_role', role);
  };

  window.goToAuth = () => {
    if (!selectedRole) return;
    document.getElementById('screen-role').classList.remove('active');
    document.getElementById('screen-auth').classList.add('active');
    const isDev = selectedRole === 'developer';
    const tag = document.getElementById('auth-role-tag');
    tag.textContent = isDev ? 'DEVELOPER' : 'EMPLOYER';
    tag.className = 'auth-role-tag ' + (isDev ? 'dev' : 'emp');
    document.getElementById('auth-sub').textContent = isDev ? 'Sign in to enter the arena' : 'Sign in to find top talent';
    const inputs = document.querySelectorAll('.form-input');
    const tabs   = document.querySelectorAll('.tab');
    const cBtn   = document.getElementById('login-btn');
    const sBtn   = document.getElementById('signup-btn');
    if (isDev) {
      inputs.forEach(i => { i.classList.remove('emp'); i.classList.add('dev'); });
      tabs.forEach(t   => { t.classList.remove('emp-tab'); t.classList.add('dev-tab'); });
      cBtn.className = 'continue-btn';
      sBtn.className = 'continue-btn';
    } else {
      inputs.forEach(i => { i.classList.remove('dev'); i.classList.add('emp'); });
      tabs.forEach(t   => { t.classList.remove('dev-tab'); t.classList.add('emp-tab'); });
      cBtn.className = 'continue-btn green';
      sBtn.className = 'continue-btn green';
    }
    document.getElementById('sys-line').textContent = isDev
      ? '// DEVELOPER PORTAL · TALENT HUNT'
      : '// EMPLOYER PORTAL · TALENT HUNT';
  };

  window.goBack = () => {
    document.getElementById('screen-auth').classList.remove('active');
    document.getElementById('screen-role').classList.add('active');
    document.getElementById('sys-line').textContent = '// SYSTEM READY · TALENT HUNT v1.0';
  };

  window.switchTab = (tab) => {
    const isLogin = tab === 'login';
    document.getElementById('tab-login').classList.toggle('active', isLogin);
    document.getElementById('tab-signup').classList.toggle('active', !isLogin);
    document.getElementById('login-form').style.display  = isLogin ? 'block' : 'none';
    document.getElementById('signup-form').style.display = isLogin ? 'none'  : 'block';
    document.getElementById('auth-title').textContent = isLogin ? 'WELCOME BACK' : 'JOIN THE HUNT';
    document.getElementById('auth-sub').textContent = isLogin
      ? (selectedRole === 'developer' ? 'Sign in to enter the arena' : 'Sign in to find top talent')
      : (selectedRole === 'developer' ? 'Create your developer profile' : 'Start hiring on merit');
  };

  // Email/password login
  window.doLogin = async () => {
    const email    = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    if (!email || !password) { showError('Please fill in all fields.'); return; }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      location.href = 'dashboard.html';
    } catch (err) {
      showError(friendlyError(err.code));
    }
  };

  // Email/password sign-up
  window.doSignup = async () => {
    const name     = document.getElementById('signup-name')?.value.trim();
    const email    = document.getElementById('signup-email')?.value.trim();
    const password = document.getElementById('signup-password')?.value;
    if (!email || !password) { showError('Please fill in all fields.'); return; }
    if (!name) { showError('Please enter your full name.'); return; }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Save display name to Firebase profile
      await updateProfile(cred.user, { displayName: name });
      location.href = 'dashboard.html';
    } catch (err) {
      showError(friendlyError(err.code));
    }
  };

  // Google OAuth
  window.doGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      location.href = 'dashboard.html';
    } catch (err) {
      showError(friendlyError(err.code));
    }
  };

  function showError(msg) {
    let el = document.getElementById('auth-error');
    if (!el) {
      el = document.createElement('div');
      el.id = 'auth-error';
      el.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--danger);text-align:center;margin-bottom:12px;padding:8px;background:rgba(255,68,102,0.08);border:1px solid rgba(255,68,102,0.3);border-radius:3px;";
      document.getElementById('login-form').prepend(el);
    }
    el.textContent = '⚠ ' + msg;
  }

  function friendlyError(code) {
    const map = {
      'auth/user-not-found':   'No account found with that email.',
      'auth/wrong-password':   'Incorrect password.',
      'auth/invalid-email':    'Invalid email address.',
      'auth/email-already-in-use': 'Email already in use.',
      'auth/weak-password':    'Password must be at least 6 characters.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    };
    return map[code] || 'Something went wrong. Please try again.';
  }

  // Particle generator
  const pc = document.getElementById('particles');
  if (pc) {
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (6 + Math.random() * 14) + 's';
      p.style.animationDelay    = Math.random() * 10 + 's';
      p.style.background = ['#00d4ff','#00ff88','#a855f7'][Math.floor(Math.random() * 3)];
      pc.appendChild(p);
    }
  }
}

// ── Dashboard Page Logic ─────────────────────
if (PAGE === 'dashboard') {

  window.setMode = (btn, mode) => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('blind-banner').style.display = mode === 'hire' ? 'flex' : 'none';
  };

  window.setTab = (btn) => {
    btn.parentElement.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  };

  window.genQ = () => {
    const val = document.getElementById('mock-input').value.trim();
    if (!val) { location.href = 'mockbot.html'; return; }
    location.href = 'mockbot.html?q=' + encodeURIComponent(val);
  };

  window.doSignOut = async () => {
    await signOut(auth);
    location.href = 'landing.html';
  };

  // Countdown timer
  let t = 8 * 60 + 42;
  setInterval(() => {
    if (t <= 0) t = 15 * 60;
    t--;
    const m = Math.floor(t / 60), s = t % 60;
    const el = document.getElementById('clash-timer');
    if (el) el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }, 1000);

  // Simulation terminal
  const lines = [
    '<div class="line-ok">[09:52] ✓ Hotfix deployed · DB restored</div>',
    '<div class="line-warn">[09:55] ⚠ New req: Add payment retry logic</div>',
    '<div class="line-cmd">[09:56] $ New simulation event incoming...</div>'
  ];
  let idx = 0;
  setInterval(() => {
    if (idx < lines.length) {
      const term = document.getElementById('sim-t');
      if (term) { term.insertAdjacentHTML('beforeend', lines[idx++]); term.scrollTop = term.scrollHeight; }
    }
  }, 3500);
}

// ── Landing Page Logic ───────────────────────
if (PAGE === 'landing') {
  // Countdown timer for clash preview
  let t = 8 * 60 + 42;
  setInterval(() => {
    if (t <= 0) t = 15 * 60;
    t--;
    const m = Math.floor(t / 60), s = t % 60;
    const el = document.getElementById('clash-timer');
    if (el) el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }, 1000);
}