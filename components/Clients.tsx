import React, { useState, useMemo, useEffect } from 'react';
import { Client, Project, PaymentStatus, Package, AddOn, TransactionType, Profile, Transaction, ClientStatus, Card, FinancialPocket, Contract, ViewType, NavigationAction, ClientFeedback, SatisfactionLevel, PromoCode, ClientType } from '../types';
import PageHeader from './PageHeader';
import Modal from './Modal';
import StatCard from './StatCard';
import SignaturePad from './SignaturePad';
import { EyeIcon, PencilIcon, Trash2Icon, FileTextIcon, PlusIcon, PrinterIcon, CreditCardIcon, Share2Icon, HistoryIcon, DollarSignIcon, FolderKanbanIcon, UsersIcon, TrendingUpIcon, AlertCircleIcon, LightbulbIcon, MessageSquareIcon, PhoneIncomingIcon, MapPinIcon, QrCodeIcon, StarIcon, TrendingDownIcon, ArrowDownIcon, ArrowUpIcon, DownloadIcon } from '../constants';
import { clientsService, projectsService, transactionsService, cardsService, promoCodesService } from '../services/database';
import { useCrud } from '../hooks/useCrud';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const getPaymentStatusClass = (status: PaymentStatus | null) => {
    if (!status) return 'bg-gray-500/20 text-gray-400';
    switch (status) {
        case PaymentStatus.LUNAS: return 'bg-green-500/20 text-green-400';
        case PaymentStatus.DP_TERBAYAR: return 'bg-blue-500/20 text-blue-400';
        case PaymentStatus.BELUM_BAYAR: return 'bg-yellow-500/20 text-yellow-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};

const initialFormState = {
    // Client fields
    clientId: '',
    clientName: '',
    email: '',
    phone: '',
    instagram: '',
    clientType: ClientType.DIRECT,
    // Project fields
    projectId: '', // Keep track of which project is being edited
    projectName: '',
    projectType: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    packageId: '',
    selectedAddOnIds: [] as string[],
    dp: '',
    dpDestinationCardId: '',
    notes: '',
    accommodation: '',
    driveLink: '',
    promoCodeId: '',
};

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


interface ClientFormProps {
    formData: typeof initialFormState;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleFormSubmit: (e: React.FormEvent) => void;
    handleCloseModal: () => void;
    packages: Package[];
    addOns: AddOn[];
    userProfile: Profile;
    modalMode: 'add' | 'edit';
    cards: Card[];
    promoCodes: PromoCode[];
}

const ClientForm: React.FC<ClientFormProps> = ({ formData, handleFormChange, handleFormSubmit, handleCloseModal, packages, addOns, userProfile, modalMode, cards, promoCodes }) => {
    
    const priceCalculations = useMemo(() => {
        const selectedPackage = packages.find(p => p.id === formData.packageId);
        const packagePrice = selectedPackage?.price || 0;

        const addOnsPrice = addOns
            .filter(addon => formData.selectedAddOnIds.includes(addon.id))
            .reduce((sum, addon) => sum + addon.price, 0);

        let totalProjectBeforeDiscount = packagePrice + addOnsPrice;
        let discountAmount = 0;
        let discountApplied = 'N/A';
        const promoCode = promoCodes.find(p => p.id === formData.promoCodeId);

        if (promoCode) {
            if (promoCode.discountType === 'percentage') {
                discountAmount = (totalProjectBeforeDiscount * promoCode.discountValue) / 100;
                discountApplied = `${promoCode.discountValue}%`;
            } else { // fixed
                discountAmount = promoCode.discountValue;
                discountApplied = formatCurrency(promoCode.discountValue);
            }
        }
        
        const totalProject = totalProjectBeforeDiscount - discountAmount;
        const remainingPayment = totalProject - Number(formData.dp);

        return { packagePrice, addOnsPrice, totalProject, remainingPayment, discountAmount, discountApplied };
    }, [formData.packageId, formData.selectedAddOnIds, formData.dp, formData.promoCodeId, packages, addOns, promoCodes]);
    
    return (
        <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2">
                {/* Left Column: Client & Project Info */}
                <div className="space-y-4">
                    <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2">Informasi Klien</h4>
                    <div className="input-group"><input type="text" id="clientName" name="clientName" value={formData.clientName} onChange={handleFormChange} className="input-field" placeholder=" " required/><label htmlFor="clientName" className="input-label">Nama Klien</label></div>
                    <div className="input-group">
                        <select id="clientType" name="clientType" value={formData.clientType} onChange={handleFormChange} className="input-field" required>
                            {Object.values(ClientType).map(ct => <option key={ct} value={ct}>{ct}</option>)}
                        </select>
                        <label htmlFor="clientType" className="input-label">Jenis Klien</label>
                    </div>
                    <div className="input-group"><input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleFormChange} className="input-field" placeholder=" " required/><label htmlFor="phone" className="input-label">Nomor Telepon</label></div>
                    <div className="input-group"><input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} className="input-field" placeholder=" " required/><label htmlFor="email" className="input-label">Email</label></div>
                    <div className="input-group"><input type="text" id="instagram" name="instagram" value={formData.instagram} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="instagram" className="input-label">Instagram (@username)</label></div>
                    
                    <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 pt-4">Informasi Proyek</h4>
                    <div className="input-group"><input type="text" id="projectName" name="projectName" value={formData.projectName} onChange={handleFormChange} className="input-field" placeholder=" " required/><label htmlFor="projectName" className="input-label">Nama Proyek</label></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="input-group"><select id="projectType" name="projectType" value={formData.projectType} onChange={handleFormChange} className="input-field" required><option value="" disabled>Pilih Jenis...</option>{userProfile.projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}</select><label htmlFor="projectType" className="input-label">Jenis Proyek</label></div>
                        <div className="input-group"><input type="date" id="date" name="date" value={formData.date} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="date" className="input-label">Tanggal Acara</label></div>
                    </div>
                    <div className="input-group"><input type="text" id="location" name="location" value={formData.location} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="location" className="input-label">Lokasi</label></div>
                </div>

                {/* Right Column: Financial & Other Info */}
                <div className="space-y-4">
                    <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2">Detail Paket & Pembayaran</h4>
                    <div className="input-group">
                        <select id="packageId" name="packageId" value={formData.packageId} onChange={handleFormChange} className="input-field" required>
                            <option value="">Pilih paket...</option>
                            {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <label htmlFor="packageId" className="input-label">Paket</label>
                        <p className="text-right text-xs text-brand-text-secondary mt-1">Harga Paket: {formatCurrency(priceCalculations.packagePrice)}</p>
                    </div>
                    
                    <div className="input-group">
                        <label className="input-label !static !-top-4 !text-brand-accent">Add-On</label>
                        <div className="p-3 border border-brand-border bg-brand-bg rounded-lg max-h-32 overflow-y-auto space-y-2 mt-2">
                            {addOns.map(addon => (
                                <label key={addon.id} className="flex items-center justify-between p-2 rounded-md hover:bg-brand-input cursor-pointer">
                                    <span className="text-sm text-brand-text-primary">{addon.name}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-brand-text-secondary">{formatCurrency(addon.price)}</span>
                                        <input type="checkbox" id={addon.id} name="addOns" checked={formData.selectedAddOnIds.includes(addon.id)} onChange={handleFormChange} />
                                    </div>
                                </label>
                            ))}
                        </div>
                        <p className="text-right text-xs text-brand-text-secondary mt-1">Total Harga Add-On: {formatCurrency(priceCalculations.addOnsPrice)}</p>
                    </div>

                    <div className="input-group">
                        <select id="promoCodeId" name="promoCodeId" value={formData.promoCodeId} onChange={handleFormChange} className="input-field">
                            <option value="">Tanpa Kode Promo</option>
                            {promoCodes.filter(p => p.isActive).map(p => (
                                <option key={p.id} value={p.id}>{p.code} - ({p.discountType === 'percentage' ? `${p.discountValue}%` : formatCurrency(p.discountValue)})</option>
                            ))}
                        </select>
                        <label htmlFor="promoCodeId" className="input-label">Kode Promo</label>
                        {formData.promoCodeId && <p className="text-right text-xs text-brand-success mt-1">Diskon Diterapkan: {priceCalculations.discountApplied}</p>}
                    </div>

                    <div className="p-4 bg-brand-bg rounded-lg space-y-3">
                        <div className="flex justify-between items-center font-bold text-lg"><span className="text-brand-text-secondary">Total Proyek</span><span className="text-brand-text-light">{formatCurrency(priceCalculations.totalProject)}</span></div>
                        <div className="input-group !mt-2">
                            <input type="number" name="dp" id="dp" value={formData.dp} onChange={handleFormChange} className="input-field text-right" placeholder=" "/>
                             <label htmlFor="dp" className="input-label">Uang DP</label>
                        </div>
                        {Number(formData.dp) > 0 && (
                            <div className="input-group !mt-2">
                                <select name="dpDestinationCardId" value={formData.dpDestinationCardId} onChange={handleFormChange} className="input-field" required>
                                    <option value="">Setor DP ke...</option>
                                    {cards.map(c => <option key={c.id} value={c.id}>{c.bankName} {c.lastFourDigits !== 'CASH' ? `**** ${c.lastFourDigits}` : '(Tunai)'}</option>)}
                                </select>
                                <label htmlFor="dpDestinationCardId" className="input-label">Kartu Tujuan</label>
                            </div>
                        )}
                        <hr className="border-brand-border"/>
                        <div className="flex justify-between items-center font-bold text-lg"><span className="text-brand-text-secondary">Sisa Pembayaran</span><span className="text-blue-500">{formatCurrency(priceCalculations.remainingPayment)}</span></div>
                    </div>

                    <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 pt-4">Lainnya (Opsional)</h4>
                    <div className="input-group"><textarea id="notes" name="notes" value={formData.notes} onChange={handleFormChange} className="input-field" placeholder=" "></textarea><label htmlFor="notes" className="input-label">Catatan Tambahan</label></div>
                </div>
            </div>

            <div className="flex justify-end items-center gap-3 pt-8 mt-8 border-t border-brand-border">
                <button type="button" onClick={handleCloseModal} className="button-secondary">Batal</button>
                <button type="submit" className="button-primary">{modalMode === 'add' ? 'Simpan Klien & Proyek' : 'Update Klien & Proyek'}</button>
            </div>
        </form>
    );
};

interface ClientDetailModalProps {
    client: Client | null;
    projects: Project[];
    transactions: Transaction[];
    contracts: Contract[];
    onClose: () => void;
    onEditClient: (client: Client) => void;
    onDeleteClient: (clientId: string) => void;
    onViewReceipt: (transaction: Transaction) => void;
    onViewInvoice: (project: Project) => void;
    handleNavigation: (view: ViewType, action: NavigationAction) => void;
    onRecordPayment: (projectId: string, amount: number, destinationCardId: string) => void;
    cards: Card[];
    onSharePortal: (client: Client) => void;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, projects, transactions, contracts, onClose, onEditClient, onDeleteClient, onViewReceipt, onViewInvoice, handleNavigation, onRecordPayment, cards, onSharePortal }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [newPayments, setNewPayments] = useState<{[key: string]: { amount: string, destinationCardId: string }}>({});

    if (!client) return null;
    
    const handleNewPaymentChange = (projectId: string, field: 'amount' | 'destinationCardId', value: string) => {
        const currentProjectPayment = newPayments[projectId] || { amount: '', destinationCardId: '' };
        setNewPayments(prev => ({
            ...prev,
            [projectId]: {
                ...currentProjectPayment,
                [field]: value,
            }
        }));
    };

    const handleNewPaymentSubmit = (projectId: string) => {
        const paymentData = newPayments[projectId];
        const project = clientProjects.find(p => p.id === projectId);
        if (paymentData && Number(paymentData.amount) > 0 && paymentData.destinationCardId && project) {
            const amount = Number(paymentData.amount);
            if(amount > (project.totalCost - project.amountPaid)) {
                alert('Jumlah pembayaran melebihi sisa tagihan.');
                return;
            }
            onRecordPayment(projectId, amount, paymentData.destinationCardId);
            setNewPayments(prev => ({ ...prev, [projectId]: { amount: '', destinationCardId: '' } }));
        } else {
            alert('Harap isi jumlah dan tujuan pembayaran dengan benar.');
        }
    };


    const clientProjects = projects.filter(p => p.clientId === client.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const clientTransactions = transactions.filter(t => clientProjects.some(p => p.id === t.projectId)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const totalProjects = clientProjects.length;
    const totalProjectValue = clientProjects.reduce((sum, p) => sum + p.totalCost, 0);
    const totalPaid = clientProjects.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalDue = totalProjectValue - totalPaid;

    const InfoStatCard: React.FC<{icon: React.ReactNode, title: string, value: string}> = ({icon, title, value}) => (
        <div className="bg-brand-bg p-4 rounded-xl flex items-center gap-4 border border-brand-border shadow-sm">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-brand-surface">
                {icon}
            </div>
            <div>
                <p className="text-sm text-brand-text-secondary">{title}</p>
                <p className="text-lg font-bold text-brand-text-light">{value}</p>
            </div>
        </div>
    );

    return (
        <div>
            <div className="border-b border-brand-border">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    <button onClick={() => setActiveTab('info')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'info' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><UsersIcon className="w-5 h-5"/> Informasi Klien</button>
                    <button onClick={() => setActiveTab('payments')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'payments' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><HistoryIcon className="w-5 h-5"/> Riwayat Pembayaran</button>
                    <button onClick={() => setActiveTab('documents')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><FileTextIcon className="w-5 h-5"/> Kontrak Kerja</button>
                </nav>
            </div>
            <div className="pt-5 max-h-[65vh] overflow-y-auto pr-2">
                {activeTab === 'info' && (
                     <div className="space-y-8">
                        <div>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-brand-border"><td className="py-2.5 text-brand-text-secondary w-1/3 sm:w-1/4">Nama Lengkap</td><td className="py-2.5 text-brand-text-light font-semibold">{client.name}</td></tr>
                                    <tr className="border-b border-brand-border"><td className="py-2.5 text-brand-text-secondary">Jenis Klien</td><td className="py-2.5 text-brand-text-light font-semibold">{client.clientType}</td></tr>
                                    <tr className="border-b border-brand-border"><td className="py-2.5 text-brand-text-secondary">Email</td><td className="py-2.5 text-brand-text-light font-semibold">{client.email}</td></tr>
                                    <tr className="border-b border-brand-border"><td className="py-2.5 text-brand-text-secondary">Telepon</td><td className="py-2.5 text-brand-text-light font-semibold">{client.phone}</td></tr>
                                    <tr className="border-b border-brand-border"><td className="py-2.5 text-brand-text-secondary">Instagram</td><td className="py-2.5 text-brand-text-light font-semibold">{client.instagram || '-'}</td></tr>
                                    <tr className="border-b border-brand-border"><td className="py-2.5 text-brand-text-secondary">Klien Sejak</td><td className="py-2.5 text-brand-text-light font-semibold">{new Date(client.since).toLocaleDateString('id-ID')}</td></tr>
                                </tbody>
                            </table>
                            <button onClick={() => onSharePortal(client)} className="mt-5 button-secondary inline-flex items-center gap-2 text-sm"><Share2Icon className="w-4 h-4" /> Bagikan Portal Klien</button>
                        </div>
                        
                        <div>
                            <h4 className="text-base font-semibold text-brand-text-light mb-4">Ringkasan Keuangan Klien</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoStatCard icon={<FolderKanbanIcon className="w-6 h-6 text-indigo-400"/>} title="Jumlah Proyek" value={totalProjects.toString()} />
                                <InfoStatCard icon={<DollarSignIcon className="w-6 h-6 text-blue-400"/>} title="Total Nilai Proyek" value={formatCurrency(totalProjectValue)} />
                                <InfoStatCard icon={<TrendingUpIcon className="w-6 h-6 text-green-400"/>} title="Total Telah Dibayar" value={formatCurrency(totalPaid)} />
                                <InfoStatCard icon={<TrendingDownIcon className="w-6 h-6 text-red-400"/>} title="Total Sisa Tagihan" value={formatCurrency(totalDue)} />
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'payments' && (
                     <div className="space-y-8">
                        {clientProjects.map(p => {
                            const transactionsForProject = clientTransactions.filter(t => t.projectId === p.id);
                            const remainingBalance = p.totalCost - p.amountPaid;
                            return (
                                <div key={p.id}>
                                    <h4 className="text-base font-semibold text-brand-text-light mb-2">Ringkasan Proyek & Invoice</h4>
                                    <div className="p-4 bg-brand-bg rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-brand-text-light">{p.projectName}</p>
                                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs mt-1">
                                                <span>Total: <span className="font-medium text-brand-text-primary">{formatCurrency(p.totalCost)}</span></span>
                                                <span>Terbayar: <span className="font-medium text-green-400">{formatCurrency(p.amountPaid)}</span></span>
                                                <span>Sisa: <span className="font-medium text-red-400">{formatCurrency(remainingBalance)}</span></span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {p.dpProofUrl && (
                                                <a href={p.dpProofUrl} target="_blank" rel="noopener noreferrer" className="button-secondary text-sm inline-flex items-center gap-2">
                                                    <CreditCardIcon className="w-4 h-4" /> Lihat Bukti DP
                                                </a>
                                            )}
                                            <button onClick={() => onViewInvoice(p)} className="button-secondary text-sm inline-flex items-center gap-2">
                                                <FileTextIcon className="w-4 h-4" /> Lihat Invoice
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="text-base font-semibold text-brand-text-light mt-4 mb-2">Detail Transaksi Pembayaran</h4>
                                    <div className="border border-brand-border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead><tr className="bg-brand-bg"><th className="p-3 text-left font-medium text-brand-text-secondary">Tanggal</th><th className="p-3 text-left font-medium text-brand-text-secondary">Deskripsi</th><th className="p-3 text-right font-medium text-brand-text-secondary">Jumlah</th><th className="p-3 text-center font-medium text-brand-text-secondary">Aksi</th></tr></thead>
                                            <tbody>
                                                {transactionsForProject.length > 0 ? transactionsForProject.map(t => (
                                                    <tr key={t.id} className="border-t border-brand-border"><td className="p-3">{new Date(t.date).toLocaleDateString('id-ID')}</td><td className="p-3">{t.description}</td><td className="p-3 text-right font-semibold text-green-400">{formatCurrency(t.amount)}</td><td className="p-3 text-center"><button onClick={() => onViewReceipt(t)} className="p-1 text-brand-text-secondary hover:text-brand-accent"><PrinterIcon className="w-5 h-5"/></button></td></tr>
                                                )) : (
                                                    <tr><td colSpan={4} className="text-center p-4 text-brand-text-secondary">Belum ada pembayaran untuk proyek ini.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {remainingBalance > 0 && (
                                        <>
                                            <h4 className="text-base font-semibold text-brand-text-light mt-4 mb-2">Catat Pembayaran Baru</h4>
                                            <div className="p-4 bg-brand-bg rounded-lg flex flex-col sm:flex-row items-center gap-4">
                                                <div className="input-group flex-grow w-full !mt-0">
                                                    <input type="number" id={`amount-${p.id}`} value={newPayments[p.id]?.amount || ''} onChange={(e) => handleNewPaymentChange(p.id, 'amount', e.target.value)} max={remainingBalance} className="input-field" placeholder=" "/>
                                                    <label htmlFor={`amount-${p.id}`} className="input-label">Jumlah Pembayaran (Maks: {formatCurrency(remainingBalance)})</label>
                                                </div>
                                                <div className="input-group w-full sm:w-64 !mt-0">
                                                     <select id={`dest-${p.id}`} value={newPayments[p.id]?.destinationCardId || ''} onChange={(e) => handleNewPaymentChange(p.id, 'destinationCardId', e.target.value)} className="input-field"><option value="">Pilih Tujuan...</option>{cards.map(c=><option key={c.id} value={c.id}>{c.bankName} {c.lastFourDigits !== 'CASH' ? `**** ${c.lastFourDigits}` : '(Tunai)'}</option>)}</select>
                                                     <label htmlFor={`dest-${p.id}`} className="input-label">Tujuan Pembayaran</label>
                                                </div>
                                                <button onClick={() => handleNewPaymentSubmit(p.id)} className="button-primary h-fit sm:mt-2 w-full sm:w-auto flex-shrink-0">CATAT</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
                {activeTab === 'documents' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-base font-semibold text-brand-text-light">Daftar Kontrak Kerja</h4>
                            <button 
                                onClick={() => handleNavigation(ViewType.CONTRACTS, { type: 'CREATE_CONTRACT_FOR_CLIENT', id: client.id })} 
                                className="button-primary inline-flex items-center gap-2 text-sm"
                            >
                                <PlusIcon className="w-4 h-4"/> BUAT KONTRAK BARU
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {contracts.filter(c => c.clientId === client.id).length > 0 ? (
                                contracts.filter(c => c.clientId === client.id).map(contract => {
                                    const project = projects.find(p => p.id === contract.projectId);
                                    return (
                                        <div key={contract.id} className="p-4 bg-brand-bg rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-brand-text-light">{contract.contractNumber}</p>
                                                <p className="text-xs text-brand-text-secondary mt-1">Proyek: {project?.projectName || 'N/A'}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleNavigation(ViewType.CONTRACTS, { type: 'VIEW_CONTRACT', id: contract.id })}
                                                className="button-secondary text-sm"
                                            >
                                                Lihat Detail
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-sm text-brand-text-secondary py-8">
                                    Belum ada kontrak untuk klien ini.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


interface ClientsProps {
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    packages: Package[];
    addOns: AddOn[];
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    userProfile: Profile;
    showNotification: (message: string) => void;
    initialAction: NavigationAction | null;
    setInitialAction: (action: NavigationAction | null) => void;
    cards: Card[];
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
    pockets: FinancialPocket[];
    setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
    contracts: Contract[];
    handleNavigation: (view: ViewType, action: NavigationAction) => void;
    clientFeedback: ClientFeedback[];
    promoCodes: PromoCode[];
    setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
    onSignInvoice: (projectId: string, signatureDataUrl: string) => void;
    onSignTransaction: (transactionId: string, signatureDataUrl: string) => void;
}

const Clients: React.FC<ClientsProps> = ({ clients, setClients, projects, setProjects, packages, addOns, transactions, setTransactions, userProfile, showNotification, initialAction, setInitialAction, cards, setCards, pockets, setPockets, contracts, handleNavigation, clientFeedback, promoCodes, setPromoCodes, onSignInvoice, onSignTransaction }) => {
    
    // Use CRUD hooks for database operations
    const clientsCrud = useCrud(clientsService, showNotification, 'Klien');
    const projectsCrud = useCrud(projectsService, showNotification, 'Proyek');
    const transactionsCrud = useCrud(transactionsService, showNotification, 'Transaksi');
    
    // Sync with parent state
    useEffect(() => {
        setClients(clientsCrud.items);
    }, [clientsCrud.items, setClients]);
    
    useEffect(() => {
        setProjects(projectsCrud.items);
    }, [projectsCrud.items, setProjects]);
    
    useEffect(() => {
        setTransactions(transactionsCrud.items);
    }, [transactionsCrud.items, setTransactions]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [clientForDetail, setClientForDetail] = useState<Client | null>(null);

    const [documentToView, setDocumentToView] = useState<{ type: 'invoice', project: Project } | { type: 'receipt', transaction: Transaction } | null>(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [qrModalContent, setQrModalContent] = useState<{ title: string; url: string } | null>(null);
    
    // New state for filters and UI
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Semua Status');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [activeSectionOpen, setActiveSectionOpen] = useState(true);
    const [inactiveSectionOpen, setInactiveSectionOpen] = useState(true);
    const [isBookingFormShareModalOpen, setIsBookingFormShareModalOpen] = useState(false);
    const [activeStatModal, setActiveStatModal] = useState<'active' | 'location' | 'receivables' | 'total' | null>(null);

    useEffect(() => {
        if (initialAction && initialAction.type === 'VIEW_CLIENT_DETAILS' && initialAction.id) {
            const clientToView = clients.find(c => c.id === initialAction.id);
            if (clientToView) {
                setClientForDetail(clientToView);
                setIsDetailModalOpen(true);
            }
            setInitialAction(null); // Reset action after handling
        }
    }, [initialAction, clients, setInitialAction]);
    
    const bookingFormUrl = useMemo(() => {
        return `${window.location.origin}${window.location.pathname}#/public-booking`;
    }, []);

    useEffect(() => {
        if (qrModalContent) {
            const qrCodeContainer = document.getElementById('client-portal-qrcode');
            if (qrCodeContainer && typeof (window as any).QRCode !== 'undefined') {
                qrCodeContainer.innerHTML = '';
                 new (window as any).QRCode(qrCodeContainer, {
                    text: qrModalContent.url,
                    width: 200,
                    height: 200,
                    colorDark: "#020617",
                    colorLight: "#ffffff",
                    correctLevel: 2 // H
                });
            }
        }
        
        if (isBookingFormShareModalOpen) {
            const qrCodeContainer = document.getElementById('clients-booking-form-qrcode');
            if (qrCodeContainer && typeof (window as any).QRCode !== 'undefined') {
                qrCodeContainer.innerHTML = '';
                new (window as any).QRCode(qrCodeContainer, {
                    text: bookingFormUrl,
                    width: 200,
                    height: 200,
                    colorDark: "#020617",
                    colorLight: "#ffffff",
                    correctLevel: 2 // H
                });
            }
        }
    }, [qrModalContent, isBookingFormShareModalOpen, bookingFormUrl]);

    const handleOpenQrModal = (client: Client) => {
        const url = `${window.location.origin}${window.location.pathname}#/portal/${client.portalAccessId}`;
        setQrModalContent({ title: `Portal QR Code untuk ${client.name}`, url });
    };

    const copyBookingLinkToClipboard = () => {
        navigator.clipboard.writeText(bookingFormUrl).then(() => {
            showNotification('Tautan formulir booking berhasil disalin!');
            setIsBookingFormShareModalOpen(false);
        });
    };
    
    const downloadBookingQrCode = () => {
        const canvas = document.querySelector('#clients-booking-form-qrcode canvas') as HTMLCanvasElement;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'form-booking-qr.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const handleOpenModal = (mode: 'add' | 'edit', client?: Client, project?: Project) => {
        setModalMode(mode);
        if (mode === 'edit' && client && project) {
            setSelectedClient(client);
            setSelectedProject(project);
            setFormData({
                clientId: client.id,
                clientName: client.name,
                email: client.email,
                phone: client.phone,
                instagram: client.instagram || '',
                clientType: client.clientType,
                projectId: project.id,
                projectName: project.projectName,
                projectType: project.projectType,
                location: project.location,
                date: project.date,
                packageId: project.packageId,
                selectedAddOnIds: project.addOns.map(a => a.id),
                dp: '', // Not editing DP here, handle in payment
                dpDestinationCardId: '',
                notes: project.notes || '',
                accommodation: project.accommodation || '',
                driveLink: project.driveLink || '',
                promoCodeId: project.promoCodeId || '',
            });
        } else if (mode === 'add' && client) { // Adding new project for existing client
             setSelectedClient(client);
             setFormData({ ...initialFormState, clientId: client.id, clientName: client.name, email: client.email, phone: client.phone, instagram: client.instagram || '', clientType: client.clientType });
        } else { // Adding new client
            setSelectedClient(null);
            setSelectedProject(null);
            setFormData({...initialFormState, projectType: userProfile.projectTypes[0] || ''});
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setDocumentToView(null);
        setIsSignatureModalOpen(false);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { id, checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, selectedAddOnIds: checked ? [...prev.selectedAddOnIds, id] : prev.selectedAddOnIds.filter(addOnId => addOnId !== id) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const allClientData = useMemo(() => {
        return clients.map(client => {
            const clientProjects = projects.filter(p => p.clientId === client.id);
            const totalValue = clientProjects.reduce((sum, p) => sum + p.totalCost, 0);
            const totalPaid = clientProjects.reduce((sum, p) => sum + p.amountPaid, 0);
            
            const mostRecentProject = clientProjects.length > 0
                ? [...clientProjects].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                : null;
    
            return {
                ...client,
                projects: clientProjects,
                totalProyekValue: totalValue,
                balanceDue: totalValue - totalPaid,
                paketTerbaru: mostRecentProject ? `${mostRecentProject.packageName}${mostRecentProject.addOns.length > 0 ? ` + ${mostRecentProject.addOns.length} Add-on` : ''}` : 'Belum ada proyek',
                overallPaymentStatus: mostRecentProject ? mostRecentProject.paymentStatus : null,
                mostRecentProject: mostRecentProject,
            };
        });
    }, [clients, projects]);

    const clientStats = useMemo(() => {
        const locationCounts = projects.reduce((acc, p) => {
            if (p.location) {
                const mainLocation = p.location.split(',')[0].trim();
                acc[mainLocation] = (acc[mainLocation] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const mostFrequentLocation = Object.keys(locationCounts).length > 0 
            ? Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b)
            : 'N/A';
        
        const totalReceivables = allClientData.reduce((sum, c) => sum + c.balanceDue, 0);

        return {
            activeClients: clients.filter(c => c.status === ClientStatus.ACTIVE).length,
            mostFrequentLocation,
            totalReceivables: formatCurrency(totalReceivables),
            totalClients: clients.length
        };
    }, [clients, projects, allClientData]);

    const filteredClientData = useMemo(() => {
        return allClientData.filter(client => {
            const searchMatch = searchTerm === '' ||
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
            const statusMatch = statusFilter === 'Semua Status' || client.overallPaymentStatus === statusFilter;
    
            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo) : null;
            if (from) from.setHours(0, 0, 0, 0);
            if (to) to.setHours(23, 59, 59, 999);
            const dateMatch = (!from && !to) || client.projects.some(p => {
                const projectDate = new Date(p.date);
                return (!from || projectDate >= from) && (!to || projectDate <= to);
            });
    
            return searchMatch && statusMatch && dateMatch;
        });
    }, [allClientData, searchTerm, statusFilter, dateFrom, dateTo]);
    
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const selectedPackage = packages.find(p => p.id === formData.packageId);
        if (!selectedPackage) {
            alert('Harap pilih paket layanan.');
            return;
        }

        const selectedAddOns = addOns.filter(addon => formData.selectedAddOnIds.includes(addon.id));
        const totalBeforeDiscount = selectedPackage.price + selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
        let finalDiscountAmount = 0;
        const promoCode = promoCodes.find(p => p.id === formData.promoCodeId);
        if (promoCode) {
            if (promoCode.discountType === 'percentage') {
                finalDiscountAmount = (totalBeforeDiscount * promoCode.discountValue) / 100;
            } else {
                finalDiscountAmount = promoCode.discountValue;
            }
        }
        const totalProject = totalBeforeDiscount - finalDiscountAmount;

        try {
            if (modalMode === 'add') {
                let clientId = selectedClient?.id;
                if (!selectedClient) { // New client
                    const newClient: Omit<Client, 'id'> = {
                        name: formData.clientName,
                        email: formData.email,
                        phone: formData.phone,
                        instagram: formData.instagram,
                        clientType: formData.clientType,
                        since: new Date().toISOString().split('T')[0],
                        status: ClientStatus.ACTIVE,
                        lastContact: new Date().toISOString(),
                        portalAccessId: crypto.randomUUID(),
                    };
                    const createdClient = await clientsCrud.create(newClient);
                    clientId = createdClient.id;
                }
                
                const dpAmount = Number(formData.dp) || 0;
                const remainingPayment = totalProject - dpAmount;

                const physicalItemsFromPackage = selectedPackage.physicalItems?.map((item, index) => ({
                    id: `pi-${Date.now()}-${index}`,
                    type: 'Custom' as 'Custom',
                    customName: item.name,
                    details: item.name,
                    cost: item.price,
                })) || [];

                const printingCostFromPackage = physicalItemsFromPackage.reduce((sum, item) => sum + item.cost, 0);

                const newProject: Omit<Project, 'id'> = {
                    projectName: formData.projectName,
                    clientName: formData.clientName,
                    clientId: clientId!,
                    projectType: formData.projectType,
                    packageName: selectedPackage.name,
                    packageId: selectedPackage.id,
                    addOns: selectedAddOns,
                    date: formData.date,
                    location: formData.location,
                    progress: 0,
                    status: 'Dikonfirmasi',
                    totalCost: totalProject,
                    amountPaid: dpAmount,
                    paymentStatus: dpAmount > 0 ? (remainingPayment <= 0 ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR) : PaymentStatus.BELUM_BAYAR,
                    team: [],
                    notes: formData.notes,
                    accommodation: formData.accommodation,
                    driveLink: formData.driveLink,
                    promoCodeId: formData.promoCodeId || undefined,
                    discountAmount: finalDiscountAmount > 0 ? finalDiscountAmount : undefined,
                    printingDetails: physicalItemsFromPackage,
                    printingCost: printingCostFromPackage,
                    completedDigitalItems: [],
                };
                
                const createdProject = await projectsCrud.create(newProject);

                if (createdProject.amountPaid > 0) {
                    const newTransaction: Omit<Transaction, 'id'> = {
                        date: new Date().toISOString().split('T')[0],
                        description: `DP Proyek ${createdProject.projectName}`,
                        amount: createdProject.amountPaid,
                        type: TransactionType.INCOME,
                        projectId: createdProject.id,
                        category: 'DP Proyek',
                        method: 'Transfer Bank',
                        cardId: formData.dpDestinationCardId,
                    };
                    await transactionsCrud.create(newTransaction);
                    
                    // Update card balance
                    const cardToUpdate = cards.find(c => c.id === formData.dpDestinationCardId);
                    if (cardToUpdate) {
                        setCards(prev => prev.map(c => c.id === formData.dpDestinationCardId ? {...c, balance: c.balance + createdProject.amountPaid} : c));
                    }
                }
                
                if (promoCode) {
                    setPromoCodes(prev => prev.map(p => p.id === promoCode.id ? { ...p, usageCount: p.usageCount + 1 } : p));
                }

            } else if (modalMode === 'edit' && selectedClient && selectedProject) {
                // Update client
                await clientsCrud.update(selectedClient.id, {
                    name: formData.clientName,
                    email: formData.email,
                    phone: formData.phone,
                    instagram: formData.instagram,
                    clientType: formData.clientType
                });
                
                // Update project
                const amountPaid = selectedProject.amountPaid; // Keep existing payment data
                const remainingPayment = totalProject - amountPaid;
                await projectsCrud.update(selectedProject.id, {
                    projectName: formData.projectName,
                    clientName: formData.clientName,
                    projectType: formData.projectType,
                    location: formData.location,
                    date: formData.date,
                    packageName: selectedPackage.name,
                    packageId: selectedPackage.id,
                    addOns: selectedAddOns,
                    totalCost: totalProject,
                    paymentStatus: amountPaid > 0 ? (remainingPayment <= 0 ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR) : PaymentStatus.BELUM_BAYAR,
                    notes: formData.notes,
                    promoCodeId: formData.promoCodeId || undefined,
                    discountAmount: finalDiscountAmount > 0 ? finalDiscountAmount : undefined,
                });
            }
            
            handleCloseModal();
        } catch (error) {
            console.error('Error saving data:', error);
            showNotification(`Error: ${error.message || 'Gagal menyimpan data'}`);
        }
    };
    
    const handleDeleteClient = async (clientId: string) => {
        if (window.confirm("Menghapus klien akan menghapus semua proyek dan transaksi terkait. Apakah Anda yakin?")) {
            try {
                // Delete related transactions first
                const projectsToDelete = projects.filter(p => p.clientId === clientId);
                const transactionsToDelete = transactions.filter(t => projectsToDelete.some(p => p.id === t.projectId));
                
                for (const transaction of transactionsToDelete) {
                    await transactionsCrud.delete(transaction.id);
                }
                
                // Delete related projects
                for (const project of projectsToDelete) {
                    await projectsCrud.delete(project.id);
                }
                
                // Delete client
                await clientsCrud.delete(clientId);
                
                setIsDetailModalOpen(false);
            } catch (error) {
                console.error('Error deleting client:', error);
                showNotification(`Error: ${error.message || 'Gagal menghapus klien'}`);
            }
        }
    };

    const handleRecordPayment = async (projectId: string, amount: number, destinationCardId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
    
        try {
            const newTransaction: Omit<Transaction, 'id'> = {
                date: new Date().toISOString().split('T')[0],
                description: `Pembayaran Proyek ${project.projectName}`,
                amount: amount,
                type: TransactionType.INCOME,
                projectId: project.id,
                category: 'Pelunasan Proyek',
                method: 'Transfer Bank',
                cardId: destinationCardId,
            };
        
            await transactionsCrud.create(newTransaction);
            setCards(prev => prev.map(c => c.id === destinationCardId ? {...c, balance: c.balance + amount} : c));
        
            const newAmountPaid = project.amountPaid + amount;
            const remaining = project.totalCost - newAmountPaid;
            
            await projectsCrud.update(project.id, {
                amountPaid: newAmountPaid,
                paymentStatus: remaining <= 0 ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR
            });
        } catch (error) {
            console.error('Error recording payment:', error);
            showNotification(`Error: ${error.message || 'Gagal mencatat pembayaran'}`);
        }
    };
    
    const handleDownloadClients = () => {
        const headers = ['Nama', 'Email', 'Telepon', 'Status', 'Total Nilai Proyek', 'Sisa Tagihan', 'Paket Terbaru'];
        const data = filteredClientData.map(client => [
            `"${client.name.replace(/"/g, '""')}"`,
            client.email,
            client.phone,
            client.status,
            client.totalProyekValue,
            client.balanceDue,
            client.paketTerbaru
        ]);
        downloadCSV(headers, data, `data-klien-${new Date().toISOString().split('T')[0]}.csv`);
    };
    
    const handleSaveSignature = (signatureDataUrl: string) => {
        if (documentToView?.type === 'invoice' && documentToView.project) {
            onSignInvoice(documentToView.project.id, signatureDataUrl);
        } else if (documentToView?.type === 'receipt' && documentToView.transaction) {
            onSignTransaction(documentToView.transaction.id, signatureDataUrl);
        }
        setIsSignatureModalOpen(false);
    };

    const renderDocumentBody = () => {
        if (!documentToView || !clientForDetail) return null;
        const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        
        if (documentToView.type === 'invoice') {
            const project = documentToView.project;
            const selectedPackage = packages.find(p => p.id === project.packageId);
            const remaining = project.totalCost - (project.discountAmount || 0) - project.amountPaid;
            return (
                <div id="invoice-content" className="p-1">
                    <div className="printable-content bg-slate-50 font-sans text-slate-800 printable-area">
                        <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-lg">
                            <header className="flex justify-between items-start mb-12">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-slate-900">{userProfile.companyName}</h1>
                                    <p className="text-sm text-slate-500">{userProfile.address}</p>
                                    <p className="text-sm text-slate-500">{userProfile.phone} | {userProfile.email}</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-2xl font-bold uppercase text-slate-400 tracking-widest">Invoice</h2>
                                    <p className="text-sm text-slate-500 mt-1">No: <span className="font-semibold text-slate-700">INV-{project.id.slice(-6)}</span></p>
                                    <p className="text-sm text-slate-500">Tanggal: <span className="font-semibold text-slate-700">{new Date().toLocaleDateString('id-ID')}</span></p>
                                </div>
                            </header>

                            <section className="grid md:grid-cols-3 gap-6 mb-12">
                                <div className="bg-slate-50 p-6 rounded-xl"><h3 className="text-xs font-semibold uppercase text-slate-400 mb-2">Ditagihkan Kepada</h3><p className="font-bold text-slate-800">{clientForDetail.name}</p><p className="text-sm text-slate-600">{clientForDetail.email}</p><p className="text-sm text-slate-600">{clientForDetail.phone}</p></div>
                                <div className="bg-slate-50 p-6 rounded-xl"><h3 className="text-xs font-semibold uppercase text-slate-400 mb-2">Diterbitkan Oleh</h3><p className="font-bold text-slate-800">{userProfile.companyName}</p><p className="text-sm text-slate-600">{userProfile.email}</p><p className="text-sm text-slate-600">{userProfile.phone}</p></div>
                                <div className="bg-blue-600 text-white p-6 rounded-xl printable-bg-blue printable-text-white"><h3 className="text-xs font-semibold uppercase text-blue-200 mb-2">Total Tagihan</h3><p className="font-extrabold text-3xl tracking-tight">{formatCurrency(remaining)}</p><p className="text-sm text-blue-200 mt-1">Jatuh Tempo: {formatDate(project.date)}</p></div>
                            </section>

                            <section><table className="w-full text-left">
                                <thead><tr className="border-b-2 border-slate-200"><th className="p-3 text-sm font-semibold uppercase text-slate-500">Deskripsi</th><th className="p-3 text-sm font-semibold uppercase text-slate-500 text-center">Jml</th><th className="p-3 text-sm font-semibold uppercase text-slate-500 text-right">Harga</th><th className="p-3 text-sm font-semibold uppercase text-slate-500 text-right">Total</th></tr></thead>
                                <tbody>
                                    <tr><td className="p-3 align-top"><p className="font-semibold text-slate-800">{project.packageName}</p><p className="text-xs text-slate-500">{selectedPackage?.digitalItems.join(', ')}</p></td><td className="p-3 text-center align-top">1</td><td className="p-3 text-right align-top">{formatCurrency(selectedPackage?.price || 0)}</td><td className="p-3 text-right align-top">{formatCurrency(selectedPackage?.price || 0)}</td></tr>
                                    {project.addOns.map(addon => (<tr key={addon.id}><td className="p-3 text-slate-600 align-top">- {addon.name}</td><td className="p-3 text-center align-top">1</td><td className="p-3 text-right align-top">{formatCurrency(addon.price)}</td><td className="p-3 text-right align-top">{formatCurrency(addon.price)}</td></tr>))}
                                </tbody>
                            </table></section>

                            <section className="mt-12">
                                <div className="flex justify-between">
                                    <div className="w-2/5"><h4 className="font-semibold text-slate-600">Tanda Tangan</h4>{project.invoiceSignature ? (<img src={project.invoiceSignature} alt="Tanda Tangan" className="h-20 mt-2 object-contain" />) : (<div className="h-20 mt-2 flex items-center justify-center text-xs text-slate-400 italic border border-dashed rounded-lg">Belum Ditandatangani</div>)}</div>
                                    <div className="w-2/5 space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold text-slate-800">{formatCurrency(project.totalCost)}</span></div>
                                        {project.discountAmount && project.discountAmount > 0 && (<div className="flex justify-between"><span className="text-slate-500">Diskon</span><span className="font-semibold text-green-600 print-text-green">-{formatCurrency(project.discountAmount)}</span></div>)}
                                        <div className="flex justify-between"><span className="text-slate-500">Telah Dibayar</span><span className="font-semibold text-slate-800">-{formatCurrency(project.amountPaid)}</span></div>
                                        <div className="flex justify-between font-bold text-lg text-slate-900 border-t-2 border-slate-300 pt-2 mt-2"><span>Sisa Tagihan</span><span>{formatCurrency(remaining)}</span></div>
                                    </div>
                                </div>
                            </section>
                            
                            <footer className="mt-12 pt-8 border-t-2 border-slate-200"><p className="text-xs text-slate-500 text-center">Jika Anda memiliki pertanyaan, silakan hubungi kami di {userProfile.phone}</p><div className="w-full h-2 bg-blue-600 mt-6 rounded"></div></footer>
                        </div>
                    </div>
                </div>
            );
        } else { // Receipt
            const transaction = documentToView.transaction;
            const project = projects.find(p => p.id === transaction.projectId);
             return (
                <div id="receipt-content" className="p-1">
                     <div className="printable-content bg-slate-50 font-sans text-slate-800 printable-area">
                        <div className="max-w-md mx-auto bg-white p-8 shadow-lg rounded-xl">
                            <header className="text-center mb-8"><h1 className="text-2xl font-bold text-slate-900">KWITANSI PEMBAYARAN</h1><p className="text-sm text-slate-500">{userProfile.companyName}</p></header>
                            <div className="p-4 bg-green-500/10 border border-green-200 rounded-lg text-center mb-8 printable-bg-green-light"><p className="text-sm font-semibold text-green-700 print-text-green">PEMBAYARAN DITERIMA</p><p className="text-3xl font-bold text-green-800 print-text-green mt-1">{formatCurrency(transaction.amount)}</p></div>
                            <div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">No. Kwitansi</span><span className="font-semibold text-slate-700 font-mono">{transaction.id.slice(0,12)}</span></div><div className="flex justify-between"><span className="text-slate-500">Tanggal Bayar</span><span className="font-semibold text-slate-700">{formatDate(transaction.date)}</span></div><div className="flex justify-between"><span className="text-slate-500">Diterima dari</span><span className="font-semibold text-slate-700">{clientForDetail.name}</span></div><div className="flex justify-between"><span className="text-slate-500">Metode</span><span className="font-semibold text-slate-700">{transaction.method}</span></div></div>
                            <div className="mt-6 pt-6 border-t border-slate-200"><p className="text-sm text-slate-500">Untuk pembayaran:</p><p className="font-semibold text-slate-800 mt-1">{transaction.description}</p>{project && (<div className="mt-2 text-xs text-slate-500"><p>Proyek: {project.projectName}</p><p>Total Tagihan: {formatCurrency(project.totalCost)} | Sisa: {formatCurrency(project.totalCost - project.amountPaid)}</p></div>)}</div>
                            <footer className="mt-12 flex justify-between items-end"><p className="text-xs text-slate-400">Terima kasih.</p><div className="text-center">{transaction.vendorSignature ? (<img src={transaction.vendorSignature} alt="Tanda Tangan" className="h-16 object-contain" />) : (<div className="h-16 flex items-center justify-center text-xs text-slate-400 italic border-b border-dashed">Belum Ditandatangani</div>)}<p className="text-xs font-semibold text-slate-600 mt-1">({userProfile.authorizedSigner || userProfile.companyName})</p></div></footer>
                        </div>
                    </div>
                </div>
            );
        }
    };

    const activeClients = filteredClientData.filter(c => c.status === ClientStatus.ACTIVE);
    const inactiveClients = filteredClientData.filter(c => c.status === ClientStatus.INACTIVE);
    
    const modalTitles: { [key: string]: string } = {
        active: 'Daftar Klien Aktif',
        location: 'Rincian Klien berdasarkan Lokasi',
        receivables: 'Rincian Klien dengan Tagihan',
        total: 'Daftar Semua Klien'
    };
    
    return (
        <div className="space-y-6">
            <PageHeader title="Manajemen Klien" subtitle="Kelola semua klien yang sudah ada, baik yang aktif maupun tidak aktif.">
                <div className="flex items-center gap-2">
                    <button onClick={handleDownloadClients} className="button-secondary inline-flex items-center gap-2 text-sm font-semibold"><DownloadIcon className="w-4 h-4"/>Unduh Data</button>
                    <button onClick={() => setIsBookingFormShareModalOpen(true)} className="button-secondary inline-flex items-center gap-2 text-sm font-semibold"><Share2Icon className="w-4 h-4"/>Bagikan Form Booking</button>
                    <button onClick={() => handleOpenModal('add')} className="button-primary inline-flex items-center gap-2"><PlusIcon className="w-5 h-5"/>TAMBAH KLIEN</button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div onClick={() => setActiveStatModal('active')} className="cursor-pointer transition-transform duration-200 hover:scale-105">
                    <StatCard icon={<TrendingUpIcon className="w-6 h-6"/>} title="Klien Aktif" value={clientStats.activeClients.toString()} iconBgColor="bg-green-500/20" iconColor="text-green-400" />
                 </div>
                 <div onClick={() => setActiveStatModal('location')} className="cursor-pointer transition-transform duration-200 hover:scale-105">
                    <StatCard icon={<MapPinIcon className="w-6 h-6"/>} title="Lokasi Klien Terbanyak" value={clientStats.mostFrequentLocation} iconBgColor="bg-blue-500/20" iconColor="text-blue-400" />
                 </div>
                 <div onClick={() => setActiveStatModal('receivables')} className="cursor-pointer transition-transform duration-200 hover:scale-105">
                    <StatCard icon={<AlertCircleIcon className="w-6 h-6"/>} title="Total Tagihan" value={clientStats.totalReceivables} iconBgColor="bg-red-500/20" iconColor="text-red-400" />
                 </div>
                 <div onClick={() => setActiveStatModal('total')} className="cursor-pointer transition-transform duration-200 hover:scale-105">
                    <StatCard icon={<UsersIcon className="w-6 h-6"/>} title="Total Klien" value={clientStats.totalClients.toString()} iconBgColor="bg-indigo-500/20" iconColor="text-indigo-400" />
                 </div>
            </div>

            <div className="bg-brand-surface p-4 rounded-xl shadow-lg border border-brand-border space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                <div className="input-group flex-grow !mt-0">
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field !bg-brand-bg !rounded-lg" placeholder=" " />
                    <label className="input-label">Cari klien (nama, email, telepon)...</label>
                </div>
                <div className="input-group md:w-48 !mt-0">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field !bg-brand-bg !rounded-lg">
                        <option>Semua Status</option>
                        {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <label className="input-label">Status</label>
                </div>
                <div className="flex items-center gap-2">
                    <div className="input-group flex-1 !mt-0">
                         <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field !bg-brand-bg !rounded-lg" placeholder=" " />
                         <label className="input-label">Dari Tanggal</label>
                    </div>
                     <span className="text-brand-text-secondary">-</span>
                    <div className="input-group flex-1 !mt-0">
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field !bg-brand-bg !rounded-lg" placeholder=" " />
                        <label className="input-label">Sampai Tanggal</label>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Active Clients */}
                <div className="bg-brand-surface rounded-2xl shadow-lg border border-brand-border">
                    <button onClick={() => setActiveSectionOpen(p => !p)} className="w-full flex justify-between items-center p-4">
                        <h3 className="font-semibold text-brand-text-light">Klien Aktif ({activeClients.length})</h3>
                        {activeSectionOpen ? <ArrowUpIcon className="w-5 h-5 text-brand-text-secondary"/> : <ArrowDownIcon className="w-5 h-5 text-brand-text-secondary"/>}
                    </button>
                    {activeSectionOpen && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-brand-text-secondary uppercase bg-brand-bg"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Jenis Klien</th><th className="px-4 py-3">Kontak</th><th className="px-4 py-3">Paket Terbaru</th><th className="px-4 py-3">Total Proyek</th><th className="px-4 py-3">Status Pembayaran</th><th className="px-4 py-3 text-center">Aksi</th></tr></thead>
                                <tbody className="divide-y divide-brand-border">
                                    {activeClients.map(client => (
                                        <tr key={client.id} className="hover:bg-brand-bg">
                                            <td className="px-4 py-3 font-semibold text-brand-text-light">{client.name}</td>
                                            <td className="px-4 py-3 text-brand-text-primary">{client.clientType}</td>
                                            <td className="px-4 py-3 text-brand-text-secondary">{client.email}<br/>{client.phone}</td>
                                            <td className="px-4 py-3">{client.paketTerbaru}</td>
                                            <td className="px-4 py-3 font-semibold">{formatCurrency(client.totalProyekValue)}</td>
                                            <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusClass(client.overallPaymentStatus)}`}>{client.overallPaymentStatus || 'N/A'}</span></td>
                                            <td className="px-4 py-3"><div className="flex items-center justify-center space-x-1"><button onClick={() => { setClientForDetail(client); setIsDetailModalOpen(true); }} className="p-2 text-brand-text-secondary hover:text-brand-accent rounded-full"><EyeIcon className="w-5 h-5"/></button><button onClick={() => handleOpenModal('edit', client, client.mostRecentProject || undefined)} className="p-2 text-brand-text-secondary hover:text-brand-accent rounded-full"><PencilIcon className="w-5 h-5"/></button><button onClick={() => handleDeleteClient(client.id)} className="p-2 text-brand-text-secondary hover:text-brand-danger rounded-full"><Trash2Icon className="w-5 h-5"/></button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                 {/* Inactive Clients */}
                <div className="bg-brand-surface rounded-2xl shadow-lg border border-brand-border">
                    <button onClick={() => setInactiveSectionOpen(p => !p)} className="w-full flex justify-between items-center p-4">
                        <h3 className="font-semibold text-brand-text-light">Klien Tidak Aktif ({inactiveClients.length})</h3>
                        {inactiveSectionOpen ? <ArrowUpIcon className="w-5 h-5 text-brand-text-secondary"/> : <ArrowDownIcon className="w-5 h-5 text-brand-text-secondary"/>}
                    </button>
                    {inactiveSectionOpen && (
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-brand-text-secondary uppercase bg-brand-bg"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Jenis Klien</th><th className="px-4 py-3">Kontak</th><th className="px-4 py-3">Paket Terbaru</th><th className="px-4 py-3">Total Proyek</th><th className="px-4 py-3">Status Pembayaran</th><th className="px-4 py-3 text-center">Aksi</th></tr></thead>
                                <tbody className="divide-y divide-brand-border">
                                    {inactiveClients.map(client => (
                                        <tr key={client.id} className="hover:bg-brand-bg">
                                            <td className="px-4 py-3 font-semibold text-brand-text-light">{client.name}</td>
                                            <td className="px-4 py-3 text-brand-text-primary">{client.clientType}</td>
                                            <td className="px-4 py-3 text-brand-text-secondary">{client.email}<br/>{client.phone}</td>
                                            <td className="px-4 py-3">{client.paketTerbaru}</td>
                                            <td className="px-4 py-3 font-semibold">{formatCurrency(client.totalProyekValue)}</td>
                                            <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusClass(client.overallPaymentStatus)}`}>{client.overallPaymentStatus || 'N/A'}</span></td>
                                            <td className="px-4 py-3"><div className="flex items-center justify-center space-x-1"><button onClick={() => { setClientForDetail(client); setIsDetailModalOpen(true); }} className="p-2 text-brand-text-secondary hover:text-brand-accent rounded-full"><EyeIcon className="w-5 h-5"/></button><button onClick={() => handleOpenModal('edit', client, client.mostRecentProject || undefined)} className="p-2 text-brand-text-secondary hover:text-brand-accent rounded-full"><PencilIcon className="w-5 h-5"/></button><button onClick={() => handleDeleteClient(client.id)} className="p-2 text-brand-text-secondary hover:text-brand-danger rounded-full"><Trash2Icon className="w-5 h-5"/></button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalMode === 'add' ? (selectedClient ? 'Tambah Proyek Baru' : 'Tambah Klien & Proyek Baru') : 'Edit Klien & Proyek'} size="4xl"><ClientForm formData={formData} handleFormChange={handleFormChange} handleFormSubmit={handleFormSubmit} handleCloseModal={handleCloseModal} packages={packages} addOns={addOns} userProfile={userProfile} modalMode={modalMode} cards={cards} promoCodes={promoCodes} /></Modal>}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Detail Klien: ${clientForDetail?.name}`} size="4xl">
                <ClientDetailModal 
                    client={clientForDetail}
                    projects={projects}
                    transactions={transactions}
                    contracts={contracts}
                    onClose={() => setIsDetailModalOpen(false)}
                    onEditClient={(c) => handleOpenModal('edit', c, projects.find(p=>p.clientId===c.id))}
                    onDeleteClient={handleDeleteClient}
                    onViewReceipt={(t) => { setClientForDetail(clientForDetail); setDocumentToView({type: 'receipt', transaction: t}) }}
                    onViewInvoice={(p) => { setClientForDetail(clientForDetail); setDocumentToView({type: 'invoice', project: p}) }}
                    handleNavigation={handleNavigation}
                    onRecordPayment={handleRecordPayment}
                    cards={cards}
                    onSharePortal={handleOpenQrModal}
                />
            </Modal>
            {documentToView && <Modal isOpen={!!documentToView} onClose={handleCloseModal} title={documentToView.type === 'invoice' ? `Invoice: ${documentToView.project.projectName}` : `Kwitansi: ${documentToView.transaction.id}`} size="4xl"><div className="printable-area">{renderDocumentBody()}</div><div className="mt-6 text-right non-printable space-x-2"><button type="button" onClick={() => setIsSignatureModalOpen(true)} className="button-secondary">Tanda Tangan</button><button onClick={() => window.print()} className="button-primary inline-flex items-center gap-2"><PrinterIcon className="w-4 h-4"/>Cetak</button></div></Modal>}
            {isSignatureModalOpen && <Modal isOpen={isSignatureModalOpen} onClose={() => setIsSignatureModalOpen(false)} title="Bubuhkan Tanda Tangan Anda"><SignaturePad onClose={() => setIsSignatureModalOpen(false)} onSave={handleSaveSignature} /></Modal>}
            {qrModalContent && (<Modal isOpen={!!qrModalContent} onClose={() => setQrModalContent(null)} title={qrModalContent.title} size="sm"><div className="text-center p-4"><div id="client-portal-qrcode" className="p-4 bg-white rounded-lg inline-block mx-auto"></div><p className="text-xs text-brand-text-secondary mt-4 break-all">{qrModalContent.url}</p><button onClick={() => { const canvas = document.querySelector('#client-portal-qrcode canvas') as HTMLCanvasElement; if(canvas){ const link = document.createElement('a'); link.download = 'client-portal-qr.png'; link.href = canvas.toDataURL(); link.click(); }}} className="mt-6 button-primary w-full">Unduh</button></div></Modal>)}
            {isBookingFormShareModalOpen && (
                <Modal isOpen={isBookingFormShareModalOpen} onClose={() => setIsBookingFormShareModalOpen(false)} title="Bagikan Formulir Booking Publik" size="sm">
                    <div className="text-center p-4">
                        <div id="clients-booking-form-qrcode" className="p-4 bg-white rounded-lg inline-block mx-auto"></div>
                        <p className="text-xs text-brand-text-secondary mt-4 break-all">{bookingFormUrl}</p>
                        <div className="flex items-center gap-2 mt-6">
                            <button onClick={copyBookingLinkToClipboard} className="button-secondary w-full">Salin Tautan</button>
                            <button onClick={downloadBookingQrCode} className="button-primary w-full">Unduh QR</button>
                        </div>
                    </div>
                </Modal>
            )}
            <Modal isOpen={!!activeStatModal} onClose={() => setActiveStatModal(null)} title={activeStatModal ? modalTitles[activeStatModal] : ''} size="2xl">
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {activeStatModal === 'active' && (
                        <div className="space-y-3">
                            {clients.filter(c => c.status === ClientStatus.ACTIVE).map(client => (
                                <div key={client.id} className="p-3 bg-brand-bg rounded-lg">
                                    <p className="font-semibold text-brand-text-light">{client.name}</p>
                                    <p className="text-sm text-brand-text-secondary">{client.email}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeStatModal === 'location' && (() => {
                        const locationCounts = projects.reduce((acc, p) => {
                            if (p.location) {
                                const mainLocation = p.location.split(',')[0].trim();
                                acc[mainLocation] = (acc[mainLocation] || 0) + 1;
                            }
                            return acc;
                        }, {} as Record<string, number>);
                        const sortedLocations = Object.entries(locationCounts).sort(([, a], [, b]) => b - a);

                        return (
                            <div className="space-y-3">
                                {sortedLocations.map(([location, count]) => (
                                    <div key={location} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                        <p className="font-semibold text-brand-text-light">{location}</p>
                                        <p className="text-sm font-medium text-brand-text-primary">{count} Proyek</p>
                                    </div>
                                ))}
                            </div>
                        )
                    })()}
                    {activeStatModal === 'receivables' && (
                        <div className="space-y-3">
                            {allClientData.filter(c => c.balanceDue > 0).map(client => (
                                <div key={client.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-brand-text-light">{client.name}</p>
                                    </div>
                                    <p className="font-semibold text-brand-danger">{formatCurrency(client.balanceDue)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeStatModal === 'total' && (
                         <div className="space-y-3">
                            {clients.map(client => (
                                <div key={client.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-brand-text-light">{client.name}</p>
                                        <p className="text-sm text-brand-text-secondary">{client.email}</p>
                                    </div>
                                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${client.status === ClientStatus.ACTIVE ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                        {client.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Clients;