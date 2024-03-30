// ==UserScript==
// @name        RateYourMusic+
// @namespace   Violentmonkey Scripts
// @match       *://rateyourmusic.com/release/*
// @match       *://rateyourmusic.com/artist/*
// @match       *://rateyourmusic.com/charts/*
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.addStyle
// @version     1.0
// @author      tek
// @description
// ==/UserScript==

/*
  todo: rating counts
*/
GM.addStyle(`
.disco_header_top {
  height: unset;
  line-height: unset;
}

.best_track_btn {
  font-size: 1.3rem;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.page_charts_section_charts_header_chart_name_criteria > .best_track_btn {
  margin-top: 1em;
}
`);

const KEY = "rym+";
let data = {};

const log = (...args) => console.log(`[${KEY}]`, ...args);

const parseHtml = (htmlString) => {
  const parser = new DOMParser();
  return parser.parseFromString(htmlString, 'text/html');
}

async function fetchPage(url) {
  const res = await fetch(url);

  const text = await res.text();
  const body = parseHtml(text);

  return body;
}

function getTrackRatings(html) {
  const trackElems = html.querySelectorAll("#tracks.tracks.tracklisting > .track");

  let anyRatings = false;

  const ratings = Array.from(trackElems)
    .filter((e) => e.querySelector(".tracklist_line"))
    .map((e) => {
      // basic info (everything has this)
      const obj = {
        title: e.querySelector(".tracklist_title .rendered_text").innerText.trim(),
        tracknum: e.querySelector(".tracklist_num").innerText.trim(),
      };

      // track duration
      const length = e.querySelector(".tracklist_title .tracklist_duration").innerText.trim();
      if (length) {
        obj["length"] = length;
      }

      // track rating info
      const rating = e.querySelector(".track_rating");
      if (rating) {
        anyRatings = true;

        obj["bolded"] = rating.classList.contains("recommended");

        const ratingNumElem = rating.querySelector(".track_rating_avg");
        const detailedRating = ratingNumElem.getAttribute("data-tiptip");

        obj["rating"] = parseFloat(detailedRating.split(" from ")[0]);
        obj["ratingCount"] = parseInt(detailedRating.split(" from ")[1].split(" ratings")[0]);
      }

      return obj;
    });

  return { anyRatings, ratings };
}

async function parsePage(html) {
  const releaseId = html.querySelector(".album_shortcut").getAttribute("value").split("[Album")[1].split("]")[0];

  if (!(releaseId in data)) {
    // init
    data[releaseId] = {
      title: null,
      artist: null,
      trackRatings: {
        ratings: null,
        timestamp: null,
        history: []
      }
    }
  }

  data[releaseId].title = html.querySelector(".album_title").childNodes[0].textContent.trim();
  data[releaseId].artist = html.querySelector(".artist").innerText.trim();

  const { anyRatings, ratings } = getTrackRatings(html);

  if (anyRatings) {
    const dataRatings = data[releaseId].trackRatings;

    if (dataRatings.ratings) {
      // store old ratings if they've changed
      if (JSON.stringify(ratings) != JSON.stringify(dataRatings.ratings)) {
        dataRatings.history.push({
          ratings: dataRatings.ratings,
          timestamp: dataRatings.timestamp
        });
      }
    }

    dataRatings.ratings = ratings;
    dataRatings.timestamp = Date.now();
  }

  await GM.setValue(KEY, data);
}

function getBestTracks(releaseRatings) {
  let totalRatings = 0;
  for (const [id, data] of Object.entries(releaseRatings)) {
    for (const trackRating of data.trackRatings.ratings) {
      totalRatings += trackRating.ratingCount;
    }
  }

  const bestTracks = [];

  const blending = 0;

  const R = 2.5;
  const W = 30;

  for (const [id, data] of Object.entries(releaseRatings)) {
    for (const trackRating of data.trackRatings.ratings) {
      trackRating.artistTitle = data.artist;
      trackRating.releaseTitle = data.title;
      trackRating.weightedRating = (W*R + trackRating.ratingCount*trackRating.rating) / (W + trackRating.ratingCount);
      bestTracks.push(trackRating);
    }
  }

  return bestTracks;
}

async function getRatings(releasesSections) {
  const releaseRatings = {};

  for (const releasesSection of releasesSections) {
    const releases = releasesSection.querySelectorAll(".disco_release");

    for (const release of releases) {
      const releaseId = release.id.split("release_")[1];
      const releaseTitle = release.querySelector(".disco_info .album").innerText.trim();

      if (!(releaseId in data)) {
        // ratings don't already exist, fetch them
        console.log(`fetching track ratings for ${releaseTitle} (${releaseId})`);

        const url = release.querySelector(".disco_info a").href;
        console.log(url);

        const pageHtml = await fetchPage(url);
        await parsePage(pageHtml);
      }

      if (!data[releaseId].trackRatings.ratings)
        continue; // no ratings available

      releaseRatings[releaseId] = data[releaseId];
    }
  }

  const bestTracks = getBestTracks(releaseRatings);

  bestTracks.sort((a, b) =>
                  (b.bolded - a.bolded) ||
                  (b.weightedRating - a.weightedRating) ||
                  (b.ratingCount - a.ratingCount));

  console.log(bestTracks
              .map((track, i) => `#${i+1} ${track.artistTitle} - ${track.title} (${track.releaseTitle}) - ${track.rating}${track.bolded ? " (bolded)": ""} with ${track.ratingCount} ratings (${track.weightedRating.toFixed(2)})`)
              .reverse()
              .join("\n"));
}

function createArtistButtons() {
  const headerElems = document.querySelectorAll(".disco_header_top");
  const releasesElems = document.querySelectorAll(".disco_header_top ~ div[id^='disco_type_']");

  const sections = [];
  for (const [i, headerElem] of headerElems.entries()) {
    sections.push({
      header: headerElem,
      releases: releasesElems[i]
    })
  }

  console.log(sections);

  for (const section of sections) {
    // set up header
    section.header.innerHTML += "<br/>";

    const getBestTracksButton = document.createElement("a");
    getBestTracksButton.classList = "btn flat_btn best_track_btn";
    getBestTracksButton.addEventListener("click", (e) => getRatings([section.releases]));
    getBestTracksButton.innerText = "Get best tracks";

    section.header.appendChild(getBestTracksButton);
  }

  const wantedSectionIds = ["s", "m", "e", "c", "b"];
  const wantedSections = sections
    .filter((section) => wantedSectionIds
      .some((id) => section.releases.id.includes(`disco_type_${id}`)))
    .map((section) => section.releases);

  console.log(wantedSections);

  const getAllBestTracksButton = document.createElement("a");
  getAllBestTracksButton.classList = "btn flat_btn best_track_btn";
  getAllBestTracksButton.addEventListener("click", (e) => {
    getRatings(wantedSections)
  });
  getAllBestTracksButton.innerText = "Get all best tracks";

  document.querySelector(".disco_toolbar").appendChild(getAllBestTracksButton);
}

async function getChartsRatings() {
  const releases = document.body.querySelectorAll(".page_section_charts_item_wrapper > .object_release");

  const releaseRatings = {};

  for (const release of releases) {
    const releaseId = release.id.split("item_")[1];
    const releaseTitle = release.querySelector(".page_charts_section_charts_item_title").innerText.trim();

    if (!(releaseId in data)) {
      // ratings don't already exist, fetch them
      console.log(`fetching track ratings for ${releaseTitle} (${releaseId})`);

      const url = release.querySelector(".page_charts_section_charts_item_link.release").href;
      console.log(url);

      const pageHtml = await fetchPage(url);
      await parsePage(pageHtml);
    }

    if (!data[releaseId].trackRatings.ratings)
      continue; // no ratings available

    releaseRatings[releaseId] = data[releaseId];
  }

  const bestTracks = getBestTracks(releaseRatings);

  bestTracks.sort((a, b) =>
                  (b.bolded - a.bolded) ||
                  (b.weightedRating - a.weightedRating) ||
                  (b.ratingCount - a.ratingCount));

  console.log(bestTracks
              .map((track, i) => `#${i+1} ${track.artistTitle} - ${track.title} (${track.releaseTitle}) - ${track.rating}${track.bolded ? " (bolded)": ""} with ${track.ratingCount} ratings (${track.weightedRating.toFixed(2)})`)
              .reverse()
              .join("\n"));
}

function createChartsButtons() {
  const getAllBestTracksButton = document.createElement("a");
  getAllBestTracksButton.classList = "btn flat_btn best_track_btn";
  getAllBestTracksButton.addEventListener("click", (e) => {
    getChartsRatings();
  });
  getAllBestTracksButton.innerText = "Get best tracks";

  document.querySelector(".page_charts_section_charts_header_chart_name_criteria").appendChild(getAllBestTracksButton);
}

async function main() {
  data = await GM.getValue(KEY) || {};

  if (location.href.includes("rateyourmusic.com/release/")) {
    log("release page");
    parsePage(document);
  } else if (location.href.includes("rateyourmusic.com/artist")) {
    log("artist page");
    createArtistButtons();
  } else if (location.href.includes("rateyourmusic.com/charts")) {
    log("charts page");
    createChartsButtons();
  }
}

main();
