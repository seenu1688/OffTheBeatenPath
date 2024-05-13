"use client";

import {
  RedirectType,
  redirect,
  useParams,
  usePathname,
} from "next/navigation";

import Loader from "@/components/Loader";

import { trpcClient } from "@/client";

const DeparturePage = () => {
  const params = useParams<{ id: string }>();
  const pathName = usePathname();
  const { isLoading, isError, error } = trpcClient.departures.getById.useQuery(
    params.id
  );

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

  return redirect(`${pathName}/planner`, RedirectType.replace);
};

export default DeparturePage;
