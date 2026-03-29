"use server"
import { verifySession } from "@/lib/dal";
import { UserPermissions } from "@/lib/types";
import { hasPermission } from "@/lib/utilities";
import { Problem, FetchedProblem, Submission, SubmissionStatusType } from "@/types/submission";
import { uploadFile, deleteFile, fileExists, retrieveFile } from "@/actions/azure";
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

    const permissions = session.permissions as UserPermissions[];
    if (!hasPermission(permissions, [UserPermissions.DELETE_PROBLEMS]))
        return false;

    try {
        // Delete problem from the database
        await sql`
            DELETE FROM problems
            WHERE problem_id = ${problemId}::text
        `;

        // Delete associated files from Azure Blob storage
        await Promise.all([
            deleteFile(`${problemId}/sample/${problemId}.dat`),
            deleteFile(`${problemId}/sample/${problemId}.out`),
            deleteFile(`${problemId}/judge/${problemId}.dat`),
            deleteFile(`${problemId}/judge/${problemId}.out`),
        ]);

        return true;
    } catch (error) {
        console.error('Error deleting problem:', error);
        return false;
    }
}
export async function getSubmissionsByProblem(problemId: string, count: number) {
    const session = await verifySession();
    if (!session) return null;

    try {
        const submissions: Submission[] = await sql`
            SELECT * FROM submissions
            WHERE problem_id = ${problemId}::text
            ORDER BY date DESC
            LIMIT ${count}
        `;
        return submissions;
    } catch (error) {
        console.error('Error fetching submissions by problem:', error);
        return null;
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

    const paths = {
        sampleDat: `${problemId}/sample/${problemId}.dat`,
        sampleOut: `${problemId}/sample/${problemId}.out`,
        judgeDat: `${problemId}/judge/${problemId}.dat`,
        judgeOut: `${problemId}/judge/${problemId}.out`,
        statement: `${problemId}/statement.pdf`,
    };

    const [sampleDatExists, sampleOutExists, judgeDatExists, judgeOutExists, statementExists] = await Promise.all([
        fileExists(paths.sampleDat),
        fileExists(paths.sampleOut),
        fileExists(paths.judgeDat),
        fileExists(paths.judgeOut),
        fileExists(paths.statement),
    ]);

    const sampleFiles: { name: string; content: string }[] = [];
    const judgeFiles: { name: string; content: string }[] = [];

    if (sampleDatExists) {
        const data = await retrieveFile(paths.sampleDat);
        sampleFiles.push({ name: `${problemId}.dat`, content: data.toString() });
    }
    if (sampleOutExists) {
        const data = await retrieveFile(paths.sampleOut);
        sampleFiles.push({ name: `${problemId}.out`, content: data.toString() });
    }
    if (judgeDatExists) {
        const data = await retrieveFile(paths.judgeDat);
        judgeFiles.push({ name: `${problemId}.dat`, content: data.toString() });
    }
    if (judgeOutExists) {
        const data = await retrieveFile(paths.judgeOut);
        judgeFiles.push({ name: `${problemId}.out`, content: data.toString() });
    }

    return { sampleFiles, judgeFiles, hasStatement: statementExists };
}

export async function downloadProblemFile(problemId: string, fileType: 'sampleDat' | 'sampleOut' | 'judgeDat' | 'judgeOut' | 'statement') {
    const session = await verifySession();
    if (!session) return null;

    const pathMap: Record<string, string> = {
        sampleDat: `${problemId}/sample/${problemId}.dat`,
        sampleOut: `${problemId}/sample/${problemId}.out`,
        judgeDat: `${problemId}/judge/${problemId}.dat`,
        judgeOut: `${problemId}/judge/${problemId}.out`,
        statement: `${problemId}/statement.pdf`,
    };

    const path = pathMap[fileType];
    if (!path) return null;

    const exists = await fileExists(path);
    if (!exists) return null;

    const data = await retrieveFile(path) as Buffer;
    // Return as base64 so it can cross the server action boundary
    return {
        data: data.toString('base64'),
        name: fileType === 'statement' ? `${problemId}.pdf` : path.split('/').pop()!,
        type: fileType === 'statement' ? 'application/pdf' : 'text/plain',
    };
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

export async function createProblem(formData: FormData) {
    const session = await verifySession();
    if (!session) return "Not authenticated";

    const permissions = session.permissions as UserPermissions[];
    if (!hasPermission(permissions, [UserPermissions.MANAGE_PROBLEMS]))
        return "Insufficient permissions";

    const problemId = (formData.get("id") as string)?.trim();
    const name = (formData.get("name") as string)?.trim();
    const level = formData.get("level") as string;
    const year = parseInt(formData.get("year") as string);
    const tags = JSON.parse(formData.get("tags") as string || "[]");

    if (!problemId || !name || !level || !year) {
        return "Missing required fields";
    }

    // Check if problem already exists
    const existing = await sql`SELECT problem_id FROM problems WHERE problem_id = ${problemId}::text`;
    if (existing.length > 0) {
        return "A problem with this ID already exists";
    }

    try {
        const id = Number((await sql`SELECT COUNT(*) FROM problems`)[0].count) + 1;

        await sql`
            INSERT INTO problems (id, problem_id, problem_name, competition_level, problem_year, tags)
            VALUES (${id}, ${problemId}, ${name}, ${level}, ${year}, ${tags})
        `;

        // Upload files to Azure Blob
        const sampleDat = formData.get("sampleDat") as File | null;
        const sampleOut = formData.get("sampleOut") as File | null;
        const judgeDat = formData.get("judgeDat") as File | null;
        const judgeOut = formData.get("judgeOut") as File | null;

        const uploads: Promise<void>[] = [];
        if (sampleDat && sampleDat.size > 0) {
            const buffer = Buffer.from(await sampleDat.arrayBuffer());
            uploads.push(uploadFile(`${problemId}/sample/${problemId}.dat`, buffer, buffer.length));
        }
        if (sampleOut && sampleOut.size > 0) {
            const buffer = Buffer.from(await sampleOut.arrayBuffer());
            uploads.push(uploadFile(`${problemId}/sample/${problemId}.out`, buffer, buffer.length));
        }
        if (judgeDat && judgeDat.size > 0) {
            const buffer = Buffer.from(await judgeDat.arrayBuffer());
            uploads.push(uploadFile(`${problemId}/judge/${problemId}.dat`, buffer, buffer.length));
        }
        if (judgeOut && judgeOut.size > 0) {
            const buffer = Buffer.from(await judgeOut.arrayBuffer());
            uploads.push(uploadFile(`${problemId}/judge/${problemId}.out`, buffer, buffer.length));
        }
        const statement = formData.get("statement") as File | null;
        if (statement && statement.size > 0) {
            const buffer = Buffer.from(await statement.arrayBuffer());
            uploads.push(uploadFile(`${problemId}/statement.pdf`, buffer, buffer.length));
        }
        await Promise.all(uploads);

        return null; // success
    } catch (error) {
        console.error('Error creating problem:', error);
        return "Failed to create problem";
    }
}

export async function updateProblem(formData: FormData) {
    const session = await verifySession();
    if (!session) return "Not authenticated";

    const permissions = session.permissions as UserPermissions[];
    if (!hasPermission(permissions, [UserPermissions.MANAGE_PROBLEMS]))
        return "Insufficient permissions";

    const problemId = (formData.get("id") as string)?.trim();
    const name = (formData.get("name") as string)?.trim();
    const level = formData.get("level") as string;
    const year = parseInt(formData.get("year") as string);
    const tags = JSON.parse(formData.get("tags") as string || "[]");

    if (!problemId || !name || !level || !year) {
        return "Missing required fields";
    }

    try {
        await sql`
            UPDATE problems
            SET problem_name = ${name},
                competition_level = ${level},
                problem_year = ${year},
                tags = ${tags}
            WHERE problem_id = ${problemId}::text
        `;

        // Upload new files if provided (overwrites existing)
        const sampleDat = formData.get("sampleDat") as File | null;
        const sampleOut = formData.get("sampleOut") as File | null;
        const judgeDat = formData.get("judgeDat") as File | null;
        const judgeOut = formData.get("judgeOut") as File | null;

        const uploads: Promise<void>[] = [];
        if (sampleDat && sampleDat.size > 0) {
            const buffer = Buffer.from(await sampleDat.arrayBuffer());
            uploads.push(uploadFile(`${problemId}/sample/${problemId}.dat`, buffer, buffer.length));
        }
        if (sampleOut && sampleOut.size > 0) {
            const buffer = Buffer.from(await sampleOut.arrayBuffer());
            uploads.push(uploadFile(`${problemId}/sample/${problemId}.out`, buffer, buffer.length));
        }
        if (judgeDat && judgeDat.size > 0) {
            const buffer = Buffer.from(await judgeDat.arrayBuffer());
            uploads.push(uploadFile(`${problemId}/judge/${problemId}.dat`, buffer, buffer.length));
        }
        if (judgeOut && judgeOut.size > 0) {
            const buffer = Buffer.from(await judgeOut.arrayBuffer());
            uploads.push(uploadFile(`${problemId}/judge/${problemId}.out`, buffer, buffer.length));
        }
        const statement = formData.get("statement") as File | null;
        if (statement && statement.size > 0) {
            const buffer = Buffer.from(await statement.arrayBuffer());
            uploads.push(uploadFile(`${problemId}/statement.pdf`, buffer, buffer.length));
        }
        await Promise.all(uploads);

        return null; // success
    } catch (error) {
        console.error('Error updating problem:', error);
        return "Failed to update problem";
    }
}

