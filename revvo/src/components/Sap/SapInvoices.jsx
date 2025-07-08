import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { MagnifyingGlass, Download, Eye, FileText, Calendar, Receipt, User, CurrencyCircleDollar, Bank, Hash } from '@phosphor-icons/react'
import { supabase } from '../../lib/supabase'

const API_URL = 'http://localhost:3001'

const colors = {
  primary: '#0066cc',
  primaryDark: '#0052a3',
  primaryText: '#1a1a1a',
  secondaryText: '#666666',
  background: '#f5f5f5',
  white: '#ffffff',
  borderColor: '#e0e0e0',
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107'
}

const Container = styled.div`
  padding: 24px;
  background: ${colors.background};
  min-height: 100vh;
`

const Header = styled.div`
  margin-bottom: 24px;
  h1 {
    font-size: 24px;
    font-weight: 600;
    color: ${colors.primaryText};
    margin-bottom: 8px;
  }
  p {
    color: ${colors.secondaryText};
    font-size: 14px;
  }
`

const FiltersCard = styled.div`
  background: ${colors.white};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  label {
    font-size: 13px;
    color: ${colors.secondaryText};
    font-weight: 500;
  }
  
  input, select {
    padding: 12px 16px;
    border: 1px solid ${colors.borderColor};
    border-radius: 6px;
    font-size: 14px;
    background: ${colors.white};
    color: ${colors.primaryText};
    width: 100%;
    box-sizing: border-box;
    height: 44px;
    line-height: 1.5;
    
    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }
    
    &::placeholder {
      color: #999999;
    }
  }
`

const FilterActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  
  button {
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
    height: 44px;
    
    &.primary {
      background: ${colors.primary};
      color: ${colors.white};
      border: none;
      
      &:hover {
        background: ${colors.primaryDark};
      }
      
      svg {
        color: ${colors.white};
      }
    }
    
    &.secondary {
      background: ${colors.white};
      color: ${colors.primaryText};
      border: 1px solid ${colors.borderColor};
      
      &:hover {
        background: ${colors.background};
      }
    }
  }
`

const TableCard = styled.div`
  background: ${colors.white};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`

const TableHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${colors.borderColor};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    font-size: 16px;
    font-weight: 600;
    color: ${colors.primaryText};
  }
  
  .actions {
    display: flex;
    gap: 8px;
    
    button {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 4px;
      background: ${colors.white};
      color: ${colors.primaryText};
      border: 1px solid ${colors.borderColor};
      
      &:hover {
        background: ${colors.background};
      }
    }
  }
`

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.background};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.borderColor};
    border-radius: 4px;
    
    &:hover {
      background: #D1D5DB;
    }
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
  
  thead {
    background: ${colors.background};
    
    th {
      padding: 12px 16px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: ${colors.secondaryText};
      white-space: nowrap;
    }
  }
  
  tbody {
    tr {
      border-bottom: 1px solid ${colors.borderColor};
      cursor: pointer;
      transition: background 0.2s;
      
      &:hover {
        background: ${colors.background};
      }
      
      &.selected {
        background: #E6F2FF;
      }
    }
    
    td {
      padding: 14px 16px;
      font-size: 14px;
      color: ${colors.primaryText};
      
      &.number {
        font-family: 'Courier New', monospace;
      }
      
      &.currency {
        text-align: right;
        font-family: 'Courier New', monospace;
      }
    }
  }
`

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  &.paid {
    background: #D4EDDA;
    color: #155724;
  }
  
  &.pending {
    background: #FFF3CD;
    color: #856404;
  }
  
  &.overdue {
    background: #F8D7DA;
    color: #721C24;
  }
  
  &.cancelled {
    background: #E0E0E0;
    color: #666666;
  }
`

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid ${colors.borderColor};
    border-top-color: ${colors.primary};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const DetailsModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: ${colors.white};
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${colors.borderColor};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.primaryText};
  }
  
  button {
    background: none;
    border: none;
    font-size: 24px;
    color: ${colors.secondaryText};
    cursor: pointer;
    
    &:hover {
      color: ${colors.primaryText};
    }
  }
`

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`

const DetailSection = styled.div`
  margin-bottom: 24px;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: ${colors.primaryText};
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`

const DetailItem = styled.div`
  padding: 12px;
  background: ${colors.background};
  border-radius: 6px;
  
  label {
    font-size: 12px;
    color: ${colors.secondaryText};
    display: block;
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 14px;
    color: ${colors.primaryText};
    font-weight: 500;
  }
`

const InstallmentsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  
  thead {
    background: ${colors.background};
    
    th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: ${colors.secondaryText};
    }
  }
  
  tbody {
    tr {
      border-bottom: 1px solid ${colors.borderColor};
    }
    
    td {
      padding: 12px;
      font-size: 14px;
      color: ${colors.primaryText};
      
      &.currency {
        text-align: right;
        font-family: 'Courier New', monospace;
      }
    }
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${colors.secondaryText};
  
  svg {
    margin-bottom: 16px;
  }
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
  }
`

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid ${colors.borderColor};
  background: ${colors.white};
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`

const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${colors.secondaryText};
  font-weight: 500;
  
  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`

const PaginationControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`

const PageButton = styled.button`
  padding: 0;
  width: 40px;
  height: 40px;
  border: 1px solid ${colors.borderColor};
  background: ${colors.white};
  color: ${colors.primaryText};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: ${colors.background};
    border-color: ${colors.primary};
    color: ${colors.primary};
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    color: ${colors.borderColor};
  }
  
  &.active {
    background: ${colors.primary};
    color: ${colors.white};
    border-color: ${colors.primary};
    font-weight: 600;
    
    &:hover {
      background: ${colors.primaryDark};
      border-color: ${colors.primaryDark};
    }
  }
  
  &.arrow {
    font-size: 18px;
    
    &:hover:not(:disabled) {
      background: ${colors.primary};
      color: ${colors.white};
      border-color: ${colors.primary};
    }
  }
`

const PageInput = styled.input`
  width: 70px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const PageSizeSelector = styled.select`
  padding: 0 36px 0 12px;
  height: 40px;
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  font-size: 14px;
  background: ${colors.white};
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 20px;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  &:hover {
    border-color: ${colors.primary};
  }
`

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: ${colors.borderColor};
  margin: 0 4px;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const GoToPageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    font-size: 14px;
    color: ${colors.secondaryText};
    font-weight: 500;
  }
`

function SapInvoices() {
  const [filters, setFilters] = useState({
    partnerNumber: '0000100003',
    companyCode: '1000'
  })
  
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoiceDetails, setInvoiceDetails] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [goToPage, setGoToPage] = useState('')

  useEffect(() => {
    searchInvoices()
  }, [])

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const getOrCreateCustomer = async (payerCode, companyId) => {
    try {
      let { data: customer, error } = await supabase
        .from('customer')
        .select('id')
        .eq('company_code', payerCode)
        .eq('company_id', companyId)
        .single()
      
      if (error || !customer) {
        const { data: anyCustomer } = await supabase
          .from('customer')
          .select('id')
          .eq('company_id', companyId)
          .limit(1)
          .single()
        
        if (anyCustomer) {
          return anyCustomer.id
        }
        
        const { data: newCustomer, error: createError } = await supabase
          .from('customer')
          .insert({
            name: `Cliente SAP ${payerCode}`,
            company_id: companyId,
            company_code: payerCode,
            costumer_email: '',
            costumer_phone: '',
            costumer_cnpj: '',
            costumer_razao_social: ''
          })
          .select('id')
          .single()
        
        if (createError) throw createError
        return newCustomer.id
      }
      
      return customer.id
    } catch (error) {
      console.error('Erro ao buscar/criar cliente:', error)
      return null
    }
  }

  const saveInvoicesToDatabase = async (sapInvoices) => {
    try {
      const companyId = 19
      const customerId = 6
      
      console.log(`🚀 Iniciando processamento otimizado de ${sapInvoices.length} faturas...`)
      const startTime = Date.now()
      
      const invoicesToProcess = sapInvoices.map(invoice => {
        const netValue = parseFloat(invoice.NET_VALUE?.trim() || 0)
        
        return {
          fat_id: invoice.BILLINGDOC,
          customer_id: customerId,
          dt_emissao: formatSapDate(invoice.BILL_DATE),
          dt_vencimento: formatSapDate(invoice.NET_DATE),
          valor_orig: netValue,
          valor_atualiz: netValue,
          status_id: getStatusId(invoice.NET_DATE),
          duplicata: false,
          company_id: companyId,
          moeda: invoice.CURRENCY || 'BRL',
          chave_df: invoice.NRO_NFE || null,
          tipo_df: 'NF',
          condicoes_pagamento: invoice.PMNTTRMS || null,
          total_parcelas: 1,
          parcelas_qtd: 1,
          banco: null,
          agencia: null,
          conta: null,
          recebedor: null,
          condicao_pgto: parseInt(invoice.PMNTTRMS?.match(/\d+/)?.[0]) || null
        }
      })
      
      const batchSize = 500
      const batches = []
      
      for (let i = 0; i < invoicesToProcess.length; i += batchSize) {
        batches.push(invoicesToProcess.slice(i, i + batchSize))
      }
      
      console.log(`📦 Processando ${invoicesToProcess.length} faturas em ${batches.length} lotes de até ${batchSize}...`)
      
      let totalProcessed = 0
      let errors = []
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        const batchStartTime = Date.now()
        
        try {
          const { error: upsertError, count } = await supabase
            .from('faturas')
            .upsert(batch, {
              onConflict: 'fat_id',
              ignoreDuplicates: false,
              count: 'exact'
            })
          
          if (upsertError) {
            console.error(`❌ Erro no lote ${i + 1}:`, upsertError)
            errors.push({ batch: i + 1, error: upsertError })
            
            console.log(`🔄 Processando lote ${i + 1} individualmente...`)
            
            for (const invoice of batch) {
              try {
                const { error: singleUpsertError } = await supabase
                  .from('faturas')
                  .upsert([invoice], {
                    onConflict: 'fat_id',
                    ignoreDuplicates: false
                  })
                
                if (singleUpsertError) {
                  console.error(`❌ Erro na fatura ${invoice.fat_id}:`, singleUpsertError.message)
                  errors.push({ fatId: invoice.fat_id, error: singleUpsertError })
                } else {
                  totalProcessed++
                }
              } catch (singleError) {
                console.error(`❌ Erro inesperado na fatura ${invoice.fat_id}:`, singleError)
                errors.push({ fatId: invoice.fat_id, error: singleError })
              }
            }
          } else {
            totalProcessed += batch.length
            const batchTime = Date.now() - batchStartTime
            console.log(`✅ Lote ${i + 1}/${batches.length} processado: ${batch.length} faturas em ${batchTime}ms`)
          }
        } catch (batchError) {
          console.error(`❌ Erro inesperado no lote ${i + 1}:`, batchError)
          errors.push({ batch: i + 1, error: batchError })
        }
      }
      
      const totalTime = Date.now() - startTime
      
      console.log(`🎉 Processamento concluído em ${totalTime}ms:`)
      console.log(`   ✅ ${totalProcessed} faturas processadas com sucesso`)
      console.log(`   ❌ ${errors.length} erros encontrados`)
      
      if (errors.length > 0) {
        console.log(`📋 Resumo dos erros:`)
        errors.slice(0, 5).forEach(err => {
          if (err.fatId) {
            console.log(`   - Fatura ${err.fatId}: ${err.error.message}`)
          } else {
            console.log(`   - Lote ${err.batch}: ${err.error.message}`)
          }
        })
        if (errors.length > 5) {
          console.log(`   ... e mais ${errors.length - 5} erros`)
        }
      }
      
      return {
        success: errors.length === 0,
        processed: totalProcessed,
        errors: errors.length,
        totalTime
      }
      
    } catch (error) {
      console.error('💥 Erro crítico ao salvar faturas:', error)
      return {
        success: false,
        processed: 0,
        errors: 1,
        error: error.message
      }
    }
  }

  const updateInvoiceStatus = async (invoices) => {
    try {
      const today = new Date()
      const invoiceIds = invoices.map(inv => inv.BILLINGDOC)
      
      const { data: existingInvoices, error: fetchError } = await supabase
        .from('faturas')
        .select('fat_id, status_id, dt_vencimento')
        .in('fat_id', invoiceIds)
      
      if (fetchError) throw fetchError
      
      const statusUpdates = existingInvoices.map(invoice => {
        const dueDate = new Date(invoice.dt_vencimento)
        let newStatusId = invoice.status_id
        
        if (invoice.status_id === 1 && dueDate < today) {
          newStatusId = 2
        }
        
        return {
          fat_id: invoice.fat_id,
          status_id: newStatusId
        }
      }).filter(update => {
        const original = existingInvoices.find(inv => inv.fat_id === update.fat_id)
        return original && update.status_id !== original.status_id
      })
      
      if (statusUpdates.length > 0) {
        const { error: updateError } = await supabase
          .from('faturas')
          .upsert(statusUpdates, { onConflict: 'fat_id' })
        
        if (updateError) throw updateError
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const updateCustomerCNPJ = async (payerCode, cnpj, companyId) => {
    try {
      if (!cnpj || cnpj.length < 14) return
      
      const { error } = await supabase
        .from('customer')
        .update({ costumer_cnpj: cnpj })
        .eq('company_code', payerCode)
        .eq('company_id', companyId)
      
      if (error) throw error
    } catch (error) {
      console.error('Erro ao atualizar CNPJ do cliente:', error)
    }
  }

  const saveInvoiceDetails = async (invoiceId, detailData, parcelData) => {
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('faturas')
        .select('id, customer_id')
        .eq('fat_id', invoiceId)
        .single()
      
      if (invoiceError || !invoice) return
      
      const updates = {}
      
      if (parcelData?.E_CNPJ && invoice.customer_id) {
        const { data: customerData } = await supabase
          .from('customer')
          .select('company_id, company_code')
          .eq('id', invoice.customer_id)
          .single()
        
        if (customerData) {
          await updateCustomerCNPJ(customerData.company_code, parcelData.E_CNPJ, customerData.company_id)
        }
      }
      
      if (parcelData?.E_NOTA_FISCAL) {
        updates.chave_df = parcelData.E_NOTA_FISCAL
      }
      
      if (parcelData?.E_VBRK?.NETWR) {
        const netValue = parseFloat(parcelData.E_VBRK.NETWR)
        updates.valor_orig = netValue
        updates.valor_atualiz = netValue
      }
      
      if (parcelData?.E_VBRK?.ZTERM) {
        updates.condicoes_pagamento = parcelData.E_VBRK.ZTERM
        const days = parseInt(parcelData.E_VBRK.ZTERM.match(/\d+/)?.[0]) || null
        if (days) updates.condicao_pgto = days
      }
      
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('faturas')
          .update(updates)
          .eq('fat_id', invoiceId)
        
        if (updateError) throw updateError
      }
    } catch (error) {
      console.error('Erro ao salvar detalhes da fatura:', error)
    }
  }

  const formatSapDate = (date) => {
    if (!date || date === '00000000') return null
    if (date.length === 10 && date.includes('-')) return date
    if (date.length === 8) {
      const year = date.substring(0, 4)
      const month = date.substring(4, 6)
      const day = date.substring(6, 8)
      return `${year}-${month}-${day}`
    }
    return date
  }

  const getStatusId = (dueDate) => {
    if (!dueDate || dueDate === '00000000') return 1
    
    const today = new Date()
    const due = new Date(formatSapDate(dueDate))
    
    return today > due ? 2 : 1
  }

  const searchInvoices = async () => {
    if (!filters.partnerNumber) {
      alert('Por favor, informe o número do cliente')
      return
    }

    const requestData = {
      COMPANYCODE: filters.companyCode,
      PARTNER_NUMBER: filters.partnerNumber.padStart(10, '0')
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/cpi/ZBAPI_WEBINVOICE_GETLIST2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      
      const data = await response.json()
      
      if (data?.['ZBAPI_WEBINVOICE_GETLIST2.Response']?.T_INVOICE?.item) {
        const invoicesData = data['ZBAPI_WEBINVOICE_GETLIST2.Response'].T_INVOICE.item
        const processedInvoices = Array.isArray(invoicesData) ? invoicesData : [invoicesData]
        setInvoices(processedInvoices)
        setCurrentPage(1)
        
        if (processedInvoices.length > 0) {
          await saveInvoicesToDatabase(processedInvoices)
          await updateInvoiceStatus(processedInvoices)
        }
      } else {
        setInvoices([])
      }
    } catch (error) {
      console.error('Erro ao buscar faturas:', error)
      alert('Erro ao buscar faturas. Verifique a conexão com o SAP.')
    } finally {
      setLoading(false)
    }
  }

  const loadInvoiceDetails = async (invoice) => {
    setLoading(true)
    try {
      const currentDate = new Date()
      const dateStr = currentDate.getFullYear() + 
                    String(currentDate.getMonth() + 1).padStart(2, '0') + 
                    String(currentDate.getDate()).padStart(2, '0')
      
      const detailRequestData = {
        I_COMPCODE: filters.companyCode,
        I_VENDOR: invoice.PAYER,
        I_KEYDATE: dateStr
      }

      const parcelRequestData = {
        I_VBELN: invoice.BILLINGDOC,
        I_BUKRS: filters.companyCode,
        I_GJAHR: invoice.BILL_DATE ? invoice.BILL_DATE.substring(0, 4) : new Date().getFullYear().toString()
      }

      const [detailResponse, parcelResponse] = await Promise.all([
        fetch(`${API_URL}/cpi/ZDETALHES_FATURA`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(detailRequestData)
        }).then(res => res.json()),
        fetch(`${API_URL}/cpi/ZFATURA_PARC2`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parcelRequestData)
        }).then(res => res.json())
      ])

      const details = detailResponse || {}
      const parcelData = parcelResponse || {}

      setInvoiceDetails({
        ...invoice,
        customerName: details.E_NAME1 || '',
        customerName2: details.E_NAME2 || '',
        cnpj: details.E_STCD1 || parcelData.E_CNPJ || '',
        nfeNumber: parcelData.E_NOTA_FISCAL || invoice.NRO_NFE || '',
        parcelInfo: parcelData.E_VBRK || {},
        openItems: details.T_OPEN?.item || []
      })
      
      setSelectedInvoice(invoice)
      setShowDetails(true)
      
      await saveInvoiceDetails(invoice.BILLINGDOC, details, parcelData)
      
    } catch (error) {
      console.error('Erro ao carregar detalhes da fatura:', error)
      alert('Erro ao carregar detalhes da fatura')
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    const headers = ['Documento', 'Cliente', 'Data Faturamento', 'Vencimento', 'Valor Líquido', 'Condição Pagamento', 'NFe']
    const data = invoices.map(invoice => [
      invoice.BILLINGDOC,
      invoice.PAYER,
      formatDate(invoice.BILL_DATE),
      formatDate(invoice.NET_DATE),
      formatCurrency(invoice.NET_VALUE),
      invoice.PMNTTRMS,
      invoice.NRO_NFE || '-'
    ])
    
    const csvContent = [headers, ...data]
      .map(row => row.join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const currentDate = new Date()
    const dateStr = currentDate.getFullYear() + 
                   String(currentDate.getMonth() + 1).padStart(2, '0') + 
                   String(currentDate.getDate()).padStart(2, '0') + '_' +
                   String(currentDate.getHours()).padStart(2, '0') +
                   String(currentDate.getMinutes()).padStart(2, '0') +
                   String(currentDate.getSeconds()).padStart(2, '0')
    a.download = `faturas_sap_${dateStr}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getPaymentStatus = (dueDate) => {
    if (!dueDate || dueDate === '00000000') return { class: 'pending', label: 'Pendente' }
    
    const today = new Date()
    const due = new Date(formatSapDate(dueDate))
    
    if (today > due) {
      return { class: 'overdue', label: 'Vencido' }
    }
    
    return { class: 'pending', label: 'Em Aberto' }
  }

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00'
    const numValue = typeof value === 'string' ? parseFloat(value.trim()) : value
    return `R$ ${numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (date) => {
    if (!date || date === '00000000') return '-'
    try {
      if (date.length === 8) {
        const year = date.substring(0, 4)
        const month = date.substring(4, 6)
        const day = date.substring(6, 8)
        return `${day}/${month}/${year}`
      }
      if (date.includes('-')) {
        const [year, month, day] = date.split('-')
        return `${day}/${month}/${year}`
      }
      return new Date(date).toLocaleDateString('pt-BR')
    } catch {
      return date
    }
  }

  const calculateDaysOverdue = (dueDate) => {
    if (!dueDate || dueDate === '00000000') return 0
    const due = new Date(formatSapDate(dueDate))
    const today = new Date()
    const diffTime = today - due
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '-'
    const cleaned = cnpj.replace(/\D/g, '')
    if (cleaned.length !== 14) return cnpj
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }

  const totalPages = Math.ceil(invoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentInvoices = invoices.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      setGoToPage('')
    }
  }

  const handleGoToPage = () => {
    const page = parseInt(goToPage)
    if (!isNaN(page)) {
      handlePageChange(page)
    }
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('...')
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <Container>
      <Header>
        <h1>Faturas SAP</h1>
        <p>Consulte e gerencie faturas diretamente do SAP</p>
      </Header>

      <FiltersCard>
        <FilterGrid>
          <FilterGroup>
            <label>Número do Cliente</label>
            <input
              type="text"
              value={filters.partnerNumber}
              onChange={(e) => handleFilterChange('partnerNumber', e.target.value)}
              placeholder="Ex: 0000100003"
            />
          </FilterGroup>
          
          <FilterGroup>
            <label>Código da Empresa</label>
            <select
              value={filters.companyCode}
              onChange={(e) => handleFilterChange('companyCode', e.target.value)}
            >
              <option value="1000">1000 - Principal</option>
              <option value="2000">2000 - Filial</option>
              <option value="3000">3000 - Filial 2</option>
              <option value="4000">4000 - Filial 3</option>
            </select>
          </FilterGroup>
        </FilterGrid>
        
        <FilterActions>
          <button className="secondary" onClick={() => {
            setFilters({
              partnerNumber: '0000100003',
              companyCode: '1000'
            })
          }}>
            Limpar
          </button>
          <button className="primary" onClick={searchInvoices} disabled={loading}>
            <MagnifyingGlass size={16} weight="bold" />
            Buscar
          </button>
        </FilterActions>
      </FiltersCard>

      <TableCard>
        <TableHeader>
          <h2>Faturas Encontradas ({invoices.length})</h2>
          <div className="actions">
            {invoices.length > 0 && (
              <button onClick={exportToExcel}>
                <Download size={16} />
                Exportar
              </button>
            )}
          </div>
        </TableHeader>
        
        <TableWrapper>
          {invoices.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Cliente</th>
                  <th>Data Faturamento</th>
                  <th>Vencimento</th>
                  <th>Dias Atraso</th>
                  <th>Valor Líquido</th>
                  <th>Condição Pagamento</th>
                  <th>NFe</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.map((invoice, index) => {
                  const status = getPaymentStatus(invoice.NET_DATE)
                  const daysOverdue = calculateDaysOverdue(invoice.NET_DATE)
                  
                  return (
                    <tr key={startIndex + index} className={selectedInvoice?.BILLINGDOC === invoice.BILLINGDOC ? 'selected' : ''}>
                      <td className="number">{invoice.BILLINGDOC}</td>
                      <td className="number">{invoice.PAYER}</td>
                      <td>{formatDate(invoice.BILL_DATE)}</td>
                      <td>{formatDate(invoice.NET_DATE)}</td>
                      <td style={{ 
                        textAlign: 'center',
                        color: daysOverdue > 0 ? colors.error : colors.primaryText
                      }}>
                        {daysOverdue > 0 ? daysOverdue : '-'}
                      </td>
                      <td className="currency">{formatCurrency(invoice.NET_VALUE)}</td>
                      <td>{invoice.PMNTTRMS}</td>
                      <td style={{ fontSize: '12px' }}>{invoice.NRO_NFE ? invoice.NRO_NFE.substring(0, 20) + '...' : '-'}</td>
                      <td>
                        <StatusBadge className={status.class}>{status.label}</StatusBadge>
                      </td>
                      <td>
                        <button 
                          onClick={() => loadInvoiceDetails(invoice)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: colors.primary,
                            cursor: 'pointer',
                            padding: '4px 8px'
                          }}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          ) : (
            <EmptyState>
              <Receipt size={48} />
              <h3>Nenhuma fatura encontrada</h3>
              <p>Ajuste os filtros e tente novamente</p>
            </EmptyState>
          )}
        </TableWrapper>
        
        {invoices.length > 0 && (
          <PaginationContainer>
            <PaginationInfo>
              Mostrando <strong>{startIndex + 1}</strong> a <strong>{Math.min(endIndex, invoices.length)}</strong> de <strong>{invoices.length}</strong> faturas
            </PaginationInfo>
            
            <PaginationControls>
              <PageSizeSelector 
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                title="Itens por página"
              >
                <option value="10">10 por página</option>
                <option value="20">20 por página</option>
                <option value="50">50 por página</option>
                <option value="100">100 por página</option>
              </PageSizeSelector>
              
              <Divider />
              
              <PageButton 
                className="arrow"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                title="Primeira página"
              >
                ⟨⟨
              </PageButton>
              
              <PageButton 
                className="arrow"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Página anterior"
              >
                ⟨
              </PageButton>
              
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} style={{ 
                    padding: '0 8px', 
                    color: colors.secondaryText,
                    fontSize: '14px',
                    userSelect: 'none'
                  }}>•••</span>
                ) : (
                  <PageButton
                    key={page}
                    className={currentPage === page ? 'active' : ''}
                    onClick={() => handlePageChange(page)}
                    title={`Página ${page}`}
                  >
                    {page}
                  </PageButton>
                )
              ))}
              
              <PageButton 
                className="arrow"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                title="Próxima página"
              >
                ⟩
              </PageButton>
              
              <PageButton 
                className="arrow"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                title="Última página"
              >
                ⟩⟩
              </PageButton>
              
              <Divider />
              
              <GoToPageContainer>
                <span>Ir para:</span>
                <PageInput
                  type="number"
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGoToPage()}
                  onBlur={handleGoToPage}
                  min="1"
                  max={totalPages}
                  placeholder="Pág"
                />
              </GoToPageContainer>
            </PaginationControls>
          </PaginationContainer>
        )}
      </TableCard>

      {showDetails && invoiceDetails && (
        <DetailsModal onClick={() => setShowDetails(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Detalhes da Fatura {invoiceDetails.BILLINGDOC}</h2>
              <button onClick={() => setShowDetails(false)}>×</button>
            </ModalHeader>
            <ModalBody>
              <DetailSection>
                <h3><FileText size={20} /> Informações Gerais</h3>
                <DetailGrid>
                  <DetailItem>
                    <label>Número do Documento</label>
                    <div className="value">{invoiceDetails.BILLINGDOC}</div>
                  </DetailItem>
                  <DetailItem>
                    <label>Data de Faturamento</label>
                    <div className="value">{formatDate(invoiceDetails.BILL_DATE)}</div>
                  </DetailItem>
                  <DetailItem>
                    <label>Data de Vencimento</label>
                    <div className="value">{formatDate(invoiceDetails.NET_DATE)}</div>
                  </DetailItem>
                  <DetailItem>
                    <label>Condição de Pagamento</label>
                    <div className="value">{invoiceDetails.PMNTTRMS} {invoiceDetails.PMNTTRMS_TEXT && `- ${invoiceDetails.PMNTTRMS_TEXT}`}</div>
                  </DetailItem>
                  <DetailItem>
                    <label>Número da NFe</label>
                    <div className="value" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                      {invoiceDetails.nfeNumber || invoiceDetails.NRO_NFE || '-'}
                    </div>
                  </DetailItem>
                  <DetailItem>
                    <label>CNPJ</label>
                    <div className="value">{formatCNPJ(invoiceDetails.cnpj)}</div>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <h3><User size={20} /> Dados do Cliente</h3>
                <DetailGrid>
                  <DetailItem>
                    <label>Código</label>
                    <div className="value">{invoiceDetails.PAYER}</div>
                  </DetailItem>
                  <DetailItem>
                    <label>Nome</label>
                    <div className="value">
                      {invoiceDetails.customerName || 'Cliente ' + invoiceDetails.PAYER}
                      {invoiceDetails.customerName2 && ` ${invoiceDetails.customerName2}`}
                    </div>
                  </DetailItem>
                  <DetailItem>
                    <label>Código da Empresa</label>
                    <div className="value">{filters.companyCode}</div>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <h3><CurrencyCircleDollar size={20} /> Valores</h3>
                <DetailGrid>
                  <DetailItem>
                    <label>Valor Líquido</label>
                    <div className="value">{formatCurrency(invoiceDetails.NET_VALUE)}</div>
                  </DetailItem>
                  <DetailItem>
                    <label>Status</label>
                    <div className="value">{getPaymentStatus(invoiceDetails.NET_DATE).label}</div>
                  </DetailItem>
                  {calculateDaysOverdue(invoiceDetails.NET_DATE) > 0 && (
                    <DetailItem>
                      <label>Dias em Atraso</label>
                      <div className="value" style={{ color: colors.error }}>
                        {calculateDaysOverdue(invoiceDetails.NET_DATE)} dias
                      </div>
                    </DetailItem>
                  )}
                </DetailGrid>
              </DetailSection>

              {invoiceDetails.openItems && invoiceDetails.openItems.length > 0 && (
                <DetailSection>
                  <h3><Bank size={20} /> Itens em Aberto</h3>
                  <InstallmentsTable>
                    <thead>
                      <tr>
                        <th>Documento</th>
                        <th>Item</th>
                        <th>Data</th>
                        <th>Fornecedor</th>
                        <th>Valor</th>
                        <th>Método Pagamento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceDetails.openItems.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.DOC_NO}</td>
                          <td>{item.ITEM_NUM}</td>
                          <td>{formatDate(item.DOC_DATE)}</td>
                          <td>{item.VENDOR}</td>
                          <td className="currency">{formatCurrency(item.AMT_DOCCUR)}</td>
                          <td>{item.PYMT_METH || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </InstallmentsTable>
                </DetailSection>
              )}
            </ModalBody>
          </ModalContent>
        </DetailsModal>
      )}

      {loading && (
        <LoadingOverlay>
          <div className="spinner" />
        </LoadingOverlay>
      )}
    </Container>
  )
}

export default SapInvoices