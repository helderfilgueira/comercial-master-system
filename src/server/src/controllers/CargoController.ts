import { Request, Response } from 'express';
import { CargoService } from '../services/CargoService';

export class CargoController {
    static async getAll(req: Request, res: Response) {
        try {
            const cargos = CargoService.findAll();
            res.json(cargos);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch cargos' });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const cargo = CargoService.findById(id);

            if (!cargo) {
                return res.status(404).json({ error: 'Cargo not found' });
            }

            res.json(cargo);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch cargo' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const cargo = CargoService.create(req.body);
            res.status(201).json(cargo);
        } catch (error) {
            res.status(400).json({ error: 'Failed to create cargo' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const cargo = CargoService.update(id, req.body);

            if (!cargo) {
                return res.status(404).json({ error: 'Cargo not found' });
            }

            res.json(cargo);
        } catch (error) {
            res.status(400).json({ error: 'Failed to update cargo' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const success = CargoService.delete(id);

            if (!success) {
                return res.status(404).json({ error: 'Cargo not found' });
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete cargo' });
        }
    }
}
