import assert from 'node:assert/strict';
import {
  needsCircleChordRepair,
  needsCircleDiameterRepair,
  needsCircleDiameterIntersectingChordsRepair,
  needsCircleDiameterTangentChordRepair,
  needsCircleIntersectingChordsRepair,
  needsCircleSectorRepair,
  needsCircleTangentRepair,
} from '../src/utils/diagramConsistency.js';

assert.equal(
  needsCircleDiameterRepair({
    conceptTitle: 'circle diameter',
    conceptDesc: 'In circle O, AB is a diameter. Points C and D are on the circle. Given ∠ABD = 25°, find ∠BCD.',
    generatedText: '```math-diagram\n{"template":"circle_cyclic_quadrilateral","radius":5,"labels":["A","B","C","D"]}\n```',
    diagramPolicy: 'must_draw',
  }),
  true,
);

assert.equal(
  needsCircleDiameterRepair({
    conceptTitle: 'circle diameter',
    conceptDesc: 'In circle O, AB is a diameter. Points C and D are on the circle. Given ∠ABD = 25°, find ∠BCD.',
    generatedText: '```math-diagram\n{"template":"circle_diameter_points","radius":5,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_angle_abd":"25°","label_angle_bcd":"?"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false,
);

assert.equal(
  needsCircleChordRepair({
    conceptTitle: 'circle chord',
    conceptDesc: '如图，圆 O 的半径为 20 cm。弦 AB 在圆内，且 AB 所在的直线与圆心 O 的距离为 5 cm。点 C 是弦 AB 的中点，连接 OC。',
    generatedText: '```math-diagram\n{"template":"circle_chord","radius":20,"depth":5,"label_depth":"h","show_perpendicular":true,"label_O":"O","label_A":"A","label_B":"B","label_C":"C","label_radius":"20 cm","label_chord":"24 cm"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true,
);

assert.equal(
  needsCircleSectorRepair({
    conceptTitle: 'sector',
    conceptDesc: 'A sector has radius 5 cm and central angle 60°.',
    generatedText: '```math-diagram\n{"template":"circle_sector","radius":5}\n```',
    diagramPolicy: 'must_draw',
  }),
  true,
);

assert.equal(
  needsCircleSectorRepair({
    conceptTitle: 'sector',
    conceptDesc: 'A sector has radius 5 cm and central angle 60°.',
    generatedText: '```math-diagram\n{"template":"circle_sector","radius":5,"angle":60}\n```',
    diagramPolicy: 'must_draw',
  }),
  false,
);

assert.equal(
  needsCircleIntersectingChordsRepair({
    conceptTitle: 'intersecting chords',
    conceptDesc: 'Two chords intersect at P. Given AP = PB and CP = PD.',
    generatedText: '```math-diagram\n{"template":"circle_intersecting_chords","radius":5,"labels":["A","B","C","D"],"ap":3,"pb":4}\n```',
    diagramPolicy: 'must_draw',
  }),
  true,
);

assert.equal(
  needsCircleIntersectingChordsRepair({
    conceptTitle: 'intersecting chords',
    conceptDesc: 'Two chords intersect at P. Given AP = PB and CP = PD.',
    generatedText: '```math-diagram\n{"template":"circle_intersecting_chords","radius":5,"labels":["A","B","C","D"],"ap":3,"pb":4,"cp":5,"cd":6}\n```',
    diagramPolicy: 'must_draw',
  }),
  false,
);

assert.equal(
  needsCircleDiameterIntersectingChordsRepair({
    conceptTitle: 'circle diameter and intersecting chords',
    conceptDesc: 'AB is a diameter of circle O. Chords AC and BD intersect at E and AC ⟂ BD.',
    generatedText: '```math-diagram\n{"template":"circle_cyclic_quadrilateral","radius":5,"labels":["A","B","C","D"]}\n```',
    diagramPolicy: 'must_draw',
  }),
  true,
);

assert.equal(
  needsCircleDiameterIntersectingChordsRepair({
    conceptTitle: 'circle diameter and intersecting chords',
    conceptDesc: 'AB is a diameter of circle O. Chords AC and BD intersect at E and AC ⟂ BD.',
    generatedText: '```math-diagram\n{"template":"circle_diameter_chords","radius":5,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_E":"E","label_ab":"10 cm"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false,
);

assert.equal(
  needsCircleDiameterTangentChordRepair({
    conceptTitle: 'circle diameter tangent chord',
    conceptDesc: 'In circle O, AB is a diameter. C is the point of tangency and P lies on the extension of AB. Connect AC and AD. CD meets AB at E.',
    generatedText: '```math-diagram\n{"template":"circle_cyclic_quadrilateral","radius":5,"labels":["A","B","C","D"]}\n```',
    diagramPolicy: 'must_draw',
  }),
  true,
);

assert.equal(
  needsCircleDiameterTangentChordRepair({
    conceptTitle: 'circle diameter tangent chord',
    conceptDesc: 'In circle O, AB is a diameter. C is the point of tangency and P lies on the extension of AB. Connect AC and AD. CD meets AB at E.',
    generatedText: '```math-diagram\n{"template":"circle_diameter_tangent_chord","radius":5,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_E":"E","label_P":"P","label_O":"O","label_ab":"10 cm","label_ac":"4 cm","label_ad":"?","label_cp":"8 cm"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false,
);

assert.equal(
  needsCircleDiameterTangentChordRepair({
    conceptTitle: 'circle diameter tangent chord',
    conceptDesc: 'In circle O, AB is a diameter. C is the point of tangency and P lies on the extension of AB. Connect AC and BC.',
    generatedText: '```math-diagram\n{"template":"circle_diameter_tangent_chord","radius":5,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_E":"E","label_P":"P","label_O":"O","label_ab":"10 cm","label_ac":"4 cm","label_cp":"8 cm"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true,
);

assert.equal(
  needsCircleTangentRepair({
    conceptTitle: 'circle tangent with arc point',
    conceptDesc: 'P is an external point. PA and PB are tangents. C is on the minor arc AB and a tangent at C meets PA and PB at D and E.',
    generatedText: '```math-diagram\n{"template":"circle_tangent","radius":5,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_E":"E","label_P":"P","label_O":"O","show_arc_tangent":true,"c_arc_type":"major"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true,
);

console.log('diagram consistency test passed');
