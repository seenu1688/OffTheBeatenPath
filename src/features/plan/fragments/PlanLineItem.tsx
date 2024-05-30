import { useState } from "react";

import PopoverCard from "./PopoverCard";
import { Dialog, DialogContent } from "@/components/dialog";

import { cn } from "@/lib/utils";
import { PlanType } from "../constants";

import { DeparturesResponse } from "@/common/types";

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
          "z-1 cursor-pointer rounded-sm border-1.5  px-3 py-1 text-left text-xs"
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

  if (props.plan.id === "segments" || props.plan.id === "destinations") {
    return renderContent();
  }

  return (
    <>
      <PopoverCard
        show={modalType === "detail"}
        departureId={departureId}
        item={item}
        onClose={() => {
          if (modalType === "detail") setModalType(null);
        }}
        onEdit={() => {
          setModalType("edit");
        }}
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
        <DialogContent>
          <div>Hello</div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlanLineItem;
