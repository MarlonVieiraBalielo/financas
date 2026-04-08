import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xdtvcglsfzuzlccisuld.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_XHfOM3eqX92CySM6nWyqmg_HEueOKl3";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
