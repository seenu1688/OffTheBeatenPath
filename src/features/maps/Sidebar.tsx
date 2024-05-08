"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs";
import TravelRoutes from "./TravelRoutes";
import FiltersView from "./fragments/FiltersView";

import { cn } from "@/lib/utils";

const SidebarContent = () => {
  return (
    <div
      className={cn(
        "flex h-full w-[350px] flex-col gap-4 bg-[#f3f3f3] shadow-md",
        "relative overflow-hidden"
      )}
    >
      <Tabs defaultValue="filter" className="h-full w-full">
        <TabsList className="w-full">
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="filter">Filter</TabsTrigger>
        </TabsList>
        <TabsContent
          value="map"
          className="h-[calc(100%-46px)] overflow-y-auto p-4 pb-10"
        >
          <TravelRoutes />
        </TabsContent>
        <TabsContent value="filter" className="h-[calc(100%-46px)]">
          <FiltersView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Sidebar = () => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <button
        aria-label="Toggle Sidebar"
        className={cn(
          "fixed left-5 top-5 z-[10] transition-transform duration-200 ease-in-out data-[state=open]:translate-x-[350px]",
          "cursor-pointer rounded-sm bg-primary px-2 py-1 text-primary-foreground shadow-md"
        )}
        data-state={open ? "open" : "closed"}
        onClick={setOpen.bind(null, !open)}
      >
        {open ? <ChevronLeft /> : <ChevronRight />}
      </button>
      <div
        className={cn(
          "invisible w-0 bg-[#f3f3f3] transition-all duration-200 ease-in-out",
          open && "visible w-auto"
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
