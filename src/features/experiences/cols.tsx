import { ColDef, ColGroupDef, ValueGetterParams } from "ag-grid-community";

import Header from "./Header";
import SelectCell from "./compnents/Select";

import { ExperienceLineItem } from "@/server/routers/experiences/types";
import { PickList, VendorInfo } from "@/common/types";

const calculatePercentage = (total: number, percent: number) => {
  return total * (percent / 100);
};

export const createColDefs = (props: {
  pickLists: PickList[];
  vendorInfo: VendorInfo;
  disabled?: boolean;
}): (ColDef<ExperienceLineItem> | ColGroupDef<ExperienceLineItem>)[] => {
  const { pickLists, vendorInfo, disabled = false } = props;
  const requestedOptions = pickLists.find(
    (p) => p.name === "Requested__c"
  )?.values;
  const isEditable = !disabled;

  return [
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
      editable: true && isEditable && isEditable,
      cellDataType: "string",
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
      field: "group.included",
      minWidth: 100,
      hide: true,
      groupId: "group",
      headerClass: "text-primary",
    },
    {
      field: "requested",
      headerName: "Requested",
      minWidth: 140,
      headerComponent: Header,
      editable: true && isEditable,
      cellEditorParams: {
        options: requestedOptions,
      },
      cellEditor: SelectCell,
    },
    {
      field: "daysNights",
      headerName: "Days/Nights",
      minWidth: 100,
      cellDataType: "number",
      editable: true && isEditable,
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
          cellDataType: "number",
          editable: true && isEditable,
        },
        {
          field: "budget.unitCost",
          headerName: "Unit Cost",
          cellClass: "cell-group",
          headerClass: "cell-group",
          cellDataType: "number",
          minWidth: 90,
        },
        {
          field: "budget.subTotal",
          headerName: "Subtotal",
          minWidth: 90,
          cellClass: "cell-group",
          headerClass: "cell-group",
          cellDataType: "number",
          valueGetter: (params) => {
            return (
              (params.getValue("budget.qty") ?? 0) *
              (params.getValue("budget.unitCost") ?? 0)
            );
          },
        },
        {
          field: "budget.commissionRate",
          headerName: "Commission",
          aggFunc: "sum",
          cellClass: "cell-group",
          headerClass: "cell-group",
          cellDataType: "number",
          valueGetter: (params) => {
            return calculatePercentage(
              params.getValue("budget.subTotal") || 0,
              vendorInfo.commission
            );
          },
        },
        {
          field: "budget.tax",
          headerName: "Tax",
          cellClass: "cell-group",
          headerClass: "cell-group",
          cellDataType: "number",
          valueGetter: (params) => {
            return calculatePercentage(
              params.getValue("budget.subTotal") || 0,
              vendorInfo.taxRate
            );
          },
        },
        {
          field: "budget.currency",
          headerName: "Currency",
          minWidth: 90,
          cellEditorParams: {
            options: [{ label: "USD", value: "USD" }],
          },
          cellEditor: SelectCell,
        },
        {
          field: "budget.total",
          headerName: "Total",
          type: "numericColumn",
          minWidth: 90,
          cellDataType: "number",
          valueGetter: (params) => {
            if (params.node?.isRowPinned()) {
              return params.data?.budget.total;
            }

            return (
              (params.getValue("budget.subTotal") ?? 0) +
              (params.getValue("budget.commissionRate") ?? 0) +
              (params.getValue("budget.tax") ?? 0)
            );
          },
        },
        {
          field: "budget.grossMarginTarget",
          headerName: "GM Target",
          cellClass: "cell-group",
          headerClass: "cell-group",
          minWidth: 90,
          cellDataType: "number",
          editable: true && isEditable,
          valueFormatter: (params) => {
            return `${params.value || 0}%`;
          },
        },
        {
          field: "budget.price",
          headerName: "Price",
          minWidth: 90,
          aggFunc: "sum",
          type: "numericColumn",
          cellClass: "cell-group cell-group-last",
          cellDataType: "number",
          editable: true && isEditable,
        },
      ],
    },
    {
      headerName: "Actual",
      headerClass: "justify-center",
      groupId: "actual",
      children: [
        {
          field: "actual.qty",
          headerName: "Qty",
          cellClass: "cell-group",
          headerClass: "cell-group",
          cellDataType: "number",
          editable: true && isEditable,
          groupId: "actual",
        },
        {
          field: "actual.unitCost",
          headerName: "Unit Cost",
          cellClass: "cell-group",
          headerClass: "cell-group",
          cellDataType: "number",
          editable: true && isEditable,
          groupId: "actual",
        },
        {
          field: "actual.subTotal",
          headerName: "Subtotal",
          minWidth: 90,
          cellClass: "cell-group",
          headerClass: "cell-group",
          cellDataType: "number",
          valueGetter: (params) => {
            if (params.node?.isRowPinned()) {
              return params.data?.actual.subTotal;
            }

            return (
              (params.getValue("actual.qty") ?? 0) *
              (params.getValue("actual.unitCost") ?? 0)
            );
          },
          groupId: "actual",
        },
        {
          field: "actual.commissionRate",
          headerName: "Commission",
          cellClass: "cell-group",
          headerClass: "cell-group",
          cellDataType: "number",
          valueGetter: (params) => {
            if (params.node?.isRowPinned()) {
              return params.data?.actual.commissionRate;
            }

            return calculatePercentage(
              params.getValue("actual.subTotal") || 0,
              vendorInfo.taxRate
            );
          },
          groupId: "actual",
        },
        {
          field: "actual.tax",
          headerName: "Tax",
          cellClass: "cell-group",
          headerClass: "cell-group",
          cellDataType: "number",
          valueGetter: (params) => {
            if (params.node?.isRowPinned()) {
              return params.data?.actual.tax;
            }

            return calculatePercentage(
              params.getValue("actual.subTotal") || 0,
              vendorInfo.taxRate
            );
          },
          groupId: "actual",
        },
        {
          field: "actual.currency",
          headerName: "Currency",
          minWidth: 90,
          groupId: "actual",
        },
        {
          field: "actual.total",
          headerName: "Total",
          cellDataType: "number",
          minWidth: 90,
          type: "numericColumn",
          valueGetter: (params) => {
            if (params.node?.isRowPinned()) {
              return params.data?.actual.total;
            }

            return (
              (params.getValue("actual.subTotal") ?? 0) +
              (params.getValue("actual.commissionRate") ?? 0) +
              (params.getValue("actual.tax") ?? 0)
            );
          },
          groupId: "actual",
        },
        {
          field: "actual.grossMarginTarget",
          headerName: "GM Target",
          headerClass: "cell-group",
          cellClass: "cell-group",
          cellDataType: "number",
          valueFormatter: (params) => {
            return `${params.value || 0}%`;
          },
          groupId: "actual",
        },
        {
          field: "actual.price",
          headerName: "Price",
          minWidth: 90,
          cellDataType: "number",
          editable: true && isEditable,
          groupId: "actual",
        },
      ],
    },
    {
      headerName: "Variance",
      headerClass: "justify-center",
      groupId: "variance",
      children: [
        {
          field: "variance.percent",
          headerName: "Percent",
          minWidth: 100,
          cellDataType: "number",
          groupId: "variance",
          valueFormatter: (params) => {
            return `${params.value || 0}%`;
          },
        },
        {
          field: "variance.amount",
          headerName: "Amount",
          minWidth: 100,
          cellDataType: "number",
          groupId: "variance",
          valueGetter: (params) => {
            if (params.node?.isRowPinned()) {
              return params.data?.variance.amount;
            }

            return (
              (params.data!.actual.price || 0) -
              (params.data!.budget.price || 0)
            );
          },
        },
      ],
    },
  ];
};
