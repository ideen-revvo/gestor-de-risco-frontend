import React from 'react';
import styled from 'styled-components';

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  max-height: ${props => props.maxHeight || '400px'};
  overflow-y: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background: #F8F9FA;
    padding: 12px 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: var(--secondary-text);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    font-size: 14px;
    color: var(--primary-text);
  }

  tr:hover {
    background: #F8F9FA;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

export function Table({ data, columns, maxHeight }) {
  return (
    <TableContainer>
      <TableWrapper maxHeight={maxHeight}>
        <StyledTable>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.accessor}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.accessor}>
                    {col.accessor === 'weight'
                      ? `${(row[col.accessor] * 100).toFixed(0)}%`
                      : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableWrapper>
    </TableContainer>
  );
}