/** One-off: fetch Viator display fields for hub pick product codes. */
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';

config({ path: '.env.local' });

const apiKey = process.env.VIATOR_API_KEY;
if (!apiKey) {
  console.error('VIATOR_API_KEY missing');
  process.exit(1);
}

const CODES = [
  // Aruba
  '245508', '5493518P2', '13835P19', '324189P3', '6593P17', '37387P1',
  '459169P1', '392509P1', '5621222P1', '5566924P9', '459169P2', '444239P2',
  '5595462P1', '364486P1', '6593P11',
  // Prague
  '63851P6', '402036P7', '286699P2', '73335P5', '5577125P10', '20364P20',
  '428424P1', '72192P3', '40610P2', '107194P161', '404605P2', '366784P44',
  '169084P1', '7812P36', '423010P8',
  // Arusha
  '427486P16', '411336P2', '114963P10', '202273P3', '5608934P4', '305732P11',
  '259457P11', '142902P29', '392474P1', '150526P11', '392474P8', '480452P1',
  '5596000P1', '141010P1', '114963P4',
  // Reykjavik
  '249297P1', '452727P1', '52876P2', '54996P30', '30581P7', '386554P12',
  '5590285P1', '388640P9', '457881P1', '399370P3', '101905P7', '423175P7',
  '63280P4', '319673P1', '468851P2', '341004P2',
  // Zanzibar
  '384585P4', '438526P3', '384585P5', '461598P6', '461598P11', '5570447P3',
  '384585P1', '384585P2', '370672P2', '257758P2', '373325P1', '252195P2',
  '252690P1', '252690P7', '164528P5',
  // San José
  '169001P7', '218955P11', '102973P43', '106730P6', '106730P4', '172814P1',
  '382740P1', '345782P1', '40636P6', '68129P3', '5585860P3', '5521744P1',
  '26853P120', '148805P4', '150268P4',
  // Cusco
  '333328P1', '44685P5', '316433P5', '5497204P1', '213343P2', '153304P7',
  '25721P13', '153304P5', '146929P5', '401893P3', '458453P1', '101268P6',
  '425316P2', '35087P1', '66100P10',
  // Marrakech
  '182237P1', '5591264P4', '25014P17', '5579503P5', '5559393P1', '373568P1',
  '445955P1', '6591P10', '425498P1', '72575P1', '432324P1', '451280P1',
  '350573P7', '408609P1', '461336P1',
  // Kuala Lumpur
  '239761P1', '15250P5', '133205P14', '203617P10', '20961P148', '63959P76',
  '110690P3', '117717P3', '117717P1', '136080P1', '23424P5', '5579203P7',
  '383435P1', '166587P3', '383435P3',
  // Hanoi
  '102744P3', '73282P7', '11021P10', '91605P6', '216020P3', '216020P4',
  '5570597P1', '134742P1', '87200P6', '5609309P1', '5606651P1', '379197P2',
  '252399P16', '5578294P4', '159025P24',
  // Dubrovnik
  '179010P5', '32373P8', '118286P9', '392016P3', '418845P1', '480784P1',
  '480967P1', '341581P2', '72995P5', '213777P2', '49470P3', '213079P1',
  '118286P4', '347742P3', '69289P4',
  // Cairo
  '424652P1', '46130P11', '442172P7', '5508780P3', '386581P3', '430271P1',
  '5565544P1', '18966P5', '375833P1', '147895P4', '55015P13', '319706P12',
  '5601916P10', '10124P15', '426848P20',
  // Interlaken
  '436352P1', '76545P28', '5494782P1', '6891P39', '8283P303', '6891P29',
  '6891SNOWSHOE', '6891P34', '5569934P9', '440842P1', '5591757P10', '5591757P11',
  '8283P108', '8283P243', '8283P310',
  // Banff
  '467394P11', '370405P4', '5558003P1', '274286P3', '402277P2', '45607P45',
  '152062P3', '274286P6', '299389P8', '332715P6', '5492728P3', '387099P6',
  '402277P6', '402277P3', '180217P55',
  // Siem Reap
  '53356P7', '111383P10', '87436P7', '406636P3', '152500P2', '31721P20',
  '31721P29', '118579P23', '239308P14', '459264P1', '111383P7', '362441P1',
  '107360P2', '137038P12', '488810P1',
  // Galápagos Islands
  '181466P9', '262714P7', '389221P3', '104124P1', '19569P11', '19569P15',
  '418793P1', '181466P11', '220666P69', '68892P1', '418793P4', '120233P55',
  '181466P14', '262714P5', '92349P14',
  // Queenstown
  '5618758P1', '113352P3', '5590256P1', '5590728P1', '162745P4', '16846P4',
  '18270P3', '15518P2', '318829P7', '3960P28', '251248P3', '72435P6',
  '56760P79', '38244P5', '9180P11',
];

function bestImage(tour) {
  const variants = tour?.images?.[0]?.variants;
  if (Array.isArray(variants) && variants.length) {
    const sorted = [...variants].sort((a, b) => (b.width || 0) - (a.width || 0));
    return sorted.find((v) => v.width >= 400 && v.width <= 800)?.url || sorted[0]?.url || null;
  }
  return tour?.images?.[0]?.url || null;
}

function durationMinutes(tour) {
  return (
    tour?.itinerary?.duration?.fixedDurationInMinutes ||
    tour?.duration?.fixedDurationInMinutes ||
    tour?.duration?.variableDurationFromMinutes ||
    null
  );
}

async function fetchProduct(code) {
  const res = await fetch(`https://api.viator.com/partner/products/${code}?currency=USD`, {
    headers: {
      'exp-api-key': apiKey,
      Accept: 'application/json;version=2.0',
      'Accept-Language': 'en-US',
    },
  });
  if (!res.ok) return { code, error: res.status };
  const tour = await res.json();
  return {
    code,
    imageUrl: bestImage(tour),
    fromPrice: tour?.pricing?.summary?.fromPrice ?? null,
    rating: tour?.reviews?.combinedAverageRating ?? null,
    reviewCount: tour?.reviews?.totalReviews ?? null,
    durationMinutes: durationMinutes(tour),
    title: tour?.title || null,
  };
}

let results = {};
try {
  results = JSON.parse(readFileSync('scripts/hub-pick-display-data.json', 'utf8'));
} catch {
  /* fresh run */
}

for (const code of CODES) {
  const data = await fetchProduct(code);
  results[code] = data;
  console.log(code, data.fromPrice != null ? `$${data.fromPrice}` : 'no price', data.error || 'ok');
  await new Promise((r) => setTimeout(r, 200));
}

writeFileSync('scripts/hub-pick-display-data.json', JSON.stringify(results, null, 2));
console.log('Wrote scripts/hub-pick-display-data.json');
