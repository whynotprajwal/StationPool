# StationPool — Project Audit

> Generated: 2026-10-24 | Pre-Implementation Inspection

---

## 1. Workspace Overview

The workspace contains **24 Stitch-exported screen directories**. Each holds:
- `code.html` — self-contained HTML with inline Tailwind CDN config, Google Fonts, inline scripts
- `screen.png` — design reference screenshot
- Optionally a `DESIGN.md` with design system specification

**No existing React project, backend, database, or package.json exists.** Everything must be built from scratch.

---

## 2. Screen Inventory

| Directory | Purpose | Role | Theme |
|---|---|---|---|
| `stationpool_landing_page` | Hero landing page | Entry point | Dark |
| `stationpool_landing_page_light` | Landing variant | Entry alt | Light |
| `commuter_sign_up` | Sign-up form + role selector | Auth step 1 | Dark |
| `commuter_sign_up_light` | Sign-up variant | Auth step 1 alt | Light |
| `otp_mobile_verification` | 6-digit OTP entry | Auth step 2 | Dark |
| `otp_mobile_verification_light` | OTP variant | Auth step 2 alt | Light |
| `commuter_onboarding_verification` | Post-OTP onboarding | Auth step 3 | Dark |
| `metro_ticket_to_pool_landing` | Metro ticket + destination selector | Passenger flow | Dark |
| `metro_ticket_to_pool_landing_light` | Metro ticket variant | Passenger flow alt | Light |
| `metro_matching_in_transit_light` | Live radar matching | Passenger flow | Light |
| `metro_match_confirmed_light` | Match confirmed | Passenger flow | Light |
| `live_in_transit_match_gate_pin` | PIN display for passenger | In-transit | Dark |
| `active_ride_passenger_light` | Passenger active ride | Active ride | Light |
| `active_ride_driver_light` | Driver active ride | Active ride | Light |
| `verify_passenger_pin_light` | Driver PIN verification | Active ride (driver) | Light |
| `shared_ride_completed_light` | Ride completed summary | Post-ride | Light |
| `driver_registration_verification_light` | Driver reg + ID/vehicle form | Driver onboarding | Light |
| `publish_commute_driver_light` | Driver publish journey | Driver flow | Light |
| `publish_commute_offer_seats` | Seat offering form | Driver flow | Dark |
| `pune_metro_ticket_pool_finder` | Metro ticket + pool finder | Passenger flow | Dark |
| `stationpool_pune_metro_transit` | Full transit system landing | Landing alt | Dark |
| `commuter_activity_safety_center` | Activity + safety center | Dashboard | Dark |
| `metro_flow` | Design-only (DESIGN.md) | Reference | — |
| `stationpool_commuter_transit_system` | Design-only (DESIGN.md) | Reference | — |

---

## 3. Design Systems

### Dark: StationPool Commuter Transit System
- Background: `#031427`, Primary: `#b8c7e6`, Secondary: `#94ccff`, Tertiary: `#4edea3`
- Fonts: Plus Jakarta Sans + JetBrains Mono (numbers)

### Light: Metro Flow
- Background: `#f8f9ff`, Primary: `#00162d`, Secondary: `#00677d`
- Fonts: Plus Jakarta Sans only

**Strategy**: Dark theme as primary app default.

---

## 4. Technology Present

| Item | Status |
|---|---|
| React/Vite/TypeScript | Not present |
| Tailwind CSS | CDN in HTML only |
| Backend (FastAPI) | Not present |
| SQLite database | Not present |
| Authentication | Not present |

---

## 5. Screen-to-Route Map

```
/                         LandingPage
/signup                   SignUpPage
/verify-otp               OTPVerificationPage
/home                     MetroTicketPoolLandingPage
/match                    MetroMatchingPage
/match/:journeyId         MetroMatchConfirmedPage
/ride/passenger/:tripId   PassengerActiveRidePage
/ride/driver/:tripId      DriverActiveRidePage
/ride/verify-pin/:tripId  DriverPINVerificationPage
/trip/:tripId/complete    RideCompletedPage
/driver/register          DriverRegistrationPage
/driver/publish           PublishJourneyPage
/driver/dashboard         DriverDashboardPage
/activity                 PassengerActivityPage
```

---

## 6. Missing Functionality

- React app structure
- API client
- Authentication (JWT + OTP)
- Database models
- Matching algorithm
- Request/seat lifecycle
- Trip lifecycle + PIN verification
- Fare estimation
- Demo seed data
- Tests

---

## 7. Limitations

- No real SMS (dev OTP only)
- No real Metro API (simulated tickets)
- No real maps/tracking (labeled simulated)
- No Aadhaar verification (fictional test data)
- No payment processing (illustrative estimates)
- SQLite (prototype only)
