-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  price NUMERIC DEFAULT 8.99 -- Default price for regular size
);

-- Create discounts table
CREATE TABLE discounts (
  code TEXT PRIMARY KEY,
  discount_percentage INT NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  is_active BOOLEAN DEFAULT true
);

-- Create orders table
CREATE TABLE orders (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  shipping_address JSONB,
  total_amount NUMERIC NOT NULL,
  stripe_session_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped')),
  cart_items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Allow public read access on products" ON products
  FOR SELECT USING (is_active = true);

-- Policies for discounts
CREATE POLICY "Allow public read access on discounts" ON discounts
  FOR SELECT USING (is_active = true);

-- Policies for orders
-- For MVP, we'll allow insertion from the service role or API route
-- We restrict SELECT to only the user's email if we had auth, but since it's guest checkout:
CREATE POLICY "Allow service role full access on orders" ON orders
  FOR ALL TO service_role USING (true);

-- Insert some dummy products
INSERT INTO products (name, image_url) VALUES
('Preppy Bow Sticker', 'https://placehold.co/400x400/000080/FFFFFF?text=Preppy+Bow'),
('Tennis Life Sticker', 'https://placehold.co/400x400/000080/FFFFFF?text=Tennis+Life'),
('Stay Golden Sticker', 'https://placehold.co/400x400/000080/FFFFFF?text=Stay+Golden');

-- Insert a test discount
INSERT INTO discounts (code, discount_percentage) VALUES ('WELCOME10', 10);
