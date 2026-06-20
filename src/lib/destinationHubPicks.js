import { arubaHubPicks } from '@/data/destinationHubPicks/aruba';
import { curacaoHubPicks } from '@/data/destinationHubPicks/curacao';
import { pragueHubPicks } from '@/data/destinationHubPicks/prague';
import { arushaHubPicks } from '@/data/destinationHubPicks/arusha';
import { reykjavikHubPicks } from '@/data/destinationHubPicks/reykjavik';
import { zanzibarHubPicks } from '@/data/destinationHubPicks/zanzibar';
import { sanJoseHubPicks } from '@/data/destinationHubPicks/san-jose';
import { cuscoHubPicks } from '@/data/destinationHubPicks/cusco';
import { marrakechHubPicks } from '@/data/destinationHubPicks/marrakech';
import { kualaLumpurHubPicks } from '@/data/destinationHubPicks/kuala-lumpur';
import { hanoiHubPicks } from '@/data/destinationHubPicks/hanoi';
import { dubrovnikHubPicks } from '@/data/destinationHubPicks/dubrovnik';
import { cairoHubPicks } from '@/data/destinationHubPicks/cairo';
import { interlakenHubPicks } from '@/data/destinationHubPicks/interlaken';
import { banffHubPicks } from '@/data/destinationHubPicks/banff';
import { siemReapHubPicks } from '@/data/destinationHubPicks/siem-reap';
import { galapagosIslandsHubPicks } from '@/data/destinationHubPicks/galapagos-islands';
import { queenstownHubPicks } from '@/data/destinationHubPicks/queenstown';
import { getHubPickDisplay } from '@/data/destinationHubPicks/staticDisplay';

const PICKS_BY_DESTINATION = {
  aruba: arubaHubPicks,
  curacao: curacaoHubPicks,
  prague: pragueHubPicks,
  arusha: arushaHubPicks,
  reykjavik: reykjavikHubPicks,
  zanzibar: zanzibarHubPicks,
  'san-jose': sanJoseHubPicks,
  cusco: cuscoHubPicks,
  marrakech: marrakechHubPicks,
  'kuala-lumpur': kualaLumpurHubPicks,
  hanoi: hanoiHubPicks,
  dubrovnik: dubrovnikHubPicks,
  cairo: cairoHubPicks,
  interlaken: interlakenHubPicks,
  banff: banffHubPicks,
  'siem-reap': siemReapHubPicks,
  'galapagos-islands': galapagosIslandsHubPicks,
  queenstown: queenstownHubPicks,
};

export function getDestinationHubPicks(destinationId) {
  if (!destinationId) return null;
  return PICKS_BY_DESTINATION[destinationId] || null;
}

export function hubUsesStaticDisplay(config) {
  return Boolean(config?.useStaticDisplay);
}

/** All unique Viator product codes referenced in a hub picks config. */
export function collectHubPickProductCodes(config) {
  if (!config) return [];
  const codes = new Set();
  const add = (pick) => {
    if (pick?.productCode) codes.add(String(pick.productCode));
  };
  for (const section of config.travelerSections || []) {
    for (const pick of section.picks || []) add(pick);
  }
  for (const item of config.quickAnswers || []) add(item);
  for (const row of config.tableTours || []) add(row);
  return [...codes];
}

export function getTourDisplayTitle(tour) {
  return tour?.title || tour?.tour_name || tour?.productName || tour?.seo?.title || '';
}

function getTourMatchableTitles(tour) {
  return [tour?.title, tour?.tour_name, tour?.productName, tour?.seo?.title]
    .filter(Boolean)
    .map((value) => value.toLowerCase());
}

export function findTourByProductCode(tours, productCode) {
  if (!productCode || !Array.isArray(tours) || tours.length === 0) return null;
  const code = String(productCode).toLowerCase();
  return (
    tours.find((t) => {
      const id = t?.productCode || t?.productId || t?.product_id || t?.id;
      return id && String(id).toLowerCase() === code;
    }) || null
  );
}

export function findTourByTitleMatch(tours, titleMatch) {
  if (!titleMatch || !Array.isArray(tours) || tours.length === 0) return null;
  const needle = titleMatch.toLowerCase().trim();
  return (
    tours.find((t) => getTourMatchableTitles(t).some((title) => title.includes(needle))) || null
  );
}

export function resolveHubPick(tours, pick, { staticOnly = false } = {}) {
  const display = pick.display || getHubPickDisplay(pick.productCode) || null;
  const tour = staticOnly
    ? null
    : (pick.productCode ? findTourByProductCode(tours, pick.productCode) : null) ||
      findTourByTitleMatch(tours, pick.titleMatch);
  return {
    ...pick,
    tour,
    display,
    resolvedTitle: tour ? getTourDisplayTitle(tour) : pick.fallbackTitle || pick.titleMatch,
  };
}

export function resolveHubPicksConfig(config, tours) {
  if (!config) return null;

  const staticOnly = hubUsesStaticDisplay(config);
  const featuredMatches = new Set();
  const travelerSections = config.travelerSections.map((section) => {
    const picks = section.picks.map((pick) => {
      const resolved = resolveHubPick(tours, pick, { staticOnly });
      if (pick.titleMatch) featuredMatches.add(pick.titleMatch.toLowerCase());
      return resolved;
    });
    return { ...section, picks };
  });

  let tableRows = [];
  if (config.showMoreTours !== false && Array.isArray(config.tableTours)) {
    const moreToursLimit = config.moreToursLimit ?? 12;
    tableRows = config.tableTours
      .filter((row) => !featuredMatches.has(row.titleMatch.toLowerCase()))
      .map((row) => resolveHubPick(tours, row))
      .slice(0, moreToursLimit);
  }

  const quickAnswers = (config.quickAnswers || []).map((item) =>
    resolveHubPick(tours, item, { staticOnly })
  );

  return {
    ...config,
    travelerSections,
    tableRows,
    quickAnswers,
  };
}
