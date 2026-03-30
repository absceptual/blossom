export const dynamic = 'force-dynamic';

import { getJudge0SystemInfo, getJudge0Workers, getJudge0TotalSubmissions, getJudge0Config, getRecentSubmissionsWithTokens } from "@/actions/judge0";
import { HealthCard, WorkersCard } from "@/components/dashboard/judge0/health-card";
import { StatsCard } from "@/components/dashboard/judge0/stats-card";
import { ConfigCard } from "@/components/dashboard/judge0/config-card";

export default async function Judge0Dashboard() {
    const [systemInfo, workers, totalSubmissions, config, recentSubmissions] = await Promise.all([
        getJudge0SystemInfo(),
        getJudge0Workers(),
        getJudge0TotalSubmissions(),
        getJudge0Config(),
        getRecentSubmissionsWithTokens(50),
    ]);

    return (
        <div className="px-4 md:px-8 py-6">
            <div className="container mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <HealthCard data={systemInfo} />
                    <WorkersCard workers={workers} />
                </div>
                <StatsCard totalSubmissions={totalSubmissions} recentSubmissions={recentSubmissions} />
                <ConfigCard config={config} />
            </div>
        </div>
    );
}
