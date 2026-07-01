/**
 * Travelpayouts Drive — AI monetization layer.
 *
 * Loaded site-wide from app/layout.js. Pause or tune features in the Travelpayouts
 * Drive dashboard; remove the layout script when you want it off the site entirely.
 */

export const TRAVELPAYOUTS_DRIVE_SCRIPT_SRC =
  process.env.NEXT_PUBLIC_TRAVELPAYOUTS_DRIVE_SCRIPT_SRC ||
  'https://emrldco.com/NTQ1MTYy.js?t=545162';

/** Inline loader — injected in <head> per Travelpayouts install instructions. */
export function getTravelpayoutsDriveLoaderScript() {
  const src = JSON.stringify(TRAVELPAYOUTS_DRIVE_SCRIPT_SRC);
  return `(function(){var s=document.createElement("script");s.async=1;s.src=${src};document.head.appendChild(s);})();`;
}
