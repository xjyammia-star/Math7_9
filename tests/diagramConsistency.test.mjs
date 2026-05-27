import assert from 'node:assert/strict';
import { needsCircleDiameterRepair, needsQuestionAnswerLeakRepair, needsTargetAngleLeakRepair, needsTangentChordRepair } from '../src/utils/diagramConsistency.js';

assert.equal(
  needsCircleDiameterRepair({
    conceptTitle: '圆与直径',
    conceptDesc: '如图，AB是⊙O的直径，点C和点D都在⊙O上，D是弧AC的中点。连接AD、BD、BC。已知∠ABD=25°，求∠BCD的度数。',
    generatedText: '```math-diagram\n{"template":"circle_cyclic_quadrilateral","radius":5,"labels":["A","B","C","D"]}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsCircleDiameterRepair({
    conceptTitle: '圆与直径',
    conceptDesc: '如图，AB是⊙O的直径，点C和点D都在⊙O上，D是弧AC的中点。连接AD、BD、BC。已知∠ABD=25°，求∠BCD的度数。',
    generatedText: '```math-diagram\n{"template":"circle_diameter_points","radius":5,"label_angle_abd":"25°","label_angle_bcd":"?","label_A":"A","label_B":"B","label_C":"C","label_D":"D"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

assert.equal(
  needsCircleDiameterRepair({
    conceptTitle: '圆与直径',
    conceptDesc: '如图，AB是⊙O的直径。',
    generatedText: '没有图的纯文字题。',
    diagramPolicy: 'must_draw',
  }),
  false
);

console.log('diagram consistency test passed');

assert.equal(
  needsTangentChordRepair({
    conceptTitle: '切线-弦定理',
    conceptDesc: '如图，AB是⊙O的切线，切点为A，AC是⊙O的一条弦，点D在劣弧AC上，已知∠BAC = 35°，求∠ADC的度数。',
    generatedText: '```math-diagram\n{"template":"circle_tangent","radius":5,"op_dist":13,"label_O":"O","label_P":"P","label_A":"A","label_B":"B"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsTangentChordRepair({
    conceptTitle: '切线-弦定理',
    conceptDesc: '如图，AB是⊙O的切线，切点为A，AC是⊙O的一条弦，点D在劣弧AC上，已知∠BAC = 35°，求∠ADC的度数。',
    generatedText: '```math-diagram\n{"template":"circle_chord_tangent","radius":5,"angle":35,"arc_type":"minor","label_O":"O","label_P":"P","label_Q":"Q","label_A":"C","label_B":"D","label_C":"E","label_angle":"35°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsTangentChordRepair({
    conceptTitle: '切线-弦定理',
    conceptDesc: '如图，AB是⊙O的切线，切点为A，AC是⊙O的一条弦，点D在劣弧AC上，已知∠BAC = 35°，求∠ADC的度数。',
    generatedText: '```math-diagram\n{"template":"circle_chord_tangent","radius":5,"angle":35,"arc_type":"minor","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"C","label_C":"D","label_angle":"35°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

console.log('tangent-chord consistency test passed');

assert.equal(
  needsQuestionAnswerLeakRepair({
    conceptTitle: '切线与圆',
    conceptDesc: '如图，直线PQ与⊙O相切于A，AB是⊙O的一条弦，C在⊙O的优弧AB上。已知∠ACB = 35°，求∠PAB的度数。',
    generatedText: '```math-diagram\n{"template":"circle_chord_tangent","radius":5,"angle":35,"arc_type":"minor","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"C","label_C":"D","label_angle":"35°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsQuestionAnswerLeakRepair({
    conceptTitle: '切线与圆',
    conceptDesc: '如图，直线PQ与⊙O相切于A，AB是⊙O的一条弦，C在⊙O的优弧AB上。已知∠ACB = 35°，求∠PAB的度数。',
    generatedText: '```math-diagram\n{"template":"circle_chord_tangent","radius":5,"angle":"?","arc_type":"minor","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"C","label_C":"D","label_angle_apb":"?"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

console.log('target-angle leak test passed');

assert.equal(
  needsQuestionAnswerLeakRepair({
    conceptTitle: '两点距离',
    conceptDesc: '如图，点A(0,0)，点B(3,4)，求AB的长度。',
    generatedText: '```math-diagram\n{"template":"coordinate_points","points":[{"x":0,"y":0,"label":"A"},{"x":3,"y":4,"label":"B"}],"segments":[["A","B"]],"label_ab":"5"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsQuestionAnswerLeakRepair({
    conceptTitle: '两点距离',
    conceptDesc: '如图，点A(0,0)，点B(3,4)，求AB的长度。',
    generatedText: '```math-diagram\n{"template":"coordinate_points","points":[{"x":0,"y":0,"label":"A"},{"x":3,"y":4,"label":"B"}],"segments":[["A","B"]],"label_ab":"?"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

console.log('generic question-answer leak test passed');
