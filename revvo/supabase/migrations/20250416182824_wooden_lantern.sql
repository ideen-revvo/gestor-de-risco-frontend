/*
  # Add initial data for testing

  1. Data Population
    - Add a corporate group
    - Add companies within the group
    - Add customers for the companies

  2. Test Data
    - Corporate Group: "Grupo Empresarial A"
    - Companies: 
      - Company ID 8 (default)
      - Additional test companies
    - Multiple customers per company
*/

-- Insert corporate group
INSERT INTO corporate_group (id, name)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Grupo Empresarial A')
ON CONFLICT (id) DO NOTHING;

-- Insert companies
INSERT INTO company (id, name, corporate_group_id)
VALUES 
  ('00000008-0000-0000-0000-000000000008', 'Empresa Principal', '11111111-1111-1111-1111-111111111111'),
  ('00000009-0000-0000-0000-000000000009', 'Empresa Secundária', '11111111-1111-1111-1111-111111111111'),
  ('00000010-0000-0000-0000-000000000010', 'Empresa Terciária', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Insert customers
INSERT INTO customer (id, name, company_id)
VALUES 
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Cliente A1', '00000008-0000-0000-0000-000000000008'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Cliente A2', '00000008-0000-0000-0000-000000000008'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Cliente B1', '00000009-0000-0000-0000-000000000009'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Cliente B2', '00000009-0000-0000-0000-000000000009'),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Cliente C1', '00000010-0000-0000-0000-000000000010'),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'Cliente C2', '00000010-0000-0000-0000-000000000010')
ON CONFLICT (id) DO NOTHING;