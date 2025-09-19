BEGIN;
DROP TYPE IF EXISTS LevelType CASCADE;
DROP TYPE IF EXISTS LevelDifficulty CASCADE;
DROP TYPE IF EXISTS LevelLength CASCADE;
DROP TYPE IF EXISTS ProgressStatus CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS levels CASCADE;
DROP TABLE IF EXISTS progress CASCADE;
COMMIT;

BEGIN;
CREATE TYPE LevelType AS ENUM (
  'Classic',
  'Platformer'
);

CREATE TYPE LevelRating AS ENUM (
  'Rated',
  'Featured',
  'Epic',
  'Legendary',
  'Mythic'
);

CREATE TYPE LevelDifficulty AS ENUM (
  'N/A',
  'Auto',
  'Easy',
  'Medium',
  'Hard',
  'Harder',
  'Insane',
  'Easy Demon',
  'Medium Demon',
  'Hard Demon',
  'Insane Demon',
  'Extreme Demon'
);

CREATE TYPE LevelLength AS ENUM (
  'Tiny',
  'Short',
  'Medium',
  'Long',
  'XL',
  'Platformer'
);

CREATE TYPE ProgressStatus AS ENUM (
  'To Try',
  'In Progress',
  'Completed',
  'Dropped'
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  bio TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS songs (
  id SERIAL PRIMARY KEY,
  geometry_dash_id INTEGER NOT NULL UNIQUE, -- negative for offical songs
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  geometry_dash_id INTEGER NOT NULL UNIQUE,
  type LevelType NOT NULL,
  name TEXT NOT NULL,
  publisher TEXT NOT NULL,
  publisher_id INTEGER REFERENCES users(id),
  description TEXT,
  difficulty LevelDifficulty NOT NULL,
  length LevelLength,
  song_id INTEGER REFERENCES songs(id),
  release_date DATE,
  video_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  level_id INTEGER REFERENCES levels(id),
  status ProgressStatus NOT NULL,
  completion_pct SMALLINT,
  completion_time INTEGER,
  total_attempts INTEGER,
  start_date DATE,
  complete_date DATE,
  enjoyment_rating SMALLINT,
  video_url TEXT,
  review TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, level_id)
);
COMMIT;
