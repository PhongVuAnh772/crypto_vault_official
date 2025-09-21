export type IBlockcypherErrorRes = {
    error?: string;
};
export type IBitcoinDataRes = {
    address?: string;
    total_received?: number;
    total_sent?: number;
    balance?: number;
    unconfirmed_balance?: number;
    final_balance?: number;
    n_tx?: number;
    unconfirmed_n_tx?: number;
    final_n_tx?: number;
    txrefs?: Itxrefs[];
    unconfirmed_txrefs?: Iunconfirmed_txrefs[];
    tx_url: string;
};
export type Itxrefs = {
    tx_hash?: string;
    spent_by?: string;
    block_height?: number;
    tx_input_n?: number;
    tx_output_n?: number;
    value?: number;
    ref_balance?: number;
    spent?: boolean;
    confirmations?: number;
    confirmed?: string;
    double_spend?: boolean;
};
export type Iunconfirmed_txrefs = {
    address?: string;
    tx_hash?: string;
    tx_input_n?: number;
    tx_output_n?: number;
    value?: number;
    spent?: boolean;
    received?: string;
    confirmations?: number;
    double_spend?: boolean;
    preference?: string;
};

export type IBitcoinFullDataRes = {
    address: string;
    total_received: number;
    total_sent: number;
    balance: number;
    unconfirmed_balance: number;
    final_balance: number;
    n_tx: number;
    unconfirmed_n_tx: number;
    final_n_tx: number;
    hasMore?: boolean;
    txs: Itxs[];
};

export type Itxs = {
    block_height?: number;
    block_index?: number;
    hash: string;
    addresses: string[];
    total: number;
    fees: number;
    size: number;
    vsize: number;
    preference?: string;
    relayed_by?: string;
    received: string;
    confirmed?: string;
    ver?: number;
    lock_time?: number;
    double_spend?: boolean;
    vin_sz?: number;
    vout_sz?: number;
    opt_in_rbf?: boolean;
    confirmations: number;
    confidence?: number;
    inputs: InputsType[];
    outputs: OutputsType[];
};

export type InputsType = {
    prev_hash: string;
    output_index?: number;
    output_value: number;
    sequence?: number;
    addresses: string[];
    script_type?: string;
    age?: number;
    witness: string[];
};

export type OutputsType = {
    value: number;
    script?: string;
    addresses: string[];
    script_type?: string;
};

export type IPushBitcoinTransaction = {
    tx: {
        addresses?: string[];
        block_height?: number;
        block_index?: number;
        confirmations?: number;
        double_spend?: boolean;
        fees?: boolean;
        hash: string;
        inputs: InputsType[];
        outputs: OutputsType[];
        preference?: string;
        received?: string;
        relayed_by?: string;
        size?: number;
        total?: number;
        ver?: number;
        vin_sz?: number;
        vout_sz?: number;
        vsize?: number;
    };
};

export type BitcoinErrorType = {
    error?: string;
};
