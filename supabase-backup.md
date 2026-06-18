For Roles
supabase db dump --db-url [CONNECTION_STRING] -f roles.sql --role-only

For Schemas
supabase db dump --db-url [CONNECTION_STRING] -f schema.sql

For DB and Storage
supabase db dump --db-url [CONNECTION_STRING] -f data.sql --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
