import React, { useState, useEffect } from 'react';
import { ViewType, Client, Project, TeamMember, Transaction, Package, AddOn, TeamProjectPayment, Profile, FinancialPocket, TeamPaymentRecord, Lead, RewardLedgerEntry, User, Card, Asset, ClientFeedback, Contract, RevisionStatus, NavigationAction, Notification, SocialMediaPost, PromoCode, SOP } from './types';
import { HomeIcon, FolderKanbanIcon, UsersIcon, DollarSignIcon, PlusIcon } from './constants';
import {
  usersService, clientsService, projectsService, teamMembersService, transactionsService,
  packagesService, addOnsService, pocketsService, profileService, teamProjectPaymentsService,
  teamPaymentRecordsService, leadsService, rewardLedgerEntriesService, cardsService,
  assetsService, clientFeedbackService, contractsService, notificationsService,
  socialMediaPostsService, promoCodesService, sopsService
} from './services/database';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Leads from './components/Leads';
import Clients from './components/Clients';
import { Projects } from './components/Projects';
import { Freelancers } from './components/Freelancers';
import Finance from './components/Finance';
import Packages from './components/Packages';
import Assets from './components/Assets';
import Settings from './components/Settings';
import { CalendarView } from './components/CalendarView';
import Login from './components/Login';
import PublicBookingForm from './components/PublicBookingForm';
import PublicFeedbackForm from './components/PublicFeedbackForm';
import PublicRevisionForm from './components/PublicRevisionForm';
import PublicLeadForm from './components/PublicLeadForm';
import Header from './components/Header';
import SuggestionForm from './components/SuggestionForm';
import ClientReports from './components/ClientKPI';
import GlobalSearch from './components/GlobalSearch';
import Contracts from './components/Contracts';
import ClientPortal from './components/ClientPortal';
import FreelancerPortal from './components/FreelancerPortal';
import SocialPlanner from './components/SocialPlanner';
import PromoCodes from './components/PromoCodes';
import SOPManagement from './components/SOP';
import SQLEditor from './components/SQLEditor';

const AccessDenied: React.FC<{onBackToDashboard: () => void}> = ({ onBackToDashboard }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h2 className="text-2xl font-bold text-brand-danger mb-2">Akses Ditolak</h2>
        <p className="text-brand-text-secondary mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <button onClick={onBackToDashboard} className="button-primary">Kembali ke Dashboard</button>
    </div>
);

const BottomNavBar: React.FC<{ activeView: ViewType; handleNavigation: (view: ViewType) => void }> = ({ activeView, handleNavigation }) => {
    const navItems = [
        { view: ViewType.DASHBOARD, label: 'Beranda', icon: HomeIcon },
        { view: ViewType.PROJECTS, label: 'Proyek', icon: FolderKanbanIcon },
        { view: ViewType.CLIENTS, label: 'Klien', icon: UsersIcon },
        { view: ViewType.FINANCE, label: 'Keuangan', icon: DollarSignIcon },
    ];

    return (
        <nav className="bottom-nav xl:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => handleNavigation(item.view)}
                        className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeView === item.view ? 'text-brand-accent' : 'text-brand-text-secondary'}`}
                    >
                        <item.icon className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

const FloatingActionButton: React.FC<{ onAddClick: (type: string) => void }> = ({ onAddClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { label: 'Transaksi', type: 'transaction', icon: <DollarSignIcon className="w-5 h-5" /> },
        { label: 'Proyek', type: 'project', icon: <FolderKanbanIcon className="w-5 h-5" /> },
        { label: 'Klien', type: 'client', icon: <UsersIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="fixed bottom-20 right-5 z-40 xl:hidden">
             {isOpen && (
                <div className="flex flex-col items-end gap-3 mb-3">
                    {actions.map(action => (
                         <div key={action.type} className="flex items-center gap-2">
                             <span className="text-sm font-semibold bg-brand-surface text-brand-text-primary px-3 py-1.5 rounded-lg shadow-md">{action.label}</span>
                             <button
                                onClick={() => { onAddClick(action.type); setIsOpen(false); }}
                                className="w-12 h-12 rounded-full bg-brand-surface text-brand-text-primary shadow-lg flex items-center justify-center"
                            >
                                {action.icon}
                            </button>
                         </div>
                    ))}
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-transform duration-200 ${isOpen ? 'rotate-45 bg-brand-danger' : 'bg-brand-accent'}`}
            >
                <PlusIcon className="w-8 h-8" />
            </button>
        </div>
    );
};


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
  const [notification, setNotification] = useState<string>('');
  const [initialAction, setInitialAction] = useState<NavigationAction | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [route, setRoute] = useState(window.location.hash);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
        setRoute(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load all data from Supabase
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [
          usersData, clientsData, projectsData, teamMembersData, transactionsData,
          packagesData, addOnsData, pocketsData, profileData, teamProjectPaymentsData,
          teamPaymentRecordsData, leadsData, rewardLedgerEntriesData, cardsData,
          assetsData, clientFeedbackData, contractsData, notificationsData,
          socialMediaPostsData, promoCodesData, sopsData
        ] = await Promise.all([
          usersService.getAll(),
          clientsService.getAll(),
          projectsService.getAll(),
          teamMembersService.getAll(),
          transactionsService.getAll(),
          packagesService.getAll(),
          addOnsService.getAll(),
          pocketsService.getAll(),
          profileService.get(),
          teamProjectPaymentsService.getAll(),
          teamPaymentRecordsService.getAll(),
          leadsService.getAll(),
          rewardLedgerEntriesService.getAll(),
          cardsService.getAll(),
          assetsService.getAll(),
          clientFeedbackService.getAll(),
          contractsService.getAll(),
          notificationsService.getAll(),
          socialMediaPostsService.getAll(),
          promoCodesService.getAll(),
          sopsService.getAll()
        ]);

        setUsers(usersData || []);
        setClients(clientsData || []);
        setProjects(projectsData || []);
        setTeamMembers(teamMembersData || []);
        setTransactions(transactionsData || []);
        setPackages(packagesData || []);
        setAddOns(addOnsData || []);
        setPockets(pocketsData || []);
        setProfile(profileData);
        setTeamProjectPayments(teamProjectPaymentsData || []);
        setTeamPaymentRecords(teamPaymentRecordsData || []);
        setLeads(leadsData || []);
        setRewardLedgerEntries(rewardLedgerEntriesData || []);
        setCards(cardsData || []);
        setAssets(assetsData || []);
        setClientFeedback(clientFeedbackData || []);
        setContracts(contractsData || []);
        setNotifications(notificationsData || []);
        setSocialMediaPosts(socialMediaPostsData || []);
        setPromoCodes(promoCodesData || []);
        setSops(sopsData || []);
      } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data from database');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  // CRUD functions that will be passed to components
  const crudFunctions = {
    clients: {
      create: async (client: Omit<Client, 'id'>) => {
        try {
          const newClient = await clientsService.create(client);
          setClients(prev => [...prev, newClient]);
          showNotification('Client berhasil ditambahkan');
          return newClient;
        } catch (error) {
          showNotification('Error menambahkan client');
          throw error;
        }
      },
      update: async (id: string, client: Partial<Client>) => {
        try {
          const updatedClient = await clientsService.update(id, client);
          setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
          showNotification('Client berhasil diupdate');
          return updatedClient;
        } catch (error) {
          showNotification('Error mengupdate client');
          throw error;
        }
      },
      delete: async (id: string) => {
        try {
          await clientsService.delete(id);
          setClients(prev => prev.filter(c => c.id !== id));
          showNotification('Client berhasil dihapus');
        } catch (error) {
          showNotification('Error menghapus client');
          throw error;
        }
      }
    },
    projects: {
      create: async (project: Omit<Project, 'id'>) => {
        try {
          const newProject = await projectsService.create(project);
          setProjects(prev => [...prev, newProject]);
          showNotification('Proyek berhasil ditambahkan');
          return newProject;
        } catch (error) {
          showNotification('Error menambahkan proyek');
          throw error;
        }
      },
      update: async (id: string, project: Partial<Project>) => {
        try {
          const updatedProject = await projectsService.update(id, project);
          setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
          showNotification('Proyek berhasil diupdate');
          return updatedProject;
        } catch (error) {
          showNotification('Error mengupdate proyek');
          throw error;
        }
      },
      delete: async (id: string) => {
        try {
          await projectsService.delete(id);
          setProjects(prev => prev.filter(p => p.id !== id));
          showNotification('Proyek berhasil dihapus');
        } catch (error) {
          showNotification('Error menghapus proyek');
          throw error;
        }
      }
    },
    teamMembers: {
      create: async (teamMember: Omit<TeamMember, 'id'>) => {
        try {
          const newTeamMember = await teamMembersService.create(teamMember);
          setTeamMembers(prev => [...prev, newTeamMember]);
          showNotification('Team member berhasil ditambahkan');
          return newTeamMember;
        } catch (error) {
          showNotification('Error menambahkan team member');
          throw error;
        }
      },
      update: async (id: string, teamMember: Partial<TeamMember>) => {
        try {
          const updatedTeamMember = await teamMembersService.update(id, teamMember);
          setTeamMembers(prev => prev.map(tm => tm.id === id ? updatedTeamMember : tm));
          showNotification('Team member berhasil diupdate');
          return updatedTeamMember;
        } catch (error) {
          showNotification('Error mengupdate team member');
          throw error;
        }
      },
      delete: async (id: string) => {
        try {
          await teamMembersService.delete(id);
          setTeamMembers(prev => prev.filter(tm => tm.id !== id));
          showNotification('Team member berhasil dihapus');
        } catch (error) {
          showNotification('Error menghapus team member');
          throw error;
        }
      }
    },
    transactions: {
      create: async (transaction: Omit<Transaction, 'id'>) => {
        try {
          const newTransaction = await transactionsService.create(transaction);
          setTransactions(prev => [...prev, newTransaction]);
          showNotification('Transaksi berhasil ditambahkan');
          return newTransaction;
        } catch (error) {
          showNotification('Error menambahkan transaksi');
          throw error;
        }
      },
      update: async (id: string, transaction: Partial<Transaction>) => {
        try {
          const updatedTransaction = await transactionsService.update(id, transaction);
          setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
          showNotification('Transaksi berhasil diupdate');
          return updatedTransaction;
        } catch (error) {
          showNotification('Error mengupdate transaksi');
          throw error;
        }
      },
      delete: async (id: string) => {
        try {
          await transactionsService.delete(id);
          setTransactions(prev => prev.filter(t => t.id !== id));
          showNotification('Transaksi berhasil dihapus');
        } catch (error) {
          showNotification('Error menghapus transaksi');
          throw error;
        }
      }
    },
    packages: {
      create: async (package_: Omit<Package, 'id'>) => {
        try {
          const newPackage = await packagesService.create(package_);
          setPackages(prev => [...prev, newPackage]);
          showNotification('Paket berhasil ditambahkan');
          return newPackage;
        } catch (error) {
          showNotification('Error menambahkan paket');
          throw error;
        }
      },
      update: async (id: string, package_: Partial<Package>) => {
        try {
          const updatedPackage = await packagesService.update(id, package_);
          setPackages(prev => prev.map(p => p.id === id ? updatedPackage : p));
          showNotification('Paket berhasil diupdate');
          return updatedPackage;
        } catch (error) {
          showNotification('Error mengupdate paket');
          throw error;
        }
      },
      delete: async (id: string) => {
        try {
          await packagesService.delete(id);
          setPackages(prev => prev.filter(p => p.id !== id));
          showNotification('Paket berhasil dihapus');
        } catch (error) {
          showNotification('Error menghapus paket');
          throw error;
        }
      }
    },
    addOns: {
      create: async (addOn: Omit<AddOn, 'id'>) => {
        try {
          const newAddOn = await addOnsService.create(addOn);
          setAddOns(prev => [...prev, newAddOn]);
          showNotification('Add-on berhasil ditambahkan');
          return newAddOn;
        } catch (error) {
          showNotification('Error menambahkan add-on');
          throw error;
        }
      },
      update: async (id: string, addOn: Partial<AddOn>) => {
        try {
          const updatedAddOn = await addOnsService.update(id, addOn);
          setAddOns(prev => prev.map(a => a.id === id ? updatedAddOn : a));
          showNotification('Add-on berhasil diupdate');
          return updatedAddOn;
        } catch (error) {
          showNotification('Error mengupdate add-on');
          throw error;
        }
      },
      delete: async (id: string) => {
        try {
          await addOnsService.delete(id);
          setAddOns(prev => prev.filter(a => a.id !== id));
          showNotification('Add-on berhasil dihapus');
        } catch (error) {
          showNotification('Error menghapus add-on');
          throw error;
        }
      }
    },
    // Add similar CRUD functions for other entities...
  };

  // Lifted State for global management and integration
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [teamProjectPayments, setTeamProjectPayments] = useState<TeamProjectPayment[]>([]);
  const [teamPaymentRecords, setTeamPaymentRecords] = useState<TeamPaymentRecord[]>([]);
  const [pockets, setPockets] = useState<FinancialPocket[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [rewardLedgerEntries, setRewardLedgerEntries] = useState<RewardLedgerEntry[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clientFeedback, setClientFeedback] = useState<ClientFeedback[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);

  const showNotification = (message: string, duration: number = 3000) => {
    setNotification(message);
    setTimeout(() => {
      setNotification('');
    }, duration);
  };

  const handleLoginSuccess = (user: User) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setActiveView(ViewType.DASHBOARD);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNavigation = (view: ViewType, action?: NavigationAction, notificationId?: string) => {
    setActiveView(view);
    setInitialAction(action || null);
    setIsSidebarOpen(false); // Close sidebar on navigation
    setIsSearchOpen(false); // Close search on navigation
    if (notificationId) {
        handleMarkAsRead(notificationId);
    }
  };

  const handleUpdateRevision = (projectId: string, revisionId: string, updatedData: { freelancerNotes: string, driveLink: string, status: RevisionStatus }) => {
    setProjects(prevProjects => {
        return prevProjects.map(p => {
            if (p.id === projectId) {
                const updatedRevisions = (p.revisions || []).map(r => {
                    if (r.id === revisionId) {
                        return { 
                            ...r, 
                            freelancerNotes: updatedData.freelancerNotes,
                            driveLink: updatedData.driveLink,
                            status: updatedData.status,
                            completedDate: updatedData.status === RevisionStatus.COMPLETED ? new Date().toISOString() : r.completedDate,
                        };
                    }
                    return r;
                });
                return { ...p, revisions: updatedRevisions };
            }
            return p;
        });
    });
    showNotification("Update revisi telah berhasil dikirim.");
  };

    const handleClientConfirmation = (projectId: string, stage: 'editing' | 'printing' | 'delivery') => {
        setProjects(prevProjects => {
            return prevProjects.map(p => {
                if (p.id === projectId) {
                    const updatedProject = { ...p };
                    if (stage === 'editing') updatedProject.isEditingConfirmedByClient = true;
                    if (stage === 'printing') updatedProject.isPrintingConfirmedByClient = true;
                    if (stage === 'delivery') updatedProject.isDeliveryConfirmedByClient = true;
                    return updatedProject;
                }
                return p;
            });
        });
        showNotification("Konfirmasi telah diterima. Terima kasih!");
    };

    const handleClientSubStatusConfirmation = (projectId: string, subStatusName: string, note: string) => {
        let project: Project | undefined;
        setProjects(prevProjects => {
            const updatedProjects = prevProjects.map(p => {
                if (p.id === projectId) {
                    const confirmed = [...(p.confirmedSubStatuses || []), subStatusName];
                    const notes = { ...(p.clientSubStatusNotes || {}), [subStatusName]: note };
                    project = { ...p, confirmedSubStatuses: confirmed, clientSubStatusNotes: notes };
                    return project;
                }
                return p;
            });
            return updatedProjects;
        });

        if (project) {
            const newNotification: Notification = {
                id: `NOTIF-NOTE-${Date.now()}`,
                title: 'Catatan Klien Baru',
                message: `Klien ${project.clientName} memberikan catatan pada sub-status "${subStatusName}" di proyek "${project.projectName}".`,
                timestamp: new Date().toISOString(),
                isRead: false,
                icon: 'comment',
                link: {
                    view: ViewType.PROJECTS,
                    action: { type: 'VIEW_PROJECT_DETAILS', id: projectId }
                }
            };
            setNotifications(prev => [newNotification, ...prev]);
        }

        showNotification(`Konfirmasi untuk "${subStatusName}" telah diterima.`);
    };

    const handleSignContract = (contractId: string, signatureDataUrl: string, signer: 'vendor' | 'client') => {
        setContracts(prevContracts => {
            return prevContracts.map(c => {
                if (c.id === contractId) {
                    return {
                        ...c,
                        ...(signer === 'vendor' ? { vendorSignature: signatureDataUrl } : { clientSignature: signatureDataUrl })
                    };
                }
                return c;
            });
        });
        showNotification('Tanda tangan berhasil disimpan.');
    };

    const handleSignInvoice = (projectId: string, signatureDataUrl: string) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, invoiceSignature: signatureDataUrl } : p));
        showNotification('Invoice berhasil ditandatangani.');
    };

    const handleSignTransaction = (transactionId: string, signatureDataUrl: string) => {
        setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, vendorSignature: signatureDataUrl } : t));
        showNotification('Kuitansi berhasil ditandatangani.');
    };

    const handleSignPaymentRecord = (recordId: string, signatureDataUrl: string) => {
        setTeamPaymentRecords(prev => prev.map(r => r.id === recordId ? { ...r, vendorSignature: signatureDataUrl } : r));
        showNotification('Slip pembayaran berhasil ditandatangani.');
    };

    // Placeholder functions for new contract CRUD operations
    const handleContractSubmit = async (contract: Omit<Contract, 'id'>) => {
      try {
        const newContract = await contractsService.create(contract);
        setContracts(prev => [...prev, newContract]);
        showNotification('Kontrak berhasil ditambahkan');
        return newContract;
      } catch (error) {
        showNotification('Error menambahkan kontrak');
        throw error;
      }
    };

    const handleContractEdit = async (id: string, contract: Partial<Contract>) => {
      try {
        const updatedContract = await contractsService.update(id, contract);
        setContracts(prev => prev.map(c => c.id === id ? updatedContract : c));
        showNotification('Kontrak berhasil diupdate');
        return updatedContract;
      } catch (error) {
        showNotification('Error mengupdate kontrak');
        throw error;
      }
    };

    const handleContractDelete = async (id: string) => {
      try {
        await contractsService.delete(id);
        setContracts(prev => prev.filter(c => c.id !== id));
        showNotification('Kontrak berhasil dihapus');
      } catch (error) {
        showNotification('Error menghapus kontrak');
        throw error;
      }
    };

    // Placeholder functions for profile and user CRUD operations
    const handleProfileUpdate = async (profileData: Partial<Profile>) => {
      try {
        const updatedProfile = await profileService.update(profileData);
        setProfile(updatedProfile);
        showNotification('Profil berhasil diupdate');
        return updatedProfile;
      } catch (error) {
        showNotification('Error mengupdate profil');
        throw error;
      }
    };

    const handleUserCreate = async (userData: Omit<User, 'id'>) => {
      try {
        const newUser = await usersService.create(userData);
        setUsers(prev => [...prev, newUser]);
        showNotification('User berhasil ditambahkan');
        return newUser;
      } catch (error) {
        showNotification('Error menambahkan user');
        throw error;
      }
    };

    const handleUserUpdate = async (id: string, userData: Partial<User>) => {
      try {
        const updatedUser = await usersService.update(id, userData);
        setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
        showNotification('User berhasil diupdate');
        return updatedUser;
      } catch (error) {
        showNotification('Error mengupdate user');
        throw error;
      }
    };

    const handleUserDelete = async (id: string) => {
      try {
        await usersService.delete(id);
        setUsers(prev => prev.filter(u => u.id !== id));
        showNotification('User berhasil dihapus');
      } catch (error) {
        showNotification('Error menghapus user');
        throw error;
      }
    };


  const hasPermission = (view: ViewType) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    if (view === ViewType.DASHBOARD) return true;
    return currentUser.permissions?.includes(view) || false;
  };

  const renderView = () => {
    if (!hasPermission(activeView)) {
        return <AccessDenied onBackToDashboard={() => setActiveView(ViewType.DASHBOARD)} />;
    }
    switch (activeView) {
      case ViewType.DASHBOARD:
        return <Dashboard 
          projects={projects} 
          clients={clients} 
          transactions={transactions} 
          teamMembers={teamMembers}
          cards={cards}
          pockets={pockets}
          handleNavigation={handleNavigation}
          leads={leads}
          teamProjectPayments={teamProjectPayments}
          packages={packages}
          assets={assets}
          clientFeedback={clientFeedback}
          contracts={contracts}
          currentUser={currentUser}
          projectStatusConfig={profile?.projectStatusConfig || []}
        />;
      case ViewType.PROSPEK:
        return <Leads
            leads={leads} setLeads={setLeads}
            clients={clients} setClients={setClients}
            projects={projects} setProjects={setProjects}
            packages={packages} addOns={addOns}
            transactions={transactions} setTransactions={setTransactions}
            userProfile={profile} showNotification={showNotification}
            cards={cards} setCards={setCards}
            pockets={pockets} setPockets={setPockets}
            promoCodes={promoCodes} setPromoCodes={setPromoCodes}
        />;
      case ViewType.CLIENTS:
        return <Clients
          clients={clients} setClients={setClients}
          projects={projects} setProjects={setProjects}
          packages={packages} addOns={addOns}
          transactions={transactions} setTransactions={setTransactions}
          userProfile={profile}
          showNotification={showNotification}
          initialAction={initialAction} setInitialAction={setInitialAction}
          cards={cards} setCards={setCards}
          pockets={pockets} setPockets={setPockets}
          contracts={contracts}
          handleNavigation={handleNavigation}
          clientFeedback={clientFeedback}
          promoCodes={promoCodes} setPromoCodes={setPromoCodes}
          onSignInvoice={handleSignInvoice}
          onSignTransaction={handleSignTransaction}
        />;
      case ViewType.PROJECTS:
        return <Projects 
          projects={projects} setProjects={setProjects}
          clients={clients}
          packages={packages}
          teamMembers={teamMembers}
          teamProjectPayments={teamProjectPayments} setTeamProjectPayments={setTeamProjectPayments}
          transactions={transactions} setTransactions={setTransactions}
          initialAction={initialAction} setInitialAction={setInitialAction}
          profile={profile}
          showNotification={showNotification}
          cards={cards}
          setCards={setCards}
        />;
      case ViewType.TEAM:
        return (
          <Freelancers
            teamMembers={teamMembers}
            setTeamMembers={setTeamMembers}
            teamProjectPayments={teamProjectPayments}
            setTeamProjectPayments={setTeamProjectPayments}
            teamPaymentRecords={teamPaymentRecords}
            setTeamPaymentRecords={setTeamPaymentRecords}
            transactions={transactions}
            setTransactions={setTransactions}
            userProfile={profile}
            showNotification={showNotification}
            initialAction={initialAction}
            setInitialAction={setInitialAction}
            projects={projects}
            setProjects={setProjects}
            rewardLedgerEntries={rewardLedgerEntries}
            setRewardLedgerEntries={setRewardLedgerEntries}
            pockets={pockets}
            setPockets={setPockets}
            cards={cards}
            setCards={setCards}
            onSignPaymentRecord={handleSignPaymentRecord}
          />
        );
      case ViewType.FINANCE:
        return <Finance 
          transactions={transactions} setTransactions={setTransactions}
          pockets={pockets} setPockets={setPockets}
          projects={projects}
          profile={profile}
          cards={cards} setCards={setCards}
          teamMembers={teamMembers}
          rewardLedgerEntries={rewardLedgerEntries}
        />;
      case ViewType.PACKAGES:
        return <Packages packages={packages} setPackages={setPackages} addOns={addOns} setAddOns={setAddOns} projects={projects} />;
      case ViewType.ASSETS:
        return <Assets assets={assets} setAssets={setAssets} profile={profile} showNotification={showNotification} />;
      case ViewType.CONTRACTS:
        return <Contracts 
            contracts={contracts} setContracts={setContracts}
            clients={clients} projects={projects} profile={profile}
            showNotification={showNotification}
            initialAction={initialAction} setInitialAction={setInitialAction}
            packages={packages}
            onSignContract={handleSignContract}
            onContractSubmit={handleContractSubmit}
            onContractEdit={handleContractEdit}
            onContractDelete={handleContractDelete}
        />;
      case ViewType.SQL_EDITOR:
        return <SQLEditor />;
      case ViewType.SETTINGS:
        return <Settings 
            profile={profile || {
              fullName: '',
              email: '',
              phone: '',
              companyName: '',
              website: '',
              address: '',
              bankAccount: '',
              authorizedSigner: '',
              bio: '',
              incomeCategories: [],
              expenseCategories: [],
              projectTypes: [],
              eventTypes: [],
              assetCategories: [],
              sopCategories: [],
              projectStatusConfig: [],
              notificationSettings: { newProject: true, paymentConfirmation: true, deadlineReminder: true },
              securitySettings: { twoFactorEnabled: false },
              briefingTemplate: ''
            }} 
            onSave={handleProfileUpdate}
            transactions={transactions} 
            projects={projects}
            users={users} 
            setUsers={setUsers}
            currentUser={currentUser}
          />;
      case ViewType.CALENDAR:
        return <CalendarView projects={projects} setProjects={setProjects} teamMembers={teamMembers} profile={profile} />;
      case ViewType.CLIENT_REPORTS:
        return <ClientReports 
            clients={clients}
            leads={leads}
            projects={projects}
            feedback={clientFeedback}
            setFeedback={setClientFeedback}
            showNotification={showNotification}
        />;
      case ViewType.SOCIAL_MEDIA_PLANNER:
        return <SocialPlanner posts={socialMediaPosts} setPosts={setSocialMediaPosts} projects={projects} showNotification={showNotification} />;
      case ViewType.PROMO_CODES:
        return <PromoCodes promoCodes={promoCodes} setPromoCodes={setPromoCodes} projects={projects} showNotification={showNotification} />;
      default:
        return <Dashboard 
          projects={projects} 
          clients={clients} 
          transactions={transactions} 
          teamMembers={teamMembers}
          cards={cards}
          pockets={pockets}
          handleNavigation={handleNavigation}
          leads={leads}
          teamProjectPayments={teamProjectPayments}
          packages={packages}
          assets={assets}
          clientFeedback={clientFeedback}
          contracts={contracts}
          currentUser={currentUser}
          projectStatusConfig={profile?.projectStatusConfig || []}
        />;
    }
  };

  // ROUTING FOR PUBLIC PAGES
  if (route.startsWith('#/public-booking')) {
    return <PublicBookingForm 
        setClients={setClients}
        setProjects={setProjects}
        packages={packages}
        addOns={addOns}
        setTransactions={setTransactions}
        userProfile={profile}
        cards={cards}
        setCards={setCards}
        pockets={pockets}
        setPockets={setPockets}
        promoCodes={promoCodes}
        setPromoCodes={setPromoCodes}
        showNotification={showNotification}
        setLeads={setLeads}
    />;
  }
  if (route.startsWith('#/public-lead-form')) {
    return <PublicLeadForm 
        setLeads={setLeads}
        userProfile={profile}
        showNotification={showNotification}
    />;
  }
  if (route.startsWith('#/feedback')) {
    return <PublicFeedbackForm setClientFeedback={setClientFeedback} />;
  }
  if (route.startsWith('#/suggestion-form')) {
    return <SuggestionForm setLeads={setLeads} />;
  }
  if (route.startsWith('#/revision-form')) {
    return <PublicRevisionForm projects={projects} teamMembers={teamMembers} onUpdateRevision={handleUpdateRevision} />;
  }
  if (route.startsWith('#/portal/')) {
    const accessId = route.split('/portal/')[1];
    return <ClientPortal 
        accessId={accessId} 
        clients={clients} 
        projects={projects} 
        setClientFeedback={setClientFeedback} 
        showNotification={showNotification} 
        contracts={contracts} 
        transactions={transactions}
        profile={profile}
        packages={packages}
        onClientConfirmation={handleClientConfirmation}
        onClientSubStatusConfirmation={handleClientSubStatusConfirmation}
        onSignContract={handleSignContract}
    />;
  }
  if (route.startsWith('#/freelancer-portal/')) {
    const accessId = route.split('/freelancer-portal/')[1];
    return <FreelancerPortal 
        accessId={accessId} 
        teamMembers={teamMembers} 
        projects={projects} 
        teamProjectPayments={teamProjectPayments}
        teamPaymentRecords={teamPaymentRecords}
        rewardLedgerEntries={rewardLedgerEntries}
        showNotification={showNotification}
        onUpdateRevision={handleUpdateRevision}
        sops={sops}
        profile={profile}
    />;
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} users={users} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-accent mx-auto"></div>
          <p className="mt-4 text-brand-text-secondary">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-brand-text-secondary">No profile found. Please set up your profile first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-bg text-brand-text-primary">
      <Sidebar 
        activeView={activeView} 
        setActiveView={(view) => handleNavigation(view)} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
        currentUser={currentUser}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            pageTitle={activeView} 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            setIsSearchOpen={setIsSearchOpen}
            notifications={notifications}
            handleNavigation={handleNavigation}
            handleMarkAllAsRead={handleMarkAllAsRead}
            currentUser={currentUser}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 xl:pb-8">
            {renderView()}
        </main>
      </div>
      {notification && (
        <div className="fixed top-5 right-5 bg-brand-accent text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-out">
          {notification}
        </div>
      )}
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        clients={clients}
        projects={projects}
        teamMembers={teamMembers}
        handleNavigation={handleNavigation}
      />
      <BottomNavBar activeView={activeView} handleNavigation={handleNavigation} />
      {/* <FloatingActionButton onAddClick={(type) => console.log('Add', type)} /> */}
    </div>
  );
};

export default App;