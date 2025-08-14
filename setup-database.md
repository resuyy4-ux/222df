
# Database Setup Instructions

## Setting up Supabase Database

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Update Environment Variables**
   - Your `.env` file already contains the Supabase URL and anon key
   - Make sure these match your actual Supabase project

3. **Run the Database Schema**
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL script to create all tables

4. **Set up Row Level Security (Optional)**
   - If you want to add user authentication and row-level security
   - Enable RLS on tables as needed
   - Create appropriate policies

## Database Tables Created

The schema creates the following tables:
- `users` - User accounts and permissions
- `clients` - Client information
- `projects` - Project details
- `team_members` - Freelancer/team member data
- `transactions` - Financial transactions
- `packages` - Service packages
- `add_ons` - Additional services
- `financial_pockets` - Budget categories
- `leads` - Prospective clients
- `cards` - Payment cards
- `assets` - Company assets
- `contracts` - Client contracts
- `client_feedback` - Client reviews
- `notifications` - System notifications
- `social_media_posts` - Social media planning
- `promo_codes` - Discount codes
- `sops` - Standard operating procedures
- `team_project_payments` - Team payment tracking
- `team_payment_records` - Payment records
- `reward_ledger_entries` - Reward system
- `profiles` - Company profile settings

## Next Steps

1. Run the SQL schema in your Supabase project
2. The application will automatically connect to your database
3. All CRUD operations will now persist to Supabase
4. Data will be loaded from the database on app startup

## Troubleshooting

- Make sure your Supabase URL and anon key are correct in `.env`
- Check that all tables were created successfully
- Verify that the Supabase project is active and not paused
