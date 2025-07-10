import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SearchBar = styled.div`
  margin: 24px 0;

  .customer-details {
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 24px;

    .header {
      margin-bottom: ${props => props.isExpanded ? '24px' : '0'};
      border-bottom: ${props => props.isExpanded ? '1px solid #E5E7EB' : 'none'};
      padding-bottom: ${props => props.isExpanded ? '16px' : '0'};
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .header-content {
        flex: 1;

        h2 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .legal-name {
          font-size: 14px;
          color: #6B7280;
        }

        .company-code {
          font-size: 14px;
          color: #6B7280;
          margin-top: 4px;
        }
      }

      .toggle-button {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: #6B7280;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        margin-top: 4px;

        &:hover {
          background: #F3F4F6;
          color: #111827;
        }

        svg {
          transition: transform 0.2s ease;
          transform: ${props => props.isExpanded ? 'rotate(180deg)' : 'rotate(0)'};
        }
      }
    }

    .content {
      display: ${props => props.isExpanded ? 'flex' : 'none'};
      gap: 48px;
      overflow: hidden;

      .company-info {
        display: flex;
        gap: 48px;
        flex: 1;

        .info-field {
          flex: 1;

          label {
            display: block;
            font-size: 13px;
            color: #6B7280;
            font-weight: 500;
            margin-bottom: 4px;
            text-transform: uppercase;
          }

          p {
            font-size: 14px;
            color: #111827;
            line-height: 1.4;
          }
        }
      }

      .contacts-section {
        flex: 1;
        overflow: hidden;
        position: relative;

        .contacts-scroll {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin: -4px;
          padding: 4px;
          scroll-behavior: smooth;

          &::-webkit-scrollbar {
            height: 4px;
          }

          &::-webkit-scrollbar-track {
            background: #F3F4F6;
            border-radius: 2px;
          }

          &::-webkit-scrollbar-thumb {
            background: #D1D5DB;
            border-radius: 2px;
          }
        }

        .contact-card {
          min-width: 260px;
          background: #F9FAFB;
          padding: 16px;
          border-radius: 6px;

          .name {
            font-size: 14px;
            font-weight: 500;
            color: #111827;
            margin-bottom: 12px;
          }

          .contact-info {
            font-size: 14px;
            color: #6B7280;

            p {
              margin-bottom: 4px;

              &:last-child {
                margin-bottom: 0;
              }
            }

            a {
              color: #2563EB;
              text-decoration: none;

              &:hover {
                text-decoration: underline;
              }
            }
          }
        }
      }
    }
  }
`;

const DashboardFilter = ({ selectedCustomer }) => {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  useEffect(() => {
    async function fetchCustomerDetails() {
      if (selectedCustomer) {
        try {
          const { data, error } = await supabase
            .from('customer')
            .select(`
              id,
              name,
              company_code,
              costumer_cnpj,
              costumer_phone,
              costumer_email,
              company:company_id (
                id,
                name
              ),
              address:addr_id(*)
            `)
            .eq('id', selectedCustomer)
            .single();
            
          if (error) throw error;
          
          let addressString = '';
          let cityString = '';
          if (data.address && !Array.isArray(data.address)) {
            const addr = data.address;
            addressString = `${addr.street || ''}${addr.num ? ', ' + addr.num : ''}`.trim();
            cityString = `${addr.city || ''}${addr.state ? ' - ' + addr.state : ''}${addr.zcode ? ', ' + addr.zcode : ''}`.trim();
          }

          if (data) {
            setCustomerDetails({
              id: data.id,
              name: data.name,
              companyName: data.company?.name,
              companyCode: data.company_code,
              cnpj: data.costumer_cnpj,
              address: addressString,
              city: cityString,
              contacts: [
                { name: data.name, phone: data.costumer_phone, email: data.costumer_email }
              ]
            });
          }
        } catch (error) {
          console.error('Error fetching customer details:', error);
          setCustomerDetails(null);
        }
      } else {
        setCustomerDetails(null);
      }
    }
    
    fetchCustomerDetails();
  }, [selectedCustomer]);
  
  return (
    <div>
      <SearchBar isExpanded={isExpanded}>
        {customerDetails && (
          <div className="customer-details">
            <div className="header">
              <div className="header-content">
                <h2>{customerDetails.name}</h2>
                <div className="legal-name">{customerDetails.companyName}</div>
                <div className="company-code">{customerDetails.companyCode}</div>
              </div>
              <button 
                className="toggle-button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Comprimir" : "Expandir"}
              >
                <ChevronDown size={20} />
              </button>
            </div>
            
            <div className="content">
              <div className="company-info">
                <div className="info-field">
                  <label>CNPJ</label>
                  <p>{customerDetails.cnpj}</p>
                </div>
                
                <div className="info-field">
                  <label>Endereço</label>
                  <p>{customerDetails.address}</p>
                  <p>{customerDetails.city}</p>
                </div>
              </div>

              <div className="contacts-section">
                <div className="contacts-scroll">
                  {customerDetails.contacts.map((contact, index) => (
                    <div className="contact-card" key={index}>
                      <div className="name">{contact.name}</div>
                      <div className="contact-info">
                        <p>{contact.phone}</p>
                        <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </SearchBar>
    </div>
  );
};

export default DashboardFilter;