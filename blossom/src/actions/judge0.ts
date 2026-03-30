"use server"
import { verifySession } from "@/lib/dal";
import { UserPermissions } from "@/lib/types";
import { hasPermission } from "@/lib/utilities";
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || "");

const JUDGE_URL = process.env.JUDGE_URL || "";
const JUDGE_HEADERS = {
    'X-Auth-Token': process.env.JUDGE_API_KEY || "",
    'Content-Type': 'application/json'
};

async function requireViewJudge0() {
    const session = await verifySession();
    if (!session) return false;
    return hasPermission(session.permissions as UserPermissions[], [UserPermissions.VIEW_JUDGE0_CONFIG]);
}

async function judge0Fetch(path: string) {
    try {
        const res = await fetch(`${JUDGE_URL}${path}`, {
            headers: JUDGE_HEADERS,
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function getJudge0SystemInfo() {
    if (!await requireViewJudge0()) return null;

    const [systemInfo, about] = await Promise.all([
        judge0Fetch('/system_info'),
        judge0Fetch('/about'),
    ]);

    return { systemInfo, about, reachable: systemInfo !== null };
}

export async function getJudge0Workers() {
    if (!await requireViewJudge0()) return null;
    return await judge0Fetch('/workers');
}

export async function getJudge0Statistics() {
    if (!await requireViewJudge0()) return null;
    return await judge0Fetch('/statistics');
}

export async function getJudge0Config() {
    if (!await requireViewJudge0()) return null;
    return await judge0Fetch('/config_info');
}

export async function getJudge0Submission(token: string) {
    if (!await requireViewJudge0()) return null;
    if (!token) return null;
    return await judge0Fetch(`/submissions/${token}?base64_encoded=true&fields=source_code,stdin,expected_output,status,created_at,finished_at,command_line_arguments`);
}

export async function getJudge0TotalSubmissions() {
    if (!await requireViewJudge0()) return null;
    try {
        const result = await sql`SELECT COUNT(*) as count FROM submissions`;
        return Number(result[0].count);
    } catch {
        return null;
    }
}

export async function getRecentSubmissionsWithTokens(count: number = 50) {
    if (!await requireViewJudge0()) return null;
    try {
        const rows = await sql`
            SELECT id, problem_id, username, status, date, token
            FROM submissions
            WHERE token IS NOT NULL
            ORDER BY date DESC
            LIMIT ${count}
        `;
        return rows;
    } catch {
        return null;
    }
}

export async function searchSubmissions(filters: { username?: string; problemId?: string; status?: string }) {
    if (!await requireViewJudge0()) return null;
    try {
        const rows = await sql`
            SELECT id, problem_id, username, status, date, token
            FROM submissions
            WHERE token IS NOT NULL
            ${filters.username ? sql`AND username ILIKE ${'%' + filters.username + '%'}` : sql``}
            ${filters.problemId ? sql`AND problem_id ILIKE ${'%' + filters.problemId + '%'}` : sql``}
            ${filters.status ? sql`AND status = ${filters.status}` : sql``}
            ORDER BY date DESC
            LIMIT 100
        `;
        return rows;
    } catch {
        return null;
    }
}

export async function deleteSubmission(id: number) {
    if (!await requireViewJudge0()) return "Not authorized";
    try {
        await sql`DELETE FROM submissions WHERE id = ${id}`;
        return null;
    } catch {
        return "Failed to delete submission";
    }
}

