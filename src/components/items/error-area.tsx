import { useClipboard } from "@/lib/utils";
import { CircleX, CopyIcon } from "lucide-react";
import React from "react";

export type ErrorAreaProps = {
  error?: string;
};

export default function ErrorArea({ error }: ErrorAreaProps) {
  const copy = useClipboard();
  const errorText = error || "An error occurred";

  return (
    <div
      className={`flex flex-col items-center w-full h-fit mt-2 p-2 border border-red-500 rounded-md text-red-500`}
    >
      <div className={`text-md inline-flex flex-row items-center`}>
        <CircleX className={`w-3.5 h-3.5 mr-1`} />
        Lookup Failed
      </div>
      <div className={`text-sm mt-2 text-center`}>
        <div
          className={`inline-block mr-1 w-3 h-3 cursor-pointer`}
          onClick={() => copy(errorText)}
        >
          <CopyIcon className={`w-3 h-3`} />
        </div>
        {errorText}
      </div>
    </div>
  );
}
