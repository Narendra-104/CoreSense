'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AtmosphericsOutput,
  AirDensityOutput,
  LiFePo4Output,
  calculateAtmospherics,
  calculateAirDensityMetrics,
  calculateLiFePo4Power,
} from '@/utils/physicsEngine';

export interface RawSensorPacket {
  timestamp?: number | string;
  ambientTempC?: number;
  barometricPressureKpa?: number;
  windSpeedKmh?: number;
  windDirectionDeg?: number;
  batteryVoltageV?: number;
  packCurrentA?: number;
  coreTempC?: number;
  thermalJacketActive?: boolean;
  nominalCapacityAh?: number;
}

export type WsConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'SIMULATED_STANDALONE' | 'ERROR';

export interface UseTelemetryWebSocketOptions {
  wsUrl?: string;
  updateIntervalMs?: number; // default 500ms
  enableSimulatedFallback?: boolean; // default true
  onRawPacketReceived?: (packet: RawSensorPacket) => void;
}

export function useTelemetryWebSocket(options?: UseTelemetryWebSocketOptions) {
  const wsUrl = options?.wsUrl || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws/telemetry';
  const intervalMs = options?.updateIntervalMs ?? 500;
  const enableSimulatedFallback = options?.enableSimulatedFallback ?? true;

  const [connectionStatus, setConnectionStatus] = useState<WsConnectionStatus>('CONNECTING');
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<number>(Date.now());
  const [packetCount, setPacketCount] = useState<number>(0);

  // Core Calculated Metrics
  const [atmospherics, setAtmospherics] = useState<AtmosphericsOutput>(() =>
    calculateAtmospherics({
      ambientTempC: -24.8,
      barometricPressureKpa: 54.2,
      windSpeedKmh: 42.5,
      windDirectionDeg: 315,
      referenceHeadingDeg: 42,
    })
  );

  const [airDensity, setAirDensity] = useState<AirDensityOutput>(() =>
    calculateAirDensityMetrics({
      ambientTempC: -24.8,
      barometricPressureKpa: 54.2,
    })
  );

  const [powerEngine, setPowerEngine] = useState<LiFePo4Output>(() =>
    calculateLiFePo4Power({
      batteryVoltageV: 51.2,
      packCurrentA: -6.42,
      coreTempC: 18.5,
      thermalJacketActive: true,
      nominalCapacityAh: 100,
    })
  );

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tickCountRef = useRef<number>(0);

  // Process raw incoming packet and run physics equations
  const processRawPacket = useCallback(
    (packet: RawSensorPacket) => {
      const temp = packet.ambientTempC ?? -24.8;
      const pressure = packet.barometricPressureKpa ?? 54.2;
      const windSpeed = packet.windSpeedKmh ?? 42.0;
      const windDir = packet.windDirectionDeg ?? 315;

      const volt = packet.batteryVoltageV ?? 51.2;
      const current = packet.packCurrentA ?? -6.4;
      const coreTemp = packet.coreTempC ?? 18.5;
      const jacketActive = packet.thermalJacketActive ?? true;
      const nominalAh = packet.nominalCapacityAh ?? 100;

      // 1. Calculate Atmospherics
      const atmoResult = calculateAtmospherics({
        ambientTempC: temp,
        barometricPressureKpa: pressure,
        windSpeedKmh: windSpeed,
        windDirectionDeg: windDir,
        referenceHeadingDeg: 42,
      });

      // 2. Calculate Air Density & Rotor Dynamics
      const densityResult = calculateAirDensityMetrics({
        ambientTempC: temp,
        barometricPressureKpa: pressure,
      });

      // 3. Calculate LiFePO4 Power & Cold-Discharge Reserve
      const powerResult = calculateLiFePo4Power({
        batteryVoltageV: volt,
        packCurrentA: current,
        coreTempC: coreTemp,
        thermalJacketActive: jacketActive,
        nominalCapacityAh: nominalAh,
      });

      setAtmospherics(atmoResult);
      setAirDensity(densityResult);
      setPowerEngine(powerResult);
      setLastMessageTimestamp(Date.now());
      setPacketCount((prev) => prev + 1);

      if (options?.onRawPacketReceived) {
        options.onRawPacketReceived(packet);
      }
    },
    [options]
  );

  // Live Simulation Heartbeat (runs every 500ms when WS server is disconnected)
  const startSimulatedTelemetry = useCallback(() => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    simIntervalRef.current = setInterval(() => {
      tickCountRef.current += 1;
      const t = tickCountRef.current * 0.5; // seconds

      // Environmental high-altitude drift
      const tempNoise = Math.sin(t * 0.08) * 0.25;
      const pressureNoise = Math.cos(t * 0.06) * 0.08;
      const windNoise = Math.sin(t * 0.2) * 4.2;

      const currentAmbient = -24.8 + tempNoise;
      const currentPressure = 54.2 + pressureNoise;
      const currentWindSpeed = 42.5 + windNoise;
      const currentWindDir = (315 + Math.sin(t * 0.05) * 8 + 360) % 360;

      // LiFePO4 cold discharge micro-drain
      const currentVolt = 51.2 - t * 0.0001;
      const currentAmps = -6.4 + Math.sin(t * 0.15) * 0.6;
      const coreTemp = 18.5 + Math.sin(t * 0.04) * 0.3;

      const simPacket: RawSensorPacket = {
        timestamp: Date.now(),
        ambientTempC: parseFloat(currentAmbient.toFixed(2)),
        barometricPressureKpa: parseFloat(currentPressure.toFixed(2)),
        windSpeedKmh: parseFloat(currentWindSpeed.toFixed(1)),
        windDirectionDeg: Math.round(currentWindDir),
        batteryVoltageV: parseFloat(currentVolt.toFixed(2)),
        packCurrentA: parseFloat(currentAmps.toFixed(2)),
        coreTempC: parseFloat(coreTemp.toFixed(1)),
        thermalJacketActive: true,
        nominalCapacityAh: 100,
      };

      processRawPacket(simPacket);
    }, intervalMs);
  }, [intervalMs, processRawPacket]);

  // WebSocket Connection Management
  useEffect(() => {
    let isSubscribed = true;

    const connectWebSocket = () => {
      try {
        setConnectionStatus('CONNECTING');
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (!isSubscribed) return;
          setConnectionStatus('CONNECTED');
          // Clear simulation fallback if WS connects successfully
          if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        };

        socket.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const raw = JSON.parse(event.data) as RawSensorPacket;
            processRawPacket(raw);
          } catch (err) {
            console.error('[useTelemetryWebSocket] Malformed JSON message:', err);
          }
        };

        socket.onerror = () => {
          if (!isSubscribed) return;
          socket.close();
        };

        socket.onclose = () => {
          if (!isSubscribed) return;
          if (enableSimulatedFallback) {
            setConnectionStatus('SIMULATED_STANDALONE');
            startSimulatedTelemetry();
          } else {
            setConnectionStatus('ERROR');
          }

          // Attempt reconnect in 5 seconds
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isSubscribed) connectWebSocket();
          }, 5000);
        };
      } catch (err) {
        if (!isSubscribed) return;
        if (enableSimulatedFallback) {
          setConnectionStatus('SIMULATED_STANDALONE');
          startSimulatedTelemetry();
        }
      }
    };

    connectWebSocket();

    return () => {
      isSubscribed = false;
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [wsUrl, enableSimulatedFallback, startSimulatedTelemetry, processRawPacket]);

  return {
    connectionStatus,
    lastMessageTimestamp,
    packetCount,
    atmospherics,
    airDensity,
    powerEngine,
    sendManualPacket: processRawPacket,
  };
}
