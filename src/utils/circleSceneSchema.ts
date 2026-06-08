// src/utils/circleSceneSchema.ts

export interface CircleScenePayload {
  template: string;
  circles?: any[];
  points?: any[];
  segments?: any[];
  labels?: any[];
  [key: string]: any;
}

export function coerceCircleScenePayload(data: any): CircleScenePayload {
  if (!data || typeof data !== 'object') return { template: 'circle_scene' };
  return {
    template: data.template ?? 'circle_scene',
    circles:  Array.isArray(data.circles)  ? data.circles  : [],
    points:   Array.isArray(data.points)   ? data.points   : [],
    segments: Array.isArray(data.segments) ? data.segments : [],
    labels:   Array.isArray(data.labels)   ? data.labels   : [],
    ...data,
  };
}

export function normalizeCircleScene(data: any): CircleScenePayload {
  const payload = coerceCircleScenePayload(data);
  // Ensure all circles have required fields
  payload.circles = (payload.circles ?? []).map((c: any) => ({
    cx: c.cx ?? c.x ?? 0,
    cy: c.cy ?? c.y ?? 0,
    r:  c.r  ?? c.radius ?? 1,
    ...c,
  }));
  return payload;
}

export function validateCircleScene(data: any): string | null {
  if (!data || typeof data !== 'object') return 'Invalid circle scene data';
  if (!Array.isArray(data.circles) && data.circles !== undefined) return 'circles must be an array';
  return null;
}
