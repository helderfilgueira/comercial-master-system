import { Pool, PoolClient } from 'pg';
import { env } from '../config/env';

let pool: Pool | null = null;

export const getPostgresPool = (): Pool => {
    if (pool) {
        return pool;
    }

    pool = new Pool({
        connectionString: env.DATABASE_URL,
    });

    // Initialize tables on first connection
    initializeTables();

    return pool;
};

const initializeTables = async () => {
    if (!pool) return;

    try {
        const client = await pool.connect();

        // 1. EMPRESA / LOJA / USUÁRIO
        await client.query(`
      CREATE TABLE IF NOT EXISTS empresa (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        cnpj TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS loja (
        id SERIAL PRIMARY KEY,
        empresa_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        endereco TEXT,
        cidade TEXT,
        uf TEXT,
        FOREIGN KEY (empresa_id) REFERENCES empresa(id)
      );

      CREATE TABLE IF NOT EXISTS cargo (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        permissoes TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS usuario (
        id SERIAL PRIMARY KEY,
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
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        loja_id INTEGER NOT NULL,
        FOREIGN KEY(usuario_id) REFERENCES usuario(id),
        FOREIGN KEY(loja_id) REFERENCES loja(id)
      );

      CREATE TABLE IF NOT EXISTS auditoria_log (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER,
        acao TEXT NOT NULL,
        tabela TEXT NOT NULL,
        registro_id INTEGER,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuario(id)
      );

      -- 2. PRODUTO / ESTOQUE
      CREATE TABLE IF NOT EXISTS categoria (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS fornecedor (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        cnpj TEXT
      );

      CREATE TABLE IF NOT EXISTS produto (
        id SERIAL PRIMARY KEY,
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
        id SERIAL PRIMARY KEY,
        produto_id INTEGER NOT NULL,
        loja_id INTEGER NOT NULL,
        quantidade REAL NOT NULL DEFAULT 0,
        FOREIGN KEY(produto_id) REFERENCES produto(id),
        FOREIGN KEY(loja_id) REFERENCES loja(id)
      );

      CREATE TABLE IF NOT EXISTS movimento_estoque (
        id SERIAL PRIMARY KEY,
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
        id SERIAL PRIMARY KEY,
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
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL,
        produto_id INTEGER NOT NULL,
        quantidade REAL NOT NULL,
        preco_unit REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY(pedido_id) REFERENCES pedido(id),
        FOREIGN KEY(produto_id) REFERENCES produto(id)
      );

      CREATE TABLE IF NOT EXISTS forma_pagamento (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pagamento (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL,
        forma_pagamento_id INTEGER NOT NULL,
        valor REAL NOT NULL,
        FOREIGN KEY(pedido_id) REFERENCES pedido(id),
        FOREIGN KEY(forma_pagamento_id) REFERENCES forma_pagamento(id)
      );

      -- 4. FINANCEIRO
      CREATE TABLE IF NOT EXISTS contas_pagar (
        id SERIAL PRIMARY KEY,
        empresa_id INTEGER NOT NULL,
        descricao TEXT,
        valor REAL NOT NULL,
        data_vencimento DATE NOT NULL,
        pago INTEGER DEFAULT 0,
        FOREIGN KEY (empresa_id) REFERENCES empresa(id)
      );

      CREATE TABLE IF NOT EXISTS contas_receber (
        id SERIAL PRIMARY KEY,
        empresa_id INTEGER NOT NULL,
        pedido_id INTEGER,
        valor REAL NOT NULL,
        recebido INTEGER DEFAULT 0,
        FOREIGN KEY (empresa_id) REFERENCES empresa(id),
        FOREIGN KEY (pedido_id) REFERENCES pedido(id)
      );

      CREATE TABLE IF NOT EXISTS fluxo_caixa (
        id SERIAL PRIMARY KEY,
        loja_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        valor REAL NOT NULL,
        descricao TEXT,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(loja_id) REFERENCES loja(id)
      );

      -- 5. FIDELIDADE
      CREATE TABLE IF NOT EXISTS fidelidade_pontos (
        id SERIAL PRIMARY KEY,
        cliente_nome TEXT NOT NULL,
        pontos INTEGER NOT NULL,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fidelidade_resgate (
        id SERIAL PRIMARY KEY,
        cliente_nome TEXT NOT NULL,
        pontos_usados INTEGER NOT NULL,
        descricao TEXT,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 6. SINCRONIZAÇÃO
      CREATE TABLE IF NOT EXISTS sync_queue (
        id SERIAL PRIMARY KEY,
        tabela TEXT NOT NULL,
        registro_id INTEGER NOT NULL,
        operacao TEXT NOT NULL,
        enviado INTEGER DEFAULT 0,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sync_log (
        id SERIAL PRIMARY KEY,
        tabela TEXT NOT NULL,
        registro_id INTEGER NOT NULL,
        operacao TEXT NOT NULL,
        status TEXT NOT NULL,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create indexes for better performance
        await client.query(`
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

        client.release();
        console.log('PostgreSQL database schema initialized successfully');
    } catch (error) {
        console.error('Error initializing PostgreSQL database:', error);
    }
};
