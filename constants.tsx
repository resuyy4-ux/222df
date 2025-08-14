import React from 'react';
import { ViewType, TransactionType, PaymentStatus, PocketType, ClientStatus, LeadStatus, ContactChannel, CardType, AssetStatus, PerformanceNoteType, SatisfactionLevel, RevisionStatus, Notification, SocialMediaPost, PostType, PostStatus, PromoCode, SOP, ClientType, ProjectStatusConfig } from './types';
import type { User, Client, Project, Package, TeamMember, Transaction, FinancialPocket, AddOn, Profile, TeamProjectPayment, TeamPaymentRecord, AssignedTeamMember, Lead, NotificationSettings, SecuritySettings, RewardLedgerEntry, Card, Asset, PerformanceNote, ClientFeedback, Contract } from './types';

// --- ICONS (NEW THEME) ---
// A collection of SVG icon components used throughout the application.
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
export const FolderKanbanIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
);
export const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);
export const DollarSignIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
export const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
export const PackageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);
export const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0 2l.15.08a2 2 0 0 0 .73-2.73l.22.38a2 2 0 0 0-2.73-.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
export const ChartPieIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
);
export const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
export const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);
export const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
);
export const Trash2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);
export const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
export const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
);
export const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);
export const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);
export const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
);
export const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
);
export const CashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M6 12h2"/><path d="M14 12h4"/></svg>
);
export const QrCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><path d="M21 16v3a2 2 0 0 1-2 2h-1"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1a2 2 0 0 0-2-2h-1"/></svg>
);
export const Share2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
);
export const HistoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);
export const AlertCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
export const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
export const PiggyBankIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19.45 5.55 21 7.1c.82.82.82 2.15 0 2.97l-2.02 2.02c-.38.38-.89.6-1.42.6h-3.09a2 2 0 0 1-1.41-.59L10 9.5a2 2 0 0 0-2.83 0L2.83 13.83a2 2 0 0 0 0 2.83L4.24 18c.82.82 2.15.82 2.97 0l2.59-2.59c.38-.38.89-.6 1.42-.6h3.09a2 2 0 0 1 1.41.59l3.42 3.42c.82.82 2.15.82 2.97 0l1.41-1.41"/><path d="m11 16.5 6-6"/><path d="M15 5h.01"/></svg>
);
export const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
export const Users2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 19a6 6 0 0 0-12 0"/><circle cx="8" cy="10" r="4"/><path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8"/></svg>
);
export const ClipboardListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
);
export const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
);
export const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
export const PhoneIncomingIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 2 16 8 22 8"/><line x1="22" y1="2" x2="16" y2="8"/><path d="M22 16.5A10 10 0 0 1 5.5 8"/><path d="M2 7.9A15 15 0 0 1 15.1 3h5.9"/></svg>
);
export const ListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
);
export const LayoutGridIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
);
export const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);
export const TrendingDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/>
        <polyline points="16 17 22 17 22 11"/>
    </svg>
);
export const LogOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
export const KeyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
);
export const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7-7-7-7"/></svg>
);
export const ArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
);
export const CheckSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
);
export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
export const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
export const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);
export const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);
export const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
export const BarChart2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
);
export const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
export const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
export const SmileIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
);
export const ThumbsUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
);
export const MehIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
);
export const FrownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
);
export const UserCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
);
export const PercentIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
);
export const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
export const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
export const GalleryHorizontalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3v18"/><path d="M22 3v18"/><path d="M6 12h12"/><path d="M6 3h12v3H6z"/><path d="M6 18h12v3H6z"/></svg>
);
export const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M2 9v9a9 9 0 0 0 18 0V9"/><path d="M2 13v5a9 9 0 0 0 18 0v-5"/></svg>
);

// --- HELPERS ---
// Utility functions used across multiple components.

export const CONTRACT_PLACEHOLDERS = [
    { placeholder: '{{nomor_kontrak}}', description: 'Nomor unik kontrak.' },
    { placeholder: '{{tanggal_ttd}}', description: 'Tanggal penandatanganan kontrak.' },
    { placeholder: '{{lokasi_ttd}}', description: 'Lokasi penandatanganan kontrak.' },
    { placeholder: '{{nama_perusahaan}}', description: 'Nama perusahaan Anda.' },
    { placeholder: '{{alamat_perusahaan}}', description: 'Alamat perusahaan Anda.' },
    { placeholder: '{{telepon_perusahaan}}', description: 'Telepon perusahaan Anda.' },
    { placeholder: '{{nama_penandatangan_perusahaan}}', description: 'Nama penandatangan dari pihak Anda.' },
    { placeholder: '{{nama_klien_1}}', description: 'Nama klien utama.' },
    { placeholder: '{{alamat_klien_1}}', description: 'Alamat klien utama.' },
    { placeholder: '{{telepon_klien_1}}', description: 'Telepon klien utama.' },
    { placeholder: '{{nama_klien_2}}', description: 'Nama klien kedua (jika ada).' },
    { placeholder: '{{alamat_klien_2}}', description: 'Alamat klien kedua (jika ada).' },
    { placeholder: '{{telepon_klien_2}}', description: 'Telepon klien kedua (jika ada).' },
    { placeholder: '{{nama_proyek}}', description: 'Nama proyek yang disepakati.' },
    { placeholder: '{{tanggal_acara}}', description: 'Tanggal pelaksanaan acara.' },
    { placeholder: '{{lokasi_acara}}', description: 'Lokasi pelaksanaan acara.' },
    { placeholder: '{{nama_paket}}', description: 'Nama paket layanan yang dipilih.' },
    { placeholder: '{{total_biaya}}', description: 'Total biaya proyek (termasuk PPN jika ada).' },
    { placeholder: '{{jumlah_dp}}', description: 'Jumlah DP yang sudah atau akan dibayar.' },
    { placeholder: '{{sisa_pembayaran}}', description: 'Sisa pembayaran yang harus dilunasi.' },
    { placeholder: '{{tanggal_pelunasan}}', description: 'Batas akhir tanggal pelunasan.' },
    { placeholder: '{{rekening_bank_perusahaan}}', description: 'Nomor rekening bank perusahaan Anda.' },
    { placeholder: '{{detail_paket_fisik}}', description: 'Daftar rincian item fisik dari paket.' },
    { placeholder: '{{detail_paket_digital}}', description: 'Daftar rincian item digital dari paket.' },
    { placeholder: '{{detail_addon}}', description: 'Daftar rincian add-on yang dipilih.' },
    { placeholder: '{{syarat_ketentuan}}', description: 'Syarat dan ketentuan umum dari profil Anda.' },
];

// --- NAVIGATION ---
// Defines the items available in the main sidebar navigation.
export const NAV_ITEMS = [
  { view: ViewType.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
  { view: ViewType.PROSPEK, label: 'Prospek', icon: LightbulbIcon },
  { view: ViewType.CLIENTS, label: 'Manajemen Klien', icon: UsersIcon },
  { view: ViewType.PROJECTS, label: 'Proyek', icon: FolderKanbanIcon },
  { view: ViewType.TEAM, label: 'Freelancer', icon: BriefcaseIcon },
  { view: ViewType.FINANCE, label: 'Keuangan', icon: DollarSignIcon },
  { view: ViewType.CALENDAR, label: 'Kalender', icon: CalendarIcon },
  { view: ViewType.CLIENT_REPORTS, label: 'Laporan Klien', icon: ChartPieIcon },
  { view: ViewType.PACKAGES, label: 'Paket Layanan', icon: PackageIcon },
  { view: ViewType.PROMO_CODES, label: 'Kode Promo', icon: PercentIcon },
  { view: ViewType.ASSETS, label: 'Manajemen Aset', icon: CameraIcon },
  { view: ViewType.CONTRACTS, label: 'Kontrak Kerja', icon: FileTextIcon },
  { view: ViewType.SOP, label: 'SOP', icon: BookOpenIcon },
  { view: ViewType.SOCIAL_MEDIA_PLANNER, label: 'Perencana Medsos', icon: Share2Icon },
  { view: ViewType.SQL_EDITOR, label: 'SQL Editor', icon: DatabaseIcon },
  { view: ViewType.SETTINGS, label: 'Pengaturan', icon: SettingsIcon },
];

// --- MOCK DATA (RESTRUCTURED & INTEGRATED WITH UUIDs) ---
// This section contains all the mock data to populate the application.
// All IDs have been converted to UUID format to align with Supabase.

const createMockDate = (monthOffset: number, day: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    date.setDate(day);
    date.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    return date.toISOString().split('T')[0];
};

// --- UUIDs for all entities ---
const user_ids = { admin: '787220ef-0a78-49b7-9e31-069b3030f150', member: 'f4b1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c' };
const client_ids = {
    andi: 'a1e4e2f3-3b1a-4b2c-8c3d-1e2f3a4b5c6d', budi: 'b2d5e3f4-4c2b-4c3d-9d4e-2f3a4b5c6d7e',
    citra: 'c3f6e4g5-5d3c-4d4e-ad5f-3g4b5c6d7e8f', fajar: 'd4g7f5h6-6e4d-4e5f-be6g-4h5c6d7e8f9g',
    eko: 'e5h8g6i7-7f5e-4f6g-cf7h-5i6d7e8f9g0h', gita: 'f6i9h7j8-8g6f-4g7h-dg8i-6j7e8f9g0h1i',
    hendra: 'g7j0i8k9-9h7g-4h8i-eh9j-7k8f9g0h1i2j', indah: 'h8k1j9l0-0i8h-4i9j-fi0k-8l9g0h1i2j3k'
};
const team_member_ids = {
    bambang: 'i9l2k0m1-1j9i-4j0k-gj1l-9m0h1i2j3k4l', siti: 'j0m3l1n2-2k0j-4k1l-hk2m-0n1i2j3k4l5m',
    rahmat: 'k1n4m2o3-3l1k-4l2m-il3n-1o2j3k4l5m6n', dewi: 'l2o5n3p4-4m2l-4m3n-jm4o-2p3k4l5m6n7o',
    agung: 'm3p6o4q5-5n3m-4n4o-kn5p-3q4l5m6n7o8p'
};
const package_ids = {
    ruby: 'n4q7p5r6-6o4n-4o5p-lo6q-4r5m6n7o8p9q', sapphire: 'o5r8q6s7-7p5o-4p6q-mp7r-5s6n7o8p9q0r',
    emerald: 'p6s9r7t8-8q6p-4q7r-nq8s-6t7o8p9q0r1s', engagement: 'q7t0s8u9-9r7q-4r8s-or9t-7u8p9q0r1s2t',
    prewedding: 'r8u1t9v0-0s8r-4s9t-ps0u-8v9q0r1s2t3u'
};
const addon_ids = { sde: 's9v2u0w1-1t9s-4t0u-qt1v-9w0r1s2t3u4v', drone: 't0w3v1x2-2u0t-4u1v-ru2w-0x1s2t3u4v5w', canvas: 'u1x4w2y3-3v1u-4v2w-sv3x-1y2t3u4v5w6x', extra_hour: 'v2y5x3z4-4w2v-4w3x-tw4y-2z3u4v5w6x7y' };
const card_ids = { wbank1: 'w3z6y4a5-5x3w-4x4y-ux5z-3a4v5w6x7y8z', wbank2: 'x4a7z5b6-6y4x-4y5z-vy6a-4b5w6x7y8z9a', visa: 'y5b8a6c7-7z5y-4z6a-wz7b-5c6x7y8z9a0b', cash: 'z6c9b7d8-8a6z-4a7b-xa8c-6d7y8z9a0b1c' };
const pocket_ids = { emergency: 'a7d0c8e9-9b7a-4b8c-yb9d-7e8z9a0b1c2d', camera: 'b8e1d9f0-0c8b-4c9d-zc0e-8f9a0b1c2d3e', operational: 'c9f2e0g1-1d9c-4d0e-ad1f-9g0b1c2d3e4f', reward_pool: 'd0g3f1h2-2e0d-4e1f-be2g-0h1c2d3e4f5g' };
const project_ids = {
    p1: 'e1h4g2i3-3f1e-4f2g-cf3h-1i2d3e4f5g6h', p2: 'f2i5h3j4-4g2f-4g3h-dg4i-2j3e4f5g6h7i',
    p3: 'g3j6i4k5-5h3g-4h4i-eh5j-3k4f5g6h7i8j', p4: 'h4k7j5l6-6i4h-4i5j-fi6k-4l5g6h7i8j9k',
    p5: 'i5l8k6m7-7j5i-4j6k-gj7l-5m6h7i8j9k0l', p6: 'j6m9l7n8-8k6j-4k7l-hk8m-6n7i8j9k0l1m',
    p7: 'k7n0m8o9-9l7k-4l8m-il9n-7o8j9k0l1m2n', p8: 'l8o1n9p0-0m8l-4m9n-jm0o-8p9k0l1m2n3o',
    p9: 'm9p2o0q1-1n9m-4n0o-kn1p-9q0l1m2n3o4p', p10: 'n0q3p1r2-2o0n-4o1p-lo2q-0r1m2n3o4p5q',
    p11: 'o1r4q2s3-3p1o-4p2q-mp3r-1s2n3o4p5q6r', p12: 'p2s5r3t4-4q2p-4q3r-nq4s-2t3o4p5q6r7s'
};

// --- Base Static Data ---
export const MOCK_USERS: User[] = [
    { id: user_ids.admin, email: 'admin@venapictures.com', password: 'password123', fullName: 'Admin Vena', role: 'Admin' },
    { 
        id: user_ids.member, 
        email: 'boceng@venapictures.com', 
        password: 'password123', 
        fullName: 'Boceng Staf', 
        role: 'Member',
        permissions: [
            ViewType.DASHBOARD, ViewType.PROSPEK, ViewType.CLIENTS, ViewType.PROJECTS, ViewType.TEAM,
            ViewType.CALENDAR, ViewType.PACKAGES, ViewType.ASSETS, ViewType.CONTRACTS, ViewType.SOP,
            ViewType.SOCIAL_MEDIA_PLANNER
        ]
    }
];

export const MOCK_USER_PROFILE: Profile = {
    fullName: "Admin Vena", email: "admin@venapictures.com", phone: "081234567890",
    companyName: "Vena Pictures", website: "https://venapictures.com", address: "Jl. Raya Fotografi No. 123, Jakarta, Indonesia",
    bankAccount: "BCA 1234567890 a/n Vena Pictures", authorizedSigner: "Vena Pictures Management", idNumber: "3171234567890001",
    bio: "Vendor fotografi pernikahan profesional dengan spesialisasi pada momen-momen otentik dan sinematik.",
    incomeCategories: ["DP Proyek", "Pelunasan Proyek", "Penjualan Album", "Sewa Alat", "Lain-lain", "Modal"],
    expenseCategories: ["Gaji Freelancer", "Hadiah Freelancer", "Penarikan Hadiah Freelancer", "Sewa Tempat", "Transportasi", "Konsumsi", "Marketing", "Sewa Alat", "Cetak Album", "Cetak Foto", "Flashdisk", "Custom", "Operasional Kantor", "Transfer Internal", "Penutupan Anggaran"],
    projectTypes: ["Pernikahan", "Pre-wedding", "Lamaran", "Acara Korporat", "Ulang Tahun"],
    eventTypes: ["Meeting Klien", "Survey Lokasi", "Libur", "Workshop", "Lainnya"],
    assetCategories: ["Kamera", "Lensa", "Drone", "Lighting", "Audio", "Tripod & Stabilizer", "Lainnya"],
    sopCategories: ["Fotografi", "Videografi", "Editing", "Umum", "Layanan Klien"],
    projectStatusConfig: [
        { id: 'status_1', name: 'Tertunda', color: '#eab308', subStatuses: [{ name: 'Menunggu DP', note: 'Klien belum melakukan pembayaran uang muka.'}, { name: 'Jadwal Bentrok', note: 'Perlu koordinasi ulang jadwal dengan klien atau tim.'}], note: 'Proyek yang masih menunggu konfirmasi pembayaran atau penjadwalan ulang.' },
        { id: 'status_3', name: 'Dikonfirmasi', color: '#3b82f6', subStatuses: [{ name: 'DP Lunas', note: 'Uang muka sudah diterima.'}, { name: 'Kontrak Ditandatangani', note: 'Dokumen kontrak sudah disetujui kedua belah pihak.'}], note: 'Proyek siap dieksekusi.' },
        { id: 'status_2', name: 'Persiapan', color: '#6366f1', subStatuses: [{ name: 'Briefing Tim', note: 'Pastikan semua anggota tim memahami rundown dan tugas.'}, { name: 'Survey Lokasi', note: 'Kunjungi lokasi acara untuk perencanaan teknis.'}, { name: 'Cek Peralatan', note: 'Pastikan semua gear dalam kondisi prima dan baterai penuh.'}], note: 'Tahap persiapan sebelum hari H acara.' },
        { id: 'status_4', name: 'Editing', color: '#8b5cf6', subStatuses: [{ name: 'Seleksi Foto', note: 'Memilih foto-foto terbaik dari acara.'}, { name: 'Editing Foto', note: 'Proses color grading dan retouching foto.'}, { name: 'Editing Video', note: 'Menyusun klip video menjadi satu kesatuan cerita.'}, { name: 'Color Grading', note: 'Menyesuaikan warna video agar sinematik.'}], note: 'Proses pasca-produksi sedang berjalan.' },
        { id: 'status_5', name: 'Revisi', color: '#14b8a6', subStatuses: [{ name: 'Revisi Klien 1', note: 'Menerima dan mengerjakan masukan revisi dari klien.'}, { name: 'Revisi Internal', note: 'Pengecekan kualitas internal sebelum finalisasi.'}, { name: 'Finalisasi', note: 'Menyelesaikan sentuhan akhir setelah semua revisi.'}], note: 'Tahap revisi berdasarkan masukan klien atau internal.' },
        { id: 'status_6', name: 'Cetak', color: '#f97316', subStatuses: [{ name: 'Layouting Album', note: 'Menyusun tata letak foto pada album.'}, { name: 'Proses Cetak', note: 'File dikirim ke percetakan.'}, { name: 'Quality Control', note: 'Memeriksa hasil cetakan untuk memastikan kualitas.'}], note: 'Proses pencetakan item fisik.' },
        { id: 'status_7', name: 'Dikirim', color: '#06b6d4', subStatuses: [{ name: 'Packing', note: 'Mengemas hasil fisik dengan aman.'}, { name: 'Dalam Pengiriman', note: 'Paket sudah diserahkan ke kurir.'}], note: 'Hasil fisik sedang dalam perjalanan ke klien.' },
        { id: 'status_8', name: 'Selesai', color: '#10b981', subStatuses: [], note: 'Proyek telah selesai dan semua hasil telah diterima klien.' },
        { id: 'status_9', name: 'Dibatalkan', color: '#ef4444', subStatuses: [], note: 'Proyek dibatalkan oleh klien atau vendor.' },
    ],
    notificationSettings: { newProject: true, paymentConfirmation: true, deadlineReminder: true },
    securitySettings: { twoFactorEnabled: false },
    briefingTemplate: "Tim terbaik! Mari berikan yang terbaik untuk klien kita. Jaga semangat, komunikasi, dan fokus pada detail. Let's create magic!",
    termsAndConditions: `📜 Syarat & Ketentuan Umum

Pemesanan & Pembayaran:
- Pemesanan dianggap sah setelah pembayaran Uang Muka (DP) sebesar 50% dari total biaya.
- Pelunasan sisa pembayaran wajib dilakukan paling lambat 3 (tiga) hari sebelum tanggal acara.
- Semua pembayaran dilakukan melalui transfer ke rekening yang tertera pada invoice.

📅 Jadwal & Waktu Kerja
- Durasi kerja tim sesuai dengan detail yang tertera pada paket yang dipilih.
- Penambahan jam kerja akan dikenakan biaya tambahan per jam.
- Klien wajib memberikan rundown acara yang jelas kepada tim paling lambat 7 (tujuh) hari sebelum acara.

📦 Penyerahan Hasil
- Hasil akhir (foto edit, video, album) akan diserahkan dalam kurun waktu yang tertera pada paket (misal: 30-60 hari kerja).
- Hari kerja tidak termasuk hari Sabtu, Minggu, dan hari libur nasional.
- File mentah (RAW) tidak diberikan kepada klien.
- Hasil digital akan diberikan melalui tautan Google Drive.

➕ Revisi
- Klien berhak mendapatkan 1 (satu) kali revisi minor untuk hasil video (misal: penggantian lagu, pemotongan klip).
- Revisi mayor (perubahan konsep total) akan dikenakan biaya tambahan.
- Revisi tidak berlaku untuk hasil foto, kecuali terdapat kesalahan teknis fatal dari pihak fotografer.

❌ Pembatalan
- Jika pembatalan dilakukan oleh klien, Uang Muka (DP) yang telah dibayarkan tidak dapat dikembalikan.
- Jika pembatalan dilakukan oleh pihak Vena Pictures, seluruh pembayaran yang telah diterima akan dikembalikan 100%.

Lain-lain:
- Vena Pictures tidak bertanggung jawab atas kegagalan pelaksanaan acara yang disebabkan oleh kejadian di luar kendali (bencana alam, kerusuhan, dll.).
- Jika terjadi kerusakan alat yang tidak disengaja, Vena Pictures akan memberikan kompensasi sesuai dengan kesepakatan bersama.
- Hak cipta hasil foto dan video tetap menjadi milik Vena Pictures.
- Vena Pictures berhak menggunakan hasil karya untuk kepentingan portofolio dan promosi di media sosial atau website, kecuali jika ada perjanjian tertulis sebelumnya dengan klien.`,
    contractTemplate: `SURAT PERJANJIAN KERJA SAMA
JASA FOTOGRAFI & VIDEOGRAFI
Nomor: {{nomor_kontrak}}

Pada hari ini, {{tanggal_ttd}}, bertempat di {{lokasi_ttd}}, telah dibuat dan disepakati perjanjian kerja sama antara:

PIHAK PERTAMA
Nama           : {{nama_penandatangan_perusahaan}}
Jabatan        : Pemilik Usaha
Perusahaan     : {{nama_perusahaan}}
Alamat         : {{alamat_perusahaan}}
Nomor Telepon  : {{telepon_perusahaan}}

PIHAK KEDUA
Nama           : {{nama_klien_1}}
Alamat         : {{alamat_klien_1}}
Nomor Telepon  : {{telepon_klien_1}}

(Jika ada, Pihak Kedua Tambahan)
Nama           : {{nama_klien_2}}
Alamat         : {{alamat_klien_2}}
Nomor Telepon  : {{telepon_klien_2}}

Kedua belah pihak sepakat untuk mengikatkan diri dalam perjanjian ini dengan syarat dan ketentuan sebagai berikut:

PASAL 1: RUANG LINGKUP PEKERJAAN
PIHAK PERTAMA akan memberikan jasa fotografi dan/atau videografi untuk acara {{nama_proyek}} pada tanggal {{tanggal_acara}} di lokasi {{lokasi_acara}}.
Detail layanan yang diberikan sesuai dengan paket {{nama_paket}} dan item tambahan sebagai berikut:
- Item Fisik: {{detail_paket_fisik}}
- Item Digital: {{detail_paket_digital}}
- Add-On: {{detail_addon}}

PASAL 2: BIAYA DAN CARA PEMBAYARAN
Total biaya jasa adalah sebesar {{total_biaya}}.
Pembayaran dilakukan dengan sistem:
1. Uang Muka (DP) sebesar {{jumlah_dp}} dibayarkan pada saat penandatanganan kontrak.
2. Pelunasan sebesar {{sisa_pembayaran}} dibayarkan paling lambat pada tanggal {{tanggal_pelunasan}}.
Pembayaran ditransfer ke rekening: {{rekening_bank_perusahaan}}.

PASAL 3: HAK DAN KEWAJIBAN
Hak dan kewajiban kedua belah pihak diatur dalam Syarat & Ketentuan Umum yang merupakan bagian tidak terpisahkan dari perjanjian ini.

PASAL 4: PEMBATALAN
Kebijakan pembatalan diatur dalam Syarat & Ketentuan Umum. Silakan merujuk ke dokumen tersebut.

PASAL 5: PENYELESAIAN SENGKETA
Segala sengketa yang timbul akan diselesaikan secara musyawarah.

Demikian surat perjanjian ini dibuat dan ditandatangani oleh kedua belah pihak.


PIHAK PERTAMA,




( {{nama_penandatangan_perusahaan}} )


PIHAK KEDUA,




( {{nama_klien_1}} )
`
};

export const MOCK_SOPS: SOP[] = [
    { id: 'b1b1b1b1-1111-4111-8111-111111111111', title: 'SOP Fotografi Acara Pernikahan', category: 'Fotografi', content: `# SOP Fotografi Acara Pernikahan... (Content unchanged)`, lastUpdated: createMockDate(-5, 1) },
    { id: 'b2b2b2b2-2222-4222-8222-222222222222', title: 'SOP Editing Tone Warna Cinematic', category: 'Editing', content: `# SOP Editing Tone Warna Cinematic... (Content unchanged)`, lastUpdated: createMockDate(-10, 1) },
    { id: 'b3b3b3b3-3333-4333-8333-333333333333', title: 'Prosedur Follow Up Klien', category: 'Layanan Klien', content: `# Prosedur Follow Up Klien\n\n1.  **Follow Up Awal (H+2):** Kirim pesan terima kasih setelah diskusi awal.\n2.  **Follow Up Kedua (H+7):** Tanyakan apakah ada pertanyaan lebih lanjut mengenai penawaran.\n3.  **Follow Up Terakhir (H+14):** Berikan informasi promo atau penawaran khusus jika ada.`, lastUpdated: createMockDate(-2, 5) },
];

export const MOCK_PACKAGES: Package[] = [
    { id: package_ids.ruby, name: 'Paket Ruby', price: 12000000, photographers: '2 Fotografer', videographers: '1 Videografer', physicalItems: [{ name: '1 Album (20x30 cm, 20 halaman)', price: 800000 }], digitalItems: ['300 Foto Edit', 'Video Teaser 1 Menit', 'Semua File (Link Drive)'], processingTime: '30 hari kerja', defaultPrintingCost: 800000, defaultTransportCost: 500000 },
    { id: package_ids.sapphire, name: 'Paket Sapphire', price: 18500000, photographers: '2 Fotografer', videographers: '2 Videografer', physicalItems: [{ name: '1 Album (20x30 cm, 20 halaman, Box)', price: 1200000 }, { name: 'Cetak 4R (20 lembar + Box)', price: 300000 }], digitalItems: ['400 Foto Edit', 'Video Teaser 1 Menit', '3 Menit Cinematic Clip', 'Semua File (USB)'], processingTime: '45 hari kerja', defaultPrintingCost: 1500000, defaultTransportCost: 750000 },
    { id: package_ids.emerald, name: 'Paket Emerald', price: 28000000, photographers: '3 Fotografer', videographers: '2 Videografer', physicalItems: [{ name: '1 Album Magazine (30x30 cm, 40 halaman, Box)', price: 2500000 }, { name: 'Cetak 40x60 cm (1 lembar)', price: 750000 }, { name: 'Cetak 4R (40 lembar + Box)', price: 500000 }], digitalItems: ['500 Foto Edit', 'Video Teaser 1 Menit', '5 Menit Cinematic Clip', 'Semua File (USB)'], processingTime: '60 hari kerja', defaultPrintingCost: 3750000, defaultTransportCost: 1000000 },
    { id: package_ids.engagement, name: 'Paket Engagement Simple', price: 5000000, photographers: '1 Fotografer', videographers: '1 Videografer', physicalItems: [], digitalItems: ['200 Foto Edit', 'Video Teaser 1 Menit', 'Semua File (Link Drive)'], processingTime: '21 hari kerja', defaultPrintingCost: 0, defaultTransportCost: 400000 },
    { id: package_ids.prewedding, name: 'Paket Prewedding Classic', price: 7500000, photographers: '2 Fotografer', videographers: '1 Videografer', physicalItems: [{ name: 'Cetak 40x60 cm (2 lembar)', price: 1500000 }], digitalItems: ['150 Foto Edit', 'Video Prewedding 1 Menit', 'Semua File (Link Drive)'], processingTime: '21 hari kerja', defaultPrintingCost: 1500000, defaultTransportCost: 1000000 }
];

export const MOCK_ADDONS: AddOn[] = [
    { id: addon_ids.sde, name: 'Same Day Edit Video', price: 3500000 },
    { id: addon_ids.drone, name: 'Sewa Drone', price: 2000000 },
    { id: addon_ids.canvas, name: 'Cetak Kanvas 60x40', price: 750000 },
    { id: addon_ids.extra_hour, name: 'Jam Liputan Tambahan', price: 1000000 },
];

export const MOCK_PROMO_CODES: PromoCode[] = [
    { id: 'e1e1e1e1-1111-4111-8111-111111111111', code: 'VENA10', discountType: 'percentage', discountValue: 10, isActive: true, usageCount: 2, maxUsage: 10, expiryDate: createMockDate(3, 1), createdAt: createMockDate(-1, 1) },
    { id: 'e2e2e2e2-2222-4222-8222-222222222222', code: 'DISKON500K', discountType: 'fixed', discountValue: 500000, isActive: true, usageCount: 1, maxUsage: null, expiryDate: null, createdAt: createMockDate(-2, 1) },
    { id: 'e3e3e3e3-3333-4333-8333-333333333333', code: 'EXPIRED', discountType: 'percentage', discountValue: 15, isActive: false, usageCount: 5, maxUsage: 5, expiryDate: createMockDate(-1, 1), createdAt: createMockDate(-6, 1) },
];


// --- Core Entities (The base for our data story) ---
export const MOCK_CLIENTS: Client[] = [
  { id: client_ids.andi, name: 'Andi & Siska', email: 'andi.siska@email.com', phone: '081111111111', since: createMockDate(-1, 15), instagram: '@andisiska', status: ClientStatus.ACTIVE, clientType: ClientType.DIRECT, lastContact: createMockDate(0, -5), portalAccessId: 'a7c5b8e1-4f2a-4f9c-8b1e-3e1f7c8b4a9c' },
  { id: client_ids.budi, name: 'Budi Santoso (WO)', email: 'budi.s@email.com', phone: '082222222222', since: createMockDate(-3, 20), instagram: '@budisan', status: ClientStatus.INACTIVE, clientType: ClientType.VENDOR, lastContact: createMockDate(0, -40), portalAccessId: 'f3b9c1d8-6e5a-4b2a-9c8d-1e7a6b5c4d3e' },
  { id: client_ids.citra, name: 'Citra Lestari', email: 'citra.l@email.com', phone: '083333333333', since: createMockDate(-2, 5), instagram: '@citralestari', status: ClientStatus.ACTIVE, clientType: ClientType.DIRECT, lastContact: createMockDate(0, -10), portalAccessId: 'b9e8c7d6-3a2b-4c1d-8e7f-6a5b4c3d2e1f' },
  { id: client_ids.fajar, name: 'Fajar Nugraha', email: 'fajar.n@email.com', phone: '084444444444', since: createMockDate(0, -2), instagram: '@fajarnugraha', status: ClientStatus.ACTIVE, clientType: ClientType.DIRECT, lastContact: createMockDate(0, -1), portalAccessId: 'd1e2f3a4-5b6c-4d7e-8f9a-0b1c2d3e4f5a' },
  { id: client_ids.eko, name: 'Eko Prasetyo', email: 'eko.p@email.com', phone: '085555555555', since: createMockDate(0, -12), instagram: '@ekopras', status: ClientStatus.ACTIVE, clientType: ClientType.DIRECT, lastContact: createMockDate(0, -2), portalAccessId: 'c6b7d8e9-1a2b-4c5d-8e9f-0a1b2c3d4e5f' },
  { id: client_ids.gita, name: 'Gita Permata', email: 'gita.p@email.com', phone: '086666666666', since: createMockDate(-1, 28), instagram: '@gitapermata', status: ClientStatus.ACTIVE, clientType: ClientType.DIRECT, lastContact: createMockDate(0, -18), portalAccessId: 'e9f0a1b2-c3d4-4e5f-8a9b-0c1d2e3f4a5b' },
  { id: client_ids.hendra, name: 'Hendra Wijaya (EO)', email: 'hendra.w@email.com', phone: '087777777777', since: createMockDate(-4, 10), instagram: '@hendraeo', status: ClientStatus.ACTIVE, clientType: ClientType.VENDOR, lastContact: createMockDate(0, -3), portalAccessId: 'f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c' },
  { id: client_ids.indah, name: 'Indah Sari', email: 'indah.s@email.com', phone: '088888888888', since: createMockDate(-5, 1), instagram: '@indahsari', status: ClientStatus.LOST, clientType: ClientType.DIRECT, lastContact: createMockDate(-4, 1), portalAccessId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d' },
];

export const MOCK_LEADS: Lead[] = [
  { id: '10000000-0000-4000-8000-000000000001', name: 'Fajar Nugraha', contactChannel: ContactChannel.INSTAGRAM, location: 'Jakarta', status: LeadStatus.CONVERTED, date: createMockDate(0, -2), notes: `Converted to client ${client_ids.fajar}` },
  { id: '10000000-0000-4000-8000-000000000002', name: 'Gita Permata', contactChannel: ContactChannel.WHATSAPP, location: 'Bandung', status: LeadStatus.CONVERTED, date: createMockDate(0, -25), notes: `Converted to client ${client_ids.gita}` },
  { id: '10000000-0000-4000-8000-000000000003', name: 'Hendra Wijaya', contactChannel: ContactChannel.REFERRAL, location: 'Surabaya', status: LeadStatus.CONVERTED, date: createMockDate(0, -18), notes: `Converted to client ${client_ids.hendra}` },
  { id: '10000000-0000-4000-8000-000000000004', name: 'Indah Sari', contactChannel: ContactChannel.WEBSITE, location: 'Jakarta', status: LeadStatus.REJECTED, date: createMockDate(-1, 15) },
  { id: '10000000-0000-4000-8000-000000000005', name: 'Joko Anwar', contactChannel: ContactChannel.WHATSAPP, location: 'Yogyakarta', status: LeadStatus.DISCUSSION, date: createMockDate(0, -3) },
  { id: '10000000-0000-4000-8000-000000000006', name: 'Kartika Dewi', contactChannel: ContactChannel.INSTAGRAM, location: 'Semarang', status: LeadStatus.FOLLOW_UP, date: createMockDate(0, -10) },
  { id: '10000000-0000-4000-8000-000000000007', name: 'Lia Aminah', contactChannel: ContactChannel.WEBSITE, location: 'Jakarta', status: LeadStatus.DISCUSSION, date: createMockDate(0, -1) },
  { id: '10000000-0000-4000-8000-000000000008', name: 'Maya Putri', contactChannel: ContactChannel.REFERRAL, location: 'Bandung', status: LeadStatus.DISCUSSION, date: createMockDate(0, 0) },
];

let teamMembersData: TeamMember[] = [
  { id: team_member_ids.bambang, name: 'Bambang Sudiro', role: 'Fotografer', email: 'bambang@photographer.com', phone: '081211112222', standardFee: 1500000, noRek: 'BCA 1234567890', rewardBalance: 0, rating: 5, performanceNotes: [{ id: 'b1111111-aaaa-4aaa-8aaa-111111111111', date: createMockDate(-1, 15), type: PerformanceNoteType.PRAISE, note: 'Komunikasi sangat baik dengan klien di proyek Andi & Siska.' }], portalAccessId: 'a1b2c3d4-freelancer-bambang'},
  { id: team_member_ids.siti, name: 'Siti Aminah', role: 'Fotografer', email: 'siti@photographer.com', phone: '081233334444', standardFee: 1500000, noRek: 'Mandiri 0987654321', rewardBalance: 0, rating: 4.5, performanceNotes: [], portalAccessId: 'a1b2c3d4-freelancer-siti' },
  { id: team_member_ids.rahmat, name: 'Rahmat Hidayat', role: 'Videografer', email: 'rahmat@videographer.com', phone: '081255556666', standardFee: 2000000, noRek: 'BRI 1122334455', rewardBalance: 0, rating: 4, performanceNotes: [{ id: 'b3333333-cccc-4ccc-8ccc-333333333333', date: createMockDate(-2, 20), type: PerformanceNoteType.LATE_DEADLINE, note: 'Terlambat 2 hari dalam pengiriman file mentah untuk proyek Budi.' }], portalAccessId: 'a1b2c3d4-freelancer-rahmat' },
  { id: team_member_ids.dewi, name: 'Dewi Anjani', role: 'Editor', email: 'dewi@editor.com', phone: '081277778888', standardFee: 1000000, noRek: 'BCA 9876543210', rewardBalance: 0, rating: 5, performanceNotes: [], portalAccessId: 'a1b2c3d4-freelancer-dewi' },
  { id: team_member_ids.agung, name: 'Agung Perkasa', role: 'Videografer', email: 'agung@videographer.com', phone: '081299990000', standardFee: 2000000, noRek: 'BNI 5544332211', rewardBalance: 0, rating: 4, performanceNotes: [], portalAccessId: 'a1b2c3d4-freelancer-agung' },
];

// --- Projects (Define Structure, financial state will be calculated) ---
let projectsData: Project[] = [
    { id: project_ids.p1, projectName: 'Pernikahan Andi & Siska', clientName: 'Andi & Siska', clientId: client_ids.andi, projectType: 'Pernikahan', packageName: 'Paket Sapphire', packageId: package_ids.sapphire, addOns: [{...MOCK_ADDONS.find(a => a.id === addon_ids.drone)!}], date: createMockDate(1, 10), deadlineDate: createMockDate(2, 25), location: 'Hotel Mulia, Jakarta', progress: 25, status: 'Persiapan', activeSubStatuses: ['Briefing Tim'], totalCost: 20500000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: [{ memberId: team_member_ids.bambang, name: 'Bambang Sudiro', role: 'Fotografer', fee: 1500000, reward: 200000 }, { memberId: team_member_ids.siti, name: 'Siti Aminah', role: 'Fotografer', fee: 1500000, reward: 200000 }, { memberId: team_member_ids.rahmat, name: 'Rahmat Hidayat', role: 'Videografer', fee: 2000000, reward: 250000 }, { memberId: team_member_ids.agung, name: 'Agung Perkasa', role: 'Videografer', fee: 2000000, reward: 250000 }, { memberId: team_member_ids.dewi, name: 'Dewi Anjani', role: 'Editor', fee: 1000000, reward: 100000 }], dpProofUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
    { id: project_ids.p2, projectName: 'Prewedding Budi & Rekan', clientName: 'Budi Santoso (WO)', clientId: client_ids.budi, projectType: 'Pre-wedding', packageName: 'Paket Ruby', packageId: package_ids.ruby, addOns: [], date: createMockDate(-3, 25), deadlineDate: createMockDate(-2, 25), location: 'Bromo, Jawa Timur', progress: 100, status: 'Selesai', totalCost: 12000000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: [{ memberId: team_member_ids.siti, name: 'Siti Aminah', role: 'Fotografer', fee: 2000000, reward: 250000, subJob: 'Candid Photography' }], finalDriveLink: 'https://example.com/final-budi', isEditingConfirmedByClient: true, isPrintingConfirmedByClient: true, isDeliveryConfirmedByClient: true },
    { id: project_ids.p3, projectName: 'Lamaran Citra Lestari', clientName: 'Citra Lestari', clientId: client_ids.citra, projectType: 'Lamaran', packageName: 'Paket Engagement Simple', packageId: package_ids.engagement, addOns: [], date: createMockDate(-2, 20), deadlineDate: createMockDate(-1, 20), location: 'Bandung', progress: 100, status: 'Selesai', totalCost: 5000000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: [{ memberId: team_member_ids.bambang, name: 'Bambang Sudiro', role: 'Fotografer', fee: 1500000, reward: 150000 }], finalDriveLink: 'https://example.com/final-citra' },
    { 
        id: project_ids.p4, projectName: 'Pernikahan Fajar', clientName: 'Fajar Nugraha', clientId: client_ids.fajar, projectType: 'Pernikahan', packageName: 'Paket Ruby', packageId: package_ids.ruby, addOns: [{...MOCK_ADDONS.find(a => a.id === addon_ids.extra_hour)!}], date: createMockDate(0, 28), deadlineDate: createMockDate(1, 28), location: 'Gedung Kesenian, Jakarta', progress: 70, status: 'Editing', activeSubStatuses: ['Editing Video'], totalCost: 13000000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: [{ memberId: team_member_ids.agung, name: 'Agung Perkasa', role: 'Videografer', fee: 2000000, reward: 200000 }, { memberId: team_member_ids.dewi, name: 'Dewi Anjani', role: 'Editor', fee: 1000000, reward: 100000 }],
        confirmedSubStatuses: ['Seleksi Foto'],
        clientSubStatusNotes: { 'Seleksi Foto': 'Tolong prioritaskan foto-foto candid saat upacara ya, kami lebih suka yang natural.' }
    },
    { id: project_ids.p5, projectName: 'Pernikahan Eko & Pasangan', clientName: 'Eko Prasetyo', clientId: client_ids.eko, projectType: 'Pernikahan', packageName: 'Paket Emerald', packageId: package_ids.emerald, addOns: [], date: createMockDate(2, 15), deadlineDate: createMockDate(3, 15), location: 'Surabaya', progress: 0, status: 'Tertunda', activeSubStatuses: ['Menunggu DP'], totalCost: 28000000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: [] },
    { id: project_ids.p6, projectName: 'Prewedding Gita Permata', clientName: 'Gita Permata', clientId: client_ids.gita, projectType: 'Pre-wedding', packageName: 'Paket Prewedding Classic', packageId: package_ids.prewedding, addOns: [], date: createMockDate(-1, 10), deadlineDate: createMockDate(0, 1), location: 'Kawah Putih, Bandung', progress: 80, status: 'Revisi', activeSubStatuses: ['Revisi Klien 1'], totalCost: 7500000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: [{ memberId: team_member_ids.bambang, name: 'Bambang Sudiro', role: 'Fotografer', fee: 1750000, reward: 200000 }, { memberId: team_member_ids.rahmat, name: 'Rahmat Hidayat', role: 'Videografer', fee: 2000000, reward: 200000 }],
        confirmedSubStatuses: ['Seleksi Foto'],
        clientSubStatusNotes: { 'Seleksi Foto': 'Tolong prioritaskan foto-foto candid saat upacara ya, kami lebih suka yang natural.' },
        revisions: [{id: 'c1111111-aaaa-4aaa-8aaa-111111111111', date: createMockDate(0, -3), adminNotes: 'Tolong perbaiki tone warna di menit 2:15-2:30, buat lebih warm.', deadline: createMockDate(0, 4), freelancerId: team_member_ids.rahmat, status: RevisionStatus.PENDING,}] 
    },
    { id: project_ids.p7, projectName: 'Event EO Hendra', clientName: 'Hendra Wijaya (EO)', clientId: client_ids.hendra, projectType: 'Acara Korporat', packageName: 'Paket Ruby', packageId: package_ids.ruby, addOns: [{...MOCK_ADDONS.find(a => a.id === addon_ids.sde)!}, {...MOCK_ADDONS.find(a => a.id === addon_ids.drone)!}], date: createMockDate(0, 15), deadlineDate: createMockDate(1, 15), location: 'Ritz-Carlton, Surabaya', progress: 40, status: 'Dikonfirmasi', activeSubStatuses: ['DP Lunas', 'Kontrak Ditandatangani'], totalCost: 17500000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: [{ memberId: team_member_ids.bambang, name: 'Bambang Sudiro', role: 'Fotografer', fee: 1500000, reward: 300000}, { memberId: team_member_ids.agung, name: 'Agung Perkasa', role: 'Videografer', fee: 2000000, reward: 400000 }, { memberId: team_member_ids.dewi, name: 'Dewi Anjani', role: 'Editor', fee: 1000000, reward: 100000}]},
    { id: project_ids.p8, projectName: 'Pernikahan Lanjutan Andi', clientName: 'Andi & Siska', clientId: client_ids.andi, projectType: 'Pernikahan', packageName: 'Paket Emerald', packageId: package_ids.emerald, addOns: [], date: createMockDate(3, 20), deadlineDate: createMockDate(4, 20), location: 'Bali', progress: 10, status: 'Persiapan', activeSubStatuses: ['Survey Lokasi'], totalCost: 28000000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: [] },
    { id: project_ids.p9, projectName: 'Ulang Tahun Anak Fajar', clientName: 'Fajar Nugraha', clientId: client_ids.fajar, projectType: 'Ulang Tahun', packageName: 'Paket Engagement Simple', packageId: package_ids.engagement, addOns: [], date: createMockDate(0, 22), deadlineDate: createMockDate(1, 22), location: 'Rumah Fajar, Jakarta', progress: 85, status: 'Cetak', activeSubStatuses: ['Layouting Album'], totalCost: 5000000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: [{memberId: team_member_ids.siti, name: 'Siti Aminah', role: 'Fotografer', fee: 1500000, reward: 100000}] },
    { id: project_ids.p10, projectName: 'Revisi Video Citra', clientName: 'Citra Lestari', clientId: client_ids.citra, projectType: 'Lamaran', packageName: 'Paket Engagement Simple', packageId: package_ids.engagement, addOns: [], date: createMockDate(0, 5), deadlineDate: createMockDate(1, 5), location: 'Bandung', progress: 80, status: 'Revisi', activeSubStatuses: ['Revisi Internal'], totalCost: 0, amountPaid: 0, paymentStatus: PaymentStatus.LUNAS, team: [{ memberId: team_member_ids.dewi, name: 'Dewi Anjani', role: 'Editor', fee: 500000, reward: 50000}] },
    { id: project_ids.p11, projectName: 'Finalisasi Album Gita', clientName: 'Gita Permata', clientId: client_ids.gita, projectType: 'Pre-wedding', packageName: 'Paket Prewedding Classic', packageId: package_ids.prewedding, addOns: [{...MOCK_ADDONS.find(a => a.id === addon_ids.canvas)!}], date: createMockDate(0, 8), deadlineDate: createMockDate(1, 8), location: 'Bandung', progress: 95, status: 'Dikirim', activeSubStatuses: ['Dalam Pengiriman'], shippingDetails: 'JNE CGK123456789', totalCost: 8250000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: []},
    { id: project_ids.p12, projectName: 'Foto Produk Kopi Hendra', clientName: 'Hendra Wijaya (EO)', clientId: client_ids.hendra, projectType: 'Acara Korporat', packageName: 'Paket Engagement Simple', packageId: package_ids.engagement, addOns: [], date: createMockDate(0, 1), deadlineDate: createMockDate(0, 15), location: 'Studio, Surabaya', progress: 75, status: 'Editing', activeSubStatuses: ['Editing Foto', 'Seleksi Foto'], totalCost: 5000000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: [{ memberId: team_member_ids.bambang, name: 'Bambang Sudiro', role: 'Fotografer', fee: 1000000, reward: 100000}] },
];

// --- SINGLE SOURCE OF TRUTH: TRANSACTIONS ---
const baseTransactions: (Transaction & {teamMemberId?: string})[] = [
    { id: '30000000-0000-4000-8000-000000000001', date: createMockDate(-6, 1), description: 'Modal Awal Usaha', amount: 50000000, type: TransactionType.INCOME, category: 'Modal', method: 'Sistem', cardId: card_ids.wbank1 },
    { id: '30000000-0000-4000-8000-000000000002', date: createMockDate(-5, 5), description: 'Setor ke Dana Darurat', amount: 10000000, type: TransactionType.EXPENSE, category: 'Transfer Internal', method: 'Sistem', cardId: card_ids.wbank1, pocketId: pocket_ids.emergency },
    { id: '30000000-0000-4000-8000-000000000003', date: createMockDate(-5, 6), description: 'Setor ke Beli Kamera Baru', amount: 8000000, type: TransactionType.EXPENSE, category: 'Transfer Internal', method: 'Sistem', cardId: card_ids.wbank1, pocketId: pocket_ids.camera },
    { id: '30000000-0000-4000-8000-000000000004', date: createMockDate(-1, 1), description: 'Anggaran Operasional Bulanan', amount: 5000000, type: TransactionType.EXPENSE, category: 'Transfer Internal', method: 'Sistem', cardId: card_ids.wbank1, pocketId: pocket_ids.operational },
    // Project 2 (Budi) - Selesai
    { id: '30000000-0000-4000-8000-000000000005', date: createMockDate(-3, 20), description: 'DP Proyek Prewedding Budi', amount: 6000000, type: TransactionType.INCOME, projectId: project_ids.p2, category: 'DP Proyek', method: 'Transfer Bank', cardId: card_ids.wbank1 },
    { id: '30000000-0000-4000-8000-000000000006', date: createMockDate(-2, 25), description: 'Pelunasan Proyek Prewedding Budi', amount: 6000000, type: TransactionType.INCOME, projectId: project_ids.p2, category: 'Pelunasan Proyek', method: 'Transfer Bank', cardId: card_ids.wbank2 },
    { id: '30000000-0000-4000-8000-000000000007', date: createMockDate(-2, 26), description: 'Gaji Freelancer Siti Aminah - Proyek Budi', amount: 2000000, type: TransactionType.EXPENSE, projectId: project_ids.p2, category: 'Gaji Freelancer', method: 'Transfer Bank', cardId: card_ids.wbank1, teamMemberId: team_member_ids.siti },
    { id: '30000000-0000-4000-8000-000000000008', date: createMockDate(-2, 26), description: 'Hadiah untuk Siti Aminah (Proyek: Prewedding Budi & Rekan)', amount: 250000, type: TransactionType.EXPENSE, category: 'Hadiah Freelancer', method: 'Sistem', teamMemberId: team_member_ids.siti, projectId: project_ids.p2 },
    { id: '30000000-0000-4000-8000-000000000009', date: createMockDate(-3, 23), description: 'Transportasi & Akomodasi Bromo', amount: 2500000, type: TransactionType.EXPENSE, projectId: project_ids.p2, category: 'Transportasi', method: 'Tunai', cardId: card_ids.cash },
    // Project 3 (Citra) - Selesai
    { id: '30000000-0000-4000-8000-000000000010', date: createMockDate(-2, 18), description: 'Pelunasan Proyek Lamaran Citra', amount: 5000000, type: TransactionType.INCOME, projectId: project_ids.p3, category: 'Pelunasan Proyek', method: 'Transfer Bank', cardId: card_ids.wbank1 },
    { id: '30000000-0000-4000-8000-000000000011', date: createMockDate(-2, 19), description: 'Gaji Freelancer Bambang Sudiro - Proyek Citra', amount: 1500000, type: TransactionType.EXPENSE, projectId: project_ids.p3, category: 'Gaji Freelancer', method: 'Transfer Bank', cardId: card_ids.wbank1, teamMemberId: team_member_ids.bambang },
    { id: '30000000-0000-4000-8000-000000000012', date: createMockDate(-2, 19), description: 'Hadiah untuk Bambang Sudiro (Proyek: Lamaran Citra Lestari)', amount: 150000, type: TransactionType.EXPENSE, category: 'Hadiah Freelancer', method: 'Sistem', teamMemberId: team_member_ids.bambang, projectId: project_ids.p3 },
    // Project 1 (Andi) - Persiapan
    { id: '30000000-0000-4000-8000-000000000013', date: createMockDate(0, -10), description: 'DP Proyek Pernikahan Andi & Siska', amount: 10000000, type: TransactionType.INCOME, projectId: project_ids.p1, category: 'DP Proyek', method: 'Transfer Bank', cardId: card_ids.wbank2 },
    // Project 4 (Fajar) - Editing
    { id: '30000000-0000-4000-8000-000000000014', date: createMockDate(0, -5), description: 'DP Proyek Pernikahan Fajar', amount: 6500000, type: TransactionType.INCOME, projectId: project_ids.p4, category: 'DP Proyek', method: 'Transfer Bank', cardId: card_ids.wbank1 },
    { id: '30000000-0000-4000-8000-000000000015', date: createMockDate(0, -5), description: 'Hadiah untuk Agung Perkasa (Proyek: Pernikahan Fajar)', amount: 200000, type: TransactionType.EXPENSE, category: 'Hadiah Freelancer', method: 'Sistem', teamMemberId: team_member_ids.agung, projectId: project_ids.p4},
    { id: '30000000-0000-4000-8000-000000000016', date: createMockDate(0, -5), description: 'Hadiah untuk Dewi Anjani (Proyek: Pernikahan Fajar)', amount: 100000, type: TransactionType.EXPENSE, category: 'Hadiah Freelancer', method: 'Sistem', teamMemberId: team_member_ids.dewi, projectId: project_ids.p4},
    // Project 6 (Gita) - Revisi
    { id: '30000000-0000-4000-8000-000000000017', date: createMockDate(-1, 8), description: 'Pelunasan Proyek Prewedding Gita', amount: 7500000, type: TransactionType.INCOME, projectId: project_ids.p6, category: 'Pelunasan Proyek', method: 'Transfer Bank', cardId: card_ids.wbank1 },
    { id: '30000000-0000-4000-8000-000000000018', date: createMockDate(-1, 9), description: 'Gaji Freelancer Bambang Sudiro - Proyek Gita', amount: 1750000, type: TransactionType.EXPENSE, projectId: project_ids.p6, category: 'Gaji Freelancer', method: 'Transfer Bank', cardId: card_ids.wbank1, teamMemberId: team_member_ids.bambang },
    { id: '30000000-0000-4000-8000-000000000019', date: createMockDate(-1, 9), description: 'Gaji Freelancer Rahmat Hidayat - Proyek Gita', amount: 2000000, type: TransactionType.EXPENSE, projectId: project_ids.p6, category: 'Gaji Freelancer', method: 'Transfer Bank', cardId: card_ids.wbank1, teamMemberId: team_member_ids.rahmat },
    { id: '30000000-0000-4000-8000-000000000020', date: createMockDate(-1, 9), description: 'Hadiah untuk Bambang Sudiro (Proyek: Prewedding Gita Permata)', amount: 200000, type: TransactionType.EXPENSE, category: 'Hadiah Freelancer', method: 'Sistem', teamMemberId: team_member_ids.bambang, projectId: project_ids.p6},
    { id: '30000000-0000-4000-8000-000000000021', date: createMockDate(-1, 9), description: 'Hadiah untuk Rahmat Hidayat (Proyek: Prewedding Gita Permata)', amount: 200000, type: TransactionType.EXPENSE, category: 'Hadiah Freelancer', method: 'Sistem', teamMemberId: team_member_ids.rahmat, projectId: project_ids.p6},
    // Project 7 (Hendra) - Dikonfirmasi
    { id: '30000000-0000-4000-8000-000000000022', date: createMockDate(0, -2), description: 'DP Proyek Event EO Hendra', amount: 8000000, type: TransactionType.INCOME, projectId: project_ids.p7, category: 'DP Proyek', method: 'Transfer Bank', cardId: card_ids.wbank1 },
    // Project 9 (Fajar Birthday) - Cetak
    { id: '30000000-0000-4000-8000-000000000023', date: createMockDate(0, 20), description: 'Pelunasan Proyek Ulang Tahun Anak Fajar', amount: 5000000, type: TransactionType.INCOME, projectId: project_ids.p9, category: 'Pelunasan Proyek', method: 'Tunai', cardId: card_ids.cash},
    // Project 11 (Gita Album) - Dikirim
    { id: '30000000-0000-4000-8000-000000000024', date: createMockDate(0, 6), description: 'Pelunasan Proyek Finalisasi Album Gita', amount: 8250000, type: TransactionType.INCOME, projectId: project_ids.p11, category: 'Pelunasan Proyek', method: 'Transfer Bank', cardId: card_ids.wbank2},
    { id: '30000000-0000-4000-8000-000000000025', date: createMockDate(0, 7), description: 'Biaya Cetak Kanvas - Gita', amount: 750000, type: TransactionType.EXPENSE, projectId: project_ids.p11, category: 'Cetak Foto', method: 'Transfer Bank', cardId: card_ids.wbank1},
    // Project 12 (Hendra Kopi) - Editing
    { id: '30000000-0000-4000-8000-000000000026', date: createMockDate(0, 0), description: 'DP Proyek Foto Produk Kopi Hendra', amount: 2500000, type: TransactionType.INCOME, projectId: project_ids.p12, category: 'DP Proyek', method: 'Transfer Bank', cardId: card_ids.wbank1 },
    // General & Internal
    { id: '30000000-0000-4000-8000-000000000027', date: createMockDate(0, -15), description: 'Biaya Iklan Instagram', amount: 750000, type: TransactionType.EXPENSE, category: 'Marketing', method: 'Kartu', cardId: card_ids.visa },
    { id: '30000000-0000-4000-8000-000000000028', date: createMockDate(0, -10), description: 'Pembelian ATK Kantor', amount: 500000, type: TransactionType.EXPENSE, category: 'Operasional Kantor', method: 'Sistem', pocketId: pocket_ids.operational },
    { id: '30000000-0000-4000-8000-000000000029', date: createMockDate(0, -5), description: 'Penarikan saldo hadiah oleh Bambang Sudiro', amount: 350000, type: TransactionType.EXPENSE, category: 'Penarikan Hadiah Freelancer', method: 'Transfer Bank', cardId: card_ids.wbank1, teamMemberId: team_member_ids.bambang },
];

// --- DERIVED DATA (Calculated from transactions for consistency) ---
projectsData = projectsData.map(p => {
    const amountPaid = baseTransactions.filter(t => t.projectId === p.id && t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    let paymentStatus = PaymentStatus.BELUM_BAYAR;
    if (amountPaid > 0) paymentStatus = amountPaid >= p.totalCost ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR;
    if (p.totalCost === 0 && amountPaid === 0) paymentStatus = PaymentStatus.LUNAS; // For internal tasks with no cost
    return { ...p, amountPaid, paymentStatus };
});

export const MOCK_PROJECTS = projectsData;
export const MOCK_TRANSACTIONS = baseTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
export const MOCK_CARDS = cardsData;
export const MOCK_FINANCIAL_POCKETS = pocketsData;
export const MOCK_TEAM_PROJECT_PAYMENTS = teamProjectPaymentsData;
export const MOCK_TEAM_MEMBERS = teamMembersData;

export const MOCK_REWARD_LEDGER_ENTRIES: RewardLedgerEntry[] = baseTransactions
    .filter(t => (t.category === 'Hadiah Freelancer' || t.category === 'Penarikan Hadiah Freelancer') && t.teamMemberId)
    .map(t => ({
        id: `rle-${t.id}`, teamMemberId: t.teamMemberId!, date: t.date, description: t.description,
        amount: t.category === 'Penarikan Hadiah Freelancer' ? -t.amount : t.amount, projectId: t.projectId,
    })).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

teamMembersData.forEach(member => {
    member.rewardBalance = MOCK_REWARD_LEDGER_ENTRIES.filter(e => e.teamMemberId === member.id).reduce((sum, e) => sum + e.amount, 0);
});

let cardsData: Card[] = [
  { id: card_ids.wbank1, cardHolderName: 'Admin Vena', bankName: 'WBank', cardType: CardType.PRABAYAR, lastFourDigits: '3090', expiryDate: '09/24', balance: 0, colorGradient: 'from-purple-500 to-indigo-600' },
  { id: card_ids.wbank2, cardHolderName: 'Admin Vena', bankName: 'WBank', cardType: CardType.PRABAYAR, lastFourDigits: '9800', expiryDate: '04/26', balance: 0, colorGradient: 'from-blue-500 to-cyan-500' },
  { id: card_ids.visa, cardHolderName: 'Admin Vena', bankName: 'VISA', cardType: CardType.KREDIT, lastFourDigits: '0032', expiryDate: '09/24', balance: 0, colorGradient: 'from-slate-100 to-slate-300' },
  { id: card_ids.cash, cardHolderName: 'Uang Tunai', bankName: 'Tunai', cardType: CardType.DEBIT, lastFourDigits: 'CASH', balance: 0, colorGradient: 'from-emerald-500 to-green-600' },
];

cardsData.forEach(card => {
    card.balance = baseTransactions.reduce((sum, t) => {
        if (t.cardId === card.id) {
            if (t.type === TransactionType.INCOME) return sum + t.amount;
            if (t.type === TransactionType.EXPENSE) return sum - t.amount;
        }
        return sum;
    }, 0);
});

let pocketsData: FinancialPocket[] = [
    { id: pocket_ids.emergency, name: 'Dana Darurat', description: 'Untuk keperluan tak terduga', icon: 'piggy-bank', type: PocketType.SAVING, amount: 0, goalAmount: 50000000, sourceCardId: card_ids.wbank1 },
    { id: pocket_ids.camera, name: 'Beli Kamera Baru', description: 'Upgrade ke Sony A7IV', icon: 'lock', type: PocketType.LOCKED, amount: 0, goalAmount: 35000000, lockEndDate: createMockDate(6, 1), sourceCardId: card_ids.wbank1 },
    { id: pocket_ids.operational, name: `Anggaran Operasional ${new Date().toLocaleString('id-ID', {month: 'long', year: 'numeric'})}`, description: 'Budget untuk pengeluaran rutin', icon: 'clipboard-list', type: PocketType.EXPENSE, amount: 0, goalAmount: 5000000, sourceCardId: card_ids.wbank1 },
    { id: pocket_ids.reward_pool, name: 'Tabungan Hadiah Freelancer', description: 'Total saldo hadiah semua freelancer.', icon: 'star', type: PocketType.REWARD_POOL, amount: 0 },
];

pocketsData.forEach(pocket => {
    pocket.amount = baseTransactions.reduce((sum, t) => {
        if (t.pocketId === pocket.id) {
            if (t.description.startsWith('Setor ke')) return sum + t.amount;
            if (t.type === TransactionType.EXPENSE) return sum - t.amount;
        }
        return sum;
    }, 0);
});
pocketsData.find(p => p.type === PocketType.REWARD_POOL)!.amount = teamMembersData.reduce((sum, m) => sum + m.rewardBalance, 0);

let teamProjectPaymentsData: TeamProjectPayment[] = projectsData.flatMap(p => 
    p.team.map((t, i) => ({
        id: `tpp-${p.id}-${i}`, projectId: p.id, teamMemberName: t.name, teamMemberId: t.memberId, date: p.date,
        status: 'Unpaid', fee: t.fee, reward: t.reward || 0,
    }))
);
baseTransactions.filter(t => t.category === 'Gaji Freelancer' && t.teamMemberId).forEach(t => {
    const paymentEntry = teamProjectPaymentsData.find(p => p.projectId === t.projectId && p.teamMemberId === t.teamMemberId);
    if (paymentEntry) paymentEntry.status = 'Paid';
});

export const MOCK_TEAM_PAYMENT_RECORDS: TeamPaymentRecord[] = [
    { id: '40000000-0000-4000-8000-000000000001', recordNumber: 'PAY-FR-TM002-1234', teamMemberId: team_member_ids.siti, date: createMockDate(-2, 26), projectPaymentIds: [MOCK_TEAM_PROJECT_PAYMENTS.find(p => p.projectId === project_ids.p2 && p.teamMemberId === team_member_ids.siti)?.id || ''], totalAmount: 2000000 },
    { id: '40000000-0000-4000-8000-000000000002', recordNumber: 'PAY-FR-TM001-5678', teamMemberId: team_member_ids.bambang, date: createMockDate(-2, 19), projectPaymentIds: [MOCK_TEAM_PROJECT_PAYMENTS.find(p => p.projectId === project_ids.p3 && p.teamMemberId === team_member_ids.bambang)?.id || ''], totalAmount: 1500000 },
    { id: '40000000-0000-4000-8000-000000000003', recordNumber: 'PAY-FR-TM001-9012', teamMemberId: team_member_ids.bambang, date: createMockDate(-1, 9), projectPaymentIds: [MOCK_TEAM_PROJECT_PAYMENTS.find(p => p.projectId === project_ids.p6 && p.teamMemberId === team_member_ids.bambang)?.id || ''], totalAmount: 1750000 },
    { id: '40000000-0000-4000-8000-000000000004', recordNumber: 'PAY-FR-TM003-3456', teamMemberId: team_member_ids.rahmat, date: createMockDate(-1, 9), projectPaymentIds: [MOCK_TEAM_PROJECT_PAYMENTS.find(p => p.projectId === project_ids.p6 && p.teamMemberId === team_member_ids.rahmat)?.id || ''], totalAmount: 2000000 },
];

export const MOCK_ASSETS: Asset[] = [
    { id: '50000000-0000-4000-8000-000000000001', name: 'Sony Alpha 7 IV', category: 'Kamera', purchaseDate: createMockDate(-12, 5), purchasePrice: 38000000, serialNumber: 'SN12345678', status: AssetStatus.AVAILABLE },
    { id: '50000000-0000-4000-8000-000000000002', name: 'Sony FE 24-70mm f/2.8 GM II', category: 'Lensa', purchaseDate: createMockDate(-12, 5), purchasePrice: 32000000, serialNumber: 'SN98765432', status: AssetStatus.IN_USE, notes: 'Digunakan oleh Bambang' },
    { id: '50000000-0000-4000-8000-000000000003', name: 'DJI Mavic 3 Pro', category: 'Drone', purchaseDate: createMockDate(-6, 15), purchasePrice: 30000000, serialNumber: 'SNDRONE01', status: AssetStatus.AVAILABLE },
    { id: '50000000-0000-4000-8000-000000000004', name: 'Godox AD200 Pro', category: 'Lighting', purchaseDate: createMockDate(-24, 1), purchasePrice: 5000000, status: AssetStatus.MAINTENANCE, notes: 'Bohlam perlu diganti.' },
    { id: '50000000-0000-4000-8000-000000000005', name: 'Canon EOS R5', category: 'Kamera', purchaseDate: createMockDate(-3, 20), purchasePrice: 60000000, serialNumber: 'SNCANONR5', status: AssetStatus.IN_USE, notes: 'Digunakan oleh Siti Aminah' },
];

export const MOCK_CONTRACTS: Contract[] = [
    { id: '60000000-0000-4000-8000-000000000001', contractNumber: 'VP/CTR/2024/001', clientId: client_ids.andi, projectId: project_ids.p1, signingDate: createMockDate(0, -15), signingLocation: 'Kantor Vena Pictures', createdAt: createMockDate(0, -15), clientName1: 'Andi', clientAddress1: 'Hotel Mulia, Jakarta', clientPhone1: '081111111111', clientName2: 'Siska', clientAddress2: 'Hotel Mulia, Jakarta', clientPhone2: '081111111111', shootingDuration: 'Sesuai detail paket', guaranteedPhotos: '400 Foto Edit', albumDetails: '1 Album (20x30 cm, 20 halaman, Box), Cetak 4R (20 lembar + Box)', digitalFilesFormat: 'Semua File (USB)', otherItems: 'Sewa Drone', personnelCount: '2 Fotografer, 2 Videografer', deliveryTimeframe: '45 hari kerja', dpDate: createMockDate(0, -15), finalPaymentDate: createMockDate(1, 3), cancellationPolicy: 'DP yang sudah dibayarkan tidak dapat dikembalikan.\nJika pembatalan dilakukan H-7 sebelum hari pelaksanaan, PIHAK KEDUA wajib membayar 50% dari total biaya.', jurisdiction: 'Jakarta' },
    { id: '60000000-0000-4000-8000-000000000002', contractNumber: 'VP/CTR/2024/002', clientId: client_ids.fajar, projectId: project_ids.p4, signingDate: createMockDate(0, -6), signingLocation: 'Online', createdAt: createMockDate(0, -6), clientName1: 'Fajar Nugraha', clientAddress1: 'Gedung Kesenian, Jakarta', clientPhone1: '084444444444', clientName2: '', clientAddress2: '', clientPhone2: '', shootingDuration: 'Sesuai detail paket', guaranteedPhotos: '300 Foto Edit', albumDetails: '1 Album (20x30 cm, 20 halaman)', digitalFilesFormat: 'Semua File (Link Drive)', otherItems: 'Jam Liputan Tambahan', personnelCount: '2 Fotografer, 1 Videografer', deliveryTimeframe: '30 hari kerja', dpDate: createMockDate(0, -6), finalPaymentDate: createMockDate(0, 21), cancellationPolicy: 'DP tidak dapat dikembalikan.', jurisdiction: 'Jakarta' },
];

export const MOCK_CLIENT_FEEDBACK: ClientFeedback[] = [
    { id: '70000000-0000-4000-8000-000000000001', clientName: 'Budi Santoso', satisfaction: SatisfactionLevel.VERY_SATISFIED, rating: 5, feedback: 'Tim sangat profesional dan hasilnya luar biasa! Sangat puas dengan pelayanan Vena Pictures.', date: createMockDate(-1, 28) },
    { id: '70000000-0000-4000-8000-000000000002', clientName: 'Citra Lestari', satisfaction: SatisfactionLevel.SATISFIED, rating: 4, feedback: 'Secara keseluruhan bagus, komunikasinya lancar. Hasilnya juga memuaskan.', date: createMockDate(0, -5) },
    { id: '70000000-0000-4000-8000-000000000003', clientName: 'Fajar Nugraha', satisfaction: SatisfactionLevel.NEUTRAL, rating: 3, feedback: 'Hasilnya oke, tapi proses editing agak lama dari yang diharapkan.', date: createMockDate(0, -1) },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '80000000-0000-4000-8000-000000000001', title: 'Revisi Tertunda', message: 'Rahmat Hidayat belum menyelesaikan revisi untuk proyek "Prewedding Gita Permata".', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), isRead: false, icon: 'revision', link: { view: ViewType.PROJECTS, action: { type: 'VIEW_PROJECT_DETAILS', id: project_ids.p6 }}},
    { id: '80000000-0000-4000-8000-000000000002', title: 'Deadline Mendekat', message: 'Proyek "Event EO Hendra" akan segera mencapai deadline.', timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), isRead: false, icon: 'deadline', link: { view: ViewType.PROJECTS, action: { type: 'VIEW_PROJECT_DETAILS', id: project_ids.p7 }}},
    { id: '80000000-0000-4000-8000-000000000003', title: 'Prospek Baru Masuk', message: 'Maya Putri dari Referral, lokasi di Bandung.', timestamp: new Date(new Date().setDate(new Date().getDate() - 0)).toISOString(), isRead: false, icon: 'lead', link: { view: ViewType.PROSPEK, action: { type: 'VIEW_LEAD', id: '10000000-0000-4000-8000-000000000008' }}},
    { id: '80000000-0000-4000-8000-000000000004', title: 'Pembayaran Belum Lunas', message: 'Pelunasan untuk proyek "Pernikahan Andi & Siska" belum diterima.', timestamp: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), isRead: true, icon: 'payment', link: { view: ViewType.CLIENTS, action: { type: 'VIEW_CLIENT_DETAILS', id: client_ids.andi }}},
    { id: '80000000-0000-4000-8000-000000000005', title: 'Proyek Selesai', message: 'Proyek "Lamaran Citra Lestari" telah selesai. Minta feedback klien.', timestamp: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(), isRead: true, icon: 'completed', link: { view: ViewType.CLIENTS, action: { type: 'VIEW_CLIENT_DETAILS', id: client_ids.citra }}},
];

export const MOCK_SOCIAL_MEDIA_POSTS: SocialMediaPost[] = [
    { id: '90000000-0000-4000-8000-000000000001', projectId: project_ids.p1, clientName: 'Andi & Siska', postType: PostType.INSTAGRAM_REELS, platform: 'Instagram', scheduledDate: createMockDate(0, 7), caption: 'Momen magis dari pernikahan Andi & Siska! ✨ #weddingreels #venapictures', mediaUrl: 'https://example.com/reels/andi_siska.mp4', status: PostStatus.SCHEDULED, notes: 'Gunakan lagu "Perfect - Ed Sheeran".' },
    { id: '90000000-0000-4000-8000-000000000002', projectId: project_ids.p2, clientName: 'Budi Santoso (WO)', postType: PostType.INSTAGRAM_FEED, platform: 'Instagram', scheduledDate: createMockDate(-1, 0), caption: 'Menjelajahi keindahan Bromo bersama Budi & Rekan. 🌄 #preweddingbromo #venapictures', mediaUrl: 'https://example.com/feed/budi_bromo.jpg', status: PostStatus.POSTED },
    { id: '90000000-0000-4000-8000-000000000003', projectId: project_ids.p3, clientName: 'Citra Lestari', postType: PostType.INSTAGRAM_STORY, platform: 'Instagram', scheduledDate: createMockDate(0, 1), caption: 'Behind the scenes lamaran Citra!', status: PostStatus.SCHEDULED, notes: 'Buat polling "Tim lamaran siapa nih?".' },
    { id: '90000000-0000-4000-8000-000000000004', projectId: project_ids.p4, clientName: 'Fajar Nugraha', postType: PostType.TIKTOK, platform: 'TikTok', scheduledDate: createMockDate(0, 10), caption: 'GRWM versi vendor! #weddingvendor #behindthescenes', status: PostStatus.DRAFT },
    { id: '90000000-0000-4000-8000-000000000005', projectId: project_ids.p6, clientName: 'Gita Permata', postType: PostType.BLOG, platform: 'Website', scheduledDate: createMockDate(0, 12), caption: '5 Tips Pre-wedding di Kawah Putih: Panduan Lengkap', status: PostStatus.DRAFT },
    { id: '90000000-0000-4000-8000-000000000006', projectId: project_ids.p9, clientName: 'Fajar Nugraha', postType: PostType.INSTAGRAM_FEED, platform: 'Instagram', scheduledDate: createMockDate(0, 25), caption: 'Happy birthday! 🎂 Serunya pesta ulang tahun anak Fajar.', status: PostStatus.DRAFT },
];