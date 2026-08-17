DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I.%I TO anon, authenticated', r.schemaname, r.tablename);
    EXECUTE format('GRANT ALL ON %I.%I TO service_role', r.schemaname, r.tablename);
  END LOOP;
END $$;