import type { Stimulus } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Shared reading passages / data stimuli — a Question can reference one via
// stimulus_id so multiple questions are asked about the same text/data.
// Mirrored into Supabase via supabase/seed.sql, same as bank.ts. Regenerate
// seed.sql after editing with: node scripts/gen-seed.mjs
//
// Two texts per NAPLAN year level (3, 5, 7, 9), one narrative and one
// informative/persuasive, matching how a real NAPLAN Reading magazine works:
// students read a whole text, then answer a cluster of questions about it.
// Length and demand scale with the year level — roughly 130 words at Year 3 up
// to 380 at Year 9, mirroring the real papers.
// ─────────────────────────────────────────────────────────────────────────────

export const STIMULI: Stimulus[] = [
  {
    id: '83f6a75a-738a-42d4-b602-b350be61e51a',
    type: 'passage',
    title: 'The Lost Kite',
    subject: 'english',
    year_level: 'grade_3',
    word_count: 132,
    body: `Nina held tight to the string as her red kite climbed higher and higher. The wind was strong that afternoon, and the kite pulled like a puppy on a lead.

"Hold on with both hands," called her grandfather from the picnic rug.

Nina tried. But a sudden gust yanked the string, and it slipped right out of her fingers. The red kite spun away over the trees and disappeared.

Nina's eyes filled with tears. Her grandfather walked over and sat beside her on the grass.

"I have an idea," he said. He opened his old canvas bag and pulled out newspaper, thin sticks and a ball of twine. "My father taught me this when I was your age."

By the time the sun went down, a new kite was flying above the park. It was not red. It was better, because Nina had made it herself.`,
  },
  {
    id: '8d72e630-1cc0-45e1-8952-55aec6d600a2',
    type: 'passage',
    title: 'Wombats',
    subject: 'english',
    year_level: 'grade_3',
    word_count: 128,
    body: `Wombats are short, strong Australian animals with thick fur and stubby legs. An adult wombat is about one metre long and can weigh as much as a large dog.

Wombats are champion diggers. They use their wide front paws and sharp claws to dig long tunnels called burrows. A burrow can stretch more than twenty metres underground and may have several rooms.

Wombats sleep in their burrows during the hot day and come out at night to eat grass and roots. Because they eat tough plants, their front teeth never stop growing.

A wombat has a special surprise: its pouch faces backwards. This stops dirt from filling the pouch while the mother is digging, keeping her baby clean and safe.`,
  },
  {
    id: '47547684-b3a1-4d68-9e8d-1a3bec5f5be0',
    type: 'passage',
    title: 'The Bottle on the Beach',
    subject: 'english',
    year_level: 'grade_5',
    word_count: 208,
    body: `The tide had gone out further than Sam had ever seen it. Where the water usually churned, there was now a wide plain of ridged, wet sand that shone like hammered metal.

He walked out across it, his footprints filling slowly with seawater behind him. Near a clump of dark weed, something caught the light — a glass bottle, thick and green, wedged upright in the sand as though someone had planted it there.

Inside was a roll of paper.

Sam's hands shook as he worked the cork free. The paper was damp at the edges but the writing was still clear, in careful, old-fashioned letters:

"If you find this, the lighthouse keeper's daughter says hello. I am ten years old and I have never left this island. Please write back and tell me what the mainland is like."

There was no date. Sam turned the paper over twice, looking for one, and found nothing.

He looked up at the old lighthouse on the headland. It had been closed for as long as he could remember, its windows boarded, its light dark. Nobody had lived there in fifty years.

Sam rolled the paper carefully and put it back in the bottle. Then he started running home to find a pen.`,
  },
  {
    id: '7eb9aeee-2e47-4285-a9ed-de5800243e59',
    type: 'passage',
    title: 'Why We Should Keep the School Garden',
    subject: 'english',
    year_level: 'grade_5',
    word_count: 214,
    body: `Some people have suggested that our school garden should be paved over to make more space for parking. This would be a mistake, and here is why.

First, the garden is where we do our best learning. In the past year, Year 5 students have measured plant growth for maths, written descriptions of insects for English, and tested soil for science. No classroom can teach those lessons the same way.

Second, the garden feeds people. Last term alone, students harvested more than forty kilograms of vegetables. Most of it went to the school canteen, and the rest was given to a local food charity. A car park feeds nobody.

Third, the garden helps the environment. Its trees provide shade that keeps the nearby classrooms cooler in summer, which lowers the amount of electricity the school uses for fans and air conditioning. Paving the area would do the opposite, because hard surfaces trap heat.

It is true that parking is difficult in our street. But there are other solutions. The school could stagger pick-up times, or encourage families who live nearby to walk.

A car park would serve a few adults for a few minutes each day. The garden serves every student, all year round. We should keep it.`,
  },
  {
    id: 'd1c85317-7ace-45ef-a5b5-fc534d92fdde',
    type: 'passage',
    title: 'The Clockmaker’s Apprentice',
    subject: 'english',
    year_level: 'year_7',
    word_count: 302,
    body: `Mr Halvorsen's workshop smelled of oil and brass, and it ticked. Not with one sound but with hundreds, layered over each other so that the whole room seemed to breathe.

Priya had been his apprentice for three weeks and had not yet been allowed to touch a clock.

"Sweep," he would say, without looking up. "Sort those springs. Watch."

So she swept, and sorted, and watched. She watched the way his hands slowed as they neared the delicate parts, the way he would pause with the tweezers hovering, breathing out, before he committed to a movement.

On the twenty-second day he pushed a small carriage clock across the bench towards her.

"It loses four minutes a day," he said. "Tell me why."

Priya's throat went dry. She opened the case and looked at the movement, the tiny brass city of it. She thought of everything she had watched him do. Then she took the tweezers and did not move them.

"I don't know yet," she said.

Mr Halvorsen finally looked up. For the first time since she had arrived, he smiled.

"Good," he said. "That is the correct answer. The apprentices who fail are the ones who reach for the tweezers before they have finished looking. A clock will tell you what is wrong with it, but only if you are patient enough to let it."

He pulled a stool over and sat beside her.

"Now," he said. "Look again, and this time tell me what you see rather than what you think is wrong. Start with the balance wheel. Watch it for a full minute before you say anything at all."

Priya leaned in. The workshop ticked around her, and she began, at last, to listen.`,
  },
  {
    id: '581f83ae-c528-4dcd-a46f-4fccd33d93a0',
    type: 'passage',
    title: 'The Problem with Food Labels',
    subject: 'english',
    year_level: 'year_7',
    word_count: 296,
    body: `Walk down any supermarket aisle and you will see packaging covered in reassuring words: natural, wholesome, farm fresh, lightly sweetened. Most of these phrases sound meaningful. Very few of them are.

Unlike terms such as "organic", which is legally defined and independently certified, words like "natural" and "wholesome" are largely unregulated. A manufacturer can print them on almost anything. A breakfast cereal that is more than a quarter sugar by weight may still, quite legally, describe itself as natural, because sugar comes from a plant.

The front of a package is advertising. The back is information. The difference matters, because studies of shopper behaviour consistently find that most people never turn the package over. One Australian survey found that fewer than one shopper in three regularly reads the nutrition panel, and fewer still compare that panel between competing products.

This is not simply a matter of shoppers being careless. Nutrition panels are printed in small type, use units that are hard to compare, and often express quantities "per serving" — with the manufacturer deciding what counts as a serving. Two similar products can appear very different simply because one has quietly chosen a smaller serving size.

Some countries have responded with simplified front-of-pack labelling: a single score, or a colour, summarising how healthy a product is. Where these systems have been introduced, shoppers make measurably better choices, and manufacturers quietly reformulate products to earn a better rating.

The lesson is not that shoppers should try harder. It is that the information should be easier to use. When a label is designed to inform rather than to persuade, people use it — and when it is designed to persuade, we should not be surprised that it succeeds.`,
  },
  {
    id: '5ad09342-e508-4405-a461-878142aed23d',
    type: 'passage',
    title: 'The Cartographer',
    subject: 'english',
    year_level: 'year_9',
    word_count: 378,
    body: `My grandmother drew maps of places she had never been.

She made them on the backs of envelopes and on the cardboard that came inside new shirts, in a fine architectural hand that never wavered. A coastline. A river delta. A mountain range with its passes carefully marked. In the margins she wrote distances in a unit I never identified, and small notes: "good water here", "shelter from the western wind", "do not cross after rain".

For a long time I assumed she was copying them from somewhere. When I was eleven I went looking through her bookshelf for the atlas she must have been using, and did not find one. When I asked her about it she was peeling potatoes and did not stop.

"Why would I copy a map of somewhere that already has one?" she said.

It was years before I understood that this was an answer.

She had left her own country at nineteen, in circumstances she described exactly once, briefly, and never again. What she had carried out with her was a landscape she could no longer visit and could not stop seeing. The maps were not fantasies, and they were not memories either — or not only memories. They were the place as it would have to be for her to find her way back through it.

I have one of them framed now. It shows a valley narrowing towards a pass, with a settlement at the lower end drawn in the same precise hand as everything else, and beneath it the note: "my mother's house, one day's walk".

There was no such valley. I have checked, with the resources she never had — satellite imagery, gazetteers, the whole flattened and searchable world. The rivers do not run that way anywhere near where she was born.

And yet the map is not wrong. It is drawn to a scale, and the scale is consistent. Every distance on it relates correctly to every other. If the valley existed, you could walk it with this map in your hand and you would not get lost.

She was not recording a country. She was insisting, quietly and for sixty years, on the shape of one.`,
  },
  {
    id: '31e5d267-20a7-49db-86b1-8faa7f6e5a6c',
    type: 'passage',
    title: 'The Case Against the Smartphone Ban',
    subject: 'english',
    year_level: 'year_9',
    word_count: 372,
    body: `Schools across the country have banned smartphones, and the early results look encouraging. Playgrounds are noisier. Teachers report fewer disruptions. Several studies have found modest improvements in test scores, concentrated among lower-achieving students.

It would be easy to conclude that the question is settled. It is not, and the reason is worth examining carefully — because the ban may be succeeding for reasons that have very little to do with phones.

Consider what a ban actually changes. It does not reduce the total time a student spends on a device; the evidence suggests that time simply moves to after school, where it is less supervised rather than more. What a ban changes is the school day itself: six hours in which attention is not for sale, and in which the social environment is not mediated by an audience of strangers. Those are real goods. But they are goods produced by structuring time and attention, not by the absence of a particular object.

This distinction matters, because if we credit the object rather than the structure, we will draw the wrong conclusions. We will assume the problem is solved at the school gate, and neglect the harder question of what students are doing with the other eighteen hours. We will also be unprepared when the technology changes shape — as it already is, into watches and glasses and earpieces that no bag-check will catch.

There is a further cost that is rarely counted. For some students, a phone is not a distraction but an accommodation: a translation tool, a text-to-speech reader, a link to a parent whose work makes contact unpredictable. Blanket bans tend to handle these cases badly, through exemptions that single out precisely the students least able to afford the attention.

None of this is an argument for doing nothing. It is an argument for being honest about what is working. If the benefit comes from protected attention, then say so, and design for it deliberately — in how lessons are structured, how breaks are used, and what we teach students about managing their own focus. A ban buys time. It does not, by itself, teach anyone anything.`,
  },
]
