export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ message: "Missing Supabase environment variables" });
    }
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
      },
    });
    if (!response.ok) {
      return res.status(500).json({ message: `Supabase ping failed: ${response.status}` });
    }
    return res.status(200).json({ message: "Supabase pinged" });
  } catch (error) {
    return res.status(500).json({ message: error?.message || "Supabase ping failed" });
  }
}
