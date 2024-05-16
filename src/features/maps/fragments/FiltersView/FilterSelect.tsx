import Select from "react-select";
import { useShallow } from "zustand/react/shallow";

import {
  filterDestinations,
  useDestinationFilters,
  useDestinations,
} from "../../hooks/useDestinations";

const FilterSelect = () => {
  const { enabled, filters, updateIds } = useDestinationFilters((state) => {
    return {
      filters: state.filters,
      enabled: state.enabled,
      updateIds: state.updateIds,
    };
  });
  const destinations = useDestinations(
    useShallow((state) =>
      enabled
        ? filterDestinations({
            destinations: state.destinations,
            filters,
          })
            .filter((destination) => destination.vendorType !== "destinations")
            .map((d) => ({
              label: d.name,
              value: d.id,
            }))
        : []
    )
  );
  const disabled = filters.length === 1 && filters.includes("destinations");
  const isEnabled = enabled && filters.length > 0 && !disabled;

  return (
    isEnabled && (
      <Select
        closeMenuOnSelect={false}
        onChange={(value) => {
          updateIds(value.map((v) => v.value));
        }}
        components={{
          DropdownIndicator: () => null,
        }}
        isMulti={true}
        options={destinations}
        placeholder="Select..."
      />
    )
  );
};

export default FilterSelect;
