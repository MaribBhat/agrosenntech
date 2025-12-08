# SaffronTech Architecture Guide

## System Overview

SaffronTech is a production-grade IoT monitoring system for saffron cultivation in Kashmir. The system integrates real-time sensor data, agronomic intelligence, and machine learning to help farmers optimize yield while protecting this sensitive crop.

## Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **React Router v6** for SPA navigation
- **TanStack React Query** for server state management
- **Recharts** for interactive time-series visualizations
- **Tailwind CSS** for responsive, utility-first styling
- **Lucide React** for consistent iconography

### Backend Data
- **Supabase** (PostgreSQL) for persistent data storage
- **Row Level Security** for multi-tenant data isolation
- **Real-time subscriptions** capability (configured)

### Integration
- **Thingspeak API** for sensor data ingestion (via backend service)
- **Supabase Edge Functions** for serverless data processing
- **@supabase/supabase-js** for frontend database access

## Database Schema

### Core Tables

#### `farms` - Farm metadata and ownership
```
├── id (UUID, PK)
├── name (Text) - Farm identifier
├── location (Text) - Geographic location
├── owner_id (UUID, FK to auth.users)
├── kashmir_zone (Text) - Climate region for predictions
└── created_at (Timestamp)
```

#### `sensor_readings` - Time-series sensor data
```
├── id (UUID, PK)
├── farm_id (UUID, FK)
├── timestamp (Timestamptz) - When data was recorded
├── n_value (Numeric) - Nitrogen ppm
├── p_value (Numeric) - Phosphorus ppm
├── k_value (Numeric) - Potassium ppm
├── soil_moisture_1 (Numeric) - % (Sensor 1)
├── soil_moisture_2 (Numeric) - % (Sensor 2)
├── air_temp (Numeric) - Celsius
├── soil_temp (Numeric) - Celsius
├── humidity (Numeric) - % RH
├── light_lux (Numeric) - Lux
├── ph_level (Numeric) - pH
└── data_quality_score (Numeric) - 0-100
```

#### `crop_cycles` - Saffron growth tracking
```
├── id (UUID, PK)
├── farm_id (UUID, FK)
├── start_date (Date)
├── end_date (Date)
├── expected_yield (Numeric) - kg/ha
├── actual_yield (Numeric) - kg/ha
├── current_phenology_stage (Text) - dormant/flowering/vegetative
└── created_at (Timestamp)
```

#### `phenology_events` - Growth stage transitions
```
├── id (UUID, PK)
├── crop_cycle_id (UUID, FK)
├── farm_id (UUID, FK)
├── stage (Text) - Growth stage
├── detected_at (Timestamptz)
├── confidence_score (Numeric) - 0-1
└── trigger_reason (Text)
```

#### `npk_recommendations` - Nutrient management advice
```
├── id (UUID, PK)
├── farm_id (UUID, FK)
├── timestamp (Timestamptz)
├── nutrient_type (Text) - N/P/K
├── current_level (Numeric)
├── target_level (Numeric)
├── recommended_action (Text)
├── dosage (Text)
├── reasoning (Text)
└── applied (Boolean)
```

#### `alerts` - Alert management
```
├── id (UUID, PK)
├── farm_id (UUID, FK)
├── alert_type (Text)
├── severity (Text) - INFO/WARNING/CRITICAL
├── message (Text)
├── triggered_at (Timestamptz)
├── acknowledged_at (Timestamptz)
├── snoozed_until (Timestamptz)
└── action_taken (Text)
```

#### `field_health_scores` - Composite farm metrics
```
├── id (UUID, PK)
├── farm_id (UUID, FK)
├── timestamp (Timestamptz)
├── vitality_index (Numeric) - 0-100 composite
├── moisture_score (Numeric) - 0-100
├── nutrient_score (Numeric) - 0-100
├── temperature_score (Numeric) - 0-100
└── pest_risk_score (Numeric) - 0-100
```

#### `irrigation_events` - Water management tracking
```
├── id (UUID, PK)
├── farm_id (UUID, FK)
├── scheduled_at (Timestamptz)
├── executed_at (Timestamptz)
├── duration_minutes (Integer)
├── moisture_before (Numeric)
├── moisture_after (Numeric)
└── created_at (Timestamp)
```

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx - Navigation header
│   │   └── Sidebar.tsx - Navigation sidebar
│   ├── common/
│   │   └── Card.tsx - Reusable card component
│   ├── sensors/
│   │   ├── MoistureGraph.tsx - Dual moisture chart with thresholds
│   │   ├── NPKGauge.tsx - Nutrient status cards
│   │   ├── FieldHealthScore.tsx - Vitality index visualization
│   │   └── PhenologyStage.tsx - Growth stage indicator
│   ├── alerts/
│   │   └── AlertPanel.tsx - Alert management UI
│   └── chat/
│       └── ChatAssistant.tsx - Saffron cultivation advisor
├── pages/
│   ├── Dashboard.tsx - Main monitoring interface
│   ├── Analytics.tsx - Historical analysis (placeholder)
│   ├── Alerts.tsx - Alert center (placeholder)
│   └── Settings.tsx - Preferences (placeholder)
├── hooks/
│   └── useFarmData.ts - React Query hooks for data fetching
├── lib/
│   ├── supabase.ts - Supabase client initialization
│   └── api.ts - Type-safe API client functions
├── types/
│   └── index.ts - TypeScript type definitions
├── App.tsx - Router and layout wrapper
└── main.tsx - Vite entry point
```

### Data Flow Architecture

```
Thingspeak API
      ↓
[Ingestion Service] ← Every 15 minutes via Edge Function
      ↓
Supabase PostgreSQL
      ↓
[React Query Client] ← Browser fetches with caching
      ↓
Components (MoistureGraph, NPKGauge, etc)
      ↓
User Interface
```

### Authentication Flow
1. User visits `/` without session
2. Presented with Supabase OAuth sign-in screen
3. Redirects to Google/Other provider
4. On return, `onAuthStateChange` listener updates state
5. User can now view only their farms and data (RLS enforced)

## Key Features Implementation

### 1. Real-time Sensor Monitoring
- **MoistureGraph**: Dual sensor tracking with visual thresholds
  - Wilting Point (30%) - Red reference line
  - Corm Rot Risk (85%) - Orange reference line
  - Auto-refresh every 30 seconds

- **NPKGauge**: Saffron-optimized nutrient ranges
  - Nitrogen: 10-15 ppm
  - Phosphorus: 8-12 ppm
  - Potassium: 12-18 ppm
  - Color-coded status (Low/Optimal/High)

### 2. Phenology Detection
- **Dormant Stage** (May-September): Plant hibernation at temps >25°C
- **Flowering Stage** (October-November): Critical blooming at temps <15°C
  - Special protection: blocks fertilizer recommendations during this period
- **Vegetative Stage** (December-April): Active growth at 10-20°C

### 3. Field Health Scoring
Composite vitality index combining:
- **30% Moisture**: Penalizes values outside 35-75% range
- **30% Nutrients**: Assesses N-P-K balance against optimal ranges
- **20% Temperature**: Stress penalty for extremes (<5°C or >35°C)
- **20% Pest Risk**: Based on temperature-humidity combinations

Formula: `vitality = (moisture_score × 0.3) + (nutrient_score × 0.3) + (temp_score × 0.2) + ((100 - pest_risk) × 0.2)`

### 4. Alert System
Types and triggers:
- **MOISTURE_LOW**: <30% on either sensor
- **MOISTURE_HIGH**: >85% (corm rot risk)
- **NUTRIENT_DEFICIENCY**: Any nutrient below min range
- **TEMPERATURE_STRESS**: <5°C or >35°C
- **PHENOLOGY_CHANGE**: Growth stage transition detected
- **PEST_RISK**: High temperature + high humidity combination

Features:
- Snooze functionality (1h, 4h, 24h options)
- Acknowledgment tracking
- Severity levels (INFO/WARNING/CRITICAL)

### 5. Saffron Cultivation Advisor (Chat)
Context-aware responses for:
- Moisture management (optimal ranges, sensor interpretation)
- Nutrient planning (NPK application, timing)
- Growth stage explanation (what to expect, what to avoid)
- Irrigation scheduling (when to water, how much)
- Flowering protection (critical stage handling)

## API Endpoints (Frontend Client)

```typescript
// Farms
farmApi.getFarms() - Get all user farms
farmApi.getFarmById(id) - Get single farm
farmApi.createFarm(name, location, zone) - Create new farm

// Sensors
sensorApi.getLatestReading(farmId) - Most recent sensor data
sensorApi.getReadings(farmId, limit) - Paginated readings
sensorApi.getReadingsInRange(farmId, start, end) - Date range query

// Alerts
alertApi.getAlerts(farmId, limit) - Retrieve alerts
alertApi.acknowledgeAlert(id) - Mark as seen
alertApi.snoozeAlert(id, minutes) - Suppress for duration

// Health Scores
healthScoreApi.getLatestHealthScore(farmId) - Current vitality
healthScoreApi.getHealthScoresInRange(farmId, start, end) - Historical

// Phenology
phenologyApi.getCurrentCropCycle(farmId) - Active growth cycle
phenologyApi.getPhenologyEvents(farmId) - Stage change history
```

## React Query Caching Strategy

| Data Type | Stale Time | Refetch Interval |
|-----------|-----------|------------------|
| Farms | 10m | On demand |
| Latest Reading | 1m | 30s |
| Historical Readings | 5m | On demand |
| Alerts | 1m | 2m |
| Health Score | 5m | 5m |

## Security Implementation

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- Users can only access farms they own
- Sensor data tied to farm ownership
- Alerts scoped to user's farms
- Automatic enforcement at database level

### API Security
- All writes require farm ownership verification
- Email/password authentication via Supabase
- JWT tokens automatically refreshed
- CORS configured for production domains

## Performance Optimizations

### Frontend
- **Code Splitting**: React Router lazy loading for pages
- **Component Memoization**: Prevents unnecessary re-renders
- **Query Caching**: React Query deduplicates requests
- **Lazy Loading**: Charts render optimally at different viewport sizes

### Database
- **Indexes**: (farm_id, timestamp) composite index for sensor queries
- **Pagination**: Max 1000 records per request
- **Connection Pooling**: Supabase handles automatically

### Network
- **Compression**: Recharts and API responses gzipped
- **Progressive Enhancement**: Works with slow connections

## Offline Capability (PWA Ready)

Current state:
- ✅ Service worker configuration ready
- ✅ IndexedDB strategy defined
- ⏳ Implementation guide provided

To implement offline support:
1. Add `vite-plugin-pwa` to package.json
2. Configure service worker caching strategies
3. Implement IndexedDB fallback for real-time queries
4. Add sync queue for offline modifications

## Deployment Architecture

### Development
```bash
npm run dev  # Vite dev server on localhost:5173
# Auto-reload on file changes
# Supabase local dev or cloud instance
```

### Production Build
```bash
npm run build  # Vite optimized build
npm run preview  # Test production build locally
```

### Deployment Options

**Option 1: Vercel (Recommended)**
```bash
vercel deploy
# Auto-deploys on git push
# Environment: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

**Option 2: Self-hosted**
```bash
npm run build
# Serve dist/ folder via nginx or Node.js
# Point domain to server
```

## Next Steps for Production

1. **Backend Ingestion Service**: Create Python/Node service to poll Thingspeak every 15min
2. **ML Models**: Train phenology detection on historical farm data
3. **Email/SMS Alerts**: Configure notification channels via SendGrid/Twilio
4. **Advanced Analytics**: Implement trend analysis and yield prediction
5. **Mobile App**: Build React Native companion for field access
6. **Satellite Integration**: Add multispectral imagery for crop health
7. **Multi-language**: Localize UI for Kashmiri/Hindi speaking farmers
8. **Offline Sync**: Complete PWA implementation for connectivity resilience

## Troubleshooting

### Blank Login Screen
- Check Supabase URL and anon key in `.env`
- Verify OAuth provider configured in Supabase dashboard

### No Sensor Data Showing
- Ensure farm is created and linked to your user account
- Check Thingspeak API key and channel ID in ingestion service
- Verify RLS policies allow farm data access

### Build Errors
```bash
npm install  # Reinstall dependencies
npm run typecheck  # Check for TypeScript errors
npm run lint  # Find ESLint issues
```

## Support & Feedback

For issues or feature requests, document:
- Error message or unexpected behavior
- Steps to reproduce
- Browser/device information
- Supabase logs (if applicable)
