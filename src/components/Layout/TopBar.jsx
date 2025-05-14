import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Question, Bell, User, SignOut } from '@phosphor-icons/react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const TopHeader = styled.div`
  height: 48px;
  background: white;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    padding-right: 0px;
  }
`;

const Logo = styled.img`
  height: 28px;
  object-fit: contain;
  margin-left: 16px;

  @media (max-width: 768px) {
    margin-left: 48px;
  }
`;

const HeaderRight = styled.div`
  position: absolute;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 24px;

  .powered-by {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--secondary-text);
    font-size: 12px;
    
    @media (max-width: 768px) {
      display: none;
    }

    img {
      height: 16px;
    }
  }

  .icons {
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(--secondary-text);
    
    @media (max-width: 768px) {
      display: none;
    }

    button {
      border: none;
      background: none;
      padding: 0;
      height: auto;
      color: inherit;

      &:hover {
        color: var(--primary-text);
      }
    }
  }
`;

const UserMenu = styled.div`
  position: absolute;
  top: 48px;
  right: 16px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 200px;
  z-index: 1000;
  overflow: hidden;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--primary-text);

  &:hover {
    background: #f5f5f5;
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`;

const TopBar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        let retries = 3;
        let error;
        
        while (retries > 0) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) return;

            const { data, error: profileError } = await supabase
              .from('user_profile')
              .select('name')
              .eq('logged_id', session.user.id)
              .single();

            if (profileError) throw profileError;
            setCurrentUser(data || { name: '' });
            return;
          } catch (e) {
            error = e;
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        throw error;
      } catch (error) {
        console.error('Error loading user profile:', error.message);
      }
    }
    loadUserProfile();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      // Redirect to login regardless of error
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error.message);
      // Still redirect to login even if there's an error
      navigate('/login');
    }
  };

  return (
    <TopHeader>
      <Logo src="https://vpnusoaiqtuqihkstgzt.supabase.co/storage/v1/object/public/erp//sap-logo.png" alt="SAP" />
      <HeaderRight>
        <div className="powered-by">
          Powered by
          <img src="https://vpnusoaiqtuqihkstgzt.supabase.co/storage/v1/object/public/revvo/logo/LOGO_REVVO_COLOR.png" alt="revvo" />
        </div>
        <div className="icons">
          <button>
            <Question size={20} weight="regular" />
          </button>
          <button>
            <Bell size={20} weight="regular" />
          </button>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <User size={20} weight="regular" />
            {currentUser?.name && (
              <span style={{ fontSize: '14px' }}>{currentUser.name}</span>
            )}
          </button>
        </div>
        {showUserMenu && (
          <UserMenu ref={menuRef}>
            <MenuItem onClick={() => {
              setShowUserMenu(false);
              window.dispatchEvent(new CustomEvent('navigateToProfile'));
            }}>
              <User size={16} />
              Meu Perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <SignOut size={16} />
              Sair
            </MenuItem>
          </UserMenu>
        )}
      </HeaderRight>
    </TopHeader>
  );
};

export default TopBar;