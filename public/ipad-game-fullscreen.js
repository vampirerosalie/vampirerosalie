{
  // The iPad also identifies itself as a Mac when Safari requests desktop websites.
  const ipad = /iPad/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && /Mac/i.test(navigator.platform + navigator.userAgent));
  const gameButton = document.currentScript?.hasAttribute('data-explicit-controls')
    ? 'button[data-game-fullscreen-control]'
    : 'button[data-action="fullscreen"], button[data-act="fullscreen"]';
  let exitBar;
  let nativePresentation = false;
  let gameFrame;
  let parentScroll = [];

  function leavePresentation() {
    if (!exitBar) return;
    delete document.documentElement.dataset.gamePresentation;
    if (gameFrame) {
      delete gameFrame.dataset.gameFullscreen;
      delete gameFrame.ownerDocument.documentElement.dataset.gameFrameFullscreen;
      for (const { element, left, top } of parentScroll) {
        element.scrollTo({ left, top, behavior:'instant' });
      }
      parentScroll = [];
      gameFrame = null;
    }
    exitBar.remove();
    exitBar = null;
    nativePresentation = false;
  }

  function enterPresentation(native = false) {
    nativePresentation = native;
    gameFrame = native ? null : window.frameElement;
    if (gameFrame) {
      // Promoting the iframe can shorten the parent's page and reset its scroll.
      for (let element = gameFrame.parentElement; element; element = element.parentElement) {
        if (element.scrollLeft || element.scrollTop) {
          parentScroll.push({ element, left:element.scrollLeft, top:element.scrollTop });
        }
      }
      gameFrame.dataset.gameFullscreen = 'true';
      gameFrame.ownerDocument.documentElement.dataset.gameFrameFullscreen = 'true';
    }
    document.documentElement.dataset.gamePresentation = 'true';
    exitBar = document.createElement('div');
    exitBar.id = 'game-presentation-bar';
    const exitButton = document.createElement('button');
    exitButton.type = 'button';
    exitButton.textContent = 'Exit full screen';
    exitButton.addEventListener('click', async () => {
      if (nativePresentation && document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch { return; }
      }
      leavePresentation();
      document.querySelector(gameButton)?.focus({preventScroll:true});
    });
    exitBar.append(exitButton);
    document.body.prepend(exitBar);
    exitButton.focus({preventScroll:true});
  }

  // Games redraw their buttons between questions. Handle the tap before each
  // game's desktop handler can request Safari's native gesture-based fullscreen.
  document.addEventListener('click', async event => {
    const button = event.target.closest?.(gameButton);
    if (!button || button.disabled || (!ipad && !button.hasAttribute('data-game-fullscreen-control'))) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (exitBar) return;
    if (!ipad && document.fullscreenEnabled) {
      try {
        await document.documentElement.requestFullscreen();
        if (document.fullscreenElement) enterPresentation(true);
        return;
      } catch { /* The game can still expand inside this tab. */ }
    }
    enterPresentation();
  }, true);
  document.addEventListener('fullscreenchange', () => {
    if (nativePresentation && !document.fullscreenElement) leavePresentation();
  });
  window.addEventListener('pagehide', leavePresentation);
}
