import { useRef, useState, useDeferredValue, Fragment } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useDraggable } from "@dnd-kit/core";

import PopoverCard from "./PopoverCard";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/dialog";
import AccountView from "./AccountView";
import SegmentPopoverCard from "./SegmentPopoverCard";
import ReservationPopoverCard from "./ReservationPopoverCard";

import { useEdgeResizable } from "../hooks/useEdgeResizable";

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

const holderStyles = cn(
  "absolute top-[-3px] h-[30px] w-[3px] cursor-col-resize bg-transparent z-[110]",
  "hidden group-hover:block",
  "data-[state=resizing]:block group-data-[state=dragging]:hidden"
);

const PlanLineItem = (props: Props) => {
  const { item, plan, width, position } = props;
  const [modalType, setModalType] = useState<"detail" | "edit" | null>(null);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: props.item.id,
      data: {
        item: props.item,
        position,
        type: plan.id,
        width,
      },
      disabled: !!modalType,
    });
  const {
    listeners: resizeListeners,
    style,
    resizeSide,
  } = useEdgeResizable({
    id: props.item.id,
    data: {
      item: props.item,
      position,
      type: plan.id,
    },
  });

  const positionX =
    resizeSide === "left" && style ? position + style.delta : position;
  const styles = transform
    ? {
        transform: `translate3d(${transform.x + position}px, ${transform.y}px, 0)`,
      }
    : {};
  const resizeStyles = style
    ? {
        width:
          resizeSide === "left" ? width - style.delta : width + style.delta,
        transform: `translate3d(${positionX}px, 0, 0)`,
      }
    : {};

  const finalStyles = {
    ...styles,
    ...resizeStyles,
  };

  const timeRef = useRef<number | null>(null);
  const deferredStyles = useDeferredValue(finalStyles);

  const renderContent = (
    ref?: (element: HTMLElement | null) => void,
    onClick?: () => void
  ) => {
    const barStyles = {
      width: `${width}px`,
      transform: `translate3d(${position}px, 0, 0)`,
      background: plan.accentColor,
      borderColor: plan.primaryColor,
      zIndex: isDragging ? 100 : 1,
      ...deferredStyles,
    };

    return (
      <div
        {...attributes}
        onPointerDown={(e) => {
          timeRef.current = Date.now();
          listeners?.onPointerDown(e);
        }}
        ref={(node) => {
          ref && ref(node);
          setNodeRef(node);
        }}
        onMouseUp={(e) => {
          if (
            onClick &&
            timeRef.current &&
            Date.now() - timeRef.current < 200
          ) {
            onClick();
          }
          timeRef.current = null;
        }}
        style={barStyles}
        key={item.id}
        className={cn(
          "z-1 group absolute cursor-pointer  rounded-sm border-1.5 px-3 py-1 text-left text-xs"
        )}
        data-state={isDragging ? "dragging" : "idle"}
      >
        <div
          onPointerDown={(e) => {
            resizeListeners.onPointerDown("left", e);
          }}
          data-state={resizeSide === "left" ? "resizing" : "idle"}
          className={cn(
            holderStyles,
            "left-[-2px]",
            (resizeSide === "right" || isDragging || !!modalType) &&
              "group-hover:hidden"
          )}
        />
        <div onClick={onClick} className="h-full w-full">
          <div
            title={item.name}
            className="w-auto overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {item.name}
          </div>
        </div>
        <div
          onPointerDown={(e) => {
            resizeListeners.onPointerDown("right", e);
          }}
          data-state={resizeSide === "right" ? "resizing" : "idle"}
          className={cn(
            holderStyles,
            "right-[-2px]",
            (resizeSide === "left" || isDragging || !!modalType) &&
              "group-hover:hidden"
          )}
        />
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
          key={props.item.id}
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
        key={props.item.id}
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
    <Fragment key={item.id}>
      <PopoverCard
        key={item.id}
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
    </Fragment>
  );
};

export default PlanLineItem;
