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

console.log('math diagram circle fallback test passed');
