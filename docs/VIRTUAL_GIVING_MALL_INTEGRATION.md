# Virtual Giving Mall - Charity API Integration

## Overview

The Virtual Giving Mall has been successfully integrated with the Charity API system. It now displays real charities from your database instead of hardcoded data.

## What Changed

### ✅ Hardcoded Data Removed

The following hardcoded data has been commented out:
- 18 hardcoded charities (British Heart Foundation, Cancer Research UK, Save the Children, etc.)
- Static charity data structure

All this data is now replaced with dynamic data from the database.

### ✅ Real-Time Data Integration

The Virtual Giving Mall now uses:

1. **`useCharities` Hook** - Fetches charities from `/api/charities`
   - Filters by search query
   - Filters by category
   - Only shows verified and active charities
   - Loads up to 100 charities

2. **`useCharityCategories` Hook** - Fetches categories from `/api/charities/categories`
   - Dynamic category list with counts
   - Auto-updates when charities are added

### ✅ Updated Features

**Dynamic Categories:**
- Categories are now pulled from the database
- Includes charity counts per category
- Intelligent icon mapping based on category name
- Supports new categories automatically

**Charity Cards:**
- Display real charity logos (with fallback if no logo)
- Show verification badges for verified charities
- Link to charity detail pages (`/charities/[slug]`)
- Proper loading states with skeleton screens
- Error handling with user-friendly messages

**Search & Filter:**
- Search now queries the API in real-time
- Category filtering uses database categories
- Results update automatically

## How It Works

### Data Flow

```
Virtual Giving Mall Page
    ↓
useCharities Hook
    ↓
GET /api/charities?verified=true&active=true&limit=100
    ↓
Database Query (charities table)
    ↓
Returns charity data to component
    ↓
Display in grid/list view
```

### Category Mapping

The page intelligently maps category names to icons:

```typescript
const categoryIcons = {
  "Health": Stethoscope,
  "Children": Users,
  "Children & Youth": Users,
  "Education": GraduationCap,
  "Environment": TreePine,
  "Disaster Relief": Shield,
  // ... etc
};
```

New categories automatically get a `Heart` icon as fallback.

### Charity Card Structure

Each charity card now displays:
- **Logo** - From `charity.logo` field (with fallback)
- **Name** - From `charity.name` 
- **Category** - From `charity.category`
- **Verified Badge** - If `charity.isVerified === true`
- **Donate Button** - Links to `/charities/[slug]` for donation

## Setup Instructions

### 1. Ensure Database is Seeded

Run the seed command to populate charities:

```bash
npm run seed-charities
```

This adds 10 verified charities to your database.

### 2. Access the Virtual Giving Mall

Navigate to: `http://localhost:3000/virtual-giving-mall`

### 3. Test Features

**Search:**
- Try searching for "children" or "health"
- Results filter in real-time

**Category Filter:**
- Click on category pills
- Use the dropdown selector
- Watch charities filter by category

**Donate:**
- Click "Donate Now" on any charity
- Redirects to `/charities/[slug]` detail page
- Complete donation form available

## Migration Notes

### Before (Hardcoded)

```typescript
const charities = [
  {
    id: "1",
    name: "British Heart Foundation",
    category: "Health",
    logo: "/images/bhf.png",
    website: "https://www.bhf.org.uk/",
    verified: true,
  },
  // ... more hardcoded data
];
```

### After (Dynamic)

```typescript
const { charities, loading, error } = useCharities({
  search: searchQuery || undefined,
  category: selectedCategory === "all" ? undefined : selectedCategory,
  verified: true,
  active: true,
  limit: 100,
});
```

## Adding New Charities

### Option 1: Via Seed Script

Edit `scripts/seed-charities.ts` and add new charities:

```typescript
{
  name: 'New Charity',
  slug: 'new-charity',
  description: '...',
  category: 'Health',
  // ... other fields
  isVerified: true,
  isActive: true,
}
```

Then run:
```bash
npm run seed-charities
```

### Option 2: Via API

```bash
curl -X POST http://localhost:3000/api/charities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Charity",
    "description": "...",
    "category": "Health",
    "isVerified": true,
    "isActive": true
  }'
```

### Option 3: Via Web Scraper

Configure and run the scraper:
```bash
npm run scrape-charities
```

## Display States

### Loading State
- Shows 8 skeleton cards with pulsing animation
- Displayed while fetching data from API

### Error State
- Shows error message if API fails
- Displays error details for debugging
- User-friendly shield icon

### Empty State
- Shows when no charities match filters
- Provides "Clear Filters" button
- Only appears when not loading and no error

### Success State
- Grid or list view of charities
- Smooth hover animations
- Verified badges
- Category tags

## Key Features Preserved

✅ **Search Functionality** - Now queries database  
✅ **Category Filtering** - Dynamic categories from DB  
✅ **Grid/List Toggle** - View mode switcher  
✅ **Responsive Design** - Works on all devices  
✅ **Verified Badges** - Shows trust indicators  
✅ **Beautiful UI** - Green gradient theme maintained  

## API Endpoints Used

1. **GET `/api/charities`**
   - Query params: `search`, `category`, `verified`, `active`, `limit`
   - Returns paginated charity list

2. **GET `/api/charities/categories`**
   - Returns all categories with counts
   - Used for category filter dropdown

3. **GET `/api/charities/[slug]`**
   - Accessed when user clicks "Donate Now"
   - Shows full charity details and donation form

## Future Enhancements

Consider adding:

- [ ] Infinite scroll or pagination for more charities
- [ ] Favorite/bookmark charities
- [ ] Recent donations feed
- [ ] Featured charities section
- [ ] Charity ratings/reviews
- [ ] Social sharing buttons
- [ ] Newsletter signup for charity updates

## Troubleshooting

### No Charities Showing

1. Check database has charities:
```sql
SELECT COUNT(*) FROM charities WHERE is_active = true AND is_verified = true;
```

2. Run seed script:
```bash
npm run seed-charities
```

3. Check API response:
```bash
curl http://localhost:3000/api/charities?verified=true&active=true
```

### Categories Not Loading

Check API endpoint:
```bash
curl http://localhost:3000/api/charities/categories
```

### Charity Images Not Showing

- Ensure `logo` field is populated in database
- Check image URLs are accessible
- Fallback UI shows if no logo available

## Summary

The Virtual Giving Mall is now a fully dynamic page that:
- ✅ Pulls charity data from your database
- ✅ Updates automatically when charities are added
- ✅ Provides better user experience with loading states
- ✅ Links to proper donation pages
- ✅ Maintains all original design and functionality

All hardcoded data has been safely commented out and can be removed once you're confident the integration is working perfectly.

