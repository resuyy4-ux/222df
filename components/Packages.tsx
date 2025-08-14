
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, DollarSign, Clock, Camera, Video } from 'lucide-react';
import { Package, PhysicalItem, ViewType } from '../types';
import { packagesService } from '../services/database';
import { useCrud } from '../hooks/useCrud';
import Modal from './Modal';
import PageHeader from './PageHeader';

interface PackagesProps {
  onNavigate: (view: ViewType, action?: any) => void;
  showNotification: (message: string) => void;
}

const Packages: React.FC<PackagesProps> = ({ onNavigate, showNotification }) => {
  const { items: packages, create, update, delete: deleteItem, loading } = useCrud(
    packagesService,
    showNotification,
    'Paket'
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    physicalItems: [] as PhysicalItem[],
    digitalItems: [] as string[],
    processingTime: '',
    defaultPrintingCost: 0,
    defaultTransportCost: 0,
    photographers: '',
    videographers: ''
  });

  const [newPhysicalItem, setNewPhysicalItem] = useState({ name: '', price: 0 });
  const [newDigitalItem, setNewDigitalItem] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['price', 'defaultPrintingCost', 'defaultTransportCost'].includes(name) 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPackage) {
        await update(editingPackage.id, formData);
      } else {
        await create(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving package:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      physicalItems: [],
      digitalItems: [],
      processingTime: '',
      defaultPrintingCost: 0,
      defaultTransportCost: 0,
      photographers: '',
      videographers: ''
    });
    setNewPhysicalItem({ name: '', price: 0 });
    setNewDigitalItem('');
    setIsModalOpen(false);
    setEditingPackage(null);
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price,
      physicalItems: pkg.physicalItems || [],
      digitalItems: pkg.digitalItems || [],
      processingTime: pkg.processingTime || '',
      defaultPrintingCost: pkg.defaultPrintingCost || 0,
      defaultTransportCost: pkg.defaultTransportCost || 0,
      photographers: pkg.photographers || '',
      videographers: pkg.videographers || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus paket ini?')) {
      await deleteItem(id);
    }
  };

  const handleView = (pkg: Package) => {
    setViewingPackage(pkg);
  };

  const addPhysicalItem = () => {
    if (newPhysicalItem.name.trim() && newPhysicalItem.price > 0) {
      setFormData(prev => ({
        ...prev,
        physicalItems: [...prev.physicalItems, newPhysicalItem]
      }));
      setNewPhysicalItem({ name: '', price: 0 });
    }
  };

  const removePhysicalItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      physicalItems: prev.physicalItems.filter((_, i) => i !== index)
    }));
  };

  const addDigitalItem = () => {
    if (newDigitalItem.trim()) {
      setFormData(prev => ({
        ...prev,
        digitalItems: [...prev.digitalItems, newDigitalItem.trim()]
      }));
      setNewDigitalItem('');
    }
  };

  const removeDigitalItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      digitalItems: prev.digitalItems.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Paket Layanan" 
        description="Kelola paket layanan photography dan videography" 
      />

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Total: {packages.length} paket
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Tambah Paket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  Rp {pkg.price.toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(pkg)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleEdit(pkg)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Clock size={16} className="mr-2" />
                {pkg.processingTime || 'Tidak ditentukan'}
              </div>

              <div>
                <p className="font-medium text-gray-700">Item Fisik:</p>
                <ul className="text-gray-600 ml-4">
                  {pkg.physicalItems?.map((item, idx) => (
                    <li key={idx}>• {item.name} (+Rp {item.price.toLocaleString()})</li>
                  )) || <li>Tidak ada</li>}
                </ul>
              </div>

              <div>
                <p className="font-medium text-gray-700">Item Digital:</p>
                <ul className="text-gray-600 ml-4">
                  {pkg.digitalItems?.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  )) || <li>Tidak ada</li>}
                </ul>
              </div>

              {pkg.photographers && (
                <div className="flex items-center text-gray-600">
                  <Camera size={16} className="mr-2" />
                  {pkg.photographers}
                </div>
              )}

              {pkg.videographers && (
                <div className="flex items-center text-gray-600">
                  <Video size={16} className="mr-2" />
                  {pkg.videographers}
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
        title={editingPackage ? 'Edit Paket' : 'Tambah Paket Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Paket *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga (Rp) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waktu Pengerjaan
              </label>
              <input
                type="text"
                name="processingTime"
                value={formData.processingTime}
                onChange={handleInputChange}
                placeholder="e.g., 2-3 minggu"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biaya Cetak Default (Rp)
              </label>
              <input
                type="number"
                name="defaultPrintingCost"
                value={formData.defaultPrintingCost}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biaya Transport Default (Rp)
              </label>
              <input
                type="number"
                name="defaultTransportCost"
                value={formData.defaultTransportCost}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fotografer
              </label>
              <input
                type="text"
                name="photographers"
                value={formData.photographers}
                onChange={handleInputChange}
                placeholder="Nama fotografer"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Videografer
              </label>
              <input
                type="text"
                name="videographers"
                value={formData.videographers}
                onChange={handleInputChange}
                placeholder="Nama videografer"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Physical Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Fisik
            </label>
            <div className="space-y-2">
              {formData.physicalItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <span className="flex-1">{item.name}</span>
                  <span className="text-gray-600">Rp {item.price.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => removePhysicalItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Nama item"
                  value={newPhysicalItem.name}
                  onChange={(e) => setNewPhysicalItem(prev => ({ ...prev, name: e.target.value }))}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Harga"
                  value={newPhysicalItem.price}
                  onChange={(e) => setNewPhysicalItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-24 p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={addPhysicalItem}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Digital Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Digital
            </label>
            <div className="space-y-2">
              {formData.digitalItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <span className="flex-1">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeDigitalItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Nama item digital"
                  value={newDigitalItem}
                  onChange={(e) => setNewDigitalItem(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={addDigitalItem}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
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
              {editingPackage ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={!!viewingPackage}
        onClose={() => setViewingPackage(null)}
        title="Detail Paket"
      >
        {viewingPackage && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                <p className="text-gray-900 font-semibold">{viewingPackage.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Harga</label>
                <p className="text-blue-600 font-bold text-xl">Rp {viewingPackage.price.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Waktu Pengerjaan</label>
                <p className="text-gray-900">{viewingPackage.processingTime || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Biaya Cetak Default</label>
                <p className="text-gray-900">Rp {(viewingPackage.defaultPrintingCost || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Biaya Transport Default</label>
                <p className="text-gray-900">Rp {(viewingPackage.defaultTransportCost || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fotografer</label>
                <p className="text-gray-900">{viewingPackage.photographers || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Videografer</label>
                <p className="text-gray-900">{viewingPackage.videographers || '-'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Fisik</label>
              {viewingPackage.physicalItems && viewingPackage.physicalItems.length > 0 ? (
                <ul className="space-y-1">
                  {viewingPackage.physicalItems.map((item, idx) => (
                    <li key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{item.name}</span>
                      <span className="font-semibold">+Rp {item.price.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Tidak ada item fisik</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Digital</label>
              {viewingPackage.digitalItems && viewingPackage.digitalItems.length > 0 ? (
                <ul className="space-y-1">
                  {viewingPackage.digitalItems.map((item, idx) => (
                    <li key={idx} className="p-2 bg-gray-50 rounded">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Tidak ada item digital</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Packages;
