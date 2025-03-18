-- Create a function to execute SQL queries safely
CREATE OR REPLACE FUNCTION execute_sql(query text, params text[] DEFAULT '{}')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Only allow SELECT queries for security
  IF NOT (LOWER(TRIM(query)) LIKE 'select%') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;

  -- Execute the query with parameters
  EXECUTE query INTO result USING params;
  
  RETURN result;
END;
$$; 