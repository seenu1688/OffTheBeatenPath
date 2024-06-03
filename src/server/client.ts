import jsforce from "jsforce";
import qs from "qs";

import { Context } from "./context";

export const salesforceClient = (session: Context["session"]) => {
  return new jsforce.Connection({
    instanceUrl: session!.instance_url,
    accessToken: session!.access_token,
  });
};

type GetProps = {
  searchParams?: Record<string, string>;
  headers?: Record<string, string>;
  replaceUrl?: boolean;
};

type PostProps<B> = GetProps & { body?: B };

export const createApexClient = ({
  accessToken,
  instanceUrl,
}: {
  accessToken: string;
  instanceUrl: string;
}) => {
  const apiUrl = `${instanceUrl}/services/apexrest/designStudio`;
  const defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  return {
    get: async <T>(url: string, props: GetProps) => {
      const params = qs.stringify(props.searchParams);

      let finalUrl = `${apiUrl}${url}`;

      if (props.replaceUrl) {
        finalUrl = `${instanceUrl}${url}`;
      }

      if (params) {
        finalUrl = `${apiUrl}${url}?${params}`;
      }

      const response = await fetch(finalUrl, {
        headers: {
          ...defaultHeaders,
          ...props.headers,
        },
      });

      return (await response.json()) as T;
    },
    post: async <T, B extends Object>(url: string, props: PostProps<B>) => {
      const response = await fetch(`${apiUrl}${url}`, {
        method: "POST",
        headers: {
          ...defaultHeaders,
          ...props.headers,
        },
        body: JSON.stringify(props.body),
      });

      const json = await response.json();

      if (response.status >= 400) {
        throw new Error(
          JSON.stringify({
            data: json,
            code: response.status,
          })
        );
      }

      return json as T;
    },
    put: async <T, B>(url: string, props: PostProps<B>) => {
      const response = await fetch(`${apiUrl}${url}`, {
        method: "PUT",
        headers: {
          ...defaultHeaders,
          ...props.headers,
        },
        body: JSON.stringify(props.body),
      });

      const json = await response.json();

      if (response.status >= 400) {
        throw new Error(
          JSON.stringify({
            data: json,
            code: response.status,
          })
        );
      }

      return json as T;
    },
    delete: async <T>(
      url: string,
      props: GetProps & {
        searchParams: {
          sObjectName: string;
          recordId: string;
        };
      }
    ) => {
      const params = qs.stringify(props.searchParams);

      let finalUrl = `${apiUrl}${url}`;

      if (params) {
        finalUrl = `${apiUrl}${url}?${params}`;
      }

      const response = await fetch(finalUrl, {
        method: "DELETE",
        headers: {
          ...defaultHeaders,
          ...props.headers,
        },
      });

      return (await response.json()) as T;
    },
  };
};
