-- ==============================================================================
-- SUPABASE POSTGRESQL IMPORT: INDIA LOCATION MASTERS (28 States + 8 UTs + Cities)
-- Directly executable in Supabase SQL Editor
-- ==============================================================================

BEGIN;

-- 1. Insert Country: India
INSERT INTO public."CountryMaster" (id, code, name, "isActive", "createdAt")
VALUES ('c0a80101-0000-0000-0000-000000000091', 'IN', 'India', true, NOW())
ON CONFLICT (code) DO UPDATE SET name = 'India', "isActive" = true;

-- Temporary table to hold state mappings
CREATE TEMP TABLE temp_states (
    id text DEFAULT gen_random_uuid()::text,
    code text PRIMARY KEY,
    name text NOT NULL
) ON COMMIT DROP;

INSERT INTO temp_states (code, name) VALUES
('AP', 'Andhra Pradesh'),
('AR', 'Arunachal Pradesh'),
('AS', 'Assam'),
('BR', 'Bihar'),
('CG', 'Chhattisgarh'),
('GA', 'Goa'),
('GJ', 'Gujarat'),
('HR', 'Haryana'),
('HP', 'Himachal Pradesh'),
('JH', 'Jharkhand'),
('KA', 'Karnataka'),
('KL', 'Kerala'),
('MP', 'Madhya Pradesh'),
('MH', 'Maharashtra'),
('MN', 'Manipur'),
('ML', 'Meghalaya'),
('MZ', 'Mizoram'),
('NL', 'Nagaland'),
('OD', 'Odisha'),
('PB', 'Punjab'),
('RJ', 'Rajasthan'),
('SK', 'Sikkim'),
('TN', 'Tamil Nadu'),
('TS', 'Telangana'),
('TR', 'Tripura'),
('UP', 'Uttar Pradesh'),
('UK', 'Uttarakhand'),
('WB', 'West Bengal'),
('AN', 'Andaman and Nicobar Islands'),
('CH', 'Chandigarh'),
('DH', 'Dadra and Nagar Haveli and Daman and Diu'),
('DL', 'Delhi'),
('JK', 'Jammu and Kashmir'),
('LA', 'Ladakh'),
('LD', 'Lakshadweep'),
('PY', 'Puducherry')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- 2. Insert States & UTs into StateMaster
INSERT INTO public."StateMaster" (id, code, name, "countryId", "createdAt")
SELECT 
    t.id, 
    t.code, 
    t.name, 
    c.id, 
    NOW()
FROM temp_states t
CROSS JOIN public."CountryMaster" c
WHERE c.code = 'IN'
ON CONFLICT ("countryId", code) DO UPDATE SET name = EXCLUDED.name;

-- 3. Bulk Insert Cities for all States & UTs
INSERT INTO public."CityMaster" (id, name, "stateId", "createdAt")
SELECT 
    gen_random_uuid()::text,
    v.city_name,
    s.id,
    NOW()
FROM (
    VALUES 
    -- Tamil Nadu (TN)
    ('TN', 'Chennai'), ('TN', 'Coimbatore'), ('TN', 'Madurai'), ('TN', 'Tiruchirappalli'), ('TN', 'Salem'),
    ('TN', 'Tiruppur'), ('TN', 'Erode'), ('TN', 'Vellore'), ('TN', 'Tirunelveli'), ('TN', 'Thanjavur'),
    ('TN', 'Tuticorin'), ('TN', 'Dindigul'), ('TN', 'Nagercoil'), ('TN', 'Kanchipuram'), ('TN', 'Karaikudi'),
    ('TN', 'Cuddalore'), ('TN', 'Kumbakonam'), ('TN', 'Tiruvannamalai'), ('TN', 'Pollachi'), ('TN', 'Hosur'),
    ('TN', 'Ambur'), ('TN', 'Nagapattinam'), ('TN', 'Pudukkottai'), ('TN', 'Udhagamandalam'),
    
    -- Maharashtra (MH)
    ('MH', 'Mumbai'), ('MH', 'Pune'), ('MH', 'Nagpur'), ('MH', 'Thane'), ('MH', 'Pimpri-Chinchwad'),
    ('MH', 'Nashik'), ('MH', 'Kalyan-Dombivli'), ('MH', 'Vasai-Virar'), ('MH', 'Aurangabad'), ('MH', 'Solapur'),
    ('MH', 'Amravati'), ('MH', 'Nanded'), ('MH', 'Kolhapur'), ('MH', 'Ulhasnagar'), ('MH', 'Sangli'),
    ('MH', 'Jalgaon'), ('MH', 'Akola'), ('MH', 'Latur'), ('MH', 'Dhule'), ('MH', 'Ahmednagar'),
    
    -- Karnataka (KA)
    ('KA', 'Bengaluru'), ('KA', 'Mysuru'), ('KA', 'Hubballi-Dharwad'), ('KA', 'Mangaluru'), ('KA', 'Belagavi'),
    ('KA', 'Davanagere'), ('KA', 'Ballari'), ('KA', 'Vijayapura'), ('KA', 'Shivamogga'), ('KA', 'Tumakuru'),
    ('KA', 'Kalaburagi'), ('KA', 'Raichur'), ('KA', 'Bidar'), ('KA', 'Udupi'), ('KA', 'Hassan'),

    -- Telangana (TS)
    ('TS', 'Hyderabad'), ('TS', 'Warangal'), ('TS', 'Nizamabad'), ('TS', 'Khammam'), ('TS', 'Karimnagar'),
    ('TS', 'Ramagundam'), ('TS', 'Mahbubnagar'), ('TS', 'Nalgonda'), ('TS', 'Suryapet'), ('TS', 'Siddipet'),

    -- Kerala (KL)
    ('KL', 'Thiruvananthapuram'), ('KL', 'Kochi'), ('KL', 'Kozhikode'), ('KL', 'Thrissur'), ('KL', 'Kollam'),
    ('KL', 'Palakkad'), ('KL', 'Alappuzha'), ('KL', 'Kannur'), ('KL', 'Kottayam'), ('KL', 'Malappuram'),

    -- Andhra Pradesh (AP)
    ('AP', 'Visakhapatnam'), ('AP', 'Vijayawada'), ('AP', 'Guntur'), ('AP', 'Nellore'), ('AP', 'Kurnool'),
    ('AP', 'Kakinada'), ('AP', 'Rajahmundry'), ('AP', 'Tirupati'), ('AP', 'Kadapa'), ('AP', 'Anantapur'),

    -- Delhi (DL)
    ('DL', 'New Delhi'), ('DL', 'Central Delhi'), ('DL', 'North Delhi'), ('DL', 'South Delhi'),
    ('DL', 'East Delhi'), ('DL', 'West Delhi'), ('DL', 'Dwarka'), ('DL', 'Rohini'),

    -- Gujarat (GJ)
    ('GJ', 'Ahmedabad'), ('GJ', 'Surat'), ('GJ', 'Vadodara'), ('GJ', 'Rajkot'), ('GJ', 'Bhavnagar'),
    ('GJ', 'Jamnagar'), ('GJ', 'Junagadh'), ('GJ', 'Gandhinagar'), ('GJ', 'Anand'), ('GJ', 'Vapi'),

    -- Uttar Pradesh (UP)
    ('UP', 'Lucknow'), ('UP', 'Kanpur'), ('UP', 'Ghaziabad'), ('UP', 'Agra'), ('UP', 'Varanasi'),
    ('UP', 'Meerut'), ('UP', 'Prayagraj'), ('UP', 'Bareilly'), ('UP', 'Aligarh'), ('UP', 'Noida'),

    -- West Bengal (WB)
    ('WB', 'Kolkata'), ('WB', 'Howrah'), ('WB', 'Asansol'), ('WB', 'Siliguri'), ('WB', 'Durgapur'),
    ('WB', 'Bardhaman'), ('WB', 'Kharagpur'), ('WB', 'Baharampur'),

    -- Rajasthan (RJ)
    ('RJ', 'Jaipur'), ('RJ', 'Jodhpur'), ('RJ', 'Kota'), ('RJ', 'Bikaner'), ('RJ', 'Ajmer'),
    ('RJ', 'Udaipur'), ('RJ', 'Bhilwara'), ('RJ', 'Alwar'), ('RJ', 'Sikar'),

    -- Punjab (PB)
    ('PB', 'Ludhiana'), ('PB', 'Amritsar'), ('PB', 'Jalandhar'), ('PB', 'Patiala'), ('PB', 'Bathinda'),
    ('PB', 'Mohali'), ('PB', 'Pathankot'), ('PB', 'Phagwara'),

    -- Bihar (BR)
    ('BR', 'Patna'), ('BR', 'Gaya'), ('BR', 'Bhagalpur'), ('BR', 'Muzaffarpur'), ('BR', 'Purnia'),
    ('BR', 'Darbhanga'), ('BR', 'Bihar Sharif'), ('BR', 'Arrah'),

    -- Madhya Pradesh (MP)
    ('MP', 'Indore'), ('MP', 'Bhopal'), ('MP', 'Jabalpur'), ('MP', 'Gwalior'), ('MP', 'Ujjain'),
    ('MP', 'Sagar'), ('MP', 'Dewas'), ('MP', 'Satna'),

    -- Haryana (HR)
    ('HR', 'Faridabad'), ('HR', 'Gurugram'), ('HR', 'Panipat'), ('HR', 'Ambala'), ('HR', 'Rohtak'),
    ('HR', 'Hisar'), ('HR', 'Karnal'), ('HR', 'Sonipat'),

    -- Assam (AS)
    ('AS', 'Guwahati'), ('AS', 'Silchar'), ('AS', 'Dibrugarh'), ('AS', 'Jorhat'), ('AS', 'Nagaon'),

    -- Odisha (OD)
    ('OD', 'Bhubaneswar'), ('OD', 'Cuttack'), ('OD', 'Rourkela'), ('OD', 'Brahmapur'), ('OD', 'Puri'),

    -- Jharkhand (JH)
    ('JH', 'Ranchi'), ('JH', 'Jamshedpur'), ('JH', 'Dhanbad'), ('JH', 'Bokaro Steel City'), ('JH', 'Deoghar'),

    -- Chhattisgarh (CG)
    ('CG', 'Raipur'), ('CG', 'Bhilai'), ('CG', 'Bilaspur'), ('CG', 'Korba'), ('CG', 'Rajnandgaon'),

    -- Jammu and Kashmir (JK)
    ('JK', 'Srinagar'), ('JK', 'Jammu'), ('JK', 'Anantnag'), ('JK', 'Baramulla'), ('JK', 'Kathua'),

    -- Puducherry (PY)
    ('PY', 'Puducherry'), ('PY', 'Karaikal'), ('PY', 'Mahe'), ('PY', 'Yanam')
) AS v(state_code, city_name)
JOIN public."StateMaster" s ON s.code = v.state_code AND s."countryId" = (SELECT id FROM public."CountryMaster" WHERE code = 'IN' LIMIT 1)
ON CONFLICT ("stateId", name) DO NOTHING;

COMMIT;
