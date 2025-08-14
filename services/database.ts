import { supabase } from '../lib/supabase'
import { 
  User, Client, Project, TeamMember, Transaction, Package, AddOn, 
  FinancialPocket, Profile, TeamProjectPayment, TeamPaymentRecord, 
  Lead, RewardLedgerEntry, Card, Asset, ClientFeedback, Contract, 
  Notification, SocialMediaPost, PromoCode, SOP, CalendarEvent
} from '../types'

// Helper function to create generic CRUD services
function createCrudService<T>(tableName: string) {
  return {
    async getAll(): Promise<T[]> {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      return data || [];
    },

    async getById(id: string): Promise<T | null> {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    async create(item: Omit<T, 'id'>): Promise<T> {
      const { data, error } = await supabase.from(tableName).insert(item).select().single();
      if (error) throw error;
      return data;
    },

    async update(id: string, item: Partial<T>): Promise<T> {
      const { data, error } = await supabase.from(tableName).update(item).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
    }
  };
}


// Users
export const usersService = createCrudService<User>('users');

// Clients
export const clientsService = createCrudService<Client>('clients');

// Projects
export const projectsService = createCrudService<Project>('projects');

// Team Members
export const teamMembersService = createCrudService<TeamMember>('team_members');

// Transactions
export const transactionsService = createCrudService<Transaction>('transactions');

// Packages
export const packagesService = createCrudService<Package>('packages');

// Add-ons
export const addOnsService = createCrudService<AddOn>('add_ons');

// Financial Pockets
export const pocketsService = createCrudService<FinancialPocket>('financial_pockets');

// Leads
export const leadsService = createCrudService<Lead>('leads');

// Cards
export const cardsService = createCrudService<Card>('cards');

// Assets
export const assetsService = createCrudService<Asset>('assets');

// Contracts
export const contractsService = createCrudService<Contract>('contracts');

// Client Feedback
export const clientFeedbackService = createCrudService<ClientFeedback>('client_feedback');

// Notifications
export const notificationsService = createCrudService<Notification>('notifications');

// Social Media Posts
export const socialMediaPostsService = createCrudService<SocialMediaPost>('social_media_posts');

// Promo Codes
export const promoCodesService = createCrudService<PromoCode>('promo_codes');
export const calendarEventsService = createCrudService<CalendarEvent>('calendar_events');
export const financialPocketsService = createCrudService<FinancialPocket>('financial_pockets');


// SOPs
export const sopsService = createCrudService<SOP>('sops');

// Team Project Payments
export const teamProjectPaymentsService = createCrudService<TeamProjectPayment>('team_project_payments');

// Team Payment Records
export const teamPaymentRecordsService = createCrudService<TeamPaymentRecord>('team_payment_records');

// Reward Ledger Entries
export const rewardLedgerEntriesService = createCrudService<RewardLedgerEntry>('reward_ledger_entries');

// Profile
export const profileService = {
  async get(): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async upsert(profile: Profile): Promise<Profile> {
    const { data, error } = await supabase.from('profiles').upsert(profile).select().single()
    if (error) throw error
    return data
  }
}