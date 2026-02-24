import { permanentRedirect } from 'next/navigation';

// /results is disabled: redirect to tours hub (was legacy search results page)
export default function ResultsPage() {
  permanentRedirect('/tours');
}
