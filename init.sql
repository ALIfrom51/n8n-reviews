CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  text VARCHAR(1000) NOT NULL,
  sentiment VARCHAR(50) NOT NULL,
  channel VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sentiment ON reviews(sentiment);
CREATE INDEX idx_created_at ON reviews(created_at);