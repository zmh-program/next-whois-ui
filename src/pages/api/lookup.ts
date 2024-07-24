import type { NextApiRequest, NextApiResponse } from "next";
import { lookupWhois, WhoisAnalyzeResult } from "@/lib/whois";

type Data = {
  status: boolean;
  result?: WhoisAnalyzeResult;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { query } = req.query;

  if (!query || typeof query !== "string" || query.length === 0) {
    return res.status(400).json({ status: false, error: "Query is required" });
  }

  const { status, result, error } = await lookupWhois(query);
  if (!status) {
    return res.status(500).json({ status, error });
  }

  return res.status(200).json({ status, result });
}
