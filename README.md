# ChiSnow - Snowfall Mapping Application

A mobile-first web application that displays actual snowfall totals on an interactive map after snowfall events in the United States, with a primary focus on the Chicagoland area.

## Features

- **Interactive Map**: View snowfall data on an interactive Mapbox map
- **Dual Visualization**: Toggle between choropleth (filled regions) and marker layers
- **Recent Storm History**: Access the last 5-10 snowfall events
- **Mobile-First Design**: Optimized for mobile devices with responsive layouts
- **Real Data**: Fetches actual measurements from NOAA APIs

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, React 18+, TypeScript
- **Styling**: Tailwind CSS
- **Mapping**: Mapbox GL JS
- **Deployment**: Vercel
- **Data Sources**: NOAA National Weather Service API, NOAA National Gridded Snowfall Analysis

## Prerequisites

- Node.js 18+ and npm/pnpm
- Mapbox API key (free tier: 50k loads/month)
- Git

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd ChiSnow
```

### 2. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
# Mapbox API Token (required)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# NOAA Data Source (optional, defaults to false)
# Set to 'true' to use real NOAA NWS API data (current snow depth from Illinois stations)
# Set to 'false' to use mock data for development
USE_REAL_NOAA_DATA=false
```

**Getting API Keys:**
- Mapbox token (free): https://account.mapbox.com/access-tokens/

**About USE_REAL_NOAA_DATA:**
- `false` (default): Uses mock data with 5 Chicagoland area markers for development
- `true`: Queries 25+ Illinois weather stations for real current snow depth
  - Shows only stations with snow currently on the ground (0+ inches)
  - Updates every time the API is called
  - May be empty if no snow is currently present in Illinois

### 3. Run the initialization script

```bash
./init.sh
```

This script will:
- Check for Node.js 18+
- Install dependencies
- Start the development server

### Manual Setup (Alternative)

If you prefer to set up manually:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
ChiSnow/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage with map
│   ├── about/             # About page
│   └── api/               # API routes
│       └── snowfall/      # Snowfall data endpoints
├── components/            # React components
│   ├── SnowfallMap.tsx   # Main map component
│   ├── StormSelector.tsx # Storm selection dropdown
│   └── MapControls.tsx   # Map control buttons
├── lib/                   # Utility functions
│   ├── api.ts            # API client functions
│   └── utils.ts          # Helper utilities
├── types/                 # TypeScript type definitions
│   └── index.ts          # Shared types
├── public/                # Static assets
├── feature_list.json      # Test cases and features
├── app_spec.txt          # Complete project specification
└── CLAUDE.md             # Development guidelines
```

## Development

### Running Tests

```bash
npm run test
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add `NEXT_PUBLIC_MAPBOX_TOKEN` to environment variables in Vercel
4. Deploy!

The app will be available at: `https://chisnow.vercel.app`

## Data Sources

- **NOAA National Weather Service API**: Real-time weather observations
- **NOAA National Gridded Snowfall Analysis**: Comprehensive snowfall analysis

All data is properly attributed to its source.

## Performance Targets

- Initial page load: Under 2 seconds on 3G
- Lighthouse performance score: 90+
- First Contentful Paint: Under 1 second
- Time to Interactive: Under 3 seconds

## Future Enhancements

- Live during-storm updates (2-3 times during active snowfall)
- CoCoRaHS community observation data integration
- Model forecast comparison (actual vs GFS/NAM/HRRR predictions)
- Historical storm archive (multiple seasons)
- User location detection and auto-centering
- Share storm view via URL

## Contributing

Please refer to `CLAUDE.md` for development guidelines and conventions.

## License

TBD
