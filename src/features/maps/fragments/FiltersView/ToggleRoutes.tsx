import { Label } from "@/components/label";
import { Switch } from "@/components/switch";

import { useLocations } from "../../hooks/useLocations";

const ToggleRoutes = () => {
  const { toggleLocations, enabled } = useLocations();

  return (
    <div className="flex items-center justify-end gap-4">
      <Label>Show Routes</Label>
      <Switch checked={enabled} onCheckedChange={toggleLocations} />
    </div>
  );
};

export default ToggleRoutes;
