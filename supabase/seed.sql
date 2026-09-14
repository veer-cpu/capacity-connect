-- =============================================================================
-- CAPACITY CONNECT SYNTHETIC DEMO DATASET (IMD / MOES DOMAIN)
-- =============================================================================
-- Notice: Local/Demo dataset using synthetic emails (*.capacityconnect@example.com).
-- Prerequisites: Run scripts/seed-demo-auth.js first so auth.users exist.
-- Audited 100% against capacity-connect-schema-safe.sql live schema definitions.
-- =============================================================================

BEGIN;

-- 1. ORGANIZATIONAL UNITS (8 records)
INSERT INTO public.organizational_units (id, code, name, description, is_active)
VALUES
  ('10000000-0000-4000-a000-000000000001', 'RADAR', 'Radar Operations', 'Doppler Weather Radar operations, maintenance, and product analysis across India.', true),
  ('10000000-0000-4000-a000-000000000002', 'NWP', 'Numerical Weather Prediction', 'Global and regional high-resolution operational modeling and ensemble forecasting.', true),
  ('10000000-0000-4000-a000-000000000003', 'SAT', 'Satellite Meteorology', 'INSAT-3D/3DR satellite data processing, imagery derivation, and atmospheric soundings.', true),
  ('10000000-0000-4000-a000-000000000004', 'FCST', 'Forecasting & RSMC', 'Severe weather forecasting, tropical cyclone warning, and RSMC New Delhi operations.', true),
  ('10000000-0000-4000-a000-000000000005', 'AVN', 'Aviation Meteorology', 'Meteorological services for air navigation, TAF/METAR generation, and SIGMET issuing.', true),
  ('10000000-0000-4000-a000-000000000006', 'HYDRO', 'Hydrometeorology', 'Flood forecasting support, QPF generation, and heavy rainfall storm analysis.', true),
  ('10000000-0000-4000-a000-000000000007', 'AGRO', 'Agricultural Meteorology', 'District and block-level agromet advisory services for agricultural planning.', true),
  ('10000000-0000-4000-a000-000000000008', 'INST', 'Instrumentation', 'Surface observation networks, AWS maintenance, and calibration systems.', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, description = EXCLUDED.description;

-- 2. JOB ROLES (10 records)
INSERT INTO public.job_roles (id, name, organizational_unit_id, description, is_active)
VALUES
  ('20000000-0000-4000-a000-000000000001', 'Radar Meteorologist', '10000000-0000-4000-a000-000000000001', 'Specialized in DWR operation, echo interpretation, and mesoscale severe storm tracking.', true),
  ('20000000-0000-4000-a000-000000000002', 'NWP Scientist', '10000000-0000-4000-a000-000000000002', 'Formulates and evaluates numerical model physics, data assimilation, and post-processing.', true),
  ('20000000-0000-4000-a000-000000000003', 'Satellite Meteorologist', '10000000-0000-4000-a000-000000000003', 'Derives satellite winds, sea surface temperature, and convective clouds from geostationary sensors.', true),
  ('20000000-0000-4000-a000-000000000004', 'Aviation Meteorologist', '10000000-0000-4000-a000-000000000005', 'Issues aerodrome forecasts, briefing pilots, and monitoring aviation weather hazards.', true),
  ('20000000-0000-4000-a000-000000000005', 'Hydromet Scientist', '10000000-0000-4000-a000-000000000006', 'Monitors river basin rainfall, GIS catchment modeling, and extreme precipitation events.', true),
  ('20000000-0000-4000-a000-000000000006', 'Agromet Scientist', '10000000-0000-4000-a000-000000000007', 'Generates crop-weather advisories and crop yield meteorological forecasting models.', true),
  ('20000000-0000-4000-a000-000000000007', 'Meteorologist Grade I', '10000000-0000-4000-a000-000000000004', 'Senior operational forecaster managing regional forecasting offices and severe weather desks.', true),
  ('20000000-0000-4000-a000-000000000008', 'Meteorologist Grade II', '10000000-0000-4000-a000-000000000004', 'Operational synoptic weather forecaster analyzing maps and issuing daily bulletins.', true),
  ('20000000-0000-4000-a000-000000000009', 'Scientific Assistant', '10000000-0000-4000-a000-000000000008', 'Technical support officer managing weather sensors, AWS telemetry, and radar hardware.', true),
  ('20000000-0000-4000-a000-000000000010', 'Training Coordinator', '10000000-0000-4000-a000-000000000004', 'Coordinates operational capacity building, curriculum design, and assessment tracking.', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 3. COMPETENCIES (12 records)
INSERT INTO public.competencies (id, name, category, default_target_score, description, is_active)
VALUES
  ('30000000-0000-4000-a000-000000000001', 'Doppler Weather Radar', 'Radar Operations', 85, 'Operation and signal processing principles of C-band and S-band Doppler Weather Radars.', true),
  ('30000000-0000-4000-a000-000000000002', 'Radar Product Interpretation', 'Radar Operations', 85, 'Analysis of reflectivity, radial velocity, spectral width, and dual-polarization products.', true),
  ('30000000-0000-4000-a000-000000000003', 'Numerical Weather Prediction', 'NWP', 85, 'Fundamentals of atmospheric dynamics, primitive equations, and grid model setups.', true),
  ('30000000-0000-4000-a000-000000000004', 'NWP Model Interpretation', 'NWP', 80, 'Interpretation of GFS/NCUM model guidance, bias correction, and ensemble spread.', true),
  ('30000000-0000-4000-a000-000000000005', 'Satellite Meteorology', 'Satellite Operations', 85, 'Principles of radiometry, infrared/water-vapor channels, and atmospheric sounding.', true),
  ('30000000-0000-4000-a000-000000000006', 'Satellite Image Interpretation', 'Satellite Operations', 85, 'Feature identification for convective systems, tropical cyclones, and fog/stratus.', true),
  ('30000000-0000-4000-a000-000000000007', 'Forecast Verification', 'Verification', 80, 'Quantitative forecast validation techniques, contingency tables, and skill scores.', true),
  ('30000000-0000-4000-a000-000000000008', 'Synoptic Meteorology', 'Forecasting', 85, 'Chart analysis, monsoon trough behavior, tropical cyclone track forecasting.', true),
  ('30000000-0000-4000-a000-000000000009', 'Python for Meteorological Data', 'Data & Analytics', 75, 'Data handling using MetPy, Xarray, NetCDF4, Cartopy, and PyART.', true),
  ('30000000-0000-4000-a000-000000000010', 'Aviation Meteorology', 'Aviation Operations', 85, 'International Civil Aviation Organization (ICAO) codes, TAFs, METARs, and wind shear.', true),
  ('30000000-0000-4000-a000-000000000011', 'Hydrometeorology', 'Hydrology', 85, 'Quantified Precipitation Estimation (QPE), basin average rainfall, and runoff modeling.', true),
  ('30000000-0000-4000-a000-000000000012', 'Agricultural Meteorology', 'Agrometeorology', 80, 'Evapotranspiration calculations, crop microclimate analysis, and thermal time indices.', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, default_target_score = EXCLUDED.default_target_score;

-- 4. JOB ROLE COMPETENCIES (29 mappings)
INSERT INTO public.job_role_competencies (job_role_id, competency_id, required_score, importance)
VALUES
  ('20000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000001', 85, 'core'),
  ('20000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000002', 85, 'core'),
  ('20000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000007', 80, 'important'),
  ('20000000-0000-4000-a000-000000000002', '30000000-0000-4000-a000-000000000003', 85, 'core'),
  ('20000000-0000-4000-a000-000000000002', '30000000-0000-4000-a000-000000000004', 85, 'core'),
  ('20000000-0000-4000-a000-000000000002', '30000000-0000-4000-a000-000000000009', 80, 'important'),
  ('20000000-0000-4000-a000-000000000003', '30000000-0000-4000-a000-000000000005', 85, 'core'),
  ('20000000-0000-4000-a000-000000000003', '30000000-0000-4000-a000-000000000006', 85, 'core'),
  ('20000000-0000-4000-a000-000000000003', '30000000-0000-4000-a000-000000000009', 75, 'supporting'),
  ('20000000-0000-4000-a000-000000000004', '30000000-0000-4000-a000-000000000010', 85, 'core'),
  ('20000000-0000-4000-a000-000000000004', '30000000-0000-4000-a000-000000000008', 80, 'important'),
  ('20000000-0000-4000-a000-000000000004', '30000000-0000-4000-a000-000000000002', 75, 'supporting'),
  ('20000000-0000-4000-a000-000000000005', '30000000-0000-4000-a000-000000000011', 85, 'core'),
  ('20000000-0000-4000-a000-000000000005', '30000000-0000-4000-a000-000000000007', 80, 'important'),
  ('20000000-0000-4000-a000-000000000005', '30000000-0000-4000-a000-000000000008', 75, 'supporting'),
  ('20000000-0000-4000-a000-000000000006', '30000000-0000-4000-a000-000000000012', 85, 'core'),
  ('20000000-0000-4000-a000-000000000006', '30000000-0000-4000-a000-000000000008', 80, 'important'),
  ('20000000-0000-4000-a000-000000000006', '30000000-0000-4000-a000-000000000009', 75, 'supporting'),
  ('20000000-0000-4000-a000-000000000007', '30000000-0000-4000-a000-000000000008', 85, 'core'),
  ('20000000-0000-4000-a000-000000000007', '30000000-0000-4000-a000-000000000007', 80, 'important'),
  ('20000000-0000-4000-a000-000000000007', '30000000-0000-4000-a000-000000000004', 80, 'important'),
  ('20000000-0000-4000-a000-000000000008', '30000000-0000-4000-a000-000000000008', 80, 'core'),
  ('20000000-0000-4000-a000-000000000008', '30000000-0000-4000-a000-000000000002', 75, 'supporting'),
  ('20000000-0000-4000-a000-000000000008', '30000000-0000-4000-a000-000000000007', 75, 'supporting'),
  ('20000000-0000-4000-a000-000000000009', '30000000-0000-4000-a000-000000000001', 75, 'important'),
  ('20000000-0000-4000-a000-000000000009', '30000000-0000-4000-a000-000000000006', 75, 'important'),
  ('20000000-0000-4000-a000-000000000009', '30000000-0000-4000-a000-000000000009', 70, 'supporting'),
  ('20000000-0000-4000-a000-000000000010', '30000000-0000-4000-a000-000000000007', 80, 'important'),
  ('20000000-0000-4000-a000-000000000010', '30000000-0000-4000-a000-000000000008', 75, 'supporting')
ON CONFLICT (job_role_id, competency_id) DO UPDATE SET required_score = EXCLUDED.required_score, importance = EXCLUDED.importance;

-- 5. PROFILES (37 records resolved dynamically from auth.users by email)
INSERT INTO public.profiles (id, email, full_name, role, designation, department, organizational_unit_id, job_role_id, is_approved, is_active, created_at)
SELECT u.id, u.email, v.full_name, v.role, v.designation, v.department, v.unit_id, v.role_id, true, true, NOW()
FROM (
  VALUES
    ('admin.capacityconnect@example.com', 'Demo System Administrator', 'admin', 'Training Coordinator', 'Forecasting & RSMC', '10000000-0000-4000-a000-000000000004'::uuid, '20000000-0000-4000-a000-000000000010'::uuid),
    ('trainer.radar.capacityconnect@example.com', 'Demo Radar Lead Trainer', 'trainer', 'Radar Meteorologist', 'Radar Operations', '10000000-0000-4000-a000-000000000001'::uuid, '20000000-0000-4000-a000-000000000001'::uuid),
    ('trainer.nwp.capacityconnect@example.com', 'Demo NWP Specialist Trainer', 'trainer', 'NWP Scientist', 'Numerical Weather Prediction', '10000000-0000-4000-a000-000000000002'::uuid, '20000000-0000-4000-a000-000000000002'::uuid),
    ('trainer.satellite.capacityconnect@example.com', 'Demo Satellite Expert Trainer', 'trainer', 'Satellite Meteorologist', 'Satellite Meteorology', '10000000-0000-4000-a000-000000000003'::uuid, '20000000-0000-4000-a000-000000000003'::uuid),
    ('trainer.verification.capacityconnect@example.com', 'Demo Verification Specialist Trainer', 'trainer', 'Training Coordinator', 'Forecasting & RSMC', '10000000-0000-4000-a000-000000000004'::uuid, '20000000-0000-4000-a000-000000000010'::uuid),
    ('trainer.python.capacityconnect@example.com', 'Demo Data Analytics Trainer', 'trainer', 'NWP Scientist', 'Numerical Weather Prediction', '10000000-0000-4000-a000-000000000002'::uuid, '20000000-0000-4000-a000-000000000002'::uuid),
    ('trainer.aviation.capacityconnect@example.com', 'Demo Aviation Hydromet Trainer', 'trainer', 'Aviation Meteorologist', 'Aviation Meteorology', '10000000-0000-4000-a000-000000000005'::uuid, '20000000-0000-4000-a000-000000000004'::uuid),
    ('trainee.rdr1.capacityconnect@example.com', 'Demo Radar Trainee 01', 'trainee', 'Radar Meteorologist', 'Radar Operations', '10000000-0000-4000-a000-000000000001'::uuid, '20000000-0000-4000-a000-000000000001'::uuid),
    ('trainee.rdr2.capacityconnect@example.com', 'Demo Radar Trainee 02', 'trainee', 'Radar Meteorologist', 'Radar Operations', '10000000-0000-4000-a000-000000000001'::uuid, '20000000-0000-4000-a000-000000000001'::uuid),
    ('trainee.rdr3.capacityconnect@example.com', 'Demo Radar Trainee 03', 'trainee', 'Radar Meteorologist', 'Radar Operations', '10000000-0000-4000-a000-000000000001'::uuid, '20000000-0000-4000-a000-000000000001'::uuid),
    ('trainee.rdr4.capacityconnect@example.com', 'Demo Radar Trainee 04', 'trainee', 'Radar Meteorologist', 'Radar Operations', '10000000-0000-4000-a000-000000000001'::uuid, '20000000-0000-4000-a000-000000000001'::uuid),
    ('trainee.rdr5.capacityconnect@example.com', 'Demo Radar Trainee 05', 'trainee', 'Radar Meteorologist', 'Radar Operations', '10000000-0000-4000-a000-000000000001'::uuid, '20000000-0000-4000-a000-000000000001'::uuid),
    ('trainee.rdr6.capacityconnect@example.com', 'Demo Radar Trainee 06', 'trainee', 'Radar Meteorologist', 'Radar Operations', '10000000-0000-4000-a000-000000000001'::uuid, '20000000-0000-4000-a000-000000000001'::uuid),
    ('trainee.rdr7.capacityconnect@example.com', 'Demo Radar Assistant 07', 'trainee', 'Scientific Assistant', 'Radar Operations', '10000000-0000-4000-a000-000000000001'::uuid, '20000000-0000-4000-a000-000000000009'::uuid),
    ('trainee.rdr8.capacityconnect@example.com', 'Demo Radar Assistant 08', 'trainee', 'Scientific Assistant', 'Radar Operations', '10000000-0000-4000-a000-000000000001'::uuid, '20000000-0000-4000-a000-000000000009'::uuid),
    ('trainee.fst1.capacityconnect@example.com', 'Demo Forecaster Trainee 01', 'trainee', 'Meteorologist Grade I', 'Forecasting & RSMC', '10000000-0000-4000-a000-000000000004'::uuid, '20000000-0000-4000-a000-000000000007'::uuid),
    ('trainee.fst2.capacityconnect@example.com', 'Demo Forecaster Trainee 02', 'trainee', 'Meteorologist Grade I', 'Forecasting & RSMC', '10000000-0000-4000-a000-000000000004'::uuid, '20000000-0000-4000-a000-000000000007'::uuid),
    ('trainee.fst3.capacityconnect@example.com', 'Demo Forecaster Trainee 03', 'trainee', 'Meteorologist Grade II', 'Forecasting & RSMC', '10000000-0000-4000-a000-000000000004'::uuid, '20000000-0000-4000-a000-000000000008'::uuid),
    ('trainee.fst4.capacityconnect@example.com', 'Demo Forecaster Trainee 04', 'trainee', 'Meteorologist Grade II', 'Forecasting & RSMC', '10000000-0000-4000-a000-000000000004'::uuid, '20000000-0000-4000-a000-000000000008'::uuid),
    ('trainee.fst5.capacityconnect@example.com', 'Demo Forecaster Trainee 05', 'trainee', 'Meteorologist Grade II', 'Forecasting & RSMC', '10000000-0000-4000-a000-000000000004'::uuid, '20000000-0000-4000-a000-000000000008'::uuid),
    ('trainee.fst6.capacityconnect@example.com', 'Demo Forecaster Trainee 06', 'trainee', 'Meteorologist Grade II', 'Forecasting & RSMC', '10000000-0000-4000-a000-000000000004'::uuid, '20000000-0000-4000-a000-000000000008'::uuid),
    ('trainee.nwp1.capacityconnect@example.com', 'Demo NWP Scientist Trainee 01', 'trainee', 'NWP Scientist', 'Numerical Weather Prediction', '10000000-0000-4000-a000-000000000002'::uuid, '20000000-0000-4000-a000-000000000002'::uuid),
    ('trainee.nwp2.capacityconnect@example.com', 'Demo NWP Scientist Trainee 02', 'trainee', 'NWP Scientist', 'Numerical Weather Prediction', '10000000-0000-4000-a000-000000000002'::uuid, '20000000-0000-4000-a000-000000000002'::uuid),
    ('trainee.nwp3.capacityconnect@example.com', 'Demo NWP Scientist Trainee 03', 'trainee', 'NWP Scientist', 'Numerical Weather Prediction', '10000000-0000-4000-a000-000000000002'::uuid, '20000000-0000-4000-a000-000000000002'::uuid),
    ('trainee.nwp4.capacityconnect@example.com', 'Demo NWP Scientist Trainee 04', 'trainee', 'NWP Scientist', 'Numerical Weather Prediction', '10000000-0000-4000-a000-000000000002'::uuid, '20000000-0000-4000-a000-000000000002'::uuid),
    ('trainee.nwp5.capacityconnect@example.com', 'Demo NWP Scientist Trainee 05', 'trainee', 'NWP Scientist', 'Numerical Weather Prediction', '10000000-0000-4000-a000-000000000002'::uuid, '20000000-0000-4000-a000-000000000002'::uuid),
    ('trainee.sat1.capacityconnect@example.com', 'Demo Satellite Trainee 01', 'trainee', 'Satellite Meteorologist', 'Satellite Meteorology', '10000000-0000-4000-a000-000000000003'::uuid, '20000000-0000-4000-a000-000000000003'::uuid),
    ('trainee.sat2.capacityconnect@example.com', 'Demo Satellite Trainee 02', 'trainee', 'Satellite Meteorologist', 'Satellite Meteorology', '10000000-0000-4000-a000-000000000003'::uuid, '20000000-0000-4000-a000-000000000003'::uuid),
    ('trainee.sat3.capacityconnect@example.com', 'Demo Satellite Trainee 03', 'trainee', 'Satellite Meteorologist', 'Satellite Meteorology', '10000000-0000-4000-a000-000000000003'::uuid, '20000000-0000-4000-a000-000000000003'::uuid),
    ('trainee.sat4.capacityconnect@example.com', 'Demo Satellite Trainee 04', 'trainee', 'Satellite Meteorologist', 'Satellite Meteorology', '10000000-0000-4000-a000-000000000003'::uuid, '20000000-0000-4000-a000-000000000003'::uuid),
    ('trainee.avn1.capacityconnect@example.com', 'Demo Aviation Trainee 01', 'trainee', 'Aviation Meteorologist', 'Aviation Meteorology', '10000000-0000-4000-a000-000000000005'::uuid, '20000000-0000-4000-a000-000000000004'::uuid),
    ('trainee.avn2.capacityconnect@example.com', 'Demo Aviation Trainee 02', 'trainee', 'Aviation Meteorologist', 'Aviation Meteorology', '10000000-0000-4000-a000-000000000005'::uuid, '20000000-0000-4000-a000-000000000004'::uuid),
    ('trainee.avn3.capacityconnect@example.com', 'Demo Aviation Trainee 03', 'trainee', 'Aviation Meteorologist', 'Aviation Meteorology', '10000000-0000-4000-a000-000000000005'::uuid, '20000000-0000-4000-a000-000000000004'::uuid),
    ('trainee.hyd1.capacityconnect@example.com', 'Demo Hydromet Trainee 01', 'trainee', 'Hydromet Scientist', 'Hydrometeorology', '10000000-0000-4000-a000-000000000006'::uuid, '20000000-0000-4000-a000-000000000005'::uuid),
    ('trainee.hyd2.capacityconnect@example.com', 'Demo Hydromet Trainee 02', 'trainee', 'Hydromet Scientist', 'Hydrometeorology', '10000000-0000-4000-a000-000000000006'::uuid, '20000000-0000-4000-a000-000000000005'::uuid),
    ('trainee.agr1.capacityconnect@example.com', 'Demo Agromet Trainee 01', 'trainee', 'Agromet Scientist', 'Agricultural Meteorology', '10000000-0000-4000-a000-000000000007'::uuid, '20000000-0000-4000-a000-000000000006'::uuid),
    ('trainee.agr2.capacityconnect@example.com', 'Demo Agromet Trainee 02', 'trainee', 'Agromet Scientist', 'Agricultural Meteorology', '10000000-0000-4000-a000-000000000007'::uuid, '20000000-0000-4000-a000-000000000006'::uuid)
) AS v(email, full_name, role, designation, department, unit_id, role_id)
JOIN auth.users u ON u.email = v.email
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, designation = EXCLUDED.designation, department = EXCLUDED.department, organizational_unit_id = EXCLUDED.organizational_unit_id, job_role_id = EXCLUDED.job_role_id, is_active = true, is_approved = true;

-- 6. TRAINER PROFILES (6 records resolved dynamically)
INSERT INTO public.trainer_profiles (user_id, years_of_experience, trainer_bio, availability_status)
SELECT u.id, v.yoe, v.bio, 'available'
FROM (
  VALUES
    ('trainer.radar.capacityconnect@example.com', 10, 'Doppler Weather Radar & Dual Pol Echo Interpretation'),
    ('trainer.nwp.capacityconnect@example.com', 12, 'Global Spectral & High-Resolution Mesoscale Modeling'),
    ('trainer.satellite.capacityconnect@example.com', 14, 'Geostationary Payload Derived Products & Soundings'),
    ('trainer.verification.capacityconnect@example.com', 16, 'Statistical Forecast Metrics & Model Diagnostic Diagnostics'),
    ('trainer.python.capacityconnect@example.com', 18, 'Scientific Python, MetPy, PyART, & Cloud Data Pipelines'),
    ('trainer.aviation.capacityconnect@example.com', 20, 'ICAO Aerodrome Warnings, Radar QPE & Flash Flood Hydrology')
) AS v(email, yoe, bio)
JOIN auth.users u ON u.email = v.email
ON CONFLICT (user_id) DO UPDATE SET years_of_experience = EXCLUDED.years_of_experience, trainer_bio = EXCLUDED.trainer_bio, availability_status = EXCLUDED.availability_status;

-- 7. TRAINEE PROFILES (30 records resolved dynamically)
INSERT INTO public.trainee_profiles (user_id, employee_code)
SELECT u.id, v.emp_code
FROM (
  VALUES
    ('trainee.rdr1.capacityconnect@example.com', 'IMD-DEMO-101'),
    ('trainee.rdr2.capacityconnect@example.com', 'IMD-DEMO-102'),
    ('trainee.rdr3.capacityconnect@example.com', 'IMD-DEMO-103'),
    ('trainee.rdr4.capacityconnect@example.com', 'IMD-DEMO-104'),
    ('trainee.rdr5.capacityconnect@example.com', 'IMD-DEMO-105'),
    ('trainee.rdr6.capacityconnect@example.com', 'IMD-DEMO-106'),
    ('trainee.rdr7.capacityconnect@example.com', 'IMD-DEMO-107'),
    ('trainee.rdr8.capacityconnect@example.com', 'IMD-DEMO-108'),
    ('trainee.fst1.capacityconnect@example.com', 'IMD-DEMO-109'),
    ('trainee.fst2.capacityconnect@example.com', 'IMD-DEMO-110'),
    ('trainee.fst3.capacityconnect@example.com', 'IMD-DEMO-111'),
    ('trainee.fst4.capacityconnect@example.com', 'IMD-DEMO-112'),
    ('trainee.fst5.capacityconnect@example.com', 'IMD-DEMO-113'),
    ('trainee.fst6.capacityconnect@example.com', 'IMD-DEMO-114'),
    ('trainee.nwp1.capacityconnect@example.com', 'IMD-DEMO-115'),
    ('trainee.nwp2.capacityconnect@example.com', 'IMD-DEMO-116'),
    ('trainee.nwp3.capacityconnect@example.com', 'IMD-DEMO-117'),
    ('trainee.nwp4.capacityconnect@example.com', 'IMD-DEMO-118'),
    ('trainee.nwp5.capacityconnect@example.com', 'IMD-DEMO-119'),
    ('trainee.sat1.capacityconnect@example.com', 'IMD-DEMO-120'),
    ('trainee.sat2.capacityconnect@example.com', 'IMD-DEMO-121'),
    ('trainee.sat3.capacityconnect@example.com', 'IMD-DEMO-122'),
    ('trainee.sat4.capacityconnect@example.com', 'IMD-DEMO-123'),
    ('trainee.avn1.capacityconnect@example.com', 'IMD-DEMO-124'),
    ('trainee.avn2.capacityconnect@example.com', 'IMD-DEMO-125'),
    ('trainee.avn3.capacityconnect@example.com', 'IMD-DEMO-126'),
    ('trainee.hyd1.capacityconnect@example.com', 'IMD-DEMO-127'),
    ('trainee.hyd2.capacityconnect@example.com', 'IMD-DEMO-128'),
    ('trainee.agr1.capacityconnect@example.com', 'IMD-DEMO-129'),
    ('trainee.agr2.capacityconnect@example.com', 'IMD-DEMO-130')
) AS v(email, emp_code)
JOIN auth.users u ON u.email = v.email
ON CONFLICT (user_id) DO UPDATE SET employee_code = EXCLUDED.employee_code;

-- 8. TRAINER COMPETENCIES (10 records resolved dynamically)
INSERT INTO public.trainer_competencies (trainer_id, competency_id, expertise_score, years_experience, verified)
SELECT u.id, v.comp_id, v.score, v.yoe, true
FROM (
  VALUES
    ('trainer.radar.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 90, 10),
    ('trainer.radar.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 90, 10),
    ('trainer.nwp.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 92, 12),
    ('trainer.nwp.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, 90, 12),
    ('trainer.satellite.capacityconnect@example.com', '30000000-0000-4000-a000-000000000005'::uuid, 95, 14),
    ('trainer.satellite.capacityconnect@example.com', '30000000-0000-4000-a000-000000000006'::uuid, 95, 14),
    ('trainer.verification.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 90, 16),
    ('trainer.python.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 95, 18),
    ('trainer.aviation.capacityconnect@example.com', '30000000-0000-4000-a000-000000000010'::uuid, 90, 20),
    ('trainer.aviation.capacityconnect@example.com', '30000000-0000-4000-a000-000000000011'::uuid, 88, 20)
) AS v(trainer_email, comp_id, score, yoe)
JOIN auth.users u ON u.email = v.trainer_email
ON CONFLICT (trainer_id, competency_id) DO UPDATE SET expertise_score = EXCLUDED.expertise_score, years_experience = EXCLUDED.years_experience, verified = true;

-- 9. COURSES (10 published courses resolved by trainer email)
INSERT INTO public.courses (id, title, slug, description, category, difficulty, estimated_duration_minutes, trainer_id, created_by, status, approval_status, created_at)
SELECT v.id, v.title, v.slug, v.description, v.category, v.difficulty, v.duration * 60, u.id, u.id, 'published', 'approved', NOW() - INTERVAL '120 days'
FROM (
  VALUES
    ('40000000-0000-4000-a000-000000000001'::uuid, 'Doppler Weather Radar Fundamentals', 'doppler-weather-radar-fundamentals', 'Operational training course covering Doppler Weather Radar Fundamentals', 'Radar Operations', 'beginner', 40, 'trainer.radar.capacityconnect@example.com'),
    ('40000000-0000-4000-a000-000000000002'::uuid, 'Advanced Radar Product Interpretation', 'advanced-radar-product-interpretation', 'Operational training course covering Advanced Radar Product Interpretation', 'Radar Operations', 'advanced', 60, 'trainer.radar.capacityconnect@example.com'),
    ('40000000-0000-4000-a000-000000000003'::uuid, 'Numerical Weather Prediction Fundamentals', 'numerical-weather-prediction-fundamentals', 'Operational training course covering Numerical Weather Prediction Fundamentals', 'NWP', 'beginner', 50, 'trainer.nwp.capacityconnect@example.com'),
    ('40000000-0000-4000-a000-000000000004'::uuid, 'Operational NWP Model Interpretation', 'operational-nwp-model-interpretation', 'Operational training course covering Operational NWP Model Interpretation', 'NWP', 'intermediate', 45, 'trainer.nwp.capacityconnect@example.com'),
    ('40000000-0000-4000-a000-000000000005'::uuid, 'Satellite Meteorology Essentials', 'satellite-meteorology-essentials', 'Operational training course covering Satellite Meteorology Essentials', 'Satellite Operations', 'beginner', 35, 'trainer.satellite.capacityconnect@example.com'),
    ('40000000-0000-4000-a000-000000000006'::uuid, 'Satellite Image Interpretation Workshop', 'satellite-image-interpretation-workshop', 'Operational training course covering Satellite Image Interpretation Workshop', 'Satellite Operations', 'intermediate', 30, 'trainer.satellite.capacityconnect@example.com'),
    ('40000000-0000-4000-a000-000000000007'::uuid, 'Forecast Verification Techniques', 'forecast-verification-techniques', 'Operational training course covering Forecast Verification Techniques', 'Verification', 'intermediate', 25, 'trainer.verification.capacityconnect@example.com'),
    ('40000000-0000-4000-a000-000000000008'::uuid, 'Python for Meteorological Data Analysis', 'python-for-meteorological-data-analysis', 'Operational training course covering Python for Meteorological Data Analysis', 'Data & Analytics', 'intermediate', 60, 'trainer.python.capacityconnect@example.com'),
    ('40000000-0000-4000-a000-000000000009'::uuid, 'Operational Aviation Meteorology', 'operational-aviation-meteorology', 'Operational training course covering Operational Aviation Meteorology', 'Aviation Operations', 'intermediate', 40, 'trainer.aviation.capacityconnect@example.com'),
    ('40000000-0000-4000-a000-000000000010'::uuid, 'Hydrometeorological Forecasting', 'hydrometeorological-forecasting', 'Operational training course covering Hydrometeorological Forecasting', 'Hydrology', 'intermediate', 45, 'trainer.aviation.capacityconnect@example.com')
) AS v(id, title, slug, description, category, difficulty, duration, trainer_email)
JOIN auth.users u ON u.email = v.trainer_email
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, status = 'published', approval_status = 'approved';

-- 10. COURSE COMPETENCIES (10 mappings)
INSERT INTO public.course_competencies (course_id, competency_id, relevance_weight)
VALUES
  ('40000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000001', 100),
  ('40000000-0000-4000-a000-000000000002', '30000000-0000-4000-a000-000000000002', 100),
  ('40000000-0000-4000-a000-000000000003', '30000000-0000-4000-a000-000000000003', 100),
  ('40000000-0000-4000-a000-000000000004', '30000000-0000-4000-a000-000000000004', 100),
  ('40000000-0000-4000-a000-000000000005', '30000000-0000-4000-a000-000000000005', 100),
  ('40000000-0000-4000-a000-000000000006', '30000000-0000-4000-a000-000000000006', 100),
  ('40000000-0000-4000-a000-000000000007', '30000000-0000-4000-a000-000000000007', 100),
  ('40000000-0000-4000-a000-000000000008', '30000000-0000-4000-a000-000000000009', 100),
  ('40000000-0000-4000-a000-000000000009', '30000000-0000-4000-a000-000000000010', 100),
  ('40000000-0000-4000-a000-000000000010', '30000000-0000-4000-a000-000000000011', 100)
ON CONFLICT (course_id, competency_id) DO UPDATE SET relevance_weight = EXCLUDED.relevance_weight;

-- 11. USER COMPETENCIES (120 records resolved by email)
INSERT INTO public.user_competencies (user_id, competency_id, current_score, target_score, last_updated_at, created_at)
SELECT u.id, v.comp_id, v.curr_score, v.targ_score, NOW() - (v.days_ago || ' days')::interval, NOW() - INTERVAL '100 days'
FROM (
  VALUES
    ('trainee.rdr1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 59, 85, 5),
    ('trainee.rdr1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 59, 85, 5),
    ('trainee.rdr1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 59, 80, 5),
    ('trainee.rdr1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 61, 80, 10),
    ('trainee.rdr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 63, 85, 8),
    ('trainee.rdr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 63, 85, 8),
    ('trainee.rdr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 63, 80, 8),
    ('trainee.rdr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 68, 80, 12),
    ('trainee.rdr3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 67, 85, 11),
    ('trainee.rdr3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 67, 85, 11),
    ('trainee.rdr3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 67, 80, 11),
    ('trainee.rdr3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 75, 80, 14),
    ('trainee.rdr4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 41, 85, 14),
    ('trainee.rdr4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 41, 85, 14),
    ('trainee.rdr4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 41, 80, 14),
    ('trainee.rdr4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 82, 80, 16),
    ('trainee.rdr5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 45, 85, 17),
    ('trainee.rdr5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 45, 85, 17),
    ('trainee.rdr5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 45, 80, 17),
    ('trainee.rdr5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 64, 80, 18),
    ('trainee.rdr6.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 49, 85, 20),
    ('trainee.rdr6.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 49, 85, 20),
    ('trainee.rdr6.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 49, 80, 20),
    ('trainee.rdr6.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 71, 80, 20),
    ('trainee.rdr7.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 53, 75, 23),
    ('trainee.rdr7.capacityconnect@example.com', '30000000-0000-4000-a000-000000000006'::uuid, 53, 75, 23),
    ('trainee.rdr7.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 53, 70, 23),
    ('trainee.rdr7.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 78, 80, 22),
    ('trainee.rdr7.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 78, 80, 22),
    ('trainee.rdr8.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 57, 75, 26),
    ('trainee.rdr8.capacityconnect@example.com', '30000000-0000-4000-a000-000000000006'::uuid, 57, 75, 26),
    ('trainee.rdr8.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 57, 70, 26),
    ('trainee.rdr8.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 60, 80, 24),
    ('trainee.rdr8.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 60, 80, 24),
    ('trainee.fst1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 75, 85, 29),
    ('trainee.fst1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 75, 80, 29),
    ('trainee.fst1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, 75, 80, 29),
    ('trainee.fst2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 80, 85, 32),
    ('trainee.fst2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 80, 80, 32),
    ('trainee.fst2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, 80, 80, 32),
    ('trainee.fst3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 52, 80, 35),
    ('trainee.fst3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 52, 75, 35),
    ('trainee.fst3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 52, 75, 35),
    ('trainee.fst4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 57, 80, 38),
    ('trainee.fst4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 57, 75, 38),
    ('trainee.fst4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 57, 75, 38),
    ('trainee.fst5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 62, 80, 41),
    ('trainee.fst5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 62, 75, 41),
    ('trainee.fst5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 62, 75, 41),
    ('trainee.fst6.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 67, 80, 44),
    ('trainee.fst6.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 67, 75, 44),
    ('trainee.fst6.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 67, 75, 44),
    ('trainee.nwp1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 58, 85, 47),
    ('trainee.nwp1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, 58, 85, 47),
    ('trainee.nwp1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 58, 80, 47),
    ('trainee.nwp1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 84, 80, 38),
    ('trainee.nwp1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 84, 80, 38),
    ('trainee.nwp2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 61, 85, 50),
    ('trainee.nwp2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, 61, 85, 50),
    ('trainee.nwp2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 61, 80, 50),
    ('trainee.nwp2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 66, 80, 40),
    ('trainee.nwp2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 66, 80, 40),
    ('trainee.nwp3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 64, 85, 53),
    ('trainee.nwp3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, 64, 85, 53),
    ('trainee.nwp3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 64, 80, 53),
    ('trainee.nwp3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 73, 80, 42),
    ('trainee.nwp3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 73, 80, 42),
    ('trainee.nwp4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 67, 85, 56),
    ('trainee.nwp4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, 67, 85, 56),
    ('trainee.nwp4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 67, 80, 56),
    ('trainee.nwp4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 80, 80, 44),
    ('trainee.nwp4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 80, 80, 44),
    ('trainee.nwp5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 70, 85, 59),
    ('trainee.nwp5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, 70, 85, 59),
    ('trainee.nwp5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 70, 80, 59),
    ('trainee.nwp5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 62, 80, 46),
    ('trainee.nwp5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 62, 80, 46),
    ('trainee.sat1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000005'::uuid, 86, 85, 62),
    ('trainee.sat1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000006'::uuid, 86, 85, 62),
    ('trainee.sat1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 69, 80, 48),
    ('trainee.sat1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 69, 80, 48),
    ('trainee.sat2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000005'::uuid, 89, 85, 65),
    ('trainee.sat2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000006'::uuid, 89, 85, 65),
    ('trainee.sat2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 89, 75, 65),
    ('trainee.sat2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 76, 80, 50),
    ('trainee.sat2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 76, 80, 50),
    ('trainee.sat3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000005'::uuid, 78, 85, 68),
    ('trainee.sat3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000006'::uuid, 78, 85, 68),
    ('trainee.sat3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 78, 75, 68),
    ('trainee.sat3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 83, 80, 52),
    ('trainee.sat3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 83, 80, 52),
    ('trainee.sat4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000005'::uuid, 81, 85, 71),
    ('trainee.sat4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000006'::uuid, 81, 85, 71),
    ('trainee.sat4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 81, 75, 71),
    ('trainee.sat4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 65, 80, 54),
    ('trainee.sat4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 65, 80, 54),
    ('trainee.avn1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000010'::uuid, 81, 85, 74),
    ('trainee.avn1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 81, 80, 74),
    ('trainee.avn1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 81, 75, 74),
    ('trainee.avn1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 72, 80, 56),
    ('trainee.avn2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000010'::uuid, 61, 85, 77),
    ('trainee.avn2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 61, 80, 77),
    ('trainee.avn2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 61, 75, 77),
    ('trainee.avn2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 79, 80, 58),
    ('trainee.avn3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000010'::uuid, 65, 85, 80),
    ('trainee.avn3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 65, 80, 80),
    ('trainee.avn3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 65, 75, 80),
    ('trainee.avn3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 61, 80, 60),
    ('trainee.hyd1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 69, 80, 83),
    ('trainee.hyd1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 69, 75, 83),
    ('trainee.hyd2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000011'::uuid, 73, 85, 86),
    ('trainee.hyd2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 73, 80, 86),
    ('trainee.hyd2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 73, 75, 86),
    ('trainee.agr1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 77, 80, 89),
    ('trainee.agr1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 77, 75, 89),
    ('trainee.agr1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 82, 80, 66),
    ('trainee.agr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000012'::uuid, 81, 85, 92),
    ('trainee.agr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 81, 80, 92),
    ('trainee.agr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 81, 75, 92),
    ('trainee.agr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 64, 80, 68)
) AS v(email, comp_id, curr_score, targ_score, days_ago)
JOIN auth.users u ON u.email = v.email
ON CONFLICT (user_id, competency_id) DO UPDATE SET current_score = EXCLUDED.current_score, last_updated_at = EXCLUDED.last_updated_at;

-- 12. COMPETENCY SCORE HISTORY (22 records resolved by email)
INSERT INTO public.competency_score_history (id, user_id, competency_id, previous_score, new_score, source_type, created_at)
SELECT v.id, u.id, v.comp_id, v.prev_score, v.new_score, v.source_type, NOW() - (v.days_ago || ' days')::interval
FROM (
  VALUES
    ('31000000-0000-4000-a000-000000000001'::uuid, 'trainee.rdr1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, NULL::numeric, 42, 'baseline', 90),
    ('31000000-0000-4000-a000-000000000002'::uuid, 'trainee.rdr1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 42, 67, 'assessment', 30),
    ('31000000-0000-4000-a000-000000000003'::uuid, 'trainee.rdr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, NULL::numeric, 48, 'baseline', 90),
    ('31000000-0000-4000-a000-000000000004'::uuid, 'trainee.rdr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 48, 71, 'assessment', 30),
    ('31000000-0000-4000-a000-000000000005'::uuid, 'trainee.rdr3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, NULL::numeric, 53, 'baseline', 90),
    ('31000000-0000-4000-a000-000000000006'::uuid, 'trainee.rdr3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 53, 76, 'assessment', 30),
    ('31000000-0000-4000-a000-000000000007'::uuid, 'trainee.rdr4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, NULL::numeric, 57, 'baseline', 90),
    ('31000000-0000-4000-a000-000000000008'::uuid, 'trainee.rdr4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 57, 79, 'assessment', 30),
    ('31000000-0000-4000-a000-000000000009'::uuid, 'trainee.nwp1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, NULL::numeric, 57, 'baseline', 80),
    ('31000000-0000-4000-a000-000000000010'::uuid, 'trainee.nwp1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 57, 68, 'assessment', 20),
    ('31000000-0000-4000-a000-000000000011'::uuid, 'trainee.nwp2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, NULL::numeric, 63, 'baseline', 80),
    ('31000000-0000-4000-a000-000000000012'::uuid, 'trainee.nwp2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 63, 74, 'assessment', 20),
    ('31000000-0000-4000-a000-000000000013'::uuid, 'trainee.nwp3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, NULL::numeric, 66, 'baseline', 80),
    ('31000000-0000-4000-a000-000000000014'::uuid, 'trainee.nwp3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 66, 78, 'assessment', 20),
    ('31000000-0000-4000-a000-000000000015'::uuid, 'trainee.rdr6.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, NULL::numeric, 60, 'baseline', 60),
    ('31000000-0000-4000-a000-000000000016'::uuid, 'trainee.rdr7.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, NULL::numeric, 62, 'baseline', 65),
    ('31000000-0000-4000-a000-000000000017'::uuid, 'trainee.rdr8.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, NULL::numeric, 64, 'baseline', 70),
    ('31000000-0000-4000-a000-000000000018'::uuid, 'trainee.fst1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000005'::uuid, NULL::numeric, 66, 'baseline', 75),
    ('31000000-0000-4000-a000-000000000019'::uuid, 'trainee.fst2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000006'::uuid, NULL::numeric, 68, 'baseline', 80),
    ('31000000-0000-4000-a000-000000000020'::uuid, 'trainee.fst3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, NULL::numeric, 70, 'baseline', 85),
    ('31000000-0000-4000-a000-000000000021'::uuid, 'trainee.fst4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, NULL::numeric, 72, 'baseline', 90),
    ('31000000-0000-4000-a000-000000000022'::uuid, 'trainee.fst5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, NULL::numeric, 74, 'baseline', 95)
) AS v(id, email, comp_id, prev_score, new_score, source_type, days_ago)
JOIN auth.users u ON u.email = v.email
ON CONFLICT (id) DO UPDATE SET new_score = EXCLUDED.new_score, previous_score = EXCLUDED.previous_score;

-- 13. SKILL GAPS (43 records resolved by email)
INSERT INTO public.skill_gaps (trainee_id, competency_id, current_score, target_score, gap_score, priority, status, detected_at)
SELECT u.id, v.comp_id, v.curr_score, v.targ_score, v.gap_score, v.priority, 'open', NOW() - INTERVAL '15 days'
FROM (
  VALUES
    ('trainee.rdr1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 59, 85, 26, 'critical'),
    ('trainee.rdr1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 59, 85, 26, 'critical'),
    ('trainee.rdr1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 59, 80, 21, 'high'),
    ('trainee.rdr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 63, 85, 22, 'high'),
    ('trainee.rdr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 63, 85, 22, 'high'),
    ('trainee.rdr2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 63, 80, 17, 'medium'),
    ('trainee.rdr3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 67, 85, 18, 'high'),
    ('trainee.rdr3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 67, 85, 18, 'high'),
    ('trainee.rdr4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 41, 85, 44, 'critical'),
    ('trainee.rdr4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 41, 85, 44, 'critical'),
    ('trainee.rdr4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 41, 80, 39, 'critical'),
    ('trainee.rdr5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 45, 85, 40, 'critical'),
    ('trainee.rdr5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 45, 85, 40, 'critical'),
    ('trainee.rdr5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 45, 80, 35, 'critical'),
    ('trainee.rdr6.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 49, 85, 36, 'critical'),
    ('trainee.rdr6.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 49, 85, 36, 'critical'),
    ('trainee.rdr6.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 49, 80, 31, 'critical'),
    ('trainee.rdr7.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 53, 75, 22, 'high'),
    ('trainee.rdr7.capacityconnect@example.com', '30000000-0000-4000-a000-000000000006'::uuid, 53, 75, 22, 'high'),
    ('trainee.rdr7.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 53, 70, 17, 'medium'),
    ('trainee.rdr8.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, 57, 75, 18, 'high'),
    ('trainee.rdr8.capacityconnect@example.com', '30000000-0000-4000-a000-000000000006'::uuid, 57, 75, 18, 'high'),
    ('trainee.fst3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 52, 80, 28, 'critical'),
    ('trainee.fst3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 52, 75, 23, 'high'),
    ('trainee.fst3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 52, 75, 23, 'high'),
    ('trainee.fst4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 57, 80, 23, 'high'),
    ('trainee.fst4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, 57, 75, 18, 'high'),
    ('trainee.fst4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000007'::uuid, 57, 75, 18, 'high'),
    ('trainee.fst5.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 62, 80, 18, 'high'),
    ('trainee.nwp1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 58, 85, 27, 'critical'),
    ('trainee.nwp1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, 58, 85, 27, 'critical'),
    ('trainee.nwp1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 58, 80, 22, 'high'),
    ('trainee.nwp2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 61, 85, 24, 'high'),
    ('trainee.nwp2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, 61, 85, 24, 'high'),
    ('trainee.nwp2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 61, 80, 19, 'high'),
    ('trainee.nwp3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 64, 85, 21, 'high'),
    ('trainee.nwp3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, 64, 85, 21, 'high'),
    ('trainee.nwp3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, 64, 80, 16, 'medium'),
    ('trainee.nwp4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, 67, 85, 18, 'high'),
    ('trainee.nwp4.capacityconnect@example.com', '30000000-0000-4000-a000-000000000004'::uuid, 67, 85, 18, 'high'),
    ('trainee.avn2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000010'::uuid, 61, 85, 24, 'high'),
    ('trainee.avn2.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, 61, 80, 19, 'high'),
    ('trainee.avn3.capacityconnect@example.com', '30000000-0000-4000-a000-000000000010'::uuid, 65, 85, 20, 'high')
) AS v(email, comp_id, curr_score, targ_score, gap_score, priority)
JOIN auth.users u ON u.email = v.email
ON CONFLICT (trainee_id, competency_id) DO UPDATE SET current_score = EXCLUDED.current_score, target_score = EXCLUDED.target_score, gap_score = EXCLUDED.gap_score, priority = EXCLUDED.priority, status = EXCLUDED.status;

-- 14. ENROLLMENTS (30 records resolved by email)
INSERT INTO public.enrollments (id, trainee_id, course_id, status, progress_percentage, enrolled_at, completed_at, created_at, updated_at)
SELECT v.id, u.id, v.course_id, v.status, v.progress, NOW() - (v.enrolled_days || ' days')::interval, CASE WHEN v.completed_days IS NOT NULL THEN NOW() - (v.completed_days || ' days')::interval ELSE NULL END, NOW() - INTERVAL '40 days', NOW()
FROM (
  VALUES
    ('50000000-0000-4000-a000-000000000001'::uuid, 'trainee.rdr1.capacityconnect@example.com', '40000000-0000-4000-a000-000000000001'::uuid, 'completed', 100, 90, 30),
    ('50000000-0000-4000-a000-000000000002'::uuid, 'trainee.rdr2.capacityconnect@example.com', '40000000-0000-4000-a000-000000000001'::uuid, 'completed', 100, 90, 30),
    ('50000000-0000-4000-a000-000000000003'::uuid, 'trainee.rdr3.capacityconnect@example.com', '40000000-0000-4000-a000-000000000001'::uuid, 'completed', 100, 90, 30),
    ('50000000-0000-4000-a000-000000000004'::uuid, 'trainee.rdr4.capacityconnect@example.com', '40000000-0000-4000-a000-000000000001'::uuid, 'completed', 100, 90, 30),
    ('50000000-0000-4000-a000-000000000005'::uuid, 'trainee.nwp1.capacityconnect@example.com', '40000000-0000-4000-a000-000000000003'::uuid, 'completed', 100, 80, 20),
    ('50000000-0000-4000-a000-000000000006'::uuid, 'trainee.nwp2.capacityconnect@example.com', '40000000-0000-4000-a000-000000000003'::uuid, 'completed', 100, 80, 20),
    ('50000000-0000-4000-a000-000000000007'::uuid, 'trainee.nwp3.capacityconnect@example.com', '40000000-0000-4000-a000-000000000003'::uuid, 'completed', 100, 80, 20),
    ('50000000-0000-4000-a000-000000000008'::uuid, 'trainee.sat1.capacityconnect@example.com', '40000000-0000-4000-a000-000000000005'::uuid, 'completed', 100, 60, 15),
    ('50000000-0000-4000-a000-000000000009'::uuid, 'trainee.sat2.capacityconnect@example.com', '40000000-0000-4000-a000-000000000006'::uuid, 'completed', 100, 60, 15),
    ('50000000-0000-4000-a000-000000000010'::uuid, 'trainee.fst1.capacityconnect@example.com', '40000000-0000-4000-a000-000000000007'::uuid, 'completed', 100, 60, 15),
    ('50000000-0000-4000-a000-000000000011'::uuid, 'trainee.fst2.capacityconnect@example.com', '40000000-0000-4000-a000-000000000008'::uuid, 'completed', 100, 60, 15),
    ('50000000-0000-4000-a000-000000000012'::uuid, 'trainee.avn1.capacityconnect@example.com', '40000000-0000-4000-a000-000000000009'::uuid, 'completed', 100, 60, 15),
    ('50000000-0000-4000-a000-000000000013'::uuid, 'trainee.rdr5.capacityconnect@example.com', '40000000-0000-4000-a000-000000000002'::uuid, 'active', 35, 5, NULL::integer),
    ('50000000-0000-4000-a000-000000000014'::uuid, 'trainee.rdr6.capacityconnect@example.com', '40000000-0000-4000-a000-000000000003'::uuid, 'active', 39, 6, NULL::integer),
    ('50000000-0000-4000-a000-000000000015'::uuid, 'trainee.rdr7.capacityconnect@example.com', '40000000-0000-4000-a000-000000000004'::uuid, 'active', 43, 7, NULL::integer),
    ('50000000-0000-4000-a000-000000000016'::uuid, 'trainee.rdr8.capacityconnect@example.com', '40000000-0000-4000-a000-000000000005'::uuid, 'active', 47, 8, NULL::integer),
    ('50000000-0000-4000-a000-000000000017'::uuid, 'trainee.fst1.capacityconnect@example.com', '40000000-0000-4000-a000-000000000006'::uuid, 'active', 51, 9, NULL::integer),
    ('50000000-0000-4000-a000-000000000018'::uuid, 'trainee.fst2.capacityconnect@example.com', '40000000-0000-4000-a000-000000000007'::uuid, 'active', 55, 10, NULL::integer),
    ('50000000-0000-4000-a000-000000000019'::uuid, 'trainee.fst3.capacityconnect@example.com', '40000000-0000-4000-a000-000000000008'::uuid, 'active', 59, 11, NULL::integer),
    ('50000000-0000-4000-a000-000000000020'::uuid, 'trainee.fst4.capacityconnect@example.com', '40000000-0000-4000-a000-000000000009'::uuid, 'active', 63, 12, NULL::integer),
    ('50000000-0000-4000-a000-000000000021'::uuid, 'trainee.fst5.capacityconnect@example.com', '40000000-0000-4000-a000-000000000010'::uuid, 'active', 67, 13, NULL::integer),
    ('50000000-0000-4000-a000-000000000022'::uuid, 'trainee.fst6.capacityconnect@example.com', '40000000-0000-4000-a000-000000000001'::uuid, 'active', 71, 14, NULL::integer),
    ('50000000-0000-4000-a000-000000000023'::uuid, 'trainee.nwp1.capacityconnect@example.com', '40000000-0000-4000-a000-000000000002'::uuid, 'active', 75, 15, NULL::integer),
    ('50000000-0000-4000-a000-000000000024'::uuid, 'trainee.nwp2.capacityconnect@example.com', '40000000-0000-4000-a000-000000000004'::uuid, 'active', 79, 16, NULL::integer),
    ('50000000-0000-4000-a000-000000000025'::uuid, 'trainee.nwp3.capacityconnect@example.com', '40000000-0000-4000-a000-000000000004'::uuid, 'active', 83, 17, NULL::integer),
    ('50000000-0000-4000-a000-000000000026'::uuid, 'trainee.nwp4.capacityconnect@example.com', '40000000-0000-4000-a000-000000000005'::uuid, 'active', 87, 18, NULL::integer),
    ('50000000-0000-4000-a000-000000000027'::uuid, 'trainee.nwp5.capacityconnect@example.com', '40000000-0000-4000-a000-000000000004'::uuid, 'withdrawn', 15, 40, NULL::integer),
    ('50000000-0000-4000-a000-000000000028'::uuid, 'trainee.sat1.capacityconnect@example.com', '40000000-0000-4000-a000-000000000006'::uuid, 'withdrawn', 15, 41, NULL::integer),
    ('50000000-0000-4000-a000-000000000029'::uuid, 'trainee.sat2.capacityconnect@example.com', '40000000-0000-4000-a000-000000000007'::uuid, 'withdrawn', 15, 42, NULL::integer),
    ('50000000-0000-4000-a000-000000000030'::uuid, 'trainee.sat3.capacityconnect@example.com', '40000000-0000-4000-a000-000000000007'::uuid, 'withdrawn', 15, 43, NULL::integer)
) AS v(id, email, course_id, status, progress, enrolled_days, completed_days)
JOIN auth.users u ON u.email = v.email
ON CONFLICT (trainee_id, course_id) DO UPDATE SET status = EXCLUDED.status, progress_percentage = EXCLUDED.progress_percentage, completed_at = EXCLUDED.completed_at;

-- 15. MODULES & LESSONS & LESSON PROGRESS
INSERT INTO public.modules (id, course_id, title, description, position, sequence_order)
VALUES
  ('55000000-0000-4000-a000-000000000001', '40000000-0000-4000-a000-000000000001', 'Radar Fundamentals Module 1', 'Introduction to DWR hardware and signal processing', 1, 1),
  ('55000000-0000-4000-a000-000000000002', '40000000-0000-4000-a000-000000000003', 'NWP Fundamentals Module 1', 'Introduction to Atmospheric Numerical Modeling', 1, 1)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO public.lessons (id, module_id, title, description, lesson_type, position, sequence_order, is_required)
VALUES
  ('56000000-0000-4000-a000-000000000001', '55000000-0000-4000-a000-000000000001', 'DWR Signal Transmitters & Receivers', 'Hardware configuration and Doppler frequency shift principles', 'video', 1, 1, true),
  ('56000000-0000-4000-a000-000000000002', '55000000-0000-4000-a000-000000000002', 'Grid Resolution and Primitive Equations', 'Mathematical formulations of NWP grid models', 'pdf', 1, 1, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO public.lesson_progress (id, enrollment_id, lesson_id, is_completed, completed_at)
VALUES
  ('57000000-0000-4000-a000-000000000001', '50000000-0000-4000-a000-000000000001', '56000000-0000-4000-a000-000000000001', true, NOW() - INTERVAL '30 days'),
  ('57000000-0000-4000-a000-000000000002', '50000000-0000-4000-a000-000000000005', '56000000-0000-4000-a000-000000000002', true, NOW() - INTERVAL '20 days')
ON CONFLICT (enrollment_id, lesson_id) DO UPDATE SET is_completed = EXCLUDED.is_completed;

-- 16. ASSIGNMENTS (4 assignments)
INSERT INTO public.assignments (id, course_id, title, description, max_score, due_at, status, created_by, created_at)
SELECT v.id, v.course_id, v.title, v.description, v.max_score, v.due_at, 'published', u.id, v.created_at
FROM (
  VALUES
    ('60000000-0000-4000-a000-000000000001'::uuid, '40000000-0000-4000-a000-000000000001'::uuid, 'DWR Echo Analysis Case Study', 'Analyze severe squall line Doppler velocity images and identify mesocyclone signatures.', 100, NOW() + INTERVAL '10 days', 'trainer.radar.capacityconnect@example.com', NOW() - INTERVAL '30 days'),
    ('60000000-0000-4000-a000-000000000002'::uuid, '40000000-0000-4000-a000-000000000003'::uuid, 'NWP Model Diagnostics & Bias Analysis', 'Evaluate GFS precipitation forecast against AWS station observations for monsoon heavy rainfall.', 100, NOW() + INTERVAL '15 days', 'trainer.nwp.capacityconnect@example.com', NOW() - INTERVAL '25 days'),
    ('60000000-0000-4000-a000-000000000003'::uuid, '40000000-0000-4000-a000-000000000005'::uuid, 'INSAT-3D RGB Composite Interpretation', 'Differentiate fog/stratus from high convective clouds using multi-channel imagery.', 100, NOW() + INTERVAL '20 days', 'trainer.satellite.capacityconnect@example.com', NOW() - INTERVAL '20 days'),
    ('60000000-0000-4000-a000-000000000004'::uuid, '40000000-0000-4000-a000-000000000008'::uuid, 'Python Xarray & NetCDF Grid Processing', 'Write a Python script to compute 500 hPa vorticity advection using MetPy.', 100, NOW() + INTERVAL '25 days', 'trainer.python.capacityconnect@example.com', NOW() - INTERVAL '15 days')
) AS v(id, course_id, title, description, max_score, due_at, trainer_email, created_at)
JOIN auth.users u ON u.email = v.trainer_email
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, max_score = EXCLUDED.max_score, due_at = EXCLUDED.due_at, status = EXCLUDED.status, created_by = EXCLUDED.created_by;

-- 17. ASSIGNMENT SUBMISSIONS (8 records resolved by email)
INSERT INTO public.assignment_submissions (assignment_id, trainee_id, submission_text, status, score, feedback, evaluated_by, evaluated_at, submitted_at)
SELECT v.assignment_id, ut.id, v.submission_text, v.status, v.score, v.feedback, ue.id, CASE WHEN ue.id IS NOT NULL THEN NOW() - INTERVAL '5 days' ELSE NULL END, NOW() - INTERVAL '12 days'
FROM (
  VALUES
    ('60000000-0000-4000-a000-000000000001'::uuid, 'trainee.rdr1.capacityconnect@example.com', 'Detailed analysis of Doppler radar reflectivity profiles and gust front boundaries.', 'evaluated', 92, 'Excellent identification of gust front velocity convergence.', 'trainer.radar.capacityconnect@example.com'),
    ('60000000-0000-4000-a000-000000000001'::uuid, 'trainee.rdr2.capacityconnect@example.com', 'Mesocyclone rotation shear calculation and warning product generation draft.', 'evaluated', 88, 'Good work on shear calculation.', 'trainer.radar.capacityconnect@example.com'),
    ('60000000-0000-4000-a000-000000000002'::uuid, 'trainee.nwp1.capacityconnect@example.com', 'Precipitation forecast error analysis using NCUM model outputs.', 'evaluated', 85, 'Solid statistical evaluation.', 'trainer.nwp.capacityconnect@example.com'),
    ('60000000-0000-4000-a000-000000000004'::uuid, 'trainee.fst2.capacityconnect@example.com', 'Jupyter notebook script calculating geostrophic wind and thermal advection.', 'evaluated', 95, 'Clean Python code using MetPy.', 'trainer.python.capacityconnect@example.com'),
    ('60000000-0000-4000-a000-000000000001'::uuid, 'trainee.rdr3.capacityconnect@example.com', 'Reflectivity core tilt analysis during severe convective storm event.', 'submitted', NULL::numeric, NULL, NULL),
    ('60000000-0000-4000-a000-000000000003'::uuid, 'trainee.sat1.capacityconnect@example.com', 'INSAT-3D night fog cloud mask derivation report.', 'submitted', NULL::numeric, NULL, NULL),
    ('60000000-0000-4000-a000-000000000002'::uuid, 'trainee.nwp2.capacityconnect@example.com', 'Initial NWP grid point verification submission.', 'resubmission_required', 55, 'Please re-run the verification matrix using continuous skill scores (RMSE and Threat Score).', 'trainer.nwp.capacityconnect@example.com'),
    ('60000000-0000-4000-a000-000000000004'::uuid, 'trainee.fst1.capacityconnect@example.com', 'MetPy script upload attempt 1.', 'resubmission_required', 50, 'Script fails on missing dimension coordinates. Please fix NetCDF index slicing.', 'trainer.python.capacityconnect@example.com')
) AS v(assignment_id, trainee_email, submission_text, status, score, feedback, eval_email)
JOIN auth.users ut ON ut.email = v.trainee_email
LEFT JOIN auth.users ue ON ue.email = v.eval_email
ON CONFLICT (assignment_id, trainee_id) DO UPDATE SET status = EXCLUDED.status, score = EXCLUDED.score, feedback = EXCLUDED.feedback, evaluated_by = EXCLUDED.evaluated_by, evaluated_at = EXCLUDED.evaluated_at;

-- 18. CERTIFICATES (6 records resolved by email)
INSERT INTO public.certificates (id, trainee_id, course_id, enrollment_id, certificate_number, verification_code, issued_at, revoked_at, revocation_reason)
SELECT v.id, u.id, v.course_id, v.enrollment_id, v.cert_no, v.ver_code, NOW() - (v.issued_days || ' days')::interval, CASE WHEN v.revoked_days IS NOT NULL THEN NOW() - (v.revoked_days || ' days')::interval ELSE NULL END, v.rev_reason
FROM (
  VALUES
    ('61000000-0000-4000-a000-000000000001'::uuid, 'trainee.rdr1.capacityconnect@example.com', '40000000-0000-4000-a000-000000000001'::uuid, '50000000-0000-4000-a000-000000000001'::uuid, 'CERT-IMD-DWR-2026-001', 'VER-DWR-001-XYZ', 30, NULL, NULL),
    ('61000000-0000-4000-a000-000000000002'::uuid, 'trainee.rdr2.capacityconnect@example.com', '40000000-0000-4000-a000-000000000001'::uuid, '50000000-0000-4000-a000-000000000002'::uuid, 'CERT-IMD-DWR-2026-002', 'VER-DWR-002-XYZ', 30, NULL, NULL),
    ('61000000-0000-4000-a000-000000000003'::uuid, 'trainee.nwp1.capacityconnect@example.com', '40000000-0000-4000-a000-000000000003'::uuid, '50000000-0000-4000-a000-000000000005'::uuid, 'CERT-IMD-NWP-2026-001', 'VER-NWP-001-ABC', 20, NULL, NULL),
    ('61000000-0000-4000-a000-000000000004'::uuid, 'trainee.sat1.capacityconnect@example.com', '40000000-0000-4000-a000-000000000005'::uuid, '50000000-0000-4000-a000-000000000008'::uuid, 'CERT-IMD-SAT-2026-001', 'VER-SAT-001-DEF', 15, NULL, NULL),
    ('61000000-0000-4000-a000-000000000005'::uuid, 'trainee.fst1.capacityconnect@example.com', '40000000-0000-4000-a000-000000000007'::uuid, '50000000-0000-4000-a000-000000000010'::uuid, 'CERT-IMD-VER-2026-001', 'VER-VER-001-GHI', 15, NULL, NULL),
    ('61000000-0000-4000-a000-000000000006'::uuid, 'trainee.rdr3.capacityconnect@example.com', '40000000-0000-4000-a000-000000000001'::uuid, '50000000-0000-4000-a000-000000000003'::uuid, 'CERT-IMD-DWR-2026-003', 'VER-DWR-003-REV', 30, 5, 'Administrative audit: Duplicate enrollment profile detected')
) AS v(id, email, course_id, enrollment_id, cert_no, ver_code, issued_days, revoked_days, rev_reason)
JOIN auth.users u ON u.email = v.email
ON CONFLICT (trainee_id, course_id) DO UPDATE SET certificate_number = EXCLUDED.certificate_number, verification_code = EXCLUDED.verification_code, issued_at = EXCLUDED.issued_at, revoked_at = EXCLUDED.revoked_at, revocation_reason = EXCLUDED.revocation_reason;

-- 19. COURSE FEEDBACK (12 records resolved by email)
INSERT INTO public.course_feedback (course_id, trainee_id, trainer_id, course_rating, comments, created_at)
SELECT v.course_id, ut.id, ur.id, v.rating, v.comment, NOW() - INTERVAL '14 days'
FROM (
  VALUES
    ('40000000-0000-4000-a000-000000000001'::uuid, 'trainee.rdr1.capacityconnect@example.com', 'trainer.radar.capacityconnect@example.com', 5, 'Outstanding practical walkthrough on Doppler velocity interpretation and mesocyclone tracking.'),
    ('40000000-0000-4000-a000-000000000001'::uuid, 'trainee.rdr2.capacityconnect@example.com', 'trainer.radar.capacityconnect@example.com', 5, 'Hands-on radar lab exercises were exceptionally valuable for operational storm warnings.'),
    ('40000000-0000-4000-a000-000000000001'::uuid, 'trainee.rdr3.capacityconnect@example.com', 'trainer.radar.capacityconnect@example.com', 4, 'Good coverage of dual-polarization products. Request more time on hydrometeor classification.'),
    ('40000000-0000-4000-a000-000000000001'::uuid, 'trainee.rdr4.capacityconnect@example.com', 'trainer.radar.capacityconnect@example.com', 4, 'Well organized course material. DWR signal processing explanation was very clear.'),
    ('40000000-0000-4000-a000-000000000003'::uuid, 'trainee.nwp1.capacityconnect@example.com', 'trainer.nwp.capacityconnect@example.com', 5, 'Thorough explanation of NWP primitive equations and operational model parameterization.'),
    ('40000000-0000-4000-a000-000000000003'::uuid, 'trainee.nwp2.capacityconnect@example.com', 'trainer.nwp.capacityconnect@example.com', 3, 'Pacing was quite fast on data assimilation techniques. Need supplementary tutorial notebooks.'),
    ('40000000-0000-4000-a000-000000000003'::uuid, 'trainee.nwp3.capacityconnect@example.com', 'trainer.nwp.capacityconnect@example.com', 4, 'Model interpretation guidance was practical and directly applicable to daily forecasting.'),
    ('40000000-0000-4000-a000-000000000005'::uuid, 'trainee.sat1.capacityconnect@example.com', 'trainer.satellite.capacityconnect@example.com', 5, 'INSAT-3D channel combination hands-on session was excellent.'),
    ('40000000-0000-4000-a000-000000000005'::uuid, 'trainee.sat2.capacityconnect@example.com', 'trainer.satellite.capacityconnect@example.com', 4, 'Clear guidance on derived wind vectors and atmospheric soundings.'),
    ('40000000-0000-4000-a000-000000000007'::uuid, 'trainee.fst1.capacityconnect@example.com', 'trainer.verification.capacityconnect@example.com', 4, 'Forecast verification skill metrics were clearly demystified.'),
    ('40000000-0000-4000-a000-000000000008'::uuid, 'trainee.fst2.capacityconnect@example.com', 'trainer.python.capacityconnect@example.com', 5, 'MetPy and PyART integration tutorials were top quality.'),
    ('40000000-0000-4000-a000-000000000009'::uuid, 'trainee.avn1.capacityconnect@example.com', 'trainer.aviation.capacityconnect@example.com', 4, 'Comprehensive overview of ICAO aviation codes and SIGMET warning protocols.')
) AS v(course_id, email, trainer_email, rating, comment)
JOIN auth.users ut ON ut.email = v.email
LEFT JOIN auth.users ur ON ur.email = v.trainer_email
ON CONFLICT (trainee_id, course_id) DO UPDATE SET course_rating = EXCLUDED.course_rating, comments = EXCLUDED.comments, trainer_id = EXCLUDED.trainer_id;

-- 20. KNOWLEDGE RESOURCES (7 records resolved by email)
INSERT INTO public.knowledge_resources (id, title, description, resource_type, category, storage_path, external_url, uploaded_by, competency_id, course_id, status, review_reason, reviewed_by, reviewed_at, created_at)
SELECT v.id, v.title, 'Operational reference resource', v.resource_type, v.category, v.storage_path, v.external_url, uu.id, v.competency_id, v.course_id, v.status, v.review_reason, ur.id, CASE WHEN ur.id IS NOT NULL THEN NOW() - INTERVAL '10 days' ELSE NULL END, NOW() - INTERVAL '30 days'
FROM (
  VALUES
    ('70000000-0000-4000-a000-000000000001'::uuid, 'Standard Operating Procedure for DWR Severe Weather Warnings', 'sop', 'Radar Operations', 'sop/dwr_warning_sop_2026.pdf', NULL, 'trainer.radar.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, '40000000-0000-4000-a000-000000000001'::uuid, 'approved', 'Reviewed and verified by Radar Operations Head.', 'admin.capacityconnect@example.com'),
    ('70000000-0000-4000-a000-000000000002'::uuid, 'Dual-Polarization Radar Hydrometeor Identification Guide', 'guide', 'Radar Operations', 'guides/dual_pol_guide.pdf', NULL, 'trainer.radar.capacityconnect@example.com', '30000000-0000-4000-a000-000000000002'::uuid, '40000000-0000-4000-a000-000000000002'::uuid, 'approved', 'Approved for operational dissemination.', 'admin.capacityconnect@example.com'),
    ('70000000-0000-4000-a000-000000000003'::uuid, 'NCUM & GFS Model Physics Parameterization Manual', 'document', 'NWP', 'manuals/nwp_model_physics.pdf', NULL, 'trainer.nwp.capacityconnect@example.com', '30000000-0000-4000-a000-000000000003'::uuid, '40000000-0000-4000-a000-000000000003'::uuid, 'approved', 'Verified by NWP Division.', 'admin.capacityconnect@example.com'),
    ('70000000-0000-4000-a000-000000000004'::uuid, 'MetPy & PyART Jupyter Notebook Collection for Met Data', 'guide', 'Data & Analytics', NULL, 'https://github.com/imd-demo/metpy-pyart-notebooks', 'trainer.python.capacityconnect@example.com', '30000000-0000-4000-a000-000000000009'::uuid, '40000000-0000-4000-a000-000000000008'::uuid, 'approved', 'Open source repository verified.', 'admin.capacityconnect@example.com'),
    ('70000000-0000-4000-a000-000000000005'::uuid, 'INSAT-3DS Sounder Atmospheric Profile Interpretation Note', 'operational_note', 'Satellite Operations', 'notes/insat3ds_sounder_note.pdf', NULL, 'trainer.satellite.capacityconnect@example.com', '30000000-0000-4000-a000-000000000005'::uuid, '40000000-0000-4000-a000-000000000005'::uuid, 'pending', NULL, NULL),
    ('70000000-0000-4000-a000-000000000006'::uuid, 'Draft Unverified Tropical Cyclone Intensity Matrix', 'operational_note', 'Forecasting', 'notes/draft_tc_matrix.pdf', NULL, 'trainee.fst1.capacityconnect@example.com', '30000000-0000-4000-a000-000000000008'::uuid, NULL::uuid, 'rejected', 'Contains uncalibrated empirical formulas. Please revise with official RSMC manual.', 'admin.capacityconnect@example.com'),
    ('70000000-0000-4000-a000-000000000007'::uuid, 'Legacy Analogue Radar Calibration Chart (Superceded 2018)', 'document', 'Radar Operations', 'legacy/analogue_radar_2018.pdf', NULL, 'trainer.radar.capacityconnect@example.com', '30000000-0000-4000-a000-000000000001'::uuid, NULL::uuid, 'archived', 'Superceded by digital DWR calibration system.', 'admin.capacityconnect@example.com')
) AS v(id, title, resource_type, category, storage_path, external_url, uploader_email, competency_id, course_id, status, review_reason, reviewer_email)
JOIN auth.users uu ON uu.email = v.uploader_email
LEFT JOIN auth.users ur ON ur.email = v.reviewer_email
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, title = EXCLUDED.title;

-- 21. DEVELOPMENT PLANS (6 plans resolved by trainee_id)
INSERT INTO public.development_plans (id, trainee_id, title, status, source, start_date, created_at, updated_at)
SELECT v.id, u.id, v.title, 'active', 'system', CURRENT_DATE - 40, NOW() - INTERVAL '40 days', NOW()
FROM (
  VALUES
    ('80000000-0000-4000-a000-000000000001'::uuid, 'trainee.rdr1.capacityconnect@example.com', 'Competency Advancement Plan for Radar Operations (1)'),
    ('80000000-0000-4000-a000-000000000002'::uuid, 'trainee.rdr2.capacityconnect@example.com', 'Competency Advancement Plan for Radar Operations (2)'),
    ('80000000-0000-4000-a000-000000000003'::uuid, 'trainee.rdr3.capacityconnect@example.com', 'Competency Advancement Plan for Radar Operations (3)'),
    ('80000000-0000-4000-a000-000000000004'::uuid, 'trainee.rdr4.capacityconnect@example.com', 'Competency Advancement Plan for Radar Operations (4)'),
    ('80000000-0000-4000-a000-000000000005'::uuid, 'trainee.rdr5.capacityconnect@example.com', 'Competency Advancement Plan for Radar Operations (5)'),
    ('80000000-0000-4000-a000-000000000006'::uuid, 'trainee.rdr6.capacityconnect@example.com', 'Competency Advancement Plan for Radar Operations (6)')
) AS v(id, email, title)
JOIN auth.users u ON u.email = v.email
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status;

-- 22. DEVELOPMENT PLAN ITEMS (10 items audited with snapshot scores)
INSERT INTO public.development_plan_items (id, plan_id, competency_id, current_score_snapshot, target_score_snapshot, gap_score_snapshot, priority, sequence_order, status, rationale, created_at)
VALUES
  ('81000000-0000-4000-a000-000000000001', '80000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000001', 42, 85, 43, 'critical', 1, 'completed', 'Complete Doppler Weather Radar Fundamentals', NOW() - INTERVAL '30 days'),
  ('81000000-0000-4000-a000-000000000002', '80000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000002', 48, 85, 37, 'high', 2, 'in_progress', 'Enroll in Advanced Radar Product Interpretation', NOW() - INTERVAL '30 days'),
  ('81000000-0000-4000-a000-000000000003', '80000000-0000-4000-a000-000000000002', '30000000-0000-4000-a000-000000000001', 48, 85, 37, 'critical', 1, 'completed', 'Complete Doppler Weather Radar Fundamentals', NOW() - INTERVAL '30 days'),
  ('81000000-0000-4000-a000-000000000004', '80000000-0000-4000-a000-000000000002', '30000000-0000-4000-a000-000000000007', 60, 80, 20, 'medium', 2, 'in_progress', 'Conduct Radar Verification Exercises', NOW() - INTERVAL '30 days'),
  ('81000000-0000-4000-a000-000000000005', '80000000-0000-4000-a000-000000000003', '30000000-0000-4000-a000-000000000002', 53, 85, 32, 'high', 1, 'in_progress', 'Complete Advanced Radar Product Interpretation', NOW() - INTERVAL '30 days'),
  ('81000000-0000-4000-a000-000000000006', '80000000-0000-4000-a000-000000000004', '30000000-0000-4000-a000-000000000001', 57, 85, 28, 'critical', 1, 'pending', 'Radar Echo Interpretation Mentorship with Senior Trainer', NOW() - INTERVAL '30 days'),
  ('81000000-0000-4000-a000-000000000007', '80000000-0000-4000-a000-000000000005', '30000000-0000-4000-a000-000000000003', 57, 85, 28, 'high', 1, 'completed', 'Complete Numerical Weather Prediction Fundamentals', NOW() - INTERVAL '30 days'),
  ('81000000-0000-4000-a000-000000000008', '80000000-0000-4000-a000-000000000005', '30000000-0000-4000-a000-000000000004', 63, 80, 17, 'medium', 2, 'in_progress', 'Enroll in Operational NWP Model Interpretation', NOW() - INTERVAL '30 days'),
  ('81000000-0000-4000-a000-000000000009', '80000000-0000-4000-a000-000000000006', '30000000-0000-4000-a000-000000000003', 63, 85, 22, 'high', 1, 'in_progress', 'NWP Model Grid Diagnostics Workshop', NOW() - INTERVAL '30 days'),
  ('81000000-0000-4000-a000-000000000010', '80000000-0000-4000-a000-000000000006', '30000000-0000-4000-a000-000000000009', 55, 75, 20, 'medium', 2, 'pending', 'Complete Python for Meteorological Data Analysis', NOW() - INTERVAL '30 days')
ON CONFLICT (plan_id, competency_id) DO UPDATE SET current_score_snapshot = EXCLUDED.current_score_snapshot, target_score_snapshot = EXCLUDED.target_score_snapshot, gap_score_snapshot = EXCLUDED.gap_score_snapshot, priority = EXCLUDED.priority, status = EXCLUDED.status, rationale = EXCLUDED.rationale;

-- 23. ANNOUNCEMENTS (2 records)
INSERT INTO public.announcements (id, title, message, audience_type, priority, status, created_by, published_at, created_at)
SELECT v.id, v.title, v.message, 'all', 'normal', 'published', u.id, NOW() - (v.days_ago || ' days')::interval, NOW() - (v.days_ago || ' days')::interval
FROM (
  VALUES
    ('90000000-0000-4000-a000-000000000001'::uuid, 'National Severe Weather Radar Training Initiative 2026', 'All Radar Operations personnel are scheduled for DWR Advanced Product Interpretation refresher courses starting next month.', 'admin.capacityconnect@example.com', 10),
    ('90000000-0000-4000-a000-000000000002'::uuid, 'NWP Ensemble Forecasting Workshop Announcement', 'Specialized workshop on high-resolution ensemble model guidance for heavy rainfall events.', 'admin.capacityconnect@example.com', 5)
) AS v(id, title, message, author_email, days_ago)
JOIN auth.users u ON u.email = v.author_email
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, message = EXCLUDED.message, priority = EXCLUDED.priority, status = EXCLUDED.status;

-- 24. NOTIFICATIONS (2 records)
INSERT INTO public.notifications (id, user_id, type, title, message, priority, is_read, created_at)
SELECT v.id, u.id, v.type, v.title, v.message, 'normal', v.is_read, NOW() - (v.days_ago || ' days')::interval
FROM (
  VALUES
    ('91000000-0000-4000-a000-000000000001'::uuid, 'trainee.rdr1.capacityconnect@example.com', 'course_assignment', 'Assignment Feedback Available', 'Your submission for DWR Echo Analysis Case Study has been evaluated by Demo Radar Lead Trainer.', false, 2),
    ('91000000-0000-4000-a000-000000000002'::uuid, 'trainee.nwp1.capacityconnect@example.com', 'course_completed', 'Certificate Issued', 'Your certificate for Numerical Weather Prediction Fundamentals is now available in your profile.', true, 15)
) AS v(id, target_email, type, title, message, is_read, days_ago)
JOIN auth.users u ON u.email = v.target_email
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, message = EXCLUDED.message, is_read = EXCLUDED.is_read;

COMMIT;
