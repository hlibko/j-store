-- Create cart_items table
CREATE TABLE cart_items (
  cart_id UUID REFERENCES carts(id),
  product_id UUID NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (cart_id, product_id)
);