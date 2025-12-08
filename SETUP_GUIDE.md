# SaffronTech - Setup & Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase project (free tier works)
- Git (for version control)

### 1. Clone and Install
```bash
git clone <repository-url>
cd project
npm install
```

### 2. Configure Environment Variables
Create `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from Supabase Dashboard:
- Project → Settings → API
- Copy `Project URL` and `anon public` key

### 3. Initialize Database
The database schema is already created via migrations in Supabase.

Verify tables were created:
1. Go to Supabase Dashboard
2. Project → SQL Editor
3. Run: `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
4. Should see: `farms`, `sensor_readings`, `crop_cycles`, `phenology_events`, `alerts`, `field_health_scores`, `npk_recommendations`, `irrigation_events`

### 4. Run Development Server
```bash
npm run dev
```
Open http://localhost:5173 in browser

### 5. Test Login
1. Click "Sign In"
2. Use Google OAuth to create account
3. You're now authenticated

### 6. Create a Test Farm
1. On Dashboard, you should see "Select Farm" dropdown
2. Currently empty - create one through admin panel or API
3. Or use this SQL in Supabase SQL Editor:

```sql
INSERT INTO farms (name, location, kashmir_zone, owner_id)
VALUES ('Test Farm', 'Srinagar', 'kashmiri_plains', auth.uid())
RETURNING *;
```

Replace `auth.uid()` with your actual user ID from Supabase Auth.

## Core Features Testing

### Test Sensor Data Ingestion
1. Insert test sensor readings:
```sql
INSERT INTO sensor_readings (
  farm_id, n_value, p_value, k_value,
  soil_moisture_1, soil_moisture_2,
  air_temp, soil_temp, humidity, light_lux, ph_level,
  data_quality_score
) VALUES (
  (SELECT id FROM farms LIMIT 1),
  12.5, 10.0, 15.0,
  45.0, 50.0,
  22.0, 18.0, 65.0, 5000, 6.8,
  95
);
```

2. Refresh Dashboard - should see new data in:
   - Quick stats cards
   - NPKGauge component
   - Last Reading info

### Test Alerts
1. Create alert via SQL:
```sql
INSERT INTO alerts (farm_id, alert_type, severity, message)
VALUES (
  (SELECT id FROM farms LIMIT 1),
  'MOISTURE_LOW',
  'WARNING',
  'Soil moisture dropped below optimal range'
);
```

2. Dashboard → Alerts section should show the alert
3. Test "Acknowledge" button
4. Test "Snooze 1h" button

### Test Phenology Detection
Current implementation uses temperature-based heuristics:
- `soil_temp < 15°C` → Flowering stage
- `soil_temp >= 10°C AND <= 20°C` → Vegetative stage
- `soil_temp > 25°C` → Dormant stage

Test by inserting readings with different temperatures.

### Test Chat Assistant
1. Click chat bubble (bottom right)
2. Ask questions like:
   - "What's the optimal moisture?"
   - "How should I irrigate?"
   - "What does flowering mean?"
   - "What about nutrients?"
3. Chat provides context-aware responses

## Production Deployment

### Option 1: Vercel (Easiest)

1. **Connect Git Repository**
   ```bash
   git push origin main  # Push code to GitHub/GitLab
   ```

2. **Link Vercel Project**
   - Go to vercel.com
   - Click "Add New" → "Project"
   - Import your Git repository
   - Select `main` branch

3. **Set Environment Variables**
   - In Vercel → Project Settings → Environment Variables
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
   - These are prefixed with `VITE_` for client-side access

4. **Deploy**
   - Vercel auto-deploys on every push
   - Get production URL (e.g., `https://saffrontech.vercel.app`)

5. **Configure Supabase CORS**
   - Supabase Dashboard → Settings → API
   - Add your Vercel domain to CORS Allowed Origins

### Option 2: Self-Hosted VPS

#### Prerequisites
- VPS with Ubuntu 20.04+ (AWS EC2, DigitalOcean, Linode, etc.)
- Domain name with DNS configured
- SSL certificate (Let's Encrypt, free)

#### Steps

1. **Connect to VPS**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Install Node.js & npm**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node --version  # Verify
   ```

3. **Install Git & PM2**
   ```bash
   sudo apt-get install -y git
   sudo npm install -g pm2
   ```

4. **Clone Repository**
   ```bash
   cd /var/www
   git clone <your-repo-url> saffrontech
   cd saffrontech
   npm install
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

6. **Set Environment Variables**
   ```bash
   nano .env.production  # Create production env file
   ```
   Add:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

7. **Serve with PM2**
   ```bash
   pm2 start "npm run build && npm run preview" --name saffrontech
   pm2 startup
   pm2 save
   ```

8. **Configure Nginx Reverse Proxy**
   ```bash
   sudo apt-get install -y nginx
   ```

   Create `/etc/nginx/sites-available/saffrontech`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:4173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/saffrontech /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

9. **Enable SSL with Let's Encrypt**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

10. **Update Supabase CORS**
    - Add `https://your-domain.com` to CORS origins

### Backend Ingestion Service Setup

For automated Thingspeak data pulling, create a backend service:

#### Option A: Supabase Edge Function

1. Create `supabase/functions/ingest-thingspeak/index.ts`:
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

   const THINGSPEAK_KEY = Deno.env.get("THINGSPEAK_API_KEY");
   const CHANNEL_ID = "724299";

   serve(async (req) => {
     if (req.method !== "POST") {
       return new Response("Method not allowed", { status: 405 });
     }

     try {
       const response = await fetch(
         `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_KEY}&results=1`
       );
       const data = await response.json();
       const feed = data.feeds[0];

       // Insert into Supabase
       const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
       const supabase = createClient(
         Deno.env.get("SUPABASE_URL")!,
         Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
       );

       const { error } = await supabase.from("sensor_readings").insert({
         farm_id: Deno.env.get("FARM_ID"),
         n_value: parseInt(feed.field1),
         p_value: parseInt(feed.field2),
         k_value: parseInt(feed.field3),
         soil_moisture_1: parseInt(feed.field4),
         soil_moisture_2: parseInt(feed.field5),
       });

       if (error) throw error;
       return new Response("OK");
     } catch (err) {
       return new Response(`Error: ${err.message}`, { status: 500 });
     }
   });
   ```

2. Deploy: `supabase functions deploy ingest-thingspeak`

3. Schedule via external cron service (EasyCron, Cron-job.org):
   - URL: `https://your-project.functions.supabase.co/ingest-thingspeak`
   - Interval: Every 15 minutes
   - Auth Header: Add `Authorization: Bearer <anon-key>`

#### Option B: External Cron Service

Create a simple Node.js script and run via system cron:

```bash
# Create /usr/local/bin/saffrontech-ingest.js
# Add to crontab: */15 * * * * node /usr/local/bin/saffrontech-ingest.js
```

## Monitoring & Maintenance

### Check Application Status
```bash
pm2 status  # View running processes
pm2 logs saffrontech  # View logs
pm2 monit  # Real-time monitoring
```

### Database Backups
Supabase provides automatic backups. To manual backup:

```bash
# Export data as SQL
supabase db pull
```

### Performance Monitoring
1. Supabase Dashboard → Analytics → Query Performance
2. Monitor slow queries and optimize indexes if needed

### Updating Application
```bash
cd /var/www/saffrontech
git pull origin main
npm install
npm run build
pm2 restart saffrontech
```

## Troubleshooting Deployment

### Issue: "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Supabase connection fails
- Verify `.env` file has correct URL and keys
- Check Supabase project is still active (not paused)
- Ensure CORS allows your domain

### Issue: Slow performance
1. Check Network tab in browser DevTools
2. Profile with React DevTools
3. Review Supabase query logs
4. Consider adding database indexes

### Issue: OAuth login not working
- Verify callback URL in Supabase OAuth config
- Ensure production domain matches Supabase settings

## SSL Certificate Renewal
Let's Encrypt certificates expire every 90 days. Certbot auto-renews:

```bash
sudo certbot renew  # Manual renewal
certbot certificates  # Check expiration dates
```

## Scaling Considerations

### Database Scaling
- Supabase Pro: 50GB storage, more connections
- Read replicas for high-traffic scenarios
- Backup strategies for data redundancy

### Frontend Scaling
- CDN (Cloudflare, CloudFront) for static assets
- Multiple deployment regions
- Load balancing for multiple servers

### Backend Services
- Consider managed queue systems (Bull, RabbitMQ)
- Separate data ingestion from API servers
- Redis caching layer for frequently accessed data

## Support

For issues:
1. Check Supabase status page
2. Review browser console for errors
3. Check application logs: `pm2 logs`
4. Verify environment variables are set correctly
