import jsforce from "jsforce";

import { Context } from "./context";

export const salesforceClient = (session: Context["session"]) => {
  return new jsforce.Connection({
    instanceUrl: session!.instance_url,
    accessToken: session!.access_token,
  });
};
