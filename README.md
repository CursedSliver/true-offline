# True offline
A mod that enables true offline progress. Unlike the measly heavenly upgrades that offer some percentage of offline progress that ignores wrinklers, this mod will simulate offline time as if it is real time when you reopen the game. While the heavenly upgrades only give you cookies when offline, because this mod simulates the game, offline time can also be used for the following:
- Wrinkler eating 
- Garden plants
- Stock market movement
- Pantheon worship swap cooldowns
- Magic regeneration in the Grimoire
- And more!

## Installation
<table>
  <colgroup>
    <col style="width: 20%;">
    <col style="width: 30%;">
    <col style="width: 50%;">
  </colgroup>
  <thead>
    <tr>
      <th>Method</th>
      <th>Code/Link</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>CCMM extension</td>
      <td><code>https://cursedsliver.github.io/true-offline/main.js</code></td>
      <td>Install the <a href="https://chromewebstore.google.com/detail/cookie-clicker-mod-manage/gehplcbdghdjeinldbgkjdffgkdcpned">CCMM extension</a> and click the "Register new mod" box at the bottom. Paste the link into the URL field of the textbox that appears, then confirm.</td>
    </tr>
    <tr>
      <td>Bookmarklet</td>
      <td><code>javascript:{(function(){Game.LoadMod('https://cursedsliver.github.io/true-offline/main.js');})();}</code></td>
      <td>Input into the URL field of the bookmarklet, then click on the bookmark while on an instance of Cookie Clicker.</td>
    </tr>
    <tr>
      <td>Console command</td>
      <td><code>javascript:{(function(){Game.LoadMod('https://cursedsliver.github.io/true-offline/main.js');})();}</code></td>
      <td><a href="https://balsamiq.com/support/troubleshooting-faqs/browser-console/">Open the developer console</a> and paste the command into the console.</td>
    </tr>
    <tr>
      <td>Tampermonkey/Greasemonkey</td>
      <td>In the addendum section.</td>
      <td>Post the code in the addendum of this document to a new script on your userscript manager, such as Tampermonkey or Greasemonkey.</td>
    </tr>
    <tr>
      <td>Steam Workshop</td>
      <td><a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3789272652">https://steamcommunity.com/sharedfiles/filedetails/?id=3789272652</a></td>
      <td>Subscribe on Steam Workshop.</td>
    </tr>
  </tbody>
</table>

## Loading disclaimer
The simulation may not be fully accurate if you have any other mods loaded. Try to put it late in the loading order, but before any big content or gameplay mods. If this doesn't work, try to put it as early as possible. Depending on how another mod is programmed it may not be possible for simulated offline progress to correctly and accurately act on it.

First load of the mod will not simulate offline progress. Keep the mod loaded across two sessions is needed to simulate offline progress. Speeding up by a lot may cause stuff such as sugar lump timings to be incorrect and show stuff such as "this sugar lump has been exposed to time travel shenanigans".

## Localization support
This mod currently supports **English** and **Chinese**. Support for further languages are possible; if you wish to contribute, contact me on discord (cursedsliver) for more details.

## Steam achievements
This mod will **NOT** disable steam achievements.

## Contact
To report bugs, make feature requests, and if you have questions/concerns, make a pull request or DM me on discord: @cursedsliver (make sure that you don't misspell it!)

### Addendum
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