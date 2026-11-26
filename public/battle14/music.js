// A single player stays mounted as the teacher advances between questions and rounds.
export function mountTeacherMusic(panel) {
  const button = panel.querySelector('button');
  const status = panel.querySelector('[role="status"]');
  let audio;
  let enabled = false;
  let volume = 0.16;
  let attempt = 0;
  let room = '';

  function showControl() {
    button.textContent = enabled ? 'Mute music' : 'Play music';
  }
  function stop(rewind) {
    attempt++;
    enabled = false;
    if (audio) {
      audio.pause();
      if (rewind && audio.readyState) audio.currentTime = 0;
    }
    status.textContent = '';
    showControl();
  }
  button.addEventListener('click', async () => {
    if (enabled) { stop(false); return; }
    if (panel.hidden) return;
    if (!audio) {
      audio = new Audio('./electrodoodle.mp3');
      audio.loop = true;
      audio.addEventListener('error', () => {
        if (!enabled) return;
        stop(false);
        status.textContent = 'Music could not load. Press Play music to retry.';
      });
    } else if (audio.error) {
      audio.load();
    }
    const current = ++attempt;
    enabled = true;
    audio.volume = volume;
    status.textContent = '';
    showControl();
    try { await audio.play(); }
    catch {
      if (current !== attempt) return;
      stop(false);
      status.textContent = 'Music could not start. Press Play music to retry.';
    }
  });
  window.addEventListener('pagehide', () => stop(true));
  return (pin, phase, paused) => {
    const nextRoom = phase && phase !== 'finished' ? pin : '';
    if (nextRoom !== room) { stop(true); room = nextRoom; }
    panel.hidden = !room;
    volume = phase === 'shootout' && !paused ? 0.34 : 0.16;
    if (audio && audio.volume !== volume) audio.volume = volume;
  };
}
