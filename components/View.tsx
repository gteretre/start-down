import { unstable_after as after } from "next/server";
import { client } from "@/sanity/lib/client";

import Ping from "@/components/Ping";
import Tooltip from "./Tooltip";
import { formatNumber } from "@/lib/utils";
import { writeClient } from "@/sanity/lib/write-client";
import { STARTUP_VIEWS_QUERY } from "@/lib/queries";

const View = async ({ id }: { id: string }) => {
  const { views } = await client
    .withConfig({ useCdn: false })
    .fetch(STARTUP_VIEWS_QUERY, { id });
  return (
    <div className="flex group">
      <Tooltip text={`${views} views`}>
        <span className="">{formatNumber(views || 1)}</span>
      </Tooltip>
      <div className="" style={{ transform: "translate(16px, -1px)" }}>
        <Ping />
      </div>
    </div>
  );
};

const ViewUpdate = async ({ id }: { id: string }) => {
  const { views } = await client
    .withConfig({ useCdn: false })
    .fetch(STARTUP_VIEWS_QUERY, { id });

  after(
    async () =>
      await writeClient
        .patch(id)
        .set({ views: views + 1_000_000_000 })
        .commit()
  );

  return;
};

export default View;
export { View, ViewUpdate };
