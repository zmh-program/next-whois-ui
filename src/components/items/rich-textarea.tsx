import { Button } from "@/components/ui/button";
import { CopyIcon, DownloadIcon } from "lucide-react";
import { TextArea } from "@/components/ui/textarea";
import React from "react";
import { cn, useClipboard, useSaver } from "@/lib/utils";

export type RichTextareaProps = {
  className?: string;
  name?: string;
  value?: string;

  saveFileName?: string;
  disableCopyAction?: boolean;
  disableSaveAction?: boolean;
};

export default function RichTextarea({
  className,
  name,
  value,
  saveFileName,
  disableCopyAction,
  disableSaveAction,
}: RichTextareaProps) {
  const copy = useClipboard();
  const save = useSaver();

  const displayName = name || "";
  const displayValue = value || "";

  return (
    <div className={cn(`flex flex-col space-y-1.5`, className)}>
      <div className={`flex flex-row items-center`}>
        <p className={`text-sm text-secondary font-medium`}>{displayName}</p>
        <div className={`flex-grow`} />
        <Button
          variant={`outline`}
          size={`icon-sm`}
          className={cn(
            `mr-1 text-muted-foreground transition hover:text-primary`,
            disableCopyAction && `hidden`,
          )}
          onClick={() => copy(displayValue)}
          tapEnabled
        >
          <CopyIcon className={`w-3.5 h-3.5`} />
        </Button>
        <Button
          variant={`outline`}
          size={`icon-sm`}
          onClick={() => save(saveFileName || "text.txt", displayValue)}
          className={cn(
            `text-muted-foreground transition hover:text-primary`,
            disableSaveAction && `hidden`,
          )}
          tapEnabled
        >
          <DownloadIcon className={`w-3.5 h-3.5`} />
        </Button>
      </div>
      <TextArea rows={10} readOnly={true} value={displayValue} />
    </div>
  );
}
