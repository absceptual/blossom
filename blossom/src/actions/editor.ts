/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { verifySession } from '@/lib/dal';
import { SubmissionStatusType } from '@/types/submission';
import { createSubmissionEntry } from '@/actions/problems';
import { SubmissionResult } from '@/types/submission';
import { retrieveFile, uploadFile } from '@/actions/azure'


const JUDGE_URL = "http://52.186.173.143:2358";

const JUDGE_HEADERS = {
    'X-Auth-Token': process.env.JUDGE_API_KEY || "",
    'Content-Type': 'application/json'
};

export async function saveCode(problemId: string, code: string) {
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const username: string = session?.username as string;
    const userSubmissionPath = `${problemId}/submissions/${username}.java`;
    
    try {
        await uploadFile(userSubmissionPath, code);
        
        const savedContent =  (await retrieveFile(userSubmissionPath)).toString()
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
    
    const filePath = `${problemName}/sample/${problemName}.dat`;
    try {  
        return (await retrieveFile(filePath)).toString()
    }
    catch (error) {
        console.error("Error in getTestcaseInput:", error);
        return "// Error reading file (problem may have no testcase input)";
    }
}

export async function getTestcaseOutput(problemName: string) {
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const filePath = `${problemName}/sample/${problemName}.out`;
    try {
        return (await retrieveFile(filePath)).toString()
    }
    catch (error) {
        console.error("Error in getTestcaseOutput:", error);
        return "";
    }
}

export async function getSavedCode(problemName: string) {
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const username: string = session?.username as string;
    const userSubmissionPath =  `${problemName}/submissions/${username}.java`;

    try {
        return (await retrieveFile(userSubmissionPath)).toString()
    }
    catch (error: any) {
        // Assuming error means the user's submission blob was not found
        const exception: Error = error;
        console.log(`User's code at ${userSubmissionPath} not found or error fetching. Attempting to use example`);

        try {
            const exampleCode = (await retrieveFile("example.java")).toString();
            
            // Save this example code as the user's initial code in their blob path
            await uploadFile(userSubmissionPath, exampleCode);
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
            language_id: 62, // Java
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
            language_id: 62, // Java
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
    const inputPath = `${problemId}/judge/${problemId}.dat`;
    const outputPath = `${problemId}/judge/${problemId}.out`;
    const url = JUDGE_URL + "/submissions/?base64_encoded=true&wait=true";

    let expectedOutput = null;

    try {    
        // Only fetch input and output if we are submitting a testcase
        if (problemId !== "") {
            try {
                input = (await retrieveFile(inputPath)).toString()

            } catch (error) { 
                // There might not be a testcase input (usually first problem)
                input = "";
            }

            // Fetch output file
            expectedOutput = (await retrieveFile(outputPath)).toString()
        }

        // Submit to Judge0
        const options = {
            method: 'POST',
            headers: JUDGE_HEADERS,
            body: JSON.stringify({
                language_id: 62, // Java
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

