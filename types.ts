export type NavigationAction = {
  type: string;
  id?: string;
  tab?: 'info' | 'project' | 'payment' | 'invoice';
};

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string; // ISO date string
    isRead: boolean;
    icon: 'lead' | 'deadline' | 'revision' | 'feedback' | 'payment' | 'completed' | 'comment';
    link?: {
        view: ViewType;
        action: NavigationAction;
    };
}

export interface PromoCode {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    isActive: boolean;
    usageCount: number;
    maxUsage: number | null;
    expiryDate: string | null;
    createdAt: string;
}

export interface SOP {
    id: string;
    title: string;
    category: string;
    content: string; // Markdown or plain text
    lastUpdated: string; // ISO date string
}


export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  CLIENTS = 'CLIENTS',
  FREELANCERS = 'FREELANCERS',
  TEAM = 'TEAM',
  FINANCE = 'FINANCE',
  PROSPEK = 'PROSPEK',
  CALENDAR = 'CALENDAR',
  PACKAGES = 'PACKAGES',
  PROMO_CODES = 'PROMO_CODES',
  SOCIAL_PLANNER = 'SOCIAL_PLANNER',
  SOP = 'SOP',
  ASSETS = 'ASSETS',
  CLIENT_PORTAL = 'CLIENT_PORTAL',
  FREELANCER_PORTAL = 'FREELANCER_PORTAL',
  PUBLIC_BOOKING = 'PUBLIC_BOOKING',
  PUBLIC_FEEDBACK = 'PUBLIC_FEEDBACK',
  PUBLIC_LEAD = 'PUBLIC_LEAD',
  PUBLIC_REVISION = 'PUBLIC_REVISION',
  PUBLIC_SIGNATURE_VERIFIER = 'PUBLIC_SIGNATURE_VERIFIER',
  CLIENT_REPORTS = 'CLIENT_REPORTS',
  CONTRACTS = 'CONTRACTS',
  SQL_EDITOR = 'SQL_EDITOR',
  SETTINGS = 'SETTINGS'
}

export interface SubStatusConfig {
    name: string;
    note: string;
}

export interface ProjectStatusConfig {
    id: string;
    name: string;
    color: string; // hex color
    subStatuses: SubStatusConfig[];
    note: string;
}

export enum PaymentStatus {
  LUNAS = 'Lunas',
  DP_TERBAYAR = 'DP Terbayar',
  BELUM_BAYAR = 'Belum Bayar'
}

export enum ClientStatus {
  LEAD = 'Prospek',
  ACTIVE = 'Aktif',
  INACTIVE = 'Tidak Aktif',
  LOST = 'Hilang'
}

export enum ClientType {
  DIRECT = 'Langsung',
  VENDOR = 'Vendor',
}

export enum LeadStatus {
    DISCUSSION = 'Sedang Diskusi',
    FOLLOW_UP = 'Menunggu Follow Up',
    CONVERTED = 'Dikonversi',
    REJECTED = 'Ditolak',
}

export enum ContactChannel {
    WHATSAPP = 'WhatsApp',
    INSTAGRAM = 'Instagram',
    WEBSITE = 'Website',
    PHONE = 'Telepon',
    REFERRAL = 'Referensi',
    SUGGESTION_FORM = 'Form Saran',
    OTHER = 'Lainnya',
}

export enum CardType {
  PRABAYAR = 'Prabayar',
  KREDIT = 'Kredit',
  DEBIT = 'Debit'
}

export enum AssetStatus {
    AVAILABLE = 'Tersedia',
    IN_USE = 'Digunakan',
    MAINTENANCE = 'Perbaikan',
}

export enum PerformanceNoteType {
    PRAISE = 'Pujian',
    CONCERN = 'Perhatian',
    LATE_DEADLINE = 'Keterlambatan Deadline',
    GENERAL = 'Umum',
}

export enum SatisfactionLevel {
    VERY_SATISFIED = 'Sangat Puas',
    SATISFIED = 'Puas',
    NEUTRAL = 'Biasa Saja',
    UNSATISFIED = 'Tidak Puas',
}

export enum RevisionStatus {
    PENDING = 'Menunggu Revisi',
    IN_PROGRESS = 'Sedang Dikerjakan',
    COMPLETED = 'Revisi Selesai',
}

export enum PostType {
    INSTAGRAM_FEED = 'Instagram Feed',
    INSTAGRAM_STORY = 'Instagram Story',
    INSTAGRAM_REELS = 'Instagram Reels',
    TIKTOK = 'TikTok Video',
    BLOG = 'Artikel Blog',
}

export enum PostStatus {
    DRAFT = 'Draf',
    SCHEDULED = 'Terjadwal',
    POSTED = 'Diposting',
    CANCELED = 'Dibatalkan',
}

export interface Revision {
    id: string;
    date: string; // ISO date string when revision was created
    adminNotes: string;
    deadline: string; // ISO date string for revision deadline
    freelancerId: string;
    status: RevisionStatus;
    freelancerNotes?: string;
    driveLink?: string;
    completedDate?: string; // ISO date string when freelancer marks as completed
}

export interface PerformanceNote {
    id: string;
    date: string; // ISO date string
    note: string;
    type: PerformanceNoteType;
}

export interface Asset {
    id: string;
    name: string;
    category: string;
    purchaseDate: string; // ISO date string
    purchasePrice: number;
    serialNumber?: string;
    status: AssetStatus;
    notes?: string;
}

export interface User {
    id: string;
    email: string;
    password: string;
    fullName: string;
    role: 'Admin' | 'Member';
    permissions?: ViewType[];
}

export interface Lead {
    id: string;
    name: string;
    contactChannel: ContactChannel;
    location: string;
    status: LeadStatus;
    date: string; // ISO date string of contact
    notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  since: string;
  instagram?: string;
  status: ClientStatus;
  clientType: ClientType;
  lastContact: string; // ISO Date String
  portalAccessId: string;
}

export interface PhysicalItem {
    name: string;
    price: number;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  physicalItems: PhysicalItem[];
  digitalItems: string[];
  processingTime: string;
  defaultPrintingCost?: number;
  defaultTransportCost?: number;
  photographers?: string;
  videographers?: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string; // Fotografer, Videografer, Editor etc.
  email: string;
  phone: string;
  standardFee: number;
  noRek?: string;
  rewardBalance: number;
  rating: number; // 1-5 star rating
  performanceNotes: PerformanceNote[];
  portalAccessId: string;
}

export interface AssignedTeamMember {
  memberId: string;
  name: string;
  role: string;
  fee: number; // The fee for THIS project
  reward?: number; // The reward for THIS project
  subJob?: string;
}

export interface PrintingItem {
  id: string;
  type: 'Cetak Album' | 'Cetak Foto' | 'Flashdisk' | 'Custom';
  customName?: string;
  details: string;
  cost: number;
}

export interface Project {
  id: string;
  projectName: string;
  clientName: string;
  clientId: string;
  projectType: string;
  packageName: string;
  packageId: string;
  addOns: AddOn[];
  date: string;
  deadlineDate?: string;
  location: string;
  progress: number; // 0-100
  status: string;
  activeSubStatuses?: string[];
  totalCost: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  team: AssignedTeamMember[];
  notes?: string;
  accommodation?: string;
  driveLink?: string;
  clientDriveLink?: string;
  finalDriveLink?: string;
  startTime?: string;
  endTime?: string;
  image?: string; // Optional cover image URL
  revisions?: Revision[];
  promoCodeId?: string;
  discountAmount?: number;
  shippingDetails?: string;
  dpProofUrl?: string;
  printingDetails?: PrintingItem[];
  printingCost?: number;
  transportCost?: number;
  isEditingConfirmedByClient?: boolean;
  isPrintingConfirmedByClient?: boolean;
  isDeliveryConfirmedByClient?: boolean;
  confirmedSubStatuses?: string[];
  clientSubStatusNotes?: Record<string, string>;
  subStatusConfirmationSentAt?: Record<string, string>; // e.g. { 'Seleksi Foto': '2023-10-27T10:00:00Z' }
  completedDigitalItems?: string[];
  invoiceSignature?: string;
}

export enum TransactionType {
  INCOME = 'Pemasukan',
  EXPENSE = 'Pengeluaran'
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  projectId?: string;
  category: string;
  method: 'Transfer Bank' | 'Tunai' | 'E-Wallet' | 'Sistem' | 'Kartu';
  pocketId?: string;
  cardId?: string;
  printingItemId?: string;
  vendorSignature?: string;
}

export enum PocketType {
    SAVING = 'Nabung & Bayar',
    LOCKED = 'Terkunci',
    SHARED = 'Bersama',
    EXPENSE = 'Anggaran Pengeluaran',
    REWARD_POOL = 'Tabungan Hadiah Freelancer'
}

export interface FinancialPocket {
  id: string;
  name: string;
  description: string;
  icon: 'piggy-bank' | 'lock' | 'users' | 'clipboard-list' | 'star';
  type: PocketType;
  amount: number;
  goalAmount?: number; // for SAVING and EXPENSE type
  lockEndDate?: string; // for LOCKED type
  members?: TeamMember[]; // for SHARED type
  sourceCardId?: string; // Links this pocket to a physical card
}

export interface Card {
  id:string;
  cardHolderName: string;
  bankName: string; // e.g., 'WBank', 'VISA'
  cardType: CardType;
  lastFourDigits: string; // e.g., "3090"
  expiryDate?: string; // MM/YY e.g., "09/24"
  balance: number;
  colorGradient: string; // tailwind gradient class e.g. 'from-blue-500 to-sky-400'
}

export interface Contract {
  id: string;
  contractNumber: string;
  clientId: string;
  projectId: string;
  signingDate: string; // ISO date
  signingLocation: string;
  createdAt: string; // ISO date

  // From the form/errors
  clientName1: string;
  clientAddress1: string;
  clientPhone1: string;
  clientName2?: string;
  clientAddress2?: string;
  clientPhone2?: string;

  // Scope
  shootingDuration: string;
  guaranteedPhotos: string;
  albumDetails: string;
  digitalFilesFormat: string;
  otherItems: string;
  personnelCount: string;
  deliveryTimeframe: string;

  // Payment & Legal
  dpDate: string;
  finalPaymentDate: string;
  cancellationPolicy: string;
  jurisdiction: string;

  // E-Signatures
  vendorSignature?: string;
  clientSignature?: string;
}

export interface NotificationSettings {
    newProject: boolean;
    paymentConfirmation: boolean;
    deadlineReminder: boolean;
}

export interface SecuritySettings {
    twoFactorEnabled: boolean;
}

export interface Profile {
    fullName: string;
    email: string;
    phone: string;
    companyName: string;
    website: string;
    address: string;
    bankAccount: string;
    authorizedSigner: string;
    idNumber?: string;
    bio: string;
    incomeCategories: string[];
    expenseCategories: string[];
    projectTypes: string[];
    eventTypes: string[];
    assetCategories: string[];
    sopCategories: string[];
    projectStatusConfig: ProjectStatusConfig[];
    notificationSettings: NotificationSettings;
    securitySettings: SecuritySettings;
    briefingTemplate: string;
    termsAndConditions?: string;
    contractTemplate?: string;
}

export interface TeamProjectPayment {
    id: string;
    projectId: string;
    teamMemberName: string;
    teamMemberId: string;
    date: string;
    status: 'Paid' | 'Unpaid';
    fee: number;
    reward?: number;
}

export interface TeamPaymentRecord {
    id: string;
    recordNumber: string;
    teamMemberId: string;
    date: string;
    projectPaymentIds: string[];
    totalAmount: number;
    vendorSignature?: string;
}

export interface RewardLedgerEntry {
    id: string;
    teamMemberId: string;
    date: string;
    description: string;
    amount: number; // positive for deposit, negative for withdrawal
    projectId?: string;
}

export interface ClientFeedback {
  id: string;
  clientName: string;
  satisfaction: SatisfactionLevel;
  rating: number; // 1-5
  feedback: string;
  date: string; // ISO date string
}

export interface FreelancerFeedback {
    id: string;
    freelancerId: string;
    teamMemberName: string;
    date: string; // ISO date string
    message: string;
}

export interface SocialMediaPost {
    id: string;
    projectId: string;
    clientName: string;
    postType: PostType;
    platform: 'Instagram' | 'TikTok' | 'Website';
    scheduledDate: string; // ISO date string
    caption: string;
    mediaUrl?: string; // Link to the image/video in GDrive
    status: PostStatus;
    notes?: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    attendees?: string[];
    isAllDay?: boolean;
    category: 'meeting' | 'shoot' | 'deadline' | 'personal' | 'other';
}