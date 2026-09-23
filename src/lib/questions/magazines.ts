import type { ReadingMagazine } from '@/types/reading'

// ─────────────────────────────────────────────────────────────────────────────
// Reading magazines — the colour booklet a student reads before answering the
// Reading paper, in the shape of the real NAPLAN Reading Magazine: one text per
// page, a mix of text types (story, report, explanation, persuasive, verse,
// procedure, notice), and a picture or diagram on most pages.
//
// Every text here is original. Structure, length and spread of text types
// follow the published NAPLAN papers (Years 3, 5, 7 and 9, 2012-2016): Year 3
// and 5 magazines run 6-7 texts over 8 pages with 38 questions, Years 7 and 9
// run 8 texts over 12 pages with 50. Length scales with the year level, from
// about 90 words at Year 3 to 480 at Year 9.
//
// Magazine 1 at each year level is the free sample; later sets are paid.
// Questions live in bank.ts and point at a text through `stimulus_id`.
// ─────────────────────────────────────────────────────────────────────────────

export const MAGAZINES: ReadingMagazine[] = [
  {
    id: 'reading-grade_3-1',
    yearLevel: 'grade_3',
    set: 1,
    texts: [
      {
        id: 'e7398d81-aed9-4d75-85ee-f3229bd264ee',
        page: 2,
        title: 'The sandwich thief',
        type: 'story',
        blocks: [
          { kind: 'para', text: 'Every lunchtime, Ravi put his lunchbox on the low wall near the bike racks. Every lunchtime, one half of his sandwich disappeared.' },
          { kind: 'para', text: '“Someone is taking my lunch,” Ravi told his friend Amina. “It is always the half with the cheese.”' },
          { kind: 'para', text: 'Amina looked at the wall. She looked at the tree above the wall. Then she smiled.' },
          { kind: 'para', text: '“Tomorrow,” she said, “we will watch from the library window.”' },
          { kind: 'para', text: 'The next day the two friends knelt at the window and waited. Ravi’s lunchbox sat on the wall in the sun. Nothing happened for a long time.' },
          { kind: 'para', text: 'Then a grey bird with a black head landed on the wall. It tipped its head to one side, hopped twice, and lifted the lid with its beak.' },
          { kind: 'para', text: '“A currawong!” whispered Ravi.' },
          { kind: 'para', text: 'The bird took the cheese half in its beak and flew up into the tree. Ravi laughed so loudly that the librarian looked up.' },
          { kind: 'para', text: 'After that, Ravi kept his lunchbox in his bag. He still left one small crust on the wall, because the currawong had made him laugh, and that was worth a crust.' },
        ],
      },
      {
        id: '69ea2036-e7ed-4a68-9e0c-f01afce52cf2',
        page: 3,
        title: 'Wombats',
        type: 'report',
        columns: 2,
        blocks: [
          { kind: 'para', text: 'Wombats are short, strong animals that live in Australia. A wombat is about as long as a school ruler and two hand spans wide. It has thick grey or brown fur.' },
          { kind: 'para', text: 'Wombats dig burrows under the ground with their strong front legs and flat claws. A burrow can be longer than a classroom. Inside the burrow it stays cool in summer and warm in winter.' },
          { kind: 'para', text: 'A wombat is a marsupial, so a wombat mother carries her baby in a pouch. Her pouch faces backwards. This means the pouch does not fill with soil while she digs.' },
          { kind: 'para', text: 'Wombats eat grass, roots and bark. They come out to feed at night when the air is cool. During the hot part of the day they sleep in the burrow.' },
          { kind: 'factbox', title: 'Wombat facts', items: ['A baby wombat is called a joey.', 'Wombat droppings are shaped like little cubes.', 'A wombat can run as fast as a person for a short way.'] },
        ],
      },
      {
        id: 'f1c56d83-40b7-49cc-9f8d-f7ba4b48df01',
        page: 4,
        title: 'Where does rain come from?',
        type: 'explanation',
        blocks: [
          { kind: 'para', text: 'Rain has been falling on Earth for a very long time. The same water goes around and around. This is called the water cycle.' },
          { kind: 'para', text: 'The sun warms the sea. Some of the water turns into a gas called water vapour and rises into the sky. You cannot see water vapour.' },
          { kind: 'para', text: 'High in the sky the air is cold. The water vapour cools and turns back into tiny drops. Millions of these drops together make a cloud.' },
          { kind: 'para', text: 'The drops bump into each other and join up. When a drop is too heavy to float, it falls as rain. The rain runs into creeks and rivers, and the rivers carry it back to the sea. Then the cycle starts again.' },
        ],
        figure: {
          kind: 'flow',
          cycle: true,
          steps: [
            { text: 'Sea', then: 'water rises' },
            { text: 'Cloud', then: 'drops join' },
            { text: 'Rain', then: 'rivers carry it back to the sea' },
          ],
        },
        figureCaption: 'The water cycle',
      },
      {
        id: '82c87b63-2028-405a-8484-80ecf332f671',
        page: 5,
        title: 'A garden for our school',
        type: 'letter',
        blocks: [
          { kind: 'note', text: 'Dear Mrs Patel' },
          { kind: 'para', text: 'I am writing because I think our school should grow a vegetable garden in the empty corner near the hall.' },
          { kind: 'para', text: 'At the moment that corner has nothing in it but weeds and one old bench. Nobody plays there. A garden would make it the nicest part of the school.' },
          { kind: 'para', text: 'A garden would also help us learn. In Year 3 we are learning about living things. It is easier to understand how a plant grows when you water it yourself and watch it every week.' },
          { kind: 'para', text: 'My grandfather says that beans and carrots are easy to grow, and that a garden costs very little to start. Our class could look after it at lunchtime. When the vegetables are ready, the canteen could use them in the salads.' },
          { kind: 'para', text: 'Please think about my idea. I would be very happy to show you the corner and where the beds could go.' },
          { kind: 'note', text: 'From Sophie Nguyen, Year 3B' },
        ],
      },
      {
        id: 'e588b40c-a1e6-436f-be14-14e40251fc4b',
        page: 6,
        title: 'Tiny visitor',
        type: 'poem',
        blocks: [
          { kind: 'verse', lines: [
            'A green tree frog is on the glass,',
            'flat feet spread like sticky stars.',
            'He watches every moth that comes',
            'to dance around our kitchen lamp.',
            '',
            'He does not hurry. Frogs can wait.',
            'He sits so still he looks asleep,',
            'then — quick as blinking — out it goes,',
            'that long pink ribbon of a tongue.',
            '',
            'By morning he has slipped away',
            'to somewhere cool and dark and damp,',
            'but on the window, small and round,',
            'he leaves five footprints and a smudge.',
          ] },
        ],
      },
      {
        id: '4abb2bb3-7679-48b9-aac2-160e1b6c1310',
        page: 7,
        title: 'Make a paper boat',
        type: 'procedure',
        blocks: [
          { kind: 'para', text: 'You will need one sheet of paper. Thin paper folds best. Do each fold carefully and press it flat.' },
          { kind: 'steps', items: [
            'Fold the paper in half so the short edges meet. Press the fold flat.',
            'Fold the two top corners down to the middle so they make a point.',
            'Fold the strip at the bottom up on each side to make a hat shape.',
            'Open the hat and push the two side points together to make a square.',
            'Fold the bottom corners of the square up to the top point.',
            'Hold the middle of the square and pull the two top points apart until a boat appears.',
          ] },
          { kind: 'factbox', title: 'Before you sail', items: ['Rub a candle over the paper to help the boat last longer in water.', 'Test the boat in a sink or a bucket, never in a creek or a pool on your own.'] },
        ],
      },
      {
        id: '4096bfb7-d979-4517-b9cf-2afadc3d7b53',
        page: 8,
        title: 'Junior Fun Run',
        type: 'persuasive',
        blocks: [
          { kind: 'quote', text: 'Run, jog or walk — every finisher gets a medal!' },
          { kind: 'para', text: 'The Riverside Junior Fun Run is on Sunday 14 June at Riverside Park. Money raised will buy new sports equipment for local primary schools.' },
          { kind: 'bullets', items: ['Bring a water bottle and wear a hat.', 'Every runner needs a grown-up with them at the park.', 'Entry is $5. Pay at the tent near the gate.'] },
          { kind: 'para', text: 'Come early to collect your number. Runners who arrive after their start time can still run, but they will not be timed.' },
        ],
        figure: {
          kind: 'data_table',
          title: 'Start times',
          columns: ['Race', 'Age', 'Starts'],
          rows: [['Dash', '5 to 7 years', '9:00 am'], ['1 km', '8 to 10 years', '9:30 am'], ['2 km', '11 to 13 years', '10:15 am']],
        },
      },
    ],
  },
]

/** Every magazine text, by id — the lookup the exam builder and the PDF use. */
export const READING_TEXTS = new Map(MAGAZINES.flatMap(m => m.texts.map(t => [t.id, { ...t, magazine: m }] as const)))
