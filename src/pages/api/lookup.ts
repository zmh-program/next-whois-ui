import type { NextApiRequest, NextApiResponse } from "next";
import { lookupWhois } from "@/lib/whois/lookup";
import { WhoisAnalyzeResult } from "@/lib/whois/types";

type Data = {
  status: boolean;
  time: number;
  result?: WhoisAnalyzeResult;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { query } = req.query;

  if (!query || typeof query !== "string" || query.length === 0) {
    return res
      .status(400)
      .json({ time: -1, status: false, error: "Query is required" });
  }

  const { time, status, result, error } = await lookupWhois(query);
  if (!status) {
    return res.status(500).json({ time, status, error });
  }

  return res.status(200).json({ time, status, result });
}
