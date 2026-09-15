# PS 26050 — High Altitude Counter-UAS / Anti-Drone System
### Tactical Mission Control Web Dashboard (Ladakh Sector, 4,850m MSL)

![Mission Control](https://img.shields.io/badge/System-PS%2026050%20C--UAS-red?style=for-the-badge)
![Altitude](https://img.shields.io/badge/MSL-4%2C850m%20Ladakh-blue?style=for-the-badge)
![Thermal](https://img.shields.io/badge/Thermal%20Loop-PID%20Closed--Loop-amber?style=for-the-badge)
![Stack](https://img.shields.io/badge/Next.js%2014-Tailwind%20CSS-emerald?style=for-the-badge)

A real-time, mission-critical Command & Control web dashboard built for high-altitude anti-drone and counter-UAS operations in sub-zero alpine environments (-25°C).

---

## ⚡ Key Capabilities

- **Tactical 360° Polar Sweep Radar**: Real-time rotating phosphor beam on HTML5 Canvas with polar range intervals (500m kinetic, 1.5km RF jammer, 3km PTZ optical, 5km max scan), velocity vector trails, and target classifications.
- **Topographical Elevation & Radar LOS Masking**: Mountain contour map of Ladakh ridges (Khardung La / Chang La) with RF shadow occlusion zones and LoRa relay sentry nodes.
- **High-Altitude Physics & Aerodynamics Engine**: Real-time air density calculation $\rho = \frac{P \times 1000}{R \cdot T} \approx 0.761\text{ kg/m}^3$ displaying rotor lift deficits (+27.4% RPM required) and 1.45x motor current drain on hostile drones.
- **Active PID Thermal Management**: Closed-loop PID controller ($K_p = 4.2, K_i = 0.15, K_d = 1.8$) with PWM 62% duty cycle heating 5 critical zones (Jetson Orin, AD9361 SDR, Gimbal Bearings, Germanium Dome, Radome Anti-Ice).
- **LiFePO4 Cold-Discharge Power System**: 48V 100Ah battery pack showing preheated thermal reserve (94.2 Ah) vs unheated cold-soak drop (42.0 Ah, preventing 58% capacity loss).
- **Multi-Sensor Fusion**:
  - **AD9361 SDR Spectrum & Waterfall**: Real-time FFT spectrum and waterfall scanning 400 MHz – 6.0 GHz.
  - **4-Mic Acoustic Beamforming Array**: DSP spectral subtraction wind filter (-22 dB) with polar sound arrival vector and 210 Hz quadrotor harmonic peak.
  - **Dual-Band PTZ Optics**: Simulated LWIR Thermal (640x512) and Visible HD cameras with AI YOLO-v8 target bounding box.
- **Interlocked Countermeasures**: Directional Smart RF Jammer (GNSS L1/L2 spoof, 2.4 GHz C2 link, 5.8 GHz video break), Gimbal Slew-To-Cue, and Pneumatic Net Launcher with 2-step safety confirmation modal.
- **Dedicated Scripted Incursion Pitch Runner (`useDemoEngine`)**: Automated 5-phase demonstration lifecycle from baseline recon (T+0s) to multi-sensor lock (T+6s) and jamming neutralization (T+14s).
- **Synthesized Audio Engine**: Web Audio API procedural radar pings, anomaly chirps, warble sirens, and victory chimes.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Tactical Military Dark Mode UI
- **Icons**: Lucide React
- **Audio**: Web Audio API Procedural Sound Engine
- **Visualizations**: HTML5 Canvas, SVG Tactical Maps & LOS Cones

---

## 📄 License
MIT License
