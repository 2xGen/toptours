import { redirect } from 'next/navigation';

// 301 Permanent Redirect from /toptours to /leaderboard
export default async function TopToursRedirect({ searchParams }) {
  const params = await searchParams;
  const queryString = new URLSearchParams(params).toString();
  const redirectUrl = queryString ? `/leaderboard?${queryString}` : '/leaderboard';
  
  redirect(redirectUrl); // 301 redirect (Next.js redirect is permanent by default)
}
