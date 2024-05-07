"use client";

import { useState } from "react";
import { DialogContent } from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs";
import { Dialog, DialogTrigger } from "@/components/dialog";
import TravelRoutes from "./TravelRoutes";

import { cn } from "@/lib/utils";

const SidebarContent = () => {
  return (
    <div
      className={cn(
        "flex h-full w-[350px] flex-col gap-4 bg-[#f3f3f3] shadow-md",
        "relative overflow-hidden"
      )}
    >
      <Tabs defaultValue="map" className="h-full w-full">
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
          <div className="flex h-full items-center justify-center">Filters</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Sidebar = () => {
  const [open, setOpen] = useState(true);

  return (
    <Dialog onOpenChange={setOpen} defaultOpen={true}>
      <DialogTrigger
        className={cn(
          "fixed left-5 top-5 z-[10] transition-transform duration-200 ease-in-out data-[state=open]:translate-x-[350px]",
          "cursor-pointer rounded-sm bg-orange-500 px-2 py-1 text-white shadow-md"
        )}
      >
        {open ? <ChevronLeft /> : <ChevronRight />}
      </DialogTrigger>
      <DialogContent
        className="bg-[#f3f3f3] transition-all duration-200 ease-in-out"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SidebarContent />
      </DialogContent>
    </Dialog>
  );
};

export default Sidebar;
