import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const labelVariants = cva(
  "border-1.5 tooltip z-10 relative flex w-max items-center justify-center gap-1 rounded-lg px-6 py-[2px]",
  {
    variants: {
      variant: {
        primary: "border-primary bg-[#fff6e0] tooltip-primary",
        secondary: "border-black bg-[#fff]",
      },
    },
  }
);

const GridLineLabel = (props: Props) => {
  const { variant = "primary", label, icon, className, style } = props;

  return (
    <div
      data-place="bottom"
      className={cn(labelVariants({ variant }), className)}
      style={style}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </div>
  );
};

export default GridLineLabel;
