export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface PointDto {
  _id: string;
  title: string;
  lat: number;
  lng: number;
  /**
   * Optional Google Maps Place ID when stop is linked directly to a Google Maps transit stop POI
   */
  googlePlaceId?: string;
  routes: string[];
}

export interface RouteNodeSummaryDto {
  node: string;
  total: number;
  start: string;
  end: string;
  encodedPolyline?: string;
}

export interface RouteDto {
  _id: string;
  title: string;
  start: string;
  end: string;
  nodes: RouteNodeSummaryDto[];
  points: string[];
  total: number;
}

export interface TransportStopRefDto {
  _id: string;
  title: string;
  lat: number;
  lng: number;
}

export interface TransportDto {
  _id: string;
  lat: number;
  lng: number;
  route?: string;
  distance?: number;
  current?: TransportStopRefDto;
  next?: TransportStopRefDto;
}

export interface RouteArrivalItemDto {
  status: 'OK' | 'NOTRANS' | 'NOTFOUND';
  route: string;
  title?: string;
  distance?: number;
  time?: number;
}

export interface PointArrivalResponseDto {
  pointId: string;
  routes: RouteArrivalItemDto[];
}

export interface GuideStepDto {
  type: 'TO' | 'BUS' | 'FROM';
  route: RouteDto;
  start: string | null;
  end: string | null;
  total: number;
}

export interface GuideResultDto {
  type: 'ONE';
  steps: GuideStepDto[];
  total: number;
}

export interface GuideResponseDto {
  status: 'OK' | 'ERROR';
  result: GuideResultDto | null;
  error?: string;
}
