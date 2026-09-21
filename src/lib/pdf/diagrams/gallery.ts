import type { Diagram } from '@/types'

/**
 * One or more samples of every diagram kind and style variant, rendered by the
 * development-only /api/dev/diagrams route. Every renderer change is checked
 * against this page by eye — a diagram that type-checks can still overlap its
 * own labels.
 */
export const GALLERY: { name: string; diagram: Diagram }[] = [
  {
    name: 'bar_chart — vertical, scaled axis',
    diagram: { kind: 'bar_chart', categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], series: [{ label: 'Books', values: [12, 18, 9, 15, 21] }], yStep: 5, yMax: 25, yLabel: 'Number of books', xLabel: 'Day' },
  },
  {
    name: 'bar_chart — grouped with key',
    diagram: {
      kind: 'bar_chart',
      categories: ['Passenger cars', 'Utes', 'Vans'],
      series: [
        { label: 'Australian', values: [2, 1, 5] },
        { label: 'European', values: [8, 5, 3] },
        { label: 'Asian', values: [6, 6, 5] },
      ],
      yStep: 1,
      yMax: 9,
      yLabel: 'Vehicles (hundreds)',
    },
  },
  {
    name: 'bar_chart — horizontal, outline',
    diagram: { kind: 'bar_chart', categories: ['Soccer', 'Netball', 'Swimming', 'Cricket'], series: [{ label: '', values: [14, 9, 6, 11] }], yStep: 2, yMax: 16, horizontal: true, style: 'outline', yLabel: 'Number of students' },
  },
  {
    name: 'line_graph — two series, a gap',
    diagram: {
      kind: 'line_graph',
      xLabels: ['6 am', '9 am', '12 pm', '3 pm', '6 pm'],
      series: [
        { label: 'Hobart', values: [4, 9, 14, 13, 8] },
        { label: 'Darwin', values: [24, 28, null, 32, 29], dashed: true },
      ],
      yMin: 0,
      yMax: 35,
      yStep: 5,
      yLabel: 'Temperature (°C)',
      xLabel: 'Time',
    },
  },
  {
    name: 'pie_chart — percentages',
    diagram: { kind: 'pie_chart', sectors: [{ label: 'Walk', value: 45 }, { label: 'Car', value: 30 }, { label: 'Bus', value: 15 }, { label: 'Bike', value: 10 }], showPercent: true },
  },
  {
    name: 'pictograph — half icons',
    diagram: { kind: 'pictograph', icon: 'book', keyValue: 4, keyNoun: 'books', rows: [{ label: 'Aisha', count: 3 }, { label: 'Ben', count: 4.5 }, { label: 'Chloe', count: 2 }, { label: 'Dev', count: 5 }] },
  },
  { name: 'pictograph — stars', diagram: { kind: 'pictograph', icon: 'star', keyValue: 2, keyNoun: 'votes', rows: [{ label: 'Red', count: 4 }, { label: 'Blue', count: 2.5 }, { label: 'Green', count: 6 }] } },
  { name: 'dot_plot', diagram: { kind: 'dot_plot', values: [3, 4, 2, 2, 2, 3, 1, 5, 3, 4], axisLabel: 'Visits to the library' } },
  { name: 'stem_leaf', diagram: { kind: 'stem_leaf', rows: [{ stem: '1', leaves: '2 5 8' }, { stem: '2', leaves: '0 3 3 7 9' }, { stem: '3', leaves: '1 4' }, { stem: '4', leaves: '6' }], keyText: '2 | 3 means 23' } },
  {
    name: 'data_table — torn receipt',
    diagram: { kind: 'data_table', style: 'receipt', torn: true, columns: ['Qty', 'Item', 'Cost'], rows: [[2, 'Batteries (10-pack)', '$11.90'], [4, 'USB cable', '$43.80'], [1, 'Flash drive', '']] },
  },
  {
    name: 'data_table — receipt with total',
    diagram: { kind: 'data_table', style: 'receipt', columns: ['Item', 'Price'], rows: [['Sausage roll', '$3.50'], ['Apple juice', '$2.80'], ['Banana', '$0.90']], footer: ['TOTAL', '$7.20'] },
  },
  {
    name: 'data_table — timetable',
    diagram: { kind: 'data_table', style: 'timetable', columns: ['Station', 'Train 1', 'Train 2', 'Train 3'], rows: [['Central', '7:05', '7:35', '8:05'], ['Redfern', '7:09', '7:39', '8:09'], ['Newtown', '7:14', '7:44', '8:14'], ['Ashfield', '7:22', '7:52', '8:22']] },
  },
  { name: 'data_table — tally', diagram: { kind: 'data_table', style: 'tally', tallyColumn: 1, columns: ['Pet', 'Tally'], rows: [['Dog', 12], ['Cat', 7], ['Fish', 3], ['Bird', 5]] } },
  { name: 'data_table — price list', diagram: { kind: 'data_table', style: 'price_list', title: 'Canteen', columns: ['Item', 'Price'], rows: [['Pie', '$4.20'], ['Salad roll', '$5.50'], ['Water', '$2.00']] } },
  { name: 'spinner — 8 sectors, pointer', diagram: { kind: 'spinner', sectors: [{ label: 'green' }, { label: 'blue' }, { label: 'green' }, { label: 'orange' }, { label: 'green' }, { label: 'blue' }, { label: 'green' }, { label: 'red' }], pointer: 1 } },
  { name: 'spinner — 3 unequal colours', diagram: { kind: 'spinner', sectors: [{ label: 'red', shade: 3 }, { label: 'red', shade: 3 }, { label: 'red', shade: 3 }, { label: 'blue', shade: 1 }, { label: 'blue', shade: 1 }, { label: 'yellow', shade: 0 }] } },
  { name: 'venn — 2 sets, values', diagram: { kind: 'venn', sets: ['Music', 'Drama'], values: { A: 12, AB: 5, B: 8, none: 3 }, universe: 'Year 8 students' } },
  { name: 'venn — 2 sets, shaded exclusive or', diagram: { kind: 'venn', sets: ['Music', 'Drama'], shaded: ['A', 'B'] } },
  { name: 'venn — 3 sets', diagram: { kind: 'venn', sets: ['Soccer', 'Tennis', 'Swim'], values: { A: 6, B: 4, C: 7, AB: 2, AC: 3, BC: 1, ABC: 1, none: 5 }, shaded: ['ABC'] } },
  {
    name: 'figure — trapezium, not to scale',
    diagram: {
      kind: 'figure',
      width: 140,
      height: 50,
      points: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 140, y: 0 }, { id: 'C', x: 120, y: 50 }, { id: 'D', x: 20, y: 50 }, { id: 'E', x: 20, y: 0 }],
      polygons: [{ points: ['A', 'B', 'C', 'D'], shade: 1 }],
      segments: [{ from: 'A', to: 'B', label: '140 cm', labelSide: 'right' }, { from: 'D', to: 'C', label: '100 cm' }, { from: 'D', to: 'E', dashed: true, label: '50 cm', labelSide: 'right' }],
      angles: [{ at: 'E', from: 'B', to: 'D', right: true }],
      notToScale: true,
    },
  },
  {
    name: 'figure — parallel lines and transversal',
    diagram: {
      kind: 'figure',
      width: 160,
      height: 100,
      points: [
        { id: 'A', x: 0, y: 25, label: 'A' }, { id: 'B', x: 160, y: 25, label: 'B' },
        { id: 'C', x: 0, y: 75, label: 'C' }, { id: 'D', x: 160, y: 75, label: 'D' },
        { id: 'P', x: 40, y: 0, label: 'P' }, { id: 'Q', x: 120, y: 100, label: 'Q' },
        { id: 'F', x: 60, y: 25 }, { id: 'G', x: 100, y: 75 },
      ],
      segments: [{ from: 'A', to: 'B', arrows: 1 }, { from: 'C', to: 'D', arrows: 1 }, { from: 'P', to: 'Q' }],
      angles: [{ at: 'F', from: 'B', to: 'Q', label: '52°' }, { at: 'G', from: 'C', to: 'P', label: 'x' }],
    },
  },
  {
    name: 'figure — ladder against a wall',
    diagram: {
      kind: 'figure',
      width: 60,
      height: 120,
      points: [{ id: 'W', x: 0, y: 0 }, { id: 'T', x: 0, y: 115 }, { id: 'F', x: 48, y: 0 }],
      segments: [{ from: 'W', to: 'T', heavy: true, label: '? m' }, { from: 'W', to: 'F', label: '5 m', labelSide: 'right' }, { from: 'F', to: 'T', label: '13 m', labelSide: 'right' }],
      angles: [{ at: 'W', from: 'F', to: 'T', right: true }],
      notToScale: true,
    },
  },
  {
    name: 'figure — isosceles triangle with ticks and circle',
    diagram: {
      kind: 'figure',
      width: 120,
      height: 100,
      points: [{ id: 'A', x: 0, y: 0, label: 'A' }, { id: 'B', x: 120, y: 0, label: 'B' }, { id: 'C', x: 60, y: 90, label: 'C' }, { id: 'O', x: 60, y: 30, dot: true }],
      segments: [{ from: 'A', to: 'B' }, { from: 'A', to: 'C', ticks: 2 }, { from: 'B', to: 'C', ticks: 2, labelSide: 'right' }],
      angles: [{ at: 'C', from: 'A', to: 'B', label: '40°' }, { at: 'A', from: 'B', to: 'C', arcs: 2 }],
      circles: [{ center: 'O', r: 18, dashed: true }],
    },
  },
  {
    name: 'grid_shape — shaded composite with key',
    diagram: { kind: 'grid_shape', cols: 10, rows: 6, cells: ['..........', '.####.....', '.####.....', '.#######..', '.#######..', '..........'], key: 'Each square is 1 cm²' },
  },
  {
    name: 'grid_shape — symmetry on dot grid',
    diagram: { kind: 'grid_shape', cols: 10, rows: 7, grid: 'dot', shapes: [{ points: [[2, 1], [5, 1], [5, 6], [3, 4]], shade: 1 }], lines: [{ from: [5, 0], to: [5, 7], dashed: true }] },
  },
  {
    name: 'coordinate_plane — reflection',
    diagram: {
      kind: 'coordinate_plane',
      xMin: -6, xMax: 6, yMin: -6, yMax: 6, labelEvery: 2,
      shapes: [{ points: [[1, 2], [4, 2], [1, 5]], label: 'A' }, { points: [[-1, 2], [-4, 2], [-1, 5]], label: 'B', dashed: true }],
      points: [{ x: 3, y: -4, label: 'P' }],
    },
  },
  { name: 'solid — cuboid', diagram: { kind: 'solid', shape: 'cuboid', labels: { length: '30 cm', width: '15 cm', height: '12 cm' }, notToScale: true } },
  { name: 'solid — triangular prism', diagram: { kind: 'solid', shape: 'triangular_prism', labels: { length: '8 cm', height: '5 cm', width: '12 cm' } } },
  { name: 'solid — cylinder', diagram: { kind: 'solid', shape: 'cylinder', labels: { radius: '4 cm', height: '10 cm' }, proportions: [2, 2, 2.4] } },
  { name: 'solid — cone', diagram: { kind: 'solid', shape: 'cone', labels: { radius: '3 cm', height: '7 cm' }, proportions: [2, 2, 2.4] } },
  { name: 'solid — square pyramid', diagram: { kind: 'solid', shape: 'square_pyramid', labels: { length: '6 m', height: '4 m' }, proportions: [2.4, 2.4, 2] } },
  { name: 'solid — cube stack', diagram: { kind: 'solid', shape: 'cubes', heights: [[2, 1, 1], [3, 2, 0], [1, 1, 1]] } },
  { name: 'net — cube', diagram: { kind: 'net', faces: ['.#..', '####', '.#..'], marks: ['A', 'B', 'C', 'D', 'E', 'F'] } },
  { name: 'measure — ruler with object', diagram: { kind: 'measure', instrument: 'ruler', from: 0, to: 10, unit: 'cm', object: { start: 1, end: 7.5, label: 'pencil' } } },
  { name: 'measure — broken ruler', diagram: { kind: 'measure', instrument: 'ruler', from: 5, to: 14, unit: 'cm', broken: true, object: { start: 6, end: 12, label: 'hand' } } },
  { name: 'measure — jug', diagram: { kind: 'measure', instrument: 'jug', max: 1000, step: 50, level: 650, unit: 'mL', labelEvery: 200 } },
  { name: 'measure — thermometer', diagram: { kind: 'measure', instrument: 'thermometer', min: -10, max: 40, step: 2, value: 18, labelEvery: 10 } },
  { name: 'measure — kitchen scale dial', diagram: { kind: 'measure', instrument: 'dial', max: 5, step: 0.1, value: 2.3, unit: 'kg', labelEvery: 1 } },
  { name: 'measure — protractor', diagram: { kind: 'measure', instrument: 'protractor', angle: 125 } },
  { name: 'clock — analog quarters', diagram: { kind: 'clock', hour: 4, minute: 40, numerals: 'quarters' } },
  { name: 'clock — digital pm', diagram: { kind: 'clock', hour: 3, minute: 45, style: 'digital', meridiem: 'pm', label: 'Bus arrives' } },
  { name: 'balance — level', diagram: { kind: 'balance', left: ['13 g', '?'], right: ['28 g'] } },
  { name: 'balance — tilted', diagram: { kind: 'balance', left: ['apple'], right: ['50 g', '50 g', '20 g'], tilt: 'left' } },
  { name: 'calendar', diagram: { kind: 'calendar', title: 'March 2027', startDay: 0, days: 31, circled: [10], shaded: [20, 21, 22] } },
  { name: 'number_line — jumps', diagram: { kind: 'number_line', min: 0, max: 50, step: 5, labelEvery: 2, jumps: [{ from: 10, to: 25, label: '+15' }, { from: 25, to: 40, label: '+15' }] } },
  { name: 'number_line — inequality ray', diagram: { kind: 'number_line', min: -5, max: 5, step: 1, ray: { from: -2, direction: 'right', open: true } } },
  { name: 'number_line — fractions with arrow', diagram: { kind: 'number_line', min: 0, max: 2, step: 0.25, hideLabels: true, tickLabels: { '0': '0', '1': '1', '2': '2' }, arrowAt: 1.75 } },
  { name: 'number_line — points', diagram: { kind: 'number_line', min: -2, max: 2, step: 0.5, labelEvery: 2, points: [{ value: -1.5, label: 'P' }, { value: 0.5, label: 'Q' }, { value: 1.25, label: 'R', open: true }] } },
  { name: 'fraction_model — bars', diagram: { kind: 'fraction_model', model: 'bar', parts: 5, shaded: 7, wholes: 2 } },
  { name: 'fraction_model — circles', diagram: { kind: 'fraction_model', model: 'circle', parts: 8, shaded: 3 } },
  { name: 'fraction_model — grid', diagram: { kind: 'fraction_model', model: 'grid', parts: 10, rows: 10, cols: 10, shaded: 37 } },
  {
    name: 'bar_model — ratio 3:5 with total',
    diagram: {
      kind: 'bar_model',
      total: '$48',
      bars: [
        { label: 'Mia', segments: [{ width: 1, shade: 2 }, { width: 1, shade: 2 }, { width: 1, shade: 2 }] },
        { label: 'Leo', segments: [{ width: 1 }, { width: 1 }, { width: 1 }, { width: 1 }, { width: 1 }] },
      ],
    },
  },
  { name: 'place_value — MAB', diagram: { kind: 'place_value', thousands: 1, hundreds: 3, tens: 4, ones: 7 } },
  { name: 'array — dots', diagram: { kind: 'array', rows: 4, cols: 6 } },
  { name: 'array — stars', diagram: { kind: 'array', rows: 3, cols: 5, symbol: 'star' } },
  { name: 'money — notes and coins', diagram: { kind: 'money', items: ['$20', '$5', '$2', '$1', '50c', '20c', '10c', '5c'] } },
  { name: 'tile_pattern', diagram: { kind: 'tile_pattern', designs: [{ label: 'Design 1', rows: ['..#', '.#.', '#..'] }, { label: 'Design 2', rows: ['..#..#', '.#.##.', '#..#..'] }, { label: 'Design 3', rows: ['..#..#..#', '.#.##.##.', '#..#..#..'] }] } },
  { name: 'tile_pattern — round', diagram: { kind: 'tile_pattern', round: true, designs: [{ label: 'Step 1', rows: ['o'] }, { label: 'Step 2', rows: [' o ', 'ooo'] }, { label: 'Step 3', rows: ['  o  ', ' ooo ', 'ooooo'] }] } },
  { name: 'price_tags', diagram: { kind: 'price_tags', items: [{ name: 'Soccer ball', price: '$14.40', icon: 'ball' }, { name: 'Cap', price: '$6.10', icon: 'cap' }, { name: 'Drink', price: '$3.50', icon: 'drink' }, { name: 'Book', price: '$12.95', icon: 'book' }] } },
  { name: 'price_tags — more icons', diagram: { kind: 'price_tags', items: [{ name: 'Pencil', price: '$1.20', icon: 'pencil' }, { name: 'Backpack', price: '$34', icon: 'bag' }, { name: 'T-shirt', price: '$18', icon: 'shirt' }, { name: 'Shoes', price: '$59', icon: 'shoe' }] } },
  { name: 'price_tags — food and toys', diagram: { kind: 'price_tags', items: [{ name: 'Sandwich', price: '$6.50', icon: 'sandwich' }, { name: 'Apple', price: '$0.80', icon: 'apple' }, { name: 'Teddy', price: '$22', icon: 'toy' }, { name: 'Plant', price: '$9.90', icon: 'plant' }] } },
  {
    name: 'grid_map — compass, route, areas',
    diagram: {
      kind: 'grid_map',
      cols: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      rowCount: 6,
      compass: true,
      labelsOnMap: true,
      unitLabel: '1 km',
      points: [{ col: 'B', row: 2, label: 'Home' }, { col: 'F', row: 4, label: 'School' }],
      route: [{ col: 'B', row: 2 }, { col: 'F', row: 2 }, { col: 'F', row: 4 }],
      areas: [{ cells: [{ col: 'D', row: 5 }, { col: 'E', row: 5 }, { col: 'D', row: 6 }, { col: 'E', row: 6 }], label: 'Park', shade: 1 }],
    },
  },
]

/** Picture-option sample: four dot plots, as a "Select the dot plot" item would use. */
export const GALLERY_OPTIONS: Diagram[] = [
  { kind: 'dot_plot', values: [1, 2, 2, 2, 3, 3, 3, 4, 4, 5] },
  { kind: 'dot_plot', values: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5] },
  { kind: 'dot_plot', values: [1, 1, 2, 2, 2, 3, 3, 4, 4, 5] },
  { kind: 'dot_plot', values: [1, 2, 2, 2, 3, 3, 4, 4, 5, 5] },
]

export const GALLERY_NET_OPTIONS: Diagram[] = [
  { kind: 'net', faces: ['.#..', '####', '.#..'] },
  { kind: 'net', faces: ['##..', '.###', '..#.'] },
  { kind: 'net', faces: ['###.', '..###'] },
  { kind: 'net', faces: ['#...', '####', '#...'] },
]
