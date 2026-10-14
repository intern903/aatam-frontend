// Sample content for one fictional client: Meera Krishnan, 38, who runs her own design studio.
// Used as the starting state when localStorage is empty. Content only — no styling.
//
// Field shapes follow the Figma screens:
// - Life areas: CIF life-wheel card (name, one-line description, 1–10 rating) + focus tick
// - Life stories: title + three keyword tags (story card) and Dinesh's three questions, in order
// - Life codes: statement, life area, micro/macro, and the three "New Life Code" questions
// - Outcomes: Doing (done/undone) or Being (scored /10), life area, #1–3 priority, optional goal
// - Values & qualities: strength + the quiz moments they came through (VQ results), plus a 1–10 score

// ---------- Types ----------

export type LifeAreaId =
  | "career"
  | "money"
  | "health"
  | "family"
  | "relationship"
  | "learning"
  | "personal-development"
  | "spirituality"
  | "service"
  | "fun";

export type LifeArea = {
  id: LifeAreaId;
  name: string;
  description: string;
  score: number; // CIF life wheel, 1 = not at all where I want it, 10 = exactly right
  focus: boolean; // one of the 1–3 areas picked to focus on
};

export type OutcomeType = "Doing" | "Being";

export type KeyResult = {
  id: string;
  lifeArea: LifeAreaId;
  type: OutcomeType;
  text: string;
  priority: number;
};

export type CifAnswers = {
  aboutYou: {
    name: string;
    email: string;
    pronouns: string;
    bestWayToReach: string;
    ageRange: string;
  };
  goals: {
    byArea: Partial<Record<LifeAreaId, { picks: string[]; ownWords: string }>>;
    mainGoals: string;
    extraSupport: string[]; // up to 3
  };
  thisSeason: {
    whatsHappening: string;
    inTransition: string;
  };
  workingTogether: {
    coachedBefore: "Yes, formal coaching" | "Yes, informally" | "No, this is my first time";
    hopesForCoaching: string;
  };
  whoYouAre: {
    describedAs: [string, string, string];
    hobbies: string;
    learningStyle: "Visual" | "Kinesthetic" | "Auditory";
  };
  sinceWeLastSpoke: string;
};

export type Story = {
  id: string;
  title: string;
  keywords: string[];
  doing: string; // "Specifically, what were you doing?"
  value: string; // "What value did you take from this? What was in it for you?"
  feeling: string; // "How did that leave you feeling?"
};

export type Cluster = {
  name: string; // becomes a power word
  words: string[];
};

export type PurposeStatus = "empty" | "draft" | "final";

export type Vision = {
  lifeArea: LifeAreaId;
  answers: {
    livedOnPurpose: string; // What would this life area be like if I consistently lived on purpose?
    doOrBe: string; // What might I do or be in this life area to move me toward my dreams?
    energizingValues: string; // What values energize me to realize my dreams?
    lifetime: string; // What could I do, be, or have within my lifetime that would enable me to live on purpose?
  };
  statement: string; // "I ..." — personal, positive, doing + being
  byPowerWord: Record<string, string>; // "Go Deeper": one line per power word; empty if not done
};

export type Strength = "Strong" | "Clear" | "Emerging";

export type Trait = {
  id: string;
  name: string;
  strength: Strength;
  moments: string[]; // quiz moments it came through in
  score: number; // 1–10
};

export type Outcome = {
  id: string;
  lifeArea: LifeAreaId;
  type: OutcomeType;
  text: string;
  priority: number | null; // #1 matters most; null if not in the top three
  goalId: string | null; // mapped key result, or standalone
  done: boolean; // Doing outcomes
  score: number | null; // Being outcomes, out of 10; null until scored
};

export type PastPeriod = {
  id: string;
  label: string;
  start: string; // ISO date
  end: string;
  overall: number; // % of outcomes done
  priority: number; // % of prioritized outcomes done
  wellbeing: number; // average well-being score
  outcomes: Outcome[];
  lifeCodesEmerged: string[]; // life code ids
};

export type PastScores = {
  periodId: string;
  scores: Record<string, number>; // quality name → 1–10
};

export type LifeCodeType = "micro" | "macro";

export type LifeCode = {
  id: string;
  statement: string;
  lifeArea: LifeAreaId;
  type: LifeCodeType;
  answers: {
    seeOrHear: string; // What would we see or hear?
    whenUse: string; // When will you use it?
    makeReal: string; // How will you make it real?
  };
  addedThrough: "My Outcomes" | "My Vision";
  status: "active" | "archived";
};

// ---------- Client ----------

export const sampleUser = {
  name: "Meera Krishnan",
  email: "meera.krishnan@example.com",
};

// ---------- Life areas ----------
// Figma's life wheel counts 12 areas but only names these 10; the other two are still to be decided.

export const lifeAreas: LifeArea[] = [
  { id: "career", name: "Career", description: "Work, vocation, how you spend your working days", score: 7, focus: false },
  { id: "money", name: "Money", description: "Income, savings, and how you feel about your finances", score: 4, focus: true },
  { id: "health", name: "Health", description: "Your body, your energy, your sleep, and how you move", score: 4, focus: true },
  { id: "family", name: "Family", description: "Parents, children, and the people you call home", score: 7, focus: false },
  { id: "relationship", name: "Relationship", description: "Your partner, and the closeness you share", score: 6, focus: false },
  { id: "learning", name: "Learning", description: "New skills, reading, and staying curious", score: 8, focus: false },
  { id: "personal-development", name: "Personal Development", description: "Growing into the person you want to be", score: 6, focus: false },
  { id: "spirituality", name: "Spirituality", description: "Meaning, faith, and feeling part of something larger", score: 5, focus: false },
  { id: "service", name: "Service", description: "Giving back to the people and causes you care about", score: 5, focus: false },
  { id: "fun", name: "Fun", description: "Play, rest, hobbies, and time that is only yours", score: 3, focus: true },
];

// ---------- Goals (Key Results) ----------

export const keyResults: KeyResult[] = [
  { id: "kr-1", lifeArea: "health", type: "Doing", text: "Run a 10K in under 65 minutes by March 2027", priority: 1 },
  { id: "kr-2", lifeArea: "money", type: "Doing", text: "Pay myself a fixed salary for six months in a row", priority: 2 },
  { id: "kr-3", lifeArea: "money", type: "Being", text: "Stay calm, not panicked, when a client pays late", priority: 3 },
  { id: "kr-4", lifeArea: "fun", type: "Doing", text: "Take one full weekend a month with no studio work", priority: 4 },
  { id: "kr-5", lifeArea: "career", type: "Doing", text: "Have two leads who can run a client project end to end by June 2027", priority: 5 },
];

// ---------- CIF ----------

export const cifAnswers: CifAnswers = {
  aboutYou: {
    name: "Meera Krishnan",
    email: "meera.krishnan@example.com",
    pronouns: "She/Her",
    bestWayToReach: "WhatsApp",
    ageRange: "30s",
  },
  goals: {
    byArea: {
      money: {
        picks: ["Get clear on my financial goals", "Feel calmer about money"],
        ownWords:
          "The studio makes decent money, but I pay everyone else first and myself whatever is left. Some months that is nothing. I want a real salary and to stop checking the bank app at midnight.",
      },
      health: {
        picks: ["Move my body most days", "Sleep before midnight"],
        ownWords:
          "I used to run before the studio. Now my back hurts by Thursday and I live on filter coffee until lunch. I want my energy back, not a six-pack.",
      },
      fun: {
        picks: ["Have time that is just mine"],
        ownWords:
          "I honestly can't remember the last time I painted something that wasn't for a client. I want one thing in my week that has no deadline attached to it.",
      },
    },
    mainGoals:
      "To stop being the bottleneck in my own studio, pay myself properly, and get back the version of me who had energy left over at the end of the day for Tara and Arjun.",
    extraSupport: ["Balance", "Self-confidence", "Fun"],
  },
  thisSeason: {
    whatsHappening:
      "We just signed our biggest client yet and I hired two people in one month. It is exciting and it is a lot. My mother also moved in with us in June.",
    inTransition:
      "Yes. I'm moving from being the designer who does everything to someone who leads a team, and I'm not sure I know how to do that yet.",
  },
  workingTogether: {
    coachedBefore: "Yes, informally",
    hopesForCoaching:
      "Someone who will ask me the questions I keep avoiding, and notice when I'm saying yes to everything again.",
  },
  whoYouAre: {
    describedAs: ["Warm", "Stubborn", "Curious"],
    hobbies: "Watercolours, long walks, cooking my grandmother's recipes on Sundays",
    learningStyle: "Visual",
  },
  sinceWeLastSpoke:
    "After our call I said no to a project I would normally have taken just for the money. It felt strange and good. I want more of that.",
};

// ---------- Life Purpose ----------

export const powerWords = ["Curious", "Craft", "Belonging", "Brave"];

export const clusters: Cluster[] = [
  { name: "Curious", words: ["Asks great questions", "Learns from mistakes", "Playful", "Adaptable"] },
  { name: "Craft", words: ["Creative", "Disciplined", "Gets things done", "Thoughtful"] },
  { name: "Belonging", words: ["Makes people feel welcome", "Sees the good in people", "Empathy", "Loyal"] },
  { name: "Brave", words: ["Takes initiative", "Determined", "Stays calm under pressure", "Honest"] },
];

export const lifePurposeStatement =
  "My purpose in life is to stay curious and make things with care, by building rooms where people feel they belong and are brave enough to try, so that the work and everyone in it comes out more alive.";

export const stories: Story[] = [
  {
    id: "story-1",
    title: "Painting the sign for my uncle's shop",
    keywords: ["Creative", "Takes initiative", "Playful"],
    doing:
      "I was fourteen. My uncle's provision store in Mysuru had a faded board, so I asked if I could repaint it. I spent two weekends on a ladder with enamel paint and a brush that was far too big.",
    value:
      "People stopped and looked at something I had made. My uncle told everyone his niece did it. I realised that making something beautiful could change how a whole street felt.",
    feeling: "Proud in a quiet way. Like I had found the thing my hands were for.",
  },
  {
    id: "story-2",
    title: "The first pitch the studio won",
    keywords: ["Brave", "Determined", "Asks great questions"],
    doing:
      "It was just me and Kavya, three months after I quit my job. We pitched a rebrand for a chain of bakeries against two big agencies. Instead of a deck, we spent the whole meeting asking the owner about her mother, who started the first shop.",
    value:
      "That listening was the work. We won because we cared about her story more than our portfolio. It proved to me that the way I like to work actually works.",
    feeling: "Like I could breathe properly for the first time in months. Lighter, and a little bit unstoppable.",
  },
  {
    id: "story-3",
    title: "Teaching Tara to ride a bicycle",
    keywords: ["Sees the good in people", "Stays calm", "Empathy"],
    doing:
      "Tara was six and terrified. We went to the park every evening for a week. On the fifth day I let go of the seat without telling her and she rode all the way to the gate.",
    value:
      "She did it herself. My job was only to stay close and believe she could. I think that is what I want to be for everyone I care about.",
    feeling: "Full. I cried a bit, and she was too busy shouting to notice.",
  },
  {
    id: "story-4",
    title: "The rebrand for the weavers' cooperative",
    keywords: ["Makes people feel welcome", "Thoughtful", "Honest"],
    doing:
      "We worked with forty women weavers from a cooperative near Chanderi. I sat with them for three days while they worked, and we designed the new labels together, using their own words and their own handwriting.",
    value:
      "The work belonged to them, not to me. When they held the finished labels, they recognised themselves. That is the best thing design can do.",
    feeling: "Humbled, and deeply happy. It felt like the reason I started the studio.",
  },
  {
    id: "story-5",
    title: "Walking out of the agency job",
    keywords: ["Brave", "Honest", "Takes initiative"],
    doing:
      "I had been at the same agency for nine years. One Monday I handed in my notice with no clients and four months of savings. I told my creative director exactly why I was leaving, kindly but without softening it.",
    value:
      "I chose myself. I learned that I can survive not knowing what comes next, and that telling the truth does not have to burn bridges.",
    feeling: "Terrified and completely free at the same time. My hands were shaking on the auto ride home, and I was grinning.",
  },
  {
    id: "story-6",
    title: "Ammamma's recipe book",
    keywords: ["Loyal", "Creative", "Disciplined"],
    doing:
      "After my grandmother passed, I collected her handwritten recipes from my mother and three aunts. I spent a year of Sunday mornings cooking each one, photographing it, and designing a book we printed for the whole family.",
    value:
      "It kept her with us. It also brought my aunts back into the same room, arguing about how much tamarind she really used.",
    feeling: "Connected. Like the family had a centre again, and I helped put it there.",
  },
  {
    id: "story-7",
    title: "The intern who found her voice",
    keywords: ["Sees the good in people", "Asks great questions", "Learns from mistakes"],
    doing:
      "Farah barely spoke in her first month. Instead of giving her more instructions, I asked her to present her own idea to a client, and I sat beside her and said nothing unless she looked at me.",
    value:
      "Watching someone discover they are capable is better than any award. I learned that stepping back can be the most generous thing I do.",
    feeling: "Warm, and a little emotional. She runs her own projects now and still sends me her work first.",
  },
  {
    id: "story-8",
    title: "Running my first 10K",
    keywords: ["Determined", "Disciplined", "Adaptable"],
    doing:
      "I trained for four months before the studio existed, running at six in the morning around Cubbon Park. On race day it rained the whole way and I finished in seventy-one minutes.",
    value:
      "I kept a promise to myself when no one was watching. My body was stronger than my excuses.",
    feeling: "Alive. Soaked, sore, and completely clear in my head for the rest of the day.",
  },
];

// ---------- Visions (one per life area) ----------

export const visions: Vision[] = [
  {
    lifeArea: "career",
    answers: {
      livedOnPurpose:
        "The studio runs on trust, not on me checking every file. People do their bravest work here and stay for years because they keep growing.",
      doOrBe:
        "Spend my mornings on the work only I can do, and my afternoons coaching the team. Be the person who asks the question, not the one who always has the answer.",
      energizingValues: "Craft, guiding others' growth, and honesty.",
      lifetime:
        "Build a studio that would carry on beautifully without me, and teach design to young women from small towns who never thought it was a career.",
    },
    statement:
      "I lead a studio where people feel safe enough to try something new, and I make work I am proud to put my name on.",
    byPowerWord: {
      Curious: "I begin every project by asking questions, and I let the answers surprise me.",
      Craft: "I care about the last ten percent, and I give my team the time to care about it too.",
      Belonging: "Every person in the studio knows their ideas are wanted, including the newest intern.",
      Brave: "I say no to work that doesn't fit us, and I say yes to the projects that scare me a little.",
    },
  },
  {
    lifeArea: "health",
    answers: {
      livedOnPurpose:
        "I have energy at the end of the day, not just at the start. My body feels like a friend again, not something I apologise to on Thursdays.",
      doOrBe: "Run three mornings a week, sleep before midnight, and eat lunch away from my desk.",
      energizingValues: "Discipline, and the freedom that comes from feeling strong.",
      lifetime: "Still be running at sixty, and walk the Kumara Parvatha trail with Tara when she is grown.",
    },
    statement:
      "I run in the mornings three times a week, not because I have to but because I know who I am when I do.",
    byPowerWord: {
      Curious: "I try new routes and notice how my body feels instead of only checking my pace.",
      Craft: "I treat rest and sleep as part of the work, as carefully as I would a client brief.",
      Belonging: "I run with friends on Sundays, and it is the best conversation of my week.",
      Brave: "I sign up for the race before I feel ready, and then I show up for it.",
    },
  },
  {
    lifeArea: "family",
    answers: {
      livedOnPurpose:
        "When I'm home I'm actually home. Tara tells me about her day because she knows I'm listening, and Amma feels like part of the house, not a guest in it.",
      doOrBe: "Close the laptop at seven. Cook together on Sundays. Be patient, especially when I'm tired.",
      energizingValues: "Family, loyalty, and warmth.",
      lifetime: "Raise a daughter who knows she is loved exactly as she is, and who is brave enough to choose her own path.",
    },
    statement: "I am fully present with my family, and our home is a place where everyone feels they belong.",
    byPowerWord: {},
  },
  {
    lifeArea: "relationship",
    answers: {
      livedOnPurpose:
        "Arjun and I are still curious about each other. We talk about more than logistics and school fees.",
      doOrBe: "One evening a week that is just ours. Tell him what I need instead of expecting him to guess.",
      energizingValues: "Honesty, and the playfulness we had when we met.",
      lifetime: "Grow old with my best friend and still make each other laugh.",
    },
    statement: "I make time for Arjun every week, and I tell him the truth even when it is uncomfortable.",
    byPowerWord: {},
  },
  {
    lifeArea: "personal-development",
    answers: {
      livedOnPurpose:
        "I trust myself as a leader. I can sit with not knowing, and I don't need to be the best designer in the room to feel worthy.",
      doOrBe: "Pause before I say yes. Ask for help early. Write in my journal three times a week.",
      energizingValues: "Courage, curiosity, and learning from my mistakes.",
      lifetime: "Become someone who makes other people braver just by being around them.",
    },
    statement: "I lead with curiosity instead of control, and I learn something about myself every week.",
    byPowerWord: {},
  },
];

// ---------- Values & Qualities ----------

export const values: Trait[] = [
  { id: "v-craft", name: "Craft", strength: "Strong", moments: ["The squeeze", "After the busy stretch"], score: 9 },
  { id: "v-growth", name: "Guiding Others' Growth", strength: "Strong", moments: ["The group needs someone", "The new hire's question"], score: 9 },
  { id: "v-family", name: "Family", strength: "Strong", moments: ["The 80th birthday", "The open Saturday"], score: 8 },
  { id: "v-honesty", name: "Honesty", strength: "Strong", moments: ["The coworker's slip", "The promise and the better offer"], score: 8 },
  { id: "v-curiosity", name: "Curiosity", strength: "Clear", moments: ["The open Saturday", "The client who wants it cheaper"], score: 7 },
  { id: "v-independence", name: "Independence", strength: "Clear", moments: ["The promise and the better offer"], score: 7 },
  { id: "v-beauty", name: "Beauty", strength: "Clear", moments: ["The friend's first exhibition"], score: 6 },
  { id: "v-generosity", name: "Generosity", strength: "Emerging", moments: ["The good moment"], score: 5 },
  { id: "v-fairness", name: "Fairness", strength: "Emerging", moments: ["The coworker's slip"], score: 5 },
  { id: "v-learning", name: "Learning", strength: "Emerging", moments: ["After the busy stretch"], score: 4 },
];

export const qualities: Trait[] = [
  { id: "q-calm", name: "Calm", strength: "Clear", moments: ["The oven dies", "After the busy stretch"], score: 7 },
  { id: "q-courageous", name: "Courageous", strength: "Strong", moments: ["The promise and the better offer", "The group needs someone"], score: 8 },
  { id: "q-grounded", name: "Grounded", strength: "Clear", moments: ["The 80th birthday"], score: 6 },
  { id: "q-confident", name: "Confident", strength: "Emerging", moments: ["The client who wants it cheaper"], score: 5 },
  { id: "q-self-aware", name: "Self-aware", strength: "Strong", moments: ["The coworker's slip", "The squeeze"], score: 8 },
  { id: "q-resilient", name: "Emotionally Resilient", strength: "Clear", moments: ["The oven dies"], score: 7 },
  { id: "q-purposeful", name: "Purposeful", strength: "Clear", moments: ["The open Saturday"], score: 7 },
  { id: "q-positive", name: "Positive", strength: "Emerging", moments: ["The good moment"], score: 6 },
  { id: "q-flexible", name: "Flexible", strength: "Emerging", moments: ["The late night fix"], score: 5 },
  { id: "q-centered", name: "Centered", strength: "Emerging", moments: ["After the busy stretch"], score: 4 },
];

export const finalValueIds = ["v-craft", "v-growth", "v-family"];
export const finalQualityIds = ["q-calm", "q-courageous", "q-grounded", "q-confident"];

// ---------- Life Codes ----------

export const lifeCodes: LifeCode[] = [
  {
    id: "lc-1",
    statement: "Run before I open my inbox",
    lifeArea: "health",
    type: "micro",
    answers: {
      seeOrHear: "Me out of the door by six, shoes on, phone left charging in the kitchen.",
      whenUse: "Monday, Wednesday and Friday mornings.",
      makeReal: "Running clothes laid out on the chair the night before, and the inbox app moved off my home screen.",
    },
    addedThrough: "My Outcomes",
    status: "active",
  },
  {
    id: "lc-2",
    statement: "Close the laptop at seven and be home when I'm home",
    lifeArea: "family",
    type: "macro",
    answers: {
      seeOrHear: "The laptop shut on the dining table, and me asking Tara about her day instead of saying 'one minute'.",
      whenUse: "Every weekday evening.",
      makeReal: "A seven o'clock alarm called 'Go home', and the team knows I reply to messages the next morning.",
    },
    addedThrough: "My Vision",
    status: "active",
  },
  {
    id: "lc-3",
    statement: "Ask one question before I give an answer",
    lifeArea: "career",
    type: "micro",
    answers: {
      seeOrHear: "Me saying 'What do you think it needs?' before I touch someone's design.",
      whenUse: "In every design review and whenever someone brings me a problem.",
      makeReal: "A sticky note on my monitor that just says 'Ask first'.",
    },
    addedThrough: "My Outcomes",
    status: "active",
  },
  {
    id: "lc-4",
    statement: "Pay myself first, on the first of every month",
    lifeArea: "money",
    type: "macro",
    answers: {
      seeOrHear: "A transfer to my own account before any other payment leaves the studio.",
      whenUse: "On the first of every month, no matter how the month looks.",
      makeReal: "A standing instruction with the bank, so it happens even when I hesitate.",
    },
    addedThrough: "My Vision",
    status: "active",
  },
  {
    id: "lc-5",
    statement: "Say the hard thing kindly, and say it early",
    lifeArea: "career",
    type: "macro",
    answers: {
      seeOrHear: "A short, honest conversation on Monday instead of a long, tired one on Friday.",
      whenUse: "As soon as I notice I'm avoiding a conversation with a client or someone on the team.",
      makeReal: "If I've thought about it twice, I put it on my calendar for the next day.",
    },
    addedThrough: "My Outcomes",
    status: "active",
  },
  {
    id: "lc-6",
    statement: "Put the phone in the drawer when Tara is talking",
    lifeArea: "family",
    type: "micro",
    answers: {
      seeOrHear: "My phone face down in the hall drawer and me sitting on her bed.",
      whenUse: "At bedtime, and whenever she starts with 'Amma, guess what'.",
      makeReal: "The drawer is right by her door, so it is easier to use than to forget.",
    },
    addedThrough: "My Outcomes",
    status: "active",
  },
  {
    id: "lc-7",
    statement: "One afternoon a month that has no purpose at all",
    lifeArea: "fun",
    type: "macro",
    answers: {
      seeOrHear: "Me with my watercolours at the lake, or wandering Blossom Book House with nowhere to be.",
      whenUse: "The last Saturday afternoon of every month.",
      makeReal: "Blocked on the family calendar so nobody books over it, including me.",
    },
    addedThrough: "My Vision",
    status: "active",
  },
  {
    id: "lc-8",
    statement: "Pause for one breath before I say yes",
    lifeArea: "personal-development",
    type: "micro",
    answers: {
      seeOrHear: "A small silence, then 'Let me check and come back to you by tomorrow.'",
      whenUse: "Every time someone asks me to take something on.",
      makeReal: "I keep that exact sentence saved in my notes so it is ready when I need it.",
    },
    addedThrough: "My Outcomes",
    status: "archived",
  },
];

// ---------- Outcomes ----------

export const currentOutcomes: Outcome[] = [
  { id: "o-1", lifeArea: "health", type: "Doing", text: "Run three mornings a week before opening my inbox", priority: 1, goalId: "kr-1", done: true, score: null },
  { id: "o-2", lifeArea: "money", type: "Doing", text: "Move my salary into my own account on the first", priority: 2, goalId: "kr-2", done: true, score: null },
  { id: "o-3", lifeArea: "career", type: "Doing", text: "Hand the bakery review to Kavya and stay out of it", priority: 3, goalId: "kr-5", done: false, score: null },
  { id: "o-4", lifeArea: "family", type: "Being", text: "Be fully present at dinner, phone in the drawer", priority: null, goalId: null, done: false, score: 7 },
  { id: "o-5", lifeArea: "fun", type: "Being", text: "Feel unhurried on my Sunday sketch walk", priority: null, goalId: "kr-4", done: false, score: null },
  { id: "o-6", lifeArea: "fun", type: "Doing", text: "Fill four pages of my sketchbook", priority: null, goalId: null, done: false, score: null },
];

export const pastPeriods: PastPeriod[] = [
  {
    id: "p-6",
    label: "Period 6",
    start: "2026-09-21",
    end: "2026-10-06",
    overall: 67,
    priority: 100,
    wellbeing: 6.8,
    outcomes: [
      { id: "p6-o1", lifeArea: "money", type: "Doing", text: "Set up the standing instruction for my salary", priority: 1, goalId: "kr-2", done: true, score: null },
      { id: "p6-o2", lifeArea: "career", type: "Doing", text: "Write job descriptions for two team leads", priority: 2, goalId: "kr-5", done: true, score: null },
      { id: "p6-o3", lifeArea: "health", type: "Doing", text: "Be in bed before midnight five nights a week", priority: null, goalId: null, done: false, score: null },
    ],
    lifeCodesEmerged: ["lc-4", "lc-5"],
  },
  {
    id: "p-5",
    label: "Period 5",
    start: "2026-08-24",
    end: "2026-09-20",
    overall: 67,
    priority: 67,
    wellbeing: 8.0,
    outcomes: [
      { id: "p5-o1", lifeArea: "health", type: "Doing", text: "Run twice a week, even if it is only twenty minutes", priority: 1, goalId: "kr-1", done: true, score: null },
      { id: "p5-o2", lifeArea: "family", type: "Being", text: "Be patient with Amma when she rearranges my kitchen", priority: 2, goalId: null, done: false, score: 6 },
      { id: "p5-o3", lifeArea: "career", type: "Doing", text: "Ask the team for their ideas before sharing mine", priority: 3, goalId: null, done: true, score: null },
    ],
    lifeCodesEmerged: ["lc-1", "lc-3", "lc-6"],
  },
  {
    id: "p-4",
    label: "Period 4",
    start: "2026-08-01",
    end: "2026-08-23",
    overall: 50,
    priority: 50,
    wellbeing: 5.5,
    outcomes: [
      { id: "p4-o1", lifeArea: "family", type: "Doing", text: "Close the laptop at seven on weekdays", priority: 1, goalId: null, done: false, score: null },
      { id: "p4-o2", lifeArea: "fun", type: "Doing", text: "Spend one Saturday afternoon painting", priority: 2, goalId: "kr-4", done: true, score: null },
    ],
    lifeCodesEmerged: ["lc-2", "lc-7"],
  },
];

// ---------- Well-being ----------
// Scored each period on the final qualities, 1–10. null = not scored yet.

export const wellbeingScores: Record<string, number | null> = {
  Calm: 6,
  Courageous: 7,
  Grounded: 5,
  Confident: null,
};

export const pastWellbeingScores: PastScores[] = [
  { periodId: "p-6", scores: { Calm: 6, Courageous: 8, Grounded: 6, Confident: 7 } },
  { periodId: "p-5", scores: { Calm: 8, Courageous: 9, Grounded: 8, Confident: 7 } },
  { periodId: "p-4", scores: { Calm: 5, Courageous: 6, Grounded: 5, Confident: 6 } },
];
