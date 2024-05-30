import { Loader2 as BaseLoader } from "lucide-react";

import { cn } from "@/lib/utils";

const Loader = (props: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        props.className
      )}
    >
      <BaseLoader size={64} className="animate-spin text-primary" />
    </div>
  );
};

export default Loader;
