import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Question, Bell, User, SignOut } from '@phosphor-icons/react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { getWorkflowNotifications } from '../../services/notificationService';
import { getUserName } from '../../services/userProfileService';
import { logout } from '../../services/authService';

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
    }    button {
      border: none;
      background: none;
      padding: 0;
      height: auto;
      color: inherit;
      position: relative;

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

const NotificationDropdown = styled.div`
  position: absolute;
  top: 48px;
  right: 120px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 320px;
  max-height: 400px;
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    right: 16px;
    width: 280px;
  }
`;

const NotificationHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-text);
  }

  .mark-all-read {
    background: none;
    border: none;
    color: var(--primary-blue);
    font-size: 12px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background: rgba(0, 112, 242, 0.1);
    }

    &:disabled {
      color: var(--secondary-text);
      cursor: not-allowed;
    }
  }
`;

const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }

  .notification-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text);
    margin-bottom: 4px;
  }

  .notification-message {
    font-size: 13px;
    color: var(--secondary-text);
    line-height: 1.4;
    margin-bottom: 8px;
  }

  .notification-time {
    font-size: 12px;
    color: var(--secondary-text);
  }

  &.unread {
    background: #f0f7ff;
    border-left: 3px solid var(--primary-blue);
  }
`;

const EmptyNotifications = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: var(--secondary-text);
  
  .empty-icon {
    margin-bottom: 8px;
    color: #d1d5db;
  }
  
  .empty-text {
    font-size: 14px;
  }
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
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();  const [currentUser, setCurrentUser] = useState(null);
  
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;
        const notifications = await getWorkflowNotifications(session.user.id);
        setNotifications(notifications);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error.message);
      }
    }
    fetchNotifications();
  }, []);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;
        const name = await getUserName(session.user.id);
        setCurrentUser({ name });
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
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification) => {
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
    );

    setShowNotifications(false);

    if (notification && notification.request) {
      window.dispatchEvent(new CustomEvent('navigateToDashboard', {
        detail: {
          order: notification.request
        }
      }));
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, unread: false }))
    );
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = async () => {
    try {
      await logout();
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
        </div>        <div className="icons">
          <button>
            <Question size={20} weight="regular" />
          </button>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: 'relative' }}
          >
            <Bell size={20} weight="regular" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {unreadCount}
              </span>
            )}
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
        </div>        {showUserMenu && (
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
        {showNotifications && (
          <NotificationDropdown ref={notificationRef}>            <NotificationHeader>
              <h3>Notificações</h3>
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read"
                  onClick={handleMarkAllAsRead}
                >
                  Marcar todas como lidas
                </button>
              )}
            </NotificationHeader>            <NotificationList>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    className={notification.unread ? 'unread' : ''}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{notification.time}</div>
                  </NotificationItem>
                ))
              ) : (
                <EmptyNotifications>
                  <div className="empty-icon">
                    <Bell size={24} />
                  </div>
                  <div className="empty-text">Nenhuma notificação</div>
                </EmptyNotifications>
              )}
            </NotificationList>
          </NotificationDropdown>
        )}
      </HeaderRight>
    </TopHeader>
  );
};

export default TopBar;