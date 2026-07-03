import { useParams, Link } from 'react-router-dom';
import { CARD } from '../../theme/tokens';
import PageTitle from './PageTitle';

const titleFromSlug = (slug: string) =>
  slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/** Placeholder for production nav items not yet built in this demo. */
export default function ComingSoon() {
  const { feature = 'this-page' } = useParams();
  const title = titleFromSlug(feature);

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <PageTitle>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
      </PageTitle>
      <div className={`${CARD} mt-5 p-10 text-center`}>
        <p className="text-sm font-semibold text-gray-700 mb-1">Coming soon</p>
        <p className="text-xs text-gray-400 mb-4">
          {title} is part of the production build and isn’t wired into this demo yet.
        </p>
        <Link to="/risk-monitor" className="text-xs font-semibold text-amber-600 hover:underline">
          Go to Risk Monitor →
        </Link>
      </div>
    </div>
  );
}
