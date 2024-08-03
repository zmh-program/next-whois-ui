import React from "react";
import { motion } from "framer-motion";

export interface ClickableProps
  extends React.HTMLAttributes<HTMLDivElement>,
    React.PropsWithChildren<{}> {
  tapScale?: number;
  tapDuration?: number;
  hoverScale?: number;
}

const Clickable: React.FC<ClickableProps> = ({
  children,
  className,
  tapScale = 0.95,
  tapDuration = 0.1,
  hoverScale,
}) => {
  return (
    <motion.div
      className={className}
      whileTap={{
        scale: tapScale,
        transition: { duration: tapDuration },
      }}
      whileHover={hoverScale ? { scale: hoverScale } : {}}
      whileFocus={hoverScale ? { scale: hoverScale } : {}}
    >
      {children}
    </motion.div>
  );
};

Clickable.displayName = "Clickable";
export default Clickable;
