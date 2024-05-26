import Select from "react-select";
import { useShallow } from "zustand/react/shallow";

import {
  filterDestinations,
  useDestinationFilters,
  useDestinations,
} from "../../hooks/useDestinations";

const groupStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

type GroupedOption = {
  label: string;
  options: { value: string; label: string }[];
};

const FilterSelect = () => {
  const { enabled, filters, updateIds } = useDestinationFilters((state) => {
    return {
      filters: state.filters,
      enabled: state.enabled,
      updateIds: state.updateIds,
    };
  });
  const destinations = useDestinations(
    useShallow((state) => {
      if (!enabled) {
        return [];
      }

      const results = filterDestinations({
        destinations: state.destinations,
        filters,
      })
        .filter((destination) => destination.vendorType !== "destinations")
        .reduce(
          (acc, d) => {
            if (!acc[d.vendorType]) {
              acc[d.vendorType] = {
                label: d.vendorName,
                options: [
                  {
                    value: d.id,
                    label: d.name,
                  },
                ],
              };

              return acc;
            }

            acc[d.vendorType].options.push({
              value: d.id,
              label: d.name,
            });

            return acc;
          },
          {} as Record<
            string,
            {
              label: string;
              options: { value: string; label: string }[];
            }
          >
        );

      return Object.values(results);
    })
  );
  const disabled = filters.length === 1 && filters.includes("destinations");
  const isEnabled = enabled && filters.length > 0 && !disabled;

  const formatGroupLabel = (data: GroupedOption) => (
    <div style={groupStyles}>
      <span>{data.label}</span>
    </div>
  );

  return (
    isEnabled && (
      <Select<
        {
          label: string;
          value: string;
        },
        true,
        GroupedOption
      >
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
        formatGroupLabel={formatGroupLabel}
      />
    )
  );
};

export default FilterSelect;
