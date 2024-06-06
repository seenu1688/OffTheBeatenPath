import { useRef, useEffect, useState } from "react";

import Quill, { QuillOptions } from "quill";

const theme = "snow";

const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ size: ["small", false, "large", "huge"] }],
    ["link"],
    [{ color: [] }],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  "bold",
  "italic",
  "underline",
  "strike",
  "align",
  "list",
  "indent",
  "size",
  "header",
  "link",
  "color",
];

function assign(target: any, _varArgs: any) {
  "use strict";
  if (target === null || target === undefined) {
    throw new TypeError("Cannot convert undefined or null to object");
  }

  const to = Object(target);

  for (let index = 1; index < arguments.length; index++) {
    const nextSource = arguments[index];

    if (nextSource !== null && nextSource !== undefined) {
      for (const nextKey in nextSource) {
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
}

export const useQuill = (
  options: QuillOptions | undefined = { theme, modules, formats }
) => {
  const [quillRef, setQuillRef] = useState<Quill | null>(null);
  const quillContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (quillContainerRef.current && !quillRef) {
      const opts = assign(options, {
        modules: assign(modules, options.modules),
        formats: options.formats || formats,
        theme: options.theme || theme,
      });

      setQuillRef(new Quill(quillContainerRef.current, opts));
    }
  }, [options, quillRef]);

  return {
    quillContainerRef,
    quill: quillRef,
  };
};
