import { query } from './db.js';

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS weather_searches (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    country VARCHAR(255),
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

try {
  await query(createTableQuery);
  console.log('PostgreSQL table ready');
  process.exit(0);
} catch (error) {
  console.error('DB init failed:', error.message);
  process.exit(1);
}
