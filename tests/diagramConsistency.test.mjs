import assert from 'node:assert/strict';
import { maskQuestionAnswerLeaks, needsAngleValueSourceMismatchRepair, needsCentralAngleRayRepair, needsCircleDiameterRepair, needsCircleIntersectingChordsRepair, needsCircleSectorRepair, needsCircleThreePointsRepair, needsQuestionAnswerLeakRepair, needsTargetAngleLeakRepair, needsTangentChordRepair } from '../src/utils/diagramConsistency.js';

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
    conceptTitle: 'tangent-chord theorem',
    conceptDesc: 'Line PQ is tangent to circle O at A. A,B is a chord, and D lies on the minor arc AB. Given ∠PAB = 42°, find ∠ADB.',
    generatedText: '```math-diagram\n{"template":"circle_tangent","radius":5,"op_dist":13,"label_O":"O","label_P":"P","label_A":"A","label_B":"B"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsTangentChordRepair({
    conceptTitle: 'tangent-chord theorem',
    conceptDesc: 'Line PQ is tangent to circle O at A. A,B is a chord, and D lies on the minor arc AB. Given ∠PAB = 42°, find ∠ADB.',
    generatedText: '```math-diagram\n{"template":"circle_chord_tangent","radius":5,"angle":42,"arc_type":"minor","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"C","label_angle_apb":"42°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsTangentChordRepair({
    conceptTitle: 'tangent-chord theorem',
    conceptDesc: 'Line PQ is tangent to circle O at A. A,B is a chord, and D lies on the minor arc AB. Given ∠PAB = 42°, find ∠ADB.',
    generatedText: '```math-diagram\n{"template":"circle_chord_tangent","radius":5,"angle":42,"arc_type":"minor","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"D","label_angle_apb":"42°","label_angle_adb":"?"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

assert.equal(
  needsTangentChordRepair({
    conceptTitle: 'tangent-chord theorem',
    conceptDesc: 'ๅฆๅพ๏ผPAๅโOไบ็นA๏ผABไธบโO็ๅผฆ๏ผCๅจๅฃๅผงABไธ๏ผDๅจไผๅผงABไธ๏ผ่ฟๆฅADใ€BDใ€BCใ€ACใ€ๅทฒ็ฅโ PAB = 48ยฐ๏ผโ CBD = 20ยฐ๏ผๆฑโ ACB็ๅบฆๆ•ฐใ€',
    generatedText: '```math-diagram\n{"template":"circle_tangent_chord_dual_points","radius":5,"angle":48,"arc_type":"major","d_arc_type":"minor","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_angle_apb":"48ยฐ"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsTangentChordRepair({
    conceptTitle: 'tangent-chord theorem',
    conceptDesc: 'ๅฆๅพ๏ผPAๅโOไบ็นA๏ผABไธบโO็ๅผฆ๏ผCๅจๅฃๅผงABไธ๏ผDๅจไผๅผงABไธ๏ผ่ฟๆฅADใ€BDใ€BCใ€ACใ€ๅทฒ็ฅโ PAB = 48ยฐ๏ผโ CBD = 20ยฐ๏ผๆฑโ ACB็ๅบฆๆ•ฐใ€',
    generatedText: '```math-diagram\n{"template":"circle_tangent_chord_dual_points","radius":5,"angle":48,"arc_type":"minor","d_arc_type":"major","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_angle_apb":"48ยฐ"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsTangentChordRepair({
    conceptTitle: 'tangent-chord theorem',
    conceptDesc: '如图，PA切⊙O于点A，AB为⊙O的弦，C在劣弧AB上，D在优弧AB上，连接AD、BD、BC、AC。已知∠PAB = 48°，∠CBD = 20°，求∠ACB的度数。',
    generatedText: '```math-diagram\n{"template":"circle_chord_tangent","radius":5,"angle":48,"arc_type":"minor","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"C","label_angle_apb":"48°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsTangentChordRepair({
    conceptTitle: 'tangent-chord theorem',
    conceptDesc: '如图，PA切⊙O于点A，AB为⊙O的弦，C在劣弧AB上，D在优弧AB上，连接AD、BD、BC、AC。已知∠PAB = 48°，∠CBD = 20°，求∠ACB的度数。',
    generatedText: '```math-diagram\n{"template":"circle_tangent_chord_dual_points","radius":5,"angle":48,"arc_type":"minor","d_arc_type":"major","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_angle_apb":"48°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

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

assert.equal(
  needsQuestionAnswerLeakRepair({
    conceptTitle: 'tangent-chord theorem',
    conceptDesc: '如图，直线PA与⊙O相切于点A，弦AB将⊙O分成两段弧，点C在优弧AB上，连接AC、BC。已知∠ACB = 40°，求∠PAB的度数。',
    generatedText: '```math-diagram\n{"template":"circle_tangent_chord_dual_points","radius":5,"angle":42,"arc_type":"minor","d_arc_type":"major","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_angle_apb":"42°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsQuestionAnswerLeakRepair({
    conceptTitle: 'tangent-chord theorem',
    conceptDesc: '如图，直线PA与⊙O相切于点A，弦AB将⊙O分成两段弧，点C在优弧AB上，连接AC、BC。已知∠ACB = 40°，求∠PAB的度数。',
    generatedText: '```math-diagram\n{"template":"circle_tangent_chord_dual_points","radius":5,"angle":"?","arc_type":"minor","d_arc_type":"major","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_angle_apb":"?"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

console.log('target-angle leak test passed');

const maskedAngleLeak = maskQuestionAnswerLeaks({
  conceptTitle: 'tangent-chord theorem',
  conceptDesc: 'Line PQ is tangent to circle O at A. AB is a chord. Given ∠PAB = 42°, find ∠ACB.',
  generatedText: '```math-diagram\n{"template":"circle_chord_tangent","radius":5,"angle":42,"arc_type":"minor","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"C","label_C":"D","label_angle_apb":"42°","label_angle_adb":"?"}\n```',
  diagramPolicy: 'must_draw',
});

assert.equal(maskedAngleLeak.includes('"label_angle_apb":"?"'), true);
assert.equal(maskedAngleLeak.includes('"label_angle_adb":"?"'), true);

const maskedGenericAngleLeak = maskQuestionAnswerLeaks({
  conceptTitle: 'geometry',
  conceptDesc: 'In the figure, ∠ABC = 40°. Find ∠ACB.',
  generatedText: '```math-diagram\n{"template":"circle_three_points","radius":5,"labels":["A","B","C"],"label_angle_cba":"40°"}\n```',
  diagramPolicy: 'must_draw',
});

assert.equal(maskedGenericAngleLeak.includes('"label_angle_cba":"?"'), true);

console.log('angle masking test passed');

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

assert.equal(
  needsAngleValueSourceMismatchRepair({
    conceptTitle: 'angle mismatch',
    conceptDesc: '如图，直线PQ与⊙O于点A相切，AB是⊙O的弦，点C在⊙O的优弧AB上。已知∠QAB = 62°，求∠ACB的度数。',
    generatedText: '```math-diagram\n{"template":"circle_chord_tangent","radius":5,"angle":42,"arc_type":"minor","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"C","label_angle_apb":"42°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsAngleValueSourceMismatchRepair({
    conceptTitle: 'angle match',
    conceptDesc: '如图，直线PQ与⊙O于点A相切，AB是⊙O的弦，点C在⊙O的优弧AB上。已知∠QAB = 62°，求∠ACB的度数。',
    generatedText: '```math-diagram\n{"template":"circle_chord_tangent","radius":5,"angle":62,"arc_type":"minor","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"C","label_angle_apb":"62°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

console.log('angle value source match test passed');

assert.equal(
  needsCentralAngleRayRepair({
    conceptTitle: '圆心角',
    conceptDesc: '如图，AB是⊙O的直径，点C和点D都在⊙O上，且两点都在AB的同侧。已知∠ABD = 28°，∠BCD = 34°，求圆心角∠AOC的度数。',
    generatedText: '```math-diagram\n{"template":"circle_diameter_points","radius":5,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_angle_abd":"28°","label_angle_bcd":"34°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsCentralAngleRayRepair({
    conceptTitle: '圆心角',
    conceptDesc: '如图，AB是⊙O的直径，点C和点D都在⊙O上，且两点都在AB的同侧。已知∠ABD = 28°，∠BCD = 34°，求圆心角∠AOC的度数。',
    generatedText: '```math-diagram\n{"template":"circle_diameter_points","radius":5,"show_oc":true,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_angle_abd":"28°","label_angle_bcd":"34°","label_angle_aoc":"?"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

console.log('central-angle ray test passed');

assert.equal(
  needsCentralAngleRayRepair({
    conceptTitle: 'ๅๅผฆ',
    conceptDesc: 'ๅฆๅพ๏ผABๆฏโO็ๅผฆ๏ผ็นCๅ๜๏ผๅทฒ็ฅโ AOC็ๅบฆๆ•ฐใ€',
    generatedText: '```math-diagram\n{"template":"circle_chord","radius":10,"label_O":"O","label_A":"A","label_B":"B","label_C":"C","label_angle_aoc":"?"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

assert.equal(
  needsCentralAngleRayRepair({
    conceptTitle: 'ๅๅค–ๅ็บฟ',
    conceptDesc: 'ๅฆๅพ๏ผ็นAๅผงๅค–็ๅ็บฟๅค–ๆ€ๅๅ๏งๅ๜๏ผๅทฒ็ฅโ AOC็ๅบฆๆ•ฐใ€',
    generatedText: '```math-diagram\n{"template":"circle_tangent","radius":5,"op_dist":13,"show_oc":true,"label_O":"O","label_P":"P","label_A":"A","label_B":"B","label_C":"C","label_angle_aoc":"?"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

assert.equal(
  needsCentralAngleRayRepair({
    conceptTitle: 'ๅผฆๅผงๅค–',
    conceptDesc: 'ๅฆๅพ๏ผ็นAๅผงๅค–็็็บฟ๏ผๅทฒ็ฅโ AOC็ๅบฆๆ•ฐใ€',
    generatedText: '```math-diagram\n{"template":"circle_chord_tangent","radius":5,"angle":42,"arc_type":"minor","show_oc":true,"label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"C","label_angle_aoc":"?"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

assert.equal(
  needsCentralAngleRayRepair({
    conceptTitle: 'ๅๅ…ๅ่พน',
    conceptDesc: 'ๅฆๅพ๏ผๅๅ…่พนๅฝขABCDๅ…โO๏ผๅทฒ็ฅโ AOC็ๅบฆๆ•ฐใ€',
    generatedText: '```math-diagram\n{"template":"circle_cyclic_quadrilateral","radius":5,"labels":["A","B","C","D"],"show_center_rays":true,"label_O":"O","label_A":"2x+10°","label_B":"3x-5°","label_C":"3x°","label_angle_aoc":"?"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

assert.equal(
  needsCentralAngleRayRepair({
    conceptTitle: '扇形',
    conceptDesc: '如图，圆心角∠AOB对应一个扇形，求扇形面积。',
    generatedText: '```math-diagram\n{"template":"circle_sector","radius":10,"label_O":"O","label_A":"A","label_B":"B","label_angle":"45°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

assert.equal(
  needsCentralAngleRayRepair({
    conceptTitle: '圆心角',
    conceptDesc: '如图，求圆心角∠AOC的度数。',
    generatedText: '```math-diagram\n{"template":"circle_cyclic_quadrilateral","radius":5,"labels":["A","B","C","D"],"label_angle_aoc":"?"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

console.log('central-angle template coverage test passed');

assert.equal(
  needsCircleSectorRepair({
    conceptTitle: '扇形',
    conceptDesc: '如图，雨刷单次摆动扫过的圆心角为120°，橡胶片长度为50 cm，求扇形面积。',
    generatedText: '```math-diagram\n{"template":"circle_sector","label_O":"O","label_A":"A","label_B":"B"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsCircleSectorRepair({
    conceptTitle: '扇形',
    conceptDesc: '如图，雨刷单次摆动扫过的圆心角为120°，橡胶片长度为50 cm，求扇形面积。',
    generatedText: '```math-diagram\n{"template":"circle_sector","radius":50,"angle":120,"label_O":"O","label_A":"A","label_B":"B","label_angle":"120°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

console.log('circle sector coverage test passed');

assert.equal(
  needsCircleSectorRepair({
    conceptTitle: 'ๆๅฝข',
    conceptDesc: 'ๅฆๅพ๏ผ้จๅทๅ•ๆฌกๆ‘ๅจๆซ่ฟ็ๅๅฟ่ง’ไธบ120ยฐ๏ผๆฉก่ถ็้•ฟๅบฆไธบ50 cm๏ผๆฑๆๅฝข้ข็งฏใ€',
    generatedText: '```math-diagram\n{"template":"circle_sector","outer_radius":50,"angle":120,"label_O":"O","label_A":"A","label_B":"B","label_outer_radius":"50 cm","label_angle":"120ยฐ"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

assert.equal(
  needsCircleIntersectingChordsRepair({
    conceptTitle: '圆内相交弦',
    conceptDesc: '弦AB与CD相交于圆内一点P，已知AP:PB = 2:3，CP比PD短2 cm，弦CD的总长为10 cm，求弦AB的长。',
    generatedText: '```math-diagram\n{"template":"circle_intersecting_chords","label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_P":"P","label_ratio":"AP:PB=2:3"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsCircleIntersectingChordsRepair({
    conceptTitle: '圆内相交弦',
    conceptDesc: '弦AB与CD相交于圆内一点P，已知AP:PB = 2:3，CP比PD短2 cm，弦CD的总长为10 cm，求弦AB的长。',
    generatedText: '```math-diagram\n{"template":"circle_intersecting_chords","ap":4,"pb":6,"cp":6,"pd":4,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_P":"P","label_ap":"4","label_pb":"6","label_cp":"6","label_pd":"4","label_ratio":"AP:PB=2:3"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

console.log('circle intersecting chords coverage test passed');

assert.equal(
  needsCircleThreePointsRepair({
    conceptTitle: '圆上三点',
    conceptDesc: '如图，A、B、C都在⊙O上，已知∠AOB + ∠ACB = 135°，求∠ACB的度数。',
    generatedText: '```math-diagram\n{"template":"circle_chord","radius":5,"water_depth":4,"label_O":"O","label_A":"A","label_B":"B","label_C":"C"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsCircleThreePointsRepair({
    conceptTitle: '圆上三点',
    conceptDesc: '如图，A、B、C都在⊙O上，已知∠AOB + ∠ACB = 135°，求∠ACB的度数。',
    generatedText: '```math-diagram\n{"template":"circle_three_points","radius":5,"labels":["A","B","C"],"label_O":"O","label_angle_aob":"?","label_angle_acb":"?","label_sum":"135°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);

console.log('circle three-points coverage test passed');

assert.equal(
  needsCircleDiameterRepair({
    conceptTitle: 'diameter problem',
    conceptDesc: '如图，AB是⊙O的直径，C、D都在⊙O上，且两点都在AB的同侧。已知∠ABD = 32°，∠BCD = 21°，求∠CAD的度数。',
    generatedText: '```math-diagram\n{"template":"circle_diameter_points","radius":5,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_angle_abd":"32°","label_angle_bcd":"21°"}\n```',
    diagramPolicy: 'must_draw',
  }),
  true
);

assert.equal(
  needsCircleDiameterRepair({
    conceptTitle: 'diameter problem',
    conceptDesc: '如图，AB是⊙O的直径，C、D都在⊙O上，且两点都在AB的同侧。已知∠ABD = 32°，∠BCD = 21°，求∠CAD的度数。',
    generatedText: '```math-diagram\n{"template":"circle_diameter_points","radius":5,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_angle_abd":"32°","label_angle_bcd":"21°","label_angle_cad":"?"}\n```',
    diagramPolicy: 'must_draw',
  }),
  false
);
