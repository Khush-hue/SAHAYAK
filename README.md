# 🇮🇳 SAHAYAK (Samajik Saathi 2.0)
### Smart Real-Time Monitoring & Zero-Fraud Inspection Platform

![SIH 2026](https://img.shields.io/badge/SIH-2026-orange?style=for-the-badge&logo=india)
![Ministry](https://img.shields.io/badge/Ministry-DoSJE--MoSJE-navy?style=for-the-badge)
![Flutter](https://img.shields.io/badge/Frontend-Flutter_3.x-blue?style=for-the-badge&logo=flutter)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![PostGIS](https://img.shields.io/badge/Database-PostgreSQL_PostGIS-336791?style=for-the-badge&logo=postgresql)
![UX4G](https://img.shields.io/badge/UI_Standard-MeitY_UX4G-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-red?style=for-the-badge)

> **Official Problem Statement:** Smart Real-Time Monitoring & Inspection Mobile App  
> **Problem Statement ID:** SIH26095  
> **Nodal Ministry:** Ministry of Social Justice and Empowerment (MoSJE)  
> **Department:** Department of Social Justice and Empowerment (DoSJE)  
> **Tagline:** *"Zero Fake Reporting. 100% Verified Care."*

---

## 📌 Executive Overview

**SAHAYAK (Samajik Saathi 2.0)** is an enterprise-grade, zero-duplication operational governance platform engineered to modernize field inspections and institutional oversight for social welfare projects, drug rehabilitation centers (**IDAMS/DAMS**), and senior citizen care homes (**SHATAYU**).

Rather than creating isolated silos, **SAHAYAK** operates as a central intelligence layer connecting existing government registries (**AEBAS**, **e-Anudaan**, **IDAMS**, **SHATAYU**) via **API Setu**. It replaces manual, paper-based reporting with **hardware-locked spatial verification**, **cryptographic duty scheduling**, **Bhashini AI voice dictation**, and **automated Grant-in-Aid (GIA) financial enforcement**.

---

## 🚨 Problem Statement & Operational Gaps Solved

| Operational Challenge in Existing Framework | Solution Introduced by SAHAYAK (Samajik Saathi 2.0) |
| :--- | :--- |
| **Fake Locations & Photo Spoofing** <br> Officers use mock-GPS apps, rooted devices, and old gallery photos to fake visits. | **Hardware-Locked Zero-Fraud Trust Engine:** Enforces hardware attestation (`safe_device` & `trust_fall`), locks camera to live-only capture (disables gallery picks), and verifies EXIF telemetry & pixel watermarks. |
| **Notice Leakages & Collusion** <br> Advance notice of surprise audits gets leaked, allowing centers to temporarily mask defects. | **Deterministic SHA-256 PRNG Router:** Inspection routes remain cryptographically sealed inside an encrypted enclave until the officer reaches the target geofence corridor. |
| **"Ghost" Beneficiaries** <br> Centers report full paper attendance to claim grants, but physical headcounts are much lower. | **AI Operational Risk Engine + AEBAS Cross-Check:** Automatically cross-references physical audit counts with live **AEBAS Aadhaar biometric logs** via API Setu; flags discrepancies (e.g. -14 ghost risk gap). |
| **Slow Paper Audits & Grant Waste** <br> Non-compliant NGOs continue receiving government funds for months due to slow paper processing. | **Automated GIA Tranche Freeze:** Severe compliance violations instantly trigger a financial lock on subsequent **e-Anudaan / PFMS** funding tranches. |
| **Unmonitored CCTV Cameras** <br> Installed facility CCTVs are routinely turned off during peak hours without triggering alerts. | **WebRTC / HLS Stream Gateway:** Transcodes RTSP streams for sub-second admin dashboard playback; automatically tracks camera uptime patterns to adjust AI risk scores. |
| **Language & Rural Network Barriers** <br> Ground staff struggle with manual typing in English and experience data loss in zero-internet dead zones. | **Bhashini AI Dictation + SQLCipher Local Vault:** Enables voice dictation in 12+ regional languages (translated to English) and stores encrypted logs locally using **SQLCipher AES-256** with auto-sync. |

---

## ✨ Core Features & Technical Highlights

### 🛡️ 1. Hardware-Locked Zero-Fraud Trust Engine
* **Anti-Mock GPS & Root Detection:** Detects developer mock location settings, bootloader unlock states, and virtual Android emulators.
* **Live Camera Lock:** Completely disables gallery image picks. Requires live photo capture with burned-in dynamic pixel watermarks (Lat/Lng, Epoch Timestamp, Inspector ID, Hash).
* **Clock Sync Audit:** Validates device clock against Network Time Protocol (NTP) servers to prevent timestamp manipulation.

### 🔑 2. Cryptographic Random Duty Scheduler
* **Deterministic Pseudo-Random Assignment:** Uses SHA-256 PRNG algorithms to match field inspectors to high-risk institutes automatically without human selection bias.
* **Sealed Route Enclave:** Target coordinates are delivered in an encrypted payload and unlocked via Firebase Cloud Messaging (FCM) push notifications only upon shift start.

### 📊 3. AI Operational Risk Engine
* **Multivariate Anomaly Scoring:** Evaluates centers continuously on a **Low / Medium / High** risk scale based on:
  1. Attendance delta between physical audit counts and AEBAS Aadhaar biometric logs.
  2. CCTV stream uptime and historical outage frequency.
  3. Filing latency on IDAMS/DAMS and e-Anudaan portals.

### 🎙️ 4. Bhashini AI Multilingual Dictation
* **Speech-to-Text & Translation Pipeline:** Integrates MeitY's **Bhashini AI** API set to allow field officers to dictate audit findings in 12+ regional Indian languages.
* **Automated PDF Generation:** Converts regional speech to standardized English compliance reports automatically.

### 🔒 5. Offline-First SQLCipher Encrypted Vault
* **Zero Data Loss in Dead Zones:** When operating in remote tribal or rural blocks, all audit checklists and encrypted media are saved in a local **SQLCipher AES-256 database**.
* **Background Auto-Sync:** Automatically uploads queued payloads to the backend once a stable internet connection is re-established.

---

## 📐 System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                PRESENTATION TIER (MeitY UX4G UI)                                 │
│   ┌────────────────────────────────────────┐          ┌──────────────────────────────────────┐   │
│   │   Flutter Mobile App (Inspector)   │          │   React Web Command Dashboard        │   │
│   │   • Offline SQLCipher Encrypted Vault  │          │   • GIS Heatmaps & Real-time Alerts │   │
│   └───────────────────┬────────────────────┘          └───────────────────┬──────────────────┘   │
└───────────────────────┼───────────────────────────────────────────────────┼──────────────────────┘
                        │ (mTLS / TLS 1.3 Secure Channels)                  │ (WebSockets / WSS)
                        ▼                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                APPLICATION & CORE SERVICES TIER                                  │
│   ┌──────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────────────┐   │
│   │ Hardware Integrity   │   │ Cryptographic Scheduler   │   │ AI Anomaly & Risk Engine      │   │
│   │ Anti-Spoof & Root    │   │ Deterministic SHA-256 PRNG│   │ AEBAS vs Physical Delta       │   │
│   └──────────┬───────────┘   └─────────────┬─────────────┘   └───────────────┬───────────────┘   │
│              │                             │                                 │                   │
│   ┌──────────┴───────────┐   ┌─────────────┴─────────────┐   ┌───────────────┴───────────────┐   │
│   │ PostGIS Spatial Engine│  │ Bhashini AI Engine        │   │ Media Transcoder              │   │
│   │ Geofence Radar Lock  │   │ Multilingual Voice-to-Text│   │ RTSP to WebRTC / HLS Stream   │   │
│   └──────────────────────┘   └───────────────────────────┘   └───────────────────────────────┘   │
└───────────────────────┬───────────────────────────────────────────────────┬──────────────────────┘
                        │                                                   │
                        ▼                                                   ▼
┌─────────────────────────────────────────┐             ┌──────────────────────────────────────────┐
│              DATA TIER                  │             │     INTEGRATION TIER (API Setu mTLS)     │
│  ┌───────────────────────────────────┐  │             │  ┌──────────────────┐ ┌────────────────┐ │
│  │ PostgreSQL + PostGIS Spatial DB   │  │             │  │ AEBAS Biometrics │ │ e-Anudaan GIA  │ │
│  └───────────────────────────────────┘  │             │  └──────────────────┘ └────────────────┘ │
│  ┌───────────────────────────────────┐  │             │  ┌──────────────────┐ ┌────────────────┐ │
│  │ SQLCipher Local Vault (Mobile App)│  │             │  │ IDAMS/DAMS Rehab │ │ SHATAYU Care   │ │
│  └───────────────────────────────────┘  │             │  └──────────────────┘ └────────────────┘ │
└─────────────────────────────────────────┘             └──────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Domain | Component / Framework | Usage & Responsibility |
| :--- | :--- | :--- |
| **Mobile Frontend** | **Flutter 3.x (Dart)** | Cross-platform mobile app for Field Inspectors (Android & iOS). |
| **Web Dashboard** | **React.js + Leaflet/Mapbox** | Central GIS Command & Monitoring Dashboard for DoSJE Officials. |
| **Backend API** | **FastAPI (Python 3.12)** | Asynchronous, high-throughput microservices gateway. |
| **Primary Database** | **PostgreSQL 16 + PostGIS** | Relational spatial database for nationwide geofence calculations (`ST_DWithin`). |
| **Mobile Offline DB** | **SQLCipher** | AES-256 encrypted client-side local database. |
| **Speech & Translation** | **Bhashini AI API Set** | Multilingual Speech-to-Text (ASR) & Neural Machine Translation (NMT). |
| **System Integration** | **API Setu (mTLS)** | Secure government inter-system pipeline (AEBAS, e-Anudaan, DAMS, SHATAYU). |
| **Live CCTV Streaming** | **FFmpeg / WebRTC / HLS** | Real-time RTSP stream transcoding and playback. |
| **Design Standard** | **MeitY UX4G Guidelines** | Accessible, high-contrast UI compliant with WCAG 2.1 AA standards. |

---

## 📂 Repository Structure

```text
SAHAYAK/
├── apps/
│   ├── mobile_inspector/            # Flutter Mobile Application Source Code
│   │   ├── lib/
│   │   │   ├── core/                # Geofencing, Hardware Attestation, SQLCipher
│   │   │   ├── features/            # Auth, Duty List, Camera Audit, Voice Dictation
│   │   │   └── main.dart
│   │   └── pubspec.yaml
│   └── admin_dashboard/             # React.js Web Command Center
│       ├── src/
│       │   ├── components/gis_map/   # GIS Heatmaps & Real-time Inspector Radar
│       │   ├── pages/risk_monitor/  # AI Risk Analytics & Escalation Panel
│       └── package.json
├── backend/
│   ├── api_gateway/                 # FastAPI Asynchronous REST Routes
│   │   ├── routers/                 # Inspection, Duty, Media, Bhashini Routes
│   │   └── main.py
│   ├── ai_risk_engine/              # Machine Learning Anomaly Detection Pipelines
│   └── spatial_db/                  # PostgreSQL + PostGIS Schema DDL Scripts
├── docs/                            # UML Diagrams, Blueprints & API Documentation
├── scripts/                         # Docker Configurations & Synthetic Data Generators
└── README.md
```

---

## 🚀 Getting Started & Installation Guide

### Prerequisites
* **Flutter SDK:** `>= 3.19.0`
* **Python:** `>= 3.12`
* **PostgreSQL:** `>= 16.0` with **PostGIS 3.4** extension installed
* **Docker & Docker Compose** (Optional for containerized setup)

### 1. Database Setup (PostgreSQL + PostGIS)
```bash
# Connect to PostgreSQL and initialize PostGIS spatial database
psql -U postgres -c "CREATE DATABASE sahayak_db;"
psql -U postgres -d sahayak_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Execute DDL schema script
psql -U postgres -d sahayak_db -f backend/spatial_db/schema.sql
```

### 2. Backend Services Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend/api_gateway

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scriptsctivate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI server with Uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Mobile Client Setup (Flutter)
```bash
# Navigate to mobile inspector app directory
cd apps/mobile_inspector

# Get Flutter dependencies
flutter pub get

# Run hardware & device checks
flutter doctor

# Launch application on connected Android/iOS device
flutter run
```

---

## 🛡️ Security, Privacy & Compliance (DPDP Act 2023)

* **Zero Plain-Text PII:** Beneficiary Aadhaar numbers are salted and hashed using standard **Aadhaar Vault protocols**.
* **mTLS API Tunnels:** All inter-departmental communications over **API Setu** utilize Mutual TLS (mTLS) with SHA-256 client certificates.
* **MeitY GI Cloud Hosting:** Deployment architecture complies with government hosting guidelines (NIC/C-DAC empaneled cloud infrastructure).
* **Anti-Tamper Device Attestation:** Mobile application binary halts execution if hardware root, bootloader unlock, or emulator hooks are detected.

---

## 📊 Project Artifacts & Documentation

All technical specs, architecture diagrams, and cost models are fully documented:
* 📄 **UML Specification:** `docs/sih-uml-diagrams.md`
* 🛠️ **System Architecture Blueprint:** `docs/sih-complete-development-guide.md`
* 📊 **Financial Budget Model:** `docs/sih-project-cost-breakdown.xlsx`
* 🔌 **API Integration Protocols:** `docs/sih-api-integration-plan.md`
* 🖼️ **Official SIH Slide Deck:** `docs/SIH_2026_Official_Pitch_Deck.pdf`

---

## 📜 License & Acknowledgments

This project is developed for the **Smart India Hackathon (SIH) 2026** under **Problem Statement ID: SIH26095**, commissioned by the **Ministry of Social Justice and Empowerment (MoSJE), Govt. of India**.

Distributed under the **MIT License**. See `LICENSE` for more information.

---
<p center align="center">
  <b>Built with ❤️ for Smart India Hackathon 2026</b>
</p>
