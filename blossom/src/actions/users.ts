"use server"
import { verifySession } from "@/lib/dal";
import { UserPermissions } from "@/lib/types";
import { hasPermission } from "@/lib/utilities";
import { Submission } from "@/types/submission";
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function requireManageUsers() {
    const session = await verifySession();
    if (!session) return null;
    const permissions = session.permissions as UserPermissions[];
    if (!hasPermission(permissions, [UserPermissions.MANAGE_USERS])) return null;
    return session;
}

// ─── User Actions ───

export async function getAllUsers() {
    if (!await requireManageUsers()) return [];

    const users = await sql`
        SELECT id, username, code, permissions, rank
        FROM users
        ORDER BY id ASC
    `;
    return users;
}

export async function getUser(username: string) {
    if (!await requireManageUsers()) return null;

    const user = (await sql`
        SELECT id, username, code, permissions, rank
        FROM users WHERE username = ${username}
    `)[0];
    if (!user) return null;

    const [submissionStats, acceptedStats, problemsStarted] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM submissions WHERE username = ${username}`,
        sql`SELECT COUNT(DISTINCT problem_id) as count FROM submissions WHERE username = ${username} AND status = 'Accepted'`,
        sql`SELECT COUNT(*) as count FROM user_problems WHERE username = ${username}`,
    ]);

    return {
        ...user,
        totalSubmissions: Number(submissionStats[0].count),
        acceptedProblems: Number(acceptedStats[0].count),
        problemsStarted: Number(problemsStarted[0].count),
    };
}

export async function updateUserPermissions(username: string, permissions: number[]) {
    if (!await requireManageUsers()) return "Not authorized";

    try {
        await sql`
            UPDATE users SET permissions = ${permissions}
            WHERE username = ${username}
        `;
        return null;
    } catch (error) {
        console.error('Error updating permissions:', error);
        return "Failed to update permissions";
    }
}

export async function updateUsername(oldUsername: string, newUsername: string) {
    if (!await requireManageUsers()) return "Not authorized";

    newUsername = newUsername.toLowerCase().trim();
    if (!newUsername || newUsername.length < 4 || newUsername.length > 14) {
        return "Username must be between 4 and 14 characters";
    }

    const existing = await sql`SELECT id FROM users WHERE username = ${newUsername}`;
    if (existing.length > 0) return "Username already taken";

    try {
        await sql.begin(async (tx) => {
            await tx`UPDATE users SET username = ${newUsername} WHERE username = ${oldUsername}`;
            await tx`UPDATE submissions SET username = ${newUsername} WHERE username = ${oldUsername}`;
            await tx`UPDATE user_problems SET username = ${newUsername} WHERE username = ${oldUsername}`;
        });
        return null;
    } catch (error) {
        console.error('Error renaming user:', error);
        return "Failed to rename user";
    }
}

export async function resetUserPassword(username: string, hash: string) {
    if (!await requireManageUsers()) return "Not authorized";

    if (!hash || !hash.startsWith('$2b$') || hash.length < 50) {
        return "Invalid bcrypt hash. Must be a valid bcrypt hash starting with $2b$";
    }

    try {
        await sql`UPDATE users SET hash = ${hash} WHERE username = ${username}`;
        return null;
    } catch (error) {
        console.error('Error resetting password:', error);
        return "Failed to reset password";
    }
}

export async function getUserSubmissions(username: string) {
    if (!await requireManageUsers()) return [];

    const submissions: Submission[] = await sql`
        SELECT id, problem_id, username, status, date
        FROM submissions
        WHERE username = ${username}
        ORDER BY date DESC
    `;
    return submissions;
}

export async function deleteSubmissions(ids: number[]) {
    if (!await requireManageUsers()) return "Not authorized";
    if (ids.length === 0) return null;

    try {
        await sql`DELETE FROM submissions WHERE id IN ${sql(ids)}`;
        return null;
    } catch (error) {
        console.error('Error deleting submissions:', error);
        return "Failed to delete submissions";
    }
}

export async function deleteUserData(username: string) {
    if (!await requireManageUsers()) return "Not authorized";

    try {
        await sql.begin(async (tx) => {
            await tx`DELETE FROM submissions WHERE username = ${username}`;
            await tx`DELETE FROM user_problems WHERE username = ${username}`;
        });
        return null;
    } catch (error) {
        console.error('Error deleting user data:', error);
        return "Failed to delete user data";
    }
}

export async function deleteUser(username: string) {
    if (!await requireManageUsers()) return "Not authorized";

    try {
        await sql.begin(async (tx) => {
            await tx`DELETE FROM submissions WHERE username = ${username}`;
            await tx`DELETE FROM user_problems WHERE username = ${username}`;
            await tx`DELETE FROM users WHERE username = ${username}`;
        });
        return null;
    } catch (error) {
        console.error('Error deleting user:', error);
        return "Failed to delete user";
    }
}

// ─── Access Code Actions ───

export async function getAllAccessCodes() {
    if (!await requireManageUsers()) return [];

    const codes = await sql`
        SELECT code, current_uses, maximum_uses, permissions
        FROM access_codes
        ORDER BY code ASC
    `;
    return codes;
}

export async function createAccessCode(code: string, maxUses: number, permissions: number[]) {
    if (!await requireManageUsers()) return "Not authorized";

    if (!code || !maxUses) return "Missing required fields";

    const existing = await sql`SELECT code FROM access_codes WHERE code = ${code}`;
    if (existing.length > 0) return "Access code already exists";

    try {
        await sql`
            INSERT INTO access_codes (code, current_uses, maximum_uses, permissions)
            VALUES (${code}, 0, ${maxUses}, ${permissions})
        `;
        return null;
    } catch (error) {
        console.error('Error creating access code:', error);
        return "Failed to create access code";
    }
}

export async function updateAccessCode(code: string, maxUses: number, permissions: number[]) {
    if (!await requireManageUsers()) return "Not authorized";

    try {
        await sql`
            UPDATE access_codes
            SET maximum_uses = ${maxUses}, permissions = ${permissions}
            WHERE code = ${code}
        `;
        return null;
    } catch (error) {
        console.error('Error updating access code:', error);
        return "Failed to update access code";
    }
}

export async function deleteAccessCode(code: string) {
    if (!await requireManageUsers()) return "Not authorized";

    try {
        await sql`DELETE FROM access_codes WHERE code = ${code}`;
        return null;
    } catch (error) {
        console.error('Error deleting access code:', error);
        return "Failed to delete access code";
    }
}
