
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Member')),
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    since VARCHAR(50),
    instagram VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    client_type VARCHAR(50) NOT NULL,
    last_contact TIMESTAMP WITH TIME ZONE,
    portal_access_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages table
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    physical_items JSONB,
    digital_items JSONB,
    processing_time VARCHAR(255),
    default_printing_cost DECIMAL(15,2),
    default_transport_cost DECIMAL(15,2),
    photographers TEXT,
    videographers TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_type VARCHAR(255),
    package_name VARCHAR(255),
    package_id UUID REFERENCES packages(id),
    add_ons JSONB,
    date TIMESTAMP WITH TIME ZONE,
    deadline_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    progress INTEGER DEFAULT 0,
    status VARCHAR(255),
    active_sub_statuses JSONB,
    total_cost DECIMAL(15,2),
    amount_paid DECIMAL(15,2) DEFAULT 0,
    payment_status VARCHAR(50),
    team JSONB,
    notes TEXT,
    accommodation TEXT,
    drive_link TEXT,
    client_drive_link TEXT,
    final_drive_link TEXT,
    start_time VARCHAR(10),
    end_time VARCHAR(10),
    image TEXT,
    revisions JSONB,
    promo_code_id UUID,
    discount_amount DECIMAL(15,2),
    shipping_details TEXT,
    dp_proof_url TEXT,
    printing_details JSONB,
    printing_cost DECIMAL(15,2),
    transport_cost DECIMAL(15,2),
    is_editing_confirmed_by_client BOOLEAN DEFAULT FALSE,
    is_printing_confirmed_by_client BOOLEAN DEFAULT FALSE,
    is_delivery_confirmed_by_client BOOLEAN DEFAULT FALSE,
    confirmed_sub_statuses JSONB,
    client_sub_status_notes JSONB,
    sub_status_confirmation_sent_at JSONB,
    completed_digital_items JSONB,
    invoice_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    standard_fee DECIMAL(15,2) DEFAULT 0,
    no_rek VARCHAR(255),
    reward_balance DECIMAL(15,2) DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    performance_notes JSONB,
    portal_access_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    project_id UUID REFERENCES projects(id),
    category VARCHAR(255),
    method VARCHAR(100),
    pocket_id UUID,
    card_id UUID,
    printing_item_id VARCHAR(255),
    vendor_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Pockets table
CREATE TABLE financial_pockets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) DEFAULT 0,
    goal_amount DECIMAL(15,2),
    lock_end_date TIMESTAMP WITH TIME ZONE,
    members JSONB,
    source_card_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add-ons table
CREATE TABLE add_ons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_channel VARCHAR(100),
    location VARCHAR(255),
    status VARCHAR(100),
    date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cards table
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_holder_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    card_type VARCHAR(50) NOT NULL,
    last_four_digits VARCHAR(4) NOT NULL,
    expiry_date VARCHAR(5),
    balance DECIMAL(15,2) DEFAULT 0,
    color_gradient VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    purchase_date TIMESTAMP WITH TIME ZONE,
    purchase_price DECIMAL(15,2),
    serial_number VARCHAR(255),
    status VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts table
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number VARCHAR(255) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id),
    project_id UUID REFERENCES projects(id),
    signing_date TIMESTAMP WITH TIME ZONE,
    signing_location VARCHAR(255),
    client_name1 VARCHAR(255),
    client_address1 TEXT,
    client_phone1 VARCHAR(50),
    client_name2 VARCHAR(255),
    client_address2 TEXT,
    client_phone2 VARCHAR(50),
    shooting_duration VARCHAR(255),
    guaranteed_photos VARCHAR(255),
    album_details TEXT,
    digital_files_format VARCHAR(255),
    other_items TEXT,
    personnel_count VARCHAR(255),
    delivery_timeframe VARCHAR(255),
    dp_date TIMESTAMP WITH TIME ZONE,
    final_payment_date TIMESTAMP WITH TIME ZONE,
    cancellation_policy TEXT,
    jurisdiction VARCHAR(255),
    vendor_signature TEXT,
    client_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Feedback table
CREATE TABLE client_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(255) NOT NULL,
    satisfaction VARCHAR(100),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    icon VARCHAR(50),
    link JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Posts table
CREATE TABLE social_media_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    client_name VARCHAR(255),
    post_type VARCHAR(100),
    platform VARCHAR(100),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    caption TEXT,
    media_url TEXT,
    status VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promo Codes table
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(15,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    max_usage INTEGER,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOPs table
CREATE TABLE sops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    content TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Project Payments table
CREATE TABLE team_project_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    team_member_name VARCHAR(255),
    team_member_id UUID REFERENCES team_members(id),
    date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50),
    fee DECIMAL(15,2),
    reward DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Payment Records table
CREATE TABLE team_payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_number VARCHAR(255) UNIQUE NOT NULL,
    team_member_id UUID REFERENCES team_members(id),
    date TIMESTAMP WITH TIME ZONE,
    project_payment_ids JSONB,
    total_amount DECIMAL(15,2),
    vendor_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward Ledger Entries table
CREATE TABLE reward_ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_member_id UUID REFERENCES team_members(id),
    date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    amount DECIMAL(15,2),
    project_id UUID REFERENCES projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (single profile for the organization)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    company_name VARCHAR(255),
    website VARCHAR(255),
    address TEXT,
    bank_account VARCHAR(255),
    authorized_signer VARCHAR(255),
    id_number VARCHAR(255),
    bio TEXT,
    income_categories JSONB,
    expense_categories JSONB,
    project_types JSONB,
    event_types JSONB,
    asset_categories JSONB,
    sop_categories JSONB,
    project_status_config JSONB,
    notification_settings JSONB,
    security_settings JSONB,
    briefing_template TEXT,
    terms_and_conditions TEXT,
    contract_template TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_project_id ON transactions(project_id);
CREATE INDEX idx_team_project_payments_project_id ON team_project_payments(project_id);
CREATE INDEX idx_team_project_payments_team_member_id ON team_project_payments(team_member_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- etc.

-- Create trigger functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_pockets_updated_at BEFORE UPDATE ON financial_pockets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_add_ons_updated_at BEFORE UPDATE ON add_ons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_feedback_updated_at BEFORE UPDATE ON client_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_media_posts_updated_at BEFORE UPDATE ON social_media_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sops_updated_at BEFORE UPDATE ON sops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_project_payments_updated_at BEFORE UPDATE ON team_project_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_payment_records_updated_at BEFORE UPDATE ON team_payment_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reward_ledger_entries_updated_at BEFORE UPDATE ON reward_ledger_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
