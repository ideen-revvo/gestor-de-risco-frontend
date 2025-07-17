import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { DEFAULT_COMPANY_ID } from '../../constants/defaults';
import { getGlobalCompanyId } from '../../lib/globalState';
import UserProfilesHeader from './UserProfilesHeader';
import UserProfilesFilter from './UserProfilesFilter';
import UserProfilesList from './UserProfilesList';
import UserProfilesForm from './UserProfilesForm';
import { X } from '@phosphor-icons/react';
import { listUserProfiles, deleteUserProfile, listCompanies, getRoles } from '../../services/userProfileService';

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const UserProfiles = () => {
  const companyId = getGlobalCompanyId();
  const [profiles, setProfiles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companies, setCompanies] = useState([]);

  const loadProfiles = async () => {
    try {
      const data = await listUserProfiles(getGlobalCompanyId());
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    async function loadRoles() {
      try {
        const data = await getRoles(getGlobalCompanyId());
        setRoles(data || []);
      } catch (error) {
        console.error('Error loading roles:', error);
      }
    }
    loadRoles();
  }, []);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const data = await listCompanies(getGlobalCompanyId());
        setCompanies(data || []);
      } catch (error) {
        console.error('Error loading companies:', error);
      }
    }

    loadCompanies();
  }, []);

  const handleCreateProfile = () => {
    setSelectedProfile(null);
    setIsFormOpen(true);
  };

  const handleEditProfile = (profile) => {
    setSelectedProfile(profile);
    setIsFormOpen(true);
  };

  const handleDeleteProfile = async (profileId) => {
    if (window.confirm('Tem certeza que deseja excluir este perfil?')) {
      try {
        // Buscar o logged_id do usuário para excluir do auth.users
        const { data: userProfile, error: fetchError } = await supabase
          .from('user_profile')
          .select('logged_id')
          .eq('id', profileId)
          .single();
        
        if (fetchError) throw fetchError;

        // Excluir do auth.users via admin
        if (userProfile?.logged_id) {
          const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userProfile.logged_id);
          if (authError) throw authError;
        }

        // Excluir do user_profile
        await deleteUserProfile(profileId);

        // Recarregar a lista de perfis
        await loadProfiles();
      } catch (error) {
        console.error('Error deleting profile:', error);
        alert('Erro ao excluir perfil. Por favor, tente novamente.');
      }
    }
  };

  const handleSaveProfile = async (profileData) => {
    try {
      if (selectedProfile) {
        const { error } = await supabase
          .from('user_profile')
          .update(profileData)
          .eq('id', selectedProfile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_profile')
          .insert([{ ...profileData, company_id: getGlobalCompanyId() }]);

        if (error) throw error;
      }

      setIsFormOpen(false);
      loadProfiles();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || profile.role_id === selectedRole;
    const matchesCompany = !selectedCompany || profile.company_id === selectedCompany;
    return matchesSearch && matchesRole && matchesCompany;
  });

  return (
    <Container>
      <UserProfilesHeader 
        supabase={supabase}
        roles={roles}
        onInviteSuccess={loadProfiles}
      />
      
      <UserProfilesFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roles={roles}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        companies={companies}
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
      />
      
      <UserProfilesList
        profiles={filteredProfiles}
        onEdit={handleEditProfile}
        onDelete={handleDeleteProfile}
      />

      {isFormOpen && (
        <UserProfilesForm
          profile={selectedProfile}
          roles={roles}
          onSave={handleSaveProfile}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </Container>
  );
};

export default UserProfiles;