'use server';

import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');

const JUDGE_URL = "https://judge0-extra-ce.p.rapidapi.com";

export interface SubmissionResult {
  compile_output?: string;
  status: {
    id: number;
    description: string;
  };
  stdout?: string;
  stderr?: string;
}

export async function saveCode(problemName: string, userName: string, code: string) {
    try {
        const filePath = path.join(dataDir + `/${problemName}/submissions/${userName}.java`);
        fs.writeFile(filePath, code, 'utf8')
    }
    catch (error) {
        console.error("Error writing file:", error);
        return "// Error writing file";
    }
} 



export async function getTestcaseInput(problemName: string) {
    try {  
        const data = await fs.readFile(dataDir + `/${problemName}/sample.in`);
        return data.toString();
    }
    catch (error) {
        console.error("Error reading file:", error);
        return "// Error reading file";
    }
}

export async function getTestcaseOutput(problemName: string) {
    try {
        const data = await fs.readFile(dataDir + `/${problemName}/sample.out`);
        return data.toString(); 
    }
    catch (error) {
        console.error("Error reading file:", error);
        return "// Error reading file";
    }
}

export async function getSavedCode(problemName: string, userName: string) {
    try {
        const data = await fs.readFile(dataDir + `/${problemName}/submissions/${userName}.java`);
        return data.toString();
    }
    catch (error) {
        console.error("Error reading file:", error);
        return "// Error reading file";
    }
}

export async function submitCustomTestcase(problemName: string, userName: string, input: string) {
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
            source_code: btoa(await getSavedCode(problemName, userName)), // Base64 encode the code
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
    console.log("Submission completed for user:", userName, "and problem:", problemName);
};

export async function submitTestcase(problemName: string, userName: string) {
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
            source_code: btoa(await getSavedCode(problemName, userName)), // Base64 encode the code
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
    console.log("Submission completed for user:", userName, "and problem:", problemName);
};
