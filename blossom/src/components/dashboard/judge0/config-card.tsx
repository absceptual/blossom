/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ConfigCard({ config }: { config: any | null }) {
    if (!config) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>No configuration data available</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const entries = Object.entries(config);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Judge0 instance configuration</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Setting</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.map(([key, value]) => (
                            <TableRow key={key}>
                                <TableCell className="text-sm">{formatKey(key)}</TableCell>
                                <TableCell className="text-right font-mono text-sm">{formatValue(value)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function formatKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(value: any): string {
    if (value === null || value === undefined) return "—";
    if (typeof value === 'boolean') return value ? "Yes" : "No";
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}
