export interface UserRegisterParameters {
    name: string;
    email: string;
    password: string;
    mobile: string;
}
export interface CreatorRegisterParameters extends UserRegisterParameters {
    domain: string;
    bio: string;
    role: string;
}

export interface IUser extends UserRegisterParameters {
    id: number;
    image: string;
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
