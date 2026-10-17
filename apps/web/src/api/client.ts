import type {
  GuideResponseDto,
  LatLngLiteral,
  PointArrivalResponseDto,
  PointDto,
  RouteDto,
  TransportDto,
} from '@livecity/shared';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export const apiClient = {
  getPoints: () => request<PointDto[]>('/points'),

  upsertPointFromGooglePlace: (payload: {
    googlePlaceId: string;
    title: string;
    lat: number;
    lng: number;
  }) =>
    request<{ point: PointDto }>('/points/from-google-place', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getRoutes: () => request<RouteDto[]>('/routes'),

  createNode: (payload: {
    start: string;
    end: string;
    total: number;
    encodedPolyline?: string;
  }) =>
    request<{ node: { _id: string; total: number } }>('/nodes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  createRoute: (payload: {
    title: string;
    start: string;
    end: string;
    nodes: Array<{
      node: string;
      total: number;
      start: string;
      end: string;
      encodedPolyline?: string;
    }>;
    points: string[];
    total: number;
  }) =>
    request<{ route: RouteDto }>('/routes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getTransports: () => request<TransportDto[]>('/transport'),

  getPointArrival: (pointId: string) =>
    request<PointArrivalResponseDto>(`/service/arrival/${pointId}`),

  findPersonalGuide: (start: LatLngLiteral, end: LatLngLiteral) =>
    request<GuideResponseDto>('/service/guide', {
      method: 'POST',
      body: JSON.stringify({ start, end }),
    }),
};
