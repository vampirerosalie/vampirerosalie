// Presentation only. Outcomes and probabilities remain private on the server.
export const LOCATION_SCENES = Object.freeze({
  camp: {hint:'Keep what you’ve earned. Move your gems into the safety of your Vault.', alt:'A red expedition tent and protected chest at the island camp'},
  cave: {hint:'Small treasures, steady discoveries. A safer choice for careful explorers.', alt:'Crystals glowing inside a tropical rocky cave'},
  bridge: {hint:'More to gain than in the cave—but one wrong step could cost you.', alt:'A wooden rope bridge crossing a lush island ravine'},
  ruins: {hint:'Treasure isn’t always gems. Find something that could help you defend—or strike back.', alt:'Ancient overgrown stone arches and a closed equipment coffer'},
  temple: {hint:'The greatest treasures come with the greatest danger. Will you take the risk?', alt:'Steep stone steps leading to the ancient Sun Temple'},
  harbor: {hint:'Gems or something useful for your next move? These shores offer a little of both.', alt:'A sheltered turquoise harbour with a wooden dock and sailing ship'}
});
export function locationScene(id) {
  const scene=LOCATION_SCENES[id];
  return scene ? {...scene,src:`/battle12/assets/locations/${id}.webp`} : null;
}
