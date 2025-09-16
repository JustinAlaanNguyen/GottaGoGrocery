import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // forward request to backend
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/grocery-list/email`, req.body);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error("Proxy error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: "Failed to proxy request" });
  }
}
