export interface Usuario {
    id?: number;
    empresa_id: number;
    cargo_id: number;
    nome: string;
    email: string;
    senha_hash: string;
    ativo?: number;
}

export class UsuarioModel implements Usuario {
    id?: number;
    empresa_id: number;
    cargo_id: number;
    nome: string;
    email: string;
    senha_hash: string;
    ativo?: number;

    constructor(data: Usuario) {
        this.id = data.id;
        this.empresa_id = data.empresa_id;
        this.cargo_id = data.cargo_id;
        this.nome = data.nome;
        this.email = data.email;
        this.senha_hash = data.senha_hash;
        this.ativo = data.ativo ?? 1;
    }

    static fromRow(row: any): UsuarioModel {
        return new UsuarioModel({
            id: row.id,
            empresa_id: row.empresa_id,
            cargo_id: row.cargo_id,
            nome: row.nome,
            email: row.email,
            senha_hash: row.senha_hash,
            ativo: row.ativo,
        });
    }
}
