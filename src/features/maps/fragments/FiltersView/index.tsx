"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Search } from "lucide-react";
import AsyncSelect from "react-select/async";

import FilterItem from "./FilterItem";
import { Button } from "@/components/button";

import {
  FilterType,
  filters,
  useDestinationFilters,
  useFilteredDestinations,
} from "../../hooks/useDestinations";

import { debounce } from "@/lib/utils";
import { toast } from "sonner";
import { useMap } from "@vis.gl/react-google-maps";

const DestinationSearch = () => {
  const destinations = useFilteredDestinations();
  const map = useMap();
  const [selectedOption, setSelectedOption] = useState<{
    label: string;
    value: string;
  } | null>(null);

  const filterData = useCallback(
    async (value: string) => {
      return Promise.resolve(
        destinations
          .filter((destination) => {
            return destination.name.toLowerCase().includes(value.toLowerCase());
          })
          .map((destination) => ({
            value: destination.id,
            label: destination.name,
          }))
      );
    },
    [destinations]
  );

  const debouncedSearch = useMemo(
    () => debounce(filterData, 200),
    [filterData]
  );

  const handleSelect = useCallback(
    (option: { label: string; value: string }) => {
      setSelectedOption(option);
    },
    [setSelectedOption]
  );

  const goToLocation = useCallback(() => {
    if (!selectedOption) {
      return;
    }

    const destination = destinations.find((d) => d.id === selectedOption.value);

    if (
      !destination ||
      !destination.geolocation.lat ||
      !destination.geolocation.lng
    ) {
      toast.error("Destination don't have valid co-ordinates", {
        style: {
          backgroundColor: "#ff0000",
          color: "#fff",
        },
      });
      return;
    }

    map?.panTo({
      lat: destination.geolocation.lat,
      lng: destination.geolocation.lng,
    });
    map?.setZoom(15);
  }, [destinations, map, selectedOption]);

  return (
    <div>
      <AsyncSelect
        styles={{
          control: (provided) => ({
            ...provided,
            border: "1px solid #e2e8f0",
          }),
        }}
        loadOptions={debouncedSearch as any}
        isClearable={true}
        placeholder="Type to search..."
        components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => <Search className="pr-3" size={28} />,
        }}
        onChange={handleSelect as any}
      />
      <div className="mt-4 flex items-center justify-end">
        <Button
          variant="outline"
          onClick={goToLocation}
          disabled={!selectedOption}
        >
          Go To
        </Button>
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
      <DestinationSearch />
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
