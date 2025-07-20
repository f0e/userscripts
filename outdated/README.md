# outdated userscripts

Userscripts that don't work currently.

## Currently broken but can be fixed, need updating

### [RateYourMusic+](https://github.com/f0e/userscripts/raw/main/outdated/rateyourmusic+.user.js)

Adds additional functionality to RateYourMusic. Redundant now since they've added native Songs charts.

##### Top tracks finder (subscriber only)

The top tracks finder adds buttons on artist profiles and charts which fetch the highest rated tracks on releases. This does not include singles, as you can already sort by rating for those. This lets you easily find the best songs by an artist or in any chart.

It also caches track ratings for every release page you view (only used to avoid re-requesting pages currently, but could be used in the future to show old track ratings if you stop subscribing).

Please do not abuse this feature, you will most likely be banned from the site. Sonemic does not like scraping.

### [Streamable info](https://github.com/f0e/userscripts/raw/main/outdated/streamable-info.user.js)

Adds text under Streamable videos displaying hidden information about the uploaded video: original framerate, original filename, original size and exact upload date.

Currently broken as they updated their site.

### [csstats alias finder](https://github.com/f0e/userscripts/raw/main/outdated/csstats-alias-finder.user.js)

Adds a button that would parse through a player's matches on [csgostats.gg, now csstats.gg](https://csstats.gg/). This would reveal past usernames and profile pictures.

Currently broken as they updated their site

## Permanently broken (RIP)

### [YouTube exploits](https://github.com/f0e/userscripts/raw/main/outdated/youtube-exploits.user.js)

Added buttons onto every YouTube channel which took you to that channel's Google 'Album Archive' page, giving you access to view their previous profile pictures, as well as any extra public images they had in their Google account.

I found this 'exploit' randomly on my own and afaik no one else knew about it until a few years later. The way this worked just involved going to the url `https://get.google.com/u/1/albumarchive/[google+ id]`. I believe this was patched when Google+ was killed in 2019.
