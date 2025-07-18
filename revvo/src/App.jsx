import React, { useState, useEffect, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { initializeCompanyId, isDebugEnabled, setVarPasswordOk, getVarPasswordOk } from './lib/globalState';
import { DEFAULT_COMPANY_ID, DEFAULT_USER_ID } from './constants/defaults';
import { format, subMonths, parseISO } from 'date-fns';
import UserProfile from './components/UserProfile/UserProfile';
import CompanyProfile from './components/CompanyProfile/CompanyProfile';
import DebugPanel from './components/DebugPanel/DebugPanel';

// Auth Components
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ChangePassword from './components/auth/ChangePassword';

// App Components
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import SalesOrders from './SalesOrders';
import BusinessAnalysis from './components/BusinessAnalysis/BusinessAnalysis';
import NewLimitOrder from './components/Sales/NewLimitOrder';
import OrderDetails from './components/OrderDetails';
import WorkflowRules from './components/WorkflowRules';
import CreditLimitPolicies from './components/CreditLimitPolicies';
import MySolicitations from './components/Sales/MySolicitations';
import RequestDetails from './components/Sales/RequestDetails';
import UserProfiles from './components/UserProfiles/UserProfiles';
import HistoricoLimites from './components/HistoricoLimites/HistoricoLimites';
import AlertasExternos from './components/AlertasExternos/AlertasExternos';
import ScoreComportamental from './components/ScoreComportamental/ScoreComportamental';
// import SapSalesOrders from './components/Sap/SapSalesOrders';
// import SapInvoices from './components/Sap/SapInvoices';

// Estilos
import './App.css';

// ErrorBoundary para capturar erros de renderização
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Você também pode registrar o erro em um serviço de relatório de erros
    console.error("Erro capturado pela ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          border: '1px solid #f56565', 
          borderRadius: '5px',
          backgroundColor: '#feb2b2',
          color: '#c53030'
        }}>
          <h2>Algo deu errado.</h2>
          <details style={{ whiteSpace: 'pre-wrap', margin: '10px 0' }}>
            <summary>Detalhes do erro</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#c53030',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // User Auth State
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados
  const [searchDate, setSearchDate] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [companyId] = useState(DEFAULT_COMPANY_ID);
  const [userId] = useState(DEFAULT_USER_ID);
  const [currentPage, setCurrentPage] = useState('sales');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSalesRequestOpen, setIsSalesRequestOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [salesOrders, setSalesOrders] = useState([]);
  const [monthlyBilling, setMonthlyBilling] = useState([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);
  const [showSalesOrder, setShowSalesOrder] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [selectedDetailCard, setSelectedDetailCard] = useState(null);
  const [showWorkflowRules, setShowWorkflowRules] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Check for active session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (data && data.session) {
          setSession(data.session);
          await initializeCompanyId(supabase);
          if (data.session.user?.user_metadata?.must_change_password) {
            setVarPasswordOk(false);
          } else {
            setVarPasswordOk(true);
          }
        } else {
          setVarPasswordOk(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setVarPasswordOk(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        initializeCompanyId(supabase);
        if (session.user?.user_metadata?.must_change_password) {
          setVarPasswordOk(false);
        } else {
          setVarPasswordOk(true);
        }
      } else {
        setVarPasswordOk(false);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [location.pathname]);

  // Controle do modal de troca de senha
  useEffect(() => {
    if (!!session && !getVarPasswordOk() && !showPasswordModal) {
      setShowPasswordModal(true);
    }
    if (getVarPasswordOk() && showPasswordModal) {
      setShowPasswordModal(false);
    }
  }, [session, showPasswordModal]);

  // Mock dos itens do pedido
  const mockOrderItems = [
    {
      name: "Implante Mamário Ergonômico",
      quantity: 2,
      unitPrice: 16530.00,
      total: 33060.00
    },
    {
      name: "Expansor Tecidual Mamário",
      quantity: 3,
      unitPrice: 10500.00,
      total: 31500.00
    },
    {
      name: "Implante Mamário Anatômico",
      quantity: 2,
      unitPrice: 13500.00,
      total: 27000.00
    }
  ];

  // Mock data for the detail view
  const mockDetailData = {
    SinteseCadastral: {
      Documento: "12345678000199",
      Nome: "EMPRESA DE EXEMPLO LTDA",
      DataFundacao: "01/01/2000",
      SituacaoRFB: "REGULAR"
    },
    PendenciasFinanceiras: {
      TotalOcorrencias: 2,
      PendenciasFinanceirasDetalhe: [
        {
          DataOcorrencia: "10/03/2024",
          Valor: "15.000,00",
          TipoAnotacaoDescricao: "PENDÊNCIA FINANCEIRA"
        }
      ]
    },
    Protestos: {
      TotalOcorrencias: 1,
      ProtestosDetalhe: [
        {
          DataOcorrencia: "15/02/2024",
          Valor: "5.000,00",
          Cidade: "São Paulo",
          Estado: "SP"
        }
      ]
    },
    AcoesJudiciais: {
      TotalOcorrencias: 0,
      Mensagem: "NÃO CONSTAM OCORRÊNCIAS"
    },
    ParticipacoesFalencias: {
      TotalOcorrencias: 0,
      Mensagem: "NÃO CONSTAM OCORRÊNCIAS"
    },
    SociosAdministradores: [
      {
        Nome: "JOÃO DA SILVA",
        CPF: "123.456.789-00",
        Participacao: "50%"
      },
      {
        Nome: "MARIA OLIVEIRA",
        CPF: "987.654.321-00",
        Participacao: "50%"
      }
    ],
    SerasaScoreEmpresas: {
      Score: 750,
      Classificacao: "BAIXO RISCO"
    }
  };

  // Hooks para carregar os dados
  useEffect(() => {
    async function loadCustomers() {
      try {
        const { data, error } = await supabase
          .from('customer')
          .select('id, name')
          .order('name', { ascending: true });

        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    }

    // Only load data if user is authenticated
    if (session) {
      loadCustomers();
    }
  }, [companyId, session]);

  useEffect(() => {
    async function loadSalesOrders() {
      try {
        const { data: companyData } = await supabase
          .from('company')
          .select('corporate_group_id')
          .eq('id', companyId)
          .single();

        if (companyData?.corporate_group_id) {
          const { data: companiesData } = await supabase
            .from('company')
            .select('id')
            .eq('corporate_group_id', companyData.corporate_group_id);

          if (companiesData?.length > 0) {
            const companyIds = companiesData.map(c => c.id);
            
            let query = supabase
              .from('sale_orders')
              .select(`
                id,
                created_at,
                customer_id,
                customer:customer_id(id, name),
                total_qtt,
                total_amt, 
                due_date
              `)
              .in('company_id', companyIds)
              .order('created_at', { ascending: false });
              
            if (selectedCustomer) {
              query = query.eq('customer_id', selectedCustomer);
            }
            
            const { data: ordersData, error } = await query;

            if (error) throw error;
            setSalesOrders(ordersData || []);
          }
        }
      } catch (error) {
        console.error('Error loading sales orders:', error);
      }
    }

    loadSalesOrders();
  }, [companyId, selectedCustomer]);

  useEffect(() => {
    async function loadMonthlyBilling() {
      try {
        // Definir o período de 13 meses
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);
        startDate.setDate(1);
        const endDate = new Date();
        endDate.setDate(1);

        // Buscar corporate_group_id
        const { data: companyData } = await supabase
          .from('company')
          .select('corporate_group_id')
          .eq('id', companyId)
          .single();

        if (companyData?.corporate_group_id) {
          let query = supabase
            .from('vw_faturamento_mensal')
            .select('*')
            .eq('corporate_group_id', companyData.corporate_group_id);

          if (selectedCustomer) {
            query = query.eq('customer_id', selectedCustomer);
          }

          const { data: billingData, error } = await query;

          if (error) throw error;

          // Criar array com todos os meses do período
          const allMonths = [];
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            allMonths.push(format(currentDate, 'yyyy-MM'));
            currentDate.setMonth(currentDate.getMonth() + 1);
          }

          // Inicializar todos os meses com zero
          const groupedData = {};
          allMonths.forEach(month => {
            groupedData[month] = {
              month,
              total_faturado: 0
            };
          });

          // Preencher com dados reais onde existirem
          billingData?.forEach(item => {
            const monthKey = format(new Date(item.month), 'yyyy-MM');
            if (groupedData[monthKey]) {
              groupedData[monthKey].total_faturado += parseFloat(item.total_faturado) || 0;
            }
          });

          // Converter para array e formatar para o gráfico
          const processedData = Object.values(groupedData)
            .sort((a, b) => a.month.localeCompare(b.month))
            .map(item => ({
              month: format(new Date(item.month + '-01'), 'MMM'),
              value: item.total_faturado
            }));

          setMonthlyBilling(processedData);
        }
      } catch (error) {
        console.error('Error loading monthly billing:', error);
        setMonthlyBilling([]);
      }
    }

    loadMonthlyBilling();
  }, [companyId, selectedCustomer]);

  useEffect(() => {
    async function loadOrderDetails() {
      try {
        let { data, error } = await supabase
          .from('vw_detalhes_pedidos_faturas')
          .select('*')
          .order('pedido_data', { ascending: false });

        if (error) throw error;
        
        // Group parcelas by pedido
        const groupedData = data.reduce((acc, curr) => {
          const existing = acc.find(item => item.numero_pedido === curr.numero_pedido);
          if (existing) {
            if (!existing.parcelas) existing.parcelas = [];
            if (curr.num_parcela) {
              existing.parcelas.push({
                num_parcela: curr.num_parcela,
                parcela_valor: curr.parcela_valor,
                vencimento_parcela: curr.vencimento_parcela,
                status_parcela: curr.status_parcela
              });
            }
            return acc;
          }
          
          const newOrder = {
            ...curr,
            parcelas: curr.num_parcela ? [{
              num_parcela: curr.num_parcela,
              parcela_valor: curr.parcela_valor,
              vencimento_parcela: curr.vencimento_parcela,
              status_parcela: curr.status_parcela
            }] : []
          };
          return [...acc, newOrder];
        }, []);

        setOrderDetails(groupedData || []);
      } catch (error) {
        console.error('Error loading order details:', error);
      }
    }

    loadOrderDetails();
  }, []);

  // Handlers
  const handleRowClick = (invoice) => {
    setSelectedInvoice(selectedInvoice?.numero_pedido === invoice.numero_pedido ? null : invoice);
    setSelectedInstallment(null);
  };

  const handleInstallmentClick = (installment, invoice) => {
    setSelectedInstallment(
      selectedInstallment?.number === installment.number ? null : 
      {
        ...installment,
        company: invoice.company,
        bank: invoice.bank,
        updateDate: '18/06/2024 às 09:37',
        status: 'Escriturada',
        drawer: invoice.drawee,
        fiscalKey: invoice.fiscalKey,
        installment: true,
        itemId: '374c6a2e-f39e-4abb-bb48-acabcd0e40bcb',
        transactionId: '73cd99c6-8e93-47e3-a675-568876e29478',
        businessAssetId: '76cd3076-42a7-47d1-8b53-5b1347d39df2',
        reference: 'AABBCCDD11223344',
        error: '230-999 erro inesperado/serviço indisponível'
      }
    );
  };

  // Listen for navigation events from other components
  useEffect(() => {
    const handleNavigateToDashboard = (event) => {
      const { order } = event.detail;
      setCurrentPage('home');
      setSelectedDetailCard(order);
      // Set the selected customer to ensure customer details are shown in the filter
      if (order && order.customer_id) {
        setSelectedCustomer(order.customer_id);
        setIsFilterOpen(true); // Ensure the filter is visible
      }
    };

    const handleNavigateToInbox = () => {
      setCurrentPage('sales');
      setSelectedDetailCard(null);
      setSelectedCustomer('');
      setIsFilterOpen(false);
    };

    window.addEventListener('navigateToDashboard', handleNavigateToDashboard);
    window.addEventListener('navigateToInbox', handleNavigateToInbox);
    
    return () => {
      window.removeEventListener('navigateToDashboard', handleNavigateToDashboard);
      window.removeEventListener('navigateToInbox', handleNavigateToInbox);
    };
  }, []);

  // Auth Wrapper for protected routes
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
    }
    
    if (!session) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  // Renderização
  return (
    <ErrorBoundary>
    {isDebugEnabled() && (
      <DebugPanel 
        pageVariables={{
          currentPage,
          selectedCustomer,
          isFilterOpen,
          isSidebarOpen,
          isConfigOpen,
          isSalesRequestOpen,
          showWorkflowRules,
          showSalesOrder,
          selectedRequest,
          selectedDetailCard,
          selectedInvoice,
          selectedInstallment
        }}
      />
    )}
    
    <Toaster />
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/signup" element={!session ? <SignUp /> : <Navigate to="/" replace />} />
      <Route path="/forgot-password" element={!session ? <ForgotPassword /> : <Navigate to="/" replace />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/" element={
        <ProtectedRoute>
    <Layout
      showUserProfile={showUserProfile}
      setShowUserProfile={setShowUserProfile}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      isConfigOpen={isConfigOpen}
      setIsConfigOpen={setIsConfigOpen}
      isSalesRequestOpen={isSalesRequestOpen}
      setIsSalesRequestOpen={setIsSalesRequestOpen}
      setShowWorkflowRules={setShowWorkflowRules}
      setShowSalesOrder={setShowSalesOrder}
    >
      {currentPage === 'sales-order' ? (
        <NewLimitOrder />
      ) : currentPage === 'my-requests' ? (
        <MySolicitations 
          setCurrentPage={setCurrentPage}
          setSelectedRequest={setSelectedRequest}
        />
      ) : currentPage === 'request-details' ? (
        <RequestDetails 
          selectedRequest={selectedRequest}
          setCurrentPage={setCurrentPage}
        />
      ) : currentPage === 'workflow' && showWorkflowRules ? (
        <WorkflowRules />
      ) : currentPage === 'credit-limit-policies' ? (
        <CreditLimitPolicies />
      ) : currentPage === 'analise' ? (
        <BusinessAnalysis />
      ) : currentPage === 'profile' ? (
        <UserProfile onClose={() => setCurrentPage('sales')} />
      ) : currentPage === 'profiles' ? (
        <UserProfiles />
      ) : currentPage === 'company' ? (
        <CompanyProfile onClose={() => setCurrentPage('sales')} />
      ) : currentPage === 'historico-limites' ? (
        <HistoricoLimites />
      ) : currentPage === 'alertas-externos' ? (
        <AlertasExternos />
      ) : currentPage === 'score-comportamental' ? (
        <ScoreComportamental />
      // ) : currentPage === 'sap-sales-orders' ? (
      //   <SapSalesOrders />
      // ) : currentPage === 'sap-invoices' ? (
      //   <SapInvoices />
      ) : currentPage === 'home' ? (
        <>
          {selectedSalesOrder ? (
            <OrderDetails order={selectedSalesOrder} onClose={() => setSelectedSalesOrder(null)} />
          ) : (
            <Dashboard
              customers={customers}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              salesOrders={salesOrders}
              monthlyBilling={monthlyBilling}
              orderDetails={orderDetails}
              selectedInvoice={selectedInvoice}
              setSelectedInvoice={setSelectedInvoice}
              selectedInstallment={selectedInstallment}
              setSelectedInstallment={setSelectedInstallment}
              selectedDetailCard={selectedDetailCard}
              setSelectedDetailCard={setSelectedDetailCard}
              handleRowClick={handleRowClick}
              handleInstallmentClick={handleInstallmentClick}
              mockOrderItems={mockOrderItems}
              mockDetailData={mockDetailData}
            />
          )}
        </>
      ) : (
        <SalesOrders />
      )}
    </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  );
}

export default App;