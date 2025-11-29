import express, { Request, Response } from 'express';
import apiRoutes from './routes/index';
import { env } from './config/env';

const app = express();
const port = env.PORT;

app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'API online' });
});

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API running' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
