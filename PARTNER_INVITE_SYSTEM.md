# Partner Invite Code System

## Overview
A system for generating and redeeming invite codes that give tour operators and restaurants free premium subscriptions (1 or 3 months) without requiring Stripe payment.

## Setup

### 1. Create Database Table
Run the SQL script to create the `partner_invite_codes` table:
```bash
# Execute in Supabase SQL Editor or via CLI
psql -f scripts/supabase-create-partner-invite-codes-table.sql
```

## Usage

### Generating Invite Codes

#### Option 1: Admin Web Interface
1. Navigate to `/admin/partner-invites`
2. Fill in the form:
   - **Type**: Tour Operator or Restaurant
   - **Duration**: 1 or 3 months
   - **Max Tours**: (Tour operators only) 5 or 15 tours
   - **Expiration**: Optional expiration date
   - **Notes**: Optional notes about who this is for
3. Click "Generate Invite Code"
4. Copy and share the code with your partner

#### Option 2: CLI Script
```bash
# Tour Operator - 3 months, 15 tours
node scripts/generate-partner-invite-code.js --type tour_operator --duration 3 --max-tours 15

# Restaurant - 1 month
node scripts/generate-partner-invite-code.js --type restaurant --duration 1

# With expiration date
node scripts/generate-partner-invite-code.js --type tour_operator --duration 3 --expires 2025-12-31

# With notes
node scripts/generate-partner-invite-code.js --type restaurant --duration 1 --notes "Partnership deal with ABC Restaurant"
```

### Redeeming Invite Codes

1. Partner visits `/partners/invite`
2. Enters their invite code
3. System automatically detects code type (tour operator or restaurant)
4. Fills in required information:
   - **Tour Operators**: Operator name, optional tour URLs
   - **Restaurants**: Restaurant ID, destination ID, slug, optional name
5. Submits form
6. Subscription is activated immediately (no payment required)
7. Confirmation email is sent

## Code Format

- **Tour Operators**: `TOUR2025-ABC123`
- **Restaurants**: `REST2025-XYZ789`

## Features

✅ **No Stripe Required** - Subscriptions created directly in database
✅ **Auto-Verification** - Tour operator codes are auto-verified
✅ **Email Confirmations** - Partners receive welcome emails
✅ **Expiration Support** - Codes can have expiration dates
✅ **Usage Tracking** - Track who used which codes
✅ **Deactivation** - Codes can be deactivated if needed

## Database Schema

```sql
partner_invite_codes
- id (UUID)
- code (TEXT, unique)
- type ('tour_operator' | 'restaurant')
- duration_months (1 | 3)
- max_tours (INTEGER, for tour operators)
- used_by (UUID, user who redeemed)
- used_by_email (TEXT)
- used_at (TIMESTAMPTZ)
- expires_at (TIMESTAMPTZ)
- created_by (UUID, admin)
- is_active (BOOLEAN)
- notes (TEXT)
- subscription_id (UUID, link to created subscription)
```

## API Endpoints

- `POST /api/partners/invite/redeem` - Redeem an invite code
- `GET /api/partners/invite/check?code=ABC123` - Check code type and validity
- `POST /api/internal/partner-invites/generate` - Generate new code (admin)

## Pages

- `/partners/invite` - Public redemption page
- `/admin/partner-invites` - Admin code generator (optional)

## Example Workflow

1. **You receive email from tour operator** wanting to partner
2. **Generate code**: `node scripts/generate-partner-invite-code.js --type tour_operator --duration 3 --max-tours 15 --notes "ABC Tours partnership"`
3. **Share code**: Send them `TOUR2025-ABC123` and link to `/partners/invite`
4. **They redeem**: Enter code, operator name, and tour URLs
5. **Subscription active**: They get 3 months free premium with 15 tours
6. **Email sent**: They receive confirmation email

## Notes

- Codes are case-insensitive (automatically uppercased)
- Codes can only be used once
- Expired or deactivated codes cannot be redeemed
- Tour operators can add tours later via their profile page
- Restaurant codes require restaurant to already exist in database

