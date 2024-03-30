// ==UserScript==
// @name         steam groups+
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  dopee
// @author       tek
// @match        *://steamcommunity.com/*/*/groups*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  let profileUrl = location.href.split("/groups")[0];

  let elems = document.getElementsByClassName("group_block");
  for (let i = 0; i < elems.length; i++) {
    let elem = elems[i];
    setTimeout(() => {
      let urlElem = elem.getElementsByClassName("linkTitle")[0];
      let url = urlElem.href;
      fetch(url)
        .then((resp) => resp.text())
        .then((body) => {
          var parsing = document.createElement("html");
          parsing.innerHTML = body;
          let tag = parsing.getElementsByClassName("grouppage_header_abbrev")[0]
            .innerHTML;
          let founded = parsing.getElementsByClassName("data")[0].innerHTML;
          let owner =
            profileUrl ==
            parsing.getElementsByClassName("member_sectionheader")[0]
              .nextElementSibling.childNodes[1].href;

          // tag
          let child = document.createElement("div");
          child.innerHTML = `${tag}`;
          child.style.fontStyle = "italic";
          child.style.display = "inline-block";
          child.style.marginLeft = "5px";
          child.style.opacity = 0;
          child.style.fontSize = "0.8em";
          child.style.transition = "opacity 0.3s";
          urlElem.appendChild(child);
          setTimeout(() => {
            child.style.opacity = 0.5;
          }, 0);

          let groupStats = elem.getElementsByClassName("groupMemberStat");
          for (let i = 1; i < groupStats.length; i++) {
            let stat = groupStats[i];

            if (i == 1) {
              stat.innerHTML = founded;
            } else if (i == 2 && owner) {
              stat.innerHTML = "owner";
            } else {
              stat.style.display = "none";
            }
          }

          let spacers = elem.getElementsByClassName("infoBreak");
          for (let i = 1; i < spacers.length; i++) {
            let spacer = spacers[i];

            if (!(i == 1 && owner)) {
              spacer.style.display = "none";
            }
          }
        });
    }, 50 * i);
  }
})();
