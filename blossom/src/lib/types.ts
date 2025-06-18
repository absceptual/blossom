
export enum UserPermissions {
    UPLOAD_PROBLEMS = 0,
    ADMINISTRATOR = 1,

    VIEW_JUDGE0_CONFIG = 2,
    MANAGE_USERS = 3,
    MANAGE_PROBLEMS = 4,
    MANAGEMENT_ACCESS = 5,
    DELETE_PROBLEMS = 6,
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