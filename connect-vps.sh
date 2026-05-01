# ssh -N -L 5432:10.0.1.10:5432 root@5.189.138.167
# supabase connectivity and its container ip is "10.0.1.10", it may changes

# ssh -N -L 5432:10.0.1.8:6379 root@5.189.138.167
# redis connectivity and its container ip is "10.0.1.8", it may changes. This is for local development

# ssh -N -L 6379:10.0.1.8:6379 -L 5432:10.0.1.10:5432 root@5.189.138.167
# both supabase and redis connectivity and its container ip is "10.0.1.10" and "10.0.1.8", it may changes. This is for local development

# ssh -N -L 6379:10.0.1.23:6379 -L 5432:10.0.2.6:5432 root@45.88.189.43