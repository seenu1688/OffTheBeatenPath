import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact, CustomCellRendererProps } from "ag-grid-react";
import { ColDef, GetRowIdParams } from "ag-grid-community";
import { toast } from "sonner";
import { Loader } from "lucide-react";

import TabHeader from "./TabHeader";
import { createColDefs } from "./cols";
import DataSaveFooter from "./fragments/DataSaveFooter";

import { useDataStore } from "./hooks/useDataStore";

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

const CustomPinnedCellRenderer = (props: CustomCellRendererProps) => {
  if (aggregateColumns.includes(props.column?.getId() ?? "")) {
    return <span>{props.value}</span>;
  }

  return null;
};

const filterData = (data: ExperienceLineItem[], currentTab: string) => {
  return data.filter((item) => {
    if (currentTab === "current") {
      return item.status === "Active";
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

  const { mutate, isPending: updatePending } =
    trpcClient.experiences.update.useMutation({
      onSuccess() {
        toast.success("Data saved successfully");
        useDataStore.getState().setData([]);
        props.onRefresh();
      },
      onError(error) {
        toast.error("Failed to save data " + error.message);
      },
    });

  const { mutate: archive, isPending: archivePending } =
    trpcClient.experiences.archive.useMutation({
      onSuccess() {
        toast.success("Create new experience line items successfully");
        props.onRefresh();
      },
      onError(_error) {
        console.log(_error);

        toast.error("Failed to create new experience line items");
      },
    });

  const colDefs = useMemo(() => {
    agGridRef.current?.api.clearFocusedCell();

    return createColDefs({
      pickLists: props.pickLists,
      vendorInfo: props.vendorInfo,
      disabled: updatePending || archivePending || currentTab !== "current",
    });
  }, [
    props.pickLists,
    props.vendorInfo,
    updatePending,
    currentTab,
    archivePending,
  ]);

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
          component: CustomPinnedCellRenderer,
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
        onClick={() => {
          archive({ reservationId: props.reservationId });
        }}
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
        disable={updatePending}
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
          agGridRef.current!.api.clearFocusedCell();

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
      {(updatePending || archivePending) && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-[100] flex h-full w-full items-center justify-center bg-gray-600/20">
          <Loader size={36} className="z-10 animate-spin text-orange-500" />
        </div>
      )}
    </div>
  );
};

export default ExperienceTableView;
