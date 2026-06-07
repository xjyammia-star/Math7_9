import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MathDiagram from '../src/components/MathDiagram.tsx';

const invalidDiagram = {
  template: 'circle_scene',
  scene: {
    conceptId: 'circles',
    figureType: 'circle',
    center: 'O',
    points: [],
    relations: [],
    givens: [],
    targets: [],
    display: {},
  },
};

const html = renderToStaticMarkup(React.createElement(MathDiagram, { data: invalidDiagram }));

assert.match(html, /Diagram Invalid/);

const explicitSceneDiagram = {
  template: 'circle_scene',
  scene: {
    conceptId: 'circles',
    figureType: 'circle',
    center: 'O',
    points: [
      { id: 'O', x: 0, y: 0, label: 'O' },
      { id: 'A', x: -5, y: 0, label: 'A' },
      { id: 'B', x: 5, y: 0, label: 'B' },
      { id: 'C', x: 0, y: 4, label: 'C' },
      { id: 'D', x: 0, y: -4, label: 'D' },
      { id: 'E', x: 0, y: 0.8, label: 'E' },
    ],
    relations: [
      { type: 'circle', center: 'O', radius: 5 },
      { type: 'segment', points: ['A', 'B'] },
      { type: 'segment', points: ['C', 'D'] },
      { type: 'intersection', point: 'E', of: ['AB', 'CD'] },
      { type: 'angle', points: ['A', 'E', 'C'], value: 30 },
    ],
    givens: [
      { type: 'length', points: ['A', 'B'], value: 10 },
      { type: 'length', points: ['A', 'E'], value: 2 },
    ],
    targets: [],
    display: {},
  },
};

const explicitHtml = renderToStaticMarkup(React.createElement(MathDiagram, { data: explicitSceneDiagram }));

assert.doesNotMatch(explicitHtml, /unsupported diagram template: circle_scene/);
assert.match(explicitHtml, />A</);
assert.match(explicitHtml, />B</);

console.log('math diagram circle fallback test passed');
