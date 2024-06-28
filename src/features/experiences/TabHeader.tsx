import { Plus } from "lucide-react";
import clsx from "clsx";

type Props = {
  items: {
    label: string;
    value: string;
  }[];
  selectedValue: string;
  onChange: (value: string) => void;
};

const TabHeader = (props: Props) => {
  return (
    <div className="flex items-center overflow-x-auto">
      <button className={clsx("rounded-se-lg rounded-ss-lg px-4 py-2")}>
        <Plus size={20} />
      </button>
      {props.items.map((item) => {
        return (
          <button
            key={item.value}
            onClick={() => props.onChange(item.value)}
            className={clsx(
              "rounded-se-lg rounded-ss-lg px-8 py-2",
              props.selectedValue === item.value && "bg-primary text-white"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabHeader;
