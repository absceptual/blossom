/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { verifySession } from '@/lib/dal';
import { SubmissionStatusType } from '@/types/submission';
import { createSubmissionEntry } from '@/actions/problems';
import { put, head } from '@vercel/blob';
import { SubmissionResult } from '@/types/submission';

const dataDir = "data"

const JUDGE_URL = "https://judge0-extra-ce.p.rapidapi.com";

const JUDGE_HEADERS = {
    'x-rapidapi-key': process.env.JUDGE_API_KEY || "",
    'x-rapidapi-host': "judge0-extra-ce.p.rapidapi.com",
    'Content-Type': 'application/json'
};

export async function saveCode(problemId: string, code: string) {
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const username: string = session?.username as string;
    const userSubmissionPath = `${dataDir}/${problemId}/submissions/${username}.java`;
    
    try {
        
        // Try to put the blob
        const blobResult = await put(userSubmissionPath, code, {
            access: 'public',
            contentType: 'text/x-java-source; charset=utf-8',
            addRandomSuffix: false, // Ensure exact path
            allowOverwrite: true,
        });

        // Try to read it back immediately
        const response = await fetch(blobResult.url, { next: { revalidate: 0 }});
        const savedContent = await response.text();
        
        if (savedContent !== code) {
            throw new Error(`Local content for ${username} in problem ${problemId} doesn't match content on server.`);
        }

        return "success";
    }
    catch (error) {
        console.error("Error in saveCode:", {
            error,
            path: userSubmissionPath
        });
        return "error";
    }
}
export async function getTestcaseInput(problemName: string) {
    const session = await verifySession();
    if (!session) return "// User not authenticated";
    
    const filePath = `${dataDir}/${problemName}/sample.in`;
    try {  
        const blob = await head(filePath);
        const response = await fetch(blob.url);
        if (!response.ok)
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        return await response.text();
    }
    catch (error) {
        console.error("Error in getTestcaseInput:", error);
        return "// Error reading file";
    }
}

export async function getTestcaseOutput(problemName: string) {
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const filePath = `${dataDir}/${problemName}/sample.out`;
    try {
        const blob = await head(filePath);
        const response = await fetch(blob.url);
        if (!response.ok)
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        return await response.text();
    }
    catch (error) {
        console.error("Error in getTestcaseOutput:", error);
        return "// Error reading file";
    }
}



export async function getSavedCode(problemName: string) {
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const username: string = session?.username as string;
    const userSubmissionPath =  "data/" + problemName + "/submissions/" + username + ".java";

    try {
        const userBlob = await head(userSubmissionPath); // Throws if not found
        const response = await fetch(`${userBlob.url}?v=${Date.now()}`, { next: { revalidate: 0 }});
        console.log(`Fetching user's code from blob: ${userBlob.url}`);
        if (!response.ok) {
            // This case might be rare if head succeeded, but good to check
            throw new Error(`Failed to fetch user's code blob: ${response.statusText}`);
        }
        return await response.text();
    }
    catch (error: any) {
        // Assuming error means the user's submission blob was not found
        const exception: Error = error;
        console.log(`User's code at ${userSubmissionPath} not found or error fetching. Attempting to use example`);

        try {
            // Fetch the example code from its blob
            const exampleBlob = await head("data/example"); // Throws if example not found
            const exampleResponse = await fetch(exampleBlob.url);
            if (!exampleResponse.ok) {
                console.error(`Critical: Failed to fetch example code blob: ${exampleResponse.statusText}`);
                return "// Error: Example code not available";
            }
            const exampleCode = await exampleResponse.text();

            // Save this example code as the user's initial code in their blob path
            await put(userSubmissionPath, exampleCode, {
                access: 'public',
                contentType: 'text/x-java-source; charset=utf-8',
            });
            console.log(`Initialized ${userSubmissionPath} with example code for user ${username}.`);
            return exampleCode;
        } catch (exampleError: any) {
            console.error(`Error processing example code for ${username} and problem ${problemName}: ${exampleError.message}`);
            return "// Error loading or saving example code";
        }
    }
}

export async function submitCustomTestcase(problemName: string, code: string, input: string) {
    
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const username: string = session?.username as string;

    const url = JUDGE_URL + "/submissions/?base64_encoded=true&wait=true";
    // Ensure the userName and problemName are valid strings
    const options = {
        method: 'POST',
        headers: JUDGE_HEADERS,
        body: JSON.stringify({
            language_id: 4, // Java
            source_code: btoa(code), // Base64 encode the code
            stdin: btoa(input), // Base64 encode the input
        })
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error in submitCustomTestcase:", error);
        return {
            status: {
                id: 13, // Internal Error
                description: "Internal Error"
            }
        };
    }
    console.log("Submission completed for user:", username, "and problem:", problemName);
};

export async function submitTestcase(problemName: string, code: string) {
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const url = JUDGE_URL + "/submissions/?base64_encoded=true&wait=true";
    
    // Ensure the userName and problemName are valid strings
    const options = {
        method: 'POST',
        headers: JUDGE_HEADERS,
        body: JSON.stringify({
            language_id: 4, // Java
            source_code: btoa(code), // Base64 encode the code
            stdin: btoa( await getTestcaseInput(problemName)), // Base64 encode the input
            expected_output: btoa(await getTestcaseOutput(problemName)), // Base64 encode the expected output
        })
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error in submitTestcase:", error);
        return {
            status: {
                id: 13, // Internal Error
                description: "Internal Error"
            }
        };
    }
};

export async function submitJudge(code: string, input: string, problemId: string) {
    let result: SubmissionResult = {
        status: {
            id: 0,
            description: "Not Submitted"
        }
    };

    const session = await verifySession();
    if (!session) return result;

    // Get input and output paths from blob storage
    const inputPath = `${dataDir}/${problemId}/judge/${problemId}.dat`;
    const outputPath = `${dataDir}/${problemId}/judge/${problemId}.out`;
    const url = JUDGE_URL + "/submissions/?base64_encoded=true&wait=true";

    let expectedOutput = null;

    try {    
        // Only fetch input and output if we are submitting a testcase
        if (problemId !== "") {
            const inputBlob = await head(inputPath);
            const inputResponse = await fetch(inputBlob.url);
            if (!inputResponse.ok) {
                throw new Error(`Failed to fetch input file: ${inputResponse.statusText}`);
            }
            input = await inputResponse.text();

            // Fetch output file
            const outputBlob = await head(outputPath);
            const outputResponse = await fetch(outputBlob.url);
            if (!outputResponse.ok) {
                throw new Error(`Failed to fetch output file: ${outputResponse.statusText}`);
            }
            expectedOutput = await outputResponse.text();
        }

        // Submit to Judge0
        const options = {
            method: 'POST',
            headers: JUDGE_HEADERS,
            body: JSON.stringify({
                language_id: 4, // Java
                source_code: btoa(code), // Base64 encode the code
                stdin: btoa(input), // Base64 encode the input
            })
        };

        if (expectedOutput) 
            options.body = JSON.stringify({
                ...JSON.parse(options.body),
                expected_output: btoa(expectedOutput)
            });
        
        const response = await fetch(url, options);
        result = await response.json();
    } catch (error) {
        console.error("Error in submitJudge:", {
            error,
            problemId
        });
        result = {
            status: {
                id: 13, // Internal Error
                description: "Internal Error"
            },
            message: result?.message
        };
    };

    if (problemId) {
        createSubmissionEntry({
            problem_id: problemId,
            username: session?.username as string,
            status: result.status.description as SubmissionStatusType,
            date: new Date()
        });
    }
    return result;
}

