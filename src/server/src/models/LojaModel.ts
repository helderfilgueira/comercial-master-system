export interface Loja {
    id?: number;
    empresa_id: number;
    nome: string;
    endereco?: string;
    cidade?: string;
    uf?: string;
}

export class LojaModel implements Loja {
    id?: number;
    empresa_id: number;
    nome: string;
    endereco?: string;
    cidade?: string;
    uf?: string;

    constructor(data: Loja) {
        this.id = data.id;
        this.empresa_id = data.empresa_id;
        this.nome = data.nome;
        this.endereco = data.endereco;
        this.cidade = data.cidade;
        this.uf = data.uf;
    }

    static fromRow(row: any): LojaModel {
        return new LojaModel({
            id: row.id,
            empresa_id: row.empresa_id,
            nome: row.nome,
            endereco: row.endereco,
            cidade: row.cidade,
            uf: row.uf,
        });
    }
}
