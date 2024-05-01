import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs";
import TravelRoutes from "./TravleRoutes";

import { cn } from "@/lib/utils";

const Sidebar = () => {
  return (
    <div
      className={cn(
        "w-[350px] h-full shadow-md bg-[#f3f3f3] flex flex-col gap-4",
        "relative overflow-hidden"
      )}
    >
      <Tabs defaultValue="map" className="w-full h-full">
        <TabsList className="w-full">
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="filter">Filter</TabsTrigger>
        </TabsList>
        <TabsContent value="map" className="p-4 overflow-y-auto pb-10 h-[calc(100%-46px)]">
          <TravelRoutes />
        </TabsContent>
        <TabsContent value="filter" className="h-[calc(100%-46px)]">
          <div className="flex items-center justify-center h-full">
            Filters
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sidebar;
