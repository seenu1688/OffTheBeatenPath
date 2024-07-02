import { AgGridReact } from "ag-grid-react";

import { Button } from "@/components/button";

import { useDataStore } from "../hooks/useDataStore";

const DataSaveFooter = (props: {
  agGrid: AgGridReact | null;
  onReset: () => void;
  onSave: () => void;
  disable?: boolean;
}) => {
  const data = useDataStore((state) => state.data);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-9 z-10 w-full">
      <div className="max-w-1/2 mx-auto flex w-[300px] items-center justify-between gap-4 rounded-lg bg-gray-500 p-4 shadow-lg">
        <Button
          variant="outline"
          onClick={() => {
            props.onReset();
          }}
        >
          Reset
        </Button>
        <Button onClick={props.onSave} disabled={props.disable}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default DataSaveFooter;
