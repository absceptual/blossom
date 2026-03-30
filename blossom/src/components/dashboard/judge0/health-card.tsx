/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function HealthCard({ data }: { data: { systemInfo: any; about: any; reachable: boolean } | null }) {
    if (!data || !data.reachable) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        System Health
                        <Badge variant="destructive">Unreachable</Badge>
                    </CardTitle>
                    <CardDescription>Unable to connect to Judge0 instance</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const sys = data.systemInfo;
    const about = data.about;

    const hasCpuInfo = sys?.cpu_model || sys?.cpu_count || sys?.cpu_usage !== undefined;
    const hasMemInfo = sys?.total_memory || sys?.used_memory;

    const memUsedPct = hasMemInfo ? Math.round((sys.used_memory / sys.total_memory) * 100) : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    System Health
                    <Badge variant="outline" className="bg-green-400 text-white">Online</Badge>
                </CardTitle>
                <CardDescription>
                    {about?.version ? `Judge0 CE ${about.version}` : "Judge0 CE"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    {hasCpuInfo || hasMemInfo ? (
                        <div className="grid grid-cols-2 gap-4">
                            {hasCpuInfo && (
                                <div>
                                    <p className="text-sm text-muted-foreground">CPU</p>
                                    <p className="text-sm font-medium">{sys.cpu_model || "Unknown"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {sys.cpu_count ? `${sys.cpu_count} cores` : ""}
                                        {sys.cpu_count && sys.cpu_usage !== undefined ? " · " : ""}
                                        {sys.cpu_usage !== undefined ? `${sys.cpu_usage}% usage` : ""}
                                    </p>
                                </div>
                            )}
                            {hasMemInfo && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Memory</p>
                                    <p className="text-sm font-medium">{formatBytes(sys.used_memory)} / {formatBytes(sys.total_memory)}</p>
                                    <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${memUsedPct > 80 ? 'bg-red-500' : memUsedPct > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            style={{ width: `${memUsedPct}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{memUsedPct}% used · {formatBytes(sys.available_memory)} free</p>
                                </div>
                            )}
                        </div>
                    ) : sys ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Property</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(sys).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell className="text-sm">{key}</TableCell>
                                        <TableCell className="text-right font-mono text-sm">{String(value)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

export function WorkersCard({ workers }: { workers: any[] | null }) {
    if (!workers || !Array.isArray(workers)) {
        const workerObj = workers as any;
        if (workerObj && typeof workerObj === 'object' && !Array.isArray(workerObj)) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Workers</CardTitle>
                        <CardDescription>Worker status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Property</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(workerObj).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell className="text-sm">{key}</TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Workers</CardTitle>
                    <CardDescription>No worker data available</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Workers</CardTitle>
                <CardDescription>{workers.length} worker queue{workers.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {workers.map((worker: any, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-md border p-3">
                            <span className="text-sm font-mono">{worker.queue}</span>
                            <div className="flex gap-3 text-xs">
                                <span>Available: <strong>{worker.available}</strong></span>
                                <span>Idle: <strong>{worker.idle}</strong></span>
                                <span>Working: <strong>{worker.working}</strong></span>
                                <span>Paused: <strong>{worker.paused}</strong></span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function formatBytes(kb: number): string {
    if (!kb) return "0 KB";
    if (kb >= 1048576) return `${(kb / 1048576).toFixed(1)} GB`;
    if (kb >= 1024) return `${(kb / 1024).toFixed(0)} MB`;
    return `${kb} KB`;
}
