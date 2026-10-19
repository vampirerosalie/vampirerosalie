// Server-owned reading content. Map, QR cards and projected views expose titles only.
export const INSTRUCTIONS = 'Choose the sentence (A–H) that best fits each gap. Use each sentence only once. There are two extra sentences. Your choices are saved during visits, but will only be marked after Final Submission.';

export const OPTIONS = Object.freeze({
  A: 'Its real value was in the background, rather than the person it was meant to show.',
  B: 'The timing made the accusation less convincing, despite how suspicious the behaviour had seemed.',
  C: 'With the truth established, she could explain which details had helped and which had misled the investigation.',
  D: 'The usual safety procedure provided enough evidence to confirm that the object had been put back.',
  E: 'The moment the loss was noticed might have been much later than the theft itself.',
  F: 'She hoped he would reveal his plan if he believed that nobody suspected him.',
  G: 'She decided that everyone should remain in the room until their belongings had been checked.',
  H: 'Her certainty came from a familiar routine, not a clear memory of that particular occasion.',
});

export const STATIONS = Object.freeze([
  {
    number: 1, title: 'The Missing Jewel', cardTitle: 'The Cabinet', image: 'station-1.png',
    before: 'As the museum prepared to close at four, staff discovered that its blue jewel was missing. Aina, a student reporter, heard the guard insist that he had checked the cabinet only an hour earlier. She asked whether he had examined its contents. He explained that he had simply pulled the handle to make sure it was locked.',
    after: 'Aina began asking about the whole afternoon, not just the final few minutes.',
    answer: 'E',
    explanation: 'A locked cabinet does not establish that the jewel was still inside. Discovery may be much later than the theft, so Aina investigates a wider period.',
  },
  {
    number: 2, title: 'The Departure', cardTitle: 'The Departure', image: 'station-2.png',
    before: 'One visitor remembered a delivery driver rushing through the front doors with a large bag. The entrance recording showed that he had left at 2.10 and had not returned. However, the museum guide had shown the jewel to a school group at 2.25. Their teacher confirmed seeing it.',
    after: 'Aina recorded the driver’s departure but decided that his hurry was not a good reason to keep treating him as the main suspect.',
    answer: 'B',
    explanation: 'The driver left before a reliable later sighting of the jewel. The sequence weakens suspicion based on his hurried behaviour.',
  },
  {
    number: 3, title: 'The Guide’s Account', cardTitle: 'The Account', image: 'station-3.png',
    before: 'At 2.30, the guide had taken the jewel out for a photograph. She confidently said that it had been returned immediately afterwards. Yet she could not remember who had carried it back. “We always put everything away before the next group arrives,” she explained.',
    after: 'Aina wrote “return not confirmed” in her notebook. She needed an observation from that afternoon before she could narrow down when the theft had happened.',
    answer: 'H',
    explanation: 'The guide remembers a normal routine, not a specific observation of the return. That explains “return not confirmed”.',
  },
  {
    number: 4, title: 'The Photograph', cardTitle: 'The Photograph', image: 'station-4.png',
    before: 'Mr Vale, an exhibition helper, said he had stayed at the ticket desk throughout the photography session. A visitor offered Aina a portrait of her daughter taken during that session.',
    after: 'In a mirror behind the smiling girl, Mr Vale could be seen standing beside the uncovered jewel. The image did not prove that he had stolen anything, but it contradicted his explanation of where he had been.',
    answer: 'A',
    explanation: 'The portrait’s evidence is in its background, not its intended subject. The mirror contradicts Mr Vale’s account without proving theft by itself.',
  },
  {
    number: 5, title: 'A Quiet Watch', cardTitle: 'The Watch', image: 'station-5.png',
    before: 'Aina showed the guide the reflection but did not confront Mr Vale. With the guide quietly watching, she announced that visitors could leave while staff finished packing.',
    after: 'Mr Vale immediately went to a stack of folded display cloths. He slipped something into his coat and headed towards the side exit. Instead of calling out across the room, Aina signalled to the guide, who stopped him before he reached the door.',
    answer: 'F',
    explanation: 'Aina avoids confrontation and allows departures while someone watches, hoping the suspect will reveal his next action.',
  },
  {
    number: 6, title: 'The Final Report', cardTitle: 'The Report', image: 'station-6.png',
    before: 'The jewel was inside Mr Vale’s coat, wrapped in a piece of display cloth. He admitted hiding it during the photography session and collecting it when he thought everyone was leaving. He had intended to sell it to pay a debt.',
    after: 'In her report, Aina explained why the locked cabinet and the hurried driver had attracted attention, but had not established when the jewel was taken or who had taken it.',
    answer: 'C',
    explanation: 'Recovery and admission establish the facts, allowing a report distinguishing evidence from misleading impressions.',
  },
]);

export const ANSWER_KEY = Object.freeze(STATIONS.map(station => station.answer));
export const DISTRACTOR_EXPLANATIONS = Object.freeze({
  D: 'D wrongly treats routine as proof.',
  G: 'G contradicts the decision to allow visitors to leave.',
});
