"use client";

import React, { RefObject, useEffect } from "react";

import { useQuill } from "./editor";

import "quill/dist/quill.snow.css";

type Props = {
  initialValue?: string;
  onChange: (value: string) => void;
};

const QuillEditor = (props: Props) => {
  const { initialValue, onChange } = props;
  const { quill, quillContainerRef } = useQuill();

  useEffect(() => {
    if (quill) {
      const delta = quill.clipboard.convert({
        html: initialValue || "",
      });

      quill.setContents(delta, "silent");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quill]);

  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        onChange(quill.root.innerHTML);
      });
    }
  }, [onChange, quill]);

  return (
    <div style={{ width: 500, height: 140 }}>
      <div ref={quillContainerRef as RefObject<HTMLDivElement>} />
    </div>
  );
};

export default QuillEditor;
