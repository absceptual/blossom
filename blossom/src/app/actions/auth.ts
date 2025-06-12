'use server'
import { createSession, deleteSession } from "@/app/lib/session"
import { redirect } from "next/navigation";

import bcrypt from 'bcrypt';

import { UserPermissions } from "@/app/lib/definitions";

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export async function logout() {
    await deleteSession();
    redirect("/portal");
}

export async function signup(formData: FormData) {
    const HASH_ROUNDS = 10;

    let username = formData.get("username") as string;
    username = username.toLowerCase().trim();

    const password = formData.get("password") as string;
    const code = formData.get("accessCode") as string;

    if ( !username || !password) 
        return; // Invalid input

    const hashedPassword = bcrypt.hashSync(password, HASH_ROUNDS);
    const users = await sql `SELECT id FROM users where username = ${username} `
    if (users.length > 0)
        return; // User already exists

    const id = Number((await sql`SELECT COUNT(*) FROM users`)[0].count) + 1;
    const accessCodes = await sql`
        SELECT current_uses, maximum_uses, permissions FROM access_codes WHERE code = ${code}
    `;

    if (accessCodes.length === 0) {
        console.log(`Access code ${code} does not exist`);
        return; // Access code not found
    }

    const codeEntry = accessCodes[0]
    if (codeEntry.current_uses >= codeEntry.maximum_uses)
        return; // Access code has reached its maximum uses

    console.log(id);
    await sql`
        INSERT INTO users (id, username, hash, code, permissions)
        VALUES (${id}, ${username}, ${hashedPassword}, ${code}, ${codeEntry.permissions})
    `;

    await sql`
        UPDATE access_codes
        SET current_uses = current_uses + 1
        WHERE code = ${code}
    `;
    await createSession(username, [...codeEntry.permissions as UserPermissions[]]);

    // console.log(`User ${username} signed up successfully. Password hash: ${hashedPassword}`);
    redirect("/dashboard");

}


export async function login(formData: FormData) {
    let username = formData.get("username") as string;
    username = username.toLowerCase().trim();

    const password = formData.get("password") as string;
    

    if ( !username || !password ) {
        console.log("Invalid input");
        return; // Invalid input
    }

    const user = await sql `SELECT hash, permissions FROM users where username = ${username} `
    if (!user || user.length === 0) {
        console.log(`User ${username} does not exist`);
        return; // User doesn't exist
    }

    console.log(user[0].hash.toString())
    if (!bcrypt.compareSync(password, user[0].hash.toString())) {
        console.log(`Invalid password for user ${username}`);
        // You might want to log this attempt or handle it differently
        // console.log(`User ${username} attempted to log in with an invalid password.`);
        // redirect("/portal"); // Redirect to portal or login page
        return; // Invalid password
    }

    console.log(user[0].permissions)
    await createSession(username, [...user[0].permissions as UserPermissions[]]);

    // console.log(`User ${username} signed up successfully. Password hash: ${hashedPassword}`);
    redirect("/dashboard");
}
