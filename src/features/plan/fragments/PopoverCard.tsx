import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { usePopper } from "react-popper";

import { cn } from "@/lib/utils";

type Props = {
  children: (props: {
    setReferenceElement: (element: HTMLElement | null) => void;
  }) => React.ReactNode;
  popperContent: React.ReactNode;
  show: boolean;
  onClose: () => void;
};

const PopoverCard = (props: Props) => {
  const { onClose } = props;
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);

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
      if (
        !popperElement?.contains(event.target as Node) &&
        !referenceElement?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [popperElement, onClose, referenceElement]);

  return (
    <>
      {props.children({
        setReferenceElement,
      })}
      {props.show &&
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
    </>
  );
};

export default PopoverCard;
