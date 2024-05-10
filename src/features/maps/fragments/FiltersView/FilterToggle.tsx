import { Label } from "@/components/label";
import { Switch } from "@/components/switch";

import { useDestinationFilters } from "../../hooks/useDestinations";

const FilterToggle = () => {
  const { toggleFilters, enabled } = useDestinationFilters();

  return (
    <div className="flex items-center justify-end gap-4">
      <Label>Show Pins</Label>
      <Switch checked={enabled} onCheckedChange={toggleFilters} />
    </div>
  );
};

export default FilterToggle;
