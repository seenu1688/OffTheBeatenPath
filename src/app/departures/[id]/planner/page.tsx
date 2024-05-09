"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

import Loader from "@/components/Loader";

import { trpcClient } from "@/client";

const PlannerView = dynamic(() => import("@/features/plan"), {
  loading: () => <Loader />,
});

const PlannerPage = () => {
  const params = useParams<{ id: string }>();

  const { data } = trpcClient.departures.getById.useQuery(params.id);

  if (!data) return <Loader />;

  return <PlannerView departure={data} />;
};

export default PlannerPage;
