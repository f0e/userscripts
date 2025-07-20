// ==UserScript==
// @name        Enable StackOverflow themes
// @namespace   https://github.com/f0e
// @author      f0e
// @version     1.0
// @match       https://stackoverflow.com/*
// @grant       none
// @run-at      document-start
// @updateURL   https://github.com/f0e/userscripts/raw/main/enable-stackoverflow-themes.user.js
// @downloadURL https://github.com/f0e/userscripts/raw/main/enable-stackoverflow-themes.user.js
// @supportURL  https://github.com/f0e/userscripts/issues
// ==/UserScript==

const observer = new MutationObserver(() => {
  if (!document.body) return;

  document.body.classList.add("theme-system");
  observer.disconnect();
});

observer.observe(document.documentElement, { childList: true, subtree: true });
