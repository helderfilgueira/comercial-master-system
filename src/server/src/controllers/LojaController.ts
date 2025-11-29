import { Request, Response } from 'express';
import { LojaService } from '../services/LojaService';

export class LojaController {
    static async getAll(req: Request, res: Response) {
        try {
            const lojas = LojaService.findAll();
            res.json(lojas);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch lojas' });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const loja = LojaService.findById(id);

            if (!loja) {
                return res.status(404).json({ error: 'Loja not found' });
            }

            res.json(loja);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch loja' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const loja = LojaService.create(req.body);
            res.status(201).json(loja);
        } catch (error) {
            res.status(400).json({ error: 'Failed to create loja' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const loja = LojaService.update(id, req.body);

            if (!loja) {
                return res.status(404).json({ error: 'Loja not found' });
            }

            res.json(loja);
        } catch (error) {
            res.status(400).json({ error: 'Failed to update loja' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const success = LojaService.delete(id);

            if (!success) {
                return res.status(404).json({ error: 'Loja not found' });
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete loja' });
        }
    }
}
