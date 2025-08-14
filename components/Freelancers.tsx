
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Star, DollarSign, Phone, Mail, User } from 'lucide-react';
import { TeamMember, ViewType } from '../types';
import { teamMembersService } from '../services/database';
import { useCrud } from '../hooks/useCrud';
import Modal from './Modal';
import PageHeader from './PageHeader';

interface FreelancersProps {
  onNavigate: (view: ViewType, action?: any) => void;
  showNotification: (message: string) => void;
}

const Freelancers: React.FC<FreelancersProps> = ({ onNavigate, showNotification }) => {
  const { items: teamMembers, create, update, delete: deleteItem, loading } = useCrud(
    teamMembersService,
    showNotification,
    'Freelancer'
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    standardFee: 0,
    noRek: '',
    rewardBalance: 0,
    rating: 0,
    performanceNotes: [],
    portalAccessId: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'standardFee' || name === 'rewardBalance' || name === 'rating' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await update(editingMember.id, formData);
      } else {
        await create({
          ...formData,
          portalAccessId: `freelancer_${Date.now()}`
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving freelancer:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      email: '',
      phone: '',
      standardFee: 0,
      noRek: '',
      rewardBalance: 0,
      rating: 0,
      performanceNotes: [],
      portalAccessId: ''
    });
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      standardFee: member.standardFee,
      noRek: member.noRek || '',
      rewardBalance: member.rewardBalance,
      rating: member.rating,
      performanceNotes: member.performanceNotes || [],
      portalAccessId: member.portalAccessId
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus freelancer ini?')) {
      await deleteItem(id);
    }
  };

  const handleView = (member: TeamMember) => {
    setViewingMember(member);
  };

  const roles = ['Fotografer', 'Videografer', 'Editor', 'Desainer', 'Koordinator'];

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Manajemen Freelancer" 
        description="Kelola data freelancer dan tim kerja" 
      />

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Total: {teamMembers.length} freelancer
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Tambah Freelancer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < member.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({member.rating}/5)</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(member)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleEdit(member)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Mail size={16} className="mr-2" />
                {member.email}
              </div>
              <div className="flex items-center text-gray-600">
                <Phone size={16} className="mr-2" />
                {member.phone}
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign size={16} className="mr-2" />
                Fee: Rp {member.standardFee.toLocaleString()}
              </div>
              <div className="flex items-center text-green-600">
                <DollarSign size={16} className="mr-2" />
                Saldo Reward: Rp {member.rewardBalance.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={resetForm}
        title={editingMember ? 'Edit Freelancer' : 'Tambah Freelancer Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap *
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
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Telepon *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Standar (Rp) *
              </label>
              <input
                type="number"
                name="standardFee"
                value={formData.standardFee}
                onChange={handleInputChange}
                min="0"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Rekening
              </label>
              <input
                type="text"
                name="noRek"
                value={formData.noRek}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (1-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saldo Reward (Rp)
              </label>
              <input
                type="number"
                name="rewardBalance"
                value={formData.rewardBalance}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
              {editingMember ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={!!viewingMember}
        onClose={() => setViewingMember(null)}
        title="Detail Freelancer"
      >
        {viewingMember && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama</label>
                <p className="text-gray-900">{viewingMember.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="text-gray-900">{viewingMember.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{viewingMember.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telepon</label>
                <p className="text-gray-900">{viewingMember.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fee Standar</label>
                <p className="text-gray-900">Rp {viewingMember.standardFee.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">No. Rekening</label>
                <p className="text-gray-900">{viewingMember.noRek || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < viewingMember.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                  <span className="ml-2">({viewingMember.rating}/5)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Saldo Reward</label>
                <p className="text-green-600 font-semibold">Rp {viewingMember.rewardBalance.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Portal Access ID</label>
              <p className="text-gray-900 font-mono text-sm">{viewingMember.portalAccessId}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Freelancers;
