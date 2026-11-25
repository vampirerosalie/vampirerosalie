// This module is server-only. A live phone receives one public question at a time.
const entries = [
  ['The principal insisted ______ checking the safety equipment before the event.', ['on', 'for', 'at', 'to'], 'A'],
  ['The organizers had to ______ the outdoor concert when lightning was reported nearby.', ['carry on', 'call off', 'take up', 'look into'], 'B'],
  ['The school trip has been postponed ______ further notice.', ['by', 'during', 'since', 'until'], 'D'],
  ['When her artwork won first prize in the competition, Mei Ling was ______.', ['over the moon', 'on thin ice', 'under the weather', 'behind the scenes'], 'A'],
  ['Aisyah quickly adapted ______ her new school routine.', ['with', 'into', 'to', 'at'], 'C'],
  ['Nadia couldn’t ______ the announcement because the people around her were talking loudly.', ['turn down', 'put off', 'make out', 'take over'], 'C'],
  ['The final result depends ______ how accurately each team follows the instructions.', ['for', 'on', 'to', 'at'], 'B'],
  ['After breaking the same rule for the third time, Darren knew he was ______ with his coach.', ['out of the woods', 'in the same boat', 'on cloud nine', 'on thin ice'], 'D'],
  ['The players were accused ______ changing the score during the competition.', ['of', 'for', 'with', 'from'], 'A'],
  ['Before submitting your report, please ______ your answers to check for mistakes.', ['come across', 'give away', 'put up', 'go over'], 'D'],
  ['The hikers squeezed ______ a narrow opening in the cave.', ['across', 'around', 'through', 'over'], 'C'],
  ['The room was awkwardly silent, so Amir told a funny story to ______.', ['miss the boat', 'break the ice', 'burn the midnight oil', 'cut corners'], 'B'],
  ['Several students objected ______ having their work displayed without permission.', ['for', 'against', 'on', 'to'], 'D'],
  ['When the captain was injured, the vice-captain had to ______ the team.', ['take over', 'give up', 'break down', 'turn up'], 'A'],
  ['Rina was absent ______ school for two days because she had a fever.', ['by', 'from', 'to', 'at'], 'B'],
  ['A trip to the dentist made Sarah nervous, but she decided to ______ and get it over with.', ['pull someone’s leg', 'hit the road', 'bite the bullet', 'spill the beans'], 'C'],
  ['The discovery was made ______ accident while the researcher was testing another idea.', ['in', 'on', 'by', 'at'], 'C'],
  ['We ______ printer paper halfway through preparing the posters.', ['set off', 'picked up', 'ran out of', 'turned down'], 'C'],
  ['A good leader remains calm ______ pressure, even when things go wrong.', ['under', 'at', 'by', 'with'], 'A'],
  ['Losing their first match turned out to be ______ because it helped the team identify their weaknesses and improve.', ['a blessing in disguise', 'the last straw', 'a piece of cake', 'a wild goose chase'], 'A'],
];

export const QUESTIONS = entries.map(([prompt, choices, answer], index) => ({
  id: 'q' + String(index + 1).padStart(2, '0'),
  number: index + 1,
  type: 'mcq',
  prompt,
  options: Object.fromEntries(choices.map((text, i) => ['ABCD'[i], text])),
  answer,
}));
