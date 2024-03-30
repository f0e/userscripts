// ==UserScript==
// @name        Profile picture dates
// @description shows the date that profile pictures were uploaded on certain sites
// @author      f0e
// @version     1.0
// @namespace   https://github.com/f0e
// @match       *://twitter.com/*
// @match       *://steamcommunity.com/*/*
// @match       *://*.instagram.com/*
// @run-at      document-idle
// @grant       GM.xmlHttpRequest
// @updateURL   https://github.com/f0e/userscripts/raw/main/profile-picture-dates.user.js
// @downloadURL https://github.com/f0e/userscripts/raw/main/profile-picture-dates.user.js
// @supportURL  https://github.com/f0e/userscripts/issues
// ==/UserScript==

function get_last_modified(url) {
  return new Promise((resolve, reject) => {
    try {
      GM.xmlHttpRequest({
        method: "HEAD",
        url: url,
        onload: function (response) {
          let headers = response.responseHeaders.split("\n");
          let last_modified = headers
            .find((e) => e.indexOf("last-modified") != -1)
            .split("last-modified: ")[1];
          let date = new Date(last_modified + " GMT");
          return resolve(date);
        },
      });
    } catch (er) {
      return reject(er.message);
    }
  });
}

const options = { year: "numeric", month: "long", day: "numeric" };
async function run() {
  const url = location.href;

  let profile_pic_elem, profile_pic;

  // STEAM
  if (url.includes("steamcommunity.com")) {
    if (url.includes("/groups/")) {
      // group
      profile_pic_elem = document.querySelector(".grouppage_logo > img");
      console.log(profile_pic_elem);
    } else {
      // profile
      profile_pic_elem = document.querySelector(
        ".playerAvatarAutoSizeInner > img"
      );
    }

    profile_pic = profile_pic_elem.src;
    profile_pic = profile_pic.replace("_full", "");

    // TWITTER
  } else if (url.includes("twitter.com")) {
    profile_pic_elem = document.querySelector(".ProfileAvatar-image");
    profile_pic = profile_pic_elem.src;
    profile_pic = profile_pic.replace("400x400", "bigger");

    // INSTAGRAM
  } else if (url.includes("instagram.com")) {
    profile_pic_elem = document.querySelector('[alt*="\'s profile picture"]');
    profile_pic = profile_pic_elem.src;
  }

  // get date
  const date = await get_last_modified(profile_pic);

  // format date
  const formatted = date.toLocaleString("en-AU");

  // create html element
  const elem = document.createElement("div");
  elem.style = `
display: inline-block;
position: relative;

color: #fff;
background-color: #000;
padding: 5px 8px;
font-family: consolas, monospace;

opacity: 0.8;

z-index: 99999999999`;
  elem.innerHTML = formatted;
  profile_pic_elem.parentNode.parentNode.appendChild(elem);
}

run();
