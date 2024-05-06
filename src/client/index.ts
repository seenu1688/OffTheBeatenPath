import { httpLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';

import { AppRouter } from '@/server';

function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return '';

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

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
