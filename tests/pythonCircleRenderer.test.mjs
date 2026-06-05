import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const scriptPath = path.resolve('server', 'circle_diagram_renderer.py');

function render(spec) {
  return execFileSync('python', [scriptPath], {
    input: JSON.stringify(spec),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

const sectorSvg = render({
  template: 'circle_sector',
  radius: 5,
  angle: 60,
  label_O: 'O',
  label_A: 'A',
  label_B: 'B',
  label_radius: '5 cm',
  label_angle: '60 deg',
});

assert.match(sectorSvg, /<svg/);
assert.match(sectorSvg, /60 deg/);
assert.doesNotMatch(sectorSvg, /\?/);

const cyclicSvg = render({
  template: 'circle_cyclic_quadrilateral',
  radius: 5,
  labels: ['A', 'B', 'C', 'D'],
  label_O: 'O',
  label_A: '110 deg',
  label_B: '70 deg',
  label_C: '95 deg',
  label_D: '85 deg',
});

assert.match(cyclicSvg, /<svg/);
assert.match(cyclicSvg, /110 deg/);
assert.doesNotMatch(cyclicSvg, /\?/);

const diameterChordsSvg = render({
  template: 'circle_diameter_chords',
  radius: 5,
  label_A: 'A',
  label_B: 'B',
  label_C: 'C',
  label_D: 'D',
  label_E: 'E',
  label_ab: '10 cm',
  show_right_angle: true,
});

assert.match(diameterChordsSvg, /<svg/);
assert.match(diameterChordsSvg, /10 cm/);
assert.doesNotMatch(diameterChordsSvg, /\?/);

const diameterTangentChordSvg = render({
  template: 'circle_diameter_tangent_chord',
  radius: 5,
  label_A: 'A',
  label_B: 'B',
  label_C: 'C',
  label_D: 'D',
  label_E: 'E',
  label_P: 'P',
  label_O: 'O',
  label_ab: '10 cm',
  label_ac: '4 cm',
  label_bc: '6 cm',
  label_cp: '8 cm',
});

assert.match(diameterTangentChordSvg, /<svg/);
assert.match(diameterTangentChordSvg, /A/);
assert.match(diameterTangentChordSvg, /P/);
assert.match(diameterTangentChordSvg, /6 cm/);
assert.doesNotMatch(diameterTangentChordSvg, /\?/);

const sceneSvg = render({
  template: 'circle_scene',
  scene: {
    conceptId: 'circles',
    figureType: 'circle',
    center: 'O',
    points: [
      { name: 'P', role: 'external_point' },
      { name: 'A', role: 'tangent_point' },
      { name: 'B', role: 'tangent_point' },
      { name: 'C', role: 'arc_point', arcSide: 'minor' },
      { name: 'D', role: 'intersection_point' },
      { name: 'E', role: 'intersection_point' },
    ],
    relations: [
      { type: 'tangent', line: 'PA', touches: 'A' },
      { type: 'tangent', line: 'PB', touches: 'B' },
      { type: 'arc_membership', point: 'C', arc: 'AB', arcSide: 'minor' },
      { type: 'tangent_at_point', point: 'C' },
      { type: 'intersection', point: 'D', of: ['tangent_at_C', 'PA'] },
      { type: 'intersection', point: 'E', of: ['tangent_at_C', 'PB'] },
    ],
    givens: [
      { name: 'PA', value: 6 },
      { name: 'angle_APB', value: 60 },
    ],
    targets: [{ name: 'perimeter_triangle_CDE' }],
    display: { showCircle: true, showTangentAtC: true, showOC: true, hideDerivedNumericLabels: true },
  },
});

assert.match(sceneSvg, /<svg/);
assert.match(sceneSvg, /P/);
assert.match(sceneSvg, /A/);
assert.match(sceneSvg, /B/);
assert.doesNotMatch(sceneSvg, /\?/);

const explicitSceneSvg = render({
  template: 'circle_scene',
  scene: {
    conceptId: 'circle',
    figureType: 'circle',
    center: 'C',
    points: [
      { id: 'C', x: 0, y: 0, label: 'C' },
      { id: 'A', x: 0, y: 3, label: 'A' },
      { id: 'B', x: 4, y: 0, label: 'B' },
      { id: 'D', x: 2.4, y: 1.8, label: 'D' },
      { id: 'E', x: 0, y: -3, label: 'E' },
      { id: 'P', x: 0.9, y: 2.86, label: 'P' },
    ],
    relations: [
      { type: 'segment', points: ['A', 'B'] },
      { type: 'segment', points: ['B', 'C'] },
      { type: 'segment', points: ['A', 'C'] },
      { type: 'segment', points: ['C', 'D'] },
      { type: 'segment', points: ['B', 'P'] },
      { type: 'segment', points: ['C', 'P'] },
      { type: 'circle', center: 'C', radius: 3 },
      { type: 'right_angle', points: ['A', 'C', 'B'] },
      { type: 'arc', center: 'C', radius: 3, start: 'A', end: 'D', label: '劣弧AD' },
    ],
    givens: [
      { type: 'length', points: ['A', 'C'], value: 3 },
      { type: 'length', points: ['B', 'C'], value: 4 },
    ],
    targets: [],
    display: {},
  },
});

assert.match(explicitSceneSvg, /<svg/);
assert.match(explicitSceneSvg, /<path d="M .* A .*"/);
assert.match(explicitSceneSvg, />A</);
assert.match(explicitSceneSvg, />B</);

const angleSceneSvg = render({
  template: 'circle_scene',
  scene: {
    conceptId: 'circle',
    figureType: 'circle',
    center: 'O',
    points: [
      { id: 'O', x: 0, y: 0, label: 'O' },
      { id: 'A', x: -5, y: 0, label: 'A' },
      { id: 'B', x: 5, y: 0, label: 'B' },
      { id: 'C', x: 0, y: 4, label: 'C' },
      { id: 'E', x: 0, y: 0.8, label: 'E' },
    ],
    relations: [
      { type: 'segment', points: ['A', 'B'] },
      { type: 'segment', points: ['C', 'E'] },
      { type: 'circle', center: 'O', radius: 5 },
      { type: 'angle', points: ['A', 'E', 'C'], value: 30 },
    ],
    givens: [],
    targets: [],
    display: {},
  },
});

assert.match(angleSceneSvg, /30°/);

console.log('python circle renderer test passed');

