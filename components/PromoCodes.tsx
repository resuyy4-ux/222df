import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Percent, Calendar, Users } from 'lucide-react';
import { PromoCode, ViewType } from '../types';
import { promoCodesService } from '../services/database';
import { useCrud } from '../hooks/useCrud';
import Modal from './Modal';
import PageHeader from './PageHeader';

interface PromoCodesProps {
  onNavigate: (view: ViewType, action?: any) => void;
  showNotification: (message: string) => void;
}

const PromoCodes: React.FC<PromoCodesProps> = ({ onNavigate, showNotification }) => {
  const { items: promoCodes, create, update, delete: deleteItem, loading } = useCrud(
    promoCodesService,
    showNotification,
    'Promo Code'
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [viewingCode, setViewingCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minOrderAmount: 0,
    maxUsage: 0,
    validFrom: '',
    validUntil: '',
    isActive: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['discountValue', 'minOrderAmount', 'maxUsage'].includes(name) 
          ? parseFloat(value) || 0 
          : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCode) {
        await update(editingCode.id, formData);
      } else {
        await create({
          ...formData,
          usageCount: 0,
          createdAt: new Date().toISOString()
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving promo code:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderAmount: 0,
      maxUsage: 0,
      validFrom: '',
      validUntil: '',
      isActive: true
    });
    setIsModalOpen(false);
    setEditingCode(null);
  };

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      description: code.description,
      discountType: code.discountType,
      discountValue: code.discountValue,
      minOrderAmount: code.minOrderAmount || 0,
      maxUsage: code.maxUsage || 0,
      validFrom: code.validFrom || '',
      validUntil: code.validUntil || '',
      isActive: code.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kode promo ini?')) {
      await deleteItem(id);
    }
  };

  const handleView = (code: PromoCode) => {
    setViewingCode(code);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Kode Promo" 
        description="Kelola kode promo untuk memberikan diskon kepada klien" 
      />

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Total: {promoCodes.length} kode promo
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Tambah Kode Promo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promoCodes.map((code) => (
          <div key={code.id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{code.code}</h3>
                <p className="text-gray-600 text-sm mt-1">{code.description}</p>
                <div className="flex items-center mt-2">
                  <Percent size={16} className="text-green-500 mr-1" />
                  <span className="font-bold text-green-600">
                    {code.discountType === 'percentage' 
                      ? `${code.discountValue}%` 
                      : formatCurrency(code.discountValue)
                    }
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(code)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleEdit(code)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(code.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {code.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Penggunaan:</span>
                <span className="font-medium">
                  {code.usageCount} / {code.maxUsage || '∞'}
                </span>
              </div>

              {code.validUntil && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Berlaku hingga:</span>
                  <span className="font-medium">{formatDate(code.validUntil)}</span>
                </div>
              )}

              {code.minOrderAmount && code.minOrderAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Min. order:</span>
                  <span className="font-medium">{formatCurrency(code.minOrderAmount)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={resetForm}
        title={editingCode ? 'Edit Kode Promo' : 'Tambah Kode Promo Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Promo *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Diskon *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal Tetap (Rp)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nilai Diskon *
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                min="0"
                step={formData.discountType === 'percentage' ? '0.1' : '1000'}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order (Rp)
              </label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maksimum Penggunaan
              </label>
              <input
                type="number"
                name="maxUsage"
                value={formData.maxUsage}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Berlaku Dari
              </label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Berlaku Hingga
              </label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Kode promo aktif</label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingCode ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={!!viewingCode}
        onClose={() => setViewingCode(null)}
        title="Detail Kode Promo"
      >
        {viewingCode && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kode</label>
                <p className="text-gray-900 font-mono text-lg">{viewingCode.code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  viewingCode.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {viewingCode.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Diskon</label>
                <p className="text-gray-900">
                  {viewingCode.discountType === 'percentage' ? 'Persentase' : 'Nominal Tetap'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nilai Diskon</label>
                <p className="text-gray-900 font-bold text-green-600">
                  {viewingCode.discountType === 'percentage' 
                    ? `${viewingCode.discountValue}%` 
                    : formatCurrency(viewingCode.discountValue)
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Order</label>
                <p className="text-gray-900">
                  {viewingCode.minOrderAmount ? formatCurrency(viewingCode.minOrderAmount) : 'Tidak ada'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Penggunaan</label>
                <p className="text-gray-900">
                  {viewingCode.usageCount} / {viewingCode.maxUsage || 'Tanpa batas'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Berlaku Dari</label>
                <p className="text-gray-900">
                  {viewingCode.validFrom ? formatDate(viewingCode.validFrom) : 'Tidak ditentukan'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Berlaku Hingga</label>
                <p className="text-gray-900">
                  {viewingCode.validUntil ? formatDate(viewingCode.validUntil) : 'Tidak ditentukan'}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <p className="text-gray-900">{viewingCode.description || 'Tidak ada deskripsi'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PromoCodes;