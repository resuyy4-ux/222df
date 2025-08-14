import React, { useState, useMemo, useEffect } from 'react';
import { Lead, LeadStatus, Client, ClientStatus, Project, Package, AddOn, Transaction, TransactionType, PaymentStatus, Profile, Card, FinancialPocket, ContactChannel, PromoCode, ClientType } from '../types';
import PageHeader from './PageHeader';
import Modal from './Modal';
import { PlusIcon, PencilIcon, Trash2Icon, Share2Icon, DownloadIcon, SendIcon, UsersIcon, TargetIcon, TrendingUpIcon, CalendarIcon, MapPinIcon } from '../constants';
import StatCard from './StatCard';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const getStatusColorClass = (status: LeadStatus) => {
    switch(status) {
        case LeadStatus.DISCUSSION: return 'border-blue-500';
        case LeadStatus.FOLLOW_UP: return 'border-purple-500';
        case LeadStatus.CONVERTED: return 'border-green-500';
        default: return 'border-gray-500';
    }
}

const initialConversionFormState = {
    phone: '',
    email: '',
    instagram: '',
    projectName: '',
    projectType: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    packageId: '',
    selectedAddOnIds: [] as string[],
    dp: 0,
    dpDestinationCardId: '',
    notes: '',
    promoCodeId: '',
};

const initialNewLeadFormState = {
    name: '',
    contactChannel: ContactChannel.OTHER,
    location: '',
    notes: ''
};

interface LeadsProps {
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
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
    cards: Card[];
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
    pockets: FinancialPocket[];
    setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
    promoCodes: PromoCode[];
    setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
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

const QuickLeadForm: React.FC<{
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    userProfile: Profile;
    showNotification: (message: string) => void;
}> = ({ setLeads, userProfile, showNotification }) => {
    const [name, setName] = useState('');
    const [eventType, setEventType] = useState(userProfile.projectTypes[0] || '');
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const notes = `Hai! Terimakasih telah menghubungi #venapictures\nPerkenalkan aku Nina! (๑•ᴗ•๑)♡\nUntuk informasi mengenai pricelist dan availability, mohon mengisi data berikut ya!\nNama : ${name}\nJenis Acara : ${eventType}\nTanggal Acara : ${eventDate ? new Date(eventDate).toLocaleDateString('id-ID') : ''}\nLokasi Acara : ${eventLocation}\nChat kamu akan di balas secepatnya! Terimakasih`;

        const newLead: Lead = {
            id: `LEAD-QUICK-${Date.now()}`,
            name: name,
            contactChannel: ContactChannel.WHATSAPP,
            location: eventLocation,
            status: LeadStatus.DISCUSSION,
            date: new Date().toISOString().split('T')[0],
            notes: notes
        };
        setLeads(prev => [newLead, ...prev]);
        showNotification(`Prospek baru "${name}" ditambahkan ke kolom Sedang Diskusi.`);
        
        setName('');
        setEventType(userProfile.projectTypes[0] || '');
        setEventDate('');
        setEventLocation('');
    };

    return (
        <div className="bg-brand-surface p-6 rounded-2xl mb-6 shadow-lg border border-brand-border">
            <h3 className="text-xl font-semibold text-gradient mb-4">Input Cepat Prospek (dari WhatsApp)</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="input-group lg:col-span-1 !mt-0"><input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder=" " required /><label className="input-label">Nama</label></div>
                <div className="input-group lg:col-span-1 !mt-0"><select value={eventType} onChange={e => setEventType(e.target.value)} className="input-field" required>{userProfile.projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}</select><label className="input-label">Jenis Acara</label></div>
                <div className="input-group lg:col-span-1 !mt-0"><input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="input-field" placeholder=" " required /><label className="input-label">Tanggal Acara</label></div>
                <div className="input-group lg:col-span-1 !mt-0"><input type="text" value={eventLocation} onChange={e => setEventLocation(e.target.value)} className="input-field" placeholder=" " required /><label className="input-label">Lokasi Acara</label></div>
                <button type="submit" className="button-primary w-full lg:col-span-1">Tambah Prospek</button>
            </form>
        </div>
    );
}

const Leads: React.FC<LeadsProps> = ({
    leads, setLeads, clients, setClients, projects, setProjects, packages, addOns, transactions, setTransactions, userProfile, showNotification, cards, setCards, pockets, setPockets, promoCodes, setPromoCodes
}) => {
    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
    const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
    const [conversionForm, setConversionForm] = useState(initialConversionFormState);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newLeadForm, setNewLeadForm] = useState(initialNewLeadFormState);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isEditingLead, setIsEditingLead] = useState(false);
    const [editedLeadNotes, setEditedLeadNotes] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [followUpMessage, setFollowUpMessage] = useState('');
    const [isShareProspectFormModalOpen, setIsShareProspectFormModalOpen] = useState(false);
    const [activeStatModal, setActiveStatModal] = useState<'total' | 'converted' | 'source' | 'monthly' | 'location' | null>(null);

    const leadStats = useMemo(() => {
        const totalLeads = leads.length;
        const convertedLeadsCount = leads.filter(l => l.status === LeadStatus.CONVERTED).length;
        const conversionRate = totalLeads > 0 ? (convertedLeadsCount / totalLeads) * 100 : 0;
        
        const monthlyLeadsCount = leads.filter(l => {
            const leadDate = new Date(l.date);
            const today = new Date();
            return leadDate.getMonth() === today.getMonth() && leadDate.getFullYear() === today.getFullYear();
        }).length;

        const sourceCounts = leads.reduce((acc, lead) => {
            acc[lead.contactChannel] = (acc[lead.contactChannel] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topSource = Object.keys(sourceCounts).length > 0
            ? Object.entries(sourceCounts).sort(([,a],[,b]) => b-a)[0][0]
            : 'N/A';
            
        const allLocations = [...leads.map(l => l.location), ...projects.map(p => p.location)].filter(Boolean);
        const locationCounts = allLocations.reduce((acc, loc) => {
            const mainLocation = loc.split(',')[0].trim();
            if (mainLocation) {
                acc[mainLocation] = (acc[mainLocation] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const topLocation = Object.keys(locationCounts).length > 0
            ? Object.entries(locationCounts).sort(([,a],[,b]) => b-a)[0][0]
            : 'N/A';

        const sortedLocations = Object.entries(locationCounts).sort(([, a], [, b]) => b - a);

        return { totalLeads, convertedLeadsCount, conversionRate, monthlyLeadsCount, topSource, topLocation, sourceCounts, sortedLocations };
    }, [leads, projects]);

    const statusOrder = [
        LeadStatus.DISCUSSION,
        LeadStatus.FOLLOW_UP,
        LeadStatus.CONVERTED,
    ];

    const bookingFormUrl = useMemo(() => {
        return `${window.location.origin}${window.location.pathname}#/public-booking`;
    }, []);
    
    const prospectFormUrl = useMemo(() => {
        return `${window.location.origin}${window.location.pathname}#/public-lead-form`;
    }, []);

    const parsePhoneNumber = (notes: string | undefined): string | null => {
        if (!notes) return null;
        // Regex to find Indonesian phone numbers (e.g., 08..., +628...)
        const regex = /(\+62|0)8[1-9][0-9]{7,10}/g;
        const match = notes.match(regex);
    
        if (match && match[0]) {
            let number = match[0].replace(/\D/g, ''); // Remove non-digits
            // Convert 08... to 628...
            if (number.startsWith('0')) {
                return `62${number.substring(1)}`;
            }
            return number; // Already has country code
        }
        return null;
    };

    const handleOpenLeadDetail = (lead: Lead) => {
        setSelectedLead(lead);
        setEditedLeadNotes(lead.notes || '');
        if (lead.status === LeadStatus.FOLLOW_UP) {
            const defaultMessage = `Halo ${lead.name},\n\nMenindaklanjuti diskusi kita sebelumnya.\n\nJika Anda sudah siap untuk melanjutkan pemesanan, Anda dapat mengisi formulir booking kami melalui tautan berikut:\n${bookingFormUrl}\n\nJangan ragu untuk bertanya jika ada hal lain yang bisa kami bantu.\n\nTerima kasih,\nVena Pictures`;
            setFollowUpMessage(defaultMessage);
        }
        setIsDetailModalOpen(true);
        setIsEditingLead(false);
    };

    const handleFollowUpClick = (lead: Lead) => {
        const phoneNumber = parsePhoneNumber(lead.notes);
    
        if (phoneNumber) {
            // If number found, generate message and open WhatsApp directly
            const message = `Halo ${lead.name},\n\nMenindaklanjuti diskusi kita sebelumnya.\n\nJika Anda sudah siap untuk melanjutkan pemesanan, Anda dapat mengisi formulir booking kami melalui tautan berikut:\n${bookingFormUrl}\n\nJangan ragu untuk bertanya jika ada hal lain yang bisa kami bantu.\n\nTerima kasih,\nVena Pictures`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            showNotification('Membuka WhatsApp untuk follow up.');
        } else {
            // If not found, open the detail modal to show the template editor
            handleOpenLeadDetail(lead);
        }
    };

    const handleMoveToFollowUp = (leadId: string) => {
        setLeads(prev => prev.map(l => 
            l.id === leadId ? { ...l, status: LeadStatus.FOLLOW_UP } : l
        ));
        showNotification('Prospek dipindahkan ke "Menunggu Follow Up".');
    };

    useEffect(() => {
        if (isShareProspectFormModalOpen) {
            const qrCodeContainer = document.getElementById('leads-prospect-form-qrcode');
            if (qrCodeContainer && typeof (window as any).QRCode !== 'undefined') {
                qrCodeContainer.innerHTML = '';
                new (window as any).QRCode(qrCodeContainer, {
                    text: prospectFormUrl,
                    width: 200,
                    height: 200,
                    colorDark: "#020617",
                    colorLight: "#ffffff",
                    correctLevel: 2 // H
                });
            }
        }
    }, [isShareProspectFormModalOpen, prospectFormUrl]);
    
    const copyProspectFormLinkToClipboard = () => {
        navigator.clipboard.writeText(prospectFormUrl).then(() => {
            showNotification('Tautan formulir prospek berhasil disalin!');
            setIsShareProspectFormModalOpen(false);
        });
    };
    
    const downloadProspectQrCode = () => {
        const canvas = document.querySelector('#leads-prospect-form-qrcode canvas') as HTMLCanvasElement;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'form-prospek-qr.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, leadId: string) => {
        e.dataTransfer.setData("leadId", leadId);
        setDraggedLeadId(leadId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: LeadStatus) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData("leadId");
        const lead = leads.find(l => l.id === leadId);

        if (lead && lead.status !== newStatus) {
            if (newStatus === LeadStatus.CONVERTED) {
                setLeadToConvert(lead);
                setConversionForm(prev => ({...prev, projectName: `Proyek ${lead.name}`, location: lead.location, projectType: userProfile.projectTypes[0]}));
            } else {
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
            }
        }
        setDraggedLeadId(null);
    };
    
    const handleConversionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { id, checked } = e.target as HTMLInputElement;
            setConversionForm(prev => ({ ...prev, selectedAddOnIds: checked ? [...prev.selectedAddOnIds, id] : prev.selectedAddOnIds.filter(addOnId => addOnId !== id) }));
        } else {
            setConversionForm(prev => ({ ...prev, [name]: (name === 'dp') ? Number(value) : value }));
        }
    };
    
    const handleConvertLead = (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadToConvert) return;
        
        const selectedPackage = packages.find(p => p.id === conversionForm.packageId);
        if (!selectedPackage) { alert("Harap pilih paket layanan."); return; }
        
        const selectedAddOns = addOns.filter(addon => conversionForm.selectedAddOnIds.includes(addon.id));
        const totalBeforeDiscount = selectedPackage.price + selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
        
        let finalDiscountAmount = 0;
        const promoCode = promoCodes.find(p => p.id === conversionForm.promoCodeId);
        if (promoCode) {
            if (promoCode.discountType === 'percentage') {
                finalDiscountAmount = (totalBeforeDiscount * promoCode.discountValue) / 100;
            } else {
                finalDiscountAmount = promoCode.discountValue;
            }
        }
        const totalProject = totalBeforeDiscount - finalDiscountAmount;
        const remainingPayment = totalProject - conversionForm.dp;

        const newClientId = `CLI${Date.now()}`;
        const newClient: Client = {
            id: newClientId, name: leadToConvert.name, email: conversionForm.email, phone: conversionForm.phone,
            instagram: conversionForm.instagram, since: new Date().toISOString().split('T')[0], status: ClientStatus.ACTIVE,
            clientType: ClientType.DIRECT,
            lastContact: new Date().toISOString(),
            portalAccessId: crypto.randomUUID(),
        };

        const physicalItemsFromPackage = selectedPackage.physicalItems.map((item, index) => ({
            id: `pi-${Date.now()}-${index}`,
            type: 'Custom' as 'Custom',
            customName: item.name,
            details: item.name,
            cost: item.price,
        }));

        const printingCostFromPackage = physicalItemsFromPackage.reduce((sum, item) => sum + item.cost, 0);

        const newProject: Project = {
            id: `PRJ${Date.now()}`, projectName: conversionForm.projectName, clientName: newClient.name, clientId: newClient.id,
            projectType: conversionForm.projectType, packageName: selectedPackage.name, packageId: selectedPackage.id,
            addOns: selectedAddOns, date: conversionForm.date, location: conversionForm.location, progress: 0,
            status: 'Dikonfirmasi', totalCost: totalProject, amountPaid: conversionForm.dp,
            paymentStatus: conversionForm.dp > 0 ? (remainingPayment <= 0 ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR) : PaymentStatus.BELUM_BAYAR,
            team: [], notes: conversionForm.notes,
            promoCodeId: conversionForm.promoCodeId || undefined,
            discountAmount: finalDiscountAmount > 0 ? finalDiscountAmount : undefined,
            printingDetails: physicalItemsFromPackage,
            printingCost: printingCostFromPackage,
            completedDigitalItems: [],
        };

        setClients(prev => [newClient, ...prev]);
        setProjects(prev => [newProject, ...prev]);
        setLeads(prev => prev.map(l => l.id === leadToConvert.id ? { ...l, status: LeadStatus.CONVERTED } : l));

        if (newProject.amountPaid > 0) {
            const newTransaction: Transaction = {
                id: `TRN-DP-${newProject.id}`, date: new Date().toISOString().split('T')[0], description: `DP Proyek ${newProject.projectName}`,
                amount: newProject.amountPaid, type: TransactionType.INCOME, projectId: newProject.id, category: 'DP Proyek',
                method: 'Transfer Bank', cardId: conversionForm.dpDestinationCardId,
            };
            setTransactions(prev => [...prev, newTransaction].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setCards(prev => prev.map(c => c.id === conversionForm.dpDestinationCardId ? { ...c, balance: c.balance + newProject.amountPaid } : c));
        }

        if (promoCode) {
            setPromoCodes(prev => prev.map(p => p.id === promoCode.id ? { ...p, usageCount: p.usageCount + 1 } : p));
        }
        
        showNotification(`Prospek berhasil dikonversi menjadi klien baru.`);
        setLeadToConvert(null);
        setConversionForm(initialConversionFormState);
    };
    
    const handleNewLeadFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewLeadForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newLead: Lead = {
            id: `LEAD-MANUAL-${Date.now()}`,
            name: newLeadForm.name,
            contactChannel: newLeadForm.contactChannel,
            location: newLeadForm.location,
            status: LeadStatus.DISCUSSION,
            date: new Date().toISOString().split('T')[0],
            notes: newLeadForm.notes,
        };
        setLeads(prev => [newLead, ...prev]);
        setIsAddModalOpen(false);
        setNewLeadForm(initialNewLeadFormState);
        showNotification(`Prospek baru "${newLead.name}" berhasil ditambahkan.`);
    };

    const handleCloseLeadDetail = () => {
        setIsDetailModalOpen(false);
        setSelectedLead(null);
    };
    
    const handleUpdateLead = () => {
        if (!selectedLead) return;
        const updatedLead = { ...selectedLead, notes: editedLeadNotes };
        setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
        showNotification("Prospek berhasil diperbarui.");
        setIsEditingLead(false);
        setSelectedLead(updatedLead);
    };
    
    const handleDeleteLead = (leadId: string) => {
        if (window.confirm("Yakin ingin menghapus prospek ini secara permanen?")) {
            setLeads(prev => prev.filter(l => l.id !== leadId));
            handleCloseLeadDetail();
            showNotification("Prospek berhasil dihapus.");
        }
    };
    
    const handleTriggerConversion = () => {
        if (!selectedLead) return;
        setLeadToConvert(selectedLead);
        setConversionForm(prev => ({ ...prev, projectName: `Proyek ${selectedLead.name}`, location: selectedLead.location }));
        handleCloseLeadDetail();
    };

    const handleShareFollowUp = () => {
        if (!selectedLead) return;
        const phoneNumber = parsePhoneNumber(selectedLead.notes);
        if (phoneNumber) {
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(followUpMessage)}`;
            window.open(whatsappUrl, '_blank');
            showNotification('Membuka WhatsApp untuk follow up.');
        } else {
            navigator.clipboard.writeText(followUpMessage).then(() => {
                showNotification('Nomor WhatsApp tidak ditemukan. Pesan disalin ke clipboard.');
            });
        }
        handleCloseLeadDetail();
    };

    const handleDownloadLeads = () => {
        const headers = ['Nama', 'Sumber Kontak', 'Lokasi', 'Status', 'Tanggal Kontak', 'Catatan'];
        const data = leads.map(lead => [
            `"${lead.name.replace(/"/g, '""')}"`,
            lead.contactChannel,
            lead.location,
            lead.status,
            new Date(lead.date).toLocaleDateString('id-ID'),
            `"${(lead.notes || '').replace(/"/g, '""')}"`
        ]);
        downloadCSV(headers, data, `data-prospek-${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Manajemen Prospek" subtitle="Lacak dan kelola semua prospek potensial Anda dalam satu papan.">
                 <div className="flex items-center gap-2">
                    <button onClick={handleDownloadLeads} className="button-secondary inline-flex items-center gap-2">
                        <DownloadIcon className="w-4 h-4"/> Unduh Data
                    </button>
                    <button onClick={() => setIsShareProspectFormModalOpen(true)} className="button-secondary inline-flex items-center gap-2">
                        <Share2Icon className="w-4 h-4" /> Bagikan Form Prospek
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="button-primary inline-flex items-center gap-2"><PlusIcon className="w-5 h-5" /> Tambah Manual</button>
                </div>
            </PageHeader>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
                <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '100ms' }} onClick={() => setActiveStatModal('total')}>
                    <StatCard icon={<UsersIcon className="w-6 h-6"/>} title="Total Prospek" value={leadStats.totalLeads.toString()} iconBgColor="bg-blue-500/20" iconColor="text-blue-400" />
                </div>
                <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '200ms' }} onClick={() => setActiveStatModal('converted')}>
                    <StatCard icon={<TargetIcon className="w-6 h-6"/>} title="Tingkat Konversi" value={`${leadStats.conversionRate.toFixed(1)}%`} subtitle={`${leadStats.convertedLeadsCount} dikonversi`} iconBgColor="bg-green-500/20" iconColor="text-green-400" />
                </div>
                <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '300ms' }} onClick={() => setActiveStatModal('source')}>
                    <StatCard icon={<TrendingUpIcon className="w-6 h-6"/>} title="Sumber Teratas" value={leadStats.topSource} iconBgColor="bg-indigo-500/20" iconColor="text-indigo-400" />
                </div>
                <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '400ms' }} onClick={() => setActiveStatModal('monthly')}>
                    <StatCard icon={<CalendarIcon className="w-6 h-6"/>} title="Prospek Bulan Ini" value={leadStats.monthlyLeadsCount.toString()} iconBgColor="bg-yellow-500/20" iconColor="text-yellow-400" />
                </div>
                 <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '500ms' }} onClick={() => setActiveStatModal('location')}>
                    <StatCard icon={<MapPinIcon className="w-6 h-6"/>} title="Lokasi Teratas" value={leadStats.topLocation} iconBgColor="bg-fuchsia-500/20" iconColor="text-fuchsia-400" />
                </div>
            </div>

            <QuickLeadForm setLeads={setLeads} userProfile={userProfile} showNotification={showNotification} />

            <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 widget-animate" style={{ animationDelay: '500ms' }}>
                {statusOrder.map((status) => (
                    <div 
                        key={status} 
                        className="w-80 flex-shrink-0 bg-brand-bg rounded-2xl border border-brand-border"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                    >
                        <div className={`p-4 font-semibold text-brand-text-light border-b-2 ${getStatusColorClass(status)} flex justify-between items-center sticky top-0 bg-brand-bg/80 backdrop-blur-sm rounded-t-2xl z-10`}>
                            <span>{status}</span>
                            <span className="text-sm font-normal bg-brand-surface text-brand-text-secondary px-2.5 py-1 rounded-full">{leads.filter(l => l.status === status).length}</span>
                        </div>
                        <div className="p-3 space-y-3 h-[calc(100vh-500px)] overflow-y-auto">
                            {leads.filter(l => l.status === status).map((lead) => (
                                <div
                                    key={lead.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, lead.id)}
                                    onClick={() => handleOpenLeadDetail(lead)}
                                    className={`p-4 bg-brand-surface rounded-xl cursor-pointer hover:shadow-xl transition-shadow border-l-4 shadow-lg ${draggedLeadId === lead.id ? 'opacity-50 ring-2 ring-brand-accent' : 'opacity-100'}`}
                                    style={{ borderLeftColor: getStatusColorClass(lead.status).replace('border-','') }}
                                >
                                    <p className="font-semibold text-sm text-brand-text-light">{lead.name}</p>
                                    <p className="text-xs text-brand-text-secondary mt-1">{lead.contactChannel}</p>
                                    {lead.notes && (
                                        <p className="text-xs text-brand-text-primary mt-2 pt-2 border-t border-brand-border italic truncate">
                                            "{lead.notes.split('\n')[4]}"
                                        </p>
                                    )}
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-xs text-brand-text-secondary">{lead.location}</span>
                                        {lead.status === LeadStatus.DISCUSSION && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleMoveToFollowUp(lead.id); }} 
                                                className="text-xs font-semibold text-brand-accent hover:underline inline-flex items-center gap-1"
                                                title="Pindahkan ke Menunggu Follow Up"
                                            >
                                                Follow Up <SendIcon className="w-4 h-4"/>
                                            </button>
                                        )}
                                        {lead.status === LeadStatus.FOLLOW_UP && (
                                            <button onClick={(e) => { e.stopPropagation(); handleFollowUpClick(lead);}} className="p-1.5 bg-brand-input rounded-full text-brand-accent hover:bg-brand-accent/20" title="Kirim Pesan Follow Up"><SendIcon className="w-4 h-4"/></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

             {isAddModalOpen && (
                <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Prospek Manual">
                    <form onSubmit={handleAddLeadSubmit} className="space-y-4">
                        <div className="input-group">
                            <input type="text" id="newLeadName" name="name" value={newLeadForm.name} onChange={handleNewLeadFormChange} className="input-field" placeholder=" " required />
                            <label htmlFor="newLeadName" className="input-label">Nama Prospek</label>
                        </div>
                        <div className="input-group">
                            <select id="newLeadContactChannel" name="contactChannel" value={newLeadForm.contactChannel} onChange={handleNewLeadFormChange} className="input-field" required>
                                {Object.values(ContactChannel)
                                    .filter(c => c !== ContactChannel.SUGGESTION_FORM)
                                    .map(channel => (
                                        <option key={channel} value={channel}>{channel}</option>
                                    ))
                                }
                            </select>
                            <label htmlFor="newLeadContactChannel" className="input-label">Sumber Prospek</label>
                        </div>
                        <div className="input-group">
                            <input type="text" id="newLeadLocation" name="location" value={newLeadForm.location} onChange={handleNewLeadFormChange} className="input-field" placeholder=" " required />
                            <label htmlFor="newLeadLocation" className="input-label">Lokasi (e.g., Kota)</label>
                        </div>
                        <div className="input-group">
                            <textarea id="newLeadNotes" name="notes" value={newLeadForm.notes} onChange={handleNewLeadFormChange} className="input-field" placeholder=" " rows={3}></textarea>
                            <label htmlFor="newLeadNotes" className="input-label">Catatan (Kontak, dll.)</label>
                        </div>
                        <div className="flex justify-end items-center gap-3 pt-6 border-t border-brand-border">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="button-secondary">Batal</button>
                            <button type="submit" className="button-primary">Simpan Prospek</button>
                        </div>
                    </form>
                </Modal>
            )}

            {isDetailModalOpen && selectedLead && (
                <Modal isOpen={isDetailModalOpen} onClose={handleCloseLeadDetail} title={`Detail Prospek: ${selectedLead.name}`}>
                    {isEditingLead ? (
                        <div className="space-y-4">
                            <div className="input-group">
                                <textarea 
                                    id="leadNotes" 
                                    rows={5} 
                                    value={editedLeadNotes} 
                                    onChange={(e) => setEditedLeadNotes(e.target.value)} 
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label htmlFor="leadNotes" className="input-label">Catatan Prospek</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                                <button type="button" onClick={() => setIsEditingLead(false)} className="button-secondary">Batal</button>
                                <button type="button" onClick={handleUpdateLead} className="button-primary">Simpan Catatan</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p><strong>Nama:</strong> {selectedLead.name}</p>
                            <p><strong>Sumber Kontak:</strong> {selectedLead.contactChannel}</p>
                            <p><strong>Lokasi:</strong> {selectedLead.location}</p>
                            <p><strong>Tanggal Kontak:</strong> {new Date(selectedLead.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <div>
                                <strong>Catatan:</strong>
                                <div className="mt-1 p-3 bg-brand-bg rounded-md text-sm text-brand-text-primary whitespace-pre-wrap max-h-40 overflow-y-auto">
                                    {selectedLead.notes || 'Tidak ada catatan.'}
                                </div>
                            </div>
                            
                            {selectedLead.status === LeadStatus.FOLLOW_UP && (
                                <div className="pt-4 mt-4 border-t border-brand-border">
                                    <h4 className="text-base font-semibold text-brand-text-light mb-2">Pesan Follow Up</h4>
                                    <div className="input-group">
                                        <textarea 
                                            id="followUpMessage" 
                                            rows={8} 
                                            value={followUpMessage}
                                            onChange={(e) => setFollowUpMessage(e.target.value)}
                                            className="input-field" 
                                            placeholder=" "
                                        />
                                        <label htmlFor="followUpMessage" className="input-label">Edit Pesan Template</label>
                                    </div>
                                    <div className="flex justify-end items-center gap-3 pt-4">
                                        <button type="button" onClick={handleShareFollowUp} className="button-primary inline-flex items-center gap-2">
                                            <SendIcon className="w-4 h-4" /> Bagikan
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-6 border-t border-brand-border">
                                <div>
                                    <button type="button" onClick={() => setIsEditingLead(true)} className="button-secondary inline-flex items-center gap-2"><PencilIcon className="w-4 h-4" /> Edit</button>
                                    <button type="button" onClick={() => handleDeleteLead(selectedLead.id)} className="button-secondary !text-brand-danger ml-2 inline-flex items-center gap-2"><Trash2Icon className="w-4 h-4" /> Hapus</button>
                                </div>
                                {selectedLead.status !== LeadStatus.CONVERTED && (
                                    <button type="button" onClick={handleTriggerConversion} className="button-primary">Konversi menjadi Klien</button>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            )}

            {leadToConvert && (
                <Modal isOpen={!!leadToConvert} onClose={() => setLeadToConvert(null)} title={`Konversi Prospek: ${leadToConvert.name}`} size="3xl">
                    <form onSubmit={handleConvertLead}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2">Detail Kontak & Proyek</h4>
                                <div className="input-group"><input type="tel" id="phone" name="phone" value={conversionForm.phone} onChange={handleConversionFormChange} className="input-field" placeholder=" " required/><label htmlFor="phone" className="input-label">Nomor Telepon</label></div>
                                <div className="input-group"><input type="email" id="email" name="email" value={conversionForm.email} onChange={handleConversionFormChange} className="input-field" placeholder=" " required/><label htmlFor="email" className="input-label">Email</label></div>
                                <div className="input-group"><input type="text" id="projectName" name="projectName" value={conversionForm.projectName} onChange={handleConversionFormChange} className="input-field" placeholder=" " required/><label htmlFor="projectName" className="input-label">Nama Proyek</label></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="input-group"><select id="projectType" name="projectType" value={conversionForm.projectType} onChange={handleConversionFormChange} className="input-field" required><option value="" disabled>Pilih Jenis...</option>{userProfile.projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}</select><label htmlFor="projectType" className="input-label">Jenis Proyek</label></div>
                                    <div className="input-group"><input type="date" id="date" name="date" value={conversionForm.date} onChange={handleConversionFormChange} className="input-field" placeholder=" "/><label htmlFor="date" className="input-label">Tanggal Acara</label></div>
                                </div>
                                <div className="input-group"><input type="text" id="location" name="location" value={conversionForm.location} onChange={handleConversionFormChange} className="input-field" placeholder=" "/><label htmlFor="location" className="input-label">Lokasi</label></div>
                            </div>
                            {/* Right Column */}
                             <div className="space-y-4">
                                <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2">Paket & Pembayaran</h4>
                                <div className="input-group"><select id="packageId" name="packageId" value={conversionForm.packageId} onChange={handleConversionFormChange} className="input-field" required><option value="">Pilih paket...</option>{packages.map(p => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}</select><label htmlFor="packageId" className="input-label">Paket</label></div>
                                <div className="input-group"><label className="input-label !static !-top-4 !text-brand-accent">Add-On</label><div className="p-2 border border-brand-border bg-brand-bg rounded-lg max-h-24 overflow-y-auto space-y-1 mt-2">{addOns.map(addon => (<label key={addon.id} className="flex items-center justify-between p-1 rounded-md hover:bg-brand-input cursor-pointer"><span className="text-sm">{addon.name}</span><input type="checkbox" id={addon.id} name="addOns" checked={conversionForm.selectedAddOnIds.includes(addon.id)} onChange={handleConversionFormChange} /></label>))}</div></div>
                                <div className="input-group"><select id="promoCodeId" name="promoCodeId" value={conversionForm.promoCodeId} onChange={handleConversionFormChange} className="input-field"><option value="">Tanpa Kode Promo</option>{promoCodes.filter(p => p.isActive).map(p => (<option key={p.id} value={p.id}>{p.code} - ({p.discountType === 'percentage' ? `${p.discountValue}%` : formatCurrency(p.discountValue)})</option>))}</select><label htmlFor="promoCodeId" className="input-label">Kode Promo</label></div>
                                <div className="input-group"><input type="number" name="dp" id="dp" value={conversionForm.dp} onChange={handleConversionFormChange} className="input-field" placeholder=" "/><label htmlFor="dp" className="input-label">Uang DP</label></div>
                                {conversionForm.dp > 0 && (<div className="input-group"><select name="dpDestinationCardId" value={conversionForm.dpDestinationCardId} onChange={handleConversionFormChange} className="input-field" required><option value="">Setor DP ke...</option>{cards.map(c => <option key={c.id} value={c.id}>{c.bankName} **** {c.lastFourDigits}</option>)}</select><label htmlFor="dpDestinationCardId" className="input-label">Kartu Tujuan</label></div>)}
                            </div>
                        </div>
                        <div className="flex justify-end items-center gap-3 pt-6 mt-6 border-t border-brand-border">
                            <button type="button" onClick={() => setLeadToConvert(null)} className="button-secondary">Batal</button>
                            <button type="submit" className="button-primary">Konversi menjadi Klien</button>
                        </div>
                    </form>
                </Modal>
            )}

            {isShareProspectFormModalOpen && (
                <Modal isOpen={isShareProspectFormModalOpen} onClose={() => setIsShareProspectFormModalOpen(false)} title="Bagikan Formulir Prospek" size="sm">
                    <div className="text-center p-4">
                        <div id="leads-prospect-form-qrcode" className="p-4 bg-white rounded-lg inline-block mx-auto"></div>
                        <p className="text-xs text-brand-text-secondary mt-4 break-all">{prospectFormUrl}</p>
                        <div className="flex items-center gap-2 mt-6">
                            <button onClick={copyProspectFormLinkToClipboard} className="button-secondary w-full">Salin Tautan</button>
                            <button onClick={downloadProspectQrCode} className="button-primary w-full">Unduh QR</button>
                        </div>
                    </div>
                </Modal>
            )}
             <Modal isOpen={!!activeStatModal} onClose={() => setActiveStatModal(null)} title={
                activeStatModal === 'total' ? 'Semua Prospek' :
                activeStatModal === 'converted' ? 'Prospek Terkonversi' :
                activeStatModal === 'source' ? 'Rincian Sumber Prospek' :
                activeStatModal === 'monthly' ? 'Prospek Bulan Ini' :
                'Daftar Semua Lokasi'
            } size="2xl">
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {activeStatModal === 'source' ? (
                        <div className="space-y-3">
                            {Object.entries(leadStats.sourceCounts).sort(([,a],[,b]) => b-a).map(([source, count]) => (
                                <div key={source} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                    <p className="font-semibold text-brand-text-light">{source}</p>
                                    <p className="text-sm font-medium text-brand-text-primary">{count} Prospek</p>
                                </div>
                            ))}
                        </div>
                    ) : activeStatModal === 'location' ? (
                        <div className="space-y-3">
                            {leadStats.sortedLocations.length > 0 ? leadStats.sortedLocations.map(([location, count]) => (
                                <div key={location} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                    <p className="font-semibold text-brand-text-light">{location}</p>
                                    <p className="text-sm font-medium text-brand-text-primary">{count} Prospek/Klien</p>
                                </div>
                            )) : <p className="text-center text-brand-text-secondary py-8">Tidak ada data lokasi.</p>}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leads.filter(lead => {
                                if (activeStatModal === 'total') return true;
                                if (activeStatModal === 'converted') return lead.status === LeadStatus.CONVERTED;
                                if (activeStatModal === 'monthly') {
                                    const leadDate = new Date(lead.date);
                                    const today = new Date();
                                    return leadDate.getMonth() === today.getMonth() && leadDate.getFullYear() === today.getFullYear();
                                }
                                return false;
                            }).map(lead => (
                                <div key={lead.id} className="p-3 bg-brand-bg rounded-lg">
                                    <p className="font-semibold text-brand-text-light">{lead.name}</p>
                                    <p className="text-sm text-brand-text-secondary">{lead.contactChannel} - {new Date(lead.date).toLocaleDateString('id-ID')}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Leads;