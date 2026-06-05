export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ message: "Missing Supabase environment variables" });
    }
    const tableName = process.env.SUPABASE_KEEPALIVE_TABLE || "keepalive";
    const encodedTable = encodeURIComponent(tableName);

    const response = await fetch(
      `${supabaseUrl}/rest/v1/${encodedTable}?select=*&limit=1`,
      {
        method: "GET",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return res
        .status(500)
        .json({ message: `Supabase ping failed: ${response.status}`, error: errorBody });
    }
    return res.status(200).json({ message: "Supabase pinged" });
  } catch (error) {
    return res.status(500).json({ message: error?.message || "Supabase ping failed" });
  }
}