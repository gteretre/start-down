import { after } from "next/server";
import { client } from "@/sanity/lib/client";

import Ping from "@/components/Ping";
import { formatNumber } from "@/lib/utils";
import { writeClient } from "@/sanity/lib/write-client";
import { STARTUP_VIEWS_QUERY } from "@/lib/queries";
import Tooltip from "./Tooltip";

const View = async ({ id }: { id: string }) => {
  const { views } = await client
    .withConfig({ useCdn: false })
    .fetch(STARTUP_VIEWS_QUERY, { id });

  return (
    <Tooltip text={`${views} Views`}>
      <div className="flex">
        {formatNumber(views || 1)}
        <div className="" style={{ transform: "translate(16px, -1px)" }}>
          <Ping />
        </div>
      </div>
    </Tooltip>
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
        .set({ views: views + 1 })
        .commit()
  );

  return;
};

// const ViewUpdate = async ({ id }: { id: string }) => {
//   if (typeof window !== "undefined" && id) {
//     try {
//       const hasViewed = sessionStorage.getItem(`viewed_${id}`);
//       if (!hasViewed) {
//         await writeClient
//           .transaction()
//           .patch(id, (patch) => patch.inc({ views: 1 }))
//           .commit();
//         sessionStorage.setItem(`viewed_${id}`, "true");
//       }
//     } catch (error) {
//       console.error("Error updating view count:", error);
//     }
//   }
//   return;
// };

export default View;
export { View, ViewUpdate };
