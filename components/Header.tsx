import React, { useState, useEffect, useRef } from 'react';
import { ViewType, User, Notification, NavigationAction } from '../types';
import { LightbulbIcon, ClockIcon, CheckSquareIcon, MessageSquareIcon, DollarSignIcon, UsersIcon } from '../constants';

interface HeaderProps {
    pageTitle: ViewType;
    toggleSidebar: () => void;
    setIsSearchOpen: (isOpen: boolean) => void;
    notifications: Notification[];
    handleNavigation: (view: ViewType, action?: NavigationAction, notificationId?: string) => void;
    handleMarkAllAsRead: () => void;
    currentUser: User | null;
}

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
    </svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>
);

const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}m lalu`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}j lalu`;

    const days = Math.floor(hours / 24);
    return `${days}h lalu`;
};

const notificationIcons: { [key in Notification['icon']]: React.ReactNode } = {
    lead: <LightbulbIcon className="w-5 h-5 text-yellow-400" />,
    deadline: <ClockIcon className="w-5 h-5 text-orange-400" />,
    revision: <CheckSquareIcon className="w-5 h-5 text-purple-400" />,
    feedback: <MessageSquareIcon className="w-5 h-5 text-blue-400" />,
    payment: <DollarSignIcon className="w-5 h-5 text-red-400" />,
    completed: <CheckSquareIcon className="w-5 h-5 text-green-400" />,
    comment: <MessageSquareIcon className="w-5 h-5 text-cyan-400" />,
};

const Header: React.FC<HeaderProps> = ({ pageTitle, toggleSidebar, setIsSearchOpen, notifications, handleNavigation, handleMarkAllAsRead, currentUser }) => {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onNotificationClick = (notification: Notification) => {
        if (notification.link) {
            handleNavigation(notification.link.view, notification.link.action, notification.id);
        }
        setIsNotifOpen(false);
    };

    return (
        <header id="app-header" className="flex-shrink-0 bg-brand-surface flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 border-b border-brand-border">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="text-brand-text-secondary p-2 -ml-2 rounded-md hover:bg-brand-input xl:hidden"
                    aria-label="Toggle sidebar"
                >
                    <MenuIcon className="h-6 w-6" />
                </button>
                 <h1 className="hidden lg:block text-xl font-bold text-brand-text-light ml-2 lg:ml-0">{pageTitle}</h1>

                 {/* Mobile Header */}
                 <div className="lg:hidden flex items-center gap-3 ml-2">
                     <div className="w-10 h-10 rounded-full bg-brand-input flex items-center justify-center">
                         <UsersIcon className="w-6 h-6 text-brand-text-secondary" />
                     </div>
                     <div>
                         <p className="text-xs text-brand-text-secondary">Selamat Datang</p>
                         <p className="font-bold text-brand-text-light -mt-1">{currentUser?.fullName.split(' ')[0]}</p>
                     </div>
                 </div>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2.5 text-brand-text-secondary hover:text-brand-text-light rounded-full hover:bg-brand-input"
                    aria-label="Buka pencarian global"
                >
                    <SearchIcon className="w-5 h-5" />
                </button>
                
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setIsNotifOpen(prev => !prev)}
                        className="relative p-2.5 text-brand-text-secondary hover:text-brand-text-light rounded-full hover:bg-brand-input"
                    >
                        <BellIcon className="w-5 h-5" />
                         {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-danger opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-brand-surface"></span>
                            </span>
                         )}
                    </button>
                    {isNotifOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-brand-surface rounded-xl shadow-2xl border border-brand-border z-50 animate-fade-in-down">
                            <div className="flex justify-between items-center p-4 border-b border-brand-border">
                                <h4 className="font-semibold text-brand-text-light">Notifikasi</h4>
                                {unreadCount > 0 && <button onClick={handleMarkAllAsRead} className="text-xs font-semibold text-brand-accent hover:underline">Tandai semua dibaca</button>}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notif => (
                                        <div 
                                            key={notif.id}
                                            onClick={() => onNotificationClick(notif)}
                                            className={`flex items-start gap-3 p-4 border-b border-brand-border last:border-b-0 cursor-pointer transition-colors ${notif.isRead ? 'opacity-60' : 'bg-blue-500/5 hover:bg-blue-500/10'}`}
                                        >
                                            <div className="flex-shrink-0 mt-0.5">{notificationIcons[notif.icon]}</div>
                                            <div className="flex-grow">
                                                <p className="font-semibold text-sm text-brand-text-light">{notif.title}</p>
                                                <p className="text-xs text-brand-text-secondary">{notif.message}</p>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className="text-xs text-brand-text-secondary">{getRelativeTime(notif.timestamp)}</p>
                                                {!notif.isRead && <div className="w-2 h-2 bg-brand-accent rounded-full ml-auto mt-1"></div>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-brand-text-secondary p-8">Tidak ada notifikasi.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-down { animation: fadeInDown 0.2s ease-out forwards; }
            `}</style>
        </header>
    );
};

export default Header;