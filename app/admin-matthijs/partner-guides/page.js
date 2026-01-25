import PartnerGuidesAdminClient from './PartnerGuidesAdminClient';

export const metadata = {
  title: 'Partner Guides Admin | TopTours.ai',
  robots: {
    noindex: true,
    nofollow: true,
  },
};

export default function PartnerGuidesAdminPage() {
  return <PartnerGuidesAdminClient />;
}
