// The iPad also identifies itself as a Mac when Safari requests desktop websites.
if (/iPad/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && /Mac/i.test(navigator.platform + navigator.userAgent))) {
  const gameButton = 'button[data-action="fullscreen"], button[data-act="fullscreen"]';
  let exitBar;
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
  }

  function enterPresentation() {
    gameFrame = window.frameElement;
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
    exitButton.addEventListener('click', () => {
      leavePresentation();
      document.querySelector(gameButton)?.focus({preventScroll:true});
    });
    exitBar.append(exitButton);
    document.body.prepend(exitBar);
    exitButton.focus({preventScroll:true});
  }

  // Games redraw their buttons between questions. Handle the tap before each
  // game's desktop handler can request Safari's native gesture-based fullscreen.
  document.addEventListener('click', event => {
    const button = event.target.closest?.(gameButton);
    if (!button || button.disabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!exitBar) enterPresentation();
  }, true);
  window.addEventListener('pagehide', leavePresentation);
}
