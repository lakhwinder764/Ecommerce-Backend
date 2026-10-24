import { User } from './users.entity';

// Reference a user by id in relations and where clauses. User ids are UUID
// strings, although the entity types them as numbers.
export const userRef = (userId: string) => ({ id: userId }) as unknown as User;
