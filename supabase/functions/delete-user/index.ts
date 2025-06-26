import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Use service role key for admin actions
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get the user from the JWT
  const authHeader = req.headers.get("Authorization");
  const jwt = authHeader?.replace("Bearer ", "");
  if (!jwt) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
  if (!user || userError) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Delete user data from your tables
  await supabaseClient.from("api_connections").delete().eq("user_id", user.id);
  await supabaseClient.from("user_analytics_properties").delete().eq("user_id", user.id);
  // Add more deletes for other user tables as needed

  // Delete the user from auth.users
  const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}); 