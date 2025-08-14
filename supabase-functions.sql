
-- Create a function to execute SQL queries safely
CREATE OR REPLACE FUNCTION execute_sql(query_text TEXT)
RETURNS TABLE(result JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For security, only allow SELECT, INSERT, UPDATE, DELETE statements
  -- Block DDL statements like DROP, CREATE, ALTER
  IF query_text ~* '^(DROP|CREATE|ALTER|TRUNCATE|GRANT|REVOKE)' THEN
    RAISE EXCEPTION 'DDL statements are not allowed';
  END IF;
  
  -- Execute the query and return results
  RETURN QUERY EXECUTE format('SELECT to_jsonb(t) FROM (%s) t', query_text);
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Create a function to get table names
CREATE OR REPLACE FUNCTION get_table_names()
RETURNS TABLE(table_name TEXT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT t.table_name::TEXT
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_name;
$$;
