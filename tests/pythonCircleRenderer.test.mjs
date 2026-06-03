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
  label_angle: '60°',
});

assert.match(sectorSvg, /<svg/);
assert.match(sectorSvg, /60°/);
assert.doesNotMatch(sectorSvg, /\?/);

const cyclicSvg = render({
  template: 'circle_cyclic_quadrilateral',
  radius: 5,
  labels: ['A', 'B', 'C', 'D'],
  label_O: 'O',
  label_A: '110°',
  label_B: '70°',
  label_C: '95°',
  label_D: '85°',
});

assert.match(cyclicSvg, /<svg/);
assert.match(cyclicSvg, /110°/);
assert.doesNotMatch(cyclicSvg, /\?/);

console.log('python circle renderer test passed');
