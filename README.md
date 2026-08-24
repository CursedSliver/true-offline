# True offline
A mod that enables true offline progress. Unlike the measly heavenly upgrades that offer some percentage of offline progress that ignores wrinklers, this mod will simulate offline time as if it is real time when you reopen the game. While the heavenly upgrades only give you cookies when offline, because this mod simulates the game, offline time can also be used for the following:
- Wrinkler eating 
- Garden plants
- Stock market movement
- Pantheon worship swap cooldowns
- Magic regeneration in the Grimoire
- And more!

## Installation
Use True Offline on web using the following bookmarklet:
`javascript:{(function(){Game.LoadMod('https://cursedsliver.github.io/true-offline/main.js');})();}`.
It is also usable as a console command.

If you use tampermonkey or greasemonkey, use the following userscript:
```js 
// ==UserScript==
// @name True Offline
// @namespace trueOffline
// @include https://orteil.dashnet.org/cookieclicker/
// @include https://cookieclicker.eu/cookieclicker/
// @grant none
// ==/UserScript==

window.eval("javascript:{(function(){Game.LoadMod('https://cursedsliver.github.io/true-offline/main.js');})();}");
```

## Loading disclaimer
The simulation may not be fully accurate if you have any other mods loaded. Try to put it late in the loading order, but before any big content or gameplay mods. If this doesn't work, try to put it as early as possible. Depending on how another mod is programmed it may not be possible for simulated offline progress to correctly and accurately act on it.

First load of the mod will not simulate offline progress. Keep the mod loaded across two sessions is needed to simulate offline progress. Speeding up by a lot may cause stuff such as sugar lump timings to be incorrect and show stuff such as "this sugar lump has been exposed to time travel shenanigans".

## Localization support
This mod currently supports **English** and **Chinese**. Support for further languages are possible; if you wish to contribute, contact me on discord (cursedsliver) for more details.

## Steam achievements
This mod will **NOT** disable steam achievements.

## Contact
To report bugs, make feature requests, and if you have questions/concerns, make a pull request or DM me on discord: @cursedsliver (make sure that you don't misspell it!)