import { useState } from "react";
import { CustomHeaderProps } from "ag-grid-react";
import { cn } from "@/lib/utils";

const Header = (props: CustomHeaderProps) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    return props.api.getProvidedColumnGroup("group")?.isVisible() ?? false;
  });
  const [columns] = useState(() => {
    return (
      props.api.getColumns()?.reduce((acc, col) => {
        if (col.getId().includes("group")) {
          acc.push(col.getId().toString());
        }

        return acc;
      }, [] as string[]) ?? []
    );
  });

  const handleToggle = () => {
    props.api.setColumnsVisible(columns, !isExpanded);
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex w-full justify-center">
      <div
        className={cn(
          "absolute top-[40px] translate-x-[28px] rotate-90 px-4",
          "z-[100] cursor-pointer bg-primary text-xs text-white",
          "rounded-se-[20px] rounded-ss-[20px]",
          isExpanded && "-left-[78px] -rotate-90",
          !isExpanded && "-left-[58px]"
        )}
        role="button"
        onClick={handleToggle}
      >
        {isExpanded ? "Collapse" : "Expand"}
      </div>
      <span className="ag-header-group-text" role="presentation">
        {props.displayName}
      </span>
    </div>
  );
};

export default Header;
