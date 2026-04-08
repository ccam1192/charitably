import { createClient } from "@/lib/supabase/server";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { getNeighborCount, loadDashboardData } from "@/lib/data/dashboard";
import { getMyPendingTasks } from "@/lib/data/tasks";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ stats, activity, assistanceRows, rpcMissing }, neighborCount, myTasks] =
    await Promise.all([
      loadDashboardData(),
      getNeighborCount(),
      user?.id ? getMyPendingTasks(user.id, 5) : Promise.resolve([]),
    ]);

  return (
    <DashboardOverview
      stats={stats}
      activity={activity}
      assistanceRows={assistanceRows}
      rpcMissing={rpcMissing}
      neighborCount={neighborCount}
      myTasks={myTasks}
    />
  );
}
