import { getDb } from '../database/sqlite';
import { Empresa, EmpresaModel } from '../models/EmpresaModel';

export class EmpresaService {
    private static addToSyncQueue(tabela: string, registro_id: number, operacao: string) {
        const db = getDb();
        db.prepare(`
      INSERT INTO sync_queue (tabela, registro_id, operacao, enviado)
      VALUES (?, ?, ?, 0)
    `).run(tabela, registro_id, operacao);
    }

    static create(data: Empresa): EmpresaModel {
        const db = getDb();
        const result = db.prepare(`
      INSERT INTO empresa (nome, cnpj)
      VALUES (?, ?)
    `).run(data.nome, data.cnpj);

        const id = result.lastInsertRowid as number;
        this.addToSyncQueue('empresa', id, 'insert');

        return new EmpresaModel({ ...data, id });
    }

    static findById(id: number): EmpresaModel | null {
        const db = getDb();
        const row = db.prepare('SELECT * FROM empresa WHERE id = ?').get(id);
        return row ? EmpresaModel.fromRow(row) : null;
    }

    static findAll(): EmpresaModel[] {
        const db = getDb();
        const rows = db.prepare('SELECT * FROM empresa').all();
        return rows.map(row => EmpresaModel.fromRow(row));
    }

    static update(id: number, data: Partial<Empresa>): EmpresaModel | null {
        const db = getDb();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.nome !== undefined) {
            fields.push('nome = ?');
            values.push(data.nome);
        }
        if (data.cnpj !== undefined) {
            fields.push('cnpj = ?');
            values.push(data.cnpj);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        db.prepare(`UPDATE empresa SET ${fields.join(', ')} WHERE id = ?`).run(...values);

        this.addToSyncQueue('empresa', id, 'update');
        return this.findById(id);
    }

    static delete(id: number): boolean {
        const db = getDb();
        const result = db.prepare('DELETE FROM empresa WHERE id = ?').run(id);

        if (result.changes > 0) {
            this.addToSyncQueue('empresa', id, 'delete');
            return true;
        }
        return false;
    }
}
