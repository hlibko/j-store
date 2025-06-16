-- Create enum type for cart status
CREATE TYPE cart_status AS ENUM ('OPEN', 'ORDERED');

-- Create carts table
CREATE TABLE carts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at DATE NOT NULL,
  updated_at DATE NOT NULL,
  status cart_status NOT NULL
);