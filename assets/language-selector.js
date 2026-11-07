(() => {
  "use strict";
  const languages = [
    ["en", "English (default)"], ["es", "Español"], ["fr", "Français"],
    ["de", "Deutsch"], ["pt", "Português"], ["hi", "हिन्दी"],
    ["ar", "العربية"], ["zh-CN", "中文（简体）"], ["ja", "日本語"]
  ];
  const style = document.createElement("style");
  style.textContent = `
    .mc-language { display:flex; align-items:center; gap:8px; font:600 12px/1.35 Manrope,Inter,ui-sans-serif,system-ui,sans-serif; color:var(--muted,#5b6472); }
    .mc-language label { white-space:nowrap; }
    .mc-language select { max-width:155px; min-width:110px; padding:8px 9px; border:1px solid var(--line,#dce1e8); border-radius:8px; background:var(--surface,#fff); color:var(--text,#020C24); font:inherit; }
    .mc-language-help { display:none; position:absolute; z-index:20; bottom:calc(100% + 6px); left:0; width:245px; padding:10px 12px; border:1px solid var(--line,#dce1e8); border-radius:9px; background:var(--surface,#fff); color:var(--muted,#5b6472); box-shadow:0 8px 24px rgba(0,0,0,.08); font:400 12px/1.5 Manrope,Inter,ui-sans-serif,system-ui,sans-serif; }
    .mc-language-wrap { position:relative; }
    .mc-language-wrap:focus-within .mc-language-help, .mc-language-wrap:hover .mc-language-help { display:block; }
    nav .mc-language-wrap { margin-left:auto; margin-right:14px; }
    .mc-language-wrap.mc-floating { position:fixed; z-index:1000; top:12px; right:12px; padding:8px 10px; border:1px solid var(--line,#dce1e8); border-radius:10px; background:var(--surface,#fff); box-shadow:0 4px 18px rgba(0,0,0,.08); }
    @media(max-width:800px) {
      nav .mc-language-wrap { margin-left:0; margin-right:0; }
      .mc-language label { display:none; }
      .mc-language select { min-width:100px; max-width:128px; }
      nav .mc-language-wrap { order:3; }
      .mc-language-wrap.mc-floating { top:10px; right:10px; }
    }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement("div");
  wrap.className = "mc-language-wrap";
  wrap.innerHTML = '<div class="mc-language"><label for="mc-language-select">Translate</label><select id="mc-language-select" aria-label="Translate this page"><option value="en">English (default)</option><option value="es">Español</option><option value="fr">Français</option><option value="de">Deutsch</option><option value="pt">Português</option><option value="hi">हिन्दी</option><option value="ar">العربية</option><option value="zh-CN">中文（简体）</option><option value="ja">日本語</option></select></div><div class="mc-language-help">Free machine translation opens in Google Translate. If it does not work, use your browser menu and choose “Translate page”.</div>';
  // Lives in the footer so the header stays uncluttered.
  const footer = document.querySelector("footer");
  if (footer) {
    const holder = document.createElement("div");
    holder.className = "mc-footer-language";
    holder.appendChild(wrap);
    (footer.firstElementChild || footer).appendChild(holder);
  } else {
    wrap.classList.add("mc-floating");
    document.body.appendChild(wrap);
  }

  const select = wrap.querySelector("select");
  select.addEventListener("change", () => {
    const target = select.value;
    if (target === "en") {
      select.value = "en";
      return;
    }
    const translateUrl = "https://translate.google.com/translate?sl=auto&tl=" +
      encodeURIComponent(target) + "&u=" + encodeURIComponent(window.location.href);
    window.location.assign(translateUrl);
  });
})();