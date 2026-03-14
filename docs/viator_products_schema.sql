CREATE TABLE IF NOT EXISTS viator_products (
  product_code text PRIMARY KEY,
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE viator_products IS 'Full Viator product JSON for v3 explore tours; ingest from POST /products/bulk. Used by explore tour detail page and SEO generation script.';

CREATE INDEX IF NOT EXISTS idx_viator_products_updated_at
  ON viator_products(updated_at);
