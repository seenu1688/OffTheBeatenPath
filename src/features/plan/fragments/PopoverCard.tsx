import { Fragment, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { usePopper } from "react-popper";

import { cn } from "@/lib/utils";

type Props = {
  children: (props: {
    setReferenceElement: (element: HTMLElement | null) => void;
    onClick?: (e: React.MouseEvent) => void;
    isOpen?: boolean;
  }) => React.ReactNode;
  popperContent: React.ReactNode;
  id: string;
};

const PopoverCard = (props: Props) => {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
  const [show, setShow] = useState(false);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
      { name: "arrow", options: { element: arrowElement } },
      {
        name: "offset",
        options: {
          offset: [0, 10],
        },
      },
    ],
    placement: "auto",
    strategy: "fixed",
  });

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!popperElement?.contains(event.target as Node)) {
        setShow(false);
      }
    };
    const handleItemClick = (e: CustomEvent<{ id: string }>) => {
      const { id } = e.detail;
      if (id !== props.id) {
        setShow(false);
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("itemClick", handleItemClick);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("itemClick", handleItemClick);
    };
  }, [popperElement, props.id, referenceElement]);

  return (
    <Fragment key={props.id}>
      {props.children({
        setReferenceElement,
        onClick: () => {
          document.dispatchEvent(
            new CustomEvent("itemClick", {
              detail: { id: props.id! },
            })
          );

          setShow(!show);
        },
        isOpen: show,
      })}
      {show &&
        ReactDOM.createPortal(
          <div
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
            className={cn(
              "z-[1000] w-[350px] rounded-md border border-orange-500 bg-white shadow-md",
              "z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
              "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            )}
          >
            {props.popperContent}
            <div ref={setArrowElement} style={styles.arrow} />
          </div>,
          document.body
        )}
    </Fragment>
  );
};

export default PopoverCard;
