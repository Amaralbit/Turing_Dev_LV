import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

// Mesmas chaves públicas do app web (seguro expor — o acesso real é
// controlado pelas regras do Firestore + pela conta de login que você criar).
const firebaseConfig = {
  apiKey: 'AIzaSyBGmSqGokpb6WGoI61j1lK_NGkf_Jssz7I',
  authDomain: 'amaral-boost.firebaseapp.com',
  projectId: 'amaral-boost',
  storageBucket: 'amaral-boost.firebasestorage.app',
  messagingSenderId: '141467748232',
  appId: '1:141467748232:web:13ff69d97629625e915c3d',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginSection = document.querySelector('[data-admin-login]');
const panelSection = document.querySelector('[data-admin-panel]');
const loginForm = document.querySelector('[data-admin-login-form]');
const loginStatus = document.querySelector('[data-admin-login-status]');
const logoutButton = document.querySelector('[data-admin-logout]');
const suggestionList = document.querySelector('[data-admin-suggestions]');
const suggestionCount = document.querySelector('[data-admin-count]');

let unsubscribeSuggestions = null;

const formatTime = (date) => (date ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date) : '—');

const renderSuggestions = (docs) => {
  suggestionList.replaceChildren();
  suggestionCount.textContent = String(docs.length);
  if (!docs.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-suggestions';
    empty.textContent = 'Nenhuma sugestão recebida ainda.';
    suggestionList.append(empty);
    return;
  }
  docs.forEach((docSnap) => {
    const s = docSnap.data();
    const createdAt = s.createdAt?.toDate ? s.createdAt.toDate() : null;
    const card = document.createElement('article'); card.className = 'suggestion-card';
    const title = document.createElement('h3'); title.textContent = s.title || '(sem título)';
    const message = document.createElement('p'); message.textContent = s.message || '';
    card.append(title, message);
    if (s.discord) {
      const discordNote = document.createElement('p'); discordNote.className = 'suggestion-discord'; discordNote.textContent = `Discord: ${s.discord}`;
      card.append(discordNote);
    }
    const meta = document.createElement('div'); meta.className = 'suggestion-meta';
    const author = document.createElement('span'); author.textContent = `${s.name || 'Anônimo'} · ${formatTime(createdAt)}`;
    meta.append(author);
    card.append(meta);
    suggestionList.append(card);
  });
};

const startListening = () => {
  const q = query(collection(db, 'suggestions'), orderBy('createdAt', 'desc'));
  unsubscribeSuggestions = onSnapshot(q, (snapshot) => renderSuggestions(snapshot.docs), (error) => {
    console.error(error);
    suggestionList.replaceChildren();
    const errEl = document.createElement('p'); errEl.className = 'empty-suggestions'; errEl.textContent = 'Não foi possível carregar as sugestões.';
    suggestionList.append(errEl);
  });
};

const stopListening = () => {
  if (unsubscribeSuggestions) { unsubscribeSuggestions(); unsubscribeSuggestions = null; }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.hidden = true;
    panelSection.hidden = false;
    startListening();
  } else {
    panelSection.hidden = true;
    loginSection.hidden = false;
    stopListening();
  }
});

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = data.get('email').trim();
  const password = data.get('password');
  loginStatus.textContent = 'Entrando...';
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginStatus.textContent = '';
    loginForm.reset();
  } catch (error) {
    console.error(error);
    loginStatus.textContent = 'E-mail ou senha inválidos.';
  }
});

logoutButton?.addEventListener('click', () => signOut(auth));
