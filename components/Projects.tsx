

import React, { useState, useMemo, useEffect } from 'react';
import { Project, PaymentStatus, TeamMember, Client, Package, TeamProjectPayment, Transaction, TransactionType, AssignedTeamMember, Profile, Revision, RevisionStatus, NavigationAction, AddOn, PrintingItem, Card, ProjectStatusConfig, SubStatusConfig } from '../types';
import PageHeader from './PageHeader';
import Modal from './Modal';
import StatCard from './StatCard';
import { EyeIcon, PlusIcon, PencilIcon, Trash2Icon, ListIcon, LayoutGridIcon, FolderKanbanIcon, AlertCircleIcon, CalendarIcon, CheckSquareIcon, Share2Icon, ClockIcon, UsersIcon, ArrowDownIcon, ArrowUpIcon, FileTextIcon, SendIcon, CheckCircleIcon, ClipboardListIcon } from '../constants';

const getPaymentStatusClass = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.LUNAS: return 'bg-brand-success/20 text-brand-success';
        case PaymentStatus.DP_TERBAYAR: return 'bg-blue-500/20 text-blue-400';
        case PaymentStatus.BELUM_BAYAR: return 'bg-yellow-500/20 text-yellow-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};

const getRevisionStatusClass = (status: RevisionStatus) => {
    switch (status) {
        case RevisionStatus.COMPLETED: return 'bg-green-500/20 text-green-400';
        case RevisionStatus.IN_PROGRESS: return 'bg-blue-500/20 text-blue-400';
        case RevisionStatus.PENDING: return 'bg-yellow-500/20 text-yellow-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const getSubStatusText = (project: Project): string => {
    if (project.activeSubStatuses && project.activeSubStatuses.length > 0) {
        return project.activeSubStatuses.join(', ');
    }
    if (project.status === 'Dikirim' && project.shippingDetails) {
        return `Dikirim: ${project.shippingDetails}`;
    }
    return project.status;
};

const getStatusColor = (status: string, config: ProjectStatusConfig[]): string => {
    const statusConfig = config.find(c => c.name === status);
    return statusConfig ? statusConfig.color : '#64748b'; // slate-500 default
};

const getStatusClass = (status: string, config: ProjectStatusConfig[]) => {
    const color = getStatusColor(status, config);
     const colorMap: { [key: string]: string } = {
        '#10b981': 'bg-green-500/20 text-green-400', // Selesai
        '#3b82f6': 'bg-blue-500/20 text-blue-400', // Dikonfirmasi
        '#8b5cf6': 'bg-purple-500/20 text-purple-400', // Editing
        '#f97316': 'bg-orange-500/20 text-orange-400', // Cetak
        '#06b6d4': 'bg-cyan-500/20 text-cyan-400', // Dikirim
        '#eab308': 'bg-yellow-500/20 text-yellow-400', // Tertunda
        '#6366f1': 'bg-indigo-500/20 text-indigo-400', // Persiapan
        '#ef4444': 'bg-red-500/20 text-red-400', // Dibatalkan
        '#14b8a6': 'bg-teal-500/20 text-teal-400', // Revisi
    };
    return colorMap[color] || 'bg-gray-500/20 text-gray-400';
};

const ConfirmationIcons: React.FC<{ project: Project }> = ({ project }) => (
    <div className="flex items-center gap-1.5">
        {project.isEditingConfirmedByClient && <span title="Editing dikonfirmasi klien"><CheckCircleIcon className="w-4 h-4 text-green-500" /></span>}
        {project.isPrintingConfirmedByClient && <span title="Cetak dikonfirmasi klien"><CheckCircleIcon className="w-4 h-4 text-green-500" /></span>}
        {project.isDeliveryConfirmedByClient && <span title="Pengiriman dikonfirmasi klien"><CheckCircleIcon className="w-4 h-4 text-green-500" /></span>}
    </div>
);


interface ProjectListViewProps {
    projects: Project[];
    handleOpenDetailModal: (project: Project) => void;
    handleOpenForm: (mode: 'edit', project: Project) => void;
    handleProjectDelete: (projectId: string) => void;
    config: ProjectStatusConfig[];
}

const ProjectListView: React.FC<ProjectListViewProps> = ({ projects, handleOpenDetailModal, handleOpenForm, handleProjectDelete, config }) => {
    
    const ProgressBar: React.FC<{ progress: number, status: string, config: ProjectStatusConfig[] }> = ({ progress, status, config }) => (
        <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: getStatusColor(status, config) }}></div>
        </div>
    );
    
    return (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-brand-text-secondary uppercase">
                <tr>
                    <th className="px-6 py-4 font-medium tracking-wider">Nama Proyek</th>
                    <th className="px-6 py-4 font-medium tracking-wider">Klien</th>
                    <th className="px-6 py-4 font-medium tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 font-medium tracking-wider min-w-[200px]">Progress</th>
                    <th className="px-6 py-4 font-medium tracking-wider">Tim</th>
                    <th className="px-6 py-4 font-medium tracking-wider text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
                {projects.map(p => (
                    <tr key={p.id} className="hover:bg-brand-bg transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-brand-text-light">{p.projectName}</p>
                                <ConfirmationIcons project={p} />
                            </div>
                            <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusClass(p.status, config)}`}>
                                {getSubStatusText(p)}
                            </p>
                        </td>
                        <td className="px-6 py-4 text-brand-text-primary">{p.clientName}</td>
                        <td className="px-6 py-4 text-brand-text-primary">{new Date(p.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <ProgressBar progress={p.progress} status={p.status} config={config} />
                                <span className="text-xs font-semibold text-brand-text-secondary">{p.progress}%</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-brand-text-primary">{p.team.map(t => t.name.split(' ')[0]).join(', ') || '-'}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-1">
                                <button onClick={() => handleOpenDetailModal(p)} className="p-2 text-brand-text-secondary hover:bg-gray-700/50 rounded-full" title="Detail Proyek"><EyeIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleOpenForm('edit', p)} className="p-2 text-brand-text-secondary hover:bg-gray-700/50 rounded-full" title="Edit Proyek"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleProjectDelete(p.id)} className="p-2 text-brand-text-secondary hover:bg-gray-700/50 rounded-full" title="Hapus Proyek"><Trash2Icon className="w-5 h-5"/></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {projects.length === 0 && <p className="text-center py-8 text-sm text-brand-text-secondary">Tidak ada proyek dalam kategori ini.</p>}
    </div>
    );
};

interface ProjectKanbanViewProps {
    projects: Project[];
    handleOpenDetailModal: (project: Project) => void;
    draggedProjectId: string | null;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, projectId: string) => void;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>, newStatus: string) => void;
    config: ProjectStatusConfig[];
}

const ProjectKanbanView: React.FC<ProjectKanbanViewProps> = ({ projects, handleOpenDetailModal, draggedProjectId, handleDragStart, handleDragOver, handleDrop, config }) => {
    
    const ProgressBar: React.FC<{ progress: number, status: string, config: ProjectStatusConfig[] }> = ({ progress, status, config }) => (
        <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: getStatusColor(status, config) }}></div>
        </div>
    );
    
    return (
    <div className="flex gap-6 overflow-x-auto pb-4">
        {config
            .filter(statusConfig => statusConfig.name !== 'Dibatalkan')
            .map(statusConfig => {
                const status = statusConfig.name;
                return (
                    <div 
                        key={status} 
                        className="w-80 flex-shrink-0 bg-brand-bg rounded-2xl border border-brand-border"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                    >
                        <div className="p-4 font-semibold text-brand-text-light border-b border-gray-700 flex justify-between items-center sticky top-0 bg-brand-bg/80 backdrop-blur-sm rounded-t-2xl z-10" style={{ borderBottomColor: getStatusColor(status, config) }}>
                            <span>{status}</span>
                            <span className="text-sm font-normal bg-brand-surface text-brand-text-secondary px-2.5 py-1 rounded-full">{projects.filter(p => p.status === status).length}</span>
                        </div>
                        <div className="p-3 space-y-3 h-[calc(100vh-420px)] overflow-y-auto">
                            {projects
                                .filter(p => p.status === status)
                                .map(p => (
                                    <div
                                        key={p.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, p.id)}
                                        onClick={() => handleOpenDetailModal(p)}
                                        className={`p-4 bg-brand-surface rounded-xl cursor-grab border-l-4 shadow-lg ${draggedProjectId === p.id ? 'opacity-50 ring-2 ring-brand-accent' : 'opacity-100'}`}
                                        style={{ borderLeftColor: getStatusColor(p.status, config) }}
                                    >
                                        <p className="font-semibold text-sm text-brand-text-light">{p.projectName}</p>
                                        <p className="text-xs text-brand-text-secondary mt-1">{p.clientName}</p>
                                        <p className="text-xs font-bold text-brand-text-primary mt-1">
                                            {getSubStatusText(p)}
                                        </p>
                                        <ProgressBar progress={p.progress} status={p.status} config={config}/>
                                        <div className="flex justify-between items-center mt-3 text-xs">
                                            <span className="text-brand-text-secondary">{new Date(p.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                                            <ConfirmationIcons project={p} />
                                            <span className={`px-2 py-0.5 rounded-full ${getPaymentStatusClass(p.paymentStatus)}`}>
                                                {p.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )
            })
        }
    </div>
    );
};

interface ProjectDetailModalProps {
    selectedProject: Project | null;
    setSelectedProject: React.Dispatch<React.SetStateAction<Project | null>>;
    teamMembers: TeamMember[];
    clients: Client[];
    profile: Profile;
    showNotification: (message: string) => void;
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    onClose: () => void;
    handleOpenForm: (mode: 'edit', project: Project) => void;
    handleProjectDelete: (projectId: string) => void;
    handleOpenBriefingModal: (project: Project) => void;
    handleOpenConfirmationModal: (project: Project, subStatus: SubStatusConfig, isFollowUp: boolean) => void;
    packages: Package[];
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ selectedProject, setSelectedProject, teamMembers, clients, profile, showNotification, setProjects, onClose, handleOpenForm, handleProjectDelete, handleOpenBriefingModal, handleOpenConfirmationModal, packages }) => {
    const [detailTab, setDetailTab] = useState<'details' | 'revisions' | 'files'>('details');
    const [newRevision, setNewRevision] = useState({ adminNotes: '', deadline: '', freelancerId: '' });

    const teamByRole = useMemo(() => {
        if (!selectedProject?.team) return {};
        return selectedProject.team.reduce((acc, member) => {
            const { role } = member;
            if (!acc[role]) {
                acc[role] = [];
            }
            acc[role].push(member);
            return acc;
        }, {} as Record<string, AssignedTeamMember[]>);
    }, [selectedProject?.team]);

    const handleAddRevision = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject || !newRevision.freelancerId || !newRevision.adminNotes || !newRevision.deadline) {
            showNotification('Harap lengkapi semua field revisi.');
            return;
        }

        const revisionToAdd: Revision = {
            id: `REV-${Date.now()}`,
            date: new Date().toISOString(),
            adminNotes: newRevision.adminNotes,
            deadline: newRevision.deadline,
            freelancerId: newRevision.freelancerId,
            status: RevisionStatus.PENDING,
        };
        
        const updatedProject = { ...selectedProject, revisions: [...(selectedProject.revisions || []), revisionToAdd] };

        setProjects(prevProjects => prevProjects.map(p => p.id === selectedProject.id ? updatedProject : p));
        setSelectedProject(updatedProject);

        showNotification('Revisi baru berhasil ditambahkan.');
        setNewRevision({ adminNotes: '', deadline: '', freelancerId: '' });
    };

    const handleShareRevisionLink = (revision: Revision) => {
        if (!selectedProject) return;
        const url = `${window.location.origin}${window.location.pathname}#/revision-form?projectId=${selectedProject.id}&freelancerId=${revision.freelancerId}&revisionId=${revision.id}`;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Tautan revisi berhasil disalin!');
        }, (err) => {
            showNotification('Gagal menyalin tautan.');
            console.error('Could not copy text: ', err);
        });
    };

    const formatDateFull = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };
    
    const handleToggleDigitalItem = (itemText: string) => {
        if (!selectedProject) return;

        const currentCompleted = selectedProject.completedDigitalItems || [];
        const isCompleted = currentCompleted.includes(itemText);
        const newCompleted = isCompleted
            ? currentCompleted.filter(item => item !== itemText)
            : [...currentCompleted, itemText];

        const updatedProject = { ...selectedProject, completedDigitalItems: newCompleted };

        setProjects(prevProjects => prevProjects.map(p => p.id === selectedProject.id ? updatedProject : p));
        setSelectedProject(updatedProject); // Update local state for immediate UI feedback in the modal
    };
    
    if (!selectedProject) return null;

    const allSubStatusesForCurrentStatus = profile.projectStatusConfig.find(s => s.name === selectedProject.status)?.subStatuses || [];

    return (
        <div>
            <div className="border-b border-brand-border">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setDetailTab('details')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'details' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><ClipboardListIcon className="w-5 h-5"/> Detail</button>
                    <button onClick={() => setDetailTab('files')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'files' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><FileTextIcon className="w-5 h-5"/> File & Tautan</button>
                    <button onClick={() => setDetailTab('revisions')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'revisions' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><PencilIcon className="w-5 h-5"/> Revisi</button>
                </nav>
            </div>

            <div className="pt-6 max-h-[65vh] overflow-y-auto pr-2">
                {detailTab === 'details' && (
                    <div className="space-y-6">
                        <div className="text-sm space-y-2">
                            <p><strong className="font-semibold text-brand-text-secondary w-32 inline-block">Klien:</strong> {selectedProject.clientName}</p>
                            <p><strong className="font-semibold text-brand-text-secondary w-32 inline-block">Tanggal Acara:</strong> {formatDateFull(selectedProject.date)}</p>
                            <p><strong className="font-semibold text-brand-text-secondary w-32 inline-block">Lokasi:</strong> {selectedProject.location}</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Paket & Biaya</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm p-4 bg-brand-bg rounded-lg">
                                <span className="text-brand-text-secondary">Paket:</span> <span className="font-medium text-brand-text-light">{selectedProject.packageName}</span>
                                <span className="text-brand-text-secondary">Add-ons:</span> <span className="font-medium text-brand-text-light">{selectedProject.addOns.map(a => a.name).join(', ') || '-'}</span>
                                <span className="text-brand-text-secondary">Total Biaya Proyek:</span> <span className="font-bold text-brand-text-light">{formatCurrency(selectedProject.totalCost)}</span>
                                <span className="text-brand-text-secondary">Status Pembayaran:</span> <span><span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusClass(selectedProject.paymentStatus)}`}>{selectedProject.paymentStatus}</span></span>
                                <span className="text-brand-text-secondary">Biaya Cetak:</span> <span className="font-medium text-brand-text-light">{formatCurrency(selectedProject.printingCost || 0)}</span>
                                <span className="text-brand-text-secondary">Biaya Transportasi:</span> <span className="font-medium text-brand-text-light">{formatCurrency(selectedProject.transportCost || 0)}</span>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Progres Sub-Status</h4>
                            {allSubStatusesForCurrentStatus.length > 0 ? (
                                <div className="space-y-3 p-4 bg-brand-bg rounded-lg">
                                    {allSubStatusesForCurrentStatus.map(subStatus => {
                                        const isActive = selectedProject.activeSubStatuses?.includes(subStatus.name);
                                        const sentAt = selectedProject.subStatusConfirmationSentAt?.[subStatus.name];
                                        const isConfirmed = selectedProject.confirmedSubStatuses?.includes(subStatus.name);
                                        const clientNote = selectedProject.clientSubStatusNotes?.[subStatus.name];
                                        const needsFollowUp = sentAt && !isConfirmed && (new Date().getTime() - new Date(sentAt).getTime()) / (1000 * 60 * 60) > 24;

                                        return (
                                            <div key={subStatus.name} className="py-2 border-b border-brand-border last:border-b-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            {isConfirmed && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
                                                            <p className={`font-medium ${isActive ? 'text-brand-text-light' : 'text-brand-text-secondary'}`}>{subStatus.name}</p>
                                                            {needsFollowUp && <span className="text-xs font-semibold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Perlu Follow-up</span>}
                                                        </div>
                                                        <p className="text-xs text-brand-text-secondary">{subStatus.note}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleOpenConfirmationModal(selectedProject, subStatus, needsFollowUp || false)} 
                                                        className="button-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                                                        disabled={isConfirmed}
                                                    >
                                                        {isConfirmed ? 'Terkonfirmasi' : <><SendIcon className="w-3 h-3" /> Minta Konfirmasi</>}
                                                    </button>
                                                </div>
                                                {clientNote && (
                                                    <div className="mt-3 ml-4 p-2 bg-brand-input rounded-md border-l-2 border-brand-accent">
                                                        <p className="text-xs font-semibold text-brand-accent">Catatan Klien:</p>
                                                        <p className="text-sm text-brand-text-primary italic">"{clientNote}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-brand-text-secondary p-4 bg-brand-bg rounded-lg">Tidak ada sub-status untuk status proyek saat ini.</p>
                            )}
                        </div>

                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Deliverables</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-brand-bg rounded-lg">
                                    <h5 className="font-semibold text-brand-text-primary text-sm mb-2">Output Fisik (Cetak)</h5>
                                    {(selectedProject.printingDetails || []).length > 0 ? (
                                        <ul className="space-y-2 text-sm">
                                            {(selectedProject.printingDetails || []).map(item => (
                                                <li key={item.id} className="flex justify-between items-center">
                                                    <span className="text-brand-text-light">{item.customName || item.type}</span>
                                                    <span className="text-brand-text-secondary font-medium">{formatCurrency(item.cost)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-brand-text-secondary italic">Tidak ada item fisik.</p>
                                    )}
                                </div>
                                <div className="p-4 bg-brand-bg rounded-lg">
                                    <h5 className="font-semibold text-brand-text-primary text-sm mb-2">Output Digital</h5>
                                    {(() => {
                                        const pkg = packages.find(p => p.id === selectedProject.packageId);
                                        if (!pkg || pkg.digitalItems.length === 0) {
                                            return <p className="text-sm text-brand-text-secondary italic">Tidak ada item digital.</p>;
                                        }
                                        return (
                                            <div className="space-y-2 text-sm">
                                                {pkg.digitalItems.map((item, index) => {
                                                    const isCompleted = selectedProject.completedDigitalItems?.includes(item);
                                                    return (
                                                        <label key={index} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-brand-input cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={isCompleted}
                                                                onChange={() => handleToggleDigitalItem(item)}
                                                            />
                                                            <span className={`text-brand-text-primary ${isCompleted ? 'line-through text-brand-text-secondary' : ''}`}>{item}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Tim</h4>
                            <div className="space-y-4">
                                {Object.entries(teamByRole).length > 0 ? (
                                    Object.entries(teamByRole).map(([role, members]) => (
                                        <div key={role}>
                                            <h5 className="font-semibold text-brand-text-primary text-sm uppercase tracking-wider">{role}</h5>
                                            <div className="mt-2 space-y-2">
                                                {members.map(member => (
                                                    <div key={member.memberId} className="p-3 bg-brand-bg rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                                        <div>
                                                            <p className="text-sm text-brand-text-light font-medium">{member.name}</p>
                                                            {member.subJob && <p className="text-xs text-brand-text-secondary">{member.subJob}</p>}
                                                        </div>
                                                        <div className="text-xs flex items-center gap-4 mt-2 sm:mt-0 self-start sm:self-center">
                                                            <div className="text-right">
                                                                <p className="text-brand-text-secondary">Fee</p>
                                                                <p className="font-semibold text-brand-text-primary">{formatCurrency(member.fee)}</p>
                                                            </div>
                                                            {(member.reward && member.reward > 0) && (
                                                                <div className="text-right">
                                                                    <p className="text-brand-text-secondary">Hadiah</p>
                                                                    <p className="font-semibold text-yellow-400">{formatCurrency(member.reward)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-brand-text-secondary p-4 bg-brand-bg rounded-lg">Belum ada tim yang ditugaskan.</p>
                                )}
                            </div>
                        </div>

                        {selectedProject.notes && (
                            <div>
                                <h4 className="font-semibold text-gradient mb-3">Catatan</h4>
                                <div className="p-4 bg-brand-bg rounded-lg">
                                    <p className="text-sm text-brand-text-primary whitespace-pre-wrap">{selectedProject.notes}</p>
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Aksi Cepat</h4>
                            <div className="p-4 bg-brand-bg rounded-lg">
                                <button type="button" onClick={() => handleOpenBriefingModal(selectedProject)} className="button-secondary text-sm inline-flex items-center gap-2">
                                    <Share2Icon className="w-4 h-4"/> Bagikan Briefing Tim
                                </button>
                            </div>
                        </div>

                    </div>
                )}
                {detailTab === 'files' && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gradient mb-2">File & Tautan Penting</h4>
                        <div className="p-4 bg-brand-bg rounded-lg space-y-3 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-brand-border"><span className="text-brand-text-secondary">Link Moodboard/Brief (Internal)</span>{selectedProject.driveLink ? <a href={selectedProject.driveLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">Buka Tautan</a> : <span className="text-brand-text-secondary">N/A</span>}</div>
                            <div className="flex justify-between items-center py-2 border-b border-brand-border"><span className="text-brand-text-secondary">Link File dari Klien</span>{selectedProject.clientDriveLink ? <a href={selectedProject.clientDriveLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">Buka Tautan</a> : <span className="text-brand-text-secondary">N/A</span>}</div>
                            <div className="flex justify-between items-center py-2"><span className="text-brand-text-secondary">Link File Jadi (untuk Klien)</span>{selectedProject.finalDriveLink ? <a href={selectedProject.finalDriveLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">Buka Tautan</a> : <span className="text-brand-text-secondary">Belum tersedia</span>}</div>
                        </div>
                    </div>
                )}
                {detailTab === 'revisions' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Daftar Revisi</h4>
                            <div className="space-y-3">
                                {(selectedProject.revisions || []).length > 0 ? (selectedProject.revisions || []).map(rev => (
                                    <div key={rev.id} className="p-3 bg-brand-bg rounded-lg">
                                        <div className="flex justify-between items-center text-xs mb-2">
                                            <span className={`px-2 py-0.5 rounded-full font-medium ${getRevisionStatusClass(rev.status)}`}>{rev.status}</span>
                                            <span>Deadline: {new Date(rev.deadline).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <p className="text-sm"><strong className="text-brand-text-secondary">Admin:</strong> {rev.adminNotes}</p>
                                        <p className="text-sm mt-1"><strong className="text-brand-text-secondary">Freelancer ({teamMembers.find(t => t.id === rev.freelancerId)?.name || 'N/A'}):</strong> {rev.freelancerNotes || '-'}</p>
                                        {rev.driveLink && <p className="text-sm mt-1"><strong className="text-brand-text-secondary">Link Hasil:</strong> <a href={rev.driveLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Buka Tautan</a></p>}
                                        <button onClick={() => handleShareRevisionLink(rev)} className="text-xs font-semibold text-brand-accent hover:underline mt-2">Bagikan Tautan Revisi</button>
                                    </div>
                                )) : <p className="text-center text-sm text-brand-text-secondary py-4">Belum ada revisi.</p>}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Tambah Tugas Revisi Baru</h4>
                            <form onSubmit={handleAddRevision} className="p-4 bg-brand-bg rounded-lg space-y-4">
                                <div className="input-group"><textarea id="adminNotes" value={newRevision.adminNotes} onChange={e => setNewRevision(p => ({...p, adminNotes: e.target.value}))} className="input-field" rows={3} placeholder=" " required /><label htmlFor="adminNotes" className="input-label">Catatan Revisi untuk Freelancer</label></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="input-group"><select id="freelancerId" value={newRevision.freelancerId} onChange={e => setNewRevision(p => ({...p, freelancerId: e.target.value}))} className="input-field" required><option value="">Pilih Freelancer...</option>{selectedProject.team.map(t => <option key={t.memberId} value={t.memberId}>{t.name}</option>)}</select><label htmlFor="freelancerId" className="input-label">Tugaskan ke</label></div>
                                    <div className="input-group"><input type="date" id="deadline" value={newRevision.deadline} onChange={e => setNewRevision(p => ({...p, deadline: e.target.value}))} className="input-field" placeholder=" " required /><label htmlFor="deadline" className="input-label">Deadline</label></div>
                                </div>
                                <div className="text-right"><button type="submit" className="button-primary">Tambah Revisi</button></div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


interface ProjectsProps {
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    clients: Client[];
    packages: Package[];
    teamMembers: TeamMember[];
    teamProjectPayments: TeamProjectPayment[];
    setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    initialAction: NavigationAction | null;
    setInitialAction: (action: NavigationAction | null) => void;
    profile: Profile;
    showNotification: (message: string) => void;
    cards: Card[];
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
}

const ConfirmationModal: React.FC<{
    project: Project;
    subStatus: SubStatusConfig;
    isFollowUp: boolean;
    clients: Client[];
    teamMembers: TeamMember[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    onClose: () => void;
}> = ({ project, subStatus, isFollowUp, clients, teamMembers, setProjects, onClose }) => {
    const [recipientId, setRecipientId] = useState<string>('');
    const [message, setMessage] = useState('');

    const client = useMemo(() => clients.find(c => c.id === project.clientId), [clients, project.clientId]);

    useEffect(() => {
        if (client) {
            setRecipientId(`client-${client.id}`);
        } else if (project.team.length > 0) {
            setRecipientId(`freelancer-${project.team[0].memberId}`);
        }
    }, [client, project.team]);

    useEffect(() => {
        let recipientName = '[Penerima]';
        if (recipientId.startsWith('client-') && client) {
            recipientName = client.name;
        } else if (recipientId.startsWith('freelancer-')) {
            const memberId = recipientId.split('-')[1];
            recipientName = project.team.find(t => t.memberId === memberId)?.name || '[Freelancer]';
        }

        const initialMessage = `✨ *Konfirmasi Tugas Proyek* ✨

Halo *${recipientName}*,

Kami dari *Vena Pictures* ingin meminta konfirmasi Anda untuk sub-tugas pada proyek *"${project.projectName}"*.

*Tugas yang perlu dikonfirmasi:*
📝 *${subStatus.name}*

*Detail/Catatan Tambahan:*
📄 ${subStatus.note || "_Tidak ada catatan tambahan._"}

Mohon untuk meninjau detail di atas dan balas pesan ini dengan *"SETUJU"* atau *"CONFIRM"* jika Anda sudah memahami dan menyetujui tugas tersebut.

Jika ada pertanyaan, jangan ragu untuk menghubungi kami kembali.

Terima kasih atas perhatian dan kerja samanya!

Salam hangat,
*Tim Vena Pictures*`;

        const followUpMessage = `✨ *Follow-Up Konfirmasi Tugas* ✨

Halo *${recipientName}*,

Kami dari *Vena Pictures* ingin menindaklanjuti dengan hormat permintaan konfirmasi kami sebelumnya untuk sub-tugas pada proyek *"${project.projectName}"*.

*Tugas yang perlu dikonfirmasi:*
📝 *${subStatus.name}*

*Detail/Catatan Tambahan:*
📄 ${subStatus.note || "_Tidak ada catatan tambahan._"}

Kami mohon kesediaan Anda untuk memberikan konfirmasi agar kami dapat melanjutkan ke tahap berikutnya.

Jika ada pertanyaan atau kendala, jangan ragu untuk menghubungi kami.

Terima kasih atas perhatian dan kerja samanya!

Salam hangat,
*Tim Vena Pictures*`;

        setMessage(isFollowUp ? followUpMessage : initialMessage);

    }, [recipientId, project, subStatus, client, isFollowUp]);

    const handleShare = () => {
        let phoneNumber = '';
        if (recipientId.startsWith('client-') && client) {
            phoneNumber = client.phone;
        } else if (recipientId.startsWith('freelancer-')) {
            const memberId = recipientId.split('-')[1];
            phoneNumber = teamMembers.find(t => t.id === memberId)?.phone || '';
        }

        if (phoneNumber) {
            // Update project state with the timestamp
            setProjects(prev => prev.map(p => {
                if (p.id === project.id) {
                    const newConfirmationSentAt = {
                        ...(p.subStatusConfirmationSentAt || {}),
                        [subStatus.name]: new Date().toISOString(),
                    };
                    return { ...p, subStatusConfirmationSentAt: newConfirmationSentAt };
                }
                return p;
            }));

            // Open WhatsApp
            const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
            const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            onClose(); // Close modal after sharing
        } else {
            alert('Nomor telepon untuk penerima ini tidak ditemukan.');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`${isFollowUp ? 'Follow-Up' : 'Minta'} Konfirmasi Tugas: ${subStatus.name}`}>
            <div className="space-y-6">
                <div className="input-group">
                    <select id="recipient" value={recipientId} onChange={e => setRecipientId(e.target.value)} className="input-field">
                        {client && <option value={`client-${client.id}`}>Klien: {client.name}</option>}
                        {project.team.map(member => (
                            <option key={member.memberId} value={`freelancer-${member.memberId}`}>Freelancer: {member.name}</option>
                        ))}
                    </select>
                    <label className="input-label">Kirim ke</label>
                </div>
                <div>
                    <label className="text-sm font-medium text-brand-text-secondary mb-2 block">Pesan Kustom</label>
                    <div className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                         <textarea 
                            id="message" 
                            value={message} 
                            onChange={e => setMessage(e.target.value)} 
                            rows={15} 
                            className="w-full bg-transparent text-sm text-brand-text-primary focus:outline-none resize-none"
                        ></textarea>
                    </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-brand-border">
                    <button onClick={handleShare} className="button-primary inline-flex items-center gap-2">
                        <SendIcon className="w-4 h-4"/> Bagikan ke WhatsApp
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export const Projects: React.FC<ProjectsProps> = ({ projects, setProjects, clients, packages, teamMembers, teamProjectPayments, setTeamProjectPayments, transactions, setTransactions, initialAction, setInitialAction, profile, showNotification, cards, setCards }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    
    const initialFormState = useMemo(() => ({
        id: '',
        clientId: '',
        projectName: '',
        clientName: '',
        projectType: '',
        packageName: '',
        status: profile.projectStatusConfig.find(s => s.name === 'Persiapan')?.name || profile.projectStatusConfig[0]?.name || '',
        activeSubStatuses: [],
        location: '',
        date: new Date().toISOString().split('T')[0],
        deadlineDate: '',
        team: [],
        notes: '',
        driveLink: '',
        clientDriveLink: '',
        finalDriveLink: '',
        startTime: '',
        endTime: '',
        shippingDetails: '',
        printingDetails: [],
        printingCost: 0,
        transportCost: 0,
        isEditingConfirmedByClient: false,
        isPrintingConfirmedByClient: false,
        isDeliveryConfirmedByClient: false,
    }), [profile]);

    const [formData, setFormData] = useState(initialFormState);

    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
    
    const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
    const [briefingText, setBriefingText] = useState('');
    const [whatsappLink, setWhatsappLink] = useState('');
    const [googleCalendarLink, setGoogleCalendarLink] = useState('');
    const [icsDataUri, setIcsDataUri] = useState('');
    
    const [activeStatModal, setActiveStatModal] = useState<'total' | 'completed' | 'deadline' | 'unpaid' | null>(null);

    const [activeSectionOpen, setActiveSectionOpen] = useState(true);
    const [completedSectionOpen, setCompletedSectionOpen] = useState(false);

    const [printingItemForm, setPrintingItemForm] = useState<{ id: string; type: PrintingItem['type']; customName: string; details: string; cost: string }>({ id: '', type: 'Cetak Album', customName: '', details: '', cost: ''});
    const [editingPrintingItemId, setEditingPrintingItemId] = useState<string | null>(null);
    const [isAddingPrintingItem, setIsAddingPrintingItem] = useState(false);

    const [confirmationModalState, setConfirmationModalState] = useState<{ project: Project; subStatus: SubStatusConfig; isFollowUp: boolean; } | null>(null);


    const handleOpenDetailModal = (project: Project) => {
        setSelectedProject(project);
        setIsDetailModalOpen(true);
    };

    useEffect(() => {
        if (initialAction && initialAction.type === 'VIEW_PROJECT_DETAILS' && initialAction.id) {
            const projectToView = projects.find(p => p.id === initialAction.id);
            if (projectToView) {
                handleOpenDetailModal(projectToView);
            }
            setInitialAction(null);
        }
    }, [initialAction, projects, setInitialAction]);

    const teamByRole = useMemo(() => {
        return teamMembers.reduce((acc, member) => {
            if (!acc[member.role]) {
                acc[member.role] = [];
            }
            acc[member.role].push(member);
            return acc;
        }, {} as Record<string, TeamMember[]>);
    }, [teamMembers]);

    const filteredProjects = useMemo(() => {
        return projects
            .filter(p => viewMode === 'kanban' || statusFilter === 'all' || p.status === statusFilter)
            .filter(p => p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || p.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [projects, searchTerm, statusFilter, viewMode]);
    
    const summary = useMemo(() => ({
        total: projects.length,
        completed: projects.filter(p => p.status === 'Selesai').length,
        deadlineSoon: projects.filter(p => p.status !== 'Selesai' && p.deadlineDate && new Date(p.deadlineDate) > new Date() && new Date(p.deadlineDate).getTime() < new Date().getTime() + 14 * 24 * 60 * 60 * 1000).length,
        unpaid: projects.filter(p => p.paymentStatus !== PaymentStatus.LUNAS && p.status !== 'Dibatalkan').length
    }), [projects]);
    
    const projectsCompleted = useMemo(() => projects.filter(p => p.status === 'Selesai'), [projects]);
    const deadlineSoonProjects = useMemo(() => projects.filter(p => p.status !== 'Selesai' && p.deadlineDate && new Date(p.deadlineDate) > new Date() && new Date(p.deadlineDate).getTime() < new Date().getTime() + 14 * 24 * 60 * 60 * 1000), [projects]);
    const unpaidProjects = useMemo(() => projects.filter(p => p.paymentStatus !== PaymentStatus.LUNAS && p.status !== 'Dibatalkan'), [projects]);


    const handleOpenForm = (mode: 'add' | 'edit', project?: Project) => {
        setFormMode(mode);
        if (mode === 'edit' && project) {
            const { addOns, paymentStatus, amountPaid, totalCost, progress, packageId, dpProofUrl, ...operationalData } = project;
            const pkg = packages.find(p => p.id === project.packageId);
            setFormData({
                ...initialFormState,
                ...operationalData, 
                printingDetails: project.printingDetails || [], 
                activeSubStatuses: project.activeSubStatuses || [],
                printingCost: project.printingCost || pkg?.defaultPrintingCost || 0,
                transportCost: project.transportCost || pkg?.defaultTransportCost || 0,
                isEditingConfirmedByClient: project.isEditingConfirmedByClient || false,
                isPrintingConfirmedByClient: project.isPrintingConfirmedByClient || false,
                isDeliveryConfirmedByClient: project.isDeliveryConfirmedByClient || false,
            });
        } else {
            setFormData({...initialFormState, projectType: profile.projectTypes[0] || ''});
        }
        setIsAddingPrintingItem(false);
        setEditingPrintingItemId(null);
        setIsFormVisible(true);
    };

    const handleCloseForm = () => {
        setIsFormVisible(false);
        setFormData(initialFormState);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        setFormData(prev => {
            const newState = {...prev, [name]: value};
            if (name === 'status') {
                newState.activeSubStatuses = [];
                if (value !== 'Dikirim') {
                    newState.shippingDetails = '';
                }
            }
            return newState;
        });
    };
    
    const handleSubStatusChange = (option: string, isChecked: boolean) => {
        setFormData(prev => {
            const currentSubStatuses = prev.activeSubStatuses || [];
            if (isChecked) {
                return { ...prev, activeSubStatuses: [...currentSubStatuses, option] };
            } else {
                return { ...prev, activeSubStatuses: currentSubStatuses.filter(s => s !== option) };
            }
        });
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setFormData(prev => ({
                ...prev,
                clientId: client.id,
                clientName: client.name,
                projectName: prev.projectName || `Acara ${client.name}`
            }));
        }
    };

    const handleTeamChange = (member: TeamMember) => {
        setFormData(prev => {
            const isSelected = prev.team.some(t => t.memberId === member.id);
            if (isSelected) {
                return {
                    ...prev,
                    team: prev.team.filter(t => t.memberId !== member.id)
                }
            } else {
                const newTeamMember: AssignedTeamMember = {
                    memberId: member.id,
                    name: member.name,
                    role: member.role,
                    fee: member.standardFee,
                    reward: 0,
                };
                return {
                    ...prev,
                    team: [...prev.team, newTeamMember]
                }
            }
        });
    };
    
    const handleTeamFeeChange = (memberId: string, newFee: number) => {
        setFormData(prev => ({
            ...prev,
            team: prev.team.map(t => t.memberId === memberId ? { ...t, fee: newFee } : t)
        }));
    };

    const handleTeamRewardChange = (memberId: string, newReward: number) => {
        setFormData(prev => ({
            ...prev,
            team: prev.team.map(t => t.memberId === memberId ? { ...t, reward: newReward } : t)
        }));
    };

    const handleTeamSubJobChange = (memberId: string, subJob: string) => {
        setFormData(prev => ({
            ...prev,
            team: prev.team.map(t => t.memberId === memberId ? { ...t, subJob: subJob } : t)
        }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let projectData: Project;

        if (formMode === 'add') {
             projectData = {
                ...initialFormState,
                ...formData,
                id: `PRJ${Date.now()}`,
                progress: 0,
                totalCost: 0, // Will be set on client page
                amountPaid: 0,
                paymentStatus: PaymentStatus.BELUM_BAYAR,
                packageId: '',
                addOns: [],
            };
        } else { // edit mode
            const originalProject = projects.find(p => p.id === formData.id);
            if (!originalProject) return; 

            const updatedProjectData = { ...originalProject, ...formData };
            
            if (updatedProjectData.status === 'Cetak') {
                const originalItems = originalProject.printingDetails || [];
                const newItems = updatedProjectData.printingDetails || [];
                let tempTransactions = [...transactions];
                let tempCards = [...cards];
                const paymentCardId = cards.find(c => c.id !== 'CARD_CASH')?.id || cards[0]?.id;
                
                if (paymentCardId) {
                    originalItems.forEach(oldItem => {
                        if (!newItems.some(newItem => newItem.id === oldItem.id)) {
                            const txIndex = tempTransactions.findIndex(t => t.printingItemId === oldItem.id);
                            if (txIndex > -1) {
                                tempTransactions.splice(txIndex, 1);
                                tempCards = tempCards.map(c => c.id === paymentCardId ? { ...c, balance: c.balance + oldItem.cost } : c);
                            }
                        }
                    });

                    newItems.forEach(newItem => {
                        const oldItem = originalItems.find(item => item.id === newItem.id);
                        if (!oldItem) {
                            const newTx: Transaction = {
                                id: `TRN-PRINT-${newItem.id}`, date: new Date().toISOString().split('T')[0],
                                description: `Biaya ${newItem.type} - ${updatedProjectData.projectName}`,
                                amount: newItem.cost, type: TransactionType.EXPENSE, projectId: updatedProjectData.id,
                                category: newItem.type === 'Custom' ? 'Custom' : newItem.type,
                                method: 'Sistem', cardId: paymentCardId, printingItemId: newItem.id
                            };
                            tempTransactions.push(newTx);
                            tempCards = tempCards.map(c => c.id === paymentCardId ? { ...c, balance: c.balance - newItem.cost } : c);
                        } else if (oldItem.cost !== newItem.cost) {
                            const txIndex = tempTransactions.findIndex(t => t.printingItemId === newItem.id);
                            const costDifference = newItem.cost - oldItem.cost;
                            if (txIndex > -1) {
                                tempTransactions[txIndex].amount = newItem.cost;
                                tempCards = tempCards.map(c => c.id === paymentCardId ? { ...c, balance: c.balance - costDifference } : c);
                            }
                        }
                    });
                    setTransactions(tempTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                    setCards(tempCards);
                } else {
                    showNotification("Tidak ada kartu pembayaran yang dikonfigurasi untuk biaya cetak.");
                }
            }
             projectData = updatedProjectData;

            const paymentCardId = cards.find(c => c.id !== 'CARD_CASH')?.id;
            if (!paymentCardId) {
                showNotification("Tidak ada kartu pembayaran untuk mencatat pengeluaran.");
            } else {
                let tempTransactions = [...transactions];
                let tempCards = [...cards];
                const fieldsToProcess: ('printingCost' | 'transportCost')[] = [];

                if (originalProject.printingCost !== projectData.printingCost) fieldsToProcess.push('printingCost');
                if (originalProject.transportCost !== projectData.transportCost) fieldsToProcess.push('transportCost');

                fieldsToProcess.forEach(field => {
                    const cost = projectData[field] || 0;
                    const category = field === 'printingCost' ? 'Cetak Album' : 'Transportasi';
                    const description = field === 'printingCost' ? `Biaya Cetak - ${projectData.projectName}` : `Biaya Transportasi - ${projectData.projectName}`;
                    const txId = `TRN-COST-${field.replace('Cost','')}-${projectData.id}`;
                    
                    const existingTxIndex = tempTransactions.findIndex(t => t.id === txId);

                    if (existingTxIndex > -1) {
                        const oldAmount = tempTransactions[existingTxIndex].amount;
                        if (cost > 0) {
                            tempTransactions[existingTxIndex].amount = cost;
                            const diff = cost - oldAmount;
                            tempCards = tempCards.map(c => c.id === paymentCardId ? { ...c, balance: c.balance - diff } : c);
                        } else {
                            tempTransactions.splice(existingTxIndex, 1);
                            tempCards = tempCards.map(c => c.id === paymentCardId ? { ...c, balance: c.balance + oldAmount } : c);
                        }
                    } else if (cost > 0) {
                        const newTx: Transaction = {
                            id: txId, date: new Date().toISOString().split('T')[0], description, amount: cost,
                            type: TransactionType.EXPENSE, projectId: projectData.id, category,
                            method: 'Sistem', cardId: paymentCardId,
                        };
                        tempTransactions.push(newTx);
                        tempCards = tempCards.map(c => c.id === paymentCardId ? { ...c, balance: c.balance - cost } : c);
                    }
                });

                setTransactions(tempTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setCards(tempCards);
            }
        }
        
        const allTeamMembersOnProject = projectData.team;
        const otherProjectPayments = teamProjectPayments.filter(p => p.projectId !== projectData.id);
        const newProjectPaymentEntries: TeamProjectPayment[] = allTeamMembersOnProject.map(teamMember => ({
            id: `TPP-${projectData.id}-${teamMember.memberId}`,
            projectId: projectData.id,
            teamMemberName: teamMember.name,
            teamMemberId: teamMember.memberId,
            date: projectData.date,
            status: 'Unpaid',
            fee: teamMember.fee,
            reward: teamMember.reward || 0,
        }));
        setTeamProjectPayments([...otherProjectPayments, ...newProjectPaymentEntries]);

        if (formMode === 'add') {
            setProjects(prev => [projectData, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } else {
            setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
        handleCloseForm();
    };

    const handleProjectDelete = (projectId: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus proyek ini? Semua data terkait (termasuk tugas tim dan transaksi) akan dihapus.")) {
            setProjects(prev => prev.filter(p => p.id !== projectId));
            setTeamProjectPayments(prev => prev.filter(fp => fp.projectId !== projectId));
            setTransactions(prev => prev.filter(t => t.projectId !== projectId));
        }
    };
    
    const handleOpenBriefingModal = (project: Project) => {
        setSelectedProject(project);
        const date = new Date(project.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    
        const teamList = project.team.length > 0
            ? project.team.map(t => `- ${t.name}`).join('\n')
            : 'Tim belum ditugaskan.';
    
        const parts = [];
        parts.push(`${date}`);
        parts.push(`*${project.projectName}*`);
        parts.push(`\n*Tim Bertugas:*\n${teamList}`);
        
        if (project.startTime || project.endTime || project.location) parts.push(''); 
    
        if (project.startTime) parts.push(`*Waktu Mulai:* ${project.startTime}`);
        if (project.endTime) parts.push(`*Waktu Selesai:* ${project.endTime}`);
        if (project.location) parts.push(`*Lokasi :* ${project.location}`);
        
        if (project.notes) {
            parts.push('');
            parts.push(`*Catatan:*\n${project.notes}`);
        }
    
        if (project.location || project.driveLink) parts.push('');
    
        if (project.location) {
            const mapsQuery = encodeURIComponent(project.location);
            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
            parts.push(`*Link Lokasi:*\n${mapsLink}`);
        }
    
        if (project.driveLink) {
             if (project.location) parts.push('');
            parts.push(`*Link Moodboard:*\n${project.driveLink}`);
        }

        if (profile.briefingTemplate) {
            parts.push('\n---\n');
            parts.push(profile.briefingTemplate);
        }

        const text = parts.join('\n').replace(/\n\n\n+/g, '\n\n').trim();
    
        setBriefingText(text);
        setWhatsappLink(`whatsapp://send?text=${encodeURIComponent(text)}`);
        
        const toGoogleCalendarFormat = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
        const timeRegex = /(\d{2}:\d{2})/;
        const startTimeMatch = project.startTime?.match(timeRegex);
        const endTimeMatch = project.endTime?.match(timeRegex);

        let googleLink = '';
        let icsContent = '';

        if (startTimeMatch) {
            const startDate = new Date(`${project.date}T${startTimeMatch[1]}:00`);
            const isInternalEvent = profile.eventTypes.includes(project.projectType);
            const durationHours = isInternalEvent ? 2 : 8;

            const endDate = endTimeMatch 
                ? new Date(`${project.date}T${endTimeMatch[1]}:00`)
                : new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

            const googleDates = `${toGoogleCalendarFormat(startDate)}/${toGoogleCalendarFormat(endDate)}`;
            
            const calendarDescription = `Briefing untuk ${project.projectName}:\n\n${text}`;

            googleLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(project.projectName)}&dates=${googleDates}&details=${encodeURIComponent(calendarDescription)}&location=${encodeURIComponent(project.location || '')}`;

            const icsDescription = calendarDescription.replace(/\n/g, '\\n');
            icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'BEGIN:VEVENT',
                `UID:${project.id}@venapictures.com`,
                `DTSTAMP:${toGoogleCalendarFormat(new Date())}`,
                `DTSTART:${toGoogleCalendarFormat(startDate)}`,
                `DTEND:${toGoogleCalendarFormat(endDate)}`,
                `SUMMARY:${project.projectName}`,
                `DESCRIPTION:${icsDescription}`,
                `LOCATION:${project.location || ''}`,
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\n');
        }

        setGoogleCalendarLink(googleLink);
        setIcsDataUri(icsContent ? `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}` : '');
    
        setIsBriefingModalOpen(true);
    };
    
    const getProgressForStatus = (status: string, config: ProjectStatusConfig[]): number => {
        const progressMap: { [key: string]: number } = {
            'Tertunda': 0,
            'Persiapan': 10,
            'Dikonfirmasi': 25,
            'Editing': 70,
            'Revisi': 80,
            'Cetak': 90,
            'Dikirim': 95,
            'Selesai': 100,
            'Dibatalkan': 0,
        };
        return progressMap[status] ?? 0;
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, projectId: string) => {
        e.dataTransfer.setData("projectId", projectId);
        setDraggedProjectId(projectId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: string) => {
        e.preventDefault();
        const projectId = e.dataTransfer.getData("projectId");
        const projectToUpdate = projects.find(p => p.id === projectId);

        if (projectToUpdate && projectToUpdate.status !== newStatus) {
            setProjects(prevProjects =>
                prevProjects.map(p =>
                    p.id === projectId ? { ...p, status: newStatus, progress: getProgressForStatus(newStatus, profile.projectStatusConfig), activeSubStatuses: [] } : p
                )
            );
            showNotification(`Status "${projectToUpdate.projectName}" diubah ke "${newStatus}"`);
        }
        setDraggedProjectId(null);
    };
    
    const handlePrintingItemFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPrintingItemForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddOrUpdatePrintingItem = () => {
        const { cost, details, type, customName } = printingItemForm;
        if (!details || !cost || (type === 'Custom' && !customName)) {
            showNotification('Harap lengkapi detail dan biaya item cetak.');
            return;
        }

        if (editingPrintingItemId) {
            const updatedItems = (formData.printingDetails || []).map(item =>
                item.id === editingPrintingItemId ? { ...item, type, customName: type === 'Custom' ? customName : undefined, details, cost: Number(cost) } : item
            );
            setFormData(prev => ({ ...prev, printingDetails: updatedItems }));
        } else {
            const newItem: PrintingItem = {
                id: `pi-${Date.now()}`,
                type,
                customName: type === 'Custom' ? customName : undefined,
                details,
                cost: Number(cost),
            };
            setFormData(prev => ({ ...prev, printingDetails: [...(prev.printingDetails || []), newItem] }));
        }
        
        handleCancelEditPrintingItem();
    };
    
    const handleEditPrintingItem = (item: PrintingItem) => {
        setEditingPrintingItemId(item.id);
        setPrintingItemForm({
            id: item.id,
            type: item.type,
            customName: item.customName || '',
            details: item.details,
            cost: item.cost.toString(),
        });
        setIsAddingPrintingItem(true);
    };
    
    const handleRemovePrintingItem = (itemId: string) => {
        setFormData(prev => ({ ...prev, printingDetails: (prev.printingDetails || []).filter(item => item.id !== itemId) }));
    };

    const handleCancelEditPrintingItem = () => {
        setEditingPrintingItemId(null);
        setPrintingItemForm({ id: '', type: 'Cetak Album', customName: '', details: '', cost: '' });
        setIsAddingPrintingItem(false);
    };
    
    const handleOpenConfirmationModal = (project: Project, subStatus: SubStatusConfig, isFollowUp: boolean) => {
        setConfirmationModalState({ project, subStatus, isFollowUp });
    };

    const modalTitles: { [key: string]: string } = {
        total: 'Daftar Semua Proyek',
        completed: 'Daftar Proyek Selesai',
        deadline: 'Proyek dengan Deadline Dekat',
        unpaid: 'Proyek yang Belum Lunas'
    };

    let modalContentList: Project[] = [];
    if (activeStatModal === 'total') modalContentList = projects;
    else if (activeStatModal === 'completed') modalContentList = projectsCompleted;
    else if (activeStatModal === 'deadline') modalContentList = deadlineSoonProjects;
    else if (activeStatModal === 'unpaid') modalContentList = unpaidProjects;

    const activeProjects = filteredProjects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan');
    const completedAndCancelledProjects = filteredProjects.filter(p => p.status === 'Selesai' || p.status === 'Dibatalkan');
    
    const selectedStatusConfig = profile.projectStatusConfig.find(s => s.name === formData.status);

    const formatDateFull = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className="space-y-8">
            <PageHeader title="Manajemen Proyek" subtitle="Lacak semua proyek dari awal hingga selesai.">
                { !isFormVisible && (
                    <button onClick={() => handleOpenForm('add')} className="button-primary inline-flex items-center gap-2">
                        <PlusIcon className="w-5 h-5"/>
                        Tambah Proyek
                    </button>
                )}
            </PageHeader>
            
            {isFormVisible && (
                <div className="bg-brand-surface p-6 rounded-2xl mb-6 shadow-lg border border-brand-border">
                    <h3 className="text-xl font-semibold text-gradient border-b border-gray-700/50 pb-4 mb-6">{formMode === 'add' ? 'Tambah Proyek Baru (Operasional)' : 'Edit Proyek'}</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Column 1 */}
                            <div className="space-y-4">
                                <div className="input-group"><select id="clientId" name="clientId" value={formData.clientId} onChange={handleClientChange} className="input-field" required><option value="">Pilih Klien...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><label htmlFor="clientId" className="input-label">Pilih Klien</label></div>
                                <div className="input-group"><input type="text" id="clientName" name="clientName" value={formData.clientName} className="input-field bg-brand-input" readOnly required placeholder=" "/><label htmlFor="clientName" className="input-label">Nama Klien</label></div>
                                <div className="input-group"><input type="text" id="projectName" name="projectName" value={formData.projectName} onChange={handleFormChange} className="input-field" placeholder=" " required/><label htmlFor="projectName" className="input-label">Nama Proyek</label></div>
                                <div className="input-group"><select id="projectType" name="projectType" value={formData.projectType} onChange={handleFormChange} className="input-field" required><option value="">Pilih jenis...</option>{profile.projectTypes.map(t => <option key={t} value={t}>{t}</option>)}</select><label htmlFor="projectType" className="input-label">Jenis Proyek</label></div>
                                <div className="input-group"><select id="status" name="status" value={formData.status} onChange={handleFormChange} className="input-field"><option value="">Pilih status...</option>{profile.projectStatusConfig.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select><label htmlFor="status" className="input-label">Status</label></div>
                                
                                {selectedStatusConfig && selectedStatusConfig.subStatuses.length > 0 && (
                                    <div className="input-group">
                                        <label className="input-label !static !-top-4 !text-brand-accent">Sub-Status untuk {formData.status}</label>
                                        <div className="p-3 border border-brand-border bg-brand-bg rounded-lg space-y-2 mt-2 max-h-48 overflow-y-auto">
                                            {selectedStatusConfig.subStatuses.map(opt => (
                                                <div key={opt.name} className="flex items-start">
                                                    <input
                                                        type="checkbox"
                                                        id={`substatus-${opt.name}`}
                                                        className="mt-1 flex-shrink-0"
                                                        checked={formData.activeSubStatuses?.includes(opt.name)}
                                                        onChange={e => handleSubStatusChange(opt.name, e.target.checked)}
                                                    />
                                                    <label htmlFor={`substatus-${opt.name}`} className="ml-2 text-sm">
                                                        <span className="font-medium text-brand-text-light">{opt.name}</span>
                                                        <p className="text-xs text-brand-text-secondary">{opt.note}</p>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}


                                {formData.status === 'Dikirim' && <div className="input-group"><input type="text" id="shippingDetails" name="shippingDetails" value={formData.shippingDetails} onChange={handleFormChange} className="input-field" placeholder="cth: Flashdisk via JNE AWB123" /><label htmlFor="shippingDetails" className="input-label">Detail Pengiriman</label></div>}
                                
                                <div className="pt-4 border-t border-gray-700/50">
                                    <h4 className="font-semibold text-gradient mb-2">Konfirmasi Klien (Manual)</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <label className="flex items-center gap-2 p-2 bg-brand-bg rounded-md">
                                            <input type="checkbox" name="isEditingConfirmedByClient" checked={formData.isEditingConfirmedByClient} onChange={handleFormChange}/>
                                            <span className="text-sm">Editing Sesuai</span>
                                        </label>
                                        <label className="flex items-center gap-2 p-2 bg-brand-bg rounded-md">
                                            <input type="checkbox" name="isPrintingConfirmedByClient" checked={formData.isPrintingConfirmedByClient} onChange={handleFormChange}/>
                                            <span className="text-sm">Cetak Sesuai</span>
                                        </label>
                                        <label className="flex items-center gap-2 p-2 bg-brand-bg rounded-md">
                                            <input type="checkbox" name="isDeliveryConfirmedByClient" checked={formData.isDeliveryConfirmedByClient} onChange={handleFormChange}/>
                                            <span className="text-sm">Pengiriman Diterima</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {/* Column 2 */}
                            <div className="space-y-4">
                                <div className="input-group"><input type="text" id="location" name="location" value={formData.location} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="location" className="input-label">Lokasi</label></div>
                                <div className="input-group"><input type="date" id="date" name="date" value={formData.date} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="date" className="input-label">Tanggal Acara</label></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="input-group"><input type="text" id="startTime" name="startTime" value={formData.startTime} onChange={handleFormChange} className="input-field" placeholder="cth: Akad: 08:00 "/><label htmlFor="startTime" className="input-label">Waktu Mulai</label></div>
                                    <div className="input-group"><input type="text" id="endTime" name="endTime" value={formData.endTime} onChange={handleFormChange} className="input-field" placeholder="cth: Resepsi: 19:00"/><label htmlFor="endTime" className="input-label">Waktu Selesai</label></div>
                                </div>
                                <div className="input-group"><input type="date" id="deadlineDate" name="deadlineDate" value={formData.deadlineDate} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="deadlineDate" className="input-label">Deadline</label></div>
                                <div className="input-group"><input type="number" id="printingCost" name="printingCost" value={formData.printingCost || ''} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="printingCost" className="input-label">Biaya Cetak (IDR)</label></div>
                                <div className="input-group"><input type="number" id="transportCost" name="transportCost" value={formData.transportCost || ''} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="transportCost" className="input-label">Biaya Transportasi (IDR)</label></div>
                                <div className="input-group"><textarea id="notes" name="notes" value={formData.notes} onChange={handleFormChange} className="input-field" placeholder=" "></textarea><label htmlFor="notes" className="input-label">Catatan Tambahan</label></div>
                                <div className="input-group"><input type="url" id="driveLink" name="driveLink" value={formData.driveLink || ''} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="driveLink" className="input-label">Link Moodboard (GDrive)</label></div>
                                <div className="input-group"><input type="url" id="clientDriveLink" name="clientDriveLink" value={formData.clientDriveLink || ''} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="clientDriveLink" className="input-label">Link File dari Klien</label></div>
                                <div className="input-group"><input type="url" id="finalDriveLink" name="finalDriveLink" value={formData.finalDriveLink || ''} onChange={handleFormChange} className="input-field" placeholder=" "/><label htmlFor="finalDriveLink" className="input-label">Link File Jadi</label></div>
                            </div>

                             <div className="md:col-span-2 pt-6 border-t border-gray-700/50">
                                <h4 className="font-semibold text-gradient mb-4">Tim & Penugasan</h4>
                                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                                    {Object.entries(teamByRole).map(([role, members]) => (
                                        <div key={role}>
                                            <h5 className="font-semibold text-sm text-brand-text-secondary uppercase tracking-wider mb-2">{role}</h5>
                                            <div className="space-y-2">
                                                {members.map(member => (
                                                    <div key={member.id} className="p-3 bg-brand-bg rounded-lg">
                                                        <label className="flex items-center gap-3 cursor-pointer">
                                                            <input type="checkbox" checked={formData.team.some(t => t.memberId === member.id)} onChange={() => handleTeamChange(member)} />
                                                            <span className="text-sm font-medium text-brand-text-light">{member.name}</span>
                                                        </label>
                                                        {formData.team.some(t => t.memberId === member.id) && (
                                                            <div className="pl-8 pt-2 mt-2 border-t border-brand-border space-y-3">
                                                                <div className="input-group !mt-0">
                                                                    <input type="text" value={formData.team.find(t => t.memberId === member.id)?.subJob || ''} onChange={(e) => handleTeamSubJobChange(member.id, e.target.value)} className="input-field !p-1.5 !text-sm" placeholder=" " />
                                                                    <label className="input-label">Pekerjaan Spesifik (e.g., Editing)</label>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="input-group !mt-0 flex-1">
                                                                        <input type="number" value={formData.team.find(t => t.memberId === member.id)?.fee || ''} onChange={(e) => handleTeamFeeChange(member.id, Number(e.target.value))} className="input-field !p-1.5 !text-sm" placeholder=" " />
                                                                        <label className="input-label">Fee (IDR)</label>
                                                                    </div>
                                                                    <div className="input-group !mt-0 flex-1">
                                                                        <input type="number" value={formData.team.find(t => t.memberId === member.id)?.reward || ''} onChange={(e) => handleTeamRewardChange(member.id, Number(e.target.value))} className="input-field !p-1.5 !text-sm" placeholder=" " />
                                                                        <label className="input-label">Hadiah (IDR)</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {formData.status === 'Cetak' && (
                                <div className="md:col-span-2 pt-6 border-t border-gray-700/50">
                                    <h4 className="font-semibold text-gradient mb-4">Detail Cetak & Biaya (Otomatis terintegrasi ke Keuangan)</h4>
                                    
                                    <div className="space-y-2 mb-4">
                                        {(formData.printingDetails || []).map(item => (
                                            <div key={item.id} className="p-2 bg-brand-input rounded-lg flex justify-between items-center text-sm">
                                                <div>
                                                    <p className="font-semibold text-brand-text-light">{item.customName || item.type}</p>
                                                    <p className="text-xs text-brand-text-secondary">{item.details}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="font-semibold text-brand-text-primary">{formatCurrency(item.cost)}</p>
                                                    <button type="button" onClick={() => handleEditPrintingItem(item)} className="p-1 text-brand-text-secondary hover:text-brand-accent"><PencilIcon className="w-4 h-4"/></button>
                                                    <button type="button" onClick={() => handleRemovePrintingItem(item.id)} className="p-1 text-brand-text-secondary hover:text-brand-danger"><Trash2Icon className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                        ))}
                                        {(formData.printingDetails || []).length > 0 && 
                                            <div className="text-right font-bold text-brand-text-light pt-2">
                                                Total Biaya Cetak: {formatCurrency((formData.printingDetails || []).reduce((sum, i) => sum + i.cost, 0))}
                                            </div>
                                        }
                                    </div>
                                    
                                    {isAddingPrintingItem ? (
                                        <div className="p-4 bg-brand-bg rounded-xl border border-brand-border space-y-4">
                                            <h5 className="font-medium text-brand-text-light">{editingPrintingItemId ? 'Edit Item Cetak' : 'Tambah Item Cetak Baru'}</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="input-group">
                                                    <select name="type" value={printingItemForm.type} onChange={handlePrintingItemFormChange} className="input-field">
                                                        <option>Cetak Album</option>
                                                        <option>Cetak Foto</option>
                                                        <option>Flashdisk</option>
                                                        <option>Custom</option>
                                                    </select>
                                                    <label className="input-label">Jenis</label>
                                                </div>
                                                {printingItemForm.type === 'Custom' && (
                                                    <div className="input-group">
                                                        <input type="text" name="customName" value={printingItemForm.customName} onChange={handlePrintingItemFormChange} className="input-field !p-2 !text-sm" placeholder=" "/>
                                                        <label className="input-label">Nama Custom</label>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                                                <div className="input-group sm:col-span-2 !mt-0">
                                                    <input type="text" name="details" value={printingItemForm.details} onChange={handlePrintingItemFormChange} className="input-field !p-2 !text-sm" placeholder=" " required/>
                                                    <label className="input-label">Detail Item</label>
                                                </div>
                                                <div className="input-group !mt-0">
                                                    <input type="number" name="cost" value={printingItemForm.cost} onChange={handlePrintingItemFormChange} className="input-field !p-2 !text-sm" placeholder=" " required/>
                                                    <label className="input-label">Biaya (IDR)</label>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <button type="button" onClick={handleCancelEditPrintingItem} className="button-secondary text-sm mr-2">Batal</button>
                                                <button type="button" onClick={handleAddOrUpdatePrintingItem} className="button-primary text-sm">{editingPrintingItemId ? 'Update Item' : 'Tambah Item'}</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setIsAddingPrintingItem(true)} className="button-secondary text-sm inline-flex items-center gap-2">
                                            <PlusIcon className="w-4 h-4" />
                                            Tambah Item Cetak
                                        </button>
                                    )}

                                </div>
                            )}

                        </div>
                        <div className="flex justify-between items-center pt-8 mt-4 border-t border-gray-700/50">
                            <button type="button" onClick={handleCloseForm} className="button-secondary">Batal</button>
                            <button type="submit" className="button-primary">{formMode === 'add' ? 'Simpan Proyek' : 'Update Proyek'}</button>
                        </div>
                    </form>
                </div>
            )}
            
            {!isFormVisible && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '100ms' }} onClick={() => setActiveStatModal('total')}>
                            <StatCard icon={<FolderKanbanIcon className="w-6 h-6"/>} title="Total Proyek" value={summary.total.toString()} />
                        </div>
                         <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '200ms' }} onClick={() => setActiveStatModal('completed')}>
                            <StatCard icon={<CheckSquareIcon className="w-6 h-6"/>} title="Proyek Selesai" value={summary.completed.toString()} />
                        </div>
                         <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '300ms' }} onClick={() => setActiveStatModal('deadline')}>
                            <StatCard icon={<CalendarIcon className="w-6 h-6"/>} title="Deadline Dekat (14 Hari)" value={summary.deadlineSoon.toString()} />
                        </div>
                         <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '400ms' }} onClick={() => setActiveStatModal('unpaid')}>
                            <StatCard icon={<AlertCircleIcon className="w-6 h-6"/>} title="Belum Lunas" value={summary.unpaid.toString()} />
                        </div>
                    </div>

                    <div className="bg-brand-surface p-4 rounded-xl shadow-lg border border-brand-border flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="input-group flex-grow !mt-0 w-full md:w-auto">
                            <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field !rounded-lg !border !bg-brand-bg p-2.5" placeholder=" " />
                            <label className="input-label">Cari proyek atau klien...</label>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field !rounded-lg !border !bg-brand-bg p-2.5 w-full md:w-48">
                                <option value="all">Semua Status</option>
                                {profile.projectStatusConfig.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                             <div className="p-1 bg-brand-bg rounded-lg flex items-center h-fit">
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-brand-surface shadow-sm text-brand-text-light' : 'text-brand-text-secondary'}`}><ListIcon className="w-5 h-5"/></button>
                                <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-brand-surface shadow-sm text-brand-text-light' : 'text-brand-text-secondary'}`}><LayoutGridIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </div>
                    
                    {viewMode === 'list' ? (
                        <div className="bg-brand-surface rounded-2xl shadow-lg border border-brand-border">
                            <div className="p-4 border-b border-brand-border">
                                <button onClick={() => setActiveSectionOpen(p => !p)} className="w-full flex justify-between items-center">
                                    <h3 className="font-semibold text-brand-text-light">Proyek Aktif ({activeProjects.length})</h3>
                                    {activeSectionOpen ? <ArrowUpIcon className="w-5 h-5 text-brand-text-secondary"/> : <ArrowDownIcon className="w-5 h-5 text-brand-text-secondary"/>}
                                </button>
                            </div>
                            {activeSectionOpen && <ProjectListView projects={activeProjects} handleOpenDetailModal={handleOpenDetailModal} handleOpenForm={handleOpenForm} handleProjectDelete={handleProjectDelete} config={profile.projectStatusConfig} />}
                             <div className="p-4 border-t border-brand-border">
                                <button onClick={() => setCompletedSectionOpen(p => !p)} className="w-full flex justify-between items-center">
                                    <h3 className="font-semibold text-brand-text-light">Proyek Selesai & Dibatalkan ({completedAndCancelledProjects.length})</h3>
                                    {completedSectionOpen ? <ArrowUpIcon className="w-5 h-5 text-brand-text-secondary"/> : <ArrowDownIcon className="w-5 h-5 text-brand-text-secondary"/>}
                                </button>
                            </div>
                            {completedSectionOpen && <ProjectListView projects={completedAndCancelledProjects} handleOpenDetailModal={handleOpenDetailModal} handleOpenForm={handleOpenForm} handleProjectDelete={handleProjectDelete} config={profile.projectStatusConfig} />}
                        </div>
                    ) : (
                        <ProjectKanbanView projects={filteredProjects} handleOpenDetailModal={handleOpenDetailModal} draggedProjectId={draggedProjectId} handleDragStart={handleDragStart} handleDragOver={handleDragOver} handleDrop={handleDrop} config={profile.projectStatusConfig} />
                    )}
                </div>
            )}
            
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Detail Proyek: ${selectedProject?.projectName}`} size="3xl">
                <ProjectDetailModal 
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    teamMembers={teamMembers}
                    clients={clients}
                    profile={profile}
                    showNotification={showNotification}
                    setProjects={setProjects}
                    onClose={() => setIsDetailModalOpen(false)}
                    handleOpenForm={handleOpenForm}
                    handleProjectDelete={handleProjectDelete}
                    handleOpenBriefingModal={handleOpenBriefingModal}
                    handleOpenConfirmationModal={handleOpenConfirmationModal}
                    packages={packages}
                />
            </Modal>

            <Modal isOpen={isBriefingModalOpen} onClose={() => setIsBriefingModalOpen(false)} title="Bagikan Briefing Proyek" size="2xl">
                {selectedProject && (
                    <div className="space-y-4">
                        <textarea value={briefingText} readOnly rows={15} className="input-field w-full text-sm"></textarea>
                        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-brand-border">
                            {icsDataUri && <a href={icsDataUri} download={`${selectedProject.projectName}.ics`} className="button-secondary text-sm">Download .ICS</a>}
                            {googleCalendarLink && <a href={googleCalendarLink} target="_blank" rel="noopener noreferrer" className="button-secondary text-sm">Tambah ke Google Calendar</a>}
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="button-primary inline-flex items-center gap-2">
                                <SendIcon className="w-4 h-4"/> Bagikan ke WhatsApp
                            </a>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={!!activeStatModal} onClose={() => setActiveStatModal(null)} title={activeStatModal ? modalTitles[activeStatModal] : ''} size="2xl">
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    <div className="space-y-3">
                         {modalContentList.length > 0 ? modalContentList.map(project => (
                            <div key={project.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-brand-text-light">{project.projectName}</p>
                                    <p className="text-sm text-brand-text-secondary">{project.clientName}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(project.status, profile.projectStatusConfig)}`}>
                                    {project.status}
                                </span>
                            </div>
                        )) : <p className="text-center text-brand-text-secondary py-8">Tidak ada proyek dalam kategori ini.</p>}
                    </div>
                </div>
            </Modal>

            {confirmationModalState && (
                <ConfirmationModal
                    project={confirmationModalState.project}
                    subStatus={confirmationModalState.subStatus}
                    isFollowUp={confirmationModalState.isFollowUp}
                    clients={clients}
                    teamMembers={teamMembers}
                    setProjects={setProjects}
                    onClose={() => setConfirmationModalState(null)}
                />
            )}

        </div>
    );
};