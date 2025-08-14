import React, { useState } from 'react';
import { Asset, AssetStatus, ViewType } from '../types';
import PageHeader from './PageHeader';
import Modal from './Modal';
import { PlusIcon, PencilIcon, Trash2Icon, PackageIcon, EyeIcon, SearchIcon } from '../constants';
import { assetsService } from '../services/database';
import { useCrud } from '../hooks/useCrud';

interface AssetsProps {
    onNavigate: (view: ViewType) => void;
    showNotification: (message: string) => void;
}

const Assets: React.FC<AssetsProps> = ({ onNavigate, showNotification }) => {
    const { items: assets, create, update, delete: deleteItem, loading } = useCrud(
        assetsService,
        showNotification,
        'Aset'
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<AssetStatus | 'ALL'>('ALL');
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        purchase_date: '',
        purchase_price: 0,
        serial_number: '',
        status: AssetStatus.AVAILABLE as AssetStatus,
        notes: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'purchase_price' ? Number(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAsset) {
                await update(editingAsset.id, formData);
            } else {
                await create(formData);
            }
            resetForm();
        } catch (error) {
            console.error('Error saving asset:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            purchase_date: '',
            purchase_price: 0,
            serial_number: '',
            status: AssetStatus.AVAILABLE,
            notes: ''
        });
        setEditingAsset(null);
        setIsModalOpen(false);
    };

    const handleEdit = (asset: Asset) => {
        setEditingAsset(asset);
        setFormData({
            name: asset.name,
            category: asset.category,
            purchase_date: asset.purchase_date,
            purchase_price: asset.purchase_price,
            serial_number: asset.serial_number || '',
            status: asset.status,
            notes: asset.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleView = (asset: Asset) => {
        setViewingAsset(asset);
        setIsViewModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Yakin ingin menghapus aset ini?')) {
            try {
                await deleteItem(id);
            } catch (error) {
                console.error('Error deleting asset:', error);
            }
        }
    };

    const getStatusColor = (status: AssetStatus) => {
        switch (status) {
            case AssetStatus.AVAILABLE:
                return 'bg-green-100 text-green-600';
            case AssetStatus.IN_USE:
                return 'bg-blue-100 text-blue-600';
            case AssetStatus.MAINTENANCE:
                return 'bg-yellow-100 text-yellow-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusText = (status: AssetStatus) => {
        switch (status) {
            case AssetStatus.AVAILABLE:
                return 'Tersedia';
            case AssetStatus.IN_USE:
                return 'Digunakan';
            case AssetStatus.MAINTENANCE:
                return 'Perbaikan';
            default:
                return status;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0 
        }).format(amount);
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (asset.serial_number && asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || asset.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const assetCategories = [...new Set(assets.map(asset => asset.category))];
    const totalValue = assets.reduce((sum, asset) => sum + asset.purchase_price, 0);
    const availableAssets = assets.filter(asset => asset.status === AssetStatus.AVAILABLE).length;
    const inUseAssets = assets.filter(asset => asset.status === AssetStatus.IN_USE).length;
    const maintenanceAssets = assets.filter(asset => asset.status === AssetStatus.MAINTENANCE).length;

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
                title="Manajemen Aset" 
                onAdd={() => setIsModalOpen(true)}
                onBack={() => onNavigate(ViewType.DASHBOARD)}
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Total Aset</div>
                    <div className="text-2xl font-bold text-indigo-600">{assets.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Nilai Total</div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Tersedia</div>
                    <div className="text-2xl font-bold text-green-600">{availableAssets}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Dalam Perbaikan</div>
                    <div className="text-2xl font-bold text-yellow-600">{maintenanceAssets}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari aset..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as AssetStatus | 'ALL')}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                        <option value="ALL">Semua Status</option>
                        <option value={AssetStatus.AVAILABLE}>Tersedia</option>
                        <option value={AssetStatus.IN_USE}>Digunakan</option>
                        <option value={AssetStatus.MAINTENANCE}>Perbaikan</option>
                    </select>
                </div>
            </div>

            {/* Assets Grid */}
            <div className="grid gap-6">
                {filteredAssets.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {assets.length === 0 ? 'Belum ada aset' : 'Tidak ada aset yang sesuai filter'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {assets.length === 0 ? 'Mulai dengan menambahkan aset pertama Anda' : 'Coba ubah kata kunci pencarian atau filter'}
                        </p>
                        {assets.length === 0 && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Tambah Aset
                            </button>
                        )}
                    </div>
                ) : (
                    filteredAssets.map(asset => (
                        <div key={asset.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <PackageIcon className="w-5 h-5 text-indigo-500" />
                                        <h3 className="text-lg font-semibold">{asset.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                                            {getStatusText(asset.status)}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-2">Kategori: {asset.category}</p>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p>Dibeli: {new Date(asset.purchase_date).toLocaleDateString('id-ID')}</p>
                                        <p>Harga: {formatCurrency(asset.purchase_price)}</p>
                                        {asset.serial_number && <p>Serial: {asset.serial_number}</p>}
                                        {asset.notes && <p>Catatan: {asset.notes.substring(0, 100)}{asset.notes.length > 100 ? '...' : ''}</p>}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleView(asset)}
                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                        title="Lihat Detail"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(asset)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        title="Edit"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset.id)}
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
                title={editingAsset ? 'Edit Aset' : 'Tambah Aset'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Aset *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                            placeholder="Kamera Canon EOS R5"
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
                            placeholder="Kamera"
                            list="categories"
                        />
                        <datalist id="categories">
                            {assetCategories.map(category => (
                                <option key={category} value={category} />
                            ))}
                        </datalist>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal Pembelian *
                            </label>
                            <input
                                type="date"
                                name="purchase_date"
                                value={formData.purchase_date}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Harga Pembelian (Rp) *
                            </label>
                            <input
                                type="number"
                                name="purchase_price"
                                value={formData.purchase_price}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                                min="0"
                                step="1000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nomor Serial
                            </label>
                            <input
                                type="text"
                                name="serial_number"
                                value={formData.serial_number}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="ABC123456"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status *
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                <option value={AssetStatus.AVAILABLE}>Tersedia</option>
                                <option value={AssetStatus.IN_USE}>Digunakan</option>
                                <option value={AssetStatus.MAINTENANCE}>Perbaikan</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Catatan
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            rows={3}
                            placeholder="Catatan tambahan tentang aset ini..."
                        />
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
                            {editingAsset ? 'Update' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detail Aset"
            >
                {viewingAsset && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama</label>
                                <div className="text-lg font-semibold">{viewingAsset.name}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingAsset.status)}`}>
                                    {getStatusText(viewingAsset.status)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <div>{viewingAsset.category}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Harga Pembelian</label>
                                <div className="text-lg font-semibold text-green-600">{formatCurrency(viewingAsset.purchase_price)}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal Pembelian</label>
                                <div>{new Date(viewingAsset.purchase_date).toLocaleDateString('id-ID')}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nomor Serial</label>
                                <div>{viewingAsset.serial_number || '-'}</div>
                            </div>
                        </div>

                        {viewingAsset.notes && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Catatan</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm">{viewingAsset.notes}</div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleEdit(viewingAsset);
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

export default Assets;