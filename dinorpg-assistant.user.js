// ==UserScript==
// @name        DinoRPG Assistant
// @namespace   fr.kergoz-panic.watilin
// @version     1.1.1
// @description Diverses petites améliorations pour le jeu DinoRPG.
// @author      Watilin
// @licence     GNU/GPL 2.0
//
// @include     http://www.dinorpg.com/*
//
// @icon        https://raw.githubusercontent.com/Watilin/DinoRPG-Assistant/master/icon-rocky.png
// @icon64      https://raw.githubusercontent.com/Watilin/DinoRPG-Assistant/master/icon-rocky64.png
// @downloadURL https://raw.githubusercontent.com/Watilin/DinoRPG-Assistant/master/dinorpg-assistant.user.js
// @updateURL   https://raw.githubusercontent.com/Watilin/DinoRPG-Assistant/master/dinorpg-assistant.meta.js
// @supportURL  https://github.com/Watilin/DinoRPG-Assistant/issues
//
// @noframes
// @run-at      document-start
// @nocompat    Chrome
//
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_listValues
// @grant       GM_deleteValue
// @grant       GM_info
// @grant       GM_getResourceText
// @grant       GM_getResourceURL
//
// @resource    style                   style.css
// @resource    up-locked-small         small_lup_locked.png
// @resource    up-locked-large         act_levelup_locked.png
// ==/UserScript==

"use strict";

/* Table of Contents: use Ctrl+F, put a leading @
  [SHI] Shims for Retarded Browsers
  [CST] Constants
  [BRO] Browser Detection 
  [DBG] Debug
  [TIM] Timers
  [LVL] Levels
  [LOC] Lock
  [STY] Style
  [INI] Initialization
*/

// [@SHI] Shims for Retarded Browsers //////////////////////////////////

[ "slice", "forEach", "map", "filter", "some", "every", "reduce" ]
  .forEach(function (methodName) {
    if (!(methodName in Array)) {
      Array[methodName] = function (iterable, callback, context) {
        return Array.prototype[methodName]
          .call(iterable, callback, context);
      };
    }
  });

if (!("contains" in String.prototype)) {
  String.prototype.contains = function contains(sub) {
    return this.indexOf(sub) >= 0;
  };
}

// [@CST] Constants ////////////////////////////////////////////////////

const STYLE_RESOURCE_NAME = "style";
const DINO_RX = /\/dino\/(\d+)$/;
const COLOR_BRIGHTNESS = 180;

const LOCK_TXT = "Verrouiller";
const UNLOCK_TXT = "Déverrouiller";

const BROWSER_FIREFOX     = Symbol();
const BROWSER_CHROME      = Symbol();
const BROWSER_UNSUPPORTED = Symbol();

// [@BRO] Browser Detection ////////////////////////////////////////////

function guessBrowser() {
  var handler = GM_info.scriptHandler;
  if (handler && "Tampermonkey" === handler) return BROWSER_CHROME;
  var ua = navigator.userAgent;
  if (ua) {
    if (ua.contains("Firefox")) return BROWSER_FIREFOX;
    if (ua.contains("Chrome")) return BROWSER_CHROME;
  }
  return BROWSER_UNSUPPORTED;
}

// [@DBG] Debug ////////////////////////////////////////////////////////

console.groupCollapsed("DinoRPG Assistant stored values:");
Array.forEach(GM_listValues(), function (key) {
  console.log(key, GM_getValue(key));
});
console.groupEnd();

// [@TIM] Timers ///////////////////////////////////////////////////////

function retrieveTimerInfo($timer, dinoId) {
  var timeRx = /(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/;
  var match = $timer.textContent.match(timeRx);
  if (!match || !match[0]) {
    console.warn("timer does not match:", $timer.textContent);
    return;
  }
  var time = 0;
  if (match[1]) time += parseInt(match[1], 10) * 3600;
  if (match[2]) time += parseInt(match[2], 10) * 60;
  if (match[3]) time += parseInt(match[3], 10);

  var dinoInfo = GM_getValue(dinoId, {});
  dinoInfo.time = time + Math.floor(Date.now() / 1000);
  GM_setValue(dinoId, dinoInfo);
}

function injectTimers($list) {
  var timers = [];
  Array.forEach($list.querySelectorAll("a"), function ($a) {
    let id = $a.href.match(DINO_RX)[1];
    let time = GM_getValue(id, {}).time;
    if (time) {
      let $span = document.createElement("span");
      $span.className = "mini-timer";
      $span.dataset.targetTime = time;
      $a.appendChild($span);
      timers.push($span);
    }
  });

  setInterval(function () {
    try {
      var seconds = Math.floor(Date.now() / 1000);
      timers.forEach(function ($t) {
        if (seconds <= $t.dataset.targetTime) {
          updateTimer($t, seconds);
        } else {
          let id = $t.parentNode.href.match(DINO_RX)[1];
          delete $t.dataset.targetTime;
          timers.splice(timers.indexOf($t), 1);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }, 1000);
}

function updateTimer($timer, now) {
  var diff = $timer.dataset.targetTime - now;
  $timer.textContent = timeIntervalToString(diff);

  if (diff >= 3600 * 12) {
    $timer.classList.add("more-than-12-hours");
  } else if (diff >= 3600 * 4) {
    $timer.classList.add("more-than-4-hours");
  } else if (diff >= 3600) {
    $timer.classList.add("more-than-1-hour");
  } else if (diff >= 60 * 15) {
    $timer.classList.add("more-than-15-min");
  }
}

/** Gives a human readable description of a time interval
 * @param interval {int} time interval in seconds
 * @return {string} examples: "10:27′", "45′18″"
 * Returns an empty string for negative intervals.
 * Indicates seconds for intervals smaller than 1 hour.
 */
function timeIntervalToString(interval) {
  if (interval <= 0) return "";

  if (interval > 3600) {
    let h = Math.floor(interval / 3600);
    let m = Math.floor(interval / 60) % 60;
    if (m < 10) m = "0" + m;
    return `${h}:${m}′`;
  }

  if (interval > 60) {
    let m = Math.floor(interval / 60);
    let s = interval % 60;
    if (s < 10) s = "0" + s;
    return `${m}′${s}″`;
  }

  return `${interval}″`;
}

// [@LVL] Levels ///////////////////////////////////////////////////////

function retrieveLevelInfo($level, dinoId) {
  var level = parseInt($level.textContent, 10);
  var dinoInfo = GM_getValue(dinoId, {});
  if (dinoInfo.level !== level) {
    dinoInfo.level = level;
    GM_setValue(dinoId, dinoInfo);
  }
}

function colorCurve(x) {
  x %= 6;
  if (x < 1) return x;
  if (x < 3) return 1;
  if (x < 4) return 4 - x;
             return 0;
}

function injectLevels($list) {
  Array.forEach($list.querySelectorAll("a"), function ($a) {
    let id = $a.href.match(DINO_RX)[1];
    let level = GM_getValue(id, {}).level;
    if (level) {
      let $span = document.createElement("span");
      $span.className = "mini-level";
      $span.textContent = level;

      /*
      let value = 6 * (level - 1) / 70;
      let   red = Math.round(colorCurve(value + 2) * COLOR_BRIGHTNESS);
      let green = Math.round(colorCurve(value    ) * COLOR_BRIGHTNESS);
      let  blue = Math.round(colorCurve(value + 4) * COLOR_BRIGHTNESS);
      $span.style.backgroundColor =
      "rgb(" + red + "," + green + "," + blue + ")";
      */

      $a.appendChild($span);
    }
  });
}

// [@LOC] Lock /////////////////////////////////////////////////////////

function injectLockButton($actionsPanel, dinoId) {
  var info = GM_getValue(dinoId, {});
  if (!(info && info.level && info.level > 10)) return;

  var $button = document.createElement("a");
  $button.href = "#";
  $button.classList.add("button", "lock-button");
  $button.textContent = info.isLocked ?
    UNLOCK_TXT : LOCK_TXT;

  $button.addEventListener("click", function (event) {
    event.preventDefault();
    var dinoInfo = GM_getValue(dinoId, {});
    var $button = document.querySelector("#act_levelup");
    var $img = document.querySelector(
      `#dinozList a[href$="/dino/${dinoId}"] img`);

    if (UNLOCK_TXT === this.textContent) {
      restoreLevelUpButton($button);
      restoreLevelUpImage($img);
      dinoInfo.isLocked = false;
      this.textContent = LOCK_TXT;
    } else {
      replaceLevelUpButton($button);
      replaceLevelUpImage($img);
      dinoInfo.isLocked = true;
      this.textContent = UNLOCK_TXT;
    }
    GM_setValue(dinoId, dinoInfo);
  });

  $actionsPanel.appendChild($button);
}

function replaceAllLevelUpImages($list) {
  Array.forEach($list.querySelectorAll("a"), function ($a) {
    let id = $a.href.match(DINO_RX)[1];
    if (GM_getValue(id, {}).isLocked) {
      $a.dataset.lockedDino = true;
      let $lup = $a.querySelector("img[src$='small_lup.gif']");
      if ($lup) {
        $lup.dataset.oldSrc = $lup.src;
        $lup.src = GM_getResourceURL("up-locked-small");
      }
    }
  });
}
function replaceLevelUpImage($img) {
  if (!$img) return;
  if (!$img.dataset.oldSrc) $img.dataset.oldSrc = $img.src;
  $img.src = GM_getResourceURL("up-locked-small");
}

function restoreLevelUpImage($img) {
  if (!$img || !$img.dataset.oldSrc) return;
  $img.src = $img.dataset.oldSrc;
}

function replaceLevelUpButton($button, dinoId) {
  var $icon = $button.querySelector("#act_levelup_icon");
  $icon.dataset.oldSrc = $icon.src;
  $icon.src = GM_getResourceURL("up-locked-large");

  var $tr = $button.querySelector("tr[onclick]");
  $tr.dataset.oldOnclick = $tr.getAttribute("onclick");
  $tr.removeAttribute("onclick");
  $tr.dataset.oldOnmouseover = $tr.getAttribute("onmouseover");
  $tr.removeAttribute("onmouseover");
  $tr.dataset.oldOnmouseout = $tr.getAttribute("onmouseout");
  $tr.removeAttribute("onmouseout");

  $tr.title = "Vous avez verrouillé ce dinoz.";
  $tr.classList.add("locked");
}

function restoreLevelUpButton($button) {
  var $icon = $button.querySelector("#act_levelup_icon");
  if ($icon.dataset.oldSrc) $icon.src = $icon.dataset.oldSrc;

  var $tr = $button.querySelector("tr.locked");
  if ($tr.dataset.oldOnclick) {
    $tr.setAttribute("onclick", $tr.dataset.oldOnclick);
  }
  if ($tr.dataset.oldOnmouseover) {
    $tr.setAttribute("onmouseover", $tr.dataset.oldOnmouseover);
  }
  if ($tr.dataset.oldOnmouseout) {
    $tr.setAttribute("onmouseout", $tr.dataset.oldOnmouseout);
  }

  $tr.removeAttribute("title");
  $tr.classList.remove("locked");
}

// [@STY] Style ////////////////////////////////////////////////////////

function injectStyle($head) {
  if (BROWSER_FIREFOX === guessBrowser()) {
    let $link = document.createElement("link");
    $link.rel = "stylesheet";
    $link.href = GM_getResourceURL(STYLE_RESOURCE_NAME);
    $head.appendChild($link);
  } else {
    let $style = document.createElement("style");
    $style.textContent = GM_getResourceText(STYLE_RESOURCE_NAME);
    $head.appendChild($style);
  }
}

if (document.head) injectStyle(document.head);
else new MutationObserver(function (batch) {
  batch.forEach(function (mutation) {
    Array.forEach(mutation.addedNodes, function ($node) {
      if ("head" === $node.nodeName.toLowerCase()) {
        this.disconnect();
        injectStyle($node);
        return;
      }
    });
  });
}).observe(document.documentElement, { childList: true });

// [@INI] Initialization ///////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  var pathMatch = location.pathname.match(DINO_RX);
  var dinoId = pathMatch ? pathMatch[1] : null;
  if (dinoId) {
    var $timer = document.querySelector(".freeAction #timer_0");
    if ($timer) retrieveTimerInfo($timer, dinoId);

    var $level = document.querySelector(".level");
    if ($level) retrieveLevelInfo($level, dinoId);

    var $actions = document.querySelector("#dinozActions");
    if ($actions) injectLockButton($actions, dinoId);

    var $levelUpButton = document.querySelector("#act_levelup");
    if ($levelUpButton && GM_getValue(dinoId, {}).isLocked) {
      replaceLevelUpButton($levelUpButton);
    }
  }

  var $dinozList = document.querySelector("#dinozList ul");
  if ($dinozList) {
    injectTimers($dinozList);
    injectLevels($dinozList);
    replaceAllLevelUpImages($dinozList);
  }
});
