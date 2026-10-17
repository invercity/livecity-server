import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  Marker,
  InfoWindow,
  useMap,
  useMapsLibrary,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import type {
  GuideResponseDto,
  LatLngLiteral,
  PointArrivalResponseDto,
  PointDto,
  RouteDto,
  TransportDto,
} from '@livecity/shared';
import { apiClient } from './api/client';

type EditorMode = 'VIEW' | 'ROUTE_BUILDER' | 'GUIDE';

const DEFAULT_CENTER: LatLngLiteral = {
  lat: Number(import.meta.env.VITE_DEFAULT_LAT ?? 51.4982),
  lng: Number(import.meta.env.VITE_DEFAULT_LNG ?? 31.28935),
};

export function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
  const [mode, setMode] = useState<EditorMode>('VIEW');
  const [points, setPoints] = useState<PointDto[]>([]);
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [transports, setTransports] = useState<TransportDto[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('ALL');

  const [activePoint, setActivePoint] = useState<PointDto | null>(null);
  const [arrivalInfo, setArrivalInfo] =
    useState<PointArrivalResponseDto | null>(null);

  const [draftRouteTitle, setDraftRouteTitle] = useState('');
  const [draftStops, setDraftStops] = useState<PointDto[]>([]);

  const [guideStart, setGuideStart] = useState<LatLngLiteral | null>(null);
  const [guideEnd, setGuideEnd] = useState<LatLngLiteral | null>(null);
  const [guideResult, setGuideResult] = useState<GuideResponseDto | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.getPoints(),
      apiClient.getRoutes(),
      apiClient.getTransports(),
    ])
      .then(([pts, rts, trs]) => {
        setPoints(pts);
        setRoutes(rts);
        setTransports(trs);
      })
      .catch((err) => {
        console.error(err);
      });

    // Native browser Server-Sent Events (EventSource) with built-in auto-reconnect
    const eventSource = new EventSource('/api/transport/stream');

    eventSource.addEventListener('transport:updated', (event: MessageEvent) => {
      const updated = JSON.parse(event.data) as TransportDto;
      setTransports((prev) => {
        const idx = prev.findIndex((t) => t._id === updated._id);
        if (idx === -1) return [...prev, updated];
        const next = [...prev];
        next[idx] = updated;
        return next;
      });
    });

    eventSource.addEventListener('transport:removed', (event: MessageEvent) => {
      const { _id } = JSON.parse(event.data) as { _id: string };
      setTransports((prev) => prev.filter((t) => t._id !== _id));
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const handleSelectStop = async (point: PointDto) => {
    if (mode === 'ROUTE_BUILDER') {
      setDraftStops((prev) => [...prev, point]);
      setStatusMessage(`Додано зупинку до маршруту: ${point.title}`);
      return;
    }

    setActivePoint(point);
    try {
      const arrival = await apiClient.getPointArrival(point._id);
      setArrivalInfo(arrival);
    } catch {
      setArrivalInfo(null);
    }
  };

  const handleSaveDraftRoute = async () => {
    if (!draftRouteTitle.trim() || draftStops.length < 2) {
      setStatusMessage('Вкажіть назву маршруту та оберіть щонайменше 2 зупинки');
      return;
    }

    try {
      const createdNodes: Array<{
        node: string;
        total: number;
        start: string;
        end: string;
      }> = [];
      let totalDistance = 0;

      for (let i = 0; i < draftStops.length - 1; i++) {
        const from = draftStops[i];
        const to = draftStops[i + 1];
        const approxMeters = Math.round(
          Math.hypot(to.lat - from.lat, to.lng - from.lng) * 111_000,
        );
        const { node } = await apiClient.createNode({
          start: from._id,
          end: to._id,
          total: approxMeters,
        });
        totalDistance += approxMeters;
        createdNodes.push({
          node: node._id,
          total: approxMeters,
          start: JSON.stringify({ lat: from.lat, lng: from.lng }),
          end: JSON.stringify({ lat: to.lat, lng: to.lng }),
        });
      }

      const { route } = await apiClient.createRoute({
        title: draftRouteTitle.trim(),
        start: draftStops[0]._id,
        end: draftStops[draftStops.length - 1]._id,
        nodes: createdNodes,
        points: draftStops.map((s) => s._id),
        total: totalDistance,
      });

      setRoutes((prev) => [...prev, route]);
      setDraftRouteTitle('');
      setDraftStops([]);
      setStatusMessage(`Маршрут "${route.title}" успішно збережено!`);
    } catch (err) {
      setStatusMessage(`Помилка збереження маршруту: ${(err as Error).message}`);
    }
  };

  const visibleTransports =
    selectedRouteId === 'ALL'
      ? transports
      : transports.filter((t) => t.route === selectedRouteId);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <strong>Livecity Next</strong>
          <span className="badge">
            Зупинок: {points.length} | Маршрутів: {routes.length} | Автобусів:{' '}
            {transports.length}
          </span>
        </div>

        <div className="controls">
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
          >
            <option value="ALL">Усі маршрути</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                №{r.title} ({(r.total / 1000).toFixed(1)} км)
              </option>
            ))}
          </select>

          <div className="mode-tabs">
            <button
              className={mode === 'VIEW' ? 'active' : ''}
              onClick={() => setMode('VIEW')}
            >
              Карта
            </button>
            <button
              className={mode === 'ROUTE_BUILDER' ? 'active' : ''}
              onClick={() => setMode('ROUTE_BUILDER')}
            >
              + Маршрут
            </button>
            <button
              className={mode === 'GUIDE' ? 'active' : ''}
              onClick={() => setMode('GUIDE')}
            >
              Гід А→Б
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        <APIProvider apiKey={apiKey}>
          <MapCanvas
            mode={mode}
            points={points}
            transports={visibleTransports}
            activePoint={activePoint}
            arrivalInfo={arrivalInfo}
            guideStart={guideStart}
            guideEnd={guideEnd}
            onCloseInfo={() => setActivePoint(null)}
            onSelectStop={handleSelectStop}
            onGooglePlaceStopLinked={(newPoint) => {
              setPoints((prev) => {
                const exists = prev.some((p) => p._id === newPoint._id);
                return exists
                  ? prev.map((p) => (p._id === newPoint._id ? newPoint : p))
                  : [...prev, newPoint];
              });
              handleSelectStop(newPoint);
            }}
            onGuideClick={async (coords) => {
              if (!guideStart || (guideStart && guideEnd)) {
                setGuideStart(coords);
                setGuideEnd(null);
                setGuideResult(null);
              } else {
                setGuideEnd(coords);
                const res = await apiClient.findPersonalGuide(
                  guideStart,
                  coords,
                );
                setGuideResult(res);
              }
            }}
          />
        </APIProvider>

        <aside className="sidebar">
          {mode === 'VIEW' && (
            <div>
              <h3>Моніторинг транспорту</h3>
              <p className="hint">
                Торкніться будь-якої зупинки (або стандартного значка зупинки 🚏
                на Google Карті), щоб переглянути час прибуття транспорту.
              </p>
            </div>
          )}

          {mode === 'ROUTE_BUILDER' && (
            <div>
              <h3>Новий маршрут із зупинок Google Maps</h3>
              <p className="hint">
                Торкайтесь послідовно існуючих зупинок 🚏 на Google карті (або
                будь-якої точки карти) — вони додадуться до маршруту.
              </p>
              <input
                type="text"
                placeholder="Номер маршруту (напр. 12)"
                value={draftRouteTitle}
                onChange={(e) => setDraftRouteTitle(e.target.value)}
                className="input"
              />
              <ol className="stop-list">
                {draftStops.map((s, idx) => (
                  <li key={`${s._id}-${idx}`}>{s.title}</li>
                ))}
              </ol>
              <div className="btn-row">
                <button className="btn primary" onClick={handleSaveDraftRoute}>
                  Зберегти маршрут
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setDraftStops([]);
                    setDraftRouteTitle('');
                  }}
                >
                  Очистити
                </button>
              </div>
            </div>
          )}

          {mode === 'GUIDE' && (
            <div>
              <h3>Пошук маршруту (А → Б)</h3>
              <p className="hint">
                Торкніться на карті початкової (А) та кінцевої (Б) точки поїздки.
              </p>
              {guideResult?.status === 'OK' && guideResult.result && (
                <div className="guide-box">
                  <p>
                    <strong>
                      Маршрут №{guideResult.result.steps[1].route.title}
                    </strong>
                  </p>
                  <p>Пішки до зупинки: {guideResult.result.steps[0].total} м</p>
                  <p>Поїздка автобусом: {guideResult.result.total} м</p>
                  <p>Пішки від зупинки: {guideResult.result.steps[2].total} м</p>
                </div>
              )}
              {guideResult?.status === 'ERROR' && (
                <p className="error">Прямий маршрут у радіусі 500м не знайдено</p>
              )}
            </div>
          )}

          {statusMessage && <div className="status-toast">{statusMessage}</div>}
        </aside>
      </div>
    </div>
  );
}

interface MapCanvasProps {
  mode: EditorMode;
  points: PointDto[];
  transports: TransportDto[];
  activePoint: PointDto | null;
  arrivalInfo: PointArrivalResponseDto | null;
  guideStart: LatLngLiteral | null;
  guideEnd: LatLngLiteral | null;
  onCloseInfo: () => void;
  onSelectStop: (point: PointDto) => void;
  onGooglePlaceStopLinked: (point: PointDto) => void;
  onGuideClick: (coords: LatLngLiteral) => void;
}

function MapCanvas({
  mode,
  points,
  transports,
  activePoint,
  arrivalInfo,
  guideStart,
  guideEnd,
  onCloseInfo,
  onSelectStop,
  onGooglePlaceStopLinked,
  onGuideClick,
}: MapCanvasProps) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');

  const handleMapClick = async (event: MapMouseEvent) => {
    const latLng = event.detail.latLng;
    if (!latLng) return;

    if (mode === 'GUIDE') {
      onGuideClick(latLng);
      return;
    }

    const placeId = event.detail.placeId;
    if (placeId && map && placesLib) {
      event.stop();
      const service = new placesLib.PlacesService(map);
      service.getDetails(
        {
          placeId,
          fields: ['name', 'geometry', 'types'],
        },
        async (place, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            place?.geometry?.location
          ) {
            const { point } = await apiClient.upsertPointFromGooglePlace({
              googlePlaceId: placeId,
              title: place.name ?? 'Зупинка Google Maps',
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
            onGooglePlaceStopLinked(point);
          } else {
            const { point } = await apiClient.upsertPointFromGooglePlace({
              googlePlaceId: placeId,
              title: `Зупинка (${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)})`,
              lat: latLng.lat,
              lng: latLng.lng,
            });
            onGooglePlaceStopLinked(point);
          }
        },
      );
    } else if (mode === 'ROUTE_BUILDER') {
      // Fallback if user tapped on map where Places API isn't activated yet
      const { point } = await apiClient.upsertPointFromGooglePlace({
        googlePlaceId: `custom_${latLng.lat.toFixed(5)}_${latLng.lng.toFixed(5)}`,
        title: `Зупинка #${points.length + 1}`,
        lat: latLng.lat,
        lng: latLng.lng,
      });
      onGooglePlaceStopLinked(point);
    }
  };

  return (
    <div className="map-wrapper">
      <GoogleMap
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={14}
        onClick={handleMapClick}
      >
        {points.map((point) => (
          <Marker
            key={point._id}
            position={{ lat: point.lat, lng: point.lng }}
            title={point.title}
            onClick={() => onSelectStop(point)}
          />
        ))}

        {transports.map((bus) => (
          <Marker
            key={bus._id}
            position={{ lat: bus.lat, lng: bus.lng }}
            title={`Транспорт ${bus._id}`}
          />
        ))}

        {guideStart && <Marker position={guideStart} title="Старт (А)" />}
        {guideEnd && <Marker position={guideEnd} title="Фініш (Б)" />}

        {activePoint && (
          <InfoWindow
            position={{ lat: activePoint.lat, lng: activePoint.lng }}
            onCloseClick={onCloseInfo}
          >
            <div className="info-popup">
              <strong>{activePoint.title}</strong>
              {arrivalInfo?.routes.length ? (
                <ul>
                  {arrivalInfo.routes.map((r) => (
                    <li key={r.route}>
                      №{r.title}:{' '}
                      {r.status === 'OK'
                        ? r.time === 0
                          ? 'прибув'
                          : `${r.time} хв`
                        : 'немає на лінії'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Маршрути не підключені</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
