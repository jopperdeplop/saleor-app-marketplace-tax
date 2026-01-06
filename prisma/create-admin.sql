-- Create admin user with bcrypt hashed password
-- Email: admin@salp.shop
-- Password: Admin123!
-- Hash: $2b$10$YTtDxS8a5BFJ2mIE8ScBKueWbn7eezDdZA8qWKyUZTCNmbH80V8NC

INSERT INTO "AdminUser" (id, email, password, name, "createdAt", "updatedAt")
VALUES (
  'admin_default_001',
  'admin@salp.shop',
  '$2b$10$YTtDxS8a5BFJ2mIE8ScBKueWbn7eezDdZA8qWKyUZTCNmbH80V8NC',
  'Admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
