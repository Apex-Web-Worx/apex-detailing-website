# Apex Detailing — Pricing Rules

## Service Pricing Structure

All prices are **starting at** amounts. Final pricing is confirmed upon vehicle inspection and may vary by size, condition, and add-ons.

### 1. Apex Full Detailing
**Starting at $300** | Duration: 8 hours

| Vehicle Type | Price Range |
|-------------|-------------|
| Coupe / Sedan | $300 – $400 |
| Truck / Jeep / 2-Row SUV | $350 – $450 |
| Minivan / 3-Row SUV | $350 – $500 |

### 2. Apex Interior Detailing
**Starting at $200** | Duration: 6 hours

| Vehicle Type | Price Range |
|-------------|-------------|
| 2-Row (sedan, coupe, small SUV) | $200 – $300 |
| 3-Row (minivan, large SUV) | $250 – $350 |

### 3. Apex Express Interior Detailing
**Starting at $100** | Duration: 1.5 hours

| Vehicle Type | Price Range |
|-------------|-------------|
| 2-Row | $100 – $150 |
| 3-Row | $150 – $200 |

**Important:** This service is for maintaining a semi-clean vehicle. Heavily soiled interiors, stains, excessive pet hair, or deep cleaning needs may require a Full Interior Detail. Final service type confirmed upon inspection.

### 4. Apex Exterior Detailing
**Starting at $150** | Duration: 3 hours

| Vehicle Type | Price |
|-------------|-------|
| Sedan | $150 |
| SUV | $200 – $250 |

### 5. Apex Wash, Clay & Wax
**Starting at $250** | Duration: 3 hours

| Vehicle Type | Price |
|-------------|-------|
| Sedan | $250 |
| SUV | $300 – $350 |

### 6. Apex Headlight Restoration
**$125** | Duration: 1.5 hours
- Fixed price, no vehicle size tiers

### 7. Apex Ceramic Coating
**Call for Quote** | Duration: 10 hours
- Custom-quoted based on vehicle size, paint condition, and whether paint correction is needed first
- Frontend shows "Call for quote" when `priceCents === 0`

### 8. Apex Paint Correction
**Starting at $300+** | Duration: 8 hours

| Level | Starting Price | Description |
|-------|---------------|-------------|
| Paint Enhancement | $300 | Light machine polish for gloss refresh, minor haze removal |
| 1-Step Paint Correction | $600 | Wash, iron removal, clay bar, single-stage polish, sealant |
| 2-Step Paint Correction | $1,100 | Compound + polish for deeper swirl/scratch removal |
| Advanced Paint Correction | $1,800 | For heavily swirled, oxidized, black, or show-level vehicles |

**Note:** Final price depends on paint condition, vehicle size, and desired result.

## How the Pricing Calculator Works

### Backend (`api-server`)
- Each service in the database has a `priceCents` field (e.g., 30000 = $300.00)
- When `priceCents === 0`, the frontend renders "Call for quote"
- Vehicle-specific pricing tiers are displayed as text in the `pricingDetails` array
- No automatic price calculation exists — the "calculator" is the tiered display on the service card

### Frontend Display
- Service cards on the homepage show the base price prominently
- Hover/click reveals the pricing details with vehicle size tiers
- Booking page shows price next to each service in the picker
- Final price is always confirmed in person

## Gift Card Tiers

| Tier | Amount | Covers |
|------|--------|--------|
| The Express | $100 | Express Interior Detail or applies toward any service |
| The Detailer | $200 | Full Interior Detail (pet hair/stain removal included) |
| The Showroom | $300 | Complete Apex Full Detail |

Gift cards are digital and purchased through Square integration.
