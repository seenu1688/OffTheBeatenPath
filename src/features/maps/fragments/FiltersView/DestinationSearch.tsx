import React, { useCallback, useMemo, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import AsyncSelect from "react-select/async";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/button";

import { useFilteredDestinations } from "../../hooks/useDestinations";

import { debounce } from "@/lib/utils";

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
    <div className="mb-5">
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

export default DestinationSearch;
