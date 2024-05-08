"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";

import FilterItem from "./FilterItem";

import {
  FilterType,
  filters,
  useDestinationFilters,
} from "../../hooks/useDestinations";

import { cn } from "@/lib/utils";

const ComboInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return (
    <div className="flex items-center rounded-md border-b bg-popover px-3 text-popover-foreground">
      <input
        {...props}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        )}
        placeholder="Search framework..."
      />
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    </div>
  );
});

ComboInput.displayName = "ComboInput";

const Combobox = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();

      setPosition({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }

    const handleClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  console.log(position);

  return (
    <div>
      <ComboInput
        ref={inputRef}
        onFocus={() => {
          setIsOpen(true);
        }}
      />
      <div
        className="fixed z-50 bg-popover transition-all duration-200"
        style={{
          top: position.y + position.height + 5,
          left: position.x - 12,
          width: 310,
        }}
      >
        {isOpen && <div className="p-4">hello</div>}
      </div>
    </div>
  );
};

const FiltersView = () => {
  const {
    filters: selectedFilters,
    removeFilter,
    setFilters,
  } = useDestinationFilters();

  const handleFilterChange = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const value = e.currentTarget.value as FilterType;

      if (selectedFilters.includes(value)) {
        removeFilter(value);
      } else {
        setFilters(value);
      }
    },
    [selectedFilters, removeFilter, setFilters]
  );

  return (
    <div className="p-5">
      <div className="my-6 grid grid-cols-2 gap-4">
        {filters.map((filter) => {
          return (
            <FilterItem
              key={filter.id}
              filter={filter}
              onChange={handleFilterChange}
              selected={selectedFilters.includes(filter.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FiltersView;
