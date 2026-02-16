-- Give all users 10000 coins for testing the shop
UPDATE users SET coins = 10000 WHERE id IN (SELECT id FROM users LIMIT 10);

-- Display updated users
SELECT id, username, coins, equipped_table, equipped_card FROM users;
