# Migration: Add Cascade Delete to Dishes

## Migration SQL

Run this SQL in your database to add cascade delete:

```sql
-- Drop existing foreign key constraint
ALTER TABLE dishes DROP CONSTRAINT IF EXISTS dishes_category_id_fkey;

-- Add foreign key constraint with CASCADE delete
ALTER TABLE dishes 
ADD CONSTRAINT dishes_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(category_id) 
ON DELETE CASCADE;
```

## What This Does

- When a category is deleted, all related dishes will be automatically deleted by the database
- This ensures data integrity - no orphan dishes will remain
- The cascade happens at the database level, so it's safe and efficient

## Alternative: Using Prisma Migrate

If your database connection is working, you can run:

```bash
npx prisma migrate dev --name add_cascade_delete_to_dishes
```

This will automatically generate and apply the migration based on the schema changes.
