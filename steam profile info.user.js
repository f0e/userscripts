// ==UserScript==
// @name      steam profile info
// @author    tek
// @match     *://steamcommunity.com/*/*
// @grant     GM_addStyle
// @run-at    document-idle
// ==/UserScript==

GM_addStyle(`
.teknoStuff {
  color: #aaa;
  font-size: 15px;
  margin-bottom: 0.7rem;
}
`);

const parseHtml = (htmlString) => {
  const parser = new DOMParser();
  return parser.parseFromString(htmlString, "text/html");
};

async function getLatestName() {
  const url = location.href + "/namehistory";
  const res = await fetch(url);

  const text = await res.text();
  const body = parseHtml(text);

  const previousNameDates = body.querySelector(".historyDate");
  if (!previousNameDates) return null;

  const date = previousNameDates.innerText.split(" @")[0];

  return date;
}

async function getTradeBanned() {
  const id32 = document
    .querySelector(".profile_header_size")
    .getAttribute("data-miniprofile");

  const url = "https://steamcommunity.com/tradeoffer/new/?partner=" + id32;
  const res = await fetch(url);

  const text = await res.text();
  const body = parseHtml(text);

  try {
    const error = body.querySelector("#error_msg").innerText;
    const banned = error.includes("because they have a trade ban");

    return banned;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function run() {
  const date = await getLatestName();
  const banned = await getTradeBanned();

  const teknoStuff = document.createElement("div");
  teknoStuff.className = "teknoStuff";

  if (date) teknoStuff.innerHTML += `<div>Last username change: ${date}</div>`;
  if (banned)
    teknoStuff.innerHTML += `<span style="color: red">TRADE BANNED</span>`;

  const sibling = document.querySelector(".responsive_status_info");
  sibling.insertAdjacentElement("beforeend", teknoStuff);

  // make the margins look good
  for (const selector of [".profile_ban_status", ".profile_in_game"]) {
    const el = document.querySelector(selector);
    if (el) el.style.marginBottom = "0.7rem";
  }
}

run();
