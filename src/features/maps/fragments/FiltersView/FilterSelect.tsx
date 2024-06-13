import { useMemo } from "react";
import Select from "react-select";

import { useDestinationFilters } from "../../hooks/useDestinations";

import { trpcClient } from "@/client";

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
  const { data } = trpcClient.destinations.getAccountSubFilters.useQuery();

  const { enabled, filters, updateIds } = useDestinationFilters((state) => {
    return {
      filters: state.filters,
      enabled: state.enabled,
      updateIds: state.updateIds,
    };
  });

  const subFilters = useMemo(() => {
    if (!enabled || !data) {
      return [];
    }

    const results = data!.reduce(
      (acc, d) => {
        if (!filters.includes(d.type)) return acc;

        if (!acc[d.type])
          acc[d.type] = {
            label: d.type,
            options: [
              {
                label: d.label,
                value: d.value,
              },
            ],
          };

        // remove invalid options
        if (d.value !== "DO NOT USE - OLD OR DUPLICATE VENDOR") {
          acc[d.type].options.push({
            value: d.value,
            label: d.label,
          });
        }

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
  }, [data, enabled, filters]);

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
          updateIds(
            value.map((v) => {
              return v.label;
            })
          );
        }}
        components={{
          DropdownIndicator: () => null,
        }}
        isMulti={true}
        options={subFilters}
        placeholder="Select..."
        formatGroupLabel={formatGroupLabel}
      />
    )
  );
};

export default FilterSelect;
