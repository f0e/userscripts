// ==UserScript==
// @name        csstats.gg alias finder
// @description Reveal past usernames and profile pictures by parsing match history
// @author      f0e
// @version     1.0
// @namespace   https://github.com/f0e
// @match       *://csgostats.gg/player/*#/matches
// @grant       GM.xmlHttpRequest
// @run-at      document-idle
// @updateURL   https://github.com/f0e/userscripts/raw/main/csstats-alias-finder.user.js
// @downloadURL https://github.com/f0e/userscripts/raw/main/csstats-alias-finder.user.js
// @supportURL  https://github.com/f0e/userscripts/issues
// ==/UserScript==

(function () {
  "use strict";

  const parent = document.querySelector("#player-matches");
  const div = document.createElement("div");
  parent.insertAdjacentElement("afterbegin", div);

  const button = document.createElement("button");
  button.innerHTML = "get aliases";
  div.appendChild(button);

  const results = document.createElement("div");
  results.style.marginTop = "0.5rem";
  div.appendChild(results);

  async function scrapeMatch(matchLink) {
    const res = await fetch(matchLink);
    console.log(res.status);
    const htmlString = await res.text();

    const parser = new DOMParser();
    const matchDoc = parser.parseFromString(htmlString, "text/html");

    const playerURL = location.href.split("#/matches")[0];
    const playerInfo = matchDoc.querySelector(
      `.player-link[href="${playerURL}"]`
    );

    const name = playerInfo.textContent.trim();
    const avatar = playerInfo.parentNode
      .querySelector("img:last-of-type")
      .getAttribute("src");

    return { name, avatar, stats };
  }

  function generateHistoryHTML(history) {
    return `
      <div>names: <span style="color: rgba(255, 255, 255, 0.5)">${history.names
        .map(
          (name) => `<span style="color: rgba(255, 255, 255, 1)">${name}</span>`
        )
        .join(", ")}</span></div>
      <div>avatars: <div>${history.avatars.map(
        (avatar) => `<img style="width: 50px; height: 50px" src="${avatar}"/>`
      )}</div></div>
    `;
  }

  async function getHistory() {
    const links = Array.from(document.querySelectorAll(".match-list-link")).map(
      (link) => link.getAttribute("href")
    );

    const history = {
      names: [],
      avatars: [],
    };

    for (const [i, link] of links.entries()) {
      const info = await scrapeMatch(link);

      if (!history.names.includes(info.name)) {
        console.log(`new name: ${info.name}`);
        history.names.push(info.name);
      }

      if (!history.avatars.includes(info.avatar)) {
        console.log(`new avatar: ${info.avatar}`);
        history.avatars.push(info.avatar);
      }

      results.innerHTML =
        `
<div>loading... ${i + 1}/${links.length}</div>
` + generateHistoryHTML(history);
    }

    results.innerHTML = generateHistoryHTML(history);

    return { names, avatars };
  }

  async function getHistoryWrap() {
    const history = await getHistory();

    console.log("done");
    console.log(history);

    results.innerHTML = generateHistoryHTML(history);
  }

  button.onclick = getHistoryWrap;
})();
