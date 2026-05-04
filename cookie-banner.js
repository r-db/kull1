(function() {
  var KEY = 'kull1_cookies_v1';
  if (localStorage.getItem(KEY)) return;

  var html =
    '<div id="cb-overlay"></div>' +
    '<div id="cb" role="dialog" aria-modal="true" aria-label="Cookie Preferences">' +
      '<div id="cb-header">' +
        '<p id="cb-title">Cookie Preferences</p>' +
        '<p id="cb-desc">We use cookies to keep you signed in, understand how the platform is used, and save your preferences. You can choose which non-essential cookies to allow.</p>' +
      '</div>' +
      '<div id="cb-categories">' +

        '<div class="cb-cat">' +
          '<div class="cb-cat-info">' +
            '<p class="cb-cat-name">Essential</p>' +
            '<p class="cb-cat-desc">Login sessions, security tokens, and form state. Required for the platform to function — cannot be disabled.</p>' +
          '</div>' +
          '<div class="cb-toggle cb-toggle-locked" aria-label="Essential cookies always active">' +
            '<div class="cb-track cb-track-on"><div class="cb-thumb"></div></div>' +
            '<span class="cb-toggle-label">Always on</span>' +
          '</div>' +
        '</div>' +

        '<div class="cb-cat">' +
          '<div class="cb-cat-info">' +
            '<p class="cb-cat-name">Analytics</p>' +
            '<p class="cb-cat-desc">Aggregated, anonymized data on how pages and features are used. Helps us improve the platform. No individual tracking.</p>' +
          '</div>' +
          '<label class="cb-toggle" aria-label="Toggle analytics cookies">' +
            '<input type="checkbox" id="cb-analytics" checked />' +
            '<div class="cb-track"><div class="cb-thumb"></div></div>' +
          '</label>' +
        '</div>' +

        '<div class="cb-cat">' +
          '<div class="cb-cat-info">' +
            '<p class="cb-cat-name">Functional</p>' +
            '<p class="cb-cat-desc">Remembers your settings and preferences across sessions, such as notification preferences and display options.</p>' +
          '</div>' +
          '<label class="cb-toggle" aria-label="Toggle functional cookies">' +
            '<input type="checkbox" id="cb-functional" checked />' +
            '<div class="cb-track"><div class="cb-thumb"></div></div>' +
          '</label>' +
        '</div>' +

      '</div>' +
      '<div id="cb-actions">' +
        '<button id="cb-reject">Reject Non-Essential</button>' +
        '<button id="cb-accept">Accept All</button>' +
      '</div>' +
      '<p id="cb-footnote"><a href="cookies.html">Cookie Policy</a> &nbsp;&middot;&nbsp; <a href="privacy.html">Privacy Policy</a></p>' +
    '</div>';

  var css =
    '#cb-overlay{' +
      'display:none;' +   /* no overlay — card only, not blocking */
    '}' +
    '#cb{' +
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(140%);' +
      'z-index:9999;' +
      'width:min(520px,calc(100vw - 32px));' +
      'background:#1A1E24;' +
      'border:1px solid rgba(255,255,255,0.1);' +
      'border-radius:12px;' +
      'box-shadow:0 24px 80px rgba(0,0,0,0.6),0 4px 16px rgba(0,0,0,0.4);' +
      'padding:28px 28px 20px;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;' +
      'transition:transform 0.4s cubic-bezier(0.16,1,0.3,1);' +
    '}' +
    '#cb.cb-visible{transform:translateX(-50%) translateY(0);}' +
    '#cb-title{' +
      'font-size:15px;font-weight:800;letter-spacing:-0.01em;color:#FFFFFF;margin-bottom:8px;' +
    '}' +
    '#cb-desc{' +
      'font-size:13px;line-height:1.6;color:rgba(255,255,255,0.5);margin-bottom:20px;' +
    '}' +
    '#cb-categories{' +
      'display:flex;flex-direction:column;gap:0;' +
      'border-top:1px solid rgba(255,255,255,0.07);' +
    '}' +
    '.cb-cat{' +
      'display:flex;align-items:center;justify-content:space-between;gap:16px;' +
      'padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.07);' +
    '}' +
    '.cb-cat-info{flex:1;}' +
    '.cb-cat-name{' +
      'font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;' +
      'color:rgba(255,255,255,0.85);margin-bottom:3px;' +
    '}' +
    '.cb-cat-desc{font-size:12px;line-height:1.55;color:rgba(255,255,255,0.38);}' +

    /* Toggle switch */
    '.cb-toggle{' +
      'display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0;cursor:pointer;' +
    '}' +
    '.cb-toggle input{position:absolute;opacity:0;width:0;height:0;}' +
    '.cb-track{' +
      'position:relative;width:40px;height:22px;' +
      'background:rgba(255,255,255,0.15);border-radius:11px;' +
      'transition:background 0.2s;flex-shrink:0;' +
    '}' +
    '.cb-thumb{' +
      'position:absolute;top:3px;left:3px;' +
      'width:16px;height:16px;border-radius:50%;background:#fff;' +
      'transition:transform 0.2s;' +
      'box-shadow:0 1px 4px rgba(0,0,0,0.35);' +
    '}' +
    '.cb-toggle input:checked ~ .cb-track{background:rgba(74,222,128,0.75);}' +
    '.cb-toggle input:checked ~ .cb-track .cb-thumb{transform:translateX(18px);}' +

    /* Locked "always on" toggle */
    '.cb-toggle-locked{cursor:default;}' +
    '.cb-track-on{background:rgba(255,255,255,0.2)!important;}' +
    '.cb-track-on .cb-thumb{transform:translateX(18px);}' +
    '.cb-toggle-label{font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.28);}' +

    '#cb-actions{' +
      'display:flex;gap:10px;margin-top:20px;' +
    '}' +
    '#cb-reject{' +
      'flex:1;padding:12px;' +
      'font-family:inherit;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;' +
      'color:rgba(255,255,255,0.55);' +
      'background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:6px;' +
      'cursor:pointer;transition:border-color 0.15s,color 0.15s;' +
    '}' +
    '#cb-reject:hover{border-color:rgba(255,255,255,0.35);color:rgba(255,255,255,0.8);}' +
    '#cb-accept{' +
      'flex:1;padding:12px;' +
      'font-family:inherit;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;' +
      'color:#111;background:#FFFFFF;border:none;border-radius:6px;' +
      'cursor:pointer;transition:opacity 0.15s;' +
    '}' +
    '#cb-accept:hover{opacity:0.88;}' +
    '#cb-footnote{' +
      'text-align:center;margin-top:14px;' +
      'font-size:11px;color:rgba(255,255,255,0.25);' +
    '}' +
    '#cb-footnote a{color:rgba(255,255,255,0.35);text-decoration:underline;text-underline-offset:2px;transition:color 0.15s;}' +
    '#cb-footnote a:hover{color:rgba(255,255,255,0.65);}' +
    '@media(max-width:560px){' +
      '#cb{bottom:0;left:0;right:0;width:100%;border-radius:16px 16px 0 0;transform:translateY(110%);}' +
      '#cb.cb-visible{transform:translateY(0);}' +
      '#cb-actions{flex-direction:column;}' +
    '}';

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  var wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap);

  var banner = document.getElementById('cb');

  setTimeout(function() { banner.classList.add('cb-visible'); }, 500);

  function save(analytics, functional) {
    localStorage.setItem(KEY, JSON.stringify({ analytics: analytics, functional: functional, ts: Date.now() }));
    banner.classList.remove('cb-visible');
    setTimeout(function() { wrap.remove(); }, 450);
  }

  document.getElementById('cb-accept').addEventListener('click', function() {
    save(true, true);
  });

  document.getElementById('cb-reject').addEventListener('click', function() {
    save(false, false);
  });
})();
