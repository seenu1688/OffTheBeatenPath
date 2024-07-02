import { Plus } from "lucide-react";
import clsx from "clsx";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/alert-dialog";

type Props = {
  items: {
    label: string;
    value: string;
  }[];
  selectedValue: string;
  onChange: (value: string) => void;
  onClick: () => void;
};

const TabHeader = (props: Props) => {
  return (
    <div className="flex items-center overflow-x-auto">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            aria-label="archive"
            className={clsx("rounded-se-lg rounded-ss-lg px-4 py-2")}
          >
            <Plus size={20} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500" onClick={props.onClick}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
