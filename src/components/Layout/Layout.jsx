import React from 'react';
import styled from 'styled-components';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  position: relative;
`;

const Main = styled.main`
  flex: 1;
  margin-left: 240px;
  padding: 24px;
  overflow-x: hidden;

  @media (max-width: 768px) {
    margin-left: 0;
    padding-top: 24px;
    
    .filter-toggle {
      display: flex !important;
    }

    .filter-content {
      width: 100%;

      input {
        width: 100%;
      }

      > div > div {
        flex-direction: column;

        button {
          width: 100%;
        }
      }
    }
  }
`;

const Layout = ({ 
  children, 
  currentPage,
  setCurrentPage,
  isSidebarOpen,
  setIsSidebarOpen,
  isConfigOpen,
  setIsConfigOpen,
  setShowWorkflowRules,
  setShowSalesOrder
}) => {
  const [isSalesRequestOpen, setIsSalesRequestOpen] = React.useState(false);

  React.useEffect(() => {
    const handleNavigateToProfile = () => {
      setCurrentPage('profile');
    };

    window.addEventListener('navigateToProfile', handleNavigateToProfile);
    return () => {
      window.removeEventListener('navigateToProfile', handleNavigateToProfile);
    };
  }, [setCurrentPage]);
  
  return (
    <Container>
      <TopBar />
      <Content>
        <Sidebar 
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
        />
        <Main>
          {children}
        </Main>
      </Content>
    </Container>
  );
};

export default Layout;