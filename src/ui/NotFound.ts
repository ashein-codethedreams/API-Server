import { html } from 'hono/html'

interface NotFoundProps {
  path?: string
  method?: string
}

export const NotFoundPage = ({ path = '', method = 'GET' }: NotFoundProps = {}) => html`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#101513" />
    <title>404 Not Found | Hono API</title>
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
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      body::before {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: .38;
        background-image: linear-gradient(rgba(216,243,106,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(216,243,106,.035) 1px, transparent 1px);
        background-size: 44px 44px;
        mask-image: linear-gradient(to bottom, black, transparent 85%);
      }
      a { color: inherit; text-decoration: none; }
      .shell {
        width: min(1180px, calc(100% - 40px));
        margin: 0 auto;
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 28px 0 22px;
        border-bottom: 1px solid var(--line);
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 800;
        letter-spacing: -.05em;
      }
      .brand-mark {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border: 1px solid var(--lime);
        color: var(--lime);
        transform: rotate(45deg);
      }
      .brand-mark span {
        transform: rotate(-45deg);
        font-size: 13px;
      }
      .top-status {
        display: flex;
        align-items: center;
        gap: 9px;
        color: var(--coral);
        font-size: 11px;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .pulse-coral {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--coral);
        box-shadow: 0 0 0 5px rgba(255,129,109,.15);
        animation: blink 2s infinite ease-in-out;
      }
      @keyframes blink {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: .4; transform: scale(0.9); }
      }

      .hero {
        display: grid;
        grid-template-columns: 1.2fr .8fr;
        gap: 60px;
        padding: 96px 0 80px;
        align-items: center;
      }
      .eyebrow {
        color: var(--coral);
        font-size: 11px;
        letter-spacing: .16em;
        text-transform: uppercase;
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .eyebrow-badge {
        background: rgba(255, 129, 109, 0.12);
        border: 1px solid rgba(255, 129, 109, 0.3);
        padding: 2px 7px;
        border-radius: 2px;
        font-weight: 600;
      }
      h1 {
        max-width: 760px;
        margin: 0;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: clamp(48px, 7.5vw, 92px);
        font-weight: 400;
        line-height: .95;
        letter-spacing: -.06em;
      }
      h1 em {
        color: var(--coral);
        font-style: normal;
      }
      .hero-copy {
        color: var(--muted);
        line-height: 1.8;
        max-width: 530px;
        margin: 24px 0 0;
        font-size: 14px;
      }
      .bad-route {
        display: inline-block;
        color: var(--ink);
        background: #0d1210;
        border: 1px solid var(--line);
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 13px;
        word-break: break-all;
      }
      .hero-actions {
        display: flex;
        gap: 14px;
        margin-top: 32px;
        flex-wrap: wrap;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 22px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: .04em;
        text-transform: uppercase;
        border: 1px solid var(--lime);
        background: var(--lime);
        color: #101513;
        transition: all .2s ease;
        cursor: pointer;
      }
      .btn:hover {
        background: transparent;
        color: var(--lime);
        box-shadow: 0 0 15px rgba(216, 243, 106, 0.2);
      }
      .btn-outline {
        background: transparent;
        border-color: var(--line);
        color: var(--muted);
      }
      .btn-outline:hover {
        border-color: var(--lime);
        color: var(--ink);
        background: var(--surface);
      }

      .hero-aside {
        border-left: 1px solid var(--line);
        padding-left: 28px;
      }
      .aside-label {
        color: var(--dim);
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: .14em;
      }
      .terminal {
        margin-top: 14px;
        padding: 20px;
        background: #0b0f0d;
        border: 1px solid var(--line);
        color: var(--muted);
        font-size: 12px;
        line-height: 1.9;
        overflow-x: auto;
      }
      .terminal strong { color: var(--lime); font-weight: 400; }
      .terminal .err { color: var(--coral); }
      .terminal .comment { color: var(--dim); }

      footer {
        display: flex;
        justify-content: space-between;
        border-top: 1px solid var(--line);
        padding: 20px 0 28px;
        color: var(--dim);
        font-size: 10px;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      @media (max-width: 760px) {
        .shell { width: min(100% - 28px, 600px); }
        .topbar { padding-top: 20px; }
        .hero { display: block; padding: 56px 0 44px; }
        .hero-aside { margin-top: 40px; padding-left: 18px; }
        footer { gap: 14px; flex-direction: column; }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <header class="topbar">
        <a class="brand" href="/" aria-label="Todo API home">
          <span class="brand-mark"><span>H</span></span>
          <span>TODO / API</span>
        </a>
        <span class="top-status">
          <span class="pulse-coral"></span>
          404 route missing
        </span>
      </header>

      <section class="hero">
        <div>
          <p class="eyebrow">
            <span class="eyebrow-badge">404</span>
            <span>Hono Routing Engine</span>
          </p>
          <h1>Lost in the<br /><em>routing tree.</em></h1>
          <p class="hero-copy">
            The router evaluated <span class="bad-route">${method} ${path || '(unknown)'}</span> against all registered handlers, but found no match in the dispatch trie.
          </p>
          <div class="hero-actions">
            <a href="/" class="btn">&larr; Return to Home</a>
            <a href="/scalar" class="btn btn-outline">API Docs</a>
          </div>
        </div>

        <aside class="hero-aside">
          <span class="aside-label">Router Trace</span>
          <div class="terminal">
            <span class="comment">// incoming request</span><br />
            <strong>&gt;</strong> ${method} ${path || '/'}<br />
            <span class="comment">// router lookup</span><br />
            <span class="err">! 404 NOT_FOUND</span><br />
            <span class="comment">// resolution</span><br />
            No handler matched path
          </div>
        </aside>
      </section>

      <footer>
        <span>Hono API Server</span>
        <span>Status 404 &bull; Not Found</span>
      </footer>
    </main>
  </body>
</html>`
