# Vehicle Diagnostic Application

A comprehensive diagnostic management system for Electric Vehicles (EV), Plug-in Hybrid Electric Vehicles (PHEV), and Internal Combustion Engine (ICE) vehicles. Built with React, TypeScript, and Supabase for multi-station vehicle service management.

## 🚗 Features

- **Multi-Vehicle Type Support**: Comprehensive diagnostic forms for EV, PHEV, and ICE vehicles
- **Station Management**: Multi-location service center support with role-based access
- **User Role System**: Super Admin, Station Admin, Technician, and Front Desk roles
- **Subscription Management**: Trial and paid subscription tiers with usage tracking
- **Print & Export**: Generate professional diagnostic reports
- **Email Integration**: Automated notifications and support system
- **Responsive Design**: Mobile-first design with dark/light mode support

## 🎨 Customization

### Branding & Colors

The application uses a semantic color system defined in `src/index.css` and `tailwind.config.ts`. To customize your brand:

1. **Update CSS Variables** in `src/index.css`:
```css
:root {
  /* Primary brand colors */
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 84% 4.9%;
  
  /* Secondary colors */
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  
  /* Accent colors */
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  
  /* Tech theme gradients */
  --gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
  --gradient-electric: linear-gradient(45deg, #00d4ff, #0066ff, #004cff);
}
```

2. **Update Tailwind Config** in `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  // Add your custom brand colors
  brand: {
    blue: "hsl(210, 100%, 50%)",
    green: "hsl(120, 100%, 40%)",
  }
}
```

3. **Logo & Assets**: Replace files in `public/` directory:
   - `favicon.ico` - Browser favicon
   - `opengraph-image.png` - Social media preview image

### Layout Customization

- **Header**: Modify `src/components/Dashboard.tsx` for navigation layout
- **Sidebar**: Customize in `src/components/ui/sidebar.tsx`
- **Forms**: Vehicle-specific forms in `src/components/diagnostic/`
- **Landing Page**: Update `src/pages/LandingPage.tsx` for public-facing content

### Typography

Update font families in `tailwind.config.ts`:
```typescript
fontFamily: {
  'orbitron': ['Orbitron', 'monospace'],
  'exo': ['Exo 2', 'sans-serif'],
  'custom': ['Your Custom Font', 'fallback'],
}
```

## 🚀 Deployment

### Environment Setup

Create a `.env` file with your configuration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
```

### Deployment Platforms

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify or connect GitHub repo
```

#### Traditional Hosting
```bash
npm run build
# Upload dist/ folder to your web server
```

## 🗄️ Database Connections

### Supabase (Current Implementation)

Already configured! The app uses Supabase for:
- Authentication
- PostgreSQL database
- Row Level Security (RLS)
- Edge Functions

Connection is in `src/integrations/supabase/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'your_supabase_url',
  'your_supabase_anon_key'
);
```

### PostgreSQL (Alternative)

For direct PostgreSQL connection:

```typescript
// Install: npm install pg @types/pg
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Environment variables needed:
// DB_HOST=localhost
// DB_PORT=5432
// DB_NAME=vehicle_diagnostics
// DB_USER=your_username
// DB_PASSWORD=your_password
```

### MySQL

```typescript
// Install: npm install mysql2
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
});

// Environment variables needed:
// MYSQL_HOST=localhost
// MYSQL_PORT=3306
// MYSQL_DATABASE=vehicle_diagnostics
// MYSQL_USER=your_username
// MYSQL_PASSWORD=your_password
```

### MongoDB

```typescript
// Install: npm install mongodb
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
await client.connect();
const db = client.db(process.env.MONGODB_DATABASE);

// Environment variables needed:
// MONGODB_URI=mongodb://localhost:27017
// MONGODB_DATABASE=vehicle_diagnostics
```

## 📊 Database Schema

### Core Tables Schema (SQL)

```sql
-- Stations (Service Centers)
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    station_id UUID REFERENCES stations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Roles System
CREATE TYPE app_role AS ENUM ('super_admin', 'station_admin', 'technician', 'front_desk');

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    station_id UUID REFERENCES stations(id),
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

-- EV Diagnostic Records
CREATE TABLE ev_diagnostic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES auth.users(id) NOT NULL,
    station_id UUID REFERENCES stations(id),
    customer_name TEXT NOT NULL,
    vin TEXT NOT NULL,
    ro_number TEXT NOT NULL,
    make_model TEXT,
    mileage TEXT,
    
    -- Battery Issues
    battery_warnings TEXT,
    battery_warnings_details TEXT,
    range_drop TEXT,
    range_drop_details TEXT,
    
    -- Charging Issues
    failed_charges TEXT,
    failed_charges_details TEXT,
    charging_issues_home TEXT,
    charging_issues_home_details TEXT,
    charging_issues_public TEXT,
    charging_issues_public_details TEXT,
    charger_type TEXT,
    aftermarket_charger TEXT,
    aftermarket_details TEXT,
    
    -- Performance Issues
    power_loss TEXT,
    power_loss_details TEXT,
    consistent_acceleration TEXT,
    acceleration_details TEXT,
    
    -- HVAC & Climate
    hvac_performance TEXT,
    hvac_details TEXT,
    defogger_performance TEXT,
    defogger_details TEXT,
    
    -- Regenerative Braking
    smooth_regen TEXT,
    smooth_regen_details TEXT,
    regen_strength TEXT,
    regen_strength_details TEXT,
    
    -- Environmental Conditions
    temperature_during_issue TEXT,
    time_of_day TEXT,
    vehicle_parked TEXT,
    hvac_weather_difference TEXT,
    hvac_weather_details TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PHEV Diagnostic Records
CREATE TABLE phev_diagnostic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES auth.users(id) NOT NULL,
    station_id UUID REFERENCES stations(id),
    customer_name TEXT NOT NULL,
    vin TEXT NOT NULL,
    ro_number TEXT NOT NULL,
    vehicle_make TEXT,
    model TEXT,
    mileage TEXT,
    fuel_type TEXT,
    
    -- Fuel Usage
    fuel_source TEXT,
    petrol_vs_ev_usage TEXT,
    fuel_economy_change TEXT,
    fuel_economy_details TEXT,
    fuel_consumption TEXT,
    fuel_consumption_details TEXT,
    average_electric_range TEXT,
    
    -- Battery & Charging
    battery_charging TEXT,
    battery_charging_details TEXT,
    charger_type TEXT,
    ev_range_expected TEXT,
    ev_range_details TEXT,
    excessive_ice_operation TEXT,
    ice_operation_details TEXT,
    
    -- Mode Switching
    switching_lags TEXT,
    switching_details TEXT,
    engine_start_ev_mode TEXT,
    engine_start_details TEXT,
    regular_modes TEXT[],
    
    -- Performance Issues
    abnormal_vibrations TEXT,
    vibrations_details TEXT,
    acceleration_issues TEXT,
    acceleration_details TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ICE Diagnostic Records
CREATE TABLE ice_diagnostic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES auth.users(id) NOT NULL,
    station_id UUID REFERENCES stations(id),
    customer_name TEXT NOT NULL,
    vin TEXT NOT NULL,
    ro_number TEXT NOT NULL,
    vehicle_make TEXT,
    model TEXT,
    year TEXT,
    mileage TEXT,
    engine_size TEXT,
    fuel_type TEXT,
    
    -- Engine Performance
    engine_starting TEXT,
    engine_starting_details TEXT,
    idle_quality TEXT,
    idle_quality_details TEXT,
    acceleration_issues TEXT,
    acceleration_details TEXT,
    power_loss TEXT,
    power_loss_details TEXT,
    engine_stalling TEXT,
    engine_stalling_details TEXT,
    
    -- Engine Issues
    rough_running TEXT,
    rough_running_details TEXT,
    engine_knocking TEXT,
    engine_knocking_details TEXT,
    unusual_noises TEXT,
    unusual_noises_details TEXT,
    excessive_vibration TEXT,
    vibration_details TEXT,
    
    -- Fuel System
    fuel_consumption TEXT,
    fuel_consumption_details TEXT,
    fuel_quality_issues TEXT,
    fuel_quality_details TEXT,
    fuel_pump_issues TEXT,
    fuel_pump_details TEXT,
    
    -- Cooling System
    overheating TEXT,
    overheating_details TEXT,
    coolant_leaks TEXT,
    coolant_leak_details TEXT,
    radiator_issues TEXT,
    radiator_details TEXT,
    
    -- Oil System
    oil_pressure_issues TEXT,
    oil_pressure_details TEXT,
    oil_leaks TEXT,
    oil_leak_details TEXT,
    oil_consumption TEXT,
    oil_consumption_details TEXT,
    
    -- Electrical System
    battery_issues TEXT,
    battery_details TEXT,
    alternator_issues TEXT,
    alternator_details TEXT,
    starter_issues TEXT,
    starter_details TEXT,
    check_engine_light TEXT,
    check_engine_details TEXT,
    
    -- Transmission
    transmission_issues TEXT,
    transmission_details TEXT,
    gear_shifting TEXT,
    gear_shifting_details TEXT,
    clutch_issues TEXT,
    clutch_details TEXT,
    
    -- Environmental Conditions
    temperature_during_issue TEXT,
    driving_conditions TEXT[],
    other_driving_conditions TEXT,
    maintenance_history TEXT,
    recent_repairs TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Subscription Management
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL DEFAULT 0,
    billing_interval TEXT NOT NULL DEFAULT 'month',
    trial_days INTEGER DEFAULT 0,
    is_trial BOOLEAN NOT NULL DEFAULT false,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id),
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'trial',
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### MongoDB Schema Example

```javascript
// Collections structure for MongoDB
const schemas = {
  stations: {
    _id: ObjectId,
    name: String,
    email: String,
    phone: String,
    address: String,
    createdAt: Date,
    updatedAt: Date
  },
  
  diagnosticRecords: {
    _id: ObjectId,
    type: String, // 'ev', 'phev', 'ice'
    technicianId: ObjectId,
    stationId: ObjectId,
    customerName: String,
    vin: String,
    roNumber: String,
    vehicleInfo: {
      make: String,
      model: String,
      year: String,
      mileage: String
    },
    diagnosticData: {}, // Flexible object for vehicle-specific data
    createdAt: Date,
    updatedAt: Date
  },
  
  users: {
    _id: ObjectId,
    email: String,
    fullName: String,
    stationId: ObjectId,
    roles: [String],
    createdAt: Date,
    updatedAt: Date
  }
};
```

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend)

### Local Development
```bash
git clone <your-repo-url>
cd vehicle-diagnostic-app
npm install
npm run dev
```

### Project Structure
```
src/
├── components/          # React components
│   ├── diagnostic/      # Vehicle diagnostic forms
│   ├── ui/             # Reusable UI components
│   └── ...
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── contexts/           # React contexts
└── integrations/       # External service integrations
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **State Management**: React Context + useState

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For technical support or questions:
- Email: support@yourcompany.com
- Documentation: [Your docs URL]
- Issues: [Your issue tracker URL]
