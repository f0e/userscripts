// ==UserScript==
// @name        Display hidden bandcamp tracks
// @namespace   Violentmonkey Scripts
// @match       *://*.bandcamp.com/album/*
// @grant       none
// @version     1.0
// @author      tek
// @description ported from https://github.com/7x11x13/hidden-bandcamp-tracks
// ==/UserScript==

const num_tracks_regex = /(\d+) track album/;

// make sure we are on an album page
if (
  document.querySelector("meta[property='twitter:site']").content != "@bandcamp"
)
  return;
if (document.querySelector("meta[property='og:type']").content != "album")
  return;

const desc = document.querySelector("meta[property='og:description']").content;
const num_tracks = parseInt(desc.match(num_tracks_regex)[1]);

const track_numbers = [];
for (const track_num of document.querySelectorAll(".track_number")) {
  track_numbers.push(parseInt(track_num.textContent.slice(0, -1)));
}

const num_visible_tracks = Math.max(...track_numbers);
const num_hidden_tracks = num_tracks - num_visible_tracks;

if (num_hidden_tracks > 0) {
  const title = document.querySelector("#name-section");
  const hidden_text = document.createElement("div");
  hidden_text.style.color = "slategrey";
  hidden_text.style.marginTop = "4px";
  hidden_text.textContent = `(${num_hidden_tracks} hidden track${
    num_hidden_tracks == 1 ? "" : "s"
  })`;
  title.appendChild(hidden_text);
}
