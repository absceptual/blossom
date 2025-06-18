"use server"
import { verifySession } from "@/lib/dal";
import { decrypt } from "@/lib/session";
import { UserPermissions } from "@/lib/types";
import { hasPermission } from "@/lib/utilities";
import { Problem, FetchedProblem, Submission, SubmissionStatusType } from "@/types/submission";
import { del, list } from "@vercel/blob";
import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(process.env.DATABASE_URL);

export async function createSubmissionEntry(submission: Submission) {
    const session = await verifySession();
    if (!session) return false;

    const username: string = session?.username as string;
    try {
        await sql`
            INSERT INTO submissions(problem_id, username, status, date)
            VALUES (${submission.problem_id}, ${username}, ${submission.status}, ${new Date(submission.date)})
        `;
        return true;
    } catch (error) {
        console.error('Error creating submission:', error);
        return false;
    }
}

export async function getCurrentEditorSubmission(problemId: string) {
    const session = await verifySession();
    if (!session || !problemId) return { status: "Not Submitted" as SubmissionStatusType };

    const username = session?.username as string;
    const submission = (await getRecentUserSubmissionsByProblem(problemId, username, 1))?.[0];
    if (submission === null || submission === undefined) return { status: "Not Submitted" as SubmissionStatusType }

    return submission;
}

export async function deleteProblem(problemId: string) {
    const session = await verifySession();
    if (!session) return false;

    const permissions = (await decrypt(session)).permissions;
    if (!hasPermission(permissions, [UserPermissions.DELETE_PROBLEMS]))
        return false;

    try {
        // Delete problem from the database
        await sql`
            DELETE FROM problems
            WHERE problem_id = ${problemId}::text
        `;

        // Delete associated files from blob storage
        await Promise.all([
            list({ prefix: `data/${problemId}/sample/` }).then(blobs => blobs.blobs.forEach(blob => del(blob.url))),
            list({ prefix: `data/${problemId}/judge/` }).then(blobs => blobs.blobs.forEach(blob => del(blob.url)))
        ]);

        return true;
    } catch (error) {
        console.error('Error deleting problem:', error);
        return false;
    }
}
export async function getRecentUserSubmissionsByProblem(problemId: string, username: string, count: number) {
    const session = await verifySession();
    if (!session) return null;

    try {
        const submissions: Submission[] = await sql`
            SELECT * FROM submissions
            WHERE problem_id = ${problemId}::text
            AND username = ${username}::text
            ORDER BY date DESC
            LIMIT ${count}
        `;

        return submissions;
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return null;
    }
}

export async function getGlobalRecentSubmissions(count: number) {
    try {
        const submissions: Submission[] = await sql`
            SELECT * FROM submissions
            ORDER BY date DESC
            LIMIT ${count}
        `;

        return submissions;
    } catch (error) {
        console.error('Error fetching global submissions:', error);
        return null;
    }
}

export async function getRecentSubmissionsByUser(username: string, count: number) {
    const session = await verifySession();
    if (!session) return null;

    try {
        const submissions: Submission[] = await sql`
            SELECT * FROM submissions
            WHERE username = ${username}::text
            ORDER BY date DESC
            LIMIT ${count}
        `;

        return submissions;
    } catch (error) {
        console.error('Error fetching user submissions:', error);
        return null;
    }
}

export async function getProblem(problemId: string) {
    const session = await verifySession();
    if (!session) return null;

    const problem = await sql`
        SELECT id, problem_id, problem_year, competition_level, problem_name, tags FROM problems
        WHERE problem_id = ${problemId}::text
    `;

    return problem[0] as Problem;
}

export async function getExistingProblemFiles(problemId: string) {
    const session = await verifySession();
    if (!session) return null;

    const [sampleBlobs, judgeBlobs] = await Promise.all([
        list({ prefix: `data/${problemId}/sample/` }),
        list({ prefix: `data/${problemId}/judge/` })
    ]);

    // Return blob metadata instead of File objects
    const sampleFileMetadata = sampleBlobs.blobs.map(blob => ({
        url: blob.url,
        name: blob.pathname.split('/').pop() || '',
        size: blob.size,
        uploadedAt: blob.uploadedAt.getTime(),
        type: 'text/plain'
    })).filter(blob => blob.name !== ''); // Filter out empty names

    const judgeFileMetadata = judgeBlobs.blobs.map(blob => ({
        url: blob.url,
        name: blob.pathname.split('/').pop() || '',
        size: blob.size,
        uploadedAt: blob.uploadedAt.getTime(),
        type: 'text/plain'
    })).filter(blob => blob.name !== '');

    return { sampleFiles: sampleFileMetadata, judgeFiles: judgeFileMetadata };
}

export async function getAvailableProblems() {
    const session = await verifySession();
    if (!session) return [];

    const problems = await sql`
        SELECT id, problem_id, problem_year, competition_level, problem_name, tags FROM problems
        ORDER BY problem_year DESC, competition_level ASC, problem_name ASC
    `;

    return problems;
}

export async function startProblem(problemId: string) {
    const session = await verifySession();
    if (!session) return null;

    const username = session?.username as string;

    try {
        // Insert or update the user_problems entry
        await sql`
            INSERT INTO user_problems (username, problem_id, last_worked)
            VALUES (${username}::varchar(255), ${problemId}::text, CURRENT_TIMESTAMP)
            ON CONFLICT (problem_id)
            DO UPDATE SET last_worked = CURRENT_TIMESTAMP
        `;
        return true;
    } catch (error) {
        console.error('Error starting problem:', error);
        return false;
    }
}

export async function getLeaderboardData(username: string) {
    const session = await verifySession();
    if (!session) return null;

    try {
        // Get top 5 users
        const topUsers = await sql`
            SELECT username, rank
            FROM users
            WHERE rank IS NOT NULL
            ORDER BY rank ASC
            LIMIT 5;
        `;

        // Get current user's rank if not in top 5
        const currentUser = await sql`
            SELECT username, rank
            FROM users
            WHERE username = ${username}::text;
        `;

        return {
            topUsers: topUsers.map(user => ({
                name: user.username,
                rank: user.rank
            })),
            currentUser: currentUser[0] ? {
                name: currentUser[0].username,
                rank: currentUser[0].rank
            } : null
        };
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        return {};
    }
} 

export async function getAcceptedSubmissionsByLevel(username: string) {
    const session = await verifySession();
    if (!session) return null;

    try {
        const submissions = await sql`
            WITH unique_accepted_problems AS (
                SELECT DISTINCT s.problem_id
                FROM submissions s
                WHERE s.username = ${username}::text
                AND s.status = 'Accepted'
            )
            SELECT p.competition_level, COUNT(*) as submissions
            FROM unique_accepted_problems uap
            JOIN problems p ON p.problem_id = uap.problem_id
            GROUP BY p.competition_level
            ORDER BY 
                CASE p.competition_level
                    WHEN 'Invitational A' THEN 1
                    WHEN 'Invitational B' THEN 2
                    WHEN 'District' THEN 3
                    WHEN 'Region' THEN 4
                    WHEN 'State' THEN 5
                    ELSE 6
                END;
        `;
        return submissions.map(submission => ({
            conference: submission.competition_level.toLowerCase().replace(/\s+/g, '-'),
            submissions: Number(submission.submissions),
            fill: getColorForLevel(submission.competition_level)
        }));
    } catch (error) {
        console.error('Error fetching accepted submissions by level:', error);
        return null;
    }
}

function getColorForLevel(level: string) {
    const colors: { [key: string]: string }= {
        "Invitational A": "#f4f4f4",
        "Invitational B": "#e7a2c2",
        "District": "#ea78ab",
        "Region": "#e45093",
        "State": "#e42079",
        "Other": "#e42079"
    };
    return colors[level] || "#e42079";
} 

export async function getUserStartedProblems(username: string) {
    try {
        const problems: FetchedProblem[] = await sql`
            SELECT p.problem_id,
                   p.problem_name,
                   p.competition_level,
                   p.problem_year,
                   up.last_worked
            FROM user_problems up
            JOIN problems p ON up.problem_id = p.problem_id
            WHERE up.username = ${username}
            ORDER BY up.last_worked DESC
        `;

        return problems;
    } catch (error) {
        console.error('Error fetching user problems:', error);
        return [];
    }
}

