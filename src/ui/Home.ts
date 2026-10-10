import { html } from 'hono/html'

export const HomePage = () => html`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#101513" />
    <title>Todo API | Hono</title>
    <style>
      :root {
        color-scheme: dark;
        --ink: #edf3ec;
        --muted: #9ea9a1;
        --dim: #68746c;
        --surface: #171e1a;
        --surface-strong: #202a24;
        --line: #304038;
        --lime: #d8f36a;
        --coral: #ff816d;
        --cyan: #86d8cf;
        --bg: #101513;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--ink);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      body::before {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: .38;
        background-image: linear-gradient(rgba(216,243,106,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(216,243,106,.035) 1px, transparent 1px);
        background-size: 44px 44px;
        mask-image: linear-gradient(to bottom, black, transparent 80%);
      }
      a { color: inherit; text-decoration: none; }
      .shell { width: min(1180px, calc(100% - 40px)); margin: 0 auto; position: relative; }
      .topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 0 22px; border-bottom: 1px solid var(--line); }
      .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: -.05em; }
      .brand-mark { width: 28px; height: 28px; display: grid; place-items: center; border: 1px solid var(--lime); color: var(--lime); transform: rotate(45deg); }
      .brand-mark span { transform: rotate(-45deg); font-size: 13px; }
      .top-status { display: flex; align-items: center; gap: 9px; color: var(--muted); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
      .pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--lime); box-shadow: 0 0 0 5px rgba(216,243,106,.1); }
      .hero { display: grid; grid-template-columns: 1.25fr .75fr; gap: 60px; padding: 76px 0 64px; align-items: end; }
      .eyebrow { color: var(--lime); font-size: 11px; letter-spacing: .16em; text-transform: uppercase; margin: 0 0 20px; }
      h1 { max-width: 760px; margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(48px, 8vw, 98px); font-weight: 400; line-height: .9; letter-spacing: -.07em; }
      h1 em { color: var(--coral); font-style: normal; }
      .hero-copy { color: var(--muted); line-height: 1.8; max-width: 510px; margin: 26px 0 0; font-size: 14px; }
      .hero-aside { border-left: 1px solid var(--line); padding-left: 28px; }
      .aside-label { color: var(--dim); font-size: 10px; text-transform: uppercase; letter-spacing: .14em; }
      .terminal { margin-top: 14px; padding: 17px; background: #0b0f0d; border: 1px solid var(--line); color: var(--muted); font-size: 12px; line-height: 1.9; }
      .terminal strong { color: var(--lime); font-weight: 400; }
      .terminal .comment { color: var(--dim); }
      .section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; }
      .section-head h2 { margin: 0; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; font-weight: 500; }
      .section-head span { color: var(--dim); font-size: 11px; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      .card { min-height: 190px; padding: 23px; background: rgba(23,30,26,.9); border: 1px solid var(--line); transition: border-color .2s, transform .2s, background .2s; }
      .card:hover { border-color: var(--lime); background: var(--surface-strong); transform: translateY(-3px); }
      .card-number { color: var(--dim); font-size: 11px; }
      .card h3 { margin: 28px 0 11px; font-size: 19px; font-weight: 500; letter-spacing: -.06em; }
      .card p { color: var(--muted); font-size: 12px; line-height: 1.6; margin: 0; }
      .card-arrow { display: block; margin-top: 22px; color: var(--lime); font-size: 12px; }
      .lower { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 64px 0 76px; }
      .panel { border-top: 1px solid var(--line); padding-top: 17px; }
      .metric { display: flex; justify-content: space-between; align-items: end; padding: 18px 0; border-bottom: 1px solid var(--line); }
      .metric-label { color: var(--muted); font-size: 12px; }
      .metric-value { color: var(--cyan); font-family: Georgia, 'Times New Roman', serif; font-size: 30px; }
      #todo-list { min-height: 142px; }
      .todo { display: flex; gap: 12px; align-items: center; padding: 13px 0; border-bottom: 1px solid var(--line); font-size: 12px; }
      .todo-id { color: var(--coral); width: 25px; }
      .todo-title { color: var(--muted); }
      .loading { color: var(--dim); padding: 22px 0; font-size: 12px; }
      .auth-form, .todo-create { display: grid; gap: 12px; }
      .auth-fields { display: grid; gap: 10px; }
      .auth-fields label { display: grid; gap: 6px; color: var(--muted); font-size: 11px; }
      .auth-fields input, .todo-create input {
        min-width: 0;
        padding: 12px;
        background: #0b0f0d;
        border: 1px solid var(--line);
        color: var(--ink);
        font: inherit;
        font-size: 12px;
      }
      .auth-actions { display: flex; gap: 10px; }
      button {
        padding: 10px 13px;
        border: 1px solid var(--lime);
        background: var(--lime);
        color: var(--bg);
        cursor: pointer;
        font: inherit;
        font-size: 11px;
      }
      button.secondary { background: transparent; color: var(--lime); }
      button:disabled { cursor: wait; opacity: .6; }
      .auth-message { min-height: 18px; color: var(--muted); font-size: 11px; line-height: 1.5; }
      .auth-message.error { color: var(--coral); }
      .account-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 10px 0 20px; }
      .account-email { overflow-wrap: anywhere; color: var(--cyan); font-size: 12px; }
      .todo-delete { margin-left: auto; padding: 6px 9px; border-color: var(--line); background: transparent; color: var(--coral); }
      footer { display: flex; justify-content: space-between; border-top: 1px solid var(--line); padding: 20px 0 28px; color: var(--dim); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
      @media (max-width: 760px) {
        .shell { width: min(100% - 28px, 600px); }
        .topbar { padding-top: 20px; }
        .hero { display: block; padding: 58px 0 46px; }
        .hero-aside { margin-top: 42px; padding-left: 18px; }
        .grid, .lower { grid-template-columns: 1fr; }
        .card { min-height: auto; }
        footer { gap: 14px; flex-direction: column; }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <header class="topbar">
        <a class="brand" href="/" aria-label="Todo API home"><span class="brand-mark"><span>H</span></span><span>TODO / API</span></a>
        <span class="top-status"><span class="pulse"></span> service online</span>
      </header>

      <section class="hero">
        <div>
          <p class="eyebrow">Hono-powered workspace</p>
          <h1>Small API.<br /><em>Sharp edges.</em></h1>
          <p class="hero-copy">A fast, uncomplicated home for your todo service. Create an account to manage private todos, or inspect the API contract.</p>
        </div>
        <aside class="hero-aside">
          <span class="aside-label">quick start</span>
          <div class="terminal"><span class="comment">// authenticate</span><br /><strong>$</strong> POST /auth/login<br /><span class="comment">// access private data</span><br /><strong>$</strong> Bearer &lt;access-token&gt;</div>
        </aside>
      </section>

      <section>
        <div class="section-head"><h2>Developer surfaces</h2><span>03 available now</span></div>
        <div class="grid">
          <a class="card" href="/scalar"><span class="card-number">01 / explore</span><h3>Scalar reference</h3><p>A polished, interactive view of every endpoint and its request contract.</p><span class="card-arrow">Open reference -&gt;</span></a>
          <a class="card" href="/ui"><span class="card-number">02 / test</span><h3>Swagger UI</h3><p>Classic try-it-out documentation for quick manual API experiments.</p><span class="card-arrow">Launch Swagger -&gt;</span></a>
          <a class="card" href="/doc"><span class="card-number">03 / inspect</span><h3>OpenAPI JSON</h3><p>The raw machine-readable contract behind the documentation tools.</p><span class="card-arrow">View document -&gt;</span></a>
        </div>
      </section>

      <section class="lower">
        <div class="panel">
          <div class="section-head"><h2>Runtime pulse</h2><span id="health-label">checking...</span></div>
          <div class="metric"><span class="metric-label">framework</span><span class="metric-value">Hono</span></div>
          <div class="metric"><span class="metric-label">transport</span><span class="metric-value">HTTP</span></div>
          <div class="metric"><span class="metric-label">status</span><span class="metric-value" id="health-value">...</span></div>
        </div>
        <div class="panel">
          <div class="section-head"><h2>Your workspace</h2><span>JWT protected</span></div>
          <form id="auth-form" class="auth-form">
            <div class="auth-fields">
              <label>Email<input id="auth-email" name="email" type="email" autocomplete="email" required maxlength="254" /></label>
              <label>Password<input id="auth-password" name="password" type="password" autocomplete="current-password" required minlength="12" maxlength="128" /></label>
            </div>
            <div class="auth-actions">
              <button type="submit" value="login">Sign in</button>
              <button type="submit" value="register" class="secondary">Create account</button>
            </div>
          </form>
          <div id="account" hidden>
            <div class="account-bar"><span id="account-email" class="account-email"></span><button id="logout" class="secondary" type="button">Sign out</button></div>
            <form id="todo-create" class="todo-create">
              <label class="aside-label" for="todo-title-input">New todo</label>
              <div class="auth-actions">
                <input id="todo-title-input" name="title" required maxlength="200" placeholder="What needs doing?" />
                <button type="submit">Add</button>
              </div>
            </form>
          </div>
          <p id="auth-message" class="auth-message" role="status" aria-live="polite">Sign in or create an account to load your todos.</p>
          <div id="todo-list" aria-live="polite"></div>
        </div>
      </section>

      <footer><span>Built with Hono</span><span>localhost / todo service</span></footer>
    </main>
    <script>
      const healthLabel = document.getElementById('health-label');
      const healthValue = document.getElementById('health-value');
      const todoList = document.getElementById('todo-list');
      const authForm = document.getElementById('auth-form');
      const accountPanel = document.getElementById('account');
      const accountEmail = document.getElementById('account-email');
      const authMessage = document.getElementById('auth-message');
      const todoForm = document.getElementById('todo-create');
      let accessToken = null;

      function setMessage(message, isError) {
        authMessage.textContent = message;
        authMessage.classList.toggle('error', isError);
      }

      async function readJson(response) {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const message = (await response.text()).trim();
          if (!response.ok) {
            throw new Error(message || 'Request failed (' + response.status + ')');
          }
          throw new Error('Expected a JSON response from the server.');
        }

        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error('The server returned invalid JSON. Please try again.');
        }

        if (!response.ok) {
          throw new Error(data && typeof data.error === 'string' ? data.error : 'Request failed (' + response.status + ')');
        }
        return data;
      }

      function renderTodos(todos) {
        todoList.replaceChildren();
        if (todos.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'loading';
          empty.textContent = accessToken ? 'No todos yet. Add one above.' : 'Sign in to load your todos.';
          todoList.append(empty);
          return;
        }
        todos.forEach((todo) => {
          const row = document.createElement('div');
          row.className = 'todo';
          const id = document.createElement('span');
          id.className = 'todo-id';
          id.textContent = '#' + todo.id;
          const title = document.createElement('span');
          title.className = 'todo-title';
          title.textContent = todo.title;
          const remove = document.createElement('button');
          remove.className = 'todo-delete';
          remove.type = 'button';
          remove.textContent = 'Remove';
          remove.setAttribute('aria-label', 'Remove todo ' + todo.id);
          remove.addEventListener('click', async () => {
            try {
              await readJson(await fetch('/todos/' + todo.id, {
                method: 'DELETE',
                headers: { Authorization: 'Bearer ' + accessToken }
              }));
              await loadTodos();
            } catch (error) {
              setMessage(error.message, true);
            }
          });
          row.append(id, title, remove);
          todoList.append(row);
        });
      }

      async function loadTodos() {
        const todos = await readJson(await fetch('/todos', {
          headers: { Authorization: 'Bearer ' + accessToken }
        }));
        renderTodos(todos);
      }

      fetch('/health').then((response) => response.text()).then((value) => {
        healthLabel.textContent = 'responding';
        healthValue.textContent = value;
      }).catch(() => {
        healthLabel.textContent = 'unavailable';
        healthValue.textContent = 'OFFLINE';
      });

      authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitter = event.submitter;
        const action = submitter && submitter.value === 'register' ? 'register' : 'login';
        if (submitter) submitter.disabled = true;
        setMessage(action === 'register' ? 'Creating your account...' : 'Signing in...', false);
        try {
          const result = await readJson(await fetch('/auth/' + action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: document.getElementById('auth-email').value,
              password: document.getElementById('auth-password').value
            })
          }));
          accessToken = result.accessToken;
          accountEmail.textContent = result.user.email;
          authForm.hidden = true;
          accountPanel.hidden = false;
          document.getElementById('auth-password').value = '';
          setMessage('Signed in. Your todo data is private to your account.', false);
          await loadTodos();
        } catch (error) {
          setMessage(error.message, true);
        } finally {
          if (submitter) submitter.disabled = false;
        }
      });

      todoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitter = todoForm.querySelector('button[type="submit"]');
        submitter.disabled = true;
        try {
          await readJson(await fetch('/todos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + accessToken
            },
            body: JSON.stringify({ title: document.getElementById('todo-title-input').value })
          }));
          todoForm.reset();
          setMessage('Todo added.', false);
          await loadTodos();
        } catch (error) {
          setMessage(error.message, true);
        } finally {
          submitter.disabled = false;
        }
      });

      document.getElementById('logout').addEventListener('click', () => {
        accessToken = null;
        authForm.hidden = false;
        accountPanel.hidden = true;
        renderTodos([]);
        setMessage('Signed out. Sign in to load your todos.', false);
      });
    </script>
  </body>
</html>`
