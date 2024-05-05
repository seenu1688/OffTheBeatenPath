"use client";

import { useState } from "react";
import { DialogContent } from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs";
import { Dialog, DialogPortal, DialogTrigger } from "@/components/dialog";
import TravelRoutes from "./TravelRoutes";

import { cn } from "@/lib/utils";

const SidebarContent = () => {
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
        <TabsContent
          value="map"
          className="p-4 overflow-y-auto pb-10 h-[calc(100%-46px)]"
        >
          <TravelRoutes />
        </TabsContent>
        <TabsContent value="filter" className="h-[calc(100%-46px)]">
          <div className="flex items-center justify-center h-full">Filters</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Sidebar = () => {
  const [open, setOpen] = useState(true);

  return (
    <Dialog
      onOpenChange={(value) => {
        setOpen(value);
      }}
      defaultOpen={true}
    >
      <DialogTrigger
        className={cn(
          "fixed top-5 left-5 z-[10] data-[state=open]:translate-x-[350px] transition-transform duration-200 ease-in-out",
          "bg-orange-500 text-white rounded-sm px-2 py-1 shadow-md cursor-pointer"
        )}
      >
        {open ? <ChevronLeft /> : <ChevronRight />}
      </DialogTrigger>
      <DialogPortal>
        <DialogContent
          className="fixed top-0 left-0 h-full data-[state=closed]:animate-slide-left data-[state=open]:animate-slide-right"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <SidebarContent />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default Sidebar;
