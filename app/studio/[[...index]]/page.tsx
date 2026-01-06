import StudioClient from '../../studio-client';

export function generateStaticParams() {
  return [{ index: [] }];
}

export default function StudioPage() {
  return <StudioClient />;
}
