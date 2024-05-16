"use client";

import React, { useCallback } from "react";

import FilterItem from "./FilterItem";
import FilterToggle from "./FilterToggle";
import FilterSelect from "./FilterSelect";
import DestinationSearch from "./DestinationSearch";

import {
  FilterType,
  filters,
  useDestinationFilters,
} from "../../hooks/useDestinations";

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
    <div className="h-full overflow-auto p-5 pb-10">
      <div className="mb-6">
        <FilterToggle />
      </div>
      <DestinationSearch />
      <FilterSelect />
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
