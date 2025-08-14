import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType, FinancialPocket, PocketType, Profile, Project, Card, CardType, TeamMember, RewardLedgerEntry } from '../types';
import PageHeader from './PageHeader';
import Modal from './Modal';
import StatCard from './StatCard';
import DonutChart from './DonutChart';
import InteractiveCashflowChart from './InteractiveCashflowChart';
import { PencilIcon, Trash2Icon, PlusIcon, PiggyBankIcon, LockIcon, Users2Icon, ClipboardListIcon, DollarSignIcon, ArrowUpIcon, ArrowDownIcon, CreditCardIcon, FileTextIcon, CalendarIcon, TrendingUpIcon, TrendingDownIcon, BarChart2Icon, DownloadIcon, CashIcon, StarIcon, LightbulbIcon, TargetIcon, PrinterIcon } from '../constants';
import { cardsService, financialPocketsService } from '../services/database';
import { useCrud } from '../hooks/useCrud';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const downloadCSV = (headers: string[], data: (string | number)[][], filename: string) => {
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            row.map(field => {
                const str = String(field);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',')
        )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const PRODUCTION_COST_CATEGORIES = ["Gaji Freelancer", "Transportasi", "Konsumsi", "Sewa Tempat", "Sewa Alat", "Cetak Album"];

const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);


const emptyTransaction = {
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: TransactionType.EXPENSE,
    category: '',
    method: 'Kartu',
    cardId: '',
    sourceId: '', // 'card-ID' or 'pocket-ID'
};

const emptyPocket: Omit<FinancialPocket, 'id' | 'amount'> = { name: '', description: '', type: PocketType.SAVING, icon: 'piggy-bank' };
const emptyCard: Omit<Card, 'id' | 'balance'> = { cardHolderName: 'Nama Pengguna', bankName: 'WBank', cardType: CardType.PRABAYAR, lastFourDigits: '', expiryDate: '', colorGradient: 'from-blue-500 to-cyan-500' };

const CardWidget: React.FC<{ card: Card, onEdit: () => void, onDelete: () => void, onClick: () => void }> = ({ card, onEdit, onDelete, onClick }) => {
    const isLight = card.colorGradient.includes('slate-100');
    const textColor = isLight ? 'text-gray-800' : 'text-white';

    const VisaLogo = () => <svg height="20px" viewBox="0 0 1000 310" className={`${isLight ? 'fill-black/70' : 'fill-white'}`}><path d="M783 310h101l-123-310H643l-89 220-22-220H414L291 310h103l23-60h100l15 60zM520 125l31 82 31-82h-62zM389 125l-63 158-20-44-41-114h-100l170 310h124L741 0H638l-49 125z"/></svg>;
    const WifiIcon = () => (<svg className={`w-5 h-5 ${isLight ? 'stroke-black/70' : 'stroke-white'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/></svg>);

    return (
        <div className="group relative cursor-pointer" onClick={onClick}>
            <div className={`p-6 rounded-2xl ${textColor} shadow-lg flex flex-col justify-between aspect-[1.586] bg-gradient-to-br ${card.colorGradient}`}>
                <div>
                    <div className="flex justify-between items-center">
                        <WifiIcon />
                        {card.bankName.toUpperCase() === 'VISA' ? <VisaLogo /> : <span className="font-extrabold text-xl tracking-tighter">{card.bankName}</span>}
                    </div>
                    <div className="mt-8">
                        <p className="text-sm">Saldo Tersedia</p>
                        <p className="text-3xl font-bold tracking-tight">{formatCurrency(card.balance)}</p>
                    </div>
                </div>
                <div>
                    <p className="text-xl font-mono tracking-widest">**** **** **** {card.lastFourDigits}</p>
                    <div className="flex justify-between items-end mt-4 text-sm">
                        <div>
                            <p className="text-xs opacity-70">Pemegang Kartu</p>
                            <p className="font-medium">{card.cardHolderName}</p>
                        </div>
                        {card.expiryDate && (
                            <div>
                                <p className="text-xs opacity-70">Kadaluwarsa</p>
                                <p className="font-medium">{card.expiryDate}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 non-printable">
                 <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-sm"><PencilIcon className="w-5 h-5"/></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-sm"><Trash2Icon className="w-5 h-5"/></button>
            </div>
        </div>
    );
};

const CashWidget: React.FC<{ card: Card, onTopUp: () => void, onEdit: () => void, onClick: () => void }> = ({ card, onTopUp, onEdit, onClick }) => (
    <div className="group relative cursor-pointer" onClick={onClick}>
        <div className={`p-6 rounded-2xl text-white shadow-lg flex flex-col justify-between aspect-[1.586] bg-gradient-to-br ${card.colorGradient}`}>
            <div>
                <div className="flex justify-between items-center">
                    <CashIcon className="w-8 h-8"/>
                    <span className="font-extrabold text-xl tracking-tighter">{card.bankName}</span>
                </div>
                <div className="mt-8">
                    <p className="text-sm">Uang Tunai</p>
                    <p className="text-3xl font-bold tracking-tight">{formatCurrency(card.balance)}</p>
                </div>
            </div>
            <p className="text-sm text-white/70">Akun untuk mencatat transaksi tunai.</p>
        </div>
        <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 non-printable">
            <button onClick={(e) => { e.stopPropagation(); onTopUp(); }} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-sm" title="Top-up Tunai"><ArrowUpIcon className="w-5 h-5"/></button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-sm" title="Edit"><PencilIcon className="w-5 h-5"/></button>
        </div>
    </div>
);


interface FinanceProps {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    cards: Card[];
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
    pockets: FinancialPocket[];
    setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
    projects: Project[];
    profile: Profile;
    teamMembers: TeamMember[];
    rewardLedgerEntries: RewardLedgerEntry[];
    showNotification: (message: string) => void;
    onSignTransaction: (transactionId: string, signatureDataUrl: string) => void;
}

const pocketIcons: { [key in FinancialPocket['icon']]: React.ReactNode } = {
    'piggy-bank': <PiggyBankIcon className="w-8 h-8"/>, 'lock': <LockIcon className="w-8 h-8"/>,
    'users': <Users2Icon className="w-8 h-8"/>, 'clipboard-list': <ClipboardListIcon className="w-8 h-8"/>,
    'star': <StarIcon className="w-8 h-8"/>
};

const getMonthDateRange = (date: Date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
        from: startOfMonth.toISOString().split('T')[0],
        to: endOfMonth.toISOString().split('T')[0]
    };
};


const Finance: React.FC<FinanceProps> = ({ transactions, setTransactions, cards, setCards, pockets, setPockets, projects, profile, teamMembers, rewardLedgerEntries, showNotification, onSignTransaction }) => {
    // CRUD hooks
    const cardsCrud = useCrud(cardsService, showNotification, 'Kartu');
    const pocketsCrud = useCrud(financialPocketsService, showNotification, 'Pocket');

    // Sync with parent state
    useEffect(() => {
        setCards(cardsCrud.items);
    }, [cardsCrud.items, setCards]);

    useEffect(() => {
        setPockets(pocketsCrud.items);
    }, [pocketsCrud.items, setPockets]);

    const [activeTab, setActiveTab] = useState<'transactions' | 'pockets' | 'cards' | 'cashflow' | 'laporan' | 'labaProyek'>('transactions');
    const [modalState, setModalState] = useState<{ type: null | 'transaction' | 'pocket' | 'card' | 'transfer' | 'topup-cash', mode: 'add' | 'edit', data?: any }>({ type: null, mode: 'add' });
    const [historyModalState, setHistoryModalState] = useState<{ type: 'card' | 'pocket' | 'reward_pool', item: Card | FinancialPocket | null } | null>(null);
    const [form, setForm] = useState<any>({});
    const [activeStatModal, setActiveStatModal] = useState<'assets' | 'pockets' | 'income' | 'expense' | null>(null);

    // Card CRUD states
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [cardModalMode, setCardModalMode] = useState<'add' | 'edit'>('add');
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [cardFormData, setCardFormData] = useState({
        cardHolderName: '',
        bankName: '',
        cardType: CardType.DEBIT as CardType,
        lastFourDigits: '',
        expiryDate: '',
        balance: 0,
        colorGradient: '#3b82f6'
    });

    // Pocket CRUD states
    const [isPocketModalOpen, setIsPocketModalOpen] = useState(false);
    const [pocketModalMode, setPocketModalMode] = useState<'add' | 'edit'>('add');
    const [selectedPocket, setSelectedPocket] = useState<FinancialPocket | null>(null);
    const [pocketFormData, setPocketFormData] = useState({
        name: '',
        description: '',
        icon: 'piggy-bank' as FinancialPocket['icon'],
        type: PocketType.SAVING,
        amount: 0,
        goalAmount: 0,
        lockEndDate: '',
        members: [] as string[],
        sourceCardId: ''
    });


    //FILTERS
    const [filters, setFilters] = useState({ searchTerm: '', dateFrom: '', dateTo: '' });
    const [categoryFilter, setCategoryFilter] = useState<{ type: TransactionType | 'all', category: string }>({ type: 'all', category: 'Semua' });
    const [reportFilters, setReportFilters] = useState({ client: 'all', dateFrom: '', dateTo: '' });
    const [profitReportFilters, setProfitReportFilters] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });


    // --- Card & Pocket Modal Helper Handlers (for dedicated modals) ---
    const handleOpenPocketModal = (mode: 'add' | 'edit', pocket?: FinancialPocket) => {
        setPocketModalMode(mode);
        setIsPocketModalOpen(true);
        if (mode === 'edit' && pocket) {
            setSelectedPocket(pocket);
            setPocketFormData({
                name: pocket.name,
                description: pocket.description,
                icon: pocket.icon,
                type: pocket.type,
                amount: pocket.amount,
                goalAmount: pocket.goalAmount || 0,
                lockEndDate: pocket.lockEndDate || '',
                members: (pocket.members || []).map(m => typeof m === 'string' ? m : (m as any).id || ''),
                sourceCardId: pocket.sourceCardId || ''
            });
        } else {
            setSelectedPocket(null);
            setPocketFormData({
                name: '',
                description: '',
                icon: 'piggy-bank',
                type: PocketType.SAVING,
                amount: 0,
                goalAmount: 0,
                lockEndDate: '',
                members: [],
                sourceCardId: ''
            });
        }
    };

    const handlePocketFormChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setPocketFormData(prev => ({ ...prev, [name]: name === 'amount' || name === 'goalAmount' ? Number(value) : value }));
    };

    const handlePocketSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pocketModalMode === 'add') {
            const newPocket: FinancialPocket = {
                id: `POC${Date.now()}`,
                name: pocketFormData.name,
                description: pocketFormData.description,
                icon: pocketFormData.icon,
                type: pocketFormData.type,
                amount: Number(pocketFormData.amount) || 0,
                goalAmount: pocketFormData.goalAmount || undefined,
                lockEndDate: pocketFormData.lockEndDate || undefined,
                members: [],
                sourceCardId: pocketFormData.sourceCardId || undefined,
            };
            setPockets(prev => [...prev, newPocket]);
            showNotification(`Kantong "${newPocket.name}" ditambahkan.`);
        } else if (selectedPocket) {
            setPockets(prev => prev.map(p => p.id === selectedPocket.id ? {
                ...p,
                name: pocketFormData.name,
                description: pocketFormData.description,
                icon: pocketFormData.icon,
                type: pocketFormData.type,
                amount: Number(pocketFormData.amount) || 0,
                goalAmount: pocketFormData.goalAmount || undefined,
                lockEndDate: pocketFormData.lockEndDate || undefined,
                sourceCardId: pocketFormData.sourceCardId || undefined,
            } : p));
            showNotification(`Kantong "${selectedPocket.name}" diperbarui.`);
        }
        setIsPocketModalOpen(false);
    };

    const handlePocketDelete = (id: string) => {
        setPockets(prev => prev.filter(p => p.id !== id));
        showNotification('Kantong dihapus.');
    };

    const handleOpenCardModal = (mode: 'add' | 'edit', card?: Card) => {
        setCardModalMode(mode);
        setIsCardModalOpen(true);
        if (mode === 'edit' && card) {
            setSelectedCard(card);
            setCardFormData({
                cardHolderName: card.cardHolderName,
                bankName: card.bankName,
                cardType: card.cardType,
                lastFourDigits: card.lastFourDigits,
                expiryDate: card.expiryDate || '',
                balance: card.balance,
                colorGradient: '#3b82f6',
            });
        } else {
            setSelectedCard(null);
            setCardFormData({
                cardHolderName: '',
                bankName: '',
                cardType: CardType.DEBIT,
                lastFourDigits: '',
                expiryDate: '',
                balance: 0,
                colorGradient: '#3b82f6',
            });
        }
    };

    const handleCardFormChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setCardFormData(prev => ({
            ...prev,
            [name]: name === 'balance' ? Number(value) : name === 'cardType' ? (value as CardType) : value,
        }));
    };

    const handleCardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cardModalMode === 'add') {
            const newCard: Card = {
                id: `CARD${Date.now()}`,
                cardHolderName: cardFormData.cardHolderName,
                bankName: cardFormData.bankName,
                cardType: cardFormData.cardType,
                lastFourDigits: cardFormData.lastFourDigits,
                expiryDate: cardFormData.expiryDate,
                balance: Number(cardFormData.balance) || 0,
                colorGradient: 'from-blue-500 to-cyan-500',
            };
            setCards(prev => [...prev, newCard]);
            if (newCard.balance > 0) {
                const initialTx: Transaction = {
                    id: `TRN-INIT-${newCard.id}`,
                    date: new Date().toISOString().split('T')[0],
                    description: `Saldo Awal - ${newCard.bankName} ${newCard.lastFourDigits}`,
                    amount: newCard.balance,
                    type: TransactionType.INCOME,
                    category: 'Modal',
                    method: 'Sistem',
                    cardId: newCard.id,
                };
                setTransactions(prev => [...prev, initialTx].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
            showNotification(`Kartu baru "${newCard.bankName}" ditambahkan.`);
        } else if (selectedCard) {
            setCards(prev => prev.map(c => c.id === selectedCard.id ? {
                ...c,
                cardHolderName: cardFormData.cardHolderName,
                bankName: cardFormData.bankName,
                cardType: cardFormData.cardType,
                lastFourDigits: cardFormData.lastFourDigits,
                expiryDate: cardFormData.expiryDate,
                balance: Number(cardFormData.balance) || 0,
            } : c));
            showNotification(`Detail kartu "${selectedCard.bankName}" diperbarui.`);
        }
        setIsCardModalOpen(false);
    };

    const handleCardDelete = (id: string) => {
        if (id === 'CARD_CASH') { alert('Akun Tunai tidak dapat dihapus.'); return; }
        setCards(prev => prev.filter(c => c.id !== id));
        showNotification('Kartu dihapus.');
    };

    const handleCloseBudget = (budgetPocket: FinancialPocket, isAutomatic: boolean = false) => {
        if (!budgetPocket) {
            return;
        }

        const now = new Date();
        const closedPocketName = budgetPocket.name;
        const currentMonthName = `Anggaran Operasional ${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;

        if (budgetPocket.amount > 0) {
            const newSavedPocket: FinancialPocket = {
                id: `POC-SISA-${now.getTime()}`,
                name: `Sisa ${closedPocketName}`,
                description: 'Hasil penutupan anggaran bulanan.',
                icon: 'piggy-bank',
                type: PocketType.SAVING,
                amount: budgetPocket.amount,
                sourceCardId: budgetPocket.sourceCardId,
            };

            const closingTx: Transaction = {
                id: `TRN-CLOSE-${now.getTime()}`,
                date: now.toISOString().split('T')[0],
                description: `Penutupan anggaran: ${closedPocketName}`,
                amount: budgetPocket.amount,
                type: TransactionType.EXPENSE,
                category: 'Penutupan Anggaran',
                method: 'Sistem',
                pocketId: budgetPocket.id
            };

            setPockets(prev => {
                const withNewPocket = [...prev, newSavedPocket];
                return withNewPocket.map(p =>
                    p.id === budgetPocket.id
                        ? { ...p, amount: 0, name: currentMonthName }
                        : p);
            });
            setTransactions(prev => [closingTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            showNotification(`Anggaran "${closedPocketName}" ditutup. Sisa ${formatCurrency(budgetPocket.amount)} disimpan.`);
        } else {
            // Just reset the pocket for the new month if amount is 0
            setPockets(prev => prev.map(p =>
                p.id === budgetPocket.id
                    ? { ...p, name: currentMonthName }
                    : p
            ));
            if (isAutomatic) {
                showNotification(`Anggaran bulanan telah diperbarui untuk ${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}.`);
            }
        }
    };

    useEffect(() => {
        const autoCloseBudget = () => {
            const budgetPocket = pockets.find(p => p.type === PocketType.EXPENSE);
            if (!budgetPocket) return;

            const nameParts = budgetPocket.name.replace('Anggaran Operasional ', '').split(' ');
            if (nameParts.length < 2) return;

            const monthName = nameParts[0];
            const year = parseInt(nameParts[1], 10);

            if (isNaN(year)) return;

            const monthMap: { [key: string]: number } = {
                'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
                'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
            };
            const month = monthMap[monthName];

            if (month === undefined) return;

            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                handleCloseBudget(budgetPocket, true);
            }
        };

        autoCloseBudget();
    }, []); // Run only once on mount

    const cashflowChartData = useMemo(() => {
        const monthlyData: { [key: string]: { income: number, expense: number } } = {};
        [...transactions].reverse().forEach(t => {
            const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
            if (t.type === TransactionType.INCOME) monthlyData[month].income += t.amount;
            else if (t.type === TransactionType.EXPENSE) monthlyData[month].expense += t.amount;
        });

        let balance = 0;
        return Object.entries(monthlyData).map(([label, values]) => {
            balance += values.income - values.expense;
            return { label, ...values, balance };
        });
    }, [transactions]);

    const cashflowMetrics = useMemo(() => {
        const data = cashflowChartData; // The chart data is already calculated
        if (data.length === 0) {
            return { avgIncome: 0, avgExpense: 0, runway: 'N/A', burnRate: 0 };
        }
        const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
        const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
        const numMonths = data.length;

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const recentTransactions = transactions.filter(t => new Date(t.date) >= sixMonthsAgo);
        const recentNetChange = recentTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0) - recentTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const monthlyBurnRate = recentNetChange > 0 ? recentNetChange / Math.min(6, numMonths) : 0;

        let runway = 'Tak Terbatas';
        if (monthlyBurnRate > 0) {
            const totalAssets = cards.reduce((sum, card) => sum + card.balance, 0);
            const runwayInMonths = totalAssets / monthlyBurnRate;
            runway = `${runwayInMonths.toFixed(1)} bulan`;
        }

        return {
            avgIncome: totalIncome / numMonths,
            avgExpense: totalExpense / numMonths,
            runway,
            burnRate: monthlyBurnRate
        };
    }, [transactions, cards, cashflowChartData]);

    const { summary, thisMonthIncome, thisMonthExpense } = useMemo(() => {
        const totalAssets = cards.reduce((sum, c) => sum + c.balance, 0);
        const pocketsTotal = pockets.filter(p => p.type !== PocketType.REWARD_POOL).reduce((sum, p) => sum + p.amount, 0);
        const totalRewards = teamMembers.reduce((sum, m) => sum + m.rewardBalance, 0);

        const now = new Date();
        const { from, to } = getMonthDateRange(now);
        const fromDate = new Date(from); fromDate.setHours(0,0,0,0);
        const toDate = new Date(to); toDate.setHours(23,59,59,999);

        const thisMonthTransactions = transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= fromDate && txDate <= toDate;
        });

        const totalIncomeThisMonth = thisMonthTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const totalExpenseThisMonth = thisMonthTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);

        return { 
            summary: { totalAssets, pocketsTotal, totalIncomeThisMonth, totalExpenseThisMonth, totalRewards },
            thisMonthIncome: thisMonthTransactions.filter(t => t.type === TransactionType.INCOME).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            thisMonthExpense: thisMonthTransactions.filter(t => t.type === TransactionType.EXPENSE).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
    }, [cards, pockets, transactions, teamMembers]);

    const monthlyBudgetPocket = useMemo(() => pockets.find(p => p.type === PocketType.EXPENSE), [pockets]);

    const categoryTotals = useMemo(() => {
        const income: Record<string, number> = {};
        const expense: Record<string, number> = {};

        transactions.forEach(t => {
            if (t.type === TransactionType.INCOME) {
                income[t.category] = (income[t.category] || 0) + t.amount;
            } else {
                expense[t.category] = (expense[t.category] || 0) + t.amount;
            }
        });

        return { income, expense };
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
            const to = filters.dateTo ? new Date(filters.dateTo) : null;
            if (from) from.setHours(0,0,0,0);
            if (to) to.setHours(23,59,59,999);

            const searchMatch = (
                t.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
            const dateMatch = (!from || date >= from) && (!to || date <= to);

            let categoryMatch = true;
            if (categoryFilter.type !== 'all') {
                if (t.type !== categoryFilter.type) {
                    categoryMatch = false;
                } else if (categoryFilter.category !== 'Semua' && t.category !== categoryFilter.category) {
                    categoryMatch = false;
                }
            }

            return searchMatch && dateMatch && categoryMatch;
        });
    }, [transactions, filters, categoryFilter]);

    const filteredSummary = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);
        return { income, expense, net: income - expense };
    }, [filteredTransactions]);

    const reportClientOptions = useMemo(() => {
        const clientMap = projects.reduce((acc, p) => {
            if (!acc[p.clientId]) {
                acc[p.clientId] = p.clientName;
            }
            return acc;
        }, {} as Record<string, string>);
        return Object.entries(clientMap).map(([id, name]) => ({ id, name }));
    }, [projects]);

    const reportTransactions = useMemo(() => transactions.filter(t => {
        const date = new Date(t.date);
        const from = reportFilters.dateFrom ? new Date(reportFilters.dateFrom) : null;
        const to = reportFilters.dateTo ? new Date(reportFilters.dateTo) : null;
        if (from) from.setHours(0,0,0,0);
        if (to) to.setHours(23,59,59,999);

        const dateMatch = (!from || date >= from) && (!to || date <= to);

        const projectIdsForClient = projects
            .filter(p => p.clientId === reportFilters.client)
            .map(p => p.id);

        const clientMatch = reportFilters.client === 'all' || (t.projectId && projectIdsForClient.includes(t.projectId));

        return dateMatch && clientMatch;
    }), [transactions, projects, reportFilters]);

    const projectProfitabilityData = useMemo(() => {
        const { year, month } = profitReportFilters;

        // 1. Filter projects that have an event date within the selected month/year
        const projectsInMonth = projects.filter(p => {
            const projectDate = new Date(p.date);
            return projectDate.getFullYear() === year && projectDate.getMonth() === month;
        });

        // 2. Get a unique list of clientIds from these projects
        const clientIdsInMonth = [...new Set(projectsInMonth.map(p => p.clientId))];

        // 3. For each unique clientId, calculate profitability
        return clientIdsInMonth.map(clientId => {
            const client = reportClientOptions.find(c => c.id === clientId);
            if (!client) return null;

            const clientProjectsInMonth = projectsInMonth.filter(p => p.clientId === clientId);
            const clientProjectIdsInMonth = clientProjectsInMonth.map(p => p.id);

            // Find all transactions linked to this client's projects in this month
            const relevantTransactions = transactions.filter(t => t.projectId && clientProjectIdsInMonth.includes(t.projectId));

            const totalIncome = relevantTransactions
                .filter(t => t.type === TransactionType.INCOME)
                .reduce((sum, t) => sum + t.amount, 0);

            const totalCost = relevantTransactions
                .filter(t => t.type === TransactionType.EXPENSE && PRODUCTION_COST_CATEGORIES.includes(t.category))
                .reduce((sum, t) => sum + t.amount, 0);

            const profit = totalIncome - totalCost;

            return {
                clientId,
                clientName: client.name,
                totalIncome,
                totalCost,
                profit
            };
        }).filter(Boolean); // Remove nulls if a client wasn't found
    }, [profitReportFilters, projects, transactions, reportClientOptions]);

    const profitReportMetrics = useMemo(() => {
        if (projectProfitabilityData.length === 0) {
            return { totalProfit: 0, mostProfitableClient: 'N/A', profitableProjectsCount: 0, avgProfit: 0 };
        }
        const totalProfit = projectProfitabilityData.reduce((sum, item) => sum + (item?.profit || 0), 0);
        const mostProfitableClient = [...projectProfitabilityData].sort((a,b) => (b?.profit || 0) - (a?.profit || 0))[0]?.clientName || 'N/A';
        const profitableProjectsCount = projectProfitabilityData.filter(item => (item?.profit || 0) > 0).length;
        const avgProfit = totalProfit / projectProfitabilityData.length;
        return { totalProfit, mostProfitableClient, profitableProjectsCount, avgProfit };
    }, [projectProfitabilityData]);

    const reportYearOptions = useMemo(() => {
        const years = new Set<number>(transactions.map(t => new Date(t.date).getFullYear()));
        return Array.from(years).sort((a: number, b: number) => b - a);
    }, [transactions]);

    const generalReportMetrics = useMemo(() => {
        if (reportFilters.client !== 'all') return null;
        const reportIncome = reportTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
        const reportExpense = reportTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
        const incomeDonut = Object.entries(reportTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => ({...acc, [t.category]: (acc[t.category] || 0) + t.amount }), {} as Record<string, number>)).map(([l, v], i) => ({label: l, value: v, color: ['#34d399', '#60a5fa', '#38bdf8', '#a3e635', '#4ade80'][i % 5]}));
        const expenseDonut = Object.entries(reportTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => ({...acc, [t.category]: (acc[t.category] || 0) + t.amount }), {} as Record<string, number>)).map(([l, v], i) => ({label: l, value: v, color: ['#f87171', '#fb923c', '#facc15', '#ef4444', '#f472b6'][i % 5]}));
        return { reportIncome, reportExpense, incomeDonut, expenseDonut };
    }, [reportTransactions, reportFilters.client]);


    const handleOpenModal = (type: 'transaction' | 'pocket' | 'card' | 'transfer' | 'topup-cash', mode: 'add' | 'edit', data?: any) => {
        setModalState({ type, mode, data });
        if (mode === 'add') {
            if (type === 'transaction') setForm({...emptyTransaction, cardId: cards.find(c => c.id !== 'CARD_CASH')?.id || '', sourceId: cards.find(c => c.id !== 'CARD_CASH')?.id ? `card-${cards.find(c => c.id !== 'CARD_CASH')?.id}` : ''});
            if (type === 'pocket') setForm(emptyPocket);
            if (type === 'card') setForm({ ...emptyCard, initialBalance: '' });
            if (type === 'transfer') {
                const transferType = data?.transferType || 'deposit';
                setForm({ amount: '', fromCardId: cards.find(c=> c.id !== 'CARD_CASH')?.id || cards[0]?.id || '', toPocketId: data?.id, type: transferType });
            }
            if (type === 'topup-cash') setForm({ amount: '', fromCardId: cards.find(c => c.id !== 'CARD_CASH')?.id || '' });
        } else {
            setForm({ ...data, adjustmentAmount: '', adjustmentReason: '' });
        }
    };
    const handleCloseModal = () => setModalState({ type: null, mode: 'add' });
    const handleFormChange = (e: React.ChangeEvent<any>) => setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFilterChange = (e: React.ChangeEvent<any>) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { type, mode, data } = modalState;

        if (type === 'transaction') {
            const newTx = { ...form, amount: Number(form.amount) };
            if (mode === 'add') {
                 if (newTx.type === TransactionType.EXPENSE) {
                    const source = newTx.sourceId; // e.g., 'card-CARD001' or 'pocket-POC003'
                    if (source.startsWith('pocket-')) {
                        const pocketId = source.replace('pocket-', '');
                        const pocket = pockets.find(p => p.id === pocketId);
                        if (!pocket || pocket.amount < newTx.amount) { alert(`Saldo di kantong ${pocket?.name} tidak mencukupi.`); return; }

                        // Deduct from source card if linked
                        if (pocket.sourceCardId) {
                            const sourceCard = cards.find(c => c.id === pocket.sourceCardId);
                            if (!sourceCard || sourceCard.balance < newTx.amount) { alert(`Saldo di kartu sumber (${sourceCard?.bankName}) tidak mencukupi.`); return; }
                            setCards(prev => prev.map(c => c.id === pocket.sourceCardId ? { ...c, balance: c.balance - newTx.amount } : c));
                        }

                        setPockets(prev => prev.map(p => p.id === pocketId ? { ...p, amount: p.amount - newTx.amount } : p));
                        newTx.pocketId = pocketId;
                        newTx.cardId = pocket.sourceCardId; // Log the card ID for tracking
                        newTx.method = 'Sistem';
                    } else if (source.startsWith('card-')) {
                        const cardId = source.replace('card-', '');
                        const card = cards.find(c => c.id === cardId);
                        if (!card || card.balance < newTx.amount) { alert(`Saldo di ${card?.bankName || 'sumber'} tidak mencukupi.`); return; }
                        setCards(prev => prev.map(c => c.id === cardId ? { ...c, balance: c.balance - newTx.amount } : c));
                        newTx.cardId = cardId;
                        newTx.method = card.id === 'CARD_CASH' ? 'Tunai' : 'Kartu';
                    }
                } else { // Income
                    const cardId = newTx.cardId;
                    const card = cards.find(c => c.id === cardId);
                    if (!card) { alert("Kartu tujuan tidak valid."); return; }
                    setCards(prev => prev.map(c => c.id === cardId ? { ...c, balance: c.balance + newTx.amount } : c));
                    newTx.method = card.id === 'CARD_CASH' ? 'Tunai' : 'Kartu';
                }
                setTransactions(prev => [...prev, { ...newTx, id: `TRN${Date.now()}` }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } else { // Edit mode
                 setTransactions(prev => prev.map(t => t.id === data.id ? { ...t, ...newTx } : t));
                 // Note: Balance recalculation for edit is complex and omitted for this scope.
            }
        }
        if (type === 'card') {
            if (mode === 'add') {
                const initialBalance = Number(form.initialBalance) || 0;
                const newCard: Card = {
                    id: `CARD${Date.now()}`,
                    cardHolderName: form.cardHolderName,
                    bankName: form.bankName,
                    cardType: form.cardType,
                    lastFourDigits: form.lastFourDigits,
                    expiryDate: form.expiryDate,
                    colorGradient: form.colorGradient,
                    balance: initialBalance,
                };

                let newTransactions = [...transactions];
                if (initialBalance > 0) {
                    const initialTx: Transaction = {
                        id: `TRN-INIT-${newCard.id}`,
                        date: new Date().toISOString().split('T')[0],
                        description: `Saldo Awal - ${newCard.bankName} ${newCard.lastFourDigits}`,
                        amount: initialBalance,
                        type: TransactionType.INCOME,
                        category: 'Modal',
                        method: 'Sistem',
                        cardId: newCard.id,
                    };
                    newTransactions.push(initialTx);
                }
                setCards(prev => [...prev, newCard]);
                setTransactions(newTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                showNotification(`Kartu baru "${newCard.bankName}" ditambahkan.`);
            } else { // Edit mode
                const adjustmentAmount = Number(form.adjustmentAmount) || 0;
                let updatedCards = [...cards];
                let newTransactions = [...transactions];

                // 1. Update card details (excluding balance)
                const { balance, ...cardDetails } = form;
                updatedCards = updatedCards.map(c => c.id === data.id ? { ...c, ...cardDetails } : c);

                // 2. Handle balance adjustment if any
                if (adjustmentAmount !== 0) {
                    const adjTx: Transaction = {
                        id: `TRN-ADJ-${data.id}-${Date.now()}`,
                        date: new Date().toISOString().split('T')[0],
                        description: `Penyesuaian Saldo: ${form.adjustmentReason || (adjustmentAmount > 0 ? 'Penambahan' : 'Pengurangan')}`,
                        amount: Math.abs(adjustmentAmount),
                        type: adjustmentAmount > 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
                        category: adjustmentAmount > 0 ? 'Modal' : 'Operasional Kantor',
                        method: 'Sistem',
                        cardId: data.id,
                    };
                    newTransactions.push(adjTx);

                    updatedCards = updatedCards.map(c => c.id === data.id ? { ...c, balance: c.balance + adjustmentAmount } : c);

                    showNotification(`Saldo kartu "${data.bankName}" disesuaikan.`);
                } else {
                     showNotification(`Detail kartu "${data.bankName}" diperbarui.`);
                }

                setCards(updatedCards);
                setTransactions(newTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
        }
        if (type === 'pocket') {
            if (mode === 'add') setPockets(prev => [...prev, { ...form, id: `POC${Date.now()}`, amount: 0 }]);
            else setPockets(prev => prev.map(p => p.id === data.id ? { ...p, ...form } : p));
        }
        if (type === 'transfer') {
            const amount = Number(form.amount);
            if (!amount || amount <= 0) {
                alert("Jumlah tidak valid.");
                return;
            }

            const isDeposit = form.type === 'deposit';
            const pocket = pockets.find(p => p.id === form.toPocketId);
            // For withdrawal, form.fromCardId is the destination card.
            const card = cards.find(c => c.id === form.fromCardId);

            if (!pocket || !card) {
                alert("Kantong atau kartu tidak valid.");
                return;
            }

            // This logic ensures a true transfer of funds: one account is debited, the other is credited.
            if (isDeposit) {
                // Moving from Card to Pocket
                if (card.balance < amount) {
                    alert(`Saldo kartu ${card.bankName} tidak mencukupi.`);
                    return;
                }
                setCards(prevCards => prevCards.map(c => 
                    c.id === card.id ? { ...c, balance: c.balance - amount } : c
                ));
                setPockets(prevPockets => prevPockets.map(p => 
                    p.id === pocket.id ? { ...p, amount: p.amount + amount, sourceCardId: card.id } : p
                ));
            } else { // Withdraw
                // Moving from Pocket to Card
                if (pocket.amount < amount) {
                    alert(`Saldo kantong ${pocket.name} tidak mencukupi.`);
                    return;
                }
                setPockets(prevPockets => prevPockets.map(p => 
                    p.id === pocket.id ? { ...p, amount: p.amount - amount } : p
                ));
                setCards(prevCards => prevCards.map(c => 
                    c.id === card.id ? { ...c, balance: c.balance + amount } : c
                ));
            }

            // Record the internal transfer transaction
            const transferTx: Transaction = {
                id: `TRN-TFR-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                amount,
                description: `${isDeposit ? 'Setor ke' : 'Tarik dari'} ${pocket.name} dari/ke ${card.bankName}`,
                type: TransactionType.EXPENSE, // Treat as expense for cash flow purposes, but it's a balanced internal move.
                category: 'Transfer Internal',
                method: 'Sistem',
                cardId: card.id,
                pocketId: pocket.id,
            };
            setTransactions(prev => [transferTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
         if (type === 'topup-cash') {
            const amount = Number(form.amount);
            if (!amount || amount <= 0) { alert("Jumlah tidak valid."); return; }
            const sourceCard = cards.find(c => c.id === form.fromCardId);
            if (!sourceCard) { alert("Kartu sumber tidak valid."); return; }
            if (sourceCard.balance < amount) { alert(`Saldo kartu ${sourceCard.bankName} tidak mencukupi.`); return; }

            setCards(prev => prev.map(c => {
                if (c.id === form.fromCardId) return {...c, balance: c.balance - amount };
                if (c.id === 'CARD_CASH') return {...c, balance: c.balance + amount };
                return c;
            }));

            const topupTx: Transaction = {
                id: `TRN-TUC-${Date.now()}`, date: new Date().toISOString().split('T')[0],
                description: `Top-up saldo tunai dari ${sourceCard.bankName}`, amount,
                type: TransactionType.EXPENSE, category: 'Transfer Internal', method: 'Sistem', cardId: sourceCard.id
            };
            setTransactions(prev => [topupTx, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
        handleCloseModal();
    };

    const handleDelete = (type: 'transaction' | 'pocket' | 'card', id: string) => {
        if (type === 'card' && id === 'CARD_CASH') {
            alert("Akun tunai tidak dapat dihapus."); return;
        }
        if (!window.confirm("Yakin ingin menghapus item ini? Transaksi terkait tidak akan dihapus.")) return;
        if (type === 'transaction') setTransactions(p => p.filter(i => i.id !== id));
        if (type === 'pocket') setPockets(p => p.filter(i => i.id !== id));
        if (type === 'card') setCards(p => p.filter(i => i.id !== id));
    };

    const handleTutupAnggaran = () => {
        if (!monthlyBudgetPocket) { return; }
        if (monthlyBudgetPocket.amount <= 0) {
            alert("Tidak ada sisa anggaran untuk disimpan.");
            return;
        }
        if (window.confirm(`Anda akan menyimpan sisa anggaran sebesar ${formatCurrency(monthlyBudgetPocket.amount)} ke kantong baru. Lanjutkan?`)) {
            handleCloseBudget(monthlyBudgetPocket, false);
        }
    };

    const expenseDonutData = useMemo(() => {
        const expenseByCategory = transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const colors = ['#f87171', '#fb923c', '#facc15', '#a3e635', '#34d399', '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6'];
        return Object.entries(expenseByCategory)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }));
    }, [transactions]);

    const getTransactionSubDescription = (transaction: Transaction): string => {
        const isInternal = transaction.category === 'Transfer Internal' || transaction.category === 'Penutupan Anggaran' || transaction.method === 'Sistem';

        const project = transaction.projectId ? projects.find(p => p.id === transaction.projectId) : null;
        const projectText = project ? project.projectName : null;

        if (isInternal) {
            return projectText ? `Proyek: ${projectText}` : '';
        }

        let sourceDestText = '';
        if (transaction.type === TransactionType.INCOME) {
            const card = cards.find(c => c.id === transaction.cardId);
            if (card) {
                sourceDestText = card.id === 'CARD_CASH' 
                    ? 'Masuk ke Tunai' 
                    : `Masuk ke ${card.bankName} ${card.lastFourDigits !== 'CASH' ? `**** ${card.lastFourDigits}` : ''}`;
            }
        } else { // EXPENSE
            if (transaction.pocketId) {
                const pocket = pockets.find(p => p.id === transaction.pocketId);
                if (pocket) {
                    sourceDestText = `Dibayar dari kantong "${pocket.name}"`;
                }
            } else if (transaction.cardId) {
                const card = cards.find(c => c.id === transaction.cardId);
                if (card) {
                     sourceDestText = card.id === 'CARD_CASH' 
                        ? 'Dibayar dari Tunai' 
                        : `Dibayar dari ${card.bankName} ${card.lastFourDigits !== 'CASH' ? `**** ${card.lastFourDigits}` : ''}`;
                }
            } else {
                sourceDestText = `Metode: ${transaction.method}`;
            }
        }

        if (sourceDestText && projectText) {
            return `${sourceDestText} • ${projectText}`;
        }

        return sourceDestText || projectText || '';
    };

    const handleDownloadReportCSV = () => {
        const headers = ['ID Transaksi', 'Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah'];
        const data = reportTransactions.map(t => [
            t.id,
            new Date(t.date).toLocaleDateString('id-ID'),
            t.description,
            t.category,
            t.type,
            t.amount
        ]);
        const clientName = reportFilters.client === 'all' ? 'Semua-Klien' : (reportClientOptions.find(c => c.id === reportFilters.client)?.name || 'Klien').replace(/\s+/g, '-');
        downloadCSV(headers, data, `Laporan-Keuangan-${clientName}-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleDownloadProfitReportCSV = () => {
        const headers = ['ID Klien', 'Nama Klien', 'Total Pemasukan', 'Total Biaya Produksi', 'Laba Kotor'];
        const data = projectProfitabilityData.map(d => [
            d!.clientId,
            d!.clientName,
            d!.totalIncome,
            d!.totalCost,
            d!.profit
        ]);
        const period = `${profitReportFilters.month + 1}-${profitReportFilters.year}`;
        downloadCSV(headers, data, `Laporan-Laba-Proyek-${period}-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'transactions':
                const CategoryButton = ({ type, categoryName, amount, isActive, onClick }: {type: TransactionType, categoryName: string, amount: number, isActive: boolean, onClick: ()=>void}) => (
                    <button
                        onClick={onClick}
                        className={`w-full flex justify-between items-center text-left p-3 rounded-lg text-sm transition-colors ${
                            isActive
                                ? 'bg-blue-500/10 text-brand-accent font-semibold'
                                : 'text-brand-text-primary hover:bg-brand-input'
                        }`}
                    >
                        <span className="truncate">{categoryName}</span>
                        <span className={`font-medium ${amount > 0 ? (type === TransactionType.INCOME ? 'text-brand-success/80' : 'text-brand-danger/80') : 'text-brand-text-secondary'}`}>
                            {new Intl.NumberFormat('id-ID', {notation: 'compact'}).format(amount)}
                        </span>
                    </button>
                );

                const allIncomeTotal = (Object.values(categoryTotals.income) as number[]).reduce((sum, amount) => sum + amount, 0);
                const allExpenseTotal = (Object.values(categoryTotals.expense) as number[]).reduce((sum, amount) => sum + amount, 0);

                return (
                     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        {/* Left Column: Category Filters & Budget */}
                        <div className="lg:col-span-1 space-y-6">
                            {monthlyBudgetPocket && (
                                <div className="bg-brand-surface p-4 rounded-2xl shadow-lg border border-brand-border">
                                    <h4 className="font-semibold text-gradient mb-2">{monthlyBudgetPocket.name}</h4>
                                    <p className="text-2xl font-bold text-blue-400">{formatCurrency(monthlyBudgetPocket.amount)}</p>
                                    <p className="text-xs text-brand-text-secondary mt-1">dari {formatCurrency(monthlyBudgetPocket.goalAmount || 0)}</p>
                                    <button onClick={handleTutupAnggaran} className="w-full mt-3 button-secondary text-sm">Tutup & Simpan Sisa</button>
                                </div>
                            )}
                             <div className="bg-brand-surface p-4 rounded-2xl shadow-lg border border-brand-border">
                                 <h4 className="font-semibold text-gradient mb-3 px-2">Pemasukan</h4>
                                 <div className="space-y-1">
                                     <CategoryButton type={TransactionType.INCOME} categoryName="Semua" amount={allIncomeTotal} isActive={categoryFilter.type === TransactionType.INCOME && categoryFilter.category === 'Semua'} onClick={() => setCategoryFilter({ type: TransactionType.INCOME, category: 'Semua' })} />
                                     {Object.entries(categoryTotals.income as Record<string, number>).map(([name, amount]) => (<CategoryButton key={name} type={TransactionType.INCOME} categoryName={name} amount={amount as number} isActive={categoryFilter.type === TransactionType.INCOME && categoryFilter.category === name} onClick={() => setCategoryFilter({ type: TransactionType.INCOME, category: name })} /> ))}
                                 </div>
                            </div>
                            <div className="bg-brand-surface p-4 rounded-2xl shadow-lg border border-brand-border">
                                <h4 className="font-semibold text-gradient mb-3 px-2">Pengeluaran</h4>
                                <div className="space-y-1">
                                    <CategoryButton type={TransactionType.EXPENSE} categoryName="Semua" amount={allExpenseTotal} isActive={categoryFilter.type === TransactionType.EXPENSE && categoryFilter.category === 'Semua'} onClick={() => setCategoryFilter({ type: TransactionType.EXPENSE, category: 'Semua' })} />
                                    {Object.entries(categoryTotals.expense as Record<string, number>).map(([name, amount]) => (<CategoryButton key={name} type={TransactionType.EXPENSE} categoryName={name} amount={amount as number} isActive={categoryFilter.type === TransactionType.EXPENSE && categoryFilter.category === name} onClick={() => setCategoryFilter({ type: TransactionType.EXPENSE, category: name })} />))}
                                </div>
                            </div>
                        </div>
                        {/* Right Column: Main Content */}
                        <div className="lg:col-span-3 bg-brand-surface p-4 sm:p-6 rounded-2xl shadow-lg border border-brand-border">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                 <input name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange} placeholder="Cari deskripsi, kategori..." className="input-field !rounded-lg !border p-2.5 md:col-span-1"/>
                                 <input name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} type="date" className="input-field !rounded-lg !border p-2.5"/>
                                 <input name="dateTo" value={filters.dateTo} onChange={handleFilterChange} type="date" className="input-field !rounded-lg !border p-2.5"/>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-brand-bg rounded-xl">
                                 <div><p className="text-sm text-brand-text-secondary">Total Pemasukan (Filter)</p><p className="text-lg font-bold text-brand-success">{formatCurrency(filteredSummary.income)}</p></div>
                                 <div><p className="text-sm text-brand-text-secondary">Total Pengeluaran (Filter)</p><p className="text-lg font-bold text-brand-danger">{formatCurrency(filteredSummary.expense)}</p></div>
                                 <div><p className="text-sm text-brand-text-secondary">Laba/Rugi Bersih (Filter)</p><p className="text-lg font-bold text-brand-text-light">{formatCurrency(filteredSummary.net)}</p></div>
                             </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-brand-text-secondary uppercase"><tr><th className="p-3 text-left">Tanggal</th><th className="p-3 text-left">Deskripsi</th><th className="p-3 text-left">Kategori</th><th className="p-3 text-right">Jumlah</th><th className="p-3 text-center">Aksi</th></tr></thead>
                                    <tbody className="divide-y divide-brand-border">
                                        {filteredTransactions.map(t => {
                                          const subDescription = getTransactionSubDescription(t);
                                          return (
                                            <tr key={t.id} className="hover:bg-brand-bg">
                                                <td className="p-3">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                                <td className="p-3">
                                                    <p className="font-semibold text-brand-text-light">{t.description}</p>
                                                    {subDescription && <p className="text-xs text-brand-text-secondary">{subDescription}</p>}
                                                </td>
                                                <td className="p-3"><span className="px-2 py-1 text-xs bg-brand-bg text-brand-text-primary rounded-full">{t.category}</span></td>
                                                <td className={`p-3 text-right font-semibold ${t.type === TransactionType.INCOME ? 'text-brand-success' : 'text-brand-danger'}`}>{formatCurrency(t.amount)}</td>
                                                <td className="p-3 text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <button onClick={() => handleOpenModal('transaction', 'edit', t)} className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                                        <button onClick={() => handleDelete('transaction', t.id)} className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full"><Trash2Icon className="w-4 h-4"/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                          );
                                        })}
                                    </tbody>
                                </table>
                                {filteredTransactions.length === 0 && <p className="text-center py-10 text-brand-text-secondary">Tidak ada transaksi yang cocok.</p>}
                            </div>
                        </div>
                    </div>
                );
            case 'pockets': 
                return (
                <div className="widget-animate">
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                       <StatCard icon={<ClipboardListIcon className="w-6 h-6"/>} title="Total Dana di Kantong" value={formatCurrency(summary.pocketsTotal)} subtitle="Total dana yang dialokasikan (non-hadiah)." />
                       <StatCard icon={<StarIcon className="w-6 h-6"/>} title="Total Hadiah Freelancer" value={formatCurrency(summary.totalRewards)} subtitle="Total saldo hadiah yang belum ditarik." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pockets.map(p => {
                            const sourceCard = p.sourceCardId ? cards.find(c => c.id === p.sourceCardId) : null;
                            const isRewardPool = p.type === PocketType.REWARD_POOL;
                            const amount = isRewardPool ? summary.totalRewards : p.amount;
                            return (
                                <div key={p.id} className="bg-brand-surface p-6 rounded-2xl shadow-lg flex flex-col cursor-pointer border border-brand-border" onClick={() => setHistoryModalState({type: isRewardPool ? 'reward_pool' : 'pocket', item: p})}>
                                    <div className="flex justify-between items-start">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-brand-bg text-brand-accent`}>{pocketIcons[p.icon]}</div>
                                        <div className="flex gap-1 non-printable"><button onClick={(e) => { e.stopPropagation(); handleOpenPocketModal('edit', p);}} className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full"><PencilIcon className="w-4 h-4"/></button><button onClick={(e) => { e.stopPropagation(); handlePocketDelete(p.id);}} className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full"><Trash2Icon className="w-4 h-4"/></button></div>
                                    </div>
                                    <div className="flex-grow mt-4"><h4 className="font-bold text-lg text-gradient">{p.name}</h4><p className="text-sm text-brand-text-secondary">{p.description}</p></div>
                                    <div className="mt-4">
                                        <p className="text-2xl font-bold text-brand-text-light">{formatCurrency(amount)}</p>
                                        {p.goalAmount && !isRewardPool ? (<div className="mt-2"><div className="w-full bg-brand-bg rounded-full h-2"><div className="bg-brand-accent h-2 rounded-full" style={{width: `${Math.min((amount/p.goalAmount)*100, 100)}%`}}></div></div><p className="text-xs text-brand-text-secondary mt-1 text-right">Target: {formatCurrency(p.goalAmount)}</p></div>) : null}
                                        {sourceCard && <p className="text-xs text-brand-text-secondary mt-1">Disimpan di: {sourceCard.bankName}</p>}
                                    </div>
                                    {!isRewardPool && (<div className="flex gap-2 mt-4 pt-4 border-t border-brand-border non-printable">
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenModal('transfer', 'add', { ...p, transferType: 'withdraw' }); }} className="button-secondary text-sm flex-1">Tarik Dana</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenModal('transfer', 'add', { ...p, transferType: 'deposit' }); }} className="button-primary text-sm flex-1">Setor Dana</button>
                                    </div>)}
                                </div>
                            );
                        })}
                        <button onClick={() => handleOpenPocketModal('add')} className="border-2 border-dashed border-brand-border rounded-2xl flex flex-col items-center justify-center text-brand-text-secondary hover:bg-brand-input hover:border-brand-accent hover:text-brand-accent transition-colors min-h-[250px]"><PlusIcon className="w-8 h-8"/><span className="mt-2 font-semibold">Buat Kantong Baru</span></button>
                    </div>
                </div>
            );
            case 'cards': return (
                 <div className="widget-animate">
                    <div className="mb-6 bg-brand-surface p-4 rounded-xl border border-brand-border">
                         <StatCard icon={<CreditCardIcon className="w-6 h-6"/>} title="Total Aset (Kartu & Tunai)" value={formatCurrency(summary.totalAssets)} subtitle="Total gabungan saldo di semua kartu & tunai Anda." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {cards.map(card => {
                            const connectedPockets = pockets.filter(p => p.sourceCardId === card.id);
                            return (
                                <div key={card.id}>
                                    {card.id === 'CARD_CASH' 
                                        ? <CashWidget card={card} onClick={() => setHistoryModalState({type: 'card', item: card})} onTopUp={() => handleOpenModal('topup-cash', 'add')} onEdit={() => handleOpenModal('card', 'edit', card)} /> 
                                        : <CardWidget card={card} onEdit={() => handleOpenModal('card', 'edit', card)} onDelete={() => handleCardDelete(card.id)} onClick={() => setHistoryModalState({type: 'card', item: card})} />
                                    }
                                    {connectedPockets.length > 0 && (
                                        <div className="mt-3 p-3 bg-brand-input rounded-lg text-xs">
                                            <p className="font-semibold text-brand-text-secondary mb-1">Terhubung ke kantong:</p>
                                            <ul className="space-y-1 list-disc list-inside">
                                                {connectedPockets.map(p => <li key={p.id} className="text-brand-text-primary">{p.name}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <button onClick={() => handleOpenModal('card', 'add')} className="aspect-[1.586] border-2 border-dashed border-brand-border rounded-2xl flex flex-col items-center justify-center text-brand-text-secondary hover:bg-brand-input hover:border-brand-accent hover:text-brand-accent transition-colors"><PlusIcon className="w-8 h-8"/><span className="mt-2 font-semibold">Tambah Kartu Baru</span></button>
                    </div>
                </div>
            );
            case 'cashflow': return (
                 <div className="space-y-6 widget-animate">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<ShieldIcon className="w-6 h-6"/>} title="Ketahanan Keuangan (Runway)" value={cashflowMetrics.runway} subtitle={`Estimasi operasional berdasarkan burn rate. Burn Rate: ${formatCurrency(cashflowMetrics.burnRate)}/bln`} iconBgColor="bg-yellow-500/20" iconColor="text-yellow-400" />
                        <StatCard icon={<DollarSignIcon className="w-6 h-6"/>} title="Total Laba/Rugi" value={formatCurrency(filteredSummary.net)} subtitle="Berdasarkan filter transaksi saat ini" iconBgColor="bg-indigo-500/20" iconColor="text-indigo-400" />
                        <StatCard icon={<TrendingUpIcon className="w-6 h-6"/>} title="Rata-rata Pemasukan/bln" value={formatCurrency(cashflowMetrics.avgIncome)} subtitle="Selama periode data tersedia" iconBgColor="bg-green-500/20" iconColor="text-green-400" />
                        <StatCard icon={<TrendingDownIcon className="w-6 h-6"/>} title="Rata-rata Pengeluaran/bln" value={formatCurrency(cashflowMetrics.avgExpense)} subtitle="Selama periode data tersedia" iconBgColor="bg-red-500/20" iconColor="text-red-400" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border"><h4 className="text-lg font-bold text-gradient mb-4">Grafik Arus Kas</h4><InteractiveCashflowChart data={cashflowChartData} /></div>
                        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border"><h4 className="text-lg font-bold text-gradient mb-4">Pengeluaran per Kategori</h4><DonutChart data={expenseDonutData} /></div>
                    </div>
                     <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border">
                        <h4 className="text-lg font-bold text-gradient mb-4">Data Arus Kas Bulanan</h4>
                        <div className="overflow-x-auto max-h-96">
                             <table className="w-full text-sm">
                                <thead className="text-xs uppercase print-bg-slate bg-brand-input">
                                    <tr className="print-text-black">
                                        <th className="p-3 text-left">Periode</th>
                                        <th className="p-3 text-right">Pemasukan</th>
                                        <th className="p-3 text-right">Pengeluaran</th>
                                        <th className="p-3 text-right">Laba/Rugi</th>
                                        <th className="p-3 text-right">Saldo Akhir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border">
                                    {cashflowChartData.map(d => (
                                    <tr key={d.label}>
                                        <td className="p-3 font-semibold">{d.label}</td>
                                        <td className="p-3 text-right text-brand-success">{formatCurrency(d.income)}</td>
                                        <td className="p-3 text-right text-brand-danger">{formatCurrency(d.expense)}</td>
                                        <td className={`p-3 text-right font-semibold ${d.income - d.expense >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>{formatCurrency(d.income - d.expense)}</td>
                                        <td className="p-3 text-right font-bold text-brand-text-light">{formatCurrency(d.balance)}</td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
            case 'laporan':
                return (
                    <div className="space-y-6 printable-area widget-animate">
                        <div className="bg-brand-surface p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center non-printable border border-brand-border">
                            <h4 className="text-md font-semibold text-gradient whitespace-nowrap">Filter Laporan:</h4>
                             <select name="client" value={reportFilters.client} onChange={e => setReportFilters(p => ({...p, client: e.target.value}))} className="input-field !rounded-lg !border p-2.5 w-full md:w-auto"><option value="all">Semua Klien</option>{reportClientOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                            <input type="date" name="dateFrom" value={reportFilters.dateFrom} onChange={e => setReportFilters(p => ({...p, dateFrom: e.target.value}))} className="input-field !rounded-lg !border p-2.5 w-full md:w-auto"/>
                            <input type="date" name="dateTo" value={reportFilters.dateTo} onChange={e => setReportFilters(p => ({...p, dateTo: e.target.value}))} className="input-field !rounded-lg !border p-2.5 w-full md:w-auto"/>
                            <div className="flex items-center gap-2 ml-auto">
                                <button onClick={handleDownloadReportCSV} className="button-secondary inline-flex items-center gap-2"><DownloadIcon className="w-5 h-5"/>Unduh CSV</button>
                                <button onClick={() => window.print()} className="button-primary inline-flex items-center gap-2"><PrinterIcon className="w-5 h-5"/>Cetak PDF</button>
                            </div>
                        </div>
                        {reportFilters.client !== 'all' ? (
                           <ClientProfitabilityReport
                                transactions={reportTransactions}
                                clientName={reportClientOptions.find(c=>c.id === reportFilters.client)?.name || ''}
                                periodText={`${reportFilters.dateFrom || ''} - ${reportFilters.dateTo || ''}`}
                                profile={profile}
                             />
                        ) : (
                            generalReportMetrics && <GeneralFinancialReport 
                                metrics={generalReportMetrics} 
                                transactions={reportTransactions}
                                periodText={`${reportFilters.dateFrom || ''} - ${reportFilters.dateTo || ''}`}
                                profile={profile}
                            />
                        )}
                    </div>
                );
            case 'labaProyek':
                const monthOptions = Array.from({length: 12}, (_, i) => ({ value: i, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
                const yearOptions = Array.from(new Set<number>(projects.map(p => new Date(p.date).getFullYear()))).sort((a: number, b: number) => b - a);

                return (
                    <div className="space-y-6 printable-area widget-animate">
                        <div className="bg-brand-surface p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center non-printable border border-brand-border">
                            <h4 className="text-md font-semibold text-gradient whitespace-nowrap">Filter Laporan Laba:</h4>
                            <select name="year" value={profitReportFilters.year} onChange={e => setProfitReportFilters(p => ({...p, year: Number(e.target.value)}))} className="input-field !rounded-lg !border p-2.5 w-full md:w-auto">
                                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <select name="month" value={profitReportFilters.month} onChange={e => setProfitReportFilters(p => ({...p, month: Number(e.target.value)}))} className="input-field !rounded-lg !border p-2.5 w-full md:w-auto">
                                {monthOptions.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                            </select>
                             <div className="flex items-center gap-2 ml-auto">
                                <button onClick={handleDownloadProfitReportCSV} className="button-secondary inline-flex items-center gap-2"><DownloadIcon className="w-5 h-5"/>Unduh CSV</button>
                                <button onClick={() => window.print()} className="button-primary inline-flex items-center gap-2"><PrinterIcon className="w-5 h-5"/>Cetak PDF</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 non-printable">
                            <StatCard icon={<DollarSignIcon className="w-6 h-6"/>} title="Total Laba Periode Ini" value={formatCurrency(profitReportMetrics.totalProfit)} iconBgColor="bg-blue-500/20" iconColor="text-blue-400" />
                            <StatCard icon={<Users2Icon className="w-6 h-6"/>} title="Klien Paling Profit" value={profitReportMetrics.mostProfitableClient} iconBgColor="bg-green-500/20" iconColor="text-green-400" />
                            <StatCard icon={<TrendingUpIcon className="w-6 h-6"/>} title="Jumlah Proyek Profit" value={`${profitReportMetrics.profitableProjectsCount} dari ${projectProfitabilityData.length}`} iconBgColor="bg-yellow-500/20" iconColor="text-yellow-400" />
                            <StatCard icon={<TargetIcon className="w-6 h-6"/>} title="Rata-rata Laba/Proyek" value={formatCurrency(profitReportMetrics.avgProfit)} iconBgColor="bg-indigo-500/20" iconColor="text-indigo-400" />
                        </div>
                        <div className="printable-report">
                            <div className="hidden print:block text-black mb-6">
                                <h1 className="text-xl font-bold">{profile.companyName}</h1>
                                <p className="text-sm">{profile.address}</p>
                                <div className="mt-4 pt-4 border-t-2 border-black">
                                    <h2>Laporan Laba per Klien</h2>
                                    <p>Periode: {monthOptions.find(m => m.value === profitReportFilters.month)?.name} {profitReportFilters.year}</p>
                                </div>
                            </div>
                            <div className="bg-brand-surface p-6 rounded-2xl shadow-lg mt-6 border border-brand-border print:shadow-none print:border-none print:p-0 print:mt-0">
                                <div className="print:hidden">
                                    <h3 className="text-lg font-bold text-gradient mb-4">Laporan Laba per Klien</h3>
                                    <p className="text-sm text-brand-text-secondary mb-4">Menampilkan profitabilitas untuk proyek yang dieksekusi pada <strong>{monthOptions.find(m => m.value === profitReportFilters.month)?.name} {profitReportFilters.year}</strong>.</p>
                                </div>
                                <div className="overflow-x-auto max-h-[500px] print:max-h-none print:overflow-visible">
                                    <table className="w-full text-sm">
                                        <thead className="text-xs uppercase print-bg-slate bg-brand-input"><tr className="print-text-black"><th className="p-3 text-left">ID Klien</th><th className="p-3 text-left">Nama Klien</th><th className="p-3 text-right">Total Pemasukan</th><th className="p-3 text-right">Total Biaya Produksi</th><th className="p-3 text-right">Laba Kotor</th></tr></thead>
                                        <tbody className="divide-y divide-brand-border">
                                            {projectProfitabilityData.map(data => (
                                                <tr key={data!.clientId}>
                                                    <td className="p-3 font-mono text-xs">{data!.clientId}</td>
                                                    <td className="p-3 font-semibold">{data!.clientName}</td>
                                                    <td className="p-3 text-right text-brand-success">{formatCurrency(data!.totalIncome)}</td>
                                                    <td className="p-3 text-right text-brand-danger">{formatCurrency(data!.totalCost)}</td>
                                                    <td className={`p-3 text-right font-bold ${data!.profit >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>{formatCurrency(data!.profit)}</td>
                                                </tr>
                                            ))}
                                            {projectProfitabilityData.length === 0 && (
                                                <tr><td colSpan={5} className="text-center p-8 text-brand-text-secondary">Tidak ada data proyek untuk periode ini.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );

        }
    };

    // --- REPORT SUB-COMPONENTS ---
    const GeneralFinancialReport: React.FC<{metrics: any, transactions: Transaction[], periodText: string, profile: Profile}> = ({metrics, transactions, periodText, profile}) => (
        <div className="printable-report space-y-6">
            {/* Print Header */}
            <div className="hidden print:block text-black mb-6">
                <h1 className="text-xl font-bold">{profile.companyName}</h1>
                <p className="text-sm">{profile.address}</p>
                <div className="mt-4 pt-4 border-t-2 border-black">
                    <h2>Laporan Keuangan Umum</h2>
                    <p>Periode: {periodText}</p>
                </div>
            </div>

            {/* Screen Header */}
            <div className="print:hidden">
                <h2 className="text-2xl font-bold mb-2 text-gradient">Laporan Keuangan Umum</h2>
                <p className="mb-6 text-brand-text-primary">Periode: {periodText}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 StatCard-container">
                <StatCard icon={<ArrowUpIcon className="w-6 h-6"/>} title="Total Pemasukan" value={formatCurrency(metrics.reportIncome)} iconBgColor="bg-brand-success/20" iconColor="text-brand-success" />
                <StatCard icon={<ArrowDownIcon className="w-6 h-6"/>} title="Total Pengeluaran" value={formatCurrency(metrics.reportExpense)} iconBgColor="bg-brand-danger/20" iconColor="text-brand-danger" />
                <StatCard icon={<DollarSignIcon className="w-6 h-6"/>} title="Laba / Rugi Bersih" value={formatCurrency(metrics.reportIncome - metrics.reportExpense)} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border chart-wrapper"><h3 className="text-lg font-bold text-gradient mb-4">Analisis Pemasukan</h3><DonutChart data={metrics.incomeDonut}/></div>
                <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border chart-wrapper"><h3 className="text-lg font-bold text-gradient mb-4">Analisis Pengeluaran</h3><DonutChart data={metrics.expenseDonut}/></div>
            </div>
            <div className="bg-brand-surface p-6 rounded-2xl shadow-lg mt-6 border border-brand-border">
                <h3 className="text-lg font-bold text-gradient mb-4">Rincian Semua Transaksi</h3>
                <div className="overflow-x-auto max-h-[500px] print:max-h-none print:overflow-visible"><TransactionTable transactions={transactions} /></div>
            </div>
        </div>
    );

    const ClientProfitabilityReport: React.FC<{transactions: Transaction[], clientName: string, periodText: string, profile: Profile}> = ({ transactions, clientName, periodText, profile }) => {
        const clientIncome = transactions.filter(t => t.type === TransactionType.INCOME);
        const clientCost = transactions.filter(t => t.type === TransactionType.EXPENSE && PRODUCTION_COST_CATEGORIES.includes(t.category));
        const totalIncome = clientIncome.reduce((sum, t) => sum + t.amount, 0);
        const totalCost = clientCost.reduce((sum, t) => sum + t.amount, 0);
        const profit = totalIncome - totalCost;

        return (
            <div className="printable-report space-y-6">
                {/* Print Header */}
                <div className="hidden print:block text-black mb-6">
                    <h1 className="text-xl font-bold">{profile.companyName}</h1>
                    <p className="text-sm">{profile.address}</p>
                    <div className="mt-4 pt-4 border-t-2 border-black">
                        <h2>Laporan Profitabilitas Klien</h2>
                        <p>Klien: {clientName} | Periode: {periodText}</p>
                    </div>
                </div>

                {/* Screen Header */}
                <div className="print:hidden">
                    <h2 className="text-2xl font-bold mb-2 text-gradient">Laporan Profitabilitas Klien</h2>
                    <p className="mb-6 text-brand-text-primary">Klien: <span className="font-semibold">{clientName}</span> | Periode: {periodText}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 StatCard-container">
                    <StatCard icon={<ArrowUpIcon className="w-6 h-6"/>} title="Total Pemasukan" value={formatCurrency(totalIncome)} iconBgColor="bg-brand-success/20" iconColor="text-brand-success" />
                    <StatCard icon={<ArrowDownIcon className="w-6 h-6"/>} title="Total Biaya Produksi" value={formatCurrency(totalCost)} iconBgColor="bg-brand-danger/20" iconColor="text-brand-danger" />
                    <StatCard icon={<DollarSignIcon className="w-6 h-6"/>} title="Laba Kotor" value={formatCurrency(profit)} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border chart-wrapper">
                        <h3 className="text-lg font-bold text-gradient mb-4">Rincian Pemasukan dari Klien</h3>
                        <div className="overflow-x-auto max-h-[400px] print:max-h-none print:overflow-visible"><TransactionTable transactions={clientIncome} /></div>
                    </div>
                    <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border chart-wrapper">
                        <h3 className="text-lg font-bold text-gradient mb-4">Rincian Biaya Produksi</h3>
                        <div className="overflow-x-auto max-h-[400px] print:max-h-none print:overflow-visible"><TransactionTable transactions={clientCost} /></div>
                    </div>
                </div>
            </div>
        );
    }

    const TransactionTable: React.FC<{transactions: Transaction[]}> = ({transactions}) => {
        if (transactions.length === 0) return <p className="text-center py-10 text-brand-text-secondary">Tidak ada transaksi pada periode ini.</p>;
        return (
            <table className="w-full text-sm">
                <thead className="text-xs uppercase print-bg-slate bg-brand-input"><tr className="print-text-black"><th className="p-3 text-left">ID Transaksi</th><th className="p-3 text-left">Tanggal</th><th className="p-3 text-left">Deskripsi</th><th className="p-3 text-left">Kategori</th><th className="p-3 text-right">Jumlah</th></tr></thead>
                <tbody className="divide-y divide-brand-border">
                    {transactions.map(t => (<tr key={t.id}><td className="p-3 font-mono text-xs">{t.id}</td><td className="p-3">{new Date(t.date).toLocaleDateString('id-ID')}</td><td className="p-3 font-semibold">{t.description}</td><td className="p-3">{t.category}</td><td className={`p-3 text-right font-semibold ${t.type === TransactionType.INCOME ? 'print-text-green text-brand-success' : 'print-text-red text-brand-danger'}`}>{formatCurrency(t.amount)}</td></tr>))}
                </tbody>
            </table>
        );
    }

    const statModalTitles: { [key: string]: string } = {
        assets: 'Rincian Total Aset',
        pockets: 'Rincian Dana di Kantong',
        income: `Pemasukan Bulan ${new Date().toLocaleString('id-ID', { month: 'long' })}`,
        expense: `Pengeluaran Bulan ${new Date().toLocaleString('id-ID', { month: 'long' })}`
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Manajemen Keuangan" subtitle="Pantau kesehatan finansial bisnis Anda dari transaksi hingga proyeksi masa depan.">
                <button onClick={() => handleOpenModal('transaction', 'add')} className="button-primary inline-flex items-center gap-2 non-printable"><PlusIcon className="w-5 h-5"/>Tambah Transaksi</button>
            </PageHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '100ms' }} onClick={() => setActiveStatModal('assets')}>
                    <StatCard icon={<CreditCardIcon className="w-6 h-6"/>} title="Total Aset" value={formatCurrency(summary.totalAssets)} subtitle="Total gabungan saldo di semua kartu & tunai Anda." />
                </div>
                <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '200ms' }} onClick={() => setActiveStatModal('pockets')}>
                    <StatCard icon={<ClipboardListIcon className="w-6 h-6"/>} title="Dana di Kantong" value={formatCurrency(summary.pocketsTotal)} subtitle="Total dana yang dialokasikan di semua kantong." />
                </div>
                <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '300ms' }} onClick={() => setActiveStatModal('income')}>
                    <StatCard icon={<ArrowUpIcon className="w-6 h-6"/>} title="Pemasukan Bulan Ini" value={formatCurrency(summary.totalIncomeThisMonth)} subtitle="Total pemasukan yang tercatat bulan ini." />
                </div>
                <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '400ms' }} onClick={() => setActiveStatModal('expense')}>
                    <StatCard icon={<ArrowDownIcon className="w-6 h-6"/>} title="Pengeluaran Bulan Ini" value={formatCurrency(summary.totalExpenseThisMonth)} subtitle="Total pengeluaran yang tercatat bulan ini." />
                </div>
            </div>
            <div className="border-b border-brand-border non-printable widget-animate" style={{ animationDelay: '500ms' }}><nav className="-mb-px flex space-x-6 overflow-x-auto"><button onClick={() => setActiveTab('transactions')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab==='transactions'?'border-brand-accent text-brand-accent':'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><FileTextIcon className="w-5 h-5"/>Transaksi</button><button onClick={() => setActiveTab('pockets')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab==='pockets'?'border-brand-accent text-brand-accent':'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><ClipboardListIcon className="w-5 h-5"/>Kantong</button><button onClick={() => setActiveTab('cards')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab==='cards'?'border-brand-accent text-brand-accent':'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><CreditCardIcon className="w-5 h-5"/>Kartu Saya</button><button onClick={() => setActiveTab('cashflow')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab==='cashflow'?'border-brand-accent text-brand-accent':'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><TrendingUpIcon className="w-5 h-5"/>Arus Kas</button><button onClick={() => setActiveTab('laporan')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab==='laporan'?'border-brand-accent text-brand-accent':'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><BarChart2Icon className="w-5 h-5"/>Laporan</button><button onClick={() => setActiveTab('labaProyek')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab==='labaProyek'?'border-brand-accent text-brand-accent':'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><TargetIcon className="w-5 h-5"/>Laba Proyek</button></nav></div>
            <div className="widget-animate" style={{ animationDelay: '600ms' }}>{renderTabContent()}</div>
            {modalState.type && <Modal
                isOpen={!!modalState.type}
                onClose={handleCloseModal}
                title={`${modalState.mode === 'add' ? 'Tambah' : 'Edit'} ${
                    modalState.type === 'transaction' ? 'Transaksi' :
                    modalState.type === 'pocket' ? 'Kantong' :
                    modalState.type === 'card' ? 'Kartu' :
                    modalState.type === 'topup-cash' ? 'Top-up Tunai' :
                    (modalState.type === 'transfer' && form.type === 'withdraw') ? `Tarik Dana dari "${modalState.data?.name}"` :
                    (modalState.type === 'transfer' && form.type === 'deposit') ? `Setor Dana ke "${modalState.data?.name}"` :
                    'Transfer'
                }`}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {modalState.type === 'transaction' && <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="input-group"><select id="type" name="type" value={form.type} onChange={handleFormChange} className="input-field"><option value={TransactionType.EXPENSE}>Pengeluaran</option><option value={TransactionType.INCOME}>Pemasukan</option></select><label htmlFor="type" className="input-label">Jenis</label></div>
                            <div className="input-group"><input type="date" id="date" name="date" value={form.date} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="date" className="input-label">Tanggal</label></div>
                        </div>
                        <div className="input-group"><input type="text" id="description" name="description" value={form.description} onChange={handleFormChange} className="input-field" placeholder=" " required/><label htmlFor="description" className="input-label">Deskripsi</label></div>
                        <div className="input-group"><input type="number" id="amount" name="amount" value={form.amount} onChange={handleFormChange} className="input-field" placeholder=" " required/><label htmlFor="amount" className="input-label">Jumlah (IDR)</label></div>
                        <div className="input-group"><select id="category" name="category" value={form.category} onChange={handleFormChange} className="input-field" required><option value="">Pilih Kategori...</option>{(form.type === TransactionType.INCOME ? profile.incomeCategories : profile.expenseCategories).map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select><label htmlFor="category" className="input-label">Kategori</label></div>
                        {form.type === TransactionType.INCOME ? (
                            <div className="input-group"><select id="cardId" name="cardId" value={form.cardId || ''} onChange={handleFormChange} className="input-field" required><option value="">Pilih Tujuan...</option>{cards.map(c => (<option key={c.id} value={c.id}>{c.bankName} {c.lastFourDigits !== 'CASH' ? `**** ${c.lastFourDigits}` : ''} (Saldo: {formatCurrency(c.balance)})</option>))}</select><label htmlFor="cardId" className="input-label">Setor Ke Kartu/Tunai</label></div>
                        ) : (
                             <div className="input-group"><select id="sourceId" name="sourceId" value={form.sourceId} onChange={handleFormChange} className="input-field" required><option value="">Pilih Sumber...</option>{cards.map(c => (<option key={c.id} value={`card-${c.id}`}>{c.bankName} {c.lastFourDigits !== 'CASH' ? `**** ${c.lastFourDigits}` : ''} (Saldo: {formatCurrency(c.balance)})</option>))}{(pockets.filter(p=>p.type === PocketType.EXPENSE).map(p => (<option key={p.id} value={`pocket-${p.id}`}>{p.name} (Sisa: {formatCurrency(p.amount)})</option>)))}</select><label htmlFor="sourceId" className="input-label">Sumber Dana</label></div>
                        )}
                    </>}
                    {modalState.type === 'card' && <>
                        <div className="input-group"><input type="text" id="bankName" name="bankName" value={form.bankName} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="bankName" className="input-label">Nama Bank</label></div>
                        <div className="input-group"><input type="text" id="cardHolderName" name="cardHolderName" value={form.cardHolderName} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="cardHolderName" className="input-label">Nama Pemegang Kartu</label></div>

                        {modalState.mode === 'add' && (
                             <div className="input-group"><input type="number" id="initialBalance" name="initialBalance" value={form.initialBalance} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="initialBalance" className="input-label">Saldo Awal (Opsional)</label></div>
                        )}

                        {form.id !== 'CARD_CASH' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="input-group"><input type="text" id="lastFourDigits" name="lastFourDigits" value={form.lastFourDigits} onChange={handleFormChange} className="input-field" placeholder=" " maxLength={4}/><label htmlFor="lastFourDigits" className="input-label">4 Digit Terakhir</label></div>
                                <div className="input-group"><input type="text" id="expiryDate" name="expiryDate" value={form.expiryDate} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="expiryDate" className="input-label">Kadaluwarsa (MM/YY)</label></div>
                            </div>
                        )}

                        {modalState.mode === 'edit' && (
                             <div className="p-4 bg-brand-bg rounded-lg mt-6">
                                <h4 className="font-semibold text-gradient mb-2">Penyesuaian Saldo (Opsional)</h4>
                                <p className="text-xs text-brand-text-secondary mb-3">Isi untuk menambah atau mengurangi saldo. Gunakan angka negatif untuk mengurangi (misal: -50000).</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="input-group !mt-0">
                                        <input type="number" id="adjustmentAmount" name="adjustmentAmount" value={form.adjustmentAmount} onChange={handleFormChange} className="input-field" placeholder=" " />
                                        <label htmlFor="adjustmentAmount" className="input-label">Jumlah Penyesuaian</label>
                                    </div>
                                    <div className="input-group !mt-0">
                                        <input type="text" id="adjustmentReason" name="adjustmentReason" value={form.adjustmentReason} onChange={handleFormChange} className="input-field" placeholder=" " />
                                        <label htmlFor="adjustmentReason" className="input-label">Alasan (e.g., Koreksi)</label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>}
                    {modalState.type === 'pocket' && <>
                        <div className="input-group"><input type="text" id="name" name="name" value={form.name} onChange={handleFormChange} className="input-field" placeholder=" " required /><label htmlFor="name" className="input-label">Nama Kantong</label></div>
                        <div className="input-group"><textarea id="description" name="description" value={form.description} onChange={handleFormChange} className="input-field" placeholder=" " rows={2}/><label htmlFor="description" className="input-label">Deskripsi</label></div>
                        <div className="input-group"><select id="sourceCardId" name="sourceCardId" value={form.sourceCardId} onChange={handleFormChange} className="input-field"><option value="">Pilih Kartu...</option>{cards.map(c => <option key={c.id} value={c.id}>{c.bankName} {c.id !== 'CARD_CASH' && `**** ${c.lastFourDigits}`}</option>)}</select><label htmlFor="sourceCardId" className="input-label">Sumber Dana (Kartu)</label></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="input-group"><select id="icon" name="icon" value={form.icon} onChange={handleFormChange} className="input-field">{Object.keys(pocketIcons).map(i => <option key={i} value={i}>{i}</option>)}</select><label htmlFor="icon" className="input-label">Ikon</label></div>
                            <div className="input-group">
                                <select name="type" id="type" value={form.type} onChange={handleFormChange} className="input-field">
                                    {Object.values(PocketType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                </select>
                                <label htmlFor="type" className="input-label">Tipe Kantong</label>
                            </div>
                        </div>
                        {(form.type === PocketType.SAVING || form.type === PocketType.EXPENSE) &&
                            <div className="input-group">
                                <input type="number" id="goalAmount" name="goalAmount" value={form.goalAmount || ''} onChange={handleFormChange} className="input-field" placeholder=" "/>
                                <label htmlFor="goalAmount" className="input-label">Target Jumlah (Opsional)</label>
                            </div>
                        }
                        {form.type === PocketType.LOCKED &&
                            <div className="input-group">
                                <input type="date" id="lockEndDate" name="lockEndDate" value={form.lockEndDate || ''} onChange={handleFormChange} className="input-field" placeholder=" "/>
                                <label htmlFor="lockEndDate" className="input-label">Tgl. Kunci Berakhir (Opsional)</label>
                            </div>
                        }
                    </>}
                    {modalState.type === 'transfer' && <>
                        <div className="input-group">
                            <select id="fromCardId" name="fromCardId" value={form.fromCardId} onChange={handleFormChange} className="input-field" required>
                                <option value="">Pilih Kartu Sumber...</option>
                                {cards.filter(c => c.id !== 'CARD_CASH').map(c => <option key={c.id} value={c.id}>{c.bankName} **** {c.lastFourDigits} (Saldo: {formatCurrency(c.balance)})</option>)}
                            </select>
                            <label htmlFor="fromCardId" className="input-label">Sumber Dana</label>
                        </div>
                        <div className="input-group">
                            <input type="number" id="amount" name="amount" value={form.amount} onChange={handleFormChange} className="input-field" placeholder=" " required />
                            <label htmlFor="amount" className="input-label">Jumlah (IDR)</label>
                        </div>
                    </>}
                    {modalState.type === 'topup-cash' && <>
                        <div className="input-group">
                            <select id="fromCardId" name="fromCardId" value={form.fromCardId} onChange={handleFormChange} className="input-field" required>
                                <option value="">Pilih Kartu Sumber...</option>
                                {cards.filter(c => c.id !== 'CARD_CASH').map(c => <option key={c.id} value={c.id}>{c.bankName} **** {c.lastFourDigits} (Saldo: {formatCurrency(c.balance)})</option>)}
                            </select>
                            <label htmlFor="fromCardId" className="input-label">Ambil dari Kartu</label>
                        </div>
                        <div className="input-group">
                            <input type="number" id="amount" name="amount" value={form.amount} onChange={handleFormChange} className="input-field" placeholder=" " required />
                            <label htmlFor="amount" className="input-label">Jumlah (IDR)</label>
                        </div>
                    </>}
                    <div className="flex justify-end gap-3 pt-6 border-t border-brand-border">
                        <button type="button" onClick={handleCloseModal} className="button-secondary">Batal</button>
                        <button type="submit" className="button-primary">{modalState.mode === 'add' ? 'Simpan' : 'Update'}</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} title={cardModalMode === 'add' ? 'Tambah Kartu Baru' : 'Edit Kartu'}>
                <form onSubmit={handleCardSubmit} className="space-y-4">
                    <div className="input-group">
                        <input type="text" id="cardHolderName" name="cardHolderName" value={cardFormData.cardHolderName} onChange={handleCardFormChange} className="input-field" placeholder=" " required />
                        <label htmlFor="cardHolderName" className="input-label">Nama Pemegang Kartu</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="input-group">
                            <input type="text" id="bankName" name="bankName" value={cardFormData.bankName} onChange={handleCardFormChange} className="input-field" placeholder=" " required />
                            <label htmlFor="bankName" className="input-label">Nama Bank</label>
                        </div>
                        <div className="input-group">
                            <select id="cardType" name="cardType" value={cardFormData.cardType} onChange={handleCardFormChange} className="input-field" required>
                                <option value={CardType.DEBIT}>Debit</option>
                                <option value={CardType.PRABAYAR}>Prabayar</option>
                                <option value={CardType.KREDIT}>Kredit</option>
                            </select>
                            <label htmlFor="cardType" className="input-label">Tipe Kartu</label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="input-group">
                            <input type="text" id="lastFourDigits" name="lastFourDigits" value={cardFormData.lastFourDigits} onChange={handleCardFormChange} className="input-field" placeholder=" " maxLength={4} required />
                            <label htmlFor="lastFourDigits" className="input-label">4 Digit Terakhir</label>
                        </div>
                        <div className="input-group">
                            <input type="text" id="expiryDate" name="expiryDate" value={cardFormData.expiryDate} onChange={handleCardFormChange} className="input-field" placeholder="MM/YY" />
                            <label htmlFor="expiryDate" className="input-label">Tanggal Kedaluwarsa</label>
                        </div>
                    </div>
                    <div className="input-group">
                        <input type="number" id="balance" name="balance" value={cardFormData.balance} onChange={handleCardFormChange} className="input-field" placeholder=" " required />
                        <label htmlFor="balance" className="input-label">Saldo (IDR)</label>
                    </div>
                    <div className="input-group">
                        <input type="color" id="colorGradient" name="colorGradient" value={cardFormData.colorGradient} onChange={handleCardFormChange} className="input-field h-12" />
                        <label htmlFor="colorGradient" className="input-label">Warna Kartu</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-brand-border">
                        <button type="button" onClick={() => setIsCardModalOpen(false)} className="button-secondary">Batal</button>
                        <button type="submit" className="button-primary">{cardModalMode === 'add' ? 'Simpan' : 'Update'}</button>
                    </div>
                </form>
            </Modal>

            {/* Pocket Modal */}
            <Modal isOpen={isPocketModalOpen} onClose={() => setIsPocketModalOpen(false)} title={pocketModalMode === 'add' ? 'Buat Pocket Baru' : 'Edit Pocket'}>
                <form onSubmit={handlePocketSubmit} className="space-y-4">
                    <div className="input-group">
                        <input type="text" id="pocketName" name="name" value={pocketFormData.name} onChange={handlePocketFormChange} className="input-field" placeholder=" " required />
                        <label htmlFor="pocketName" className="input-label">Nama Pocket</label>
                    </div>
                    <div className="input-group">
                        <textarea id="description" name="description" value={pocketFormData.description} onChange={handlePocketFormChange} className="input-field" placeholder=" " rows={3} />
                        <label htmlFor="description" className="input-label">Deskripsi</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="input-group">
                            <select id="type" name="type" value={pocketFormData.type} onChange={handlePocketFormChange} className="input-field" required>
                                {Object.values(PocketType).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <label htmlFor="type" className="input-label">Tipe Pocket</label>
                        </div>
                        <div className="input-group">
                            <select id="sourceCardId" name="sourceCardId" value={pocketFormData.sourceCardId} onChange={handlePocketFormChange} className="input-field">
                                <option value="">Pilih Sumber Dana...</option>
                                {cards.map(card => (
                                    <option key={card.id} value={card.id}>{card.bankName} **** {card.lastFourDigits}</option>
                                ))}
                            </select>
                            <label htmlFor="sourceCardId" className="input-label">Sumber Dana</label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="input-group">
                            <input type="number" id="amount" name="amount" value={pocketFormData.amount} onChange={handlePocketFormChange} className="input-field" placeholder=" " required />
                            <label htmlFor="amount" className="input-label">Jumlah Saat Ini (IDR)</label>
                        </div>
                        <div className="input-group">
                            <input type="number" id="goalAmount" name="goalAmount" value={pocketFormData.goalAmount} onChange={handlePocketFormChange} className="input-field" placeholder=" " />
                            <label htmlFor="goalAmount" className="input-label">Target Jumlah (IDR)</label>
                        </div>
                    </div>
                    {pocketFormData.type === PocketType.LOCKED && (
                        <div className="input-group">
                            <input type="date" id="lockEndDate" name="lockEndDate" value={pocketFormData.lockEndDate} onChange={handlePocketFormChange} className="input-field" placeholder=" " />
                            <label htmlFor="lockEndDate" className="input-label">Tanggal Unlock</label>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-6 border-t border-brand-border">
                        <button type="button" onClick={() => setIsPocketModalOpen(false)} className="button-secondary">Batal</button>
                        <button type="submit" className="button-primary">{pocketModalMode === 'add' ? 'Simpan' : 'Update'}</button>
                    </div>
                </form>
            </Modal>
            {historyModalState && <Modal
                isOpen={!!historyModalState}
                onClose={() => setHistoryModalState(null)}
                title={`Riwayat: ${historyModalState.type === 'card' ? (historyModalState.item as Card).bankName + ' **** ' + (historyModalState.item as Card).lastFourDigits : (historyModalState.item as FinancialPocket).name}`}
                size="3xl"
            >
                <div>
                    <div className="overflow-y-auto max-h-[60vh]">
                        {historyModalState.type === 'reward_pool' ? (
                             <table className="w-full text-sm">
                                <thead className="text-xs text-brand-text-secondary uppercase">
                                    <tr>
                                        <th className="p-3 text-left">Tanggal</th>
                                        <th className="p-3 text-left">Freelancer</th>
                                        <th className="p-3 text-left">Deskripsi</th>
                                        <th className="p-3 text-right">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border">
                                    {rewardLedgerEntries.map(t => (
                                    <tr key={t.id} className="hover:bg-brand-bg">
                                        <td className="p-3">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                        <td className="p-3 font-semibold text-brand-text-light">{teamMembers.find(tm => tm.id === t.teamMemberId)?.name || 'N/A'}</td>
                                        <td className="p-3">{t.description}</td>
                                        <td className={`p-3 text-right font-semibold ${t.amount >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                                            {t.amount >= 0 ? '+' : ''}{formatCurrency(t.amount)}
                                        </td>
                                    </tr>
                                    ))}
                                    {rewardLedgerEntries.length === 0 &&
                                        <tr><td colSpan={4} className="text-center p-8 text-brand-text-secondary">Tidak ada riwayat hadiah.</td></tr>
                                    }
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="text-xs text-brand-text-secondary uppercase">
                                    <tr>
                                        <th className="p-3 text-left">Tanggal</th>
                                        <th className="p-3 text-left">Deskripsi</th>
                                        <th className="p-3 text-left">Sumber/Tujuan</th>
                                        <th className="p-3 text-right">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border">
                                    {transactions
                                        .filter(t => (historyModalState.type === 'card' && t.cardId === historyModalState.item?.id) || (historyModalState.type === 'pocket' && t.pocketId === historyModalState.item?.id))
                                        .map(t => {
                                            const card = cards.find(c => c.id === t.cardId);
                                            let sourceDestText = '';
                                            if (t.category.includes('Transfer') || t.category.includes('Penutupan')) {
                                                if (t.description.includes('Setor ke')) {
                                                    sourceDestText = `Dari: ${card?.bankName || 'N/A'}`;
                                                } else if (t.description.includes('Tarik dari')) {
                                                    sourceDestText = `Ke: ${card?.bankName || 'N/A'}`;
                                                } else {
                                                    sourceDestText = 'Sistem Internal';
                                                }
                                            } else if (t.type === TransactionType.INCOME) {
                                                sourceDestText = `Ke: ${card?.bankName || 'N/A'}`;
                                            } else if (t.type === TransactionType.EXPENSE) {
                                                sourceDestText = `Dari: ${card?.bankName || 'N/A'}`;
                                            }
                                            return (
                                                <tr key={t.id} className="hover:bg-brand-bg">
                                                    <td className="p-3">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                                    <td className="p-3 font-semibold text-brand-text-light">{t.description}</td>
                                                    <td className="p-3 text-brand-text-secondary">{sourceDestText}</td>
                                                    <td className={`p-3 text-right font-semibold ${t.type === TransactionType.INCOME ? 'text-brand-success' : 'text-brand-danger'}`}>
                                                        {t.type === TransactionType.EXPENSE ? '-' : ''}{formatCurrency(t.amount)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    {transactions.filter(t => (historyModalState.type === 'card' && t.cardId === historyModalState.item?.id) || (historyModalState.type === 'pocket' && t.pocketId === historyModalState.item?.id)).length === 0 &&
                                        <tr><td colSpan={4} className="text-center p-8 text-brand-text-secondary">Tidak ada riwayat transaksi.</td></tr>
                                    }
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </Modal>}
            <Modal isOpen={!!activeStatModal} onClose={() => setActiveStatModal(null)} title={activeStatModal ? statModalTitles[activeStatModal] : ''} size="2xl">
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {activeStatModal === 'assets' && (
                        <div className="space-y-3">
                            {cards.map(card => (
                                <div key={card.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                    <p className="font-semibold text-brand-text-light">{card.bankName} {card.id !== 'CARD_CASH' ? `**** ${card.lastFourDigits}` : '(Tunai)'}</p>
                                    <p className="font-semibold text-brand-text-light">{formatCurrency(card.balance)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeStatModal === 'pockets' && (
                        <div className="space-y-3">
                            {pockets.map(pocket => (
                                <div key={pocket.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                    <p className="font-semibold text-brand-text-light">{pocket.name}</p>
                                    <p className="font-semibold text-brand-text-light">{formatCurrency(pocket.amount)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeStatModal === 'income' && (
                         <div className="space-y-3">
                            {thisMonthIncome.length > 0 ? thisMonthIncome.map(tx => (
                                <div key={tx.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-brand-text-light">{tx.description}</p>
                                        <p className="text-xs text-brand-text-secondary">{new Date(tx.date).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <p className="font-semibold text-brand-success">{formatCurrency(tx.amount)}</p>
                                </div>
                            )) : <p className="text-center text-brand-text-secondary py-8">Tidak ada pemasukan bulan ini.</p>}
                        </div>
                    )}
                    {activeStatModal === 'expense' && (
                        <div className="space-y-3">
                           {thisMonthExpense.length > 0 ? thisMonthExpense.map(tx => (
                                <div key={tx.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-brand-text-light">{tx.description}</p>
                                        <p className="text-xs text-brand-text-secondary">{new Date(tx.date).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <p className="font-semibold text-brand-danger">{formatCurrency(tx.amount)}</p>
                                </div>
                            )) : <p className="text-center text-brand-text-secondary py-8">Tidak ada pengeluaran bulan ini.</p>}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Finance;