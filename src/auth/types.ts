export interface UserRegisterParameters {
    name: string;
    email: string;
    password: string;
    mobile: string;
    creatorId: number;
}
export interface CreatorRegisterParameters {
    name: string;
    email: string;
    password: string;
    mobile: string;
    domain: string;
    bio: string;
    role: string;
}

export interface IUser {
    id: number;
    name: string;
    email: string;
    password: string;
    mobile: string;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IStudentWithRole extends IUser {
    roles: string[];
}

export type TokenType = Omit<IStudentWithRole, "password">;
export type TokenWithoutRolesType = Omit<TokenType, "roles">;

export interface ICreator extends IUser {
    domain: string;
    bio: string;
    role: string;
}

export interface ICreatorWithRole extends IUser {
    roles: string[];
}

export interface ILoginParameter {
    email: string;
    password: string;
}
