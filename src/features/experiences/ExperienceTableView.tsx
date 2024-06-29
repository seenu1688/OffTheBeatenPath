import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact, CustomCellRendererProps } from "ag-grid-react";
import { ColDef, GetRowIdParams } from "ag-grid-community";
import { toast } from "sonner";
import { create } from "zustand";

import { Button } from "@/components/button";
import TabHeader from "./TabHeader";
import { createColDefs } from "./cols";

import { trpcClient } from "@/client";

import { ExperienceLineItem } from "@/server/routers/experiences/types";
import { PickList, VendorInfo } from "@/common/types";

export const aggregateColumns = [
  "budget.total",
  "budget.price",
  "actual.subTotal",
  "actual.commissionRate",
  "actual.tax",
  "actual.total",
  "actual.price",
  "variance.amount",
  "variance.percent",
];

const CustomPinnedRowRenderer = (props: CustomCellRendererProps) => {
  if (aggregateColumns.includes(props.column?.getId() ?? "")) {
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

const filterData = (data: ExperienceLineItem[], currentTab: string) => {
  return data.filter((item) => {
    if (currentTab === "current") {
      return !item.archivedDate;
    }

    return item.archivedDate === currentTab;
  });
};

const ExperienceTableView = (props: {
  data: ExperienceLineItem[];
  reservationId: string;
  pickLists: PickList[];
  vendorInfo: VendorInfo;
  onRefresh: () => void;
}) => {
  const { data } = props;

  const agGridRef = useRef<AgGridReact>(null);

  const [currentTab, setCurrentTab] = useState<"current" | string>("current");
  const tabsList = useMemo(() => {
    const result = data.reduce(
      (acc, item) => {
        if (!item.archivedDate) {
          acc["current"].push(item);
          return acc;
        }

        if (!acc[item.archivedDate]) {
          acc[item.archivedDate] = [];
        }

        acc[item.archivedDate].push(item);

        return acc;
      },
      {
        current: [],
      } as Record<string, ExperienceLineItem[]>
    );
    let index = 1;

    return Object.keys(result).map((key) => {
      let label = "Current";

      if (key !== "current") {
        label = `Past ${index}`;
        index++;
      }

      return {
        label,
        value: key,
      };
    });
  }, [data]);

  const [gridData, setGridData] = useState<ExperienceLineItem[]>(() => {
    return filterData(structuredClone(data), currentTab);
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
  const colDefs = useMemo(() => {
    return createColDefs(props.pickLists, props.vendorInfo);
  }, [props.pickLists, props.vendorInfo]);

  const defaultColDef: ColDef<ExperienceLineItem> = {
    flex: 1,
    onCellValueChanged(event) {
      useDataStore.setState((state) => {
        return {
          data: [...new Set(state.data.concat(event.node?.id!))],
        };
      });

      if (
        [
          "budget.qty",
          "budget.price",
          "actual.qty",
          "actual.unitCost",
          "actual.price",
        ].includes(event.column.getColId())
      ) {
        const agg = calculateAggrgateData();
        event.api.setGridOption("pinnedBottomRowData", [
          {
            id: "total",
            ...agg,
          },
        ]);
      }
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
  const calculateAggrgateData = () => {
    const data = agGridRef.current?.api.getGridOption("rowData") || [];
    return data.reduce(
      (acc, item) => {
        const node = agGridRef.current?.api.getRowNode(item.id);
        aggregateColumns.forEach((key) => {
          const [first, second] = key.split(".");
          const value = agGridRef.current?.api.getCellValue({
            rowNode: node!,
            colKey: key,
            useFormatter: true,
          });

          const parsedValue = parseInt(value || "0");

          (acc as any)[first][second] += parsedValue ?? 0;
        });

        return acc;
      },
      {
        budget: { total: 0, price: 0 },
        actual: { total: 0, price: 0, tax: 0, commissionRate: 0, subTotal: 0 },
        variance: { amount: 0, percent: 0 },
      }
    );
  };

  useEffect(() => {
    return () => {
      useDataStore.getState().setData([]);
    };
  }, []);

  return (
    <div className="h-full w-full">
      <TabHeader
        items={tabsList}
        selectedValue={currentTab}
        onChange={setCurrentTab}
      />
      <div className="ag-theme-quartz custom-scroll h-full w-full">
        <AgGridReact<ExperienceLineItem>
          ref={agGridRef}
          rowData={gridData!}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          getRowId={getRowId}
          animateRows={false}
          groupSuppressBlankHeader={true}
          autoSizeStrategy={{ type: "fitCellContents" }}
          containerStyle={{ height: "360px" }}
          domLayout={"normal"}
          getRowHeight={(params) => {
            if (params.node.rowPinned) {
              return 30;
            }

            return 40;
          }}
          alwaysShowHorizontalScroll={true}
          onGridReady={(params) => {
            params.api.sizeColumnsToFit();

            params.api.setGridOption("pinnedBottomRowData", [
              {
                id: "total",
                ...calculateAggrgateData(),
              },
            ]);
          }}
        />
      </div>
      <DataSaveFooter
        agGrid={agGridRef.current}
        onReset={() => {
          setGridData(filterData(structuredClone(data), currentTab));

          useDataStore.getState().setData([]);
          agGridRef.current?.api.sizeColumnsToFit();
          agGridRef.current?.api.setGridOption("pinnedBottomRowData", [
            {
              id: "total",
              ...calculateAggrgateData(),
            },
          ]);
        }}
        onSave={() => {
          let items: ExperienceLineItem[] =
            agGridRef.current!.api.getGridOption("rowData") ?? [];

          const dataChange = useDataStore.getState().data;
          const saveData = items.filter((item) => {
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
