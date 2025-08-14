import React, { useState, useMemo, useEffect } from 'react';
import { Project, TeamMember, CalendarEvent, Profile, AssignedTeamMember, ProjectStatusConfig, PaymentStatus } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, UsersIcon, FileTextIcon, PlusIcon, MapPinIcon, CalendarIcon } from '../constants';
import Modal from './Modal';
import { calendarEventsService } from '../services/database';
import { useCrud } from '../hooks/useCrud';

// --- HELPER FUNCTIONS ---

const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const eventTypeColors: { [key: string]: string } = {
    'Meeting Klien': '#3b82f6',
    'Survey Lokasi': '#22c55e',
    'Libur': '#94a3b8',
    'Workshop': '#a855f7',
    'Lainnya': '#eab308',
};

const getEventColor = (event: Project, profile: Profile) => {
    const isInternalEvent = profile.eventTypes.includes(event.projectType);
    if (isInternalEvent) {
        return eventTypeColors[event.projectType] || '#64748b';
    }
    return profile.projectStatusConfig.find(s => s.name === event.status)?.color || '#64748b';
};

// --- SUB-COMPONENTS ---

interface CalendarSidebarProps {
    profile: Profile;
    isClientProjectVisible: boolean;
    visibleEventTypes: Set<string>;
    onAddEvent: () => void;
    onClientFilterChange: (isVisible: boolean) => void;
    onEventTypeFilterChange: (eventType: string) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ profile, isClientProjectVisible, visibleEventTypes, onAddEvent, onClientFilterChange, onEventTypeFilterChange }) => (
    <div className="w-64 border-r border-brand-border p-4 flex-col hidden lg:flex">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center font-bold text-brand-text-secondary">
                {getInitials(profile.fullName)}
            </div>
            <div>
                <p className="font-semibold text-sm text-brand-text-light">{profile.fullName.split(' ')[0]}</p>
                <p className="text-xs text-brand-text-secondary">{profile.email}</p>
            </div>
        </div>
        <button onClick={onAddEvent} className="button-primary w-full mb-6 inline-flex items-center justify-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Buat Acara
        </button>

        <h3 className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-2">Filter Kalender</h3>
        <div className="space-y-1">
            <label className="flex items-center p-2 rounded-lg hover:bg-brand-bg cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded" checked={isClientProjectVisible} onChange={(e) => onClientFilterChange(e.target.checked)} style={{accentColor: '#ef4444'}} />
                <span className="ml-2 text-sm font-medium text-brand-text-light">Proyek Klien</span>
            </label>
            {profile.eventTypes.map(type => (
                 <label key={type} className="flex items-center p-2 rounded-lg hover:bg-brand-bg cursor-pointer">
                     <input type="checkbox" className="h-4 w-4 rounded" checked={visibleEventTypes.has(type)} onChange={() => onEventTypeFilterChange(type)} style={{accentColor: eventTypeColors[type] || '#94a3b8'}}/>
                     <span className="w-2 h-2 rounded-full ml-2" style={{backgroundColor: eventTypeColors[type] || '#94a3b8'}}></span>
                     <span className="ml-2 text-sm font-medium text-brand-text-light">{type}</span>
                 </label>
            ))}
        </div>
    </div>
);


interface CalendarHeaderProps {
    currentDate: Date;
    viewMode: 'Month' | 'Agenda';
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    onViewModeChange: (mode: 'Month' | 'Agenda') => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, viewMode, onPrev, onNext, onToday, onViewModeChange }) => (
     <div className="flex-shrink-0 p-4 flex items-center justify-between border-b border-brand-border">
        <div className="flex items-center gap-2">
            <button onClick={onPrev} className="p-2 rounded-full hover:bg-brand-input"><ChevronLeftIcon className="w-5 h-5"/></button>
            <button onClick={onNext} className="p-2 rounded-full hover:bg-brand-input"><ChevronRightIcon className="w-5 h-5"/></button>
            <h2 className="text-lg font-semibold text-brand-text-light ml-2 hidden sm:block">{currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h2>
        </div>
        <button onClick={onToday} className="button-secondary px-3 py-1.5 text-sm">Hari Ini</button>
        <div className="p-1 bg-brand-bg rounded-lg hidden sm:flex">
            {(['Month', 'Agenda'] as const).map(v => (<button key={v} onClick={() => onViewModeChange(v)} className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === v ? 'bg-brand-surface shadow-sm' : 'text-brand-text-secondary'}`}>{v}</button>))}
        </div>
    </div>
);


interface MonthViewProps {
    currentDate: Date;
    daysInMonth: Date[];
    eventsByDate: Map<string, Project[]>;
    profile: Profile;
    onDayClick: (date: Date) => void;
    onEventClick: (event: Project) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, daysInMonth, eventsByDate, profile, onDayClick, onEventClick }) => (
    <div className="grid grid-cols-7 flex-grow h-full">
        {weekdays.map(day => (<div key={day} className="text-center py-2 text-xs font-semibold text-brand-text-secondary border-b border-l border-brand-border">{day}</div>))}
        {daysInMonth.map((day, i) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const events = eventsByDate.get(day.toDateString()) || [];
            return (
                <div key={i} onClick={() => onDayClick(day)} className={`relative border-b border-l border-brand-border p-1.5 flex flex-col min-h-[120px] ${isCurrentMonth ? 'bg-brand-surface' : 'bg-brand-bg'} cursor-pointer hover:bg-brand-input transition-colors`}>
                    <span className={`text-xs font-semibold self-start mb-1 ${isCurrentMonth ? 'text-brand-text-light' : 'text-brand-text-secondary/50'} ${isToday ? 'bg-brand-accent text-white rounded-full w-5 h-5 flex items-center justify-center' : ''}`}>{day.getDate()}</span>
                    <div className="flex-grow space-y-1 overflow-hidden">
                        {events.map(event => {
                            const bgColor = getEventColor(event, profile);
                            return (
                                <div key={event.id} onClick={(e) => { e.stopPropagation(); onEventClick(event); }} className="text-xs p-1.5 rounded text-white truncate cursor-pointer" style={{ backgroundColor: bgColor }}>
                                    {event.image && <img src={event.image} alt={event.projectName} className="h-4 w-full object-cover rounded-sm mb-1"/>}
                                    <p className="font-semibold truncate">{event.projectName}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            );
        })}
    </div>
);


interface AgendaViewProps {
    agendaByDate: [string, Project[]][];
    profile: Profile;
    onEventClick: (event: Project) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({ agendaByDate, profile, onEventClick }) => (
    <div className="p-4 md:p-6">
        {agendaByDate.map(([dateString, eventsOnDate]) => (
            <div key={dateString} className="mb-8">
                <h3 className="font-semibold text-brand-text-light mb-4">{new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                <div className="relative pl-8 border-l-2 border-brand-border">
                    {eventsOnDate.map(event => {
                        const bgColor = getEventColor(event, profile);
                        return (
                            <div key={event.id} className="relative mb-6">
                                <div className="absolute -left-[3.1rem] top-1 text-xs text-brand-text-secondary">{event.startTime}</div>
                                <div className="absolute -left-[0.6rem] top-1 w-4 h-4 rounded-full border-4 border-brand-surface" style={{backgroundColor: bgColor}}></div>
                                <div onClick={() => onEventClick(event)} className="ml-4 p-4 rounded-lg cursor-pointer hover:bg-brand-input" style={{ border: `1px solid ${bgColor}40`, backgroundColor: `${bgColor}10` }}>
                                    <h4 className="font-semibold text-brand-text-light">{event.projectName}</h4>
                                    <p className="text-sm text-brand-text-secondary">{event.projectType}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        ))}
        {agendaByDate.length === 0 && <p className="text-center text-brand-text-secondary py-16">Tidak ada acara mendatang.</p>}
    </div>
);


interface EventPanelProps {
    isOpen: boolean;
    mode: 'detail' | 'edit';
    selectedEvent: Project | null;
    eventForm: any;
    teamMembers: TeamMember[];
    profile: Profile;
    onClose: () => void;
    onSetMode: (mode: 'detail' | 'edit') => void;
    onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onTeamChange: (memberId: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onDelete: () => void;
}

const EventPanel: React.FC<EventPanelProps> = ({ isOpen, mode, selectedEvent, eventForm, teamMembers, profile, onClose, onSetMode, onFormChange, onTeamChange, onSubmit, onDelete }) => (
    <div className={`flex-shrink-0 w-full md:w-96 border-l border-brand-border flex flex-col bg-brand-surface transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full absolute right-0'}`}>
        <div className="p-4 border-b border-brand-border">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-input">
                <ChevronRightIcon className="w-5 h-5"/>
            </button>
        </div>
        <div className="overflow-y-auto flex-1">
            {mode === 'detail' && selectedEvent ? (
                <div className="flex-1 flex flex-col">
                    {selectedEvent.image && <img src={selectedEvent.image} alt={selectedEvent.projectName} className="w-full h-48 object-cover" />}
                    <div className="p-6 flex-1">
                        <h3 className="text-xl font-semibold text-brand-text-light">{selectedEvent.projectName}</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full mt-2 inline-block" style={{ backgroundColor: `${getEventColor(selectedEvent, profile)}30`, color: getEventColor(selectedEvent, profile) }}>{selectedEvent.projectType}</span>
                        <div className="mt-6 space-y-5 text-sm">
                            <div className="flex items-start gap-4"><ClockIcon className="w-5 h-5 text-brand-text-secondary flex-shrink-0 mt-0.5"/><p className="text-brand-text-primary font-medium">{new Date(selectedEvent.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} <br/><span className="text-brand-text-secondary">{selectedEvent.startTime && selectedEvent.endTime ? `${selectedEvent.startTime} - ${selectedEvent.endTime}` : 'Sepanjang hari'}</span></p></div>
                            {selectedEvent.location && (<div className="flex items-start gap-4"><MapPinIcon className="w-5 h-5 text-brand-text-secondary flex-shrink-0 mt-0.5"/><p className="text-brand-text-primary font-medium">{selectedEvent.location}</p></div>)}
                            {selectedEvent.team.length > 0 && (<div className="flex items-start gap-4"><UsersIcon className="w-5 h-5 text-brand-text-secondary flex-shrink-0 mt-0.5"/><div><p className="font-medium text-brand-text-light mb-2">Tim yang Bertugas</p><div className="flex items-center -space-x-2">{selectedEvent.team.map(t => (<div key={t.memberId} className="w-8 h-8 rounded-full bg-brand-input flex items-center justify-center text-xs font-bold text-brand-text-secondary border-2 border-brand-surface" title={t.name}>{getInitials(t.name)}</div>))}</div></div></div>)}
                            {selectedEvent.notes && <div className="flex items-start gap-4"><FileTextIcon className="w-5 h-5 text-brand-text-secondary flex-shrink-0 mt-0.5"/><p className="text-brand-text-primary whitespace-pre-wrap">{selectedEvent.notes}</p></div>}
                        </div>
                    </div>
                    <div className="p-6 border-t border-brand-border"><button onClick={() => onSetMode('edit')} className="button-primary w-full">Edit Detail Acara</button></div>
                </div>
            ) : (
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-brand-text-light mb-6">{selectedEvent ? 'Edit Detail Acara' : 'Buat Acara Baru'}</h3>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="input-group"><input type="text" id="eventName" name="projectName" value={eventForm.projectName} onChange={onFormChange} className="input-field" placeholder=" " required/><label htmlFor="eventName" className="input-label">Nama Acara</label></div>
                        <div className="input-group"><select name="projectType" id="projectType" value={eventForm.projectType} onChange={onFormChange} className="input-field">{profile.eventTypes.map(type => <option key={type} value={type}>{type}</option>)}</select><label htmlFor="projectType" className="input-label">Jenis Acara</label></div>
                        <div className="input-group"><input type="date" id="eventDate" name="date" value={eventForm.date} onChange={onFormChange} className="input-field" placeholder=" " required/><label htmlFor="eventDate" className="input-label">Tanggal</label></div>
                        <div className="grid grid-cols-2 gap-4"><div className="input-group"><input type="time" id="startTime" name="startTime" value={eventForm.startTime} onChange={onFormChange} className="input-field" placeholder=" "/><label htmlFor="startTime" className="input-label">Mulai</label></div><div className="input-group"><input type="time" id="endTime" name="endTime" value={eventForm.endTime} onChange={onFormChange} className="input-field" placeholder=" "/><label htmlFor="endTime" className="input-label">Selesai</label></div></div>
                        <div className="input-group"><input type="url" id="imageUrl" name="image" value={eventForm.image} onChange={onFormChange} className="input-field" placeholder=" "/><label htmlFor="imageUrl" className="input-label">URL Gambar Sampul (Opsional)</label></div>
                        <div className="input-group"><label className="input-label !static !-top-4 !text-brand-accent">Tim</label><div className="p-3 border border-brand-border bg-brand-bg rounded-md max-h-32 overflow-y-auto space-y-2 mt-2">{teamMembers.map(member => (<label key={member.id} className="flex items-center"><input type="checkbox" checked={eventForm.team.some((t:any) => t.memberId === member.id)} onChange={() => onTeamChange(member.id)} /><span className="ml-2 text-sm">{member.name}</span></label>))}</div></div>
                        <div className="input-group"><textarea name="notes" id="eventNotes" value={eventForm.notes} onChange={onFormChange} className="input-field" rows={3} placeholder=" "></textarea><label htmlFor="eventNotes" className="input-label">Catatan</label></div>
                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-brand-border">
                            {selectedEvent && (<button type="button" onClick={onDelete} className="text-brand-danger hover:underline text-sm font-semibold">Hapus Acara</button>)}
                            <div className="flex-grow text-right space-x-2"><button type="button" onClick={mode === 'edit' && selectedEvent ? () => onSetMode('detail') : onClose} className="button-secondary">Batal</button><button type="submit" className="button-primary">{selectedEvent ? 'Update' : 'Simpan'}</button></div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    </div>
);


// --- MAIN COMPONENT ---
interface CalendarViewProps {
    projects: Project[];
    teamMembers: TeamMember[];
    calendarEvents: CalendarEvent[];
    setCalendarEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
    profile: Profile;
    showNotification: (message: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ projects, teamMembers, calendarEvents, setCalendarEvents, profile, showNotification }) => {
    // CRUD hooks
    const eventsCrud = useCrud(calendarEventsService, showNotification, 'Event');

    // Sync with parent state
    React.useEffect(() => {
        setCalendarEvents(eventsCrud.items);
    }, [eventsCrud.items, setCalendarEvents]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'Month' | 'Agenda'>('Month');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
    const [eventFormData, setEventFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        location: '',
        attendees: [] as string[],
        isAllDay: false,
        category: 'meeting' as CalendarEvent['category']
    });

    const [filters, setFilters] = useState<{
        isClientProjectVisible: boolean;
        visibleEventTypes: Set<string>;
    }>({
        isClientProjectVisible: true,
        visibleEventTypes: new Set(profile.eventTypes)
    });

    // MEMOS
    const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
    const lastDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), [currentDate]);

    const daysInMonthGrid = useMemo(() => {
        const days = [];
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDay() === 0 ? 1 : startDate.getDate() - startDate.getDay()); // Start from Sunday if first day is not Sunday
        const endDate = new Date(lastDayOfMonth);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
        let date = new Date(startDate); // Create a copy to avoid modifying the original startDate
        while (date <= endDate) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [firstDayOfMonth, lastDayOfMonth]);

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const isInternalEvent = profile.eventTypes.includes(p.projectType);
            if (isInternalEvent) {
                return filters.visibleEventTypes.has(p.projectType);
            }
            return filters.isClientProjectVisible;
        });
    }, [projects, filters, profile.eventTypes]);

     const agendaByDate = useMemo(() => {
        const today = new Date(); today.setHours(0,0,0,0);
        const map = new Map<string, Project[]>();
        filteredProjects
            .filter(event => new Date(event.date) >= today)
            .sort((a,b) => {
                const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
                if (dateDiff !== 0) return dateDiff;
                if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
                return 0;
            })
            .forEach(event => {
                const dateKey = new Date(event.date).toDateString();
                if (!map.has(dateKey)) { map.set(dateKey, []); }
                map.get(dateKey)!.push(event);
            });
        return Array.from(map.entries());
    }, [filteredProjects]);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, Project[]>();
        filteredProjects.forEach(p => {
            const dateKey = new Date(p.date).toDateString();
            if (!map.has(dateKey)) { map.set(dateKey, []); }
            map.get(dateKey)!.push(p);
        });
        return map;
    }, [filteredProjects]);

    // HANDLERS
    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setModalMode('add');
        setEventFormData({
            title: '',
            description: '',
            startDate: date.toISOString().split('T')[0],
            endDate: date.toISOString().split('T')[0],
            startTime: '',
            endTime: '',
            location: '',
            attendees: [],
            isAllDay: false,
            category: 'meeting'
        });
        setIsEventModalOpen(true);
    };

    const handleEventClick = (event: Project) => {
        setSelectedEvent(event);
        setModalMode('view');
        setIsEventModalOpen(true);
    };

    const handleEditEvent = (event: Project) => {
        setSelectedEvent(event);
        setModalMode('edit');
        setEventFormData({
            title: event.projectName,
            description: event.notes || '',
            startDate: event.date,
            endDate: event.date, // Assuming single day event for simplicity in form
            startTime: event.startTime || '',
            endTime: event.endTime || '',
            location: event.location || '',
            attendees: event.team.map(t => t.memberId), // Assuming team members are attendees
            isAllDay: !event.startTime && !event.endTime,
            category: event.projectType as CalendarEvent['category'] // Mapping projectType to category
        });
        setIsEventModalOpen(true);
    };

    const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setEventFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setEventFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const eventData: CalendarEvent = {
                id: selectedEvent?.id || `EVT${Date.now()}`,
                title: eventFormData.title,
                description: eventFormData.description,
                startDate: eventFormData.startDate,
                endDate: eventFormData.endDate,
                startTime: eventFormData.isAllDay ? undefined : eventFormData.startTime,
                endTime: eventFormData.isAllDay ? undefined : eventFormData.endTime,
                location: eventFormData.location,
                attendees: eventFormData.attendees,
                isAllDay: eventFormData.isAllDay,
                category: eventFormData.category
            };

            if (modalMode === 'add') {
                await eventsCrud.create(eventData);
            } else if (modalMode === 'edit' && selectedEvent) {
                await eventsCrud.update(selectedEvent.id, eventData);
            }
            setIsEventModalOpen(false);
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus event ini?')) {
            try {
                await eventsCrud.delete(eventId);
                setIsEventModalOpen(false);
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    };

    const handleFilterChange = (filterType: 'client' | 'event', value: boolean | string) => {
        if (filterType === 'client') {
            setFilters(prev => ({...prev, isClientProjectVisible: value as boolean}));
        } else {
            setFilters(prev => {
                const newSet = new Set(prev.visibleEventTypes);
                if (newSet.has(value as string)) newSet.delete(value as string);
                else newSet.add(value as string);
                return {...prev, visibleEventTypes: newSet};
            });
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-brand-surface rounded-2xl overflow-hidden">
            <CalendarSidebar
                profile={profile}
                onAddEvent={() => handleDateClick(new Date())}
                isClientProjectVisible={filters.isClientProjectVisible}
                visibleEventTypes={filters.visibleEventTypes}
                onClientFilterChange={(v) => handleFilterChange('client', v)}
                onEventTypeFilterChange={(v) => handleFilterChange('event', v)}
            />

            <div className="flex-1 flex flex-row overflow-hidden">
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <CalendarHeader
                        currentDate={currentDate}
                        viewMode={viewMode}
                        onPrev={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                        onNext={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                        onToday={() => setCurrentDate(new Date())}
                        onViewModeChange={setViewMode}
                    />
                    <div className="flex-1">
                        {viewMode === 'Month' ? (
                            <MonthView
                                currentDate={currentDate}
                                daysInMonth={daysInMonthGrid}
                                eventsByDate={eventsByDate}
                                profile={profile}
                                onDayClick={handleDateClick}
                                onEventClick={handleEventClick}
                            />
                        ) : (
                            <AgendaView
                                agendaByDate={agendaByDate}
                                profile={profile}
                                onEventClick={handleEventClick}
                            />
                        )}
                    </div>
                </div>

                <Modal 
                    isOpen={isEventModalOpen} 
                    onClose={() => setIsEventModalOpen(false)} 
                    title={
                        modalMode === 'view' ? `Event: ${selectedEvent?.title}` :
                        modalMode === 'edit' ? 'Edit Event' : 'Tambah Event Baru'
                    }
                >
                    {modalMode === 'view' && selectedEvent ? (
                        <div className="space-y-4">
                            <p><strong>Tanggal:</strong> {new Date(selectedEvent.startDate).toLocaleDateString('id-ID')} {selectedEvent.endDate !== selectedEvent.startDate && `- ${new Date(selectedEvent.endDate).toLocaleDateString('id-ID')}`}</p>
                            <p><strong>Waktu:</strong> {selectedEvent.isAllDay ? 'Sepanjang Hari' : `${selectedEvent.startTime || '-'} - ${selectedEvent.endTime || '-'}`}</p>
                            <p><strong>Lokasi:</strong> {selectedEvent.location || '-'}</p>
                            <p><strong>Kategori:</strong> {selectedEvent.category}</p>
                            <p><strong>Deskripsi:</strong> {selectedEvent.description || '-'}</p>
                            {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                                <p><strong>Peserta:</strong> {selectedEvent.attendees.join(', ')}</p>
                            )}
                            <div className="flex justify-end gap-2 pt-4 border-t border-brand-border">
                                <button onClick={() => handleEditEvent(selectedEvent)} className="button-secondary">Edit</button>
                                <button onClick={() => handleDeleteEvent(selectedEvent.id)} className="button-secondary text-red-400">Hapus</button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleEventSubmit} className="space-y-4">
                            <div className="input-group">
                                <input type="text" name="title" value={eventFormData.title} onChange={handleEventFormChange} className="input-field" placeholder=" " required />
                                <label className="input-label">Judul Event</label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="input-group">
                                    <input type="date" name="startDate" value={eventFormData.startDate} onChange={handleEventFormChange} className="input-field" placeholder=" " required />
                                    <label className="input-label">Tanggal Mulai</label>
                                </div>
                                <div className="input-group">
                                    <input type="date" name="endDate" value={eventFormData.endDate} onChange={handleEventFormChange} className="input-field" placeholder=" " required />
                                    <label className="input-label">Tanggal Selesai</label>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <input type="checkbox" name="isAllDay" checked={eventFormData.isAllDay} onChange={handleEventFormChange} />
                                <label className="text-sm">Sepanjang Hari</label>
                            </div>
                            {!eventFormData.isAllDay && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="input-group">
                                        <input type="time" name="startTime" value={eventFormData.startTime} onChange={handleEventFormChange} className="input-field" placeholder=" " />
                                        <label className="input-label">Waktu Mulai</label>
                                    </div>
                                    <div className="input-group">
                                        <input type="time" name="endTime" value={eventFormData.endTime} onChange={handleEventFormChange} className="input-field" placeholder=" " />
                                        <label className="input-label">Waktu Selesai</label>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="input-group">
                                    <input type="text" name="location" value={eventFormData.location} onChange={handleEventFormChange} className="input-field" placeholder=" " />
                                    <label className="input-label">Lokasi</label>
                                </div>
                                <div className="input-group">
                                    <select name="category" value={eventFormData.category} onChange={handleEventFormChange} className="input-field">
                                        <option value="meeting">Meeting</option>
                                        <option value="shoot">Pemotretan</option>
                                        <option value="deadline">Deadline</option>
                                        <option value="personal">Personal</option>
                                        <option value="other">Lainnya</option>
                                    </select>
                                    <label className="input-label">Kategori</label>
                                </div>
                            </div>
                            <div className="input-group">
                                <textarea name="description" value={eventFormData.description} onChange={handleEventFormChange} className="input-field" placeholder=" " rows={3}></textarea>
                                <label className="input-label">Deskripsi</label>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-brand-border">
                                <button type="button" onClick={() => setIsEventModalOpen(false)} className="button-secondary">Batal</button>
                                <button type="submit" className="button-primary">{modalMode === 'edit' ? 'Update' : 'Simpan'}</button>
                            </div>
                        </form>
                    )}
                </Modal>
            </div>
        </div>
    );
};