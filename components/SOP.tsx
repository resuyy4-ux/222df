import React, { useState } from 'react';
import { SOP, ViewType } from '../types';
import PageHeader from './PageHeader';
import Modal from './Modal';
import { PlusIcon, PencilIcon, Trash2Icon, BookOpenIcon, EyeIcon, SearchIcon, ArrowDownIcon, ArrowUpIcon } from '../constants';
import { sopsService } from '../services/database';
import { useCrud } from '../hooks/useCrud';

interface SOPProps {
    onNavigate: (view: ViewType) => void;
    showNotification: (message: string) => void;
}

const SOPComponent: React.FC<SOPProps> = ({ onNavigate, showNotification }) => {
    const { items: sops, create, update, delete: deleteItem, loading } = useCrud(
        sopsService,
        showNotification,
        'SOP'
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingSOP, setEditingSOP] = useState<SOP | null>(null);
    const [viewingSOP, setViewingSOP] = useState<SOP | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        content: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSOP) {
                await update(editingSOP.id, formData);
            } else {
                await create(formData);
            }
            resetForm();
        } catch (error) {
            console.error('Error saving SOP:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            category: '',
            content: ''
        });
        setEditingSOP(null);
        setIsModalOpen(false);
    };

    const handleEdit = (sop: SOP) => {
        setEditingSOP(sop);
        setFormData({
            title: sop.title,
            category: sop.category,
            content: sop.content
        });
        setIsModalOpen(true);
    };

    const handleView = (sop: SOP) => {
        setViewingSOP(sop);
        setIsViewModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Yakin ingin menghapus SOP ini?')) {
            try {
                await deleteItem(id);
            } catch (error) {
                console.error('Error deleting SOP:', error);
            }
        }
    };

    const filteredSOPs = sops.filter(sop => {
        const matchesSearch = sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             sop.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || sop.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(sops.map(sop => sop.category))];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Memuat data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <PageHeader 
                title="SOP (Standard Operating Procedure)" 
                onAdd={() => setIsModalOpen(true)}
                onBack={() => onNavigate(ViewType.DASHBOARD)}
            />

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Total SOP</div>
                    <div className="text-2xl font-bold text-indigo-600">{sops.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Kategori</div>
                    <div className="text-2xl font-bold text-green-600">{categories.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Terbaru</div>
                    <div className="text-sm font-medium text-blue-600">
                        {sops.length > 0 ? formatDate(sops.sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime())[0].last_updated) : '-'}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari SOP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                        <option value="ALL">Semua Kategori</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* SOPs Grid */}
            <div className="grid gap-6">
                {filteredSOPs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {sops.length === 0 ? 'Belum ada SOP' : 'Tidak ada SOP yang sesuai filter'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {sops.length === 0 ? 'Mulai dengan menambahkan SOP pertama Anda' : 'Coba ubah kata kunci pencarian atau filter'}
                        </p>
                        {sops.length === 0 && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Tambah SOP
                            </button>
                        )}
                    </div>
                ) : (
                    filteredSOPs.map(sop => (
                        <div key={sop.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <BookOpenIcon className="w-5 h-5 text-indigo-500" />
                                        <h3 className="text-lg font-semibold">{sop.title}</h3>
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs font-medium rounded-full">
                                            {sop.category}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3 line-clamp-3">
                                        {sop.content.substring(0, 200)}{sop.content.length > 200 ? '...' : ''}
                                    </p>
                                    <div className="text-sm text-gray-500">
                                        <p>Terakhir diupdate: {formatDate(sop.last_updated)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleView(sop)}
                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                        title="Lihat Detail"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(sop)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        title="Edit"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sop.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Hapus"
                                    >
                                        <Trash2Icon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingSOP ? 'Edit SOP' : 'Tambah SOP'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Judul SOP *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                            placeholder="Prosedur Backup Data"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kategori *
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                            placeholder="IT & Sistem"
                            list="categories"
                        />
                        <datalist id="categories">
                            {categories.map(category => (
                                <option key={category} value={category} />
                            ))}
                            <option value="IT & Sistem" />
                            <option value="Operasional" />
                            <option value="Keuangan" />
                            <option value="SDM" />
                            <option value="Produksi" />
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Konten SOP *
                        </label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            rows={10}
                            required
                            placeholder="Tuliskan langkah-langkah detail untuk prosedur ini..."
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Anda bisa menggunakan format markdown untuk memformat teks
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            {editingSOP ? 'Update' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detail SOP"
            >
                {viewingSOP && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{viewingSOP.title}</h3>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-full">
                                {viewingSOP.category}
                            </span>
                        </div>

                        <div className="border-t pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Konten SOP</label>
                            <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                                    {viewingSOP.content}
                                </pre>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 border-t pt-4">
                            <p>Dibuat: {formatDate(viewingSOP.created_at)}</p>
                            <p>Terakhir diupdate: {formatDate(viewingSOP.last_updated)}</p>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleEdit(viewingSOP);
                                }}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SOPComponent;

interface SOPProps {
    sops: types.SOP[];
    setSops: React.Dispatch<React.SetStateAction<types.SOP[]>>;
    profile: types.Profile;
    showNotification: (message: string) => void;
}

const SOPManagement: React.FC<SOPProps> = ({ sops, setSops, profile, showNotification }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
    const [selectedSop, setSelectedSop] = useState<types.SOP | null>(null);

    const initialFormState = {
        title: '',
        category: profile.sopCategories[0] || '',
        content: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(profile.sopCategories));

    const handleOpenModal = (mode: 'add' | 'edit' | 'view', sop?: types.SOP) => {
        setModalMode(mode);
        if ((mode === 'edit' || mode === 'view') && sop) {
            setSelectedSop(sop);
            setFormData({
                title: sop.title,
                category: sop.category,
                content: sop.content,
            });
        } else {
            setSelectedSop(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'add') {
            const newSop: types.SOP = {
                id: `SOP${Date.now()}`,
                ...formData,
                lastUpdated: new Date().toISOString(),
            };
            setSops(prev => [...prev, newSop].sort((a,b) => a.title.localeCompare(b.title)));
            showNotification('SOP baru berhasil ditambahkan.');
        } else if (selectedSop) {
            const updatedSop = {
                ...selectedSop,
                ...formData,
                lastUpdated: new Date().toISOString(),
            };
            setSops(prev => prev.map(s => s.id === selectedSop.id ? updatedSop : s));
            showNotification('SOP berhasil diperbarui.');
        }
        handleCloseModal();
    };
    
    const handleDelete = (sopId: string) => {
        if (window.confirm("Yakin ingin menghapus SOP ini?")) {
            setSops(prev => prev.filter(s => s.id !== sopId));
            showNotification('SOP berhasil dihapus.');
        }
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };
    
    const sopsByCategory = sops.reduce((acc, sop) => {
        if (!acc[sop.category]) {
            acc[sop.category] = [];
        }
        acc[sop.category].push(sop);
        return acc;
    }, {} as Record<string, types.SOP[]>);

    return (
        <div className="space-y-6">
            <PageHeader title="Standar Operasional Prosedur (SOP)" subtitle="Kelola panduan kerja untuk menjaga kualitas dan konsistensi tim.">
                <button onClick={() => handleOpenModal('add')} className="button-primary inline-flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Tambah SOP Baru
                </button>
            </PageHeader>

            <div className="space-y-4">
                {profile.sopCategories.map(category => (
                    <div key={category} className="bg-brand-surface rounded-2xl shadow-lg border border-brand-border">
                        <button onClick={() => toggleCategory(category)} className="w-full flex justify-between items-center p-4">
                            <h3 className="font-semibold text-lg text-brand-text-light">{category}</h3>
                            {expandedCategories.has(category) ? <ArrowUpIcon className="w-5 h-5 text-brand-text-secondary"/> : <ArrowDownIcon className="w-5 h-5 text-brand-text-secondary"/>}
                        </button>
                        {expandedCategories.has(category) && (
                            <div className="p-4 border-t border-brand-border space-y-3">
                                {(sopsByCategory[category] || []).map(sop => (
                                    <div key={sop.id} onClick={() => handleOpenModal('view', sop)} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center cursor-pointer hover:bg-brand-input">
                                        <div className="flex items-center gap-3">
                                            <BookOpenIcon className="w-5 h-5 text-brand-accent"/>
                                            <div>
                                                <p className="font-semibold text-brand-text-light">{sop.title}</p>
                                                <p className="text-xs text-brand-text-secondary">Diperbarui: {new Date(sop.lastUpdated).toLocaleDateString('id-ID')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenModal('edit', sop); }} className="p-2 text-brand-text-secondary hover:text-brand-accent rounded-full"><PencilIcon className="w-5 h-5" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(sop.id); }} className="p-2 text-brand-text-secondary hover:text-brand-danger rounded-full"><Trash2Icon className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                ))}
                                {!sopsByCategory[category] && <p className="text-center text-sm text-brand-text-secondary p-4">Belum ada SOP di kategori ini.</p>}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalMode === 'add' ? 'Tambah SOP' : (modalMode === 'edit' ? 'Edit SOP' : selectedSop?.title || 'Lihat SOP')} size="4xl">
                {modalMode === 'view' && selectedSop ? (
                    <div className="prose prose-sm md:prose-base prose-invert max-w-none max-h-[70vh] overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: selectedSop.content.replace(/\n/g, '<br />') }} />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-group">
                                <input type="text" id="title" name="title" value={formData.title} onChange={handleFormChange} className="input-field" placeholder=" " required />
                                <label htmlFor="title" className="input-label">Judul SOP</label>
                            </div>
                            <div className="input-group">
                                <select id="category" name="category" value={formData.category} onChange={handleFormChange} className="input-field" required>
                                    {profile.sopCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <label htmlFor="category" className="input-label">Kategori</label>
                            </div>
                        </div>
                        <div className="input-group">
                            <textarea id="content" name="content" value={formData.content} onChange={handleFormChange} className="input-field" placeholder=" " rows={15} required></textarea>
                            <label htmlFor="content" className="input-label">Konten SOP (mendukung Markdown)</label>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                            <button type="button" onClick={handleCloseModal} className="button-secondary">Batal</button>
                            <button type="submit" className="button-primary">{modalMode === 'add' ? 'Simpan' : 'Update'}</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default SOPManagement;