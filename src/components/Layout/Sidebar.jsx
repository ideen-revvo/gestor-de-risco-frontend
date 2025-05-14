import React from 'react';
import styled from 'styled-components';
import { 
  House, List, CurrencyDollar, ShoppingCart, Gear, ChartLine,
  CaretDown, Question, Bell, User, 
  Envelope, SignOut
} from '@phosphor-icons/react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const SidebarContainer = styled.nav`
  position: fixed;
  top: 48px;
  left: 0;
  bottom: 0;
  width: 240px;
  overflow-y: auto;
  background: white;
  border-right: 1px solid var(--border-color);
  padding: 16px;

  h3 {
    margin-top: 40px;
  }

  ul {
    list-style: none;
    margin-top: 0px;
    
    &.mobile-menu {
      display: none;
      
      @media (max-width: 768px) {
        display: block;
        margin-top: 32px;
        padding-top: 16px;
        border-top: 1px solid var(--border-color);
      }
    }

    &.submenu {
      margin-top: 8px;
      margin-left: 24px;
      margin-bottom: 16px;

      li {
        padding: 8px 12px;
        color: var(--secondary-text);
        
        &:hover {
          color: var(--primary-text);
        }
        
        &.active {
          color: var(--primary-blue);
        }
      }
    }
  }

  li {
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    
    &:hover {
      background: var(--background);
    }
    
    &.active {
      background: #dff3ff;
      color: var(--primary-blue);
      display: flex;
      justify-content: flex-start;
      align-items: center;

      &::after {
        content: '';
        width: 6px;
        height: 6px;
        background: #0070F2;
        border-radius: 50%;
        margin-left: auto;
      }
    }
  }

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: ${props => props['data-isopen'] === 'true' ? '0' : '-240px'};
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
  }
`;

const MenuButton = styled.button`
  display: none;
  position: fixed;
  top: 4px;
  left: 16px;
  z-index: 1001;
  padding: 8px;
  border-radius: 4px;
  background: transparent;
  border: none;
  @media (max-width: 768px) {
    display: block;
  }
`;

const Sidebar = ({ 
  currentPage, 
  setCurrentPage, 
  isSidebarOpen, 
  setIsSidebarOpen,
  isConfigOpen,
  setIsConfigOpen,
  isSalesRequestOpen: propIsSalesRequestOpen,
  setIsSalesRequestOpen,
  setShowWorkflowRules,
  setShowSalesOrder
}) => {
  const navigate = useNavigate();
  // Usar React.useState para garantir que funcione mesmo se o componente não for importado como React
  const [localIsSalesRequestOpen, setLocalIsSalesRequestOpen] = React.useState(false);
  
  // Usar o estado local se o prop não estiver definido
  const effectiveIsSalesRequestOpen = propIsSalesRequestOpen !== undefined ? propIsSalesRequestOpen : localIsSalesRequestOpen;
  const handleSalesRequestToggle = () => {
    if (setIsSalesRequestOpen) {
      setIsSalesRequestOpen(!effectiveIsSalesRequestOpen);
    } else {
      setLocalIsSalesRequestOpen(!effectiveIsSalesRequestOpen);
    }
  };

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
    <>
      <MenuButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <List size={24} />
      </MenuButton>
      
      <SidebarContainer data-isopen={isSidebarOpen.toString()}>
        <h3>Menu</h3>
        <ul style={{ marginTop: '16px' }}>
          <li 
            className={currentPage === 'sales' || currentPage === 'home' ? 'active' : ''}
            onClick={() => {
              setCurrentPage('sales');
              setShowSalesOrder(false);
            }}
          >
            <Envelope size={16} weight="regular" />
            Caixa de Entrada
          </li>
          <li onClick={handleSalesRequestToggle} style={{ cursor: 'pointer' }}>
            <ShoppingCart size={16} weight="regular" />
            Solicitação de Limite
            <CaretDown 
              size={16}
              style={{ 
                marginLeft: '4px',
                transform: effectiveIsSalesRequestOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.3s ease'
              }}
            />
          </li>
        </ul>

        <ul className="submenu" style={{ display: effectiveIsSalesRequestOpen ? 'block' : 'none' }}>
          <li 
            className={currentPage === 'my-requests' ? 'active' : ''}
            onClick={() => {
              setCurrentPage('my-requests');
              setShowSalesOrder(false);
            }}
          >
            Minhas solicitações
          </li>
          <li 
            className={currentPage === 'sales-order' ? 'active' : ''}
            onClick={() => {
              setCurrentPage('sales-order');
              setShowSalesOrder(true);
            }}
          >
            Nova solicitação
          </li>
        </ul>

        <ul>
          <li 
            className={currentPage === 'analise' ? 'active' : ''}
            onClick={() => setCurrentPage('analise')}
          >
            <Eye size={16} weight="regular" />
            Risco Cliente
          </li>
          <li onClick={() => setIsConfigOpen(!isConfigOpen)} style={{ cursor: 'pointer' }}>
            <Gear size={16} weight="regular" />
            Configurações
            <CaretDown 
              size={16}
              style={{ 
                marginLeft: '4px',
                transform: isConfigOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.3s ease'
              }}
            />
          </li>
        </ul>
        
        <ul className="submenu" style={{ display: isConfigOpen ? 'block' : 'none' }}>
          <li 
            className={currentPage === 'profiles' ? 'active' : ''}
            onClick={() => {
              setCurrentPage('profiles');
              setShowWorkflowRules(false);
            }}
          >
            Perfis e acessos
          </li>
          <li 
            className={currentPage === 'company' ? 'active' : ''}
            onClick={() => {
              setCurrentPage('company');
              setShowWorkflowRules(false);
            }}
          >
            Dados da Empresa
          </li>
          <li 
            className={currentPage === 'workflow' ? 'active' : ''}
            onClick={() => {
              setCurrentPage('workflow');
              setShowWorkflowRules(true);
            }}
          >
            Workflow
          </li>
          <li 
            className={currentPage === 'credit-limit-policies' ? 'active' : ''}
            onClick={() => {
              setCurrentPage('credit-limit-policies');
            }}
          >
            Políticas de limites
          </li>
        </ul>
        
        <ul className="mobile-menu">
          <li>
            <Question size={16} weight="regular" />
            Ajuda
          </li>
          <li>
            <Bell size={16} weight="regular" />
            Notificações
          </li>
          <li>
            <User size={16} weight="regular" />
            Perfil do usuário
          </li>
          <li onClick={handleLogout} style={{ color: '#e53e3e' }}>
            <SignOut size={16} weight="regular" />
            Sair
          </li>
        </ul>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;