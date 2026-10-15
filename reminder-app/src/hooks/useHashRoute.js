import { useCallback, useEffect, useState } from 'react';

// Tiny hash router: #/today, #/add ... so the browser back button works.
export default function useHashRoute(routes, fallback) {
  const read = useCallback(() => {
    const name = window.location.hash.replace(/^#\/?/, '');
    return routes.includes(name) ? name : fallback;
  }, [routes, fallback]);

  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [read]);

  const navigate = useCallback((name) => {
    window.location.hash = `/${name}`;
  }, []);

  return [route, navigate];
}
