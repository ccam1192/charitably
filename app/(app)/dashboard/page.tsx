import { createClient } from "@/lib/supabase/server";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { getNeighborCount, loadDashboardData } from "@/lib/data/dashboard";
import { getMyPendingTaskCount, getMyPendingTasks } from "@/lib/data/tasks";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ activity, assistanceRows, rpcMissing }, neighborCount, myTasks, myOpenTaskCount] =
    await Promise.all([
      loadDashboardData(),
      getNeighborCount(),
      user?.id ? getMyPendingTasks(user.id, 5) : Promise.resolve([]),
      user?.id ? getMyPendingTaskCount(user.id) : Promise.resolve(0),
    ]);

  return (
    <DashboardOverview
      activity={activity}
      assistanceRows={assistanceRows}
      rpcMissing={rpcMissing}
      neighborCount={neighborCount}
      myTasks={myTasks}
      myOpenTaskCount={myOpenTaskCount}
    />
  );
}
