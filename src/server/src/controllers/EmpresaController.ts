import { Request, Response } from 'express';
import { EmpresaService } from '../services/EmpresaService';

export class EmpresaController {
    static async getAll(req: Request, res: Response) {
        try {
            const empresas = EmpresaService.findAll();
            res.json(empresas);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch empresas' });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const empresa = EmpresaService.findById(id);

            if (!empresa) {
                return res.status(404).json({ error: 'Empresa not found' });
            }

            res.json(empresa);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch empresa' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const empresa = EmpresaService.create(req.body);
            res.status(201).json(empresa);
        } catch (error) {
            res.status(400).json({ error: 'Failed to create empresa' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const empresa = EmpresaService.update(id, req.body);

            if (!empresa) {
                return res.status(404).json({ error: 'Empresa not found' });
            }

            res.json(empresa);
        } catch (error) {
            res.status(400).json({ error: 'Failed to update empresa' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const success = EmpresaService.delete(id);

            if (!success) {
                return res.status(404).json({ error: 'Empresa not found' });
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete empresa' });
        }
    }
}
