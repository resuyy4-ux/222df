
import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus, ContactChannel, Profile } from '../types';

interface PublicLeadFormProps {
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    userProfile: Profile;
    showNotification: (message: string) => void;
}

const PublicLeadForm: React.FC<PublicLeadFormProps> = ({ setLeads, userProfile }) => {
    const [formState, setFormState] = useState({
        name: '',
        eventType: userProfile.projectTypes[0] || '',
        eventDate: '',
        eventLocation: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const bookingFormUrl = useMemo(() => {
        return `${window.location.origin}${window.location.pathname}#/public-booking`;
    }, []);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const notes = `Jenis Acara: ${formState.eventType}\nTanggal Acara: ${new Date(formState.eventDate).toLocaleDateString('id-ID')}\nLokasi Acara: ${formState.eventLocation}`;

        const newLead: Lead = {
            id: `LEAD-FORM-${Date.now()}`,
            name: formState.name,
            contactChannel: ContactChannel.WEBSITE, // Since it's from a web form
            location: formState.eventLocation,
            status: LeadStatus.DISCUSSION, // Automatically placed in "Sedang Diskusi"
            date: new Date().toISOString().split('T')[0],
            notes: notes
        };
        
        // Simulate API call
        setTimeout(() => {
            setLeads(prev => [newLead, ...prev]);
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 1000);
    };

    if (isSubmitted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-brand-bg p-4">
                <div className="w-full max-w-lg p-8 text-center bg-brand-surface rounded-2xl shadow-lg border border-brand-border">
                    <h1 className="text-2xl font-bold text-gradient">Terima Kasih!</h1>
                    <p className="mt-4 text-brand-text-primary">Informasi Anda telah kami terima. Tim kami akan segera menghubungi Anda melalui WhatsApp.</p>
                    <p className="mt-2 text-sm text-brand-text-secondary">Jika Anda sudah siap untuk melakukan pemesanan, Anda bisa melanjutkan ke formulir booking.</p>
                    <a href={bookingFormUrl} className="mt-6 button-primary inline-block">
                        Lanjut ke Form Booking
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-bg p-4">
            <div className="w-full max-w-lg p-8 space-y-6 bg-brand-surface rounded-2xl shadow-lg border border-brand-border">
                <div className="text-center space-y-3">
                    <h1 className="text-2xl font-bold text-brand-text-light">Hai! Terimakasih telah menghubungi #venapictures</h1>
                    <p className="text-brand-text-primary">Perkenalkan aku Nina! (๑•ᴗ•๑)♡</p>
                    <p className="text-sm text-brand-text-secondary">Untuk informasi mengenai pricelist dan availability, mohon mengisi data berikut ya!</p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input id="name" name="name" type="text" value={formState.name} onChange={handleFormChange} className="input-field" placeholder=" " required />
                        <label htmlFor="name" className="input-label">Nama</label>
                    </div>
                    <div className="input-group">
                        <select id="eventType" name="eventType" value={formState.eventType} onChange={handleFormChange} className="input-field" required>
                             {userProfile.projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                        </select>
                        <label htmlFor="eventType" className="input-label">Jenis Acara</label>
                    </div>
                    <div className="input-group">
                        <input id="eventDate" name="eventDate" type="date" value={formState.eventDate} onChange={handleFormChange} className="input-field" placeholder=" " required />
                        <label htmlFor="eventDate" className="input-label">Tanggal Acara</label>
                    </div>
                    <div className="input-group">
                        <input id="eventLocation" name="eventLocation" type="text" value={formState.eventLocation} onChange={handleFormChange} className="input-field" placeholder=" " required />
                        <label htmlFor="eventLocation" className="input-label">Lokasi Acara</label>
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full button-primary">
                            {isSubmitting ? 'Mengirim...' : 'Kirim Informasi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PublicLeadForm;
