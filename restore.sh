# Using the IP copy your dump file to the VPS and run this command without login into vps
scp new_full_db_supabase_dump.sql root@45.88.189.43:/root/new_full_db_supabase_dump.sql

# Use this to get the supabase container name
# docker ps | grep supabase-db

# Use this to restore the database
# docker exec -i [CONTAINER_NAME] env PGPASSWORD=[PG_DB_PASSWORD] psql -U postgres -d postgres < /root/test_db_supabase_dump.sql

# # To know the ip of the containers
# docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' [CONTAINER_NAME]

# docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' [CONTAINER_ID]