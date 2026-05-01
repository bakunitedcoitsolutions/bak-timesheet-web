# Using the IP copy your dump file to the VPS and run this command without loggin into vps
# scp full_db_supabase_dump.sql root@[IP_ADDRESS]:/root/full_db_supabase_dump.sql

# scp test_full_db_supabase_dump.sql root@45.88.189.43:/root/test_full_db_supabase_dump.sql

# Use this to get the supabase container name
# docker ps | grep supabase-db

# Use this to restore the database
# docker exec -i [CONTAINER_NAME] env PGPASSWORD=[PG_DB_PASSWORD] psql -U postgres -d postgres < /root/test_db_supabase_dump.sql

# docker exec -i supabase-db-pnqhqb9lylmcng9lm50frz42 env PGPASSWORD=RAolXSEVNe8N0hrgf1enF1ge4QjeI22s psql -U postgres -d postgres < /root/test_full_db_supabase_dump.sql

# # To know the ip of the containers
# docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' supabase-db-pnqhqb9lylmcng9lm50frz42

# docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' pghbgmtj7e7vfr1dxf0tg4mp