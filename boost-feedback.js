import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

// Chaves públicas do projeto Firebase (seguro expor no navegador — o controle
// de acesso real é feito pelas regras de segurança do Firestore, não por aqui).
const firebaseConfig = {
  apiKey: 'AIzaSyBGmSqGokpb6WGoI61j1lK_NGkf_Jssz7I',
  authDomain: 'amaral-boost.firebaseapp.com',
  projectId: 'amaral-boost',
  storageBucket: 'amaral-boost.firebasestorage.app',
  messagingSenderId: '141467748232',
  appId: '1:141467748232:web:13ff69d97629625e915c3d',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const pixButton = document.querySelector('[data-copy-pix]');

pixButton?.addEventListener('click', async () => {
  const key = pixButton.dataset.pixKey;
  const label = pixButton.querySelector('small');
  try {
    await navigator.clipboard.writeText(key);
    label.textContent = 'Chave PIX copiada!';
  } catch {
    label.textContent = key;
  }
  window.setTimeout(() => { label.textContent = 'Copiar chave PIX'; }, 3500);
});

const feedbackForm = document.querySelector('[data-feedback-form]');
const feedbackStatus = document.querySelector('[data-feedback-status]');
const suggestionList = document.querySelector('[data-suggestion-list]');
const storageKey = 'amaralBoostSuggestions';

// Guarda localmente só as sugestões enviadas por ESTE navegador, para exibir
// de volta ao próprio visitante. O registro "de verdade" fica no Firestore.
const getLocalSuggestions = () => {
  try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; }
};
const saveLocalSuggestions = (suggestions) => localStorage.setItem(storageKey, JSON.stringify(suggestions));
const formatTime = (timestamp) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(timestamp));

const renderSuggestions = () => {
  if (!suggestionList) return;
  const suggestions = getLocalSuggestions().sort((a, b) => b.createdAt - a.createdAt);
  suggestionList.replaceChildren();
  if (!suggestions.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-suggestions';
    empty.textContent = 'As sugestões enviadas neste navegador aparecerão aqui.';
    suggestionList.append(empty);
    return;
  }
  suggestions.forEach((suggestion) => {
    const card = document.createElement('article'); card.className = 'suggestion-card';
    const title = document.createElement('h3'); title.textContent = suggestion.title;
    const message = document.createElement('p'); message.textContent = suggestion.message;
    const meta = document.createElement('div'); meta.className = 'suggestion-meta';
    const author = document.createElement('span'); author.textContent = `${suggestion.name} · ${formatTime(suggestion.createdAt)}`;
    const state = document.createElement('strong'); state.className = 'is-viewed'; state.textContent = 'Enviada';
    meta.append(author, state); card.append(title, message, meta); suggestionList.append(card);
  });
};

feedbackForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(feedbackForm);
  const suggestion = { name: data.get('name').trim(), title: data.get('title').trim(), message: data.get('message').trim() };
  if (!suggestion.name || !suggestion.title || !suggestion.message) return;

  const submitButton = feedbackForm.querySelector('.feedback-submit');
  submitButton.disabled = true;
  feedbackStatus.textContent = 'Enviando...';

  try {
    await addDoc(collection(db, 'suggestions'), { ...suggestion, createdAt: serverTimestamp() });
    saveLocalSuggestions([...getLocalSuggestions(), { ...suggestion, createdAt: Date.now() }]);
    feedbackForm.reset();
    feedbackStatus.textContent = 'Sugestão enviada com sucesso. Obrigado!';
    renderSuggestions();
  } catch (error) {
    console.error(error);
    feedbackStatus.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
  } finally {
    submitButton.disabled = false;
  }
});

renderSuggestions();
