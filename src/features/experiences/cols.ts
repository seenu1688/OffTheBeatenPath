import { ColDef, ColGroupDef, ValueGetterParams } from "ag-grid-community";

import Header from "./Header";

import { ExperienceLineItem } from "@/server/routers/experiences/types";

export const colDefs: (
  | ColDef<ExperienceLineItem>
  | ColGroupDef<ExperienceLineItem>
)[] = [
  {
    headerName: "#",
    valueGetter: (p: ValueGetterParams) => p.node!.rowIndex! + 1,
    minWidth: 30,
    maxWidth: 40,
  },
  {
    field: "experience",
    headerName: "Experience Name",
    minWidth: 140,
    cellClass: "exp-cell",
    headerClass: "exp-header-cell",
  },
  {
    field: "group.recordType",
    headerName: "Record Type",
    groupId: "group",
    minWidth: 100,
    hide: true,
    headerClass: "text-primary",
  },
  {
    field: "group.shortDescription",
    headerName: "Exp Short Desc",
    groupId: "group",
    minWidth: 100,
    hide: true,
    headerClass: "text-primary",
  },
  {
    field: "group.travelBrief",
    headerName: "Travel Brief Desc",
    groupId: "group",
    minWidth: 100,
    hide: true,
    headerClass: "text-primary",
  },
  {
    field: "group.guideBookDescription",
    headerName: "Guide Book Desc",
    groupId: "group",
    minWidth: 100,
    hide: true,
    headerClass: "text-primary",
  },
  {
    field: "group.rateType",
    headerName: "Rate Type",
    groupId: "group",
    minWidth: 100,
    hide: true,
    headerClass: "text-primary",
  },
  {
    field: "group.maxPax",
    headerName: "Max Pax",
    groupId: "group",
    minWidth: 100,
    hide: true,
    headerClass: "text-primary",
  },
  {
    field: "group.requested",
    headerName: "Requested",
    groupId: "group",
    minWidth: 110,
    hide: true,
    headerClass: "text-primary",
  },
  {
    field: "included",
    minWidth: 100,
    headerComponent: Header,
  },
  {
    field: "daysNights",
    headerName: "Days/Nights",
    minWidth: 100,
  },
  {
    headerName: "Budget",
    headerClass: "justify-center",
    groupId: "budget",
    children: [
      {
        field: "budget.qty",
        headerName: "Qty",
        cellClass: "cell-group",
        headerClass: "cell-group",
      },
      {
        field: "budget.unitCost",
        headerName: "Unit",
        cellClass: "cell-group",
        headerClass: "cell-group",
      },
      {
        field: "budget.subTotal",
        headerName: "Subtotal",
        minWidth: 90,
        cellClass: "cell-group",
        headerClass: "cell-group",
      },
      {
        field: "budget.commissionRate",
        headerName: "Comm",
        aggFunc: "sum",
        cellClass: "cell-group",
        headerClass: "cell-group",
      },
      {
        field: "budget.tax",
        headerName: "Tax",
        aggFunc: "sum",
        cellClass: "cell-group",
        headerClass: "cell-group",
      },
      {
        field: "budget.currency",
        headerName: "Currency",
        minWidth: 90,
      },
      {
        field: "budget.total",
        headerName: "Total",
        aggFunc: "sum",
        type: "numericColumn",
      },
      {
        field: "budget.grossMarginTarget",
        headerName: "GM Target",
        cellClass: "cell-group",
        headerClass: "cell-group",
        minWidth: 90,
      },
      {
        field: "budget.price",
        headerName: "Price",
        minWidth: 90,
        aggFunc: "sum",
        type: "numericColumn",
        cellClass: "cell-group cell-group-last",
      },
    ],
  },
  {
    headerName: "Actual",
    headerClass: "justify-center",
    children: [
      {
        field: "actual.qty",
        headerName: "Qty",
        cellClass: "cell-group",
        headerClass: "cell-group",
      },
      {
        field: "actual.unitCost",
        headerName: "Unit",
        cellClass: "cell-group",
        headerClass: "cell-group",
      },
      {
        field: "actual.subTotal",
        headerName: "Subtotal",
        minWidth: 90,
        cellClass: "cell-group",
        headerClass: "cell-group",
      },
      {
        field: "actual.commissionRate",
        headerName: "Comm",
        cellClass: "cell-group",
        headerClass: "cell-group",
      },
      {
        field: "actual.tax",
        headerName: "Tax",
        cellClass: "cell-group",
        headerClass: "cell-group",
      },
      {
        field: "actual.currency",
        headerName: "Currency",
        minWidth: 90,
      },
      {
        field: "actual.total",
        headerName: "Total",
      },
      {
        field: "actual.grossMarginTarget",
        headerName: "GM Target",
        headerClass: "cell-group",
        cellClass: "cell-group",
      },
      {
        field: "actual.price",
        headerName: "Price",
        minWidth: 90,
      },
    ],
  },
  {
    headerName: "Variance",
    headerClass: "justify-center",
    children: [
      {
        field: "variance.percent",
        headerName: "Percent",
        minWidth: 100,
      },
      {
        field: "variance.amount",
        headerName: "Amount",
        minWidth: 100,
      },
    ],
  },
  // {
  //   field: "electric",
  //   sortable: false,
  //   editable: true,
  //   valueSetter: (params: ValueSetterParams) => {
  //     console.log(params);

  //     const newVal = params.newValue;
  //     const valueChanged = params.data.b !== newVal;
  //     if (valueChanged) {
  //       params.data.electric = newVal;
  //     }
  //     return valueChanged;
  //   },
  // },
];
