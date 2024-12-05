import React from "react";
import { client } from "@/sanity/lib/client";
import { STARTUP_VIEWS_QUERY } from "@/lib/queries";

import Ping from "@/components/Ping";
import { formatNumber } from "@/lib/utils";

const View = async ({ id }: { id: string }) => {
  const { views } = await client
    .withConfig({ useCdn: false })
    .fetch(STARTUP_VIEWS_QUERY, { id });
  return (
    <div className="flex">
      {formatNumber(views || 1)}
      <div className="" style={{ transform: "translate(16px, -1px)" }}>
        <Ping />
      </div>
    </div>
  );
};

export default View;
