import { Request, Response } from 'express';
import { User } from '../models/User';

export class UserController {
    static async getAll(req: Request, res: Response) {
        // Mock data for now
        const users: User[] = [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
        ];

        res.json(users);
    }
}
