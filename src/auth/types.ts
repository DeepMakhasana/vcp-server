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

export interface IUser {
    id: number;
    name: string;
    email: string;
    password: string;
    mobile: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICreator extends IUser {
    domain: string;
    bio: string;
    role: string;
}
