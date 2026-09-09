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
const viewedAfter = 2 * 60 * 60 * 1000;

const getSuggestions = () => {
  try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; }
};
const saveSuggestions = (suggestions) => localStorage.setItem(storageKey, JSON.stringify(suggestions));
const formatTime = (timestamp) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(timestamp));

const renderSuggestions = () => {
  if (!suggestionList) return;
  const suggestions = getSuggestions().sort((a, b) => b.createdAt - a.createdAt);
  suggestionList.replaceChildren();
  if (!suggestions.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-suggestions';
    empty.textContent = 'As sugestões enviadas neste navegador aparecerão aqui.';
    suggestionList.append(empty);
    return;
  }
  suggestions.forEach((suggestion) => {
    const viewed = Date.now() - suggestion.createdAt >= viewedAfter;
    const card = document.createElement('article'); card.className = 'suggestion-card';
    const title = document.createElement('h3'); title.textContent = suggestion.title;
    const message = document.createElement('p'); message.textContent = suggestion.message;
    const meta = document.createElement('div'); meta.className = 'suggestion-meta';
    const author = document.createElement('span'); author.textContent = `${suggestion.name} · ${formatTime(suggestion.createdAt)}`;
    const state = document.createElement('strong'); state.className = viewed ? 'is-viewed' : ''; state.textContent = viewed ? 'Vista pelo admin' : 'Recebida';
    meta.append(author, state); card.append(title, message, meta); suggestionList.append(card);
  });
};

feedbackForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(feedbackForm);
  const suggestion = { name: data.get('name').trim(), title: data.get('title').trim(), message: data.get('message').trim(), createdAt: Date.now() };
  if (!suggestion.name || !suggestion.title || !suggestion.message) return;
  saveSuggestions([...getSuggestions(), suggestion]);
  feedbackForm.reset();
  feedbackStatus.textContent = 'Sugestão recebida. Ela será marcada como vista pelo admin em até 2 horas.';
  renderSuggestions();
});

renderSuggestions();
window.setInterval(renderSuggestions, 60 * 1000);
