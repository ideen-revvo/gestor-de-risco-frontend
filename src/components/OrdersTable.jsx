import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { X } from '@phosphor-icons/react'
import { supabase } from '../lib/supabase'

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--background);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
    
    &:hover {
      background: #D1D5DB;
    }
  }
`

const InvoiceDetails = styled.div`
  background: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin: 8px 0;
  overflow: hidden;
`

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid var(--border-color);

  h2 {
    font-size: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .actions {
    display: flex;
    gap: 8px;
  }
`

const InvoiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
  background: white;
`

const InvoiceField = styled.div`
  h4 {
    font-size: 13px;
    color: var(--secondary-text);
    margin-bottom: 4px;
  }
  
  p {
    font-size: 14px;
  }
`

const InstallmentsTable = styled.table`
  background: white;
  margin: 0;
  min-width: 600px;
  
  th, td {
    font-size: 13px;
  }

  th:first-child,
  td:first-child {
    padding-left: 16px;
  }

  th:last-child,
  td:last-child {
    padding-right: 16px;
  }
`

const OrdersTable = () => {
  const [orderDetails, setOrderDetails] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)

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

  const handleRowClick = (invoice) => {
    setSelectedInvoice(selectedInvoice?.numero_pedido === invoice.numero_pedido ? null : invoice)
  }

  return (
    <div className="card">
      <h3>Pedidos</h3>
      <TableWrapper>
        <table style={{ minWidth: '600px' }}>
          <thead>
            <tr>
              <th>Nº Pedido</th>
              <th>Cliente</th>
              <th>Data do pedido</th>
              <th>Valor do pedido</th>
              <th style={{ textAlign: 'center' }}>Aprovado</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
          {orderDetails.map(order => (
            <React.Fragment key={order.numero_pedido}>
              <tr onClick={() => handleRowClick(order)} style={{ cursor: 'pointer' }}>
                <td>#{order.numero_pedido}</td>
                <td>{order.cliente_nome || 'N/A'}</td>
                <td>{new Date(order.pedido_data).toLocaleDateString('pt-BR')}</td>
                <td>R$ {order.pedido_valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</td>
                <td>
                  <span style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: order.aprovado ? 'var(--success)' : 'var(--error)'
                    }} />
                  </span>
                </td>
                <td>{order.status_fatura || 'N/A'}</td>
              </tr>
              {selectedInvoice?.numero_pedido === order.numero_pedido && (
                <tr style={{ background: 'transparent' }}>
                  <td colSpan={6} style={{ padding: 0, border: 0 }}>
                    <InvoiceDetails>
                      <InvoiceHeader>
                        <h2>
                          Fatura {order.numero_fatura}
                          <span style={{ color: 'var(--secondary-text)', fontSize: '14px', fontWeight: 'normal' }}>
                            Vencimento: {order.vencimento_final ? new Date(order.vencimento_final).toLocaleDateString('pt-BR') : 'N/A'}
                          </span> 
                        </h2>
                        <div className="actions">
                          <button>
                            Emitir duplicata
                          </button>
                          <button className="primary">
                            Solicitar antecipação
                          </button>
                          <button onClick={() => setSelectedInvoice(null)}>
                            <X size={16} />
                          </button>
                        </div>
                      </InvoiceHeader>
                      
                      <InvoiceGrid style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <InvoiceField>
                          <h4>Valor total</h4>
                          <p>R$ {order.fatura_valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</p>
                        </InvoiceField>
                        <InvoiceField>
                          <h4>Cliente</h4>
                          <p>{order.cliente_nome || 'N/A'}</p>
                        </InvoiceField>
                        
                        <InvoiceField>
                          <h4>Data do pedido</h4>
                          <p>{new Date(order.pedido_data).toLocaleDateString('pt-BR')}</p>
                        </InvoiceField>
                      </InvoiceGrid>
                      
                      <InstallmentsTable style={{ margin: '16px' }}>
                        <thead>
                          <tr>
                            <th>Parcela</th>
                            <th>Valor</th>
                            <th>Vencimento</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody style={{ background: 'white' }}>
                          {order.parcelas?.map(parcela => (
                            <tr key={`${order.numero_pedido}-${parcela.num_parcela}`}>
                              <td>{parcela.num_parcela}</td>
                              <td>R$ {parcela.parcela_valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                              <td>{new Date(parcela.vencimento_parcela).toLocaleDateString('pt-BR')}</td>
                              <td>
                                <span style={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <div style={{ 
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: parcela.status_parcela?.toLowerCase() === 'pago' || parcela.status_parcela === 'em dia' ? 'var(--success)' : 'var(--error)'
                                  }} />
                                  {parcela.status_parcela}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </InstallmentsTable> 
                    </InvoiceDetails>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  )
}

export default OrdersTable 