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
  label_angle: '60ยฐ',
});

assert.match(sectorSvg, /<svg/);
assert.match(sectorSvg, /60ยฐ/);
assert.doesNotMatch(sectorSvg, /\?/);

const cyclicSvg = render({
  template: 'circle_cyclic_quadrilateral',
  radius: 5,
  labels: ['A', 'B', 'C', 'D'],
  label_O: 'O',
  label_A: '110ยฐ',
  label_B: '70ยฐ',
  label_C: '95ยฐ',
  label_D: '85ยฐ',
});

assert.match(cyclicSvg, /<svg/);
assert.match(cyclicSvg, /110ยฐ/);
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

console.log('python circle renderer test passed');

