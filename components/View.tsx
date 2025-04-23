import { after } from "next/server";

import Ping from "@/components/Ping";
import { formatNumber } from "@/lib/utils";
import Tooltip from "./Tooltip";
import { mongoFetch } from "@/lib/live";
import { getStartupViews } from "@/lib/queries";
import { updateStartupViews } from "@/lib/mutations";
const View = async ({ id }: { id: string }) => {
  // Get views directly from MongoDB service
  const views = await getStartupViews(id);

  return (
    <Tooltip text={`${views} Views`}>
      <div className="flex">
        {formatNumber(views || 0)}
        <div className="" style={{ transform: "translate(16px, -1px)" }}>
          <Ping />
        </div>
      </div>
    </Tooltip>
  );
};

const ViewUpdate = async ({ id }: { id: string }) => {
  if (typeof window !== "undefined" && id) {
    try {
      const hasViewed = sessionStorage.getItem(`viewed_${id}`);
      if (!hasViewed) {
        // Use MongoDB function to update views
        await updateStartupViews(id);
        sessionStorage.setItem(`viewed_${id}`, "true");
      }
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  }
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
