
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateStationRequest {
  station_name: string;
  station_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { station_name, station_id }: ValidateStationRequest = await req.json();

    console.log('Validating station:', { station_name, station_id });

    if (!station_name || !station_id) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Both station name and station ID are required' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Validate that the station exists with matching name and ID
    const { data: station, error } = await supabase
      .from('stations')
      .select('id, name')
      .eq('id', station_id)
      .eq('name', station_name)
      .single();

    if (error) {
      console.error('Station validation error:', error);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Station not found or name/ID combination is invalid' 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!station) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Station not found or name/ID combination is invalid' 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Station validation successful:', station);

    return new Response(
      JSON.stringify({ 
        valid: true, 
        station: { id: station.id, name: station.name } 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in validate-station function:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Internal server error during validation' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
