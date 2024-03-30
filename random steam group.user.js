// ==UserScript==
// @name         random steam group
// @author       tek
// @match        *://steamcommunity.com/groups/*
// @match        *://steamcommunity.com/gid/*
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";
  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function get_random_steam_group() {
    const min = 4;
    const max = 29994879;
    const base_url = "https://steamcommunity.com/gid/";

    let group_number = random(min, max);
    return base_url + `${group_number}`;
  }

  function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  async function run() {
    let child;
    if (
      document.body.innerText.indexOf(
        "An error was encountered while processing your request:"
      ) != -1
    ) {
      // error group

      const parent = document.querySelector("#BG_bottom #message");
      child = parent.childNodes[parent.childNodes.length - 4];
    } else {
      // normal group

      const parent = document.querySelector(".rightbox .content").parentNode;
      child = parent.childNodes[parent.childNodes.length - 2];
    }

    // add horizontal bar
    let hr = document.createElement("hr");
    insertAfter(child, hr);

    // add link
    let links = document.createElement("div");
    links.className += "content weblink";
    insertAfter(hr, links);
    {
      let link = document.createElement("a");
      link.innerHTML = "random group";

      const set_group = () => (link.href = get_random_steam_group());
      set_group();
      link.addEventListener("click", set_group);
      link.addEventListener("auxclick", set_group);

      links.appendChild(link);
    }
  }

  run();
})();
