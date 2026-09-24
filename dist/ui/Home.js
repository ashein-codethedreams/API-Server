import { html } from 'hono/html';
export const HomePage = () => html `<!doctype html>
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
          <p class="hero-copy">A fast, uncomplicated home for your todo service. Inspect the contract, try the endpoints, or jump straight into the data.</p>
        </div>
        <aside class="hero-aside">
          <span class="aside-label">quick start</span>
          <div class="terminal"><span class="comment">// make a request</span><br /><strong>$</strong> curl /todos<br /><span class="comment">// ship the next idea</span><br /><strong>$</strong> npm run dev</div>
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
          <div class="section-head"><h2>Live todos</h2><a href="/todos" style="color: var(--lime); font-size: 11px;">GET /todos -&gt;</a></div>
          <div id="todo-list"><div class="loading">Fetching the latest todos...</div></div>
        </div>
      </section>

      <footer><span>Built with Hono</span><span>localhost / todo service</span></footer>
    </main>
    <script>
      const healthLabel = document.getElementById('health-label');
      const healthValue = document.getElementById('health-value');
      const todoList = document.getElementById('todo-list');
      fetch('/health').then((response) => response.text()).then((value) => {
        healthLabel.textContent = 'responding';
        healthValue.textContent = value;
      }).catch(() => {
        healthLabel.textContent = 'unavailable';
        healthValue.textContent = 'OFFLINE';
      });
      fetch('/todos').then((response) => response.json()).then((todos) => {
        todoList.innerHTML = todos.map((todo) => '<div class="todo"><span class="todo-id">#' + todo.id + '</span><span class="todo-title">' + todo.title + '</span></div>').join('');
      }).catch(() => {
        todoList.innerHTML = '<div class="loading">Todo stream unavailable.</div>';
      });
    </script>
  </body>
</html>`;
