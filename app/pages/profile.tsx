// ProfilePage.tsx
import { Briefcase, Clock, Edit, MapPin, Phone, Save, XCircle, Lock, Key } from 'lucide-react';
import React, { useState } from 'react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { useAuthStore } from '~/store/auth-store';
import { useToast, ToastContainer } from '~/components/ui/Toast';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const { toasts, showToast, dismiss } = useToast();

  const profile = {
    id: user?.id ?? '',
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: 'Administrador',
    phone: '',
    address: '',
    department: 'TI e Operações',
    lastLogin: '',
    profilePicture: `https://placehold.co/100x100/003cc3/ffffff?text=${(user?.name ?? 'AD').slice(0, 2).toUpperCase()}`,
  };

  const [formData, setFormData] = useState(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    showToast('Perfil atualizado com sucesso!', 'success');
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">Meu Perfil</h1>
        <p className="text-[13px] text-gray-500">Visualize e edite as informações do seu perfil de usuário.</p>

        <div className="rounded-md border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] font-semibold text-gray-900">Informações Pessoais</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-[#00216b] text-white rounded-lg hover:bg-[#003cc3] transition-colors duration-200"
              >
                <Edit size={16} className="mr-2" />
                Editar Perfil
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-[#00216b] text-white rounded-lg hover:bg-[#003cc3] transition-colors duration-200"
                >
                  <Save size={16} className="mr-2" />
                  Salvar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  <XCircle size={16} className="mr-2" />
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="flex-shrink-0">
              <img
                src={profile.profilePicture}
                alt="Foto de Perfil"
                className="w-24 h-24 rounded-full object-cover border-2 border-[#00216b] shadow-md"
              />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 w-full">
              {/* Nome */}
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                {isEditing ? (
                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-lg">{profile.name}</p>
                )}
              </div>
              {/* Email */}
              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-lg">{profile.email}</p>
                )}
              </div>
              {/* Papel */}
              <div>
                <label htmlFor="profile-role" className="block text-sm font-medium text-gray-700 mb-1">Papel</label>
                <p id="profile-role" className="text-gray-900 font-medium text-lg flex items-center">
                  <Briefcase size={16} className="mr-2 text-gray-500" />
                  {profile.role}
                </p>
              </div>
              {/* Telefone */}
              <div>
                <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                {isEditing ? (
                  <input
                    id="profile-phone"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-lg flex items-center">
                    <Phone size={16} className="mr-2 text-gray-500" />
                    {profile.phone}
                  </p>
                )}
              </div>
              {/* Endereço */}
              <div className="md:col-span-2">
                <label htmlFor="profile-address" className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                {isEditing ? (
                  <input
                    id="profile-address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-lg flex items-center">
                    <MapPin size={16} className="mr-2 text-gray-500" />
                    {profile.address}
                  </p>
                )}
              </div>
              {/* Último Login */}
              <div className="md:col-span-2">
                <label htmlFor="profile-last-login" className="block text-sm font-medium text-gray-700 mb-1">Último Login</label>
                <p id="profile-last-login" className="text-gray-900 font-medium text-lg flex items-center">
                  <Clock size={16} className="mr-2 text-gray-500" />
                  {profile.lastLogin}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Segurança da Conta */}
        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Segurança da Conta</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Lock size={20} className="text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Alterar Senha</p>
                  <p className="text-sm text-gray-600">Recomendado alterar sua senha regularmente.</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[#00216b] text-white rounded-lg hover:bg-[#003cc3] transition-colors duration-200">
                Alterar
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Key size={20} className="text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Autenticação de Dois Fatores (2FA)</p>
                  <p className="text-sm text-gray-600">Aumente a segurança da sua conta com 2FA.</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[#00216b] text-white rounded-lg hover:bg-[#003cc3] transition-colors duration-200">
                Configurar
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </AdminLayout>
  );
}
