'use server';

import { verifySession } from '@/lib/dal';
import { put, head } from '@vercel/blob';

const dataDir = "data"

const JUDGE_URL = "https://judge0-extra-ce.p.rapidapi.com";
/*
const JUDGE_HEADERS = {
    'X-Auth-Token': process.env.JUDGE_API_KEY || "",
    'Content-Type': 'application/json'
}
*/

export async function saveCode(problemName: string, code: string) {
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const username: string = session?.username as string;
        const userSubmissionPath = `${dataDir}/${problemName}/submissions/${username}.java`;
    try {
        const blobResult = await put(userSubmissionPath, code, {
            access: 'public', // Or 'private' if you handle signed URLs for reads
            contentType: 'text/x-java-source; charset=utf-8', // Be specific with content type,
            allowOverwrite: true, // Allow overwriting existing blobs
            // Add any cache control headers if needed
        });
        console.log(`Code saved for user ${username} to blob: ${blobResult.url}`);
        //const filePath = path.join(dataDir + `/${problemName}/submissions/${username}.java`);
        //fs.writeFile(filePath, code, 'utf8')
    }
    catch (error) {
        console.error("Error writing file:", error);
        return "// Error writing file";
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
        console.error("Error reading file:", error);
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
        console.error("Error reading file:", error);
        return "// Error reading file";
    }
}



export async function getSavedCode(problemName: string) {
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const username: string = session?.username as string;
    console.log("ich san bull")
    const userSubmissionPath =  "data/" + problemName + "/submissions/" + username + ".java";

    try {
        const userBlob = await head(userSubmissionPath); // Throws if not found
        const response = await fetch(userBlob.url);
        console.log(`Fetching user's code from blob: ${userBlob.url}`);
        if (!response.ok) {
            // This case might be rare if head succeeded, but good to check
            throw new Error(`Failed to fetch user's code blob: ${response.statusText}`);
        }
        return await response.text();
    }
    catch (error) {
        // Assuming error means the user's submission blob was not found
        console.log(`User's code at ${userSubmissionPath} not found or error fetching. Attempting to use example. Error: ${error.message}`);

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
        } catch (exampleError) {
            console.error(`Error processing example code for ${username} and problem ${problemName}: ${exampleError.message}`);
            return "// Error loading or saving example code";
        }
    }
}

export async function submitCustomTestcase(problemName: string, input: string) {
    
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const username: string = session?.username as string;

    const url = JUDGE_URL + "/submissions/?base64_encoded=true&wait=true";
    // Ensure the userName and problemName are valid strings
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': process.env.JUDGE_API_KEY || "",
            'x-rapidapi-host': "judge0-extra-ce.p.rapidapi.com",
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            language_id: 4, // Java
            source_code: btoa(await getSavedCode(problemName)), // Base64 encode the code
            stdin: btoa(input), // Base64 encode the input
        })
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error + " - Error during submission");
    }
    console.log("Submission completed for user:", username, "and problem:", problemName);
};

export async function submitTestcase(problemName: string) {
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const url = JUDGE_URL + "/submissions/?base64_encoded=true&wait=true";
    

    // Ensure the userName and problemName are valid strings
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': process.env.JUDGE_API_KEY || "",
            'x-rapidapi-host': "judge0-extra-ce.p.rapidapi.com",
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            language_id: 4, // Java
            source_code: btoa(await getSavedCode(problemName)), // Base64 encode the code
            stdin: btoa( await getTestcaseInput(problemName)), // Base64 encode the input
            expected_output: btoa(await getTestcaseOutput(problemName)), // Base64 encode the expected output
        })
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error + " - Error during submission");
    }
};

export async function submitJudge(problemName: string) {
    console.log(problemName);
    const response = await fetch("", {});
    const result = await response.json();
    return result
}

export async function submitLocal(problemName: string, code: string, input: string) {
    const session = await verifySession();
    if (!session) return "// User not authenticated";

    const url = JUDGE_URL + "/submissions/?base64_encoded=true&wait=true";
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': process.env.JUDGE_API_KEY || "",
            'x-rapidapi-host': "judge0-extra-ce.p.rapidapi.com",
            'Content-Type': 'application/json'
        },
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
        console.error(error + " - Error during submission");
    }
}
