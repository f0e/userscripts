// ==UserScript==
// @name         streamable info
// @author       tek
// @match        *://*.streamable.com/*
// @run-at       document-idle
// ==/UserScript==

async function run() {
  const darkMode = document.documentElement.classList.contains("dark");

  let videoInfo = {
    originalName: null,
    originalWidth: null,
    originalHeight: null,
    originalFramerate: null,
    dateAdded: null,
    archived: false
  };

  const message = document.querySelector('.video-container__message');

  if (message && message.innerText == 'This video has been archived and is not available to watch at this time.') {
    // Cap
    const id = window.location.href.split("/").at(-1);

    const res = await fetch(`https://api.streamable.com/videos/${id}`);
    const json = await res.json();

    const videoUrl = json.files.mp4.url;
    message.outerHTML = "";

    const videoContainer = document.querySelector(".video-container");
    videoContainer.innerHTML = `<video src=${videoUrl} controls></video>` + videoContainer.innerHTML;

    videoInfo.originalWidth = json.files.original.width;
    videoInfo.originalHeight = json.files.original.height;
    videoInfo.originalFramerate = json.files.original.framerate;

    videoInfo.archived = true;
  } else {
    videoInfo.originalName = videoObject.original_name;
    videoInfo.originalWidth = videoObject.original_width;
    videoInfo.originalHeight = videoObject.original_height;
    videoInfo.originalFramerate = videoObject.original_framerate;
    videoInfo.dateAdded = videoObject.date_added;
  }

  let parent = document.querySelector('.below-video__video-details');
  parent.style.display = 'block';
  parent.style.textAlign = "left";

  const fileInfo = document.createElement("div");
  fileInfo.className = "file-info";
  if (darkMode) fileInfo.style.color = "#ccc";

  const infoElems = [];

  if (videoInfo.archived) {
    infoElems.push(`<b>ARCHIVED</b>`);
  }

  if (videoInfo.dateAdded) {
    const dateStr = new Date(videoInfo.dateAdded * 1000).toLocaleString('en-au', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    infoElems.push(`upload date: ${dateStr}`)
  }

  if (videoInfo.originalName)
    infoElems.push(`original name: ${videoInfo.originalName}`);

  if (videoInfo.originalWidth && videoInfo.originalHeight)
    infoElems.push(`original size: ${videoInfo.originalWidth}x${videoInfo.originalHeight}`);

  if (videoInfo.originalFramerate)
    infoElems.push(`original fps: ${videoInfo.originalFramerate.toFixed(2)}`);

  fileInfo.innerHTML = infoElems.join("<br>");

  parent.innerHTML += "<div style='height: 0.3rem'></div>";
  parent.appendChild(fileInfo);
}

run();