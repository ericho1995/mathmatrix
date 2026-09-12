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
  {
    id: '3f256460-11da-489e-bfbf-3e135ec80686',
    type: 'passage',
    title: 'How to Plant a Sunflower',
    subject: 'english',
    year_level: 'grade_3',
    word_count: 118,
    body: `Sunflowers are easy to grow if you follow these steps.

First, choose a sunny spot. Sunflowers need at least six hours of sunlight every day, so do not plant them in the shade.

Next, dig a small hole about two centimetres deep. Drop in one seed and cover it gently with soil. If you are planting more than one seed, leave a hand's width between them so the plants have room to grow.

Then water the soil well. Keep it damp, but not soaking wet.

Finally, be patient. A green shoot should appear in about a week. Once the plant is tall, you may need to tie the stem to a stake so it does not bend over in the wind.`,
  },
  {
    id: '7867377c-4512-4aeb-86d9-f8178306590f',
    type: 'passage',
    title: 'Milo and the Thunderstorm',
    subject: 'english',
    year_level: 'grade_3',
    word_count: 140,
    body: `Milo did not like thunderstorms. When the sky turned grey, he would hide under the kitchen table with his ears flat against his head.

Ava always found him there. She would lie down on the cool floor beside him and talk in a quiet voice about anything at all — what she had eaten for lunch, the loose tooth at the front of her mouth, the names she would give a puppy if she ever got one.

Milo was not a puppy. He was an old dog with grey hair around his nose, and he had been frightened of storms for as long as Ava could remember.

The thunder cracked again. Milo pressed his head into Ava's knee.

"I know," Ava said. "But it always stops."

And after a while, it did.`,
  },
  {
    id: '1c2ebf23-b84f-4060-b175-468df568df52',
    type: 'passage',
    title: 'The Longest Night',
    subject: 'english',
    year_level: 'grade_5',
    word_count: 196,
    body: `The power had been out for six hours when Dad brought the board games down from the top of the wardrobe.

Nadia had complained for the first hour. She had complained about her half-charged tablet, about the warm milk in the fridge, about the dark. By the third hour she had run out of things to complain about, which was its own kind of problem.

Now there were four candles on the kitchen table and a game of Scrabble that nobody was winning. Her younger brother Reza kept making up words and defending them with enormous confidence.

"Zorp," he said, laying down the tiles. "It's a kind of bird."

"It is absolutely not a kind of bird."

"It's a rare one."

Outside, the wind pushed at the windows. Inside, the candles made everyone's face look softer and older at the same time. Dad was laughing in a way Nadia had not heard for a while — not the polite laugh he used on the phone, but a real one that made him put his cards down.

When the lights flickered back on just after nine, nobody moved to get up.

"We could leave them off," Reza said.

Nobody argued.`,
  },
  {
    id: '16ee5def-8c3d-4ec3-b80b-d4f026f452ee',
    type: 'passage',
    title: 'Why Bees Matter',
    subject: 'english',
    year_level: 'grade_5',
    word_count: 190,
    body: `When most people think of bees, they think of honey. But honey is the least important thing bees give us.

Bees are pollinators. As a bee moves from flower to flower collecting nectar, grains of pollen stick to its body and rub off on the next flower it visits. That transfer is what allows many plants to produce fruit and seeds. Without it, the plant cannot reproduce.

This matters to us because roughly one in every three mouthfuls of food we eat depends on a pollinator. Apples, almonds, pumpkins, blueberries and coffee all rely on bees. A field of almond trees without bees produces almost no almonds at all.

Bee numbers are falling in many parts of the world. The causes are complicated, but scientists point to three in particular: the loss of wildflower habitat, certain pesticides, and disease spread by mites.

The good news is that small actions help. Planting flowering plants that bloom at different times of the year gives bees food across more of the season. Leaving a shallow dish of water out in summer helps too. So does buying from growers who avoid the pesticides most harmful to pollinators.`,
  },
  {
    id: '0cf4fc4d-619a-43a9-b63e-b5547d0cc999',
    type: 'passage',
    title: 'The Swimmer',
    subject: 'english',
    year_level: 'year_7',
    word_count: 288,
    body: `Tam had not been in the water for eleven months, and the pool did not care.

That was the thing nobody told you about coming back. The pool was exactly as she had left it: the same faint smell of chlorine and wet concrete, the same black line running along the bottom, the same cold shock at the first stroke. Everything was where she had left it. She was the only thing that had changed.

Her shoulder had healed. The surgeon had used the word "fully", and the physiotherapist had signed the form, and both of them had smiled at her in a way that suggested this was the end of the story.

She pushed off the wall.

For the first fifty metres her body remembered, and it was like stepping into a room she knew in the dark. Then somewhere in the second lap the remembering ran out, and what was left was a stranger's arms, heavy and badly timed, dragging through water that had turned thick.

She stopped at the wall, breathing hard, and hung on the edge.

Her coach was crouched above her, not writing anything down, which was its own kind of message.

"How was it?"

Tam thought about lying. The old answer — *fine*, *good*, *fine* — sat ready in her mouth, worn smooth from use.

"Slow," she said instead. "Everything's in the wrong order."

Her coach nodded slowly, and something in her face eased, as though this was the answer she had been waiting eleven months to hear.

"Good," she said. "Now we've got something to work with."`,
  },
  {
    id: '10c6cfac-60bf-4782-b260-bf848910eba1',
    type: 'passage',
    title: 'The Case for Later School Start Times',
    subject: 'english',
    year_level: 'year_7',
    word_count: 284,
    body: `Most Australian secondary schools begin the day between 8.30 and 9.00 am. For adults this seems unremarkable. For teenagers, the research suggests, it may be the wrong time entirely.

During adolescence the body clock shifts. The hormone melatonin, which makes us sleepy, begins to be released later in the evening than it does in childhood or adulthood — often not until around eleven at night. This is not a matter of willpower or screen time. It is a biological change, and it means a teenager told to be asleep by nine is being asked to do something their body is actively resisting.

The consequence is straightforward arithmetic. Teenagers need roughly eight to ten hours of sleep. If sleep does not begin until eleven, a 7 am alarm delivers eight hours at best, and far less for anyone with a long commute.

Schools that have pushed their start time later report encouraging results: better attendance, fewer late arrivals, and in several studies, improved academic performance. One American district that moved its high school start from 7.30 to 8.45 recorded a measurable drop in car accidents involving teenage drivers.

The objections are practical rather than scientific. Later starts complicate bus timetables, after-school sport, and the working days of parents. These are real difficulties, and they explain why change has been slow.

But they are logistical problems, and logistical problems can be solved. What cannot be negotiated is the biology. We are currently designing the school day around the convenience of adults and asking adolescents to absorb the cost.`,
  },
  {
    id: '6b8cc8f3-d4da-4540-89d3-a8179f35f430',
    type: 'passage',
    title: 'Inheritance',
    subject: 'english',
    year_level: 'year_9',
    word_count: 356,
    body: `The house sold in nine days, which everyone agreed was a good result.

I flew down for the final weekend, to do what the real estate agent called "clearing personals" — a phrase I turned over several times on the plane, unable to decide whether I admired its efficiency or resented it.

What my mother had left was not valuable and was not junk, which is the hardest category. A biscuit tin of buttons, sorted by colour. Thirty years of Christmas cards, kept in the envelopes, filed by sender. A cardboard box marked GOOD STRING.

My sister took the photographs. My brother took the tools. I stood in the hallway for some time holding the box of string.

There is a particular kind of person, formed by a particular kind of decade, for whom throwing away a usable length of string is a small moral failure. My mother was one of them. She had lived through a period when nothing arrived twice, and the habit had outlasted the conditions that produced it by fifty years, the way habits do.

We are encouraged, now, to find this quaint. There are whole television programmes devoted to persuading people like my mother to let go, staffed by cheerful experts who speak of clutter as though it were a symptom. I have watched several of them. What none of them quite addresses is that the string was not irrational. It was simply calibrated to a world that no longer existed — and the calibration had been correct, once, and had kept a family fed.

I did not keep the string. I want to be clear about that, because it would be a tidier ending if I had.

But I stood in the hallway a long time, and what I was doing, I think, was the only thing left available to me: understanding, slightly too late, what the box had been for.`,
  },
  {
    id: '9f8cf3c2-c413-465b-b107-5c193b2c7fab',
    type: 'passage',
    title: 'In Defence of Difficult Books',
    subject: 'english',
    year_level: 'year_9',
    word_count: 344,
    body: `A familiar argument runs as follows: reading is in decline, therefore anything that gets people reading is good, therefore we should stop worrying about what they read. The argument is generous, widely held, and incomplete.

It is certainly true that reading anything is better than reading nothing, and that literary gatekeeping has historically been used to exclude rather than to invite. Nobody is well served by being told that their reading does not count.

But the argument quietly assumes that all reading does the same work, and it does not. A book that confirms what you already believe, in language you already use, at a pace you find comfortable, is doing something genuinely valuable — it is entertaining you, and entertainment is not a lesser good. It is not, however, doing the same thing as a book that resists you.

Difficulty in a book is not always a flaw. Sometimes it is the point. A sentence that must be read twice is asking you to hold two ideas at once. A structure that withholds information is training you to tolerate not knowing. A character whose logic you find repellent, presented without authorial commentary, is requiring you to do the moral work yourself rather than having it done for you. These are capacities, and like all capacities they develop through use.

This matters beyond literature. The ability to sit with a complicated argument you do not immediately agree with, without either accepting it or dismissing it, is not a natural human talent. It is trained. And we are currently living through a period in which almost every other force acting on our attention is training the opposite reflex.

None of this requires anyone to pretend to enjoy a book they find dull. It requires only that we stop describing difficulty as a failure of the book, and consider the possibility that it is sometimes an invitation — one that asks something of the reader, and gives something back in proportion.`,
  },
]
