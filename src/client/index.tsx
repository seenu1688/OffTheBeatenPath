import { httpLink, createTRPCClient } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import { AppRouter } from "@/server";
import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpcClient = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      abortOnUnmount: true,
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      },
      links: [
        httpLink({
          url: `${getBaseUrl()}/api/trpc`,
          async headers() {
            if (!ctx?.req?.headers) {
              return {};
            }

            const { connection: _connection, ...headers } = ctx.req.headers;
            return headers;
          },
          transformer: superjson,
        }),
      ],
    };
  },
  transformer: superjson,
  ssr: false,
});

export const trpcStandAloneClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

function ClientProvider(props: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}

export const TrpcClientProvider = trpcClient.withTRPC(
  ClientProvider
) as typeof ClientProvider;
