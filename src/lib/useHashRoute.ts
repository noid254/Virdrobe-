import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'profile'; handle: string }
  | { name: 'tryon'; id: string }
  | { name: 'me' };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'u' && parts[1]) return { name: 'profile', handle: decodeURIComponent(parts[1]) };
  if (parts[0] === 't' && parts[1]) return { name: 'tryon', id: decodeURIComponent(parts[1]) };
  if (parts[0] === 'me') return { name: 'me' };
  return { name: 'home' };
}

export function useHashRoute(): [Route, (hash: string) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return [route, (hash) => (window.location.hash = hash)];
}
