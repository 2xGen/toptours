import { SIEM_REAP_TRAVEL_INSURANCE } from '@/data/destinationTravelInsurance/siem-reap';

const PAGES = {
  'siem-reap': SIEM_REAP_TRAVEL_INSURANCE,
};

export function getDestinationTravelInsurancePage(destinationId) {
  if (!destinationId) return null;
  const key = String(destinationId).toLowerCase().trim();
  return PAGES[key] || null;
}

export function destinationHasTravelInsurancePage(destinationId) {
  return !!getDestinationTravelInsurancePage(destinationId);
}
