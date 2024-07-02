import { forwardRef } from "react";
import { ICellEditorParams } from "ag-grid-community";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";

type Props = ICellEditorParams & {
  options: { label: string; value: string }[];
};

const SelectCell = forwardRef<any, Props>((props, _ref) => {
  const { options, value } = props;

  return (
    <Select
      defaultValue={value}
      onValueChange={(value) => {
        if (props.colDef.field) {
          props.node.setDataValue(props.colDef.field, value);
        }
        props.stopEditing();
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

SelectCell.displayName = "SelectCell";

export default SelectCell;
