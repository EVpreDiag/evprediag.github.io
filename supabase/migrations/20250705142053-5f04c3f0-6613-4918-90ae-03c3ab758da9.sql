-- Fix the trigger to only use raw_user_meta_data (user_metadata doesn't exist)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  station_id_value TEXT;
BEGIN
  -- Get the station_id from raw_user_meta_data only
  station_id_value := NEW.raw_user_meta_data->>'station_id';
  
  INSERT INTO public.profiles (id, username, full_name, station_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN station_id_value IS NOT NULL AND station_id_value != '' 
      THEN station_id_value::uuid 
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;