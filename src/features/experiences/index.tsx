import { useCallback, useMemo, useRef } from "react";
import { AgGridReact, CustomCellRendererProps } from "ag-grid-react";
import { ColDef, GetRowIdParams } from "ag-grid-community";

import Loader from "@/components/Loader";

import { trpcClient } from "@/client";
import { colDefs } from "./cols";

import { ExperienceLineItem } from "@/server/routers/experiences/types";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./index.css";

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

type Props = {
  reservationId: string;
};

const ExperienceTable = (props: Props) => {
  const agGridRef = useRef<AgGridReact>(null);
  const { data, isLoading } =
    trpcClient.experiences.getAllByReservationId.useQuery(
      {
        reservationId: props.reservationId,
      },
      { staleTime: 0 }
    );

  const defaultColDef: ColDef = {
    flex: 1,
    onCellValueChanged(event) {
      console.log(event.data);
      //   console.log(agGridRef.current?.props.rowData);
      //   var changedData = [event.data];
      //   event.api.applyTransaction({ update: changedData });

      const oldData = event.data;
      const field = event.colDef.field;
      const newValue = event.newValue;
      const newData = { ...oldData };
      newData[field!] = event.newValue;
      console.log("onCellEditRequest, updating " + field + " to " + newValue);
      const tx = {
        update: [newData],
      };
      event.api.applyTransaction(tx);
    },
    cellClass: "ot-cell",
    sortable: false,
    resizable: true,
    editable: true,
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

  if (isLoading) {
    return <Loader className="h-[200px]" />;
  }

  return (
    <div className="h-full w-full">
      <div className="ag-theme-quartz custom-scroll h-full w-full">
        <AgGridReact<ExperienceLineItem>
          ref={agGridRef}
          rowData={data!}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          getRowId={getRowId}
          animateRows={false}
          groupSuppressBlankHeader={true}
          // pinnedBottomRowData={pinnedBottomRowData}
          autoSizeStrategy={{ type: "fitCellContents" }}
          className="h-[420px]"
          domLayout="normal"
          onGridReady={(params) => {}}
        />
      </div>
    </div>
  );
};

export default ExperienceTable;
