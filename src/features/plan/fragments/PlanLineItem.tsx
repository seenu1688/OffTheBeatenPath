import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import PopoverCard from "./PopoverCard";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/dialog";
import AccountView from "./AccountView";

import { cn } from "@/lib/utils";
import { PlanType } from "../constants";

import { DeparturesResponse } from "@/common/types";
import SegmentPopoverCard from "./SegmentPopoverCard";
import ReservationPopoverCard from "./ReservationPopoverCard";

type Props = {
  item: DeparturesResponse[
    | "segments"
    | "destinations"
    | PlanType["id"]][number];
  plan: PlanType;
  width: number;
  position: number;
  departureId: string;
};

const PlanLineItem = (props: Props) => {
  const { item, plan, width, position, departureId } = props;
  const [modalType, setModalType] = useState<"detail" | "edit" | null>(null);

  const renderContent = (
    ref?: (element: HTMLElement | null) => void,
    onClick?: () => void
  ) => {
    return (
      <div
        onClick={onClick}
        ref={ref}
        style={{
          width: `${width}px`,
          transform: `translateX(${position}px)`,
          background: plan.accentColor,
          borderColor: plan.primaryColor,
        }}
        key={item.id}
        className={cn(
          "z-1 absolute cursor-pointer rounded-sm  border-1.5 px-3 py-1 text-left text-xs"
        )}
      >
        <div
          title={item.name}
          className="w-auto overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {item.name}
        </div>
      </div>
    );
  };

  if (props.plan.id === "destinations") {
    return renderContent();
  }

  const renderPopperContent = () => {
    if (props.plan.id === "destinations") {
      return null;
    }

    if (props.plan.id === "segments") {
      return (
        <SegmentPopoverCard
          departureId={props.departureId}
          segmentId={props.item.id}
          onClose={() => {
            if (modalType === "detail") {
              setModalType(null);
            }
          }}
        />
      );
    }

    return (
      <ReservationPopoverCard
        departureId={props.departureId}
        reservationId={props.item.id}
        onClose={() => {
          if (modalType === "detail") {
            setModalType(null);
          }
        }}
        onEdit={() => {
          setModalType("edit");
        }}
      />
    );
  };

  return (
    <>
      <PopoverCard
        show={modalType === "detail"}
        onClose={() => {
          if (modalType === "detail") setModalType(null);
        }}
        popperContent={renderPopperContent()}
      >
        {({ setReferenceElement }) =>
          renderContent(setReferenceElement, () => {
            setModalType(modalType ? null : "detail");
          })
        }
      </PopoverCard>
      <Dialog
        open={modalType === "edit"}
        onOpenChange={() => {
          setModalType(null);
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-0 top-0 h-full max-h-full w-full max-w-full rounded-none bg-background",
              "z-50 bg-background duration-200 data-[state=open]:animate-in",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
              "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            )}
          >
            <AccountView
              reservationId={item.id}
              departureId={props.departureId}
            />
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
};

export default PlanLineItem;