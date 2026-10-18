// Teacher-only, optional background music. No game API, polling, or student audio.
(() => {
  let audio = null, panel = null, button = null, slider = null, status = null;
  let allowed = false, room = '', pending = false, revision = 0, failed = false;
  let volume = 0.18;
  try {
    const saved = localStorage.getItem('lantern-keeper:music-volume');
    if (saved !== null && Number.isFinite(Number(saved))) volume = Math.min(1, Math.max(0, Number(saved)));
  } catch {}

  function paint(message) {
    if (!panel) return;
    const playing = pending || Boolean(audio && !audio.paused);
    button.textContent = playing ? 'Pause music' : 'Play music';
    button.setAttribute('aria-pressed', String(playing));
    slider.value = String(Math.round(volume * 100));
    status.textContent = message || (pending ? 'Loading music…' : playing ? 'Playing · teacher only' : 'Off · teacher only');
  }
  function pause(reset = false) {
    revision++; pending = false;
    if (audio) {
      audio.pause();
      if (reset) { try { audio.currentTime = 0; } catch {} }
    }
    paint();
  }
  async function toggle() {
    if (!allowed) return;
    if (pending || (audio && !audio.paused)) { pause(); return; }
    const attempt = ++revision; pending = true; paint();
    try {
      if (!audio) {
        audio = new Audio(); audio.preload = 'none'; audio.loop = true;
        audio.addEventListener('error', () => { failed = true; pause(); paint('Music unavailable. The game continues normally.'); });
        audio.src = '/battle10/assets/lantern-house-theme.wav';
      }
      audio.volume = volume;
      if (failed) { failed = false; audio.load(); }
      await audio.play();
      if (attempt !== revision) return;
      if (!allowed) { audio.pause(); return; }
      pending = false; paint();
    } catch {
      if (attempt !== revision) return;
      pending = false; paint('Music could not start. Press Play to retry; the game is unaffected.');
    }
  }
  function mount(slot) {
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'lantern-music';
      panel.setAttribute('aria-label', 'Teacher background music');
      panel.innerHTML = '<span class="lantern-music-title">♫ Story music<small>Soft instrumental · no vocals</small></span><button type="button" class="button ghost tiny" aria-pressed="false">Play music</button><label>Volume <input aria-label="Music volume" type="range" min="0" max="100" step="1"></label><span class="lantern-music-status" role="status"></span>';
      button = panel.querySelector('button'); slider = panel.querySelector('input'); status = panel.querySelector('.lantern-music-status');
      button.addEventListener('click', () => void toggle());
      slider.addEventListener('input', () => {
        volume = Math.min(1, Math.max(0, Number(slider.value) / 100));
        if (audio) audio.volume = volume;
        try { localStorage.setItem('lantern-keeper:music-volume', String(volume)); } catch {}
      });
      paint();
    }
    if (panel.parentNode !== slot) slot.appendChild(panel);
  }
  window.LanternMusic = { update({ teacher, phase, pin, slot }) {
    const next = Boolean(teacher && phase && phase !== 'ended' && slot);
    if (!next || room !== pin) { pause(true); room = pin || ''; }
    allowed = next;
    if (allowed) mount(slot); else panel?.remove();
  } };
  window.addEventListener('pagehide', () => { allowed = false; pause(true); });
})();
