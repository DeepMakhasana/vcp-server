class CrudService<
    Model extends { findMany: Function; findUnique: Function; create: Function; update: Function; delete: Function }
> {
    private model: Model;
    constructor(model: Model) {
        this.model = model;
    }

    // Get all records
    async getAll<T, A>(args: A): Promise<T> {
        return await this.model.findMany(args);
    }

    // Get a single record by unique identifier
    async getOne<T, A>(args: A): Promise<T | null> {
        return this.model.findUnique(args);
    }

    // Create a record
    async create<T, A>(args: A): Promise<T> {
        return this.model.create(args);
    }

    // Update a record
    async update<T, A>(args: A): Promise<T> {
        return this.model.update(args);
    }

    // Delete a record
    async delete<T, A>(args: A): Promise<T> {
        return this.model.delete(args);
    }
}

export default CrudService;

// const course = new CrudService(prisma["course"]);

// (async () => {
//     const data = await course.getAll<Prisma.PrismaPromise<Course[]>, Prisma.CourseFindManyArgs>({
//         where: {
//             title: "Docker",
//         },
//     });
// })();
