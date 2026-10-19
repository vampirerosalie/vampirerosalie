'use client';

import { useEffect, useState, type RefObject } from 'react';

// Use the canonical asset URL: /index.html redirects to / on Cloudflare.
const GAME_URL = '/battle11/?teacher=1';

export function MuseumFrame({ frameRef }: { frameRef: RefObject<HTMLIFrameElement | null> }) {
  const [attempt, setAttempt] = useState(0);
  const [loadState, setLoadState] = useState<'loading' | 'slow' | 'ready'>('loading');

  useEffect(() => {
    const ready = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === frameRef.current?.contentWindow &&
          event.data?.type === 'museum-jewel:status') setLoadState('ready');
    };
    window.addEventListener('message', ready);
    const timer = window.setTimeout(() => setLoadState(current => current === 'ready' ? current : 'slow'), 12000);
    return () => { window.clearTimeout(timer); window.removeEventListener('message', ready); };
  }, [attempt, frameRef]);

  const checkDocument = () => {
    try {
      // A load event alone can also mean about:blank or a browser error page.
      if (frameRef.current?.contentDocument?.getElementById('app')?.childElementCount) setLoadState('ready');
    } catch { /* Leave recovery controls available if the document is inaccessible. */ }
  };

  return <section aria-label="Battle 11 game panel" style={{ width: '100%', maxWidth: 1780, margin: '0 auto', position: 'relative' }}>
    {loadState !== 'ready' && <div role="status" aria-live="polite" style={{ padding: 24, borderRadius: 16, background: '#241332', color: '#fff5dd', border: '1px solid #c9a45d', marginBottom: 12 }}>
      <strong>{loadState === 'slow' ? 'Battle 11 is taking longer to open.' : 'Opening Battle 11…'}</strong>
      <p>{loadState === 'slow' ? 'You can retry this panel or open the game directly. Your saved room and progress are kept.' : 'Loading The Missing Museum Jewel and reconnecting to your room.'}</p>
      {loadState === 'slow' && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <button type="button" className="fullscreen-button" onClick={() => { setLoadState('loading'); setAttempt(value => value + 1); }}>Retry Battle 11</button>
        <a href={GAME_URL} style={{ color: '#ffe19b', textDecoration: 'underline' }}>Open Battle 11 directly</a>
      </div>}
    </div>}
    <iframe ref={frameRef} key={attempt} className="battle7-frame" title="Battle Eleven: The Missing Museum Jewel teacher game"
      src={GAME_URL} allow="fullscreen" onLoad={checkDocument} onError={() => setLoadState('slow')}
      style={{ position: 'relative', inset: 'auto', display: 'block', width: '100%', height: 'calc(100dvh - 200px)', minHeight: 640, borderRadius: 16, zIndex: 2 }} />
  </section>;
}
