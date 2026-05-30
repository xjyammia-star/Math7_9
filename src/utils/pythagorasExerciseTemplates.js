const PYTHAGORAS_SCENARIOS = [
  {
    id: 'cn_direct_hypotenuse',
    curricula: ['CN'],
    grades: ['7', '8'],
    difficulties: ['Easy', 'Medium'],
    kind: 'direct_hypotenuse',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '345', legAB: 3, legBC: 4, hypotenuse: 5 },
      { variantId: '6810', legAB: 6, legBC: 8, hypotenuse: 10 },
      { variantId: '51213', legAB: 5, legBC: 12, hypotenuse: 13 },
    ],
  },
  {
    id: 'cn_direct_leg_ab',
    curricula: ['CN'],
    grades: ['7', '8', '9'],
    difficulties: ['Easy', 'Medium'],
    kind: 'direct_leg_ab',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '51213', legAB: 12, legBC: 5, hypotenuse: 13 },
      { variantId: '7825', legAB: 24, legBC: 7, hypotenuse: 25 },
    ],
  },
  {
    id: 'cn_direct_leg_bc',
    curricula: ['CN'],
    grades: ['8', '9'],
    difficulties: ['Medium', 'Hard'],
    kind: 'direct_leg_bc',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '72425', legAB: 7, legBC: 24, hypotenuse: 25 },
      { variantId: '81517', legAB: 8, legBC: 15, hypotenuse: 17 },
    ],
  },
  {
    id: 'cn_rectangle_diagonal',
    curricula: ['CN'],
    grades: ['7', '8', '9'],
    difficulties: ['Easy', 'Medium'],
    kind: 'rectangle_diagonal',
    diagramTemplate: 'rectangle_diagonal',
    values: [
      { variantId: '345', width: 3, height: 4 },
      { variantId: '6810', width: 6, height: 8 },
      { variantId: '51213', width: 5, height: 12 },
    ],
  },
  {
    id: 'cn_square_diagonal',
    curricula: ['CN'],
    grades: ['7', '8'],
    difficulties: ['Easy', 'Medium'],
    kind: 'square_diagonal',
    diagramTemplate: 'square_diagonal',
    values: [
      { variantId: '4root2', side: 4, diagonal: 4 * Math.SQRT2 },
      { variantId: '6root2', side: 6, diagonal: 6 * Math.SQRT2 },
      { variantId: '8root2', side: 8, diagonal: 8 * Math.SQRT2 },
    ],
  },
  {
    id: 'cn_square_side_from_diagonal',
    curricula: ['CN'],
    grades: ['8', '9'],
    difficulties: ['Medium', 'Hard'],
    kind: 'square_side_from_diagonal',
    diagramTemplate: 'square_diagonal',
    values: [
      { variantId: '5root2', side: 5, diagonal: 5 * Math.SQRT2 },
      { variantId: '12root2', side: 12, diagonal: 12 * Math.SQRT2 },
      { variantId: '13root2', side: 13, diagonal: 13 * Math.SQRT2 },
    ],
  },
  {
    id: 'cn_show_right_triangle',
    curricula: ['CN'],
    grades: ['8', '9'],
    difficulties: ['Medium', 'Hard'],
    kind: 'show_right_triangle',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '81517', legAB: 8, legBC: 15, hypotenuse: 17 },
      { variantId: '94041', legAB: 9, legBC: 40, hypotenuse: 41 },
    ],
  },
  {
    id: 'cn_exact_surd',
    curricula: ['CN'],
    grades: ['9'],
    difficulties: ['Hard'],
    kind: 'direct_hypotenuse_surd',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '79root130', legAB: 7, legBC: 9, hypotenuse: Math.sqrt(130) },
      { variantId: '1013root269', legAB: 10, legBC: 13, hypotenuse: Math.sqrt(269) },
    ],
  },
  {
    id: 'cn_rectangle_perimeter_diagonal',
    curricula: ['CN'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'rectangle_perimeter_diagonal',
    diagramTemplate: 'rectangle_diagonal',
    values: [
      { variantId: '36213', width: 5, height: 13, perimeter: 36, diagonal: Math.sqrt(194) },
      { variantId: '40216', width: 8, height: 12, perimeter: 40, diagonal: Math.sqrt(208) },
      { variantId: '44218', width: 10, height: 12, perimeter: 44, diagonal: Math.sqrt(244) },
    ],
  },
  {
    id: 'cn_rectangle_area_diagonal',
    curricula: ['CN'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'rectangle_area_diagonal',
    diagramTemplate: 'rectangle_diagonal',
    values: [
      { variantId: '45213', width: 4, height: 13, area: 52, diagonal: Math.sqrt(185) },
      { variantId: '78412', width: 7, height: 12, area: 84, diagonal: Math.sqrt(193) },
      { variantId: '89612', width: 8, height: 12, area: 96, diagonal: Math.sqrt(208) },
    ],
  },
  {
    id: 'cn_ladder_foot',
    curricula: ['CN'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'ladder_foot',
    diagramTemplate: 'ladder',
    unit: 'm',
    values: [
      { variantId: '13125', length: 13, height: 12, foot: 5 },
      { variantId: '17158', length: 17, height: 15, foot: 8 },
      { variantId: '201612', length: 20, height: 16, foot: 12 },
      { variantId: '25724', length: 25, height: 24, foot: 7 },
    ],
  },
  {
    id: 'cn_coordinate_distance_shifted',
    curricula: ['CN'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'coordinate_distance_shifted',
    diagramTemplate: 'coordinate_points',
    values: [
      {
        variantId: '23815',
        points: [
          { x: 2, y: 3, label: 'A' },
          { x: 8, y: 3, label: 'B' },
          { x: 8, y: 15, label: 'C' },
        ],
      },
      {
        variantId: '14211',
        points: [
          { x: 1, y: 4, label: 'A' },
          { x: 5, y: 4, label: 'B' },
          { x: 5, y: 13, label: 'C' },
        ],
      },
      {
        variantId: '37613',
        points: [
          { x: 3, y: 7, label: 'A' },
          { x: 10, y: 7, label: 'B' },
          { x: 10, y: 20, label: 'C' },
        ],
      },
    ],
  },
  {
    id: 'us_ladder_easy',
    curricula: ['US'],
    grades: ['7', '8'],
    difficulties: ['Easy', 'Medium'],
    kind: 'ladder_height',
    diagramTemplate: 'ladder',
    unit: 'm',
    values: [
      { variantId: '6810', length: 10, foot: 6, height: 8 },
      { variantId: '51213', length: 13, foot: 5, height: 12 },
      { variantId: '81517', length: 17, foot: 8, height: 15 },
    ],
  },
  {
    id: 'us_rectangle_perimeter_diagonal',
    curricula: ['US'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'rectangle_perimeter_diagonal',
    diagramTemplate: 'rectangle_diagonal',
    values: [
      { variantId: '36213', width: 5, height: 13, perimeter: 36, diagonal: Math.sqrt(194) },
      { variantId: '40216', width: 8, height: 12, perimeter: 40, diagonal: Math.sqrt(208) },
      { variantId: '52218', width: 10, height: 16, perimeter: 52, diagonal: Math.sqrt(356) },
    ],
  },
  {
    id: 'us_rectangle_area_diagonal',
    curricula: ['US'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'rectangle_area_diagonal',
    diagramTemplate: 'rectangle_diagonal',
    values: [
      { variantId: '45213', width: 4, height: 13, area: 52, diagonal: Math.sqrt(185) },
      { variantId: '78412', width: 7, height: 12, area: 84, diagonal: Math.sqrt(193) },
      { variantId: '89612', width: 8, height: 12, area: 96, diagonal: Math.sqrt(208) },
    ],
  },
  {
    id: 'us_ladder_foot',
    curricula: ['US'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'ladder_foot',
    diagramTemplate: 'ladder',
    unit: 'm',
    values: [
      { variantId: '13125', length: 13, height: 12, foot: 5 },
      { variantId: '17158', length: 17, height: 15, foot: 8 },
      { variantId: '201612', length: 20, height: 16, foot: 12 },
      { variantId: '25724', length: 25, height: 24, foot: 7 },
    ],
  },
  {
    id: 'us_show_right_triangle',
    curricula: ['US'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'show_right_triangle',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '51213', legAB: 5, legBC: 12, hypotenuse: 13 },
      { variantId: '81517', legAB: 8, legBC: 15, hypotenuse: 17 },
      { variantId: '94041', legAB: 9, legBC: 40, hypotenuse: 41 },
    ],
  },
  {
    id: 'us_rectangle_diagonal',
    curricula: ['US'],
    grades: ['7', '8', '9'],
    difficulties: ['Easy', 'Medium'],
    kind: 'rectangle_diagonal',
    diagramTemplate: 'rectangle_diagonal',
    values: [
      { variantId: '6810', width: 6, height: 8 },
      { variantId: '81517', width: 8, height: 15 },
    ],
  },
  {
    id: 'us_rectangle_diagonal_hard',
    curricula: ['US'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'rectangle_diagonal',
    diagramTemplate: 'rectangle_diagonal',
    values: [
      { variantId: '51213', width: 5, height: 12 },
      { variantId: '6810', width: 6, height: 8 },
      { variantId: '81517', width: 8, height: 15 },
    ],
  },
  {
    id: 'us_square_diagonal',
    curricula: ['US'],
    grades: ['7', '8'],
    difficulties: ['Easy', 'Medium'],
    kind: 'square_diagonal',
    diagramTemplate: 'square_diagonal',
    values: [
      { variantId: '5root2', side: 5, diagonal: 5 * Math.SQRT2 },
      { variantId: '7root2', side: 7, diagonal: 7 * Math.SQRT2 },
      { variantId: '9root2', side: 9, diagonal: 9 * Math.SQRT2 },
    ],
  },
  {
    id: 'us_square_side_from_diagonal',
    curricula: ['US'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'square_side_from_diagonal',
    diagramTemplate: 'square_diagonal',
    values: [
      { variantId: '5root2', side: 5, diagonal: 5 * Math.SQRT2 },
      { variantId: '12root2', side: 12, diagonal: 12 * Math.SQRT2 },
      { variantId: '13root2', side: 13, diagonal: 13 * Math.SQRT2 },
    ],
  },
  {
    id: 'us_ladder_hard',
    curricula: ['US'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'ladder_height',
    diagramTemplate: 'ladder',
    unit: 'm',
    values: [
      { variantId: '91715', length: 15, foot: 9, height: 12 },
      { variantId: '72524', length: 25, foot: 7, height: 24 },
      { variantId: '102426', length: 26, foot: 10, height: 24 },
      { variantId: '123537', length: 37, foot: 12, height: 35 },
    ],
  },
  {
    id: 'us_exact_surd',
    curricula: ['US'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'direct_hypotenuse_surd',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '79root130', legAB: 7, legBC: 9, hypotenuse: Math.sqrt(130) },
      { variantId: '1013root269', legAB: 10, legBC: 13, hypotenuse: Math.sqrt(269) },
      { variantId: '1116root377', legAB: 11, legBC: 16, hypotenuse: Math.sqrt(377) },
    ],
  },
  {
    id: 'us_coordinate_distance_shifted',
    curricula: ['US'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'coordinate_distance_shifted',
    diagramTemplate: 'coordinate_points',
    values: [
      {
        variantId: '23815',
        points: [
          { x: 2, y: 3, label: 'A' },
          { x: 8, y: 3, label: 'B' },
          { x: 8, y: 15, label: 'C' },
        ],
      },
      {
        variantId: '14211',
        points: [
          { x: 1, y: 4, label: 'A' },
          { x: 5, y: 4, label: 'B' },
          { x: 5, y: 13, label: 'C' },
        ],
      },
      {
        variantId: '37613',
        points: [
          { x: 3, y: 7, label: 'A' },
          { x: 10, y: 7, label: 'B' },
          { x: 10, y: 20, label: 'C' },
        ],
      },
    ],
  },
  {
    id: 'us_coordinate_distance',
    curricula: ['US'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'coordinate_distance',
    diagramTemplate: 'coordinate_points',
    values: [
      {
        variantId: '068',
        points: [
          { x: 0, y: 0, label: 'A' },
          { x: 6, y: 0, label: 'B' },
          { x: 6, y: 8, label: 'C' },
        ],
      },
      {
        variantId: '0912',
        points: [
          { x: 0, y: 0, label: 'A' },
          { x: 9, y: 0, label: 'B' },
          { x: 9, y: 12, label: 'C' },
        ],
      },
      {
        variantId: '1220',
        points: [
          { x: 0, y: 0, label: 'A' },
          { x: 12, y: 0, label: 'B' },
          { x: 12, y: 16, label: 'C' },
        ],
      },
    ],
  },
  {
    id: 'uk_show_right_triangle',
    curricula: ['UK'],
    grades: ['8', '9'],
    difficulties: ['Medium', 'Hard'],
    kind: 'show_right_triangle',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '72425', legAB: 7, legBC: 24, hypotenuse: 25 },
      { variantId: '202129', legAB: 20, legBC: 21, hypotenuse: 29 },
      { variantId: '81517', legAB: 8, legBC: 15, hypotenuse: 17 },
      { variantId: '116061', legAB: 11, legBC: 60, hypotenuse: 61 },
      { variantId: '138485', legAB: 13, legBC: 84, hypotenuse: 85 },
    ],
  },
  {
    id: 'uk_rectangle_perimeter_diagonal',
    curricula: ['UK'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'rectangle_perimeter_diagonal',
    diagramTemplate: 'rectangle_diagonal',
    values: [
      { variantId: '36213', width: 5, height: 13, perimeter: 36, diagonal: Math.sqrt(194) },
      { variantId: '40216', width: 8, height: 12, perimeter: 40, diagonal: Math.sqrt(208) },
      { variantId: '52218', width: 10, height: 16, perimeter: 52, diagonal: Math.sqrt(356) },
    ],
  },
  {
    id: 'uk_rectangle_area_diagonal',
    curricula: ['UK'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'rectangle_area_diagonal',
    diagramTemplate: 'rectangle_diagonal',
    values: [
      { variantId: '45213', width: 4, height: 13, area: 52, diagonal: Math.sqrt(185) },
      { variantId: '78412', width: 7, height: 12, area: 84, diagonal: Math.sqrt(193) },
      { variantId: '89612', width: 8, height: 12, area: 96, diagonal: Math.sqrt(208) },
    ],
  },
  {
    id: 'uk_ladder_foot',
    curricula: ['UK'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'ladder_foot',
    diagramTemplate: 'ladder',
    unit: 'm',
    values: [
      { variantId: '13125', length: 13, height: 12, foot: 5 },
      { variantId: '17158', length: 17, height: 15, foot: 8 },
      { variantId: '201612', length: 20, height: 16, foot: 12 },
      { variantId: '25724', length: 25, height: 24, foot: 7 },
    ],
  },
  {
    id: 'uk_coordinate_distance_shifted',
    curricula: ['UK'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'coordinate_distance_shifted',
    diagramTemplate: 'coordinate_points',
    values: [
      {
        variantId: '23815',
        points: [
          { x: 2, y: 3, label: 'A' },
          { x: 8, y: 3, label: 'B' },
          { x: 8, y: 15, label: 'C' },
        ],
      },
      {
        variantId: '14211',
        points: [
          { x: 1, y: 4, label: 'A' },
          { x: 5, y: 4, label: 'B' },
          { x: 5, y: 13, label: 'C' },
        ],
      },
      {
        variantId: '37613',
        points: [
          { x: 3, y: 7, label: 'A' },
          { x: 10, y: 7, label: 'B' },
          { x: 10, y: 20, label: 'C' },
        ],
      },
    ],
  },
  {
    id: 'uk_exact_surd',
    curricula: ['UK'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'direct_hypotenuse_surd',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '79root130', legAB: 7, legBC: 9, hypotenuse: Math.sqrt(130) },
      { variantId: '1013root269', legAB: 10, legBC: 13, hypotenuse: Math.sqrt(269) },
      { variantId: '1116root377', legAB: 11, legBC: 16, hypotenuse: Math.sqrt(377) },
    ],
  },
  {
    id: 'sg_ladder_context',
    curricula: ['SG'],
    grades: ['7', '8', '9'],
    difficulties: ['Easy', 'Medium'],
    kind: 'ladder_height',
    diagramTemplate: 'ladder',
    unit: 'm',
    values: [
      { variantId: '81517', length: 17, foot: 8, height: 15 },
      { variantId: '261024', length: 26, foot: 10, height: 24 },
      { variantId: '131284', length: 85, foot: 13, height: 84 },
      { variantId: '151225', length: 25, foot: 15, height: 20 },
    ],
  },
  {
    id: 'sg_square_diagonal',
    curricula: ['SG'],
    grades: ['7', '8'],
    difficulties: ['Easy', 'Medium'],
    kind: 'square_diagonal',
    diagramTemplate: 'square_diagonal',
    values: [
      { variantId: '4root2', side: 4, diagonal: 4 * Math.SQRT2 },
      { variantId: '6root2', side: 6, diagonal: 6 * Math.SQRT2 },
      { variantId: '8root2', side: 8, diagonal: 8 * Math.SQRT2 },
    ],
  },
  {
    id: 'uk_rectangle_diagonal',
    curricula: ['UK'],
    grades: ['8', '9'],
    difficulties: ['Easy', 'Medium', 'Hard'],
    kind: 'rectangle_diagonal',
    diagramTemplate: 'rectangle_diagonal',
    values: [
      { variantId: '81517', width: 8, height: 15 },
      { variantId: '72425', width: 7, height: 24 },
    ],
  },
  {
    id: 'uk_square_side_from_diagonal',
    curricula: ['UK'],
    grades: ['8', '9'],
    difficulties: ['Medium', 'Hard'],
    kind: 'square_side_from_diagonal',
    diagramTemplate: 'square_diagonal',
    values: [
      { variantId: '5root2', side: 5, diagonal: 5 * Math.SQRT2 },
      { variantId: '12root2', side: 12, diagonal: 12 * Math.SQRT2 },
    ],
  },
  {
    id: 'ib_coordinate_distance',
    curricula: ['IB'],
    grades: ['8', '9'],
    difficulties: ['Medium', 'Hard'],
    kind: 'coordinate_distance',
    diagramTemplate: 'coordinate_points',
    values: [
      {
        variantId: '068',
        points: [
          { x: 0, y: 0, label: 'A' },
          { x: 6, y: 0, label: 'B' },
          { x: 6, y: 8, label: 'C' },
        ],
      },
      {
        variantId: '0912',
        points: [
          { x: 0, y: 0, label: 'A' },
          { x: 9, y: 0, label: 'B' },
          { x: 9, y: 12, label: 'C' },
        ],
      },
      {
        variantId: '51213',
        points: [
          { x: 0, y: 0, label: 'A' },
          { x: 5, y: 0, label: 'B' },
          { x: 5, y: 12, label: 'C' },
        ],
      },
      {
        variantId: '81517',
        points: [
          { x: 0, y: 0, label: 'A' },
          { x: 8, y: 0, label: 'B' },
          { x: 8, y: 15, label: 'C' },
        ],
      },
    ],
  },
  {
    id: 'ib_rectangle_perimeter_diagonal',
    curricula: ['IB'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'rectangle_perimeter_diagonal',
    diagramTemplate: 'rectangle_diagonal',
    values: [
      { variantId: '36213', width: 5, height: 13, perimeter: 36, diagonal: Math.sqrt(194) },
      { variantId: '40216', width: 8, height: 12, perimeter: 40, diagonal: Math.sqrt(208) },
      { variantId: '52218', width: 10, height: 16, perimeter: 52, diagonal: Math.sqrt(356) },
    ],
  },
  {
    id: 'ib_rectangle_area_diagonal',
    curricula: ['IB'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'rectangle_area_diagonal',
    diagramTemplate: 'rectangle_diagonal',
    values: [
      { variantId: '45213', width: 4, height: 13, area: 52, diagonal: Math.sqrt(185) },
      { variantId: '78412', width: 7, height: 12, area: 84, diagonal: Math.sqrt(193) },
      { variantId: '89612', width: 8, height: 12, area: 96, diagonal: Math.sqrt(208) },
    ],
  },
  {
    id: 'ib_show_right_triangle',
    curricula: ['IB'],
    grades: ['8', '9'],
    difficulties: ['Medium', 'Hard'],
    kind: 'show_right_triangle',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '51213', legAB: 5, legBC: 12, hypotenuse: 13 },
      { variantId: '72425', legAB: 7, legBC: 24, hypotenuse: 25 },
      { variantId: '81517', legAB: 8, legBC: 15, hypotenuse: 17 },
    ],
  },
  {
    id: 'ib_coordinate_distance_shifted',
    curricula: ['IB'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'coordinate_distance_shifted',
    diagramTemplate: 'coordinate_points',
    values: [
      {
        variantId: '23815',
        points: [
          { x: 2, y: 3, label: 'A' },
          { x: 8, y: 3, label: 'B' },
          { x: 8, y: 15, label: 'C' },
        ],
      },
      {
        variantId: '14211',
        points: [
          { x: 1, y: 4, label: 'A' },
          { x: 5, y: 4, label: 'B' },
          { x: 5, y: 13, label: 'C' },
        ],
      },
      {
        variantId: '37613',
        points: [
          { x: 3, y: 7, label: 'A' },
          { x: 10, y: 7, label: 'B' },
          { x: 10, y: 20, label: 'C' },
        ],
      },
    ],
  },
];

const HISTORY_KEY = 'math7-9:pythagoras-variant-history:v4';
const KIND_HISTORY_KEY = 'math7-9:pythagoras-kind-history:v1';
const DIFFICULTY_ORDER = { Easy: 0, Medium: 1, Hard: 2 };
const DIFFICULTY_KIND_PRIORITY = {
  Easy: ['direct_hypotenuse', 'rectangle_diagonal', 'square_diagonal', 'ladder_height'],
  Medium: ['direct_leg_ab', 'direct_leg_bc', 'square_side_from_diagonal', 'coordinate_distance', 'ladder_height'],
  Hard: [
    'rectangle_area_diagonal',
    'coordinate_distance_shifted',
    'direct_hypotenuse_surd',
    'square_side_from_diagonal',
    'show_right_triangle',
    'ladder_foot',
    'rectangle_perimeter_diagonal',
    'coordinate_distance',
    'ladder_height',
    'direct_leg_bc',
  ],
};
const KIND_COMPLEXITY = {
  direct_hypotenuse: 0,
  rectangle_diagonal: 0,
  square_diagonal: 0,
  ladder_height: 0,
  direct_leg_ab: 1,
  direct_leg_bc: 1,
  coordinate_distance: 1,
  square_side_from_diagonal: 2,
  show_right_triangle: 2,
  ladder_foot: 3,
  rectangle_perimeter_diagonal: 3,
  rectangle_area_diagonal: 4,
  coordinate_distance_shifted: 4,
  direct_hypotenuse_surd: 4,
};
const COMPLEXITY_WINDOW_BY_GRADE_AND_DIFFICULTY = {
  '6': { Easy: [0, 0], Medium: [1, 2], Hard: [2, 3] },
  '7': { Easy: [0, 0], Medium: [1, 2], Hard: [2, 3] },
  '8': { Easy: [0, 0], Medium: [1, 2], Hard: [4, 4] },
  '9': { Easy: [0, 0], Medium: [1, 2], Hard: [4, 4] },
};
const HARD_ADVANCED_KINDS = new Set([
  'rectangle_area_diagonal',
  'rectangle_perimeter_diagonal',
  'ladder_foot',
  'coordinate_distance_shifted',
  'direct_hypotenuse_surd',
  'show_right_triangle',
]);
const GRADE_ORDER = { '6': 6, '7': 7, '8': 8, '9': 9 };
const DEFAULT_UNIT = 'cm';

function isFinitePositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function toText(value) {
  return String(value ?? '').trim();
}

function normalizeGrade(value) {
  const grade = toText(value);
  return GRADE_ORDER[grade] ? grade : '7';
}

function normalizeDifficulty(value) {
  const difficulty = toText(value);
  const alias = {
    challenge: 'Hard',
    hard: 'Hard',
    easy: 'Easy',
    medium: 'Medium',
    beginner: 'Easy',
    intermediate: 'Medium',
    入门: 'Easy',
    进阶: 'Medium',
    挑战: 'Hard',
  };
  const mapped = alias[difficulty.toLowerCase()] ?? difficulty;
  return DIFFICULTY_ORDER[mapped] !== undefined ? mapped : 'Medium';
}

function normalizeCurriculum(value) {
  const curriculum = toText(value).toUpperCase();
  const alias = {
    GB: 'UK',
  };
  const mapped = alias[curriculum] ?? curriculum;
  return ['CN', 'US', 'UK', 'SG', 'IB'].includes(mapped) ? mapped : null;
}

function formatLength(value, unit = DEFAULT_UNIT) {
  return `${value} ${unit}`;
}

function formatSquareDiagonalLength(side, unit = DEFAULT_UNIT) {
  return `${side}√2 ${unit}`;
}

function formatSquareDiagonalLatex(side) {
  return `${side}\\sqrt{2}`;
}

function formatSimplifiedRadical(n) {
  if (!Number.isInteger(n) || n <= 0) return null;
  let outside = 1;
  let inside = n;
  for (let factor = 2; factor * factor <= inside; factor += 1) {
    while (inside % (factor * factor) === 0) {
      inside /= factor * factor;
      outside *= factor;
    }
  }
  if (inside === 1) return `${outside}`;
  if (outside === 1) return `√${inside}`;
  return `${outside}√${inside}`;
}

function formatCoordinateDistanceLabel(dx, dy, unit = DEFAULT_UNIT) {
  const squared = dx * dx + dy * dy;
  const radical = formatSimplifiedRadical(squared);
  if (radical) return `${radical} ${unit}`;
  const approx = Math.sqrt(squared);
  return `${+approx.toFixed(1)} ${unit}`;
}

function getComplexityWindow(grade, difficulty) {
  const gradeKey = normalizeGrade(grade);
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const byGrade = COMPLEXITY_WINDOW_BY_GRADE_AND_DIFFICULTY[gradeKey];
  if (byGrade && byGrade[normalizedDifficulty]) {
    return byGrade[normalizedDifficulty];
  }
  return COMPLEXITY_WINDOW_BY_GRADE_AND_DIFFICULTY['7'][normalizedDifficulty] ?? [1, 2];
}

function scenarioComplexity(kind) {
  return KIND_COMPLEXITY[kind] ?? 99;
}

function createHistoryKey({ curriculum, grade, difficulty }) {
  return `${HISTORY_KEY}:${curriculum ?? 'ANY'}:${normalizeGrade(grade)}:${normalizeDifficulty(difficulty)}`;
}

function canUseLocalStorage() {
  return typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
}

function readRecentVariantKeys(historyKey) {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = localStorage.getItem(historyKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value) => typeof value === 'string');
  } catch {
    return [];
  }
}

function writeRecentVariantKeys(historyKey, keys) {
  if (!canUseLocalStorage()) return;
  try {
    const prior = readRecentVariantKeys(historyKey);
    const merged = [...keys, ...prior].filter((key, index, list) => list.indexOf(key) === index);
    localStorage.setItem(historyKey, JSON.stringify(merged.slice(0, 24)));
  } catch {
    // Silent fallback. History is only a soft guard.
  }
}

function rngValue(randomSource) {
  if (typeof randomSource === 'function') {
    const value = Number(randomSource());
    if (Number.isFinite(value) && value >= 0 && value < 1) return value;
  }
  return Math.random();
}

function shuffle(values, randomSource) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rngValue(randomSource) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeRecentKindOrder(value) {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === 'string' && entry.trim());
  }
  if (value instanceof Set) {
    return Array.from(value).filter((entry) => typeof entry === 'string' && entry.trim());
  }
  return [];
}

function orderVariantsByDifficulty(variants, difficulty, randomSource, recentKindOrder = []) {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const priority = DIFFICULTY_KIND_PRIORITY[normalizedDifficulty] ?? [];
  const priorityIndex = new Map(priority.map((kind, index) => [kind, index]));
  const recentIndex = new Map(recentKindOrder.map((kind, index) => [kind, index]));
  const recentOrderSize = recentKindOrder.length;

  if (normalizedDifficulty === 'Hard') {
    return [...variants]
      .map((variant) => ({
        variant,
        kindRecency: recentIndex.has(variant.scenario.kind)
          ? 1 + (recentOrderSize - recentIndex.get(variant.scenario.kind))
          : 0,
        priority: priorityIndex.has(variant.scenario.kind)
          ? priorityIndex.get(variant.scenario.kind)
          : priority.length,
        tieBreaker: rngValue(randomSource),
      }))
      .sort((a, b) =>
        a.kindRecency - b.kindRecency ||
        a.priority - b.priority ||
        a.tieBreaker - b.tieBreaker
      )
      .map(({ variant }) => variant);
  }

  return [...variants]
    .map((variant) => ({
      variant,
      priority: priorityIndex.has(variant.scenario.kind)
        ? priorityIndex.get(variant.scenario.kind)
        : priority.length,
      kindRecency: recentIndex.has(variant.scenario.kind)
        ? 1 + (recentOrderSize - recentIndex.get(variant.scenario.kind))
        : 0,
      tieBreaker: rngValue(randomSource),
    }))
    .sort((a, b) =>
      a.kindRecency - b.kindRecency ||
      a.priority - b.priority ||
      a.tieBreaker - b.tieBreaker
    )
    .map(({ variant }) => variant);
}

function scenarioMatchesContext(scenario, { curriculum, grade, difficulty }) {
  const normalizedCurriculum = normalizeCurriculum(curriculum);
  const normalizedGrade = normalizeGrade(grade);
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const [minComplexity, maxComplexity] = getComplexityWindow(normalizedGrade, normalizedDifficulty);

  const curriculumOk =
    !normalizedCurriculum || scenario.curricula.includes(normalizedCurriculum);

  const gradeOk = scenario.grades.includes(normalizedGrade);
  const difficultyOk = scenario.difficulties.includes(normalizedDifficulty);
  const complexity = scenarioComplexity(scenario.kind);
  const complexityOk = complexity >= minComplexity && complexity <= maxComplexity;

  return curriculumOk && gradeOk && difficultyOk && complexityOk;
}

function getCandidateScenarios(context) {
  const filtered = PYTHAGORAS_SCENARIOS.filter((scenario) => scenarioMatchesContext(scenario, context));
  if (filtered.length > 0) return filtered;

  const normalizedCurriculum = normalizeCurriculum(context.curriculum);
  if (normalizedCurriculum) {
    const curriculumFallback = PYTHAGORAS_SCENARIOS.filter((scenario) => scenario.curricula.includes(normalizedCurriculum));
    if (curriculumFallback.length > 0) return curriculumFallback;
  }

  const gradeFallback = PYTHAGORAS_SCENARIOS.filter((scenario) => scenario.grades.includes(normalizeGrade(context.grade)));
  if (gradeFallback.length > 0) return gradeFallback;

  return PYTHAGORAS_SCENARIOS;
}

function getHardCandidateScenarios(context) {
  const allCandidates = getCandidateScenarios(context);
  const advanced = allCandidates.filter((scenario) => HARD_ADVANCED_KINDS.has(scenario.kind));
  return advanced.length > 0 ? advanced : allCandidates;
}

function getHardCandidateScenarioTiers(context) {
  const tiers = getCandidateScenarioTiers(context)
    .map((tier) => tier.filter((scenario) => HARD_ADVANCED_KINDS.has(scenario.kind)))
    .filter((tier) => tier.length > 0);

  return tiers.length > 0 ? tiers : getCandidateScenarioTiers(context);
}

function scenarioVariantKey(scenario, valueSet) {
  return `${scenario.id}:${valueSet.variantId}`;
}

function uniqueScenariosById(scenarios, seenIds = new Set()) {
  const unique = [];
  for (const scenario of scenarios) {
    if (!scenario || seenIds.has(scenario.id)) continue;
    seenIds.add(scenario.id);
    unique.push(scenario);
  }
  return unique;
}

function buildVariantPool(scenarios) {
  return scenarios.flatMap((scenario) =>
    scenario.values.map((valueSet) => ({
      key: scenarioVariantKey(scenario, valueSet),
      scenario,
      valueSet,
    }))
  );
}

function getCandidateScenarioTiers(context) {
  const tiers = [];
  const seenIds = new Set();
  const normalizedCurriculum = normalizeCurriculum(context.curriculum);
  const normalizedGrade = normalizeGrade(context.grade);
  const [minComplexity, maxComplexity] = getComplexityWindow(normalizedGrade, normalizeDifficulty(context.difficulty));
  const complexityOk = (scenario) => {
    const complexity = scenarioComplexity(scenario.kind);
    return complexity >= minComplexity && complexity <= maxComplexity;
  };

  const exact = uniqueScenariosById(
    PYTHAGORAS_SCENARIOS.filter((scenario) => scenarioMatchesContext(scenario, context)),
    seenIds
  );
  if (exact.length > 0) {
    tiers.push(exact);
  }

  if (normalizedCurriculum) {
    const curriculumFallback = uniqueScenariosById(
      PYTHAGORAS_SCENARIOS.filter((scenario) => scenario.curricula.includes(normalizedCurriculum) && complexityOk(scenario)),
      seenIds
    );
    if (curriculumFallback.length > 0) {
      tiers.push(curriculumFallback);
    }
  }

  const gradeFallback = uniqueScenariosById(
    PYTHAGORAS_SCENARIOS.filter((scenario) => scenario.grades.includes(normalizedGrade) && complexityOk(scenario)),
    seenIds
  );
  if (gradeFallback.length > 0) {
    tiers.push(gradeFallback);
  }

  const allFallback = uniqueScenariosById(PYTHAGORAS_SCENARIOS.filter((scenario) => complexityOk(scenario)), seenIds);
  if (allFallback.length > 0) {
    tiers.push(allFallback);
  }

  return tiers;
}

function pickVariants(variantPool, count, randomSource, recentVariantKeys, recentKindOrder, difficulty) {
  const fresh = variantPool.filter(
    (variant) => !recentVariantKeys.has(variant.key) && !recentKindOrder.includes(variant.scenario.kind)
  );
  const stale = variantPool.filter(
    (variant) => recentVariantKeys.has(variant.key) || recentKindOrder.includes(variant.scenario.kind)
  );
  const ordered = [
    ...orderVariantsByDifficulty(fresh, difficulty, randomSource, recentKindOrder),
    ...orderVariantsByDifficulty(stale, difficulty, randomSource, recentKindOrder),
  ];
  const selected = [];
  const usedKeys = new Set();
  const usedKinds = new Set();

  for (const variant of ordered) {
    if (selected.length >= count) break;
    if (usedKeys.has(variant.key)) continue;
    if (usedKinds.has(variant.scenario.kind)) continue;
    selected.push(variant);
    usedKeys.add(variant.key);
    usedKinds.add(variant.scenario.kind);
  }

  if (selected.length < count) {
    for (const variant of ordered) {
      if (selected.length >= count) break;
      if (usedKeys.has(variant.key)) continue;
      selected.push(variant);
      usedKeys.add(variant.key);
    }
  }

  return selected.slice(0, count);
}

function buildQuestionText(item, lang, context) {
  const zh = lang === 'zh';
  const unit = item.unit ?? DEFAULT_UNIT;

  if (zh) {
    if (item.kind === 'direct_hypotenuse') {
      return `在直角三角形 ABC 中，∠B = 90°，AB = ${formatLength(item.legAB, unit)}，BC = ${formatLength(item.legBC, unit)}。求 AC 的长度。`;
    }
    if (item.kind === 'direct_hypotenuse_surd') {
      return `在直角三角形 ABC 中，∠B = 90°，AB = ${formatLength(item.legAB, unit)}，BC = ${formatLength(item.legBC, unit)}。求 AC 的长度，并写成最简根式。`;
    }
    if (item.kind === 'direct_leg_ab') {
      return `在直角三角形 ABC 中，∠B = 90°，BC = ${formatLength(item.legBC, unit)}，AC = ${formatLength(item.hypotenuse, unit)}。求 AB 的长度。`;
    }
    if (item.kind === 'direct_leg_bc') {
      return `在直角三角形 ABC 中，∠B = 90°，AB = ${formatLength(item.legAB, unit)}，AC = ${formatLength(item.hypotenuse, unit)}。求 BC 的长度。`;
    }
    if (item.kind === 'rectangle_diagonal') {
      return `在长方形 ABCD 中，AB = ${formatLength(item.width, unit)}，BC = ${formatLength(item.height, unit)}。求对角线 AC 的长度。`;
    }
    if (item.kind === 'rectangle_perimeter_diagonal') {
      return `在长方形 ABCD 中，周长为 ${formatLength(item.perimeter, unit)}，且 AB = ${formatLength(item.width, unit)}。求对角线 AC 的长度。`;
    }
    if (item.kind === 'rectangle_area_diagonal') {
      return `在长方形 ABCD 中，AB = ${formatLength(item.width, unit)}，面积为 ${item.area} ${unit}²。求对角线 AC 的长度。`;
    }
    if (item.kind === 'square_diagonal') {
      return `在正方形 ABCD 中，AB = ${formatLength(item.side, unit)}。求对角线 AC 的长度。`;
    }
    if (item.kind === 'square_side_from_diagonal') {
      return `在正方形 ABCD 中，对角线 AC = $${formatSquareDiagonalLatex(item.side)}$ cm。求边 AB 的长度。`;
    }
    if (item.kind === 'show_right_triangle') {
      if (context.curriculum === 'UK') {
        return `证明三角形 ABC 在 B 点处是直角三角形。已知 AB = ${formatLength(item.legAB, unit)}，BC = ${formatLength(item.legBC, unit)}，AC = ${formatLength(item.hypotenuse, unit)}。`;
      }
      if (context.curriculum === 'US') {
        return `判断三角形 ABC 是否为直角三角形，并说明理由。已知 AB = ${formatLength(item.legAB, unit)}，BC = ${formatLength(item.legBC, unit)}，AC = ${formatLength(item.hypotenuse, unit)}。`;
      }
      return `已知三角形 ABC 的三边 AB = ${formatLength(item.legAB, unit)}，BC = ${formatLength(item.legBC, unit)}，AC = ${formatLength(item.hypotenuse, unit)}。判断它是否为直角三角形。`;
    }
    if (item.kind === 'ladder_height') {
      return `一把长度为 ${formatLength(item.length, unit)} 的梯子靠在墙上，梯脚离墙 ${formatLength(item.foot, unit)}。梯子能爬到墙上的多高？`;
    }
    if (item.kind === 'ladder_foot') {
      return `一把长度为 ${formatLength(item.length, unit)} 的梯子靠在墙上，梯子顶端离地 ${formatLength(item.height, unit)}。梯脚离墙多远？`;
    }
    if (item.kind === 'coordinate_distance') {
      return `在平面直角坐标系中，A(0, 0)，B(${item.bx}, 0)，C(${item.bx}, ${item.cy})。求 AC 的长度。`;
    }
    if (item.kind === 'coordinate_distance_shifted') {
      const [A, B, C] = item.points ?? [];
      return `在平面直角坐标系中，A(${A?.x}, ${A?.y})，B(${B?.x}, ${B?.y})，C(${C?.x}, ${C?.y})。求 AC 的长度。`;
    }
    return '请完成这道勾股定理题。';
  }

  if (item.kind === 'direct_hypotenuse') {
    if (zh) {
      return `ๅจ็ด่ง’ไธ่ง’ๅฝขABCไธญ๏ผโ B = 90ยฐ๏ผAB = ${formatLength(item.legAB, unit)}๏ผBC = ${formatLength(item.legBC, unit)}ใ€ๆฑ AC ็้•ฟๅบฆใ€`;
    }
    return `In right triangle ABC, angle B = 90ยฐ, AB = ${formatLength(item.legAB, unit)}, and BC = ${formatLength(item.legBC, unit)}. Find the length of AC.`;
  }

  if (item.kind === 'direct_hypotenuse_surd') {
    if (zh) {
      return `ๅจ็ด่ง’ไธ่ง’ๅฝขABCไธญ๏ผโ B = 90ยฐ๏ผAB = ${formatLength(item.legAB, unit)}๏ผBC = ${formatLength(item.legBC, unit)}ใ€ๆฑ AC ็้•ฟๅบฆ๏ผๅนถ็”จๆ€็ฎ€ๆ นๅผ่กจ็คบใ€`;
    }
    return `In right triangle ABC, angle B = 90ยฐ, AB = ${formatLength(item.legAB, unit)}, and BC = ${formatLength(item.legBC, unit)}. Find the length of AC in simplest surd form.`;
  }

  if (item.kind === 'direct_leg_ab') {
    if (zh) {
      return `ๅจ็ด่ง’ไธ่ง’ๅฝขABCไธญ๏ผโ B = 90ยฐ๏ผBC = ${formatLength(item.legBC, unit)}๏ผAC = ${formatLength(item.hypotenuse, unit)}ใ€ๆฑ AB ็้•ฟๅบฆใ€`;
    }
    return `In right triangle ABC, angle B = 90ยฐ, BC = ${formatLength(item.legBC, unit)}, and AC = ${formatLength(item.hypotenuse, unit)}. Find the length of AB.`;
  }

  if (item.kind === 'direct_leg_bc') {
    if (zh) {
      return `ๅจ็ด่ง’ไธ่ง’ๅฝขABCไธญ๏ผโ B = 90ยฐ๏ผAB = ${formatLength(item.legAB, unit)}๏ผAC = ${formatLength(item.hypotenuse, unit)}ใ€ๆฑ BC ็้•ฟๅบฆใ€`;
    }
    return `In right triangle ABC, angle B = 90ยฐ, AB = ${formatLength(item.legAB, unit)}, and AC = ${formatLength(item.hypotenuse, unit)}. Find the length of BC.`;
  }

  if (item.kind === 'rectangle_diagonal') {
    if (zh) {
      return `ๅจ้•ฟๆ–นๅฝขABCDไธญ๏ผAB = ${formatLength(item.width, unit)}๏ผBC = ${formatLength(item.height, unit)}ใ€ๆฑๅฏน่ง’็บฟ AC ็้•ฟๅบฆใ€`;
    }
    return `In rectangle ABCD, AB = ${formatLength(item.width, unit)} and BC = ${formatLength(item.height, unit)}. Find the length of diagonal AC.`;
  }

  if (item.kind === 'rectangle_perimeter_diagonal') {
    if (zh) {
      return `ๅจ้•ฟๆ–นๅฝขABCDไธญ๏ผๅฝูๅงๅฃฃๅทฑ ${formatLength(item.perimeter, unit)}๏ผAB = ${formatLength(item.width, unit)}ใ€ๆฑๅฏน่ง’็บฟ AC ็้•ฟๅบฆใ€`;
    }
    return `In rectangle ABCD, the perimeter is ${formatLength(item.perimeter, unit)} and AB = ${formatLength(item.width, unit)}. Find the length of diagonal AC.`;
  }

  if (item.kind === 'rectangle_area_diagonal') {
    if (zh) {
      return `ๅจ้•ฟๆ–นๅฝขABCDไธญ๏ผAB = ${formatLength(item.width, unit)}๏ผๅผๅ็ฒๅโพ ${item.area} ${unit}²ใ€ๆฑๅฏน่ง’็บฟ AC ็้•ฟๅบฆใ€`;
    }
    return `In rectangle ABCD, AB = ${formatLength(item.width, unit)} and the area is ${item.area} ${unit}². Find the length of diagonal AC.`;
  }

  if (item.kind === 'square_diagonal') {
    if (zh) {
      return `เน…ยเธเนโ€ขเธเนโ€“เธเน…เธเธABCDเนเธเธเนเธยเน…ยยเน…เธ—เธ AB = ${formatLength(item.side, unit)}เนโฌยเน…เธเธเนเธโ€เนเธเธ AC เนยยเนโ€ขเธเน…เธเธเนโฌย`;
    }
    return `In square ABCD, AB = ${formatLength(item.side, unit)}. Find the length of diagonal AC.`;
  }

  if (item.kind === 'square_side_from_diagonal') {
    if (zh) {
      return `เน…ยเธเนโ€ขเธเนโ€“เธเน…เธเธABCDเนเธเธเนเธยเน…เธ—ยเนเธย AC = ${formatLength(item.diagonal, unit)}เนโฌยเน…เธเธเนเธโ€เน…ยยเน…เธ—เธ AB เนยยเนโ€ขเธเน…เธเธเนโฌย`;
    }
    return `In square ABCD, diagonal AC = $${formatSquareDiagonalLatex(item.side)}$ cm. Find the length of side AB.`;
  }

  if (item.kind === 'show_right_triangle') {
    if (context.curriculum === 'UK') {
      return zh
        ? `่ฏๆไธ่ง’ๅฝขABCๅจ B ็นๆฏ็ด่ง’ไธ่ง’ๅฝขใ€ๅทฒ็ฅ AB = ${formatLength(item.legAB, unit)}๏ผBC = ${formatLength(item.legBC, unit)}๏ผAC = ${formatLength(item.hypotenuse, unit)}ใ€`
        : `Show that triangle ABC is right-angled at B. Given AB = ${formatLength(item.legAB, unit)}, BC = ${formatLength(item.legBC, unit)}, and AC = ${formatLength(item.hypotenuse, unit)}.`;
    }

    if (context.curriculum === 'US') {
      return zh
        ? `ๅคๆ–ญไธ่ง’ๅฝขABCๆฏๅฆไธบ็ด่ง’ไธ่ง’ๅฝข๏ผๅนถ่ฏดๆ็็”ฑใ€ๅทฒ็ฅ AB = ${formatLength(item.legAB, unit)}๏ผBC = ${formatLength(item.legBC, unit)}๏ผAC = ${formatLength(item.hypotenuse, unit)}ใ€`
        : `Decide whether triangle ABC is a right triangle, and explain your reasoning. Given AB = ${formatLength(item.legAB, unit)}, BC = ${formatLength(item.legBC, unit)}, and AC = ${formatLength(item.hypotenuse, unit)}.`;
    }

    return zh
      ? `ๅทฒ็ฅไธ่ง’ๅฝขABC็ไธ่พนๅๅซไธบ AB = ${formatLength(item.legAB, unit)}๏ผBC = ${formatLength(item.legBC, unit)}๏ผAC = ${formatLength(item.hypotenuse, unit)}ใ€ๅคๆ–ญๅฎๆฏๅฆไธบ็ด่ง’ไธ่ง’ๅฝขใ€`
      : `Given triangle ABC with AB = ${formatLength(item.legAB, unit)}, BC = ${formatLength(item.legBC, unit)}, and AC = ${formatLength(item.hypotenuse, unit)}, determine whether it is a right triangle.`;
  }

  if (item.kind === 'ladder_height') {
    if (zh) {
      return `ไธ€ๆ้•ฟๅบฆไธบ ${formatLength(item.length, unit)} ็ๆขฏๅญ้ ๅจๅขไธ๏ผๆขฏ่็ฆปๅข ${formatLength(item.foot, unit)}ใ€ๆขฏๅญ้กถ็ซฏๅฐๅฐ้ข็้ซๅบฆๆฏๅคๅฐ‘๏ผ`;
    }
    return `A ladder of length ${formatLength(item.length, unit)} leans against a wall. The foot of the ladder is ${formatLength(item.foot, unit)} from the wall. How high up the wall does it reach?`;
  }

  if (item.kind === 'ladder_foot') {
    if (zh) {
      return `ไธ€ๆ้•ฟๅบฆไธบ ${formatLength(item.length, unit)} ็ๆขฏๅญ้ ๅจๅขไธ๏ผ梯子顶端离地 ${formatLength(item.height, unit)}。梯脚离墙多远？`;
    }
    return `A ladder of length ${formatLength(item.length, unit)} leans against a wall. The top of the ladder is ${formatLength(item.height, unit)} above the ground. How far is the foot of the ladder from the wall?`;
  }

  if (item.kind === 'coordinate_distance') {
    if (zh) {
      return `ๅจๅนณ้ข็ด่ง’ๅๆ ็ณปไธญ๏ผA(0, 0)๏ผB(${item.bx}, 0)๏ผC(${item.bx}, ${item.cy})ใ€ๆฑ AC ็้•ฟๅบฆใ€`;
    }
    return `On a coordinate grid, A(0, 0), B(${item.bx}, 0), and C(${item.bx}, ${item.cy}) are plotted. Find the length of AC.`;
  }

  if (item.kind === 'coordinate_distance_shifted') {
    const [A, B, C] = item.points ?? [];
    if (zh) {
      return `ๅจๅนณ้ข็ด่ง’ๅๆ ็ณปไธญ๏ผA(${A?.x}, ${A?.y})๏ผB(${B?.x}, ${B?.y})๏ผC(${C?.x}, ${C?.y})ใ€ๆฑ AC ็้•ฟๅบฆใ€`;
    }
    return `On a coordinate grid, A(${A?.x}, ${A?.y}), B(${B?.x}, ${B?.y}), and C(${C?.x}, ${C?.y}) are plotted. Find the length of AC.`;
  }

  return zh ? '่ฏท่งฃ็ญ”่ฟไธชๅพ่กๅฎ็้ขใ€' : 'Solve this Pythagorean theorem question.';
}

function buildDiagramSpec(item) {
  if (item.kind === 'rectangle_area_diagonal') {
    return {
      template: 'rectangle_diagonal',
      width: item.width,
      height: item.height,
      labels: { A: 'A', B: 'B', C: 'C', D: 'D' },
      label_AB: formatLength(item.width, item.unit),
      label_BC: '?',
      label_AC: '?',
      label_area: `${item.area} ${item.unit}²`,
    };
  }

  if (item.diagramTemplate === 'ladder') {
    return {
      template: 'ladder',
      length: item.length,
      foot_dist: item.foot,
      label_ladder: formatLength(item.length, item.unit),
      label_foot: formatLength(item.foot, item.unit),
      label_wall: formatLength(item.height, item.unit),
      label_top: 'A',
      label_foot_pt: 'B',
      label_corner: 'O',
    };
  }

  if (item.diagramTemplate === 'rectangle_diagonal') {
    return {
      template: 'rectangle_diagonal',
      width: item.width,
      height: item.height,
      labels: { A: 'A', B: 'B', C: 'C', D: 'D' },
      label_AB: formatLength(item.width, item.unit),
      label_BC: formatLength(item.height, item.unit),
      label_AC: '?',
    };
  }

  if (item.kind === 'rectangle_perimeter_diagonal') {
    return {
      template: 'rectangle_diagonal',
      width: item.width,
      height: item.height,
      labels: { A: 'A', B: 'B', C: 'C', D: 'D' },
      label_AB: formatLength(item.width, item.unit),
      label_BC: '?',
      label_AC: '?',
      label_perimeter: formatLength(item.perimeter, item.unit),
    };
  }

  if (item.diagramTemplate === 'square_diagonal') {
    return {
      template: 'square_diagonal',
      side: item.side,
      width: item.side,
      height: item.side,
      labels: { A: 'A', B: 'B', C: 'C', D: 'D' },
      label_AB: item.kind === 'square_side_from_diagonal' ? '?' : formatLength(item.side, item.unit),
      label_BC: formatLength(item.side, item.unit),
      label_AC: item.kind === 'square_side_from_diagonal' ? formatSquareDiagonalLength(item.side, item.unit) : '?',
    };
  }

  if (item.kind === 'ladder_foot') {
    return {
      template: 'ladder',
      length: item.length,
      foot_dist: item.foot,
      label_ladder: formatLength(item.length, item.unit),
      label_foot: '?',
      label_wall: formatLength(item.height, item.unit),
      label_top: 'A',
      label_foot_pt: 'B',
      label_corner: 'O',
    };
  }

  if (item.diagramTemplate === 'coordinate_points') {
    const points = item.points ?? [];
    const A = points[0];
    const B = points[1];
    const C = points[2];
    const abDx = Number.isFinite(A?.x) && Number.isFinite(B?.x) ? Math.abs(B.x - A.x) : null;
    const abDy = Number.isFinite(A?.y) && Number.isFinite(B?.y) ? Math.abs(B.y - A.y) : null;
    const bcDx = Number.isFinite(B?.x) && Number.isFinite(C?.x) ? Math.abs(C.x - B.x) : null;
    const bcDy = Number.isFinite(B?.y) && Number.isFinite(C?.y) ? Math.abs(C.y - B.y) : null;
    const acDx = Number.isFinite(A?.x) && Number.isFinite(C?.x) ? Math.abs(C.x - A.x) : null;
    const acDy = Number.isFinite(A?.y) && Number.isFinite(C?.y) ? Math.abs(C.y - A.y) : null;
    return {
      template: 'coordinate_points',
      axes: true,
      points: points.map((point) => ({ ...point })),
      segments: [
        { from: 'A', to: 'B', label: formatLength(item.ab ?? item.width, item.unit) },
        { from: 'B', to: 'C', label: formatLength(item.bc ?? item.height, item.unit) },
        {
          from: 'A',
          to: 'C',
          label:
            item.kind === 'coordinate_distance' || item.kind === 'rectangle_diagonal'
              ? '?'
              : (acDx !== null && acDy !== null
                  ? formatCoordinateDistanceLabel(acDx, acDy, item.unit)
                  : formatLength(item.ac, item.unit)),
        },
      ],
    };
  }

  if (item.kind === 'coordinate_distance_shifted') {
    const points = item.points ?? [];
    const A = points[0];
    const B = points[1];
    const C = points[2];
    const acDx = Number.isFinite(A?.x) && Number.isFinite(C?.x) ? Math.abs(C.x - A.x) : null;
    const acDy = Number.isFinite(A?.y) && Number.isFinite(C?.y) ? Math.abs(C.y - A.y) : null;
    return {
      template: 'coordinate_points',
      axes: true,
      points: points.map((point) => ({ ...point })),
      segments: [
        { from: 'A', to: 'B', label: formatLength(item.ab, item.unit) },
        { from: 'B', to: 'C', label: formatLength(item.bc, item.unit) },
        {
          from: 'A',
          to: 'C',
          label: acDx !== null && acDy !== null ? formatCoordinateDistanceLabel(acDx, acDy, item.unit) : '?',
        },
      ],
    };
  }

  const baseSpec = {
    template: 'right_triangle',
    leg_h: item.legBC,
    leg_v: item.legAB,
    labels: { A: 'A', B: 'B', C: 'C' },
    label_AB: formatLength(item.legAB, item.unit),
    label_BC: formatLength(item.legBC, item.unit),
    label_AC: formatLength(item.hypotenuse, item.unit),
  };

  if (item.kind === 'direct_hypotenuse' || item.kind === 'direct_hypotenuse_surd') {
    baseSpec.label_AC = '?';
  } else if (item.kind === 'direct_leg_ab') {
    baseSpec.label_AB = '?';
  } else if (item.kind === 'direct_leg_bc') {
    baseSpec.label_BC = '?';
  } else if (item.kind === 'show_right_triangle') {
    baseSpec.label_AB = formatLength(item.legAB, item.unit);
    baseSpec.label_BC = formatLength(item.legBC, item.unit);
    baseSpec.label_AC = formatLength(item.hypotenuse, item.unit);
  }

  return baseSpec;
}

function computeDirectHypotenuseAnswer(item) {
  return Math.sqrt(item.legAB ** 2 + item.legBC ** 2);
}

function validateScenarioItem(item) {
  const issues = [];

  if (!item || typeof item !== 'object') {
    return ['item must be an object'];
  }

  if (item.diagramTemplate === 'right_triangle') {
    if (!isFinitePositiveNumber(item.legAB)) issues.push('legAB must be a positive finite number');
    if (!isFinitePositiveNumber(item.legBC)) issues.push('legBC must be a positive finite number');
    if (!isFinitePositiveNumber(item.hypotenuse)) issues.push('hypotenuse must be a positive finite number');
    if (issues.length === 0) {
      const expected = computeDirectHypotenuseAnswer(item);
      if (Math.abs(expected - item.hypotenuse) > 1e-9 && item.kind !== 'direct_hypotenuse_surd') {
        issues.push('side lengths do not satisfy the Pythagorean theorem');
      }
    }
  }

  if (item.diagramTemplate === 'ladder') {
    if (!isFinitePositiveNumber(item.length)) issues.push('length must be a positive finite number');
    if (!isFinitePositiveNumber(item.foot)) issues.push('foot must be a positive finite number');
    if (!isFinitePositiveNumber(item.height)) issues.push('height must be a positive finite number');
    if (issues.length === 0 && item.length <= item.foot) {
      issues.push('ladder length must be greater than the foot distance');
    }
    if (issues.length === 0) {
      const expected = Math.sqrt(item.length ** 2 - item.foot ** 2);
      if (Math.abs(expected - item.height) > 1e-9) {
        issues.push('ladder values do not satisfy the Pythagorean theorem');
      }
    }
  }

  if (item.kind === 'ladder_foot') {
    if (!isFinitePositiveNumber(item.length)) issues.push('length must be a positive finite number');
    if (!isFinitePositiveNumber(item.height)) issues.push('height must be a positive finite number');
    if (!isFinitePositiveNumber(item.foot)) issues.push('foot must be a positive finite number');
    if (issues.length === 0 && item.length <= item.height) {
      issues.push('ladder length must be greater than the wall height');
    }
    if (issues.length === 0) {
      const expected = Math.sqrt(item.length ** 2 - item.height ** 2);
      if (Math.abs(expected - item.foot) > 1e-9) {
        issues.push('ladder foot values do not satisfy the Pythagorean theorem');
      }
    }
  }

  if (item.diagramTemplate === 'rectangle_diagonal') {
    if (!isFinitePositiveNumber(item.width)) issues.push('width must be a positive finite number');
    if (!isFinitePositiveNumber(item.height)) issues.push('height must be a positive finite number');
  }

  if (item.kind === 'rectangle_perimeter_diagonal') {
    if (!isFinitePositiveNumber(item.width)) issues.push('width must be a positive finite number');
    if (!isFinitePositiveNumber(item.height)) issues.push('height must be a positive finite number');
    if (!isFinitePositiveNumber(item.perimeter)) issues.push('perimeter must be a positive finite number');
    if (issues.length === 0) {
      const expectedPerimeter = 2 * (item.width + item.height);
      if (Math.abs(expectedPerimeter - item.perimeter) > 1e-9) {
        issues.push('rectangle perimeter values do not match the side lengths');
      }
    }
  }

  if (item.kind === 'rectangle_area_diagonal') {
    if (!isFinitePositiveNumber(item.width)) issues.push('width must be a positive finite number');
    if (!isFinitePositiveNumber(item.height)) issues.push('height must be a positive finite number');
    if (!isFinitePositiveNumber(item.area)) issues.push('area must be a positive finite number');
    if (issues.length === 0) {
      const expectedArea = item.width * item.height;
      if (Math.abs(expectedArea - item.area) > 1e-9) {
        issues.push('rectangle area values do not match the side lengths');
      }
    }
  }

  if (item.diagramTemplate === 'square_diagonal') {
    if (!isFinitePositiveNumber(item.side)) issues.push('side must be a positive finite number');
    if (!isFinitePositiveNumber(item.diagonal)) issues.push('diagonal must be a positive finite number');
    if (issues.length === 0) {
      const expected = item.side * Math.SQRT2;
      if (Math.abs(expected - item.diagonal) > 1e-9) {
        issues.push('square values do not satisfy the Pythagorean theorem');
      }
    }
  }

  if (item.diagramTemplate === 'coordinate_points') {
    if (!Array.isArray(item.points) || item.points.length < 3) {
      issues.push('coordinate_points requires three points');
    } else {
      const [A, B, C] = item.points;
      const pointsValid = [A, B, C].every((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
      if (!pointsValid) {
        issues.push('coordinate_points contains invalid point coordinates');
      } else {
        const ab = Math.hypot(B.x - A.x, B.y - A.y);
        const bc = Math.hypot(C.x - B.x, C.y - B.y);
        const ac = Math.hypot(C.x - A.x, C.y - A.y);
        if (Math.abs((ab ** 2) + (bc ** 2) - (ac ** 2)) > 1e-9) {
          issues.push('coordinate points do not form a right triangle');
        }
      }
    }
  }

  if (item.kind === 'coordinate_distance_shifted') {
    if (!Array.isArray(item.points) || item.points.length < 3) {
      issues.push('coordinate_distance_shifted requires three points');
    } else {
      const [A, B, C] = item.points;
      const pointsValid = [A, B, C].every((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
      if (!pointsValid) {
        issues.push('coordinate_distance_shifted contains invalid point coordinates');
      } else {
        const ab = Math.hypot(B.x - A.x, B.y - A.y);
        const bc = Math.hypot(C.x - B.x, C.y - B.y);
        const ac = Math.hypot(C.x - A.x, C.y - A.y);
        if (Math.abs((ab ** 2) + (bc ** 2) - (ac ** 2)) > 1e-9) {
          issues.push('shifted coordinate points do not form a right triangle');
        }
      }
    }
  }

  return issues;
}

function validateRenderedScenarioItem(item, rendered) {
  const issues = validateScenarioItem(item);
  const expectedSpec = JSON.stringify(buildDiagramSpec(item));

  if (!rendered.includes(expectedSpec)) {
    issues.push('rendered diagram block does not match the expected spec');
  }

  if (item.kind === 'direct_hypotenuse' && !rendered.includes('AC ็้•ฟๅบฆ') && !rendered.includes('Find the length of AC') && !rendered.includes('在直角三角形 ABC')) {
    issues.push('hypotenuse question text is missing the expected target');
  }

  if (item.kind === 'direct_leg_ab' && !rendered.includes('AB ็้•ฟๅบฆ') && !rendered.includes('Find the length of AB') && !rendered.includes('在直角三角形 ABC')) {
    issues.push('AB question text is missing the expected target');
  }

  if (item.kind === 'direct_leg_bc' && !rendered.includes('BC ็้•ฟๅบฆ') && !rendered.includes('Find the length of BC') && !rendered.includes('在直角三角形 ABC')) {
    issues.push('BC question text is missing the expected target');
  }

  if (item.kind === 'ladder_height' && !rendered.includes('ladder') && !rendered.includes('梯子')) {
    issues.push('ladder question text is missing ladder wording');
  }

  if (item.kind === 'coordinate_distance' && !rendered.includes('coordinate grid') && !rendered.includes('平面直角坐标系')) {
    issues.push('coordinate question text is missing coordinate wording');
  }

  if (item.kind === 'coordinate_distance_shifted' && !rendered.includes('coordinate grid') && !rendered.includes('平面直角坐标系')) {
    issues.push('shifted coordinate question text is missing coordinate wording');
  }

  if (item.kind === 'rectangle_diagonal' && !rendered.includes('diagonal AC') && !rendered.includes('对角线 AC')) {
    issues.push('rectangle diagonal question text is missing diagonal wording');
  }

  if (item.kind === 'rectangle_perimeter_diagonal' && !rendered.includes('perimeter') && !rendered.includes('周长')) {
    issues.push('rectangle perimeter question text is missing perimeter wording');
  }

  if (item.kind === 'rectangle_area_diagonal' && !rendered.includes('area') && !rendered.includes('面积')) {
    issues.push('rectangle area question text is missing area wording');
  }

  if (item.kind === 'square_diagonal' && !rendered.includes('square ABCD') && !rendered.includes('diagonal AC') && !rendered.includes('在正方形 ABCD')) {
    issues.push('square diagonal question text is missing square wording');
  }

  if (item.kind === 'square_side_from_diagonal' && !rendered.includes('side AB') && !rendered.includes('diagonal AC') && !rendered.includes('在正方形 ABCD')) {
    issues.push('square side-from-diagonal question text is missing side wording');
  }

  if (item.kind === 'ladder_foot' && !rendered.includes('How far is the foot of the ladder from the wall') && !rendered.includes('梯脚离墙多远')) {
    issues.push('ladder-foot question text is missing inverse wording');
  }

  return issues;
}

function renderScenarioItem(item, index, lang, context) {
  const question = buildQuestionText(item, lang, context);
  const diagram = JSON.stringify(buildDiagramSpec(item));
  return `${index + 1}. ${question}\n\n\`\`\`math-diagram\n${diagram}\n\`\`\``;
}

export function isPythagorasConcept(conceptId = '', conceptTitle = '', conceptDesc = '') {
  const text = `${conceptId} ${conceptTitle} ${conceptDesc}`.toLowerCase();
  return text.includes('pythagoras') || text.includes('ๅพ่ก') || text.includes('pythagorean');
}

export function buildPythagorasExerciseItems(count, options = {}) {
  const {
    lang = 'zh',
    curriculum = null,
    grade = '7',
    difficulty = 'Medium',
    random = Math.random,
    recentVariantKeys = null,
    recentKindKeys = null,
    persistHistory = true,
  } = options;

  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const context = {
    curriculum: normalizeCurriculum(curriculum),
    grade: normalizeGrade(grade),
    difficulty: normalizeDifficulty(difficulty),
  };

  const historyKey = createHistoryKey(context);
  const kindHistoryKey = KIND_HISTORY_KEY;
  const recentKeys = recentVariantKeys ?? (persistHistory ? new Set(readRecentVariantKeys(historyKey)) : new Set());
  const recentKindOrder = normalizeRecentKindOrder(
    recentKindKeys ?? (persistHistory ? readRecentVariantKeys(kindHistoryKey) : [])
  );
  const scenarioTiers = context.difficulty === 'Hard'
    ? getHardCandidateScenarioTiers(context)
    : getCandidateScenarioTiers(context);
  const selectedVariants = [];
  const usedKeys = new Set();
  const usedKinds = new Set();

  const appendSelectedVariants = (variantPool, remainingCount) => {
    if (remainingCount <= 0 || variantPool.length === 0) {
      return;
    }

    const preferredPool = variantPool.filter((variant) => !usedKinds.has(variant.scenario.kind));
    const poolToUse = preferredPool.length > 0 ? preferredPool : variantPool;
    const picked = pickVariants(poolToUse, remainingCount, random, recentKeys, recentKindOrder, context.difficulty);

    for (const variant of picked) {
      if (selectedVariants.length >= safeCount) break;
      if (usedKeys.has(variant.key)) continue;
      selectedVariants.push(variant);
      usedKeys.add(variant.key);
      usedKinds.add(variant.scenario.kind);
    }
  };

  for (const tier of scenarioTiers) {
    if (selectedVariants.length >= safeCount) break;
    const tierPool = buildVariantPool(tier).filter((variant) => !usedKeys.has(variant.key));
    appendSelectedVariants(tierPool, safeCount - selectedVariants.length);
  }

  if (selectedVariants.length < safeCount) {
    const allScenarios = scenarioTiers.flat();
    const fallbackPool = buildVariantPool(allScenarios).filter((variant) => !usedKeys.has(variant.key));
    appendSelectedVariants(fallbackPool, safeCount - selectedVariants.length);
  }

  const items = selectedVariants.map(({ scenario, valueSet, key }) => {
    const unit = scenario.unit ?? DEFAULT_UNIT;
    const item = {
      id: key,
      curriculum: context.curriculum,
      grade: context.grade,
      difficulty: context.difficulty,
      lang,
      unit,
      kind: scenario.kind,
      diagramTemplate: scenario.diagramTemplate,
      ...valueSet,
    };

    if (item.diagramTemplate === 'coordinate_points') {
      const points = item.points ?? [];
      item.ax = points[0].x;
      item.ay = points[0].y;
      item.bx = points[1].x;
      item.by = points[1].y;
      item.cx = points[2].x;
      item.cy = points[2].y;
      item.ab = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
      item.bc = Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y);
      item.ac = Math.hypot(points[2].x - points[0].x, points[2].y - points[0].y);
    }

    if (item.diagramTemplate === 'rectangle_diagonal') {
      item.diagonal = Math.hypot(item.width, item.height);
    }

    if (item.kind === 'rectangle_perimeter_diagonal') {
      item.diagonal = Math.hypot(item.width, item.height);
    }

    if (item.diagramTemplate === 'square_diagonal') {
      item.width = item.side;
      item.height = item.side;
      item.diagonal = item.diagonal ?? (item.side * Math.SQRT2);
    }

    if (item.kind === 'ladder_foot') {
      item.foot = item.foot ?? Math.sqrt(item.length ** 2 - item.height ** 2);
    }

    if (item.kind === 'coordinate_distance_shifted') {
      const points = item.points ?? [];
      item.ax = points[0].x;
      item.ay = points[0].y;
      item.bx = points[1].x;
      item.by = points[1].y;
      item.cx = points[2].x;
      item.cy = points[2].y;
      item.ab = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
      item.bc = Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y);
      item.ac = Math.hypot(points[2].x - points[0].x, points[2].y - points[0].y);
    }

    validateScenarioItem(item).forEach((issue) => {
      if (issue) {
        throw new Error(`Invalid Pythagoras scenario ${item.id}: ${issue}`);
      }
    });

    return item;
  });

  if (persistHistory) {
    writeRecentVariantKeys(historyKey, items.map((item) => item.id));
    writeRecentVariantKeys(kindHistoryKey, items.map((item) => item.kind));
  }

  return items;
}

export function validatePythagorasExerciseItems(items) {
  const issues = [];
  if (!Array.isArray(items) || items.length === 0) {
    return ['items must be a non-empty array'];
  }

  items.forEach((item, index) => {
    const itemIssues = validateScenarioItem(item);
    itemIssues.forEach((issue) => issues.push(`item ${index + 1}: ${issue}`));
  });

  return issues;
}

export function buildPythagorasExerciseBatch(options = {}) {
  const items = buildPythagorasExerciseItems(options.count ?? 0, options);
  const issues = validatePythagorasExerciseItems(items);
  if (issues.length > 0) {
    throw new Error(`Invalid Pythagoras exercise batch: ${issues.join('; ')}`);
  }

  const rendered = items.map((item, index) => renderScenarioItem(item, index, options.lang ?? 'zh', options));
  const renderedIssues = items.flatMap((item, index) => validateRenderedScenarioItem(item, rendered[index]));
  if (renderedIssues.length > 0) {
    throw new Error(`Pythagoras render validation failed: ${renderedIssues.join('; ')}`);
  }

  return rendered.join('\n\n');
}



