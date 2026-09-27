-- Initial seed: real, verified entries only (no placeholder/example
-- companies on the live site — manual-review trust bar applies from day
-- one). Fictional examples stay in the local artifact prototype, not here.
-- "solution" entity_type is intentionally seeded empty until a real,
-- verified company is added by hand.

do $$
declare
  e_id uuid;
begin

  -- OpenAQ
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('data_source', 'OpenAQ', 'https://openaq.org',
    'Real-time and historical air quality measurements aggregated from government and research monitors worldwide.',
    'published', current_date,
    '{"access_method":"api","license":"CC BY 4.0"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug = 'air-quality';
  insert into entity_sectors (entity_id, sector_id) select e_id, id from sectors where slug in ('real-estate','retail-cpg');

  -- IMF PortWatch
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('data_source', 'IMF PortWatch', 'https://portwatch.imf.org',
    'Near-real-time tracking of global port activity and shipping traffic to monitor trade disruption and supply chain exposure.',
    'published', current_date,
    '{"access_method":"portal","license":"Public"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug = 'supply-chain';
  insert into entity_sectors (entity_id, sector_id) select e_id, id from sectors where slug in ('logistics-supply-chain','finance-esg');

  -- World Bank Carbon Pricing Dashboard
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('data_source', 'World Bank Carbon Pricing Dashboard', 'https://carbonpricingdashboard.worldbank.org',
    'Country-by-country carbon tax and emissions trading scheme data, coverage, and price levels.',
    'published', current_date,
    '{"access_method":"portal","license":"CC BY 4.0"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug = 'energy-emissions';
  insert into entity_sectors (entity_id, sector_id) select e_id, id from sectors where slug = 'finance-esg';

  -- NOAA NCEI
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('data_source', 'NOAA National Centers for Environmental Information', 'https://www.ncei.noaa.gov',
    'Long-running archive of weather, climate, and ocean observation records for the United States and beyond.',
    'published', current_date,
    '{"access_method":"api / portal","license":"Public domain"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug in ('weather-projections','climate-hazards');
  insert into entity_sectors (entity_id, sector_id) select e_id, id from sectors where slug in ('insurance','agriculture');

  -- WRI Data Explorer
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('data_source', 'WRI Data Explorer', 'https://datasets.wri.org',
    'Curated environmental and resource datasets from the World Resources Institute, spanning forests, water, and land use.',
    'published', current_date,
    '{"access_method":"portal","license":"Varies by dataset"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug in ('land-agriculture','biodiversity');
  insert into entity_sectors (entity_id, sector_id) select e_id, id from sectors where slug = 'agriculture';

  -- FEWS NET
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('data_source', 'FEWS NET Agroclimatology', 'https://fews.net/data/agroclimatology-data',
    'Rainfall, temperature, and vegetation data used to monitor food security and drought risk across vulnerable regions.',
    'published', current_date,
    '{"access_method":"download","license":"Public"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug in ('land-agriculture','climate-hazards');
  insert into entity_sectors (entity_id, sector_id) select e_id, id from sectors where slug = 'agriculture';

  -- JRC Flood Hazard Maps
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('data_source', 'JRC European Flood Hazard Maps', 'https://data.jrc.ec.europa.eu',
    'Continental flood depth and extent layers at multiple return periods, built for fast windowed reads.',
    'published', current_date,
    '{"access_method":"cloud-optimized geotiff","license":"No restriction"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug = 'climate-hazards';
  insert into entity_sectors (entity_id, sector_id) select e_id, id from sectors where slug in ('insurance','real-estate');

  -- Global Commons Alliance
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('initiative', 'Global Commons Alliance', 'https://globalcommonsalliance.org',
    'A coalition of research bodies, media, and advocacy groups working together on systemic environmental change.',
    'published', current_date,
    '{"scope":"global coalition"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug = 'advocacy-coalitions';

  -- Science Based Targets Network
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('organization', 'Science Based Targets Network', 'https://sciencebasedtargetsnetwork.org',
    'Sets science-based standards and guidance for corporate environmental targets beyond carbon.',
    'published', current_date,
    '{"org_type":"standards body"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug = 'standards-frameworks';
  insert into entity_sectors (entity_id, sector_id) select e_id, id from sectors where slug = 'finance-esg';

  -- Project Drawdown
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('organization', 'Project Drawdown', 'https://drawdown.org',
    'Research organization identifying and ranking practical solutions to reduce greenhouse gas emissions.',
    'published', current_date,
    '{"org_type":"research/NGO"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug in ('natural-capital','energy-emissions');

  -- Naturebase
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('tool', 'Naturebase', 'https://www.naturebase.org',
    'Free mapping tool for estimating the carbon and biodiversity impact of nature-based projects at a given site.',
    'published', current_date,
    '{"platform":"web","pricing":"free"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug = 'natural-capital';
  insert into entity_sectors (entity_id, sector_id) select e_id, id from sectors where slug = 'finance-esg';

  -- Ecosystem Marketplace
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('organization', 'Ecosystem Marketplace', 'https://www.ecosystemmarketplace.com',
    'Market intelligence and reporting on voluntary carbon and ecosystem service markets.',
    'published', current_date,
    '{"org_type":"market intelligence"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug in ('energy-emissions','natural-capital');
  insert into entity_sectors (entity_id, sector_id) select e_id, id from sectors where slug = 'finance-esg';

  -- Climate Action Data Trust
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('data_source', 'Climate Action Data Trust', 'https://data.climateactiondata.org',
    'Federated registry linking carbon credit records across independent crediting programs for traceability.',
    'published', current_date,
    '{"access_method":"portal","license":"Public"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug in ('energy-emissions','standards-frameworks');
  insert into entity_sectors (entity_id, sector_id) select e_id, id from sectors where slug = 'finance-esg';

  -- Intrinsic Exchange Group
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('organization', 'Intrinsic Exchange Group', 'https://www.intrinsicexchange.com',
    'Creator of Natural Asset Companies, a financial vehicle that lets investors hold shares in the ecosystem services of a protected landscape.',
    'published', current_date,
    '{"org_type":"financial innovation"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug = 'natural-capital';
  insert into entity_sectors (entity_id, sector_id) select e_id, id from sectors where slug = 'finance-esg';

  -- UpLink
  insert into entities (entity_type, name, url, description, status, last_verified_at, attributes)
  values ('initiative', 'UpLink', 'https://uplink.weforum.org',
    'The World Economic Forum''s innovation platform connecting early-stage climate ventures with funding, investors, and industry partners through open challenges.',
    'published', current_date,
    '{"scope":"global innovation platform"}'::jsonb)
  returning id into e_id;
  insert into entity_topics (entity_id, topic_id) select e_id, id from topics where slug = 'entrepreneurship-support';

end $$;
