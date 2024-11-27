import React from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface InfoTextProps
  extends React.HTMLAttributes<HTMLDivElement>,
    React.PropsWithChildren<{}> {
  content: string;
}

const InfoText: React.FC<InfoTextProps> = ({
  content,
  className,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "inline-flex ml-1 select-none px-1 py-0.5 border rounded-md text-xs whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {t(content)}
    </div>
  );
};

InfoText.displayName = "InfoText";
export default InfoText;
