import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global scroll-to-top on every route change.
 * React Router preserves scroll position by default — which is wrong for content sites.
 * Excluded paths: admin/fleet/hotel/gps-admin/driver back-office (own scroll containers).
 */
const EXCLUDED_PREFIXES = ['/admin', '/fleet', '/hotel', '/gps-admin', '/driver'];

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return;
    // If the URL has a hash, let the browser scroll to that anchor instead
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
