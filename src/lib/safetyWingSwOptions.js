/**
 * Presets for /admin/links SafetyWing short links (/sw/{slug} → SafetyWing ambassador URLs).
 */
import {
  SAFETYWING_NOMAD_INSURANCE_URL,
  SAFETYWING_NOMAD_INSURANCE_COMPLETE_URL,
} from './safetyWingAffiliate';

export const SW_NOMAD_INSURANCE_SLUG = 'nomad-insurance';
export const SW_NOMAD_INSURANCE_COMPLETE_SLUG = 'nomad-insurance-complete';

export const SAFETY_WING_SW_PRESETS = [
  {
    slug: SW_NOMAD_INSURANCE_SLUG,
    label: 'Nomad Insurance (Essential)',
    destinationUrl: SAFETYWING_NOMAD_INSURANCE_URL,
    previewTitle: 'Nomad Insurance — Global travel medical (SafetyWing)',
    ogDescription:
      'Health and travel insurance for nomads and remote workers. Sign up via TopTours with our SafetyWing partner link.',
    loadingHeadline: 'Just a second while we get Nomad Insurance ready for you...',
    progressLabel: 'Finalizing your signup',
    statusSteps: [
      'Preparing your Nomad Insurance link...',
      'Opening SafetyWing...',
      'Sending you there now...',
    ],
  },
  {
    slug: SW_NOMAD_INSURANCE_COMPLETE_SLUG,
    label: 'Nomad Insurance Complete',
    destinationUrl: SAFETYWING_NOMAD_INSURANCE_COMPLETE_URL,
    previewTitle: 'Nomad Insurance Complete — Full health & travel (SafetyWing)',
    ogDescription:
      'Full health insurance with travel protections for borderless living. Sign up via TopTours with our SafetyWing partner link.',
    loadingHeadline: 'Just a second while we get Nomad Insurance Complete ready for you...',
    progressLabel: 'Finalizing your signup',
    statusSteps: [
      'Preparing your Complete plan link...',
      'Opening SafetyWing...',
      'Sending you there now...',
    ],
  },
];

export function getSafetyWingSwPreset(seg) {
  const key = String(seg || '').trim().toLowerCase();
  return SAFETY_WING_SW_PRESETS.find((p) => p.slug === key) ?? null;
}
