import { getDb } from '../database/sqlite';
import { Cargo, CargoModel } from '../models/CargoModel';

export class CargoService {
    private static addToSyncQueue(tabela: string, registro_id: number, operacao: string) {
        const db = getDb();
        db.prepare(`
      INSERT INTO sync_queue (tabela, registro_id, operacao, enviado)
      VALUES (?, ?, ?, 0)
    `).run(tabela, registro_id, operacao);
    }

    static create(data: Cargo): CargoModel {
        const db = getDb();
        const result = db.prepare(`
      INSERT INTO cargo (nome, permissoes)
      VALUES (?, ?)
    `).run(data.nome, data.permissoes);

        const id = result.lastInsertRowid as number;
        this.addToSyncQueue('cargo', id, 'insert');

        return new CargoModel({ ...data, id });
    }

    static findById(id: number): CargoModel | null {
        const db = getDb();
        const row = db.prepare('SELECT * FROM cargo WHERE id = ?').get(id);
        return row ? CargoModel.fromRow(row) : null;
    }

    static findAll(): CargoModel[] {
        const db = getDb();
        const rows = db.prepare('SELECT * FROM cargo').all();
        return rows.map(row => CargoModel.fromRow(row));
    }

    static update(id: number, data: Partial<Cargo>): CargoModel | null {
        const db = getDb();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.nome !== undefined) {
            fields.push('nome = ?');
            values.push(data.nome);
        }
        if (data.permissoes !== undefined) {
            fields.push('permissoes = ?');
            values.push(data.permissoes);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        db.prepare(`UPDATE cargo SET ${fields.join(', ')} WHERE id = ?`).run(...values);

        this.addToSyncQueue('cargo', id, 'update');
        return this.findById(id);
    }

    static delete(id: number): boolean {
        const db = getDb();
        const result = db.prepare('DELETE FROM cargo WHERE id = ?').run(id);

        if (result.changes > 0) {
            this.addToSyncQueue('cargo', id, 'delete');
            return true;
        }
        return false;
    }
}
