'use server'
import { createSession, deleteSession } from "@/lib/session"
import { redirect } from "next/navigation";
import bcrypt from 'bcrypt';
import { UserPermissions } from "@/lib/types";
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

import { object, string } from 'yup';

const loginSchema = object({
  username: string().required("Username is required").min(4, "Username must be at least 4 characters").max(20, "Username must be at most 20 characters"),
  password: string().required("Password is required").min(8, "Password must be at least 8 characters"),
})

const registerSchema = object({
  username: string().required("Username is required").min(4, "Username must be at least 4 characters").max(20, "Username must be at most 20 characters"),
  password: string().required("Password is required").min(8, "Password must be at least 8 characters"),
  accessCode: string().required("Access code is required")
})

export async function logout() {
    await deleteSession();
    redirect("/portal");
}

export async function signup(formData: FormData) {
    console.log("Signup action called");
    const HASH_ROUNDS = 10;

    let username = formData.get("username") as string;
    username = username.toLowerCase().trim();

    const password = formData.get("password") as string;
    const accessCode = formData.get("accessCode") as string;

    try {
        await registerSchema.validate({
            username: username,
            password: password,
            accessCode: accessCode
        });
    } catch (error) {
        return error.message;
    }

    const hashedPassword = bcrypt.hashSync(password, HASH_ROUNDS);
    const users = await sql`SELECT id FROM users where username = ${username}`;
    if (users.length > 0) {
        return "Username already exists";
    }

    const id = Number((await sql`SELECT COUNT(*) FROM users`)[0].count) + 1;
    const accessCodes = await sql`
        SELECT current_uses, maximum_uses, permissions FROM access_codes WHERE code = ${accessCode}
    `;

    if (accessCodes.length === 0) {
        return "Invalid access code";
    }

    const codeEntry = accessCodes[0];
    if (codeEntry.current_uses >= codeEntry.maximum_uses) {
        return "Access code has reached its maximum uses";
    }

    await sql`
        INSERT INTO users (id, username, hash, code, permissions)
        VALUES (${id}, ${username}, ${hashedPassword}, ${accessCode}, ${codeEntry.permissions})
    `;

    await sql`
        UPDATE access_codes
        SET current_uses = current_uses + 1
        WHERE code = ${accessCode}
    `;
    await createSession(username, [...codeEntry.permissions as UserPermissions[]]);
    redirect("/dashboard");
}

export async function login(formData: FormData) {
    let username = formData.get("username") as string;
    username = username.toLowerCase().trim();
    const password = formData.get("password") as string;

    try {
        await loginSchema.validate({
            username: username,
            password: password
        });
    } catch (error) {
        console.error("Validation error:", error.message);
        return error.message;
    }

    const user = await sql`SELECT hash, permissions FROM users where username = ${username}`;
    if (!user || user.length === 0) {
        return "Invalid username or password";
    }

    if (!bcrypt.compareSync(password, user[0].hash.toString())) {
        return "Invalid username or password";
    }

    await createSession(username, [...user[0].permissions as UserPermissions[]]);
    redirect("/dashboard");
}