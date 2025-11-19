import AdminDashboardClient from './AdminDashboardClient';

export const metadata = {
  title: 'Admin Dashboard | TopTours.ai',
  robots: {
    index: false,
    follow: false,
    noindex: true,
    nofollow: true,
    googleBot: {
      index: false,
      follow: false,
      noindex: true,
      nofollow: true,
    },
  },
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}

