// Only server modules import this file. Answer variants and hunt seals are never
// shipped in the student bundle or in an unauthenticated room response.
export const QUESTIONS = Object.freeze([
  { text: 'The failure of the beacon had prevented the __________ from entering the harbour.', answers: ['fishing boats', 'the fishing boats', 'boats'], hint: 'Who or what is waiting outside the harbour?', evidence: 'Paragraph 1', discovery: "Mara’s folded message", action: 'Unfold the message' },
  { text: 'What was Mara most likely trying to protect the glass star from?', answers: ['rainwater', 'the rainwater', 'water'], hint: 'Connect what harms the star with what is happening above its stand.', evidence: 'Paragraphs 1–2', discovery: 'Damp cloth', action: 'Inspect the damp surface' },
  { text: 'Which lantern did Lina choose despite its neglected appearance?', answers: ['the copper lantern', 'copper lantern', 'copper', 'the other'], hint: 'Which lantern does Lina clean after setting the polished one aside?', evidence: 'Paragraph 3', discovery: 'Copper lantern', action: 'Light the lantern' },
  { text: 'What fault made the polished lantern unsafe to carry?', answers: ['damaged handle', 'a damaged handle', 'the damaged handle', "the silver lantern's damaged handle"], hint: 'Read the repair label. Which part might break?', evidence: 'Paragraph 3', discovery: 'Repair label', action: 'Turn over the label' },
  { text: 'Which route remained usable after the storm changed their original plan?', answers: ['a covered walkway', 'the covered walkway', 'covered walkway', 'walkway'], hint: 'Which route still reaches the storehouse?', evidence: 'Paragraph 4', discovery: 'Route sketch', action: 'Reveal the safe route' },
  { text: 'What feature of that route reassured Rafi enough to continue?', answers: ['its firm stone floor', 'the firm stone floor', 'firm stone floor', 'stone floor', 'its stone floor', 'the stone floor'], hint: 'What does the lantern reveal about the path?', evidence: 'Paragraph 4', discovery: 'Illuminated walkway', action: 'Illuminate the route' },
  { text: 'Which object was actually producing the noise in the storehouse?', answers: ['a loose shutter', 'the loose shutter', 'loose shutter', 'shutter', 'a shutter', 'the shutter'], hint: 'What does Lina secure before the noise stops?', evidence: 'Paragraph 5', discovery: 'Loose shutter', action: 'Secure the shutter' },
  { text: 'Find one word from the passage meaning: Unwilling or hesitant to do something.', answers: ['reluctant'], hint: 'Look at Rafi’s reaction before entering the walkway.', evidence: 'Paragraph 4', discovery: 'Vocabulary token I', action: 'Collect the notebook word', vocabulary: true },
  { text: 'Find one word from the passage meaning: Very weak and difficult to hear.', answers: ['faint'], hint: 'Look for a word describing the tapping sound.', evidence: 'Paragraph 5', discovery: 'Vocabulary token II', action: 'Collect the notebook word', vocabulary: true },
  { text: 'Which cupboard should Lina and Rafi open to recover the glass star?', answers: ['the moon cupboard', 'moon cupboard', 'moon', 'the moon'], hint: 'Connect the material used to protect glass with the cupboard contents.', evidence: 'Paragraphs 5–6', discovery: 'The final seal', action: 'Start final search' },
]);

export const PASSAGE = Object.freeze([
  `When Lina and Rafi reached Lantern House, the storm had passed, but fishing boats were still waiting outside the harbour. The beacon's enchanted glass star was missing, so its light could not guide them in. The star lost its glow whenever it became wet. The keeper, Mara, had gone to help at the damaged bridge. She had left Lina a message: "The star is safe. My notebook will help you find it."`,
  `Inside the tower, rainwater dripped through a crack directly above the star's empty stand. A cloth covering some tools was damp on top but dry underneath. Lina had imagined a thief entering through the open window. Now she looked again at the keeper's message and stopped searching for footprints.`,
  `Rafi found two lanterns. The silver one had polished sides; the copper lantern was coated with dust. A repair label warned that the silver lantern's damaged handle might break when carried. Lina set the polished lantern aside and cleaned the glass of the other. Its light was strong enough to read Mara's notebook.`,
  `One entry described a shortcut to the storehouse through the garden. Rafi headed towards the gate, but Lina noticed a newer note: the wooden bridge on that route was unsafe after the storm. A covered walkway still reached the same building. Rafi was reluctant to enter until Lina lit up its firm stone floor. They took the notebook with them.`,
  `Inside the storehouse, a faint tapping made them pause. A loose shutter moved in the wind. Lina secured it, and the noise stopped. Three cupboards stood against the wall. Mara's list said that the sun cupboard held metal tools, the moon cupboard held old blankets, and the star cupboard held paper decorations.`,
  `Lina turned to the notebook's final page. Mara never wrote the exact location of anything valuable in a message that anyone could read. Instead, she referred to familiar routines. Lina remembered helping her wrap glass deliveries in blankets. The latest message read: "The roof must be repaired before the star returns. Until then, it is with the material we use to keep glass from getting scratched." Lina looked at the three cupboard doors.`,
]);

// Dialogue before each question. Q9 intentionally follows Q8 without another
// cutscene, keeping the notebook vocabulary pair brisk.
export const DIALOGUE = Object.freeze({
  1: [
    ['Rafi', "Something's wrong. The lighthouse should be shining tonight."],
    ['Lina', 'The keeper left us a message. Maybe it will explain what happened.'],
    ['Rafi', "Then we'd better investigate before the weather changes again."],
  ],
  2: [['Lina', 'The keeper says the star is safe.'], ['Rafi', "Then perhaps its disappearance isn't what it first seemed."]],
  3: [['Rafi', 'We should look carefully before deciding what happened.'], ['Lina', "Agreed. Let's investigate the rest of this room."]],
  4: [['Lina', 'Good. We can finally see the notebook properly.'], ['Rafi', "Let's find out what the keeper wrote."]],
  5: [['Rafi', 'Good thing we checked the equipment first.'], ['Lina', "Let's keep following the keeper's notes."]],
  6: [['Lina', 'The storm has made this journey more complicated.'], ['Rafi', "Then we'll have to pay attention to where we're going."]],
  7: [['Rafi', 'All right. I feel better about going ahead now.'], ['Lina', "The storehouse shouldn't be far."]],
  8: [['Rafi', "That's one mystery solved."], ['Lina', "We still have more of the keeper's notes to understand."], ['Rafi', 'Some of the words in this notebook are unfamiliar.'], ['Lina', "Let's work out what they mean from the story."]],
  10: [['Rafi', "Three cupboards. But we can't search everything forever."], ['Lina', 'The keeper left clues. We need to connect them.']],
  hunt: [['Lina', "I think we've worked out where the star was hidden!"], ['Rafi', "Then let's find the keeper's seal!"]],
  ending: [['Lina', 'We found it!'], ['Rafi', "Come on! Let's bring the light back to the harbour!"]],
});
