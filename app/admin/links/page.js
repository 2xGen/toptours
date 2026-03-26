import GeneratorClient from './GeneratorClient';

export const metadata = {
  title: 'Viator Link Generator | TopTours.ai',
  robots: {
    index: false,
    follow: false,
    noindex: true,
    nofollow: true,
  },
};

export default function AdminLinksPage() {
  return <GeneratorClient />;
}

