'use server'
import { createSession } from "@/app/lib/session"
import { redirect } from "next/navigation";

import bcrypt from 'bcrypt';

import { UserPermissions } from "@/app/lib/definitions";

export async function signup(formData: FormData) {

    const HASH_ROUNDS = 10;

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const hashedPassword = bcrypt.hashSync(password, HASH_ROUNDS);
    await createSession(username, [
        UserPermissions.UPLOAD_PROBLEMS,
        UserPermissions.ADMINISTRATOR
    ]);

    console.log(`User ${username} signed up successfully. Password hash: ${hashedPassword}`);
    redirect("/editor/hanika");

}
