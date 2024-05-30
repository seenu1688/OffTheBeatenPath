"use client";

import { useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

import Loader from "@/components/Loader";
import { useDestinations } from "@/features/maps/hooks/useDestinations";

import { trpcClient, trpcStandAloneClient } from "@/client";
import { useLocations } from "@/features/maps/hooks/useLocations";
import { useShallow } from "zustand/react/shallow";

const PlannerView = dynamic(() => import("@/features/plan"), {
  loading: () => <Loader />,
});

const PlannerPage = () => {
  const params = useParams<{ id: string }>();

  const { data, error, isLoading, isError } =
    trpcClient.departures.getById.useQuery(params.id);

  const setDestinations = useDestinations((state) => state.setDestinations);
  const setLocations = useLocations(useShallow((state) => state.setLocations));

  const loadData = useCallback(() => {
    trpcStandAloneClient.destinations.list.query().then((data) => {
      setDestinations((prev) => {
        return [...prev, ...data];
      });
    });
    trpcStandAloneClient.destinations.accounts.query().then((data) => {
      setDestinations((prev) => {
        return [...prev, ...data];
      });
    });
  }, [setDestinations]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (data && data.routeInfo) {
      const routeInfo = JSON.parse(data.routeInfo);

      setLocations(routeInfo);
    }
  }, [data, setLocations]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        {error.message}
      </div>
    );
  }

  if (!data) return <Loader />;

  return <PlannerView departure={data} />;
};

export default PlannerPage;
