import { Loader2 as BaseLoader } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <BaseLoader size={64} className="animate-spin text-primary" />
    </div>
  );
};

export default Loader;
