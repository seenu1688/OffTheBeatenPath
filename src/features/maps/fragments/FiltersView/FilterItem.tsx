import { MouseEventHandler } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";

type Props = {
  filter: {
    name: string;
    id: string;
  };
  selected: boolean;
  onChange: MouseEventHandler<HTMLButtonElement>;
};

const FilterItem = (props: Props) => {
  const { filter } = props;

  return (
    <CheckboxPrimitive.Root
      id={filter.id}
      className={cn(
        "items-top flex cursor-pointer space-x-2 rounded-md border border-[#C7A08D] px-4 py-2",
        "data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-100 data-[state=checked]:text-primary"
      )}
      key={filter.id}
      onClick={props.onChange}
      value={filter.id}
      checked={props.selected}
    >
      <label
        htmlFor={filter.id}
        className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {filter.name}
      </label>
    </CheckboxPrimitive.Root>
  );
};

export default FilterItem;
