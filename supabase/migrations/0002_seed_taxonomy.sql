-- Locked topic and sector taxonomy (controlled vocabulary, shared across
-- every entity type). See project docs for how this was derived.

insert into topics (slug, label) values
  ('climate-hazards', 'Climate hazards & risk'),
  ('weather-projections', 'Weather & climate projections'),
  ('air-quality', 'Air quality & pollution'),
  ('biodiversity', 'Biodiversity & ecosystems'),
  ('water-resources', 'Water resources'),
  ('land-agriculture', 'Land use & agriculture'),
  ('energy-emissions', 'Energy & emissions'),
  ('oceans-marine', 'Oceans & marine'),
  ('natural-capital', 'Natural capital & nature-based solutions'),
  ('socioeconomic', 'Socioeconomic & development data'),
  ('supply-chain', 'Supply chain & trade exposure'),
  ('standards-frameworks', 'Standards & frameworks'),
  ('advocacy-coalitions', 'Advocacy & coalitions'),
  ('food-alt-protein', 'Food systems & alternative proteins'),
  ('circular-economy', 'Circular economy & materials'),
  ('carbon-removal', 'Carbon removal & storage'),
  ('entrepreneurship-support', 'Entrepreneurship & innovation support');

insert into sectors (slug, label) values
  ('real-estate', 'Real estate'),
  ('insurance', 'Insurance'),
  ('agriculture', 'Agriculture'),
  ('logistics-supply-chain', 'Logistics & supply chain'),
  ('energy', 'Energy'),
  ('finance-esg', 'Finance & ESG'),
  ('retail-cpg', 'Retail & CPG');
