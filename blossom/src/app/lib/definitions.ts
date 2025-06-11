
export enum UserPermissions {
    UPLOAD_PROBLEMS = 0,
    ADMINISTRATOR = 1,
}

export type SessionPayload = {
    username: string;
    expiresAt: Date;
    permissions: UserPermissions[];
}

export type RegisterProfile = {
    username: string;
    password: string;
    code: string;
}

export type LoginProfile = {
    username: string;
    password: string;
}