# SaffronTech - IoT Monitoring for Saffron Cultivation

A production-grade web application for real-time monitoring and optimization of saffron (Crocus sativus) cultivation in Kashmir. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Real-Time Monitoring
- **Dual Soil Moisture Sensors**: Live tracking with visual thresholds for wilting point (30%) and corm rot risk (85%)
- **NPK Nutrient Tracking**: Saffron-optimized ranges (N: 10-15, P: 8-12, K: 12-18 ppm) with color-coded status indicators
- **Environmental Sensors**: Air temperature, soil temperature, humidity, pH, and light intensity
- **Field Health Score**: Composite 0-100 vitality index combining moisture (30%), nutrients (30%), temperature (20%), and pest risk (20%)

### Saffron-Specific Intelligence
- **Phenology Detection**: Automatic growth stage identification
  - Dormant (May-Sep): Plant hibernation at temps >25°C
  - Flowering (Oct-Nov): Critical blooming stage, protected from excess fertilization
  - Vegetative (Dec-Apr): Active growth at optimal 10-20°C
- **NPK Recommendations**: Smart nutrient suggestions blocked during flowering to protect blossoms
- **Moisture Forecasting**: Predictive 48-hour moisture trends
- **Alert System**: Multi-level alerts (INFO/WARNING/CRITICAL) for:
  - Moisture extremes (wilting or corm rot risk)
  - Nutrient deficiencies
  - Temperature stress
  - Phenology changes
  - Pest risk combinations

### Saffron Cultivation Advisor
Context-aware chatbot providing guidance on:
- Irrigation optimization for Kashmir's water availability
- NPK application timing considering growth stages
- Flowering stage protection strategies
- Temperature management for crop success

### Multi-Farm Management
- Switch between multiple farms in one account
- View all farms at a glance or focus on one
- Per-farm alerts and recommendations

### Mobile-Responsive Design
- Works seamlessly on phones, tablets, and desktops
- Touch-friendly interface for field use with intermittent connectivity
- Optimized for low-bandwidth rural environments

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router v6
- **State Management**: TanStack React Query (server state) + React hooks (UI state)
- **Styling**: Tailwind CSS + custom Lucide React icons
- **Visualization**: Recharts for time-series charts
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with OAuth2 (Google)
- **Deployment**: Vercel or self-hosted VPS

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd project

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
# Open http://localhost:5173
```

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from Supabase Dashboard → Project Settings → API

## Project Structure

```
src/
├── components/          # React components
│   ├── layout/         # Header, Sidebar
│   ├── common/         # Reusable Card components
│   ├── sensors/        # MoistureGraph, NPKGauge, FieldHealthScore, PhenologyStage
│   ├── alerts/         # AlertPanel
│   └── chat/           # ChatAssistant
├── pages/              # Page components (Dashboard, Analytics, Alerts, Settings)
├── hooks/              # useFarmData - React Query hooks
├── lib/                # supabase.ts (client init), api.ts (type-safe queries)
├── types/              # TypeScript interfaces for all entities
├── App.tsx             # Router and auth wrapper
└── main.tsx            # Vite entry point
```

## Database Schema

Three migration files set up the complete database:

1. **001_create_core_tables**: `farms`, `sensor_readings`
2. **002_create_agronomy_tables**: `crop_cycles`, `phenology_events`, `npk_recommendations`
3. **003_create_alerts_monitoring_tables**: `alerts`, `field_health_scores`, `irrigation_events`

All tables have:
- Row Level Security enabled
- Policies enforcing farm ownership
- Proper indexes for performance
- Default values and constraints

## API Reference

All data access goes through type-safe client functions:

```typescript
// Farms
farmApi.getFarms()
farmApi.createFarm(name, location, kashmirZone)

// Sensors
sensorApi.getLatestReading(farmId)
sensorApi.getReadings(farmId, limit, offset)
sensorApi.getReadingsInRange(farmId, startTime, endTime)

// Alerts
alertApi.getAlerts(farmId)
alertApi.acknowledgeAlert(alertId)
alertApi.snoozeAlert(alertId, minutes)

// Health Scores & Phenology
healthScoreApi.getLatestHealthScore(farmId)
phenologyApi.getCurrentCropCycle(farmId)
phenologyApi.getPhenologyEvents(farmId)
```

## Authentication

- Sign in with Google OAuth via Supabase
- User data automatically linked to farms
- Automatic session refresh
- Logout available in header

## Production Deployment

### Vercel (Recommended)
```bash
npm run build
git push origin main
# Auto-deploys to Vercel
```

### Self-Hosted
See `SETUP_GUIDE.md` for step-by-step VPS deployment with nginx, PM2, and Let's Encrypt SSL.

## Integrating Sensor Data

### From Thingspeak
The system expects data from a Thingspeak channel with:
- field1: Nitrogen
- field2: Phosphorus
- field3: Potassium
- field4: Soil Moisture Sensor 1
- field5: Soil Moisture Sensor 2
- Plus optional fields for temperature, humidity, etc.

Create a backend ingestion service to poll Thingspeak every 15 minutes and insert into `sensor_readings` table. See `SETUP_GUIDE.md` for Supabase Edge Function example.

### Manual Testing
Insert test data via Supabase SQL Editor:

```sql
INSERT INTO sensor_readings (
  farm_id, n_value, p_value, k_value,
  soil_moisture_1, soil_moisture_2,
  air_temp, soil_temp, humidity, light_lux, ph_level
) VALUES (
  (SELECT id FROM farms LIMIT 1),
  12.5, 10.0, 15.0, 45.0, 50.0,
  22.0, 18.0, 65.0, 5000, 6.8
);
```

## Key Saffron Cultivation Constants

All hardcoded in components for easy adjustment:

**Optimal Ranges:**
- Soil Moisture: 35-75% (Wilting <30%, Corm Rot >85%)
- Nitrogen: 10-15 ppm
- Phosphorus: 8-12 ppm
- Potassium: 12-18 ppm
- Soil pH: 6.0-7.5
- Soil Temperature: 10-25°C
- Air Temperature: 15-28°C

**Critical Constraints:**
- No nitrogen fertilization during flowering (Oct-Nov) to protect blossoms
- Dormant stage requires 25°C+ (May-Sep)
- Flowering requires <15°C soil temperature

## Performance Optimizations

- **React Query Caching**: 5-60 minute stale times depending on data type
- **Code Splitting**: Lazy-loaded pages reduce initial bundle (~360KB gzipped)
- **Responsive Charts**: Optimized rendering for mobile/desktop
- **Database Indexes**: (farm_id, timestamp) composite on sensor_readings
- **Pagination**: Max 1000 records per query

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations

- Chat assistant uses rule-based responses (ready for LLM integration)
- Analytics and Settings pages are placeholder stubs
- Phenology detection uses temperature heuristics (ready for ML models)
- No offline PWA support yet (infrastructure ready)

## Roadmap

- [ ] Real LLM integration for ChatAssistant (OpenAI/Anthropic)
- [ ] Machine learning phenology detection trained on Kashmir farm data
- [ ] Email/SMS alert notifications via SendGrid/Twilio
- [ ] Satellite imagery integration for crop health assessment
- [ ] Historical yield prediction model
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Kashmiri, Hindi)
- [ ] PWA offline capability with background sync
- [ ] Agronomist dashboard for farm consulting
- [ ] Marketplace for fertilizer and equipment

## Troubleshooting

### Blank login screen
- Check `.env` has correct Supabase URL and keys
- Verify Google OAuth is configured in Supabase dashboard

### No sensor data appearing
- Create a test farm first
- Insert test sensor readings via SQL
- Check browser console for errors
- Verify RLS policies (use `SELECT * FROM sensor_readings` in SQL editor)

### Build errors
```bash
npm install  # Reinstall dependencies
npm run typecheck  # Check TypeScript
npm run lint  # Check ESLint
```

## Documentation

- **ARCHITECTURE.md**: System design, data flow, component structure
- **SETUP_GUIDE.md**: Development setup, deployment options, monitoring
- **README.md**: This file - feature overview and quick start

## Support

For issues or feature requests:
1. Check browser console for errors
2. Review Supabase logs in dashboard
3. Verify environment variables
4. Test with SQL queries in Supabase SQL Editor

## License

Built for production use in Kashmir saffron farming community.

---

Built with precision for saffron cultivation. Every field matters.
