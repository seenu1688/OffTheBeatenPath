import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact, CustomCellRendererProps } from "ag-grid-react";
import { ColDef, GetRowIdParams, NewValueParams } from "ag-grid-community";
import { toast } from "sonner";

import { Button } from "@/components/button";

import { colDefs } from "./cols";
import { trpcClient } from "@/client";

import { ExperienceLineItem } from "@/server/routers/experiences/types";
import { create } from "zustand";

const CustomPinnedRowRenderer = (props: CustomCellRendererProps) => {
  if (
    [
      "budget.total",
      "actual.subtotal",
      "actual.comm",
      "actual.tax",
      "actual.total",
      "actual.price",
      "variance.amount",
      "variance.percent",
    ].includes(props.column?.getId() ?? "")
  ) {
    return <span>{props.value}</span>;
  }

  return null;
};

const useDataStore = create<{
  data: string[];
  setData: (data: string[]) => void;
}>((set) => ({
  data: [] as string[],
  setData: (data: string[]) => {
    set({ data });
  },
}));

const DataSaveFooter = (props: {
  agGrid: AgGridReact | null;
  onReset: () => void;
  onSave: () => void;
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
        <Button onClick={props.onSave}>Save</Button>
      </div>
    </div>
  );
};

const ExperienceTableView = (props: {
  data: ExperienceLineItem[];
  reservationId: string;
  onRefresh: () => void;
}) => {
  const { data } = props;

  const agGridRef = useRef<AgGridReact>(null);
  const [gridData, setGridData] = useState<ExperienceLineItem[]>(() => {
    return structuredClone(data);
  });

  const { mutate } = trpcClient.experiences.update.useMutation({
    onSuccess() {
      toast.success("Data saved successfully");
      props.onRefresh();
      useDataStore.getState().setData([]);
    },
    onError(error) {
      toast.error("Failed to save data " + error.message);
    },
  });

  const defaultColDef: ColDef<ExperienceLineItem> = {
    flex: 1,
    onCellValueChanged(event) {
      useDataStore.setState((state) => {
        return {
          data: [...new Set(state.data.concat(event.node?.id!))],
        };
      });

      //   console.log(event.data);
      //   //   console.log(agGridRef.current?.props.rowData);
      //   //   var changedData = [event.data];
      //   //   event.api.applyTransaction({ update: changedData });
      //   const oldData = event.data;
      //   const field = event.colDef.field;
      //   const newValue = event.newValue;
      //   const newData = { ...oldData };
      //   newData[field!] = event.newValue;
      //   console.log("onCellEditRequest, updating " + field + " to " + newValue);
      //   const tx = {
      //     update: [newData],
      //   };
      //   event.api.applyTransaction(tx);
    },
    cellClass: "ot-cell",
    sortable: false,
    resizable: true,
    editable: false,
    lockPosition: true,
    minWidth: 60,
    headerClass: "justify-start",
    cellRendererSelector: (params) => {
      if (params.node.rowPinned) {
        return {
          component: CustomPinnedRowRenderer,
        };
      } else {
        // rows that are not pinned don't use any cell renderer
        return undefined;
      }
    },
    cellEditorSelector: (params) => {
      if (params.node.rowPinned) {
        return {
          component: () => null,
        };
      } else {
        return undefined;
      }
    },
  };

  const getRowId = useCallback((params: GetRowIdParams) => params.data.id, []);

  const pinnedBottomRowData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    return [
      {
        id: "",
        experience: "",
        included: "",
        daysNights: 0,
        group: {
          recordType: "",
          shortDesc: "",
          travelBrief: "",
          guidebookDesc: "",
          rateType: "",
          maxPax: "",
          requested: "",
        },
        budget: {
          qty: 2,
          unit: 4,
          subtotal: 6,
          comm: 8,
          tax: 10,
          currency: "USD",
          total: 12,
          gmTarget: 14,
          price: 16,
        },
        actual: {
          qty: 2,
          unit: 4,
          subtotal: 6,
          comm: 8,
          tax: 10,
          currency: "USD",
          total: 12,
          gmTarget: 14,
          price: 16,
        },
        variance: {
          percent: 18,
          amount: 20,
        },
      },
    ];
  }, [data]);

  return (
    <div className="h-full w-full">
      <div className="ag-theme-quartz custom-scroll h-full w-full">
        <AgGridReact<ExperienceLineItem>
          ref={agGridRef}
          rowData={gridData!}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          getRowId={getRowId}
          animateRows={false}
          groupSuppressBlankHeader={true}
          //   pinnedBottomRowData={pinnedBottomRowData}
          autoSizeStrategy={{ type: "fitCellContents" }}
          className="h-[420px]"
          domLayout={"normal"}
          getRowHeight={(params) => {
            if (params.node.rowPinned) {
              return 30;
            }
            return 40;
          }}
          onGridReady={(params) => {
            params.api.sizeColumnsToFit();
          }}
        />
      </div>
      <DataSaveFooter
        agGrid={agGridRef.current}
        onReset={() => {
          setGridData(data ?? []);
          useDataStore.getState().setData([]);
        }}
        onSave={() => {
          const dataChange = useDataStore.getState().data;
          const saveData = gridData.filter((item) => {
            return dataChange.includes(item.id);
          });

          if (saveData.length === 0) {
            return;
          }

          mutate({
            data: saveData,
            reservationId: props.reservationId,
          });
        }}
      />
    </div>
  );
};

export default ExperienceTableView;
