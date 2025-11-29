import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export const getDb = (): Database.Database => {
    if (db) {
        return db;
    }

    try {
        const dataDir = path.resolve(__dirname, '../../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const dbPath = path.join(dataDir, 'local.db');
        db = new Database(dbPath, { verbose: undefined });

        // Enable foreign keys
        db.pragma('foreign_keys = ON');

        // Initialize all tables
        initializeTables(db);

        console.log('SQLite database initialized successfully');
    } catch (error) {
        console.error('Error initializing SQLite database:', error);
        throw error;
    }

    return db!;
};

const initializeTables = (database: Database.Database) => {
    // 1. EMPRESA / LOJA / USUÁRIO
    database.exec(`
    CREATE TABLE IF NOT EXISTS empresa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cnpj TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS loja (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      endereco TEXT,
      cidade TEXT,
      uf TEXT,
      FOREIGN KEY (empresa_id) REFERENCES empresa(id)
    );

    CREATE TABLE IF NOT EXISTS cargo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      permissoes TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER NOT NULL,
      cargo_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      ativo INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (empresa_id) REFERENCES empresa(id),
      FOREIGN KEY (cargo_id) REFERENCES cargo(id)
    );

    CREATE TABLE IF NOT EXISTS usuario_loja (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      loja_id INTEGER NOT NULL,
      FOREIGN KEY(usuario_id) REFERENCES usuario(id),
      FOREIGN KEY(loja_id) REFERENCES loja(id)
    );

    CREATE TABLE IF NOT EXISTS auditoria_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      acao TEXT NOT NULL,
      tabela TEXT NOT NULL,
      registro_id INTEGER,
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(usuario_id) REFERENCES usuario(id)
    );

    -- 2. PRODUTO / ESTOQUE
    CREATE TABLE IF NOT EXISTS categoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fornecedor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cnpj TEXT
    );

    CREATE TABLE IF NOT EXISTS produto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER NOT NULL,
      categoria_id INTEGER,
      fornecedor_id INTEGER,
      nome TEXT NOT NULL,
      sku TEXT UNIQUE,
      codigo_barras TEXT,
      preco_venda REAL NOT NULL,
      preco_custo REAL,
      descricao TEXT,
      ativo INTEGER DEFAULT 1,
      FOREIGN KEY (empresa_id) REFERENCES empresa(id),
      FOREIGN KEY (categoria_id) REFERENCES categoria(id),
      FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id)
    );

    CREATE TABLE IF NOT EXISTS estoque (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produto_id INTEGER NOT NULL,
      loja_id INTEGER NOT NULL,
      quantidade REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(produto_id) REFERENCES produto(id),
      FOREIGN KEY(loja_id) REFERENCES loja(id)
    );

    CREATE TABLE IF NOT EXISTS movimento_estoque (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produto_id INTEGER NOT NULL,
      loja_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      quantidade REAL NOT NULL,
      motivo TEXT,
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(produto_id) REFERENCES produto(id),
      FOREIGN KEY(loja_id) REFERENCES loja(id)
    );

    -- 3. VENDAS
    CREATE TABLE IF NOT EXISTS pedido (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loja_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      cliente_nome TEXT,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(loja_id) REFERENCES loja(id),
      FOREIGN KEY(usuario_id) REFERENCES usuario(id)
    );

    CREATE TABLE IF NOT EXISTS pedido_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      quantidade REAL NOT NULL,
      preco_unit REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY(pedido_id) REFERENCES pedido(id),
      FOREIGN KEY(produto_id) REFERENCES produto(id)
    );

    CREATE TABLE IF NOT EXISTS forma_pagamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pagamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      forma_pagamento_id INTEGER NOT NULL,
      valor REAL NOT NULL,
      FOREIGN KEY(pedido_id) REFERENCES pedido(id),
      FOREIGN KEY(forma_pagamento_id) REFERENCES forma_pagamento(id)
    );

    -- 4. FINANCEIRO
    CREATE TABLE IF NOT EXISTS contas_pagar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER NOT NULL,
      descricao TEXT,
      valor REAL NOT NULL,
      data_vencimento DATE NOT NULL,
      pago INTEGER DEFAULT 0,
      FOREIGN KEY (empresa_id) REFERENCES empresa(id)
    );

    CREATE TABLE IF NOT EXISTS contas_receber (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER NOT NULL,
      pedido_id INTEGER,
      valor REAL NOT NULL,
      recebido INTEGER DEFAULT 0,
      FOREIGN KEY (empresa_id) REFERENCES empresa(id),
      FOREIGN KEY (pedido_id) REFERENCES pedido(id)
    );

    CREATE TABLE IF NOT EXISTS fluxo_caixa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loja_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      valor REAL NOT NULL,
      descricao TEXT,
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(loja_id) REFERENCES loja(id)
    );

    -- 5. FIDELIDADE
    CREATE TABLE IF NOT EXISTS fidelidade_pontos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_nome TEXT NOT NULL,
      pontos INTEGER NOT NULL,
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fidelidade_resgate (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_nome TEXT NOT NULL,
      pontos_usados INTEGER NOT NULL,
      descricao TEXT,
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. SINCRONIZAÇÃO
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tabela TEXT NOT NULL,
      registro_id INTEGER NOT NULL,
      operacao TEXT NOT NULL,
      enviado INTEGER DEFAULT 0,
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tabela TEXT NOT NULL,
      registro_id INTEGER NOT NULL,
      operacao TEXT NOT NULL,
      status TEXT NOT NULL,
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_loja_empresa ON loja(empresa_id);
    CREATE INDEX IF NOT EXISTS idx_usuario_empresa ON usuario(empresa_id);
    CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
    CREATE INDEX IF NOT EXISTS idx_produto_empresa ON produto(empresa_id);
    CREATE INDEX IF NOT EXISTS idx_produto_sku ON produto(sku);
    CREATE INDEX IF NOT EXISTS idx_estoque_produto ON estoque(produto_id);
    CREATE INDEX IF NOT EXISTS idx_estoque_loja ON estoque(loja_id);
    CREATE INDEX IF NOT EXISTS idx_pedido_loja ON pedido(loja_id);
    CREATE INDEX IF NOT EXISTS idx_pedido_usuario ON pedido(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_pedido_data ON pedido(data);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_enviado ON sync_queue(enviado);
  `);
};
