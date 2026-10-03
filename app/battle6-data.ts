export type PotionQuestion = {
  id: string;
  category: string;
  type: 'MCQ' | 'TYPED';
  prompt: string;
  answer: string;
  options: string[];
  note: string;
  time: number;
};

export const POTION_QUESTIONS: PotionQuestion[] = [
  {
    "id": "M01",
    "category": "CORRECT THE MISTAKE",
    "type": "TYPED",
    "prompt": "Correct the mistake:\n\nNeither of the boys were willing to admit that they had broken the window.",
    "answer": "Neither of the boys was willing to admit that they had broken the window.",
    "options": [],
    "note": "'Neither' is singular here.",
    "time": 50
  },
  {
    "id": "M02",
    "category": "CORRECT THE MISTAKE",
    "type": "TYPED",
    "prompt": "Correct the mistake:\n\nI have finished my homework last night before I went to bed.",
    "answer": "I finished my homework last night before I went to bed.",
    "options": [],
    "note": "Use past simple with a finished time such as 'last night'.",
    "time": 50
  },
  {
    "id": "M03",
    "category": "CORRECT THE MISTAKE",
    "type": "TYPED",
    "prompt": "Correct the mistake:\n\nAlthough the weather was extremely hot, but the players continued the match.",
    "answer": "Although the weather was extremely hot, the players continued the match.",
    "options": [],
    "note": "Do not use 'although' and 'but' together.",
    "time": 50
  },
  {
    "id": "M04",
    "category": "CORRECT THE MISTAKE",
    "type": "TYPED",
    "prompt": "Correct the mistake:\n\nThe teacher advised us to not leave our belongings unattended.",
    "answer": "The teacher advised us not to leave our belongings unattended.",
    "options": [],
    "note": "Use 'advised us not to'.",
    "time": 50
  },
  {
    "id": "M05",
    "category": "CORRECT THE MISTAKE",
    "type": "TYPED",
    "prompt": "Correct the mistake:\n\nEach of the students have to submit the form by Friday.",
    "answer": "Each of the students has to submit the form by Friday.",
    "options": [],
    "note": "'Each' takes a singular verb.",
    "time": 50
  },
  {
    "id": "M06",
    "category": "CORRECT THE MISTAKE",
    "type": "TYPED",
    "prompt": "Correct the mistake:\n\nShe can speaks three languages fluently.",
    "answer": "She can speak three languages fluently.",
    "options": [],
    "note": "A modal is followed by the base verb.",
    "time": 50
  },
  {
    "id": "M07",
    "category": "CORRECT THE MISTAKE",
    "type": "TYPED",
    "prompt": "Correct the mistake:\n\nThere were less people at the event than we expected.",
    "answer": "There were fewer people at the event than we expected.",
    "options": [],
    "note": "Use 'fewer' with countable plural nouns.",
    "time": 50
  },
  {
    "id": "M08",
    "category": "CORRECT THE MISTAKE",
    "type": "TYPED",
    "prompt": "Correct the mistake:\n\nMy brother is interested on learning how to code.",
    "answer": "My brother is interested in learning how to code.",
    "options": [],
    "note": "The fixed phrase is 'interested in'.",
    "time": 50
  },
  {
    "id": "M09",
    "category": "CORRECT THE MISTAKE",
    "type": "TYPED",
    "prompt": "Correct the mistake:\n\nWhen I arrived, they ate dinner in the kitchen.",
    "answer": "When I arrived, they were eating dinner in the kitchen.",
    "options": [],
    "note": "Past continuous suits an action already in progress.",
    "time": 50
  },
  {
    "id": "M10",
    "category": "CORRECT THE MISTAKE",
    "type": "TYPED",
    "prompt": "Correct the mistake:\n\nThe information on these websites are not always reliable.",
    "answer": "The information on these websites is not always reliable.",
    "options": [],
    "note": "'Information' is uncountable and singular.",
    "time": 50
  },
  {
    "id": "M11",
    "category": "CORRECT THE MISTAKE",
    "type": "TYPED",
    "prompt": "Correct the mistake:\n\nShe enjoys to read mystery novels during the school holidays.",
    "answer": "She enjoys reading mystery novels during the school holidays.",
    "options": [],
    "note": "'Enjoy' is followed by -ing.",
    "time": 50
  },
  {
    "id": "M12",
    "category": "CORRECT THE MISTAKE",
    "type": "TYPED",
    "prompt": "Correct the mistake:\n\nHe didn't knew that the meeting had been cancelled.",
    "answer": "He didn't know that the meeting had been cancelled.",
    "options": [],
    "note": "After 'didn't', use the base verb.",
    "time": 50
  },
  {
    "id": "V01",
    "category": "VOCABULARY",
    "type": "MCQ",
    "prompt": "Despite losing the first two matches, the team remained optimistic about reaching the final.\n\nWhat is the meaning of “optimistic” in this sentence?",
    "answer": "Feeling hopeful about the future",
    "options": [
      "Feeling hopeful about the future",
      "Feeling certain that something bad will happen",
      "Feeling confused about what to do",
      "Feeling angry about a result"
    ],
    "note": "",
    "time": 50
  },
  {
    "id": "V02",
    "category": "VOCABULARY",
    "type": "MCQ",
    "prompt": "The manager decided to postpone the outdoor event after the weather department issued a storm warning.\n\nWhat is the meaning of “postpone” in this sentence?",
    "answer": "Arrange for a later time",
    "options": [
      "Arrange for a later time",
      "Cancel permanently",
      "Move to an earlier time",
      "Continue without making changes"
    ],
    "note": "",
    "time": 50
  },
  {
    "id": "V03",
    "category": "VOCABULARY",
    "type": "MCQ",
    "prompt": "Farah was reluctant to lend her new laptop to her brother because he had damaged her tablet before.\n\nWhat is the meaning of “reluctant” in this sentence?",
    "answer": "Unwilling or hesitant",
    "options": [
      "Unwilling or hesitant",
      "Unable to remember",
      "Excited and impatient",
      "Completely surprised"
    ],
    "note": "",
    "time": 50
  },
  {
    "id": "V04",
    "category": "VOCABULARY",
    "type": "MCQ",
    "prompt": "The instructions were vague, so several students were unsure about what they were supposed to submit.\n\nWhat is the meaning of “vague” in this sentence?",
    "answer": "Not clear or specific enough",
    "options": [
      "Not clear or specific enough",
      "Extremely detailed",
      "Difficult to read because of handwriting",
      "Completely incorrect"
    ],
    "note": "",
    "time": 50
  },
  {
    "id": "V05",
    "category": "VOCABULARY",
    "type": "MCQ",
    "prompt": "We chose that website because the information came from reliable sources.\n\nWhat is the meaning of “reliable” in this sentence?",
    "answer": "Able to be trusted",
    "options": [
      "Able to be trusted",
      "Very popular online",
      "Difficult to understand",
      "Recently published"
    ],
    "note": "",
    "time": 50
  },
  {
    "id": "V06",
    "category": "VOCABULARY",
    "type": "MCQ",
    "prompt": "One consequence of leaving food uncovered is that insects may be attracted to it.\n\nWhat is the meaning of “consequence” in this sentence?",
    "answer": "A result of an action",
    "options": [
      "A result of an action",
      "A warning given before an action",
      "A choice between two actions",
      "A reason for avoiding an action"
    ],
    "note": "",
    "time": 50
  },
  {
    "id": "V07",
    "category": "VOCABULARY",
    "type": "MCQ",
    "prompt": "The new system is more efficient because staff can complete the same task in half the time.\n\nWhat is the meaning of “efficient” in this sentence?",
    "answer": "Working well without wasting time",
    "options": [
      "Working well without wasting time",
      "More expensive but more attractive",
      "Difficult to learn at first",
      "Designed for a small group only"
    ],
    "note": "",
    "time": 50
  },
  {
    "id": "V08",
    "category": "VOCABULARY",
    "type": "MCQ",
    "prompt": "Nadia hesitated before pressing 'send' because she was not sure whether her message sounded rude.\n\nWhat is the meaning of “hesitated” in this sentence?",
    "answer": "Paused because she was uncertain",
    "options": [
      "Paused because she was uncertain",
      "Pressed the button immediately",
      "Forgot what she wanted to say",
      "Changed the subject completely"
    ],
    "note": "",
    "time": 50
  },
  {
    "id": "V09",
    "category": "VOCABULARY",
    "type": "MCQ",
    "prompt": "After several weeks without rain, clean water became scarce in the village.\n\nWhat is the meaning of “scarce” in this sentence?",
    "answer": "Difficult to find or obtain",
    "options": [
      "Difficult to find or obtain",
      "Unsafe for people to use",
      "Cheap and easy to replace",
      "Available only at night"
    ],
    "note": "",
    "time": 50
  },
  {
    "id": "V10",
    "category": "VOCABULARY",
    "type": "MCQ",
    "prompt": "The captain acknowledged that the opposing team had played better.\n\nWhat is the meaning of “acknowledge” in this sentence?",
    "answer": "Admitted or recognised something",
    "options": [
      "Admitted or recognised something",
      "Refused to discuss something",
      "Predicted what would happen next",
      "Explained something in greater detail"
    ],
    "note": "",
    "time": 50
  },
  {
    "id": "K01",
    "category": "KBAT",
    "type": "MCQ",
    "prompt": "Hafiz had saved RM80 to buy a new game. On Friday, his class announced a donation drive for a classmate whose home had been damaged by a fire. Hafiz stared at the donation box for a while before putting RM30 inside.\n\nWhy did Hafiz most likely hesitate?",
    "answer": "He wanted to help, but he also had something he had been saving for.",
    "options": [
      "He wanted to help, but he also had something he had been saving for.",
      "He was unsure whether the donation box was genuine.",
      "He did not know how much money his classmates were giving.",
      "He was worried that his teacher would ask him to donate more."
    ],
    "note": "",
    "time": 70
  },
  {
    "id": "K02",
    "category": "KBAT",
    "type": "MCQ",
    "prompt": "A school noticed that students often arrived late after lunch. One teacher suggested shortening lunch break. Another suggested checking why students were late before changing the timetable.\n\nWhich would be the better first step?",
    "answer": "Find out what is causing the delays before deciding on a solution.",
    "options": [
      "Find out what is causing the delays before deciding on a solution.",
      "Shorten lunch break immediately so students have less free time.",
      "Punish every student who arrives late for one week.",
      "Ask teachers to begin lessons five minutes later."
    ],
    "note": "",
    "time": 70
  },
  {
    "id": "K03",
    "category": "KBAT",
    "type": "MCQ",
    "prompt": "Mei received a message saying, “I know you told me not to tell anyone, but I think an adult needs to know about this.” Mei felt angry at first, but later thanked her friend.\n\nWhich explanation best fits Mei's reaction?",
    "answer": "Her friend probably shared something private for a serious reason.",
    "options": [
      "Her friend probably shared something private for a serious reason.",
      "Mei realised that her friend had misunderstood the secret.",
      "Mei was pleased that more people now knew about the situation.",
      "Her friend apologised and promised never to speak about it again."
    ],
    "note": "",
    "time": 70
  },
  {
    "id": "K04",
    "category": "KBAT",
    "type": "MCQ",
    "prompt": "A café introduced a 50-sen discount for customers who brought reusable cups. After one month, the number of disposable cups used fell only slightly.\n\nWhat would be the most useful thing for the café to do next?",
    "answer": "Find out why most customers are still not bringing reusable cups.",
    "options": [
      "Find out why most customers are still not bringing reusable cups.",
      "Stop selling drinks in disposable cups immediately.",
      "Increase the price of every drink by 50 sen.",
      "Remove the discount because it did not solve the problem immediately."
    ],
    "note": "",
    "time": 70
  },
  {
    "id": "K05",
    "category": "KBAT",
    "type": "MCQ",
    "prompt": "Daniel's group had four days to prepare a presentation. Everyone agreed to work separately and combine their work on the final day. They later discovered that two members had researched almost the same information while an important section was missing.\n\nWhat would have prevented this problem most effectively?",
    "answer": "Give each member a clearly different responsibility at the beginning.",
    "options": [
      "Give each member a clearly different responsibility at the beginning.",
      "Ask the strongest student to complete the whole presentation.",
      "Spend less time researching and more time designing the slides.",
      "Combine everyone's work one day earlier without changing the task division."
    ],
    "note": "",
    "time": 70
  },
  {
    "id": "K06",
    "category": "KBAT",
    "type": "MCQ",
    "prompt": "A student sees a social-media post saying, “Drinking this homemade mixture every morning guarantees that you will never catch a cold.” The post has been shared more than 20,000 times but gives no source.\n\nWhat should the student do before believing the claim?",
    "answer": "Check whether reliable health sources support the claim.",
    "options": [
      "Check whether reliable health sources support the claim.",
      "Ask whether friends have already tried the mixture.",
      "Look at how many positive comments the post has received.",
      "Try a small amount first and decide based on the result."
    ],
    "note": "",
    "time": 70
  },
  {
    "id": "K07",
    "category": "KBAT",
    "type": "MCQ",
    "prompt": "A neighbourhood park keeps becoming dirty even though more rubbish bins have been added.\n\nWhich information would be most useful before deciding what to do next?",
    "answer": "The times and places where most litter is being left.",
    "options": [
      "The times and places where most litter is being left.",
      "The colour of the rubbish bins.",
      "How many people live near the park.",
      "Whether another park has more benches."
    ],
    "note": "",
    "time": 70
  },
  {
    "id": "K08",
    "category": "KBAT",
    "type": "MCQ",
    "prompt": "Lina smiled and said, “It's okay, don't worry about it,” after her friends forgot to include her name on a group poster. During the next lesson, she spoke less than usual and chose to work alone.\n\nHow was Lina probably feeling?",
    "answer": "Hurt, even though she tried not to show it.",
    "options": [
      "Hurt, even though she tried not to show it.",
      "Relieved that she no longer had to help the group.",
      "Proud that the poster had been completed.",
      "Confused because she had forgotten the task."
    ],
    "note": "",
    "time": 70
  },
  {
    "id": "K09",
    "category": "KBAT",
    "type": "MCQ",
    "prompt": "A school wants students to exercise more. One proposal is to make every student join a competitive sports team. Another is to offer several choices such as dance, walking, badminton and fitness activities.\n\nWhich plan is more likely to involve a wider range of students?",
    "answer": "Offer several different types of physical activity.",
    "options": [
      "Offer several different types of physical activity.",
      "Require everyone to join a competitive team.",
      "Choose one sport and make it compulsory for each class.",
      "Give extra marks only to students who already play sports."
    ],
    "note": "",
    "time": 70
  },
  {
    "id": "K10",
    "category": "KBAT",
    "type": "MCQ",
    "prompt": "A restaurant receives many complaints about slow service. The manager notices that orders are taken quickly, but completed meals often wait several minutes before being delivered to tables.\n\nWhich change would address the problem most directly?",
    "answer": "Improve the system for getting completed meals to customers.",
    "options": [
      "Improve the system for getting completed meals to customers.",
      "Ask staff to take orders even faster.",
      "Reduce the number of dishes on every plate.",
      "Change the restaurant's opening hours."
    ],
    "note": "",
    "time": 70
  },
  {
    "id": "K11",
    "category": "KBAT",
    "type": "MCQ",
    "prompt": "A teacher notices that students copy answers from an online source but cannot explain them afterwards.\n\nWhich response would best help students learn rather than simply stop them from using the internet?",
    "answer": "Ask them to explain ideas in their own words and show how they reached the answer.",
    "options": [
      "Ask them to explain ideas in their own words and show how they reached the answer.",
      "Ban all internet use for every subject.",
      "Give the same worksheet again with more questions.",
      "Allow copying as long as the final answer is correct."
    ],
    "note": "",
    "time": 70
  },
  {
    "id": "K12",
    "category": "KBAT",
    "type": "MCQ",
    "prompt": "An online seller has hundreds of five-star reviews, but many were posted on the same day using very similar sentences.\n\nWhat should a careful buyer do?",
    "answer": "Look for reviews from different sources and check for more detailed experiences.",
    "options": [
      "Look for reviews from different sources and check for more detailed experiences.",
      "Assume the product is excellent because the average rating is high.",
      "Ignore all reviews and buy the cheapest option.",
      "Trust the reviews because many people used five stars."
    ],
    "note": "",
    "time": 70
  },
  {
    "id": "K13",
    "category": "KBAT",
    "type": "TYPED",
    "prompt": "The school plans to replace all printed notices with announcements on a mobile app. Some students say this will save paper. Others point out that not every student checks the app regularly.\n\nSuggest one way the school could keep the environmental benefit without causing students to miss important information.",
    "answer": "Possible answers: Keep one notice board for important announcements; use more than one communication channel; ask class monitors to remind students.",
    "options": [],
    "note": "",
    "time": 80
  },
  {
    "id": "K14",
    "category": "KBAT",
    "type": "TYPED",
    "prompt": "During a group discussion, one student speaks almost all the time while two quieter students rarely say anything.\n\nWhat could the group do to make the discussion fairer without stopping the confident student from contributing?",
    "answer": "Possible answers: Give each member a turn; set a time limit for each speaker; ask the confident student to invite quieter members to contribute.",
    "options": [],
    "note": "",
    "time": 80
  },
  {
    "id": "K15",
    "category": "KBAT",
    "type": "TYPED",
    "prompt": "A teenager wants to save money but buys a drink from a café almost every day after school.\n\nSuggest one realistic change that could help without requiring the teenager to stop buying drinks completely.",
    "answer": "Possible answers: Buy drinks only on certain days; set a weekly budget; choose a cheaper drink; bring a drink from home on some days.",
    "options": [],
    "note": "",
    "time": 80
  },
  {
    "id": "K16",
    "category": "KBAT",
    "type": "TYPED",
    "prompt": "A class charity sale raised less money than expected. Students later discovered that many parents did not know the sale was happening.\n\nWhat should the class improve before organising the next sale?",
    "answer": "Possible answer: Improve publicity by informing families earlier and using more than one communication method.",
    "options": [],
    "note": "",
    "time": 80
  },
  {
    "id": "K17",
    "category": "KBAT",
    "type": "TYPED",
    "prompt": "A friend sends you a screenshot claiming that school will be closed tomorrow, but there is no message from the school.\n\nWhat would you do before sharing the screenshot with others?",
    "answer": "Possible answer: Check the school's official channel or ask a teacher before sharing it.",
    "options": [],
    "note": "",
    "time": 80
  },
  {
    "id": "K18",
    "category": "KBAT",
    "type": "TYPED",
    "prompt": "A student keeps forgetting to bring homework even though the work is completed at home.\n\nSuggest one practical system that could help solve the problem.",
    "answer": "Possible answers: Pack the school bag the night before; set a reminder; keep homework beside the bag; use a checklist.",
    "options": [],
    "note": "",
    "time": 80
  },
  {
    "id": "K19",
    "category": "KBAT",
    "type": "TYPED",
    "prompt": "Two friends are arguing because both believe they were promised the same role in a school performance.\n\nWhat could they do before asking the teacher to decide for them?",
    "answer": "Possible answer: Calmly explain what each person remembers, check any messages or notes, and try to agree on a solution.",
    "options": [],
    "note": "",
    "time": 80
  },
  {
    "id": "K20",
    "category": "KBAT",
    "type": "TYPED",
    "prompt": "A student studies for several hours but keeps checking messages every few minutes and remembers very little afterwards.\n\nSuggest one change that would probably make the study time more effective.",
    "answer": "Possible answers: Put the phone away; use focus periods with planned breaks; turn off notifications.",
    "options": [],
    "note": "",
    "time": 80
  },
  {
    "id": "P01",
    "category": "PASSIVE VOICE",
    "type": "TYPED",
    "prompt": "Rewrite the sentence in the passive voice:\n\nThe school will announce the competition results tomorrow.",
    "answer": "The competition results will be announced by the school tomorrow.",
    "options": [],
    "note": "",
    "time": 50
  },
  {
    "id": "P02",
    "category": "PASSIVE VOICE",
    "type": "TYPED",
    "prompt": "Rewrite the sentence in the passive voice:\n\nSomeone stole several computers from the office last night.",
    "answer": "Several computers were stolen from the office last night.",
    "options": [],
    "note": "",
    "time": 50
  },
  {
    "id": "P03",
    "category": "PASSIVE VOICE",
    "type": "TYPED",
    "prompt": "Rewrite the sentence in the passive voice:\n\nThe students clean the science laboratory every Friday.",
    "answer": "The science laboratory is cleaned by the students every Friday.",
    "options": [],
    "note": "",
    "time": 50
  },
  {
    "id": "P04",
    "category": "PASSIVE VOICE",
    "type": "TYPED",
    "prompt": "Rewrite the sentence in the passive voice:\n\nThe committee has chosen three finalists for the competition.",
    "answer": "Three finalists have been chosen by the committee for the competition.",
    "options": [],
    "note": "",
    "time": 50
  },
  {
    "id": "P05",
    "category": "PASSIVE VOICE",
    "type": "TYPED",
    "prompt": "Rewrite the sentence in the passive voice:\n\nThe storm damaged several houses near the coast.",
    "answer": "Several houses near the coast were damaged by the storm.",
    "options": [],
    "note": "",
    "time": 50
  },
  {
    "id": "P06",
    "category": "PASSIVE VOICE",
    "type": "TYPED",
    "prompt": "Rewrite the sentence in the passive voice:\n\nThe company is testing a new payment system this week.",
    "answer": "A new payment system is being tested by the company this week.",
    "options": [],
    "note": "",
    "time": 50
  },
  {
    "id": "A01",
    "category": "ACTIVE VOICE",
    "type": "TYPED",
    "prompt": "Rewrite the sentence in the active voice:\n\nThe winning poster was designed by a Form Two student.",
    "answer": "A Form Two student designed the winning poster.",
    "options": [],
    "note": "",
    "time": 50
  },
  {
    "id": "A02",
    "category": "ACTIVE VOICE",
    "type": "TYPED",
    "prompt": "Rewrite the sentence in the active voice:\n\nThe missing wallet was found by one of the cleaners.",
    "answer": "One of the cleaners found the missing wallet.",
    "options": [],
    "note": "",
    "time": 50
  },
  {
    "id": "A03",
    "category": "ACTIVE VOICE",
    "type": "TYPED",
    "prompt": "Rewrite the sentence in the active voice:\n\nThe final decision will be made by the principal tomorrow.",
    "answer": "The principal will make the final decision tomorrow.",
    "options": [],
    "note": "",
    "time": 50
  },
  {
    "id": "A04",
    "category": "ACTIVE VOICE",
    "type": "TYPED",
    "prompt": "Rewrite the sentence in the active voice:\n\nThe classroom windows are cleaned by the workers every week.",
    "answer": "The workers clean the classroom windows every week.",
    "options": [],
    "note": "",
    "time": 50
  },
  {
    "id": "A05",
    "category": "ACTIVE VOICE",
    "type": "TYPED",
    "prompt": "Rewrite the sentence in the active voice:\n\nThe new library has been opened by the mayor.",
    "answer": "The mayor has opened the new library.",
    "options": [],
    "note": "",
    "time": 50
  },
  {
    "id": "A06",
    "category": "ACTIVE VOICE",
    "type": "TYPED",
    "prompt": "Rewrite the sentence in the active voice:\n\nThe road was blocked by fallen trees after the storm.",
    "answer": "Fallen trees blocked the road after the storm.",
    "options": [],
    "note": "",
    "time": 50
  },
  {
    "id": "R01",
    "category": "REFINE THE SENTENCE",
    "type": "TYPED",
    "prompt": "Refine the sentence:\n\nThe restaurant was nice and the food was nice.",
    "answer": "Possible answer: The restaurant had a welcoming atmosphere, and the food was delicious.",
    "options": [],
    "note": "Replace weak repetition with more precise language.",
    "time": 70
  },
  {
    "id": "R02",
    "category": "REFINE THE SENTENCE",
    "type": "TYPED",
    "prompt": "Refine the sentence:\n\nI was very tired because the journey was very long, so I felt very tired when I arrived.",
    "answer": "Possible answer: I was exhausted after the long journey.",
    "options": [],
    "note": "Remove repetition and make the sentence more concise.",
    "time": 70
  },
  {
    "id": "R03",
    "category": "REFINE THE SENTENCE",
    "type": "TYPED",
    "prompt": "Refine the sentence:\n\nGive me the notes because I was absent yesterday.",
    "answer": "Possible answer: Could you please send me the notes from yesterday's lesson? I was absent.",
    "options": [],
    "note": "Make the message polite and appropriate.",
    "time": 70
  },
  {
    "id": "R04",
    "category": "REFINE THE SENTENCE",
    "type": "TYPED",
    "prompt": "Refine the sentence:\n\nThe market was busy.",
    "answer": "Possible answer: The market was crowded with shoppers, lively stallholders and the smell of freshly cooked food.",
    "options": [],
    "note": "Add useful, specific details.",
    "time": 70
  },
  {
    "id": "R05",
    "category": "REFINE THE SENTENCE",
    "type": "TYPED",
    "prompt": "Refine the sentence:\n\nThe school trip was fun because it was fun.",
    "answer": "Possible answer: The school trip was enjoyable because we explored new places and learnt outside the classroom.",
    "options": [],
    "note": "Replace the circular reason with meaningful support.",
    "time": 70
  },
  {
    "id": "R06",
    "category": "REFINE THE SENTENCE",
    "type": "TYPED",
    "prompt": "Refine the sentence:\n\nShe opened the door slowly and slowly walked into the room.",
    "answer": "Possible answer: She opened the door slowly and stepped carefully into the room.",
    "options": [],
    "note": "Avoid unnecessary repetition.",
    "time": 70
  }
];

export const POTION_COORDS: Record<number, readonly [number, number]> = {
  "1": [
    25,
    28
  ],
  "2": [
    32,
    28
  ],
  "3": [
    39,
    28
  ],
  "4": [
    46,
    28
  ],
  "5": [
    53,
    28
  ],
  "6": [
    60,
    28
  ],
  "7": [
    67,
    28
  ],
  "8": [
    74,
    28
  ],
  "9": [
    25,
    40.7
  ],
  "10": [
    32,
    40.7
  ],
  "11": [
    39,
    40.7
  ],
  "12": [
    46,
    40.7
  ],
  "13": [
    53,
    40.7
  ],
  "14": [
    60,
    40.7
  ],
  "15": [
    67,
    40.7
  ],
  "16": [
    74,
    40.7
  ],
  "17": [
    25,
    53.3
  ],
  "18": [
    32,
    53.3
  ],
  "19": [
    39,
    53.3
  ],
  "20": [
    46,
    53.3
  ],
  "21": [
    53,
    53.3
  ],
  "22": [
    60,
    53.3
  ],
  "23": [
    67,
    53.3
  ],
  "24": [
    74,
    53.3
  ],
  "25": [
    25,
    66
  ],
  "26": [
    32,
    66
  ],
  "27": [
    39,
    66
  ],
  "28": [
    46,
    66
  ],
  "29": [
    53,
    66
  ],
  "30": [
    60,
    66
  ],
  "31": [
    67,
    66
  ],
  "32": [
    74,
    66
  ],
  "33": [
    25,
    78.5
  ],
  "34": [
    32,
    78.5
  ],
  "35": [
    39,
    78.5
  ],
  "36": [
    46,
    78.5
  ],
  "37": [
    53,
    78.5
  ],
  "38": [
    60,
    78.5
  ],
  "39": [
    67,
    78.5
  ],
  "40": [
    74,
    78.5
  ]
};
