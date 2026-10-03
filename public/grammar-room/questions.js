// Question bank transcribed from the supplied Battle 5 brief.
export const objects = [
  {
    "id": "bookshelf",
    "name": "Bookshelf",
    "letter": "S",
    "intro": "Two enchanted shelves hold a golden letter. Put the books in order to release it.",
    "reward": "A golden letter slips from between the books: S",
    "questions": [
      {
        "type": "books",
        "label": "The first shelf",
        "prompt": "Arrange the books to form a correct sentence.",
        "tiles": [
          "The",
          "ancient",
          "books",
          "were",
          "arranged",
          "according",
          "to",
          "their",
          "colours"
        ],
        "answers": [
          "The ancient books were arranged according to their colours"
        ],
        "hint": "Start with “The ancient books”. Read left to right, one shelf at a time.",
        "feedback": "The shelf clicks softly. One row is now in the correct order."
      },
      {
        "type": "books",
        "label": "The hidden bookmark",
        "prompt": "Form the passive voice sentence:\nThe librarian had hidden the silver bookmark behind the atlas.",
        "tiles": [
          "The",
          "silver",
          "bookmark",
          "had",
          "been",
          "hidden",
          "behind",
          "the",
          "atlas",
          "by",
          "the",
          "librarian"
        ],
        "answers": [
          "The silver bookmark had been hidden behind the atlas by the librarian"
        ],
        "hint": "Begin “The silver bookmark had been hidden”. Place the location next, then who hid it.",
        "feedback": "A golden letter slips from between the books: S"
      }
    ]
  },
  {
    "id": "clock",
    "name": "Old clock",
    "letter": "E",
    "intro": "The clock is frozen. Its hands will only move when the right answers are chosen.",
    "reward": "The clock ticks once. A glowing letter appears: E",
    "questions": [
      {
        "label": "Tenses, MCQ",
        "type": "mcq",
        "prompt": "Choose the best answer:\n\nBy the time the bell rang, the clock ___ for exactly one hour.",
        "choices": [
          "stops",
          "stopped",
          "has stopped",
          "had stopped"
        ],
        "answers": [
          "3"
        ],
        "hint": "The clock stopped before another past action happened.",
        "feedback": "Correct. Use past perfect for an earlier past action."
      },
      {
        "label": "Typed tense answer",
        "type": "text",
        "prompt": "Complete the sentence with the correct tense:\n\nWhile the children ___ (play) outside, the old clock suddenly struck twelve.\n\nType only the missing verb phrase.",
        "choices": [],
        "answers": [
          "were playing"
        ],
        "hint": "Two actions happened in the past. One action was in progress when another action interrupted it.",
        "feedback": "Correct. ‘Were playing’ is past continuous."
      },
      {
        "label": "Error correction, typed full sentence",
        "type": "text",
        "prompt": "Correct the sentence:\n\nThe clock was repair by the caretaker last winter.",
        "choices": [],
        "answers": [
          "The clock was repaired by the caretaker last winter"
        ],
        "hint": "Passive voice needs “was/were + past participle”.",
        "feedback": "Correct. The past participle is ‘repaired’."
      },
      {
        "label": "Articles, typed word answer",
        "type": "text",
        "prompt": "Complete the sentence:\n\nOnly ___ hour remains before the final clue disappears.\n\nType only the missing article.",
        "choices": [],
        "answers": [
          "an"
        ],
        "hint": "“Hour” starts with a vowel sound because the “h” is silent.",
        "feedback": "Correct. We say ‘an hour’."
      }
    ]
  },
  {
    "id": "table",
    "name": "Study diary",
    "letter": "C",
    "intro": "A diary lies open on the table. The ink glows when you read it carefully.",
    "reward": "The ink bottle rolls aside. Beneath it is the letter: C",
    "questions": [
      {
        "label": "Reading, typed short answer",
        "type": "text",
        "prompt": "According to the diary, what must the player earn before opening the door?",
        "choices": [],
        "answers": [
          "every clue",
          "all clues",
          "all the clues",
          "six clues",
          "every hidden clue"
        ],
        "hint": "Look at the last sentence of the diary.",
        "feedback": "Correct. The door should not be opened until every clue has been earned."
      },
      {
        "label": "Tenses, MCQ",
        "type": "mcq",
        "prompt": "Which sentence from the diary uses the present perfect tense?",
        "choices": [
          "The room was cleaned before the guests arrived.",
          "One drawer was left untouched.",
          "I have already placed the answer beneath the ink bottle.",
          "Whoever finds it must not open the door."
        ],
        "answers": [
          "2"
        ],
        "hint": "Present perfect often uses “have/has + past participle”.",
        "feedback": "Correct. ‘Have already placed’ is present perfect."
      },
      {
        "label": "Passive voice meaning, typed short answer",
        "type": "text",
        "prompt": "In the diary, what does “one drawer was left untouched” mean?\n\nType a short answer.",
        "choices": [],
        "answers": [
          "nobody touched one drawer",
          "no one touched one drawer",
          "someone did not touch one drawer",
          "one drawer was not touched",
          "the drawer was not touched"
        ],
        "hint": "Passive voice often hides who did the action.",
        "feedback": "Correct. It means the drawer was not touched."
      },
      {
        "label": "Vocabulary, typed word answer",
        "type": "text",
        "prompt": "In the diary, which word means “not opened, used, or changed”?",
        "choices": [],
        "answers": [
          "untouched"
        ],
        "hint": "The word begins with “un-”.",
        "feedback": "Correct. ‘Untouched’ means not touched or changed."
      }
    ]
  },
  {
    "id": "lockbox",
    "name": "Lockbox",
    "letter": "R",
    "intro": "A grammar seal and four word locks protect the lockbox. Break the seal, then use each meaning clue to spell its word with the letter dials.",
    "reward": "The lockbox opens. Inside is a red letter: R",
    "questions": [
      {
        "type": "seal",
        "label": "The grammar seal",
        "prompt": "Rewrite this sentence in passive voice:\n“The guard locked the wooden box before sunset.”",
        "choices": [
          "The wooden box was locked by the guard before sunset.",
          "The wooden box locked by the guard before sunset.",
          "The wooden box had been locked by the guard before sunset."
        ],
        "answers": [
          "0"
        ],
        "hint": "Keep the original simple past tense. The box receives the action: use “was + past participle”.",
        "feedback": "The grammar seal breaks. The letter dials begin to glow."
      },
      {
        "type": "dials",
        "label": "Word lock 1 of 4",
        "prompt": "Meaning: Strange and difficult to explain or understand; full of secrets.\nFind the 10-letter word.",
        "answers": [
          "mysterious"
        ],
        "hint": "An adjective beginning with “my-”. It describes something that is a mystery.",
        "feedback": "Word lock 1 clicks open. Another word is waiting."
      },
      {
        "type": "dials",
        "label": "Word lock 2 of 4",
        "prompt": "Meaning: Needed; essential for a particular purpose.\nFind the 9-letter word.",
        "answers": [
          "necessary"
        ],
        "hint": "An adjective beginning with “ne-”. Use one “c” and a double “s”.",
        "feedback": "Word lock 2 clicks open. Another word is waiting."
      },
      {
        "type": "dials",
        "label": "Word lock 3 of 4",
        "prompt": "Meaning: Easily broken or damaged.\nFind the 7-letter word.",
        "answers": [
          "fragile"
        ],
        "hint": "An adjective beginning with “fr-”. Handle a glass ornament this way.",
        "feedback": "Word lock 3 clicks open. Another word is waiting."
      },
      {
        "type": "dials",
        "label": "Word lock 4 of 4",
        "prompt": "Meaning: Belonging to the very distant past; thousands of years old.\nFind the 7-letter word.",
        "answers": [
          "ancient"
        ],
        "hint": "An adjective beginning with “an-”, often used to describe Egypt or Rome long ago.",
        "feedback": "The lockbox opens. Inside is a red letter: R"
      }
    ]
  },
  {
    "id": "mirror",
    "name": "Enchanted mirror",
    "letter": "E",
    "intro": "The mirror does not show your face. It shows sentences with hidden mistakes.",
    "reward": "The mirror clears. A silver letter appears: E",
    "questions": [
      {
        "label": "Error correction, typed word answer",
        "type": "text",
        "prompt": "Correct the mistake in this sentence:\n\nEvery reflection in the mirror were moving on its own.\n\nType only the corrected word.",
        "choices": [],
        "answers": [
          "was"
        ],
        "hint": "“Every reflection” is singular.",
        "feedback": "Correct. ‘Every reflection’ takes the singular verb ‘was’."
      },
      {
        "label": "Determiners, MCQ",
        "type": "mcq",
        "prompt": "Choose the best answer:\n\nThere was ___ dust on the mirror, but there were ___ fingerprints near the edge.",
        "choices": [
          "many / much",
          "some / several",
          "any / much",
          "a few / a little"
        ],
        "answers": [
          "1"
        ],
        "hint": "“Dust” is uncountable. “Fingerprints” are countable.",
        "feedback": "Correct. Use ‘some dust’ and ‘several fingerprints’."
      },
      {
        "label": "Error correction, typed full sentence",
        "type": "text",
        "prompt": "Correct the sentence:\n\nThe words on the mirror has disappeared.",
        "choices": [],
        "answers": [
          "The words on the mirror have disappeared"
        ],
        "hint": "The subject is “The words”, which is plural.",
        "feedback": "Correct. Plural subject takes ‘have’."
      },
      {
        "label": "Passive voice, MCQ",
        "type": "mcq",
        "prompt": "Choose the best passive form:\n\nThe mirror shows only truths.",
        "choices": [
          "Only truths are shown by the mirror.",
          "Only truths were showing by the mirror.",
          "Only truths have showed by the mirror.",
          "Only truths shown the mirror."
        ],
        "answers": [
          "0"
        ],
        "hint": "Present simple passive uses “am/is/are + past participle”.",
        "feedback": "Correct. ‘Are shown’ is the correct passive form."
      }
    ]
  },
  {
    "id": "window",
    "name": "Moonlit window",
    "letter": "T",
    "intro": "Moonlight shines through the window. Something is hidden among the curtains and leaves.",
    "reward": "A leaf falls from the plant. On it is the letter: T",
    "questions": [
      {
        "label": "Prepositions, MCQ",
        "type": "mcq",
        "prompt": "Choose the best answer:\n\nThe clue was hidden ___ the curtain and the wall, not ___ the flowerpot.",
        "choices": [
          "between / inside",
          "on / between",
          "under / into",
          "across / at"
        ],
        "answers": [
          "0"
        ],
        "hint": "The clue is in the space separating two things.",
        "feedback": "Correct. It was hidden between the curtain and the wall, not inside the flowerpot."
      },
      {
        "label": "Tenses, typed verb phrase",
        "type": "text",
        "prompt": "Complete the sentence:\n\nWhile the wind ___ (blow) outside, the lantern was swinging gently by the window.\n\nType only the missing verb phrase.",
        "choices": [],
        "answers": [
          "was blowing"
        ],
        "hint": "The action was happening at the same time in the past.",
        "feedback": "Correct. ‘Was blowing’ is past continuous."
      },
      {
        "label": "Spelling, typed answer",
        "type": "text",
        "prompt": "Type the correct spelling of this word:\n\ncareles",
        "choices": [],
        "answers": [
          "careless"
        ],
        "hint": "This word ends with double “s”.",
        "feedback": "Correct. The spelling is ‘careless’."
      },
      {
        "label": "Vocabulary / Meaning, typed short answer",
        "type": "text",
        "prompt": "The note says:\n“Fresh air may enter, but careless words must stay outside.”\n\nWhat does “careless” mean?",
        "choices": [],
        "answers": [
          "not careful",
          "without care",
          "not paying attention",
          "done without care"
        ],
        "hint": "The suffix “-less” often means “without”.",
        "feedback": "Correct. ‘Careless’ means not careful."
      }
    ]
  }
];
export const reading = "The room was cleaned before the guests arrived, but one drawer was left untouched. I have already placed the answer beneath the ink bottle. Whoever finds it must not open the door until every clue has been earned.";
export const finalQuestion = {
  "label": "The final grammar seal",
  "type": "mcq",
  "prompt": "Choose the best sentence:",
  "choices": [
    "The door opened before all puzzles completed.",
    "The door was opened after all the puzzles had been completed.",
    "The door has opened after all puzzles are completing.",
    "The door is opened before all puzzles had complete."
  ],
  "answers": [
    "1"
  ],
  "hint": "The puzzles were completed before the door opened. The sentence also needs passive voice.",
  "feedback": "Correct. This sentence uses passive voice and past perfect correctly."
};
