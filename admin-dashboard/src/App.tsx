import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRightLeft,
  Cpu,
  Eye, EyeOff,
  Gavel,
  Globe,
  Layers,
  LayoutDashboard,
  RefreshCcw,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  Wallet,
  Zap,
  Ticket
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// Interceptor cho Axios
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
    }
    return Promise.reject(err);
  }
);

// Nhúng URL Backend (Mặc định local nếu đang dev)
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : (import.meta.env.VITE_API_URL ? `https://${import.meta.env.VITE_API_URL}` : 'https://cryptovault-backend-latest.onrender.com');

const WS_BASE = API_BASE.replace('http', 'ws');

// --- Types ---
interface Token { id: string; chain_id: string; chain_name?: string; symbol: string; name: string; decimals: number; contract_address: string; is_native: boolean; is_active: boolean; }
interface Profile { id: string; user_id: string; nickname: string; avatar_url: string; is_verified: boolean; created_at: string; }
interface Chain { id: string; name: string; chain_key: string; architecture: string; is_testnet: boolean; is_active: boolean; coin_transfer_fee?: number; token_transfer_fee?: number; nft_transfer_fee?: number; }
interface P2POrder { id: string; order_code: string; symbol: string; amount: string; price: string; status: string; created_at: string; buyer_id: string; seller_id: string; }
interface P2PAd { id: string; type: 'BUY' | 'SELL'; symbol: string; price: string; status: string; }
interface UserWallet { id: string; address: string; chain_name: string; wallet_type: string; user_id: string; }
interface TransJob { id: string; type: string; status: string; chain_name: string; tx_hash: string; created_at: string; }
interface AppConfig { features: { p2pEnabled: boolean; swapEnabled: boolean; bridgeEnabled: boolean; maintenanceMode: boolean; }; }
interface Withdrawal { id: string; user_id: string; token_id: string; amount: string; status: string; created_at: string; }
interface CustomTokenRequest { id: string; chain_id: string; chain_name: string; symbol: string; name: string; decimals: number; contract_address: string; status: string; created_at: string; metadata?: any; }
interface FeeConfig {
  enabled: boolean;
  mode: 'percentage' | 'flat';
  percent: number;
  flatAmount: number;
  minFee: number;
  maxFee: number;
  gasBufferPercent: number;
}
interface MarketplaceAuction {
  id: string;
  nft_address: string;
  nft_name?: string | null;
  seller_address: string;
  current_bidder?: string | null;
  start_price: string | number;
  current_price: string | number;
  min_bid_step: string | number;
  end_time: string;
  status: string;
}
interface MarketplaceBid {
  id: string;
  auction_id: string;
  bidder_address: string;
  amount: string | number;
  status: string;
  created_at: string;
}

interface TicketNFTRecord {
  id: string;
  tokenId: string;
  toAddress: string;
  eventName: string;
  ticketType: string;
  seatInfo: string;
  txHash: string;
  explorerUrl: string;
  mintedAt: string;
}

type Tab = 'overview' | 'tickets' | 'tokens' | 'custom-tokens' | 'chains' | 'p2p' | 'auctions' | 'withdrawals' | 'wallets' | 'users' | 'jobs' | 'fees' | 'config';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('admin_token');
    return !!(token && token !== 'undefined');
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);

  // Data State
  const [tokens, setTokens] = useState<Token[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [p2pOrders, setP2pOrders] = useState<P2POrder[]>([]);
  const [p2pAds, setP2pAds] = useState<P2PAd[]>([]);
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [jobs, setJobs] = useState<TransJob[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [customTokenRequests, setCustomTokenRequests] = useState<CustomTokenRequest[]>([]);
  const [auctions, setAuctions] = useState<MarketplaceAuction[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>('');
  const [selectedAuctionBids, setSelectedAuctionBids] = useState<MarketplaceBid[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [feeConfig, setFeeConfig] = useState<FeeConfig | null>(null);
  const [feeAmount, setFeeAmount] = useState('100');
  const [networkFee, setNetworkFee] = useState('0.1');
  const [feePreview, setFeePreview] = useState<any>(null);
  const [chainFeeEdits, setChainFeeEdits] = useState<Record<string, { coin_transfer_fee: number; token_transfer_fee: number; nft_transfer_fee: number }>>({});

  // Ticket NFT State
  const [ticketContractInfo, setTicketContractInfo] = useState<any>({
    contractAddress: '0x54D9F360D2A08f34C947371aF1Dd2652020f3ACc',
    chain: 'sepolia',
    minterAddress: '0xc46b7cea13b8cF495B63B52445423dd31a1325b4',
    explorerUrl: 'https://sepolia.etherscan.io/address/0x54D9F360D2A08f34C947371aF1Dd2652020f3ACc'
  });
  const [mintToAddress, setMintToAddress] = useState('0xc46b7cea13b8cF495B63B52445423dd31a1325b4');
  const [mintEventName, setMintEventName] = useState('CryptoVault Festival 2026');
  const [mintTicketType, setMintTicketType] = useState('VIP Pass');
  const [mintSeatInfo, setMintSeatInfo] = useState('VIP Row A-12');
  const [mintMetadataUri, setMintMetadataUri] = useState('ipfs://bafkreid4x6ygpy7l2327y345');
  const [mintingLoading, setMintingLoading] = useState(false);
  const [mintedTickets, setMintedTickets] = useState<TicketNFTRecord[]>([]);

  const fetchTicketsData = async () => {
    try {
      const [infoRes, listRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/tickets/info`),
        axios.get(`${API_BASE}/api/admin/tickets/list`)
      ]);
      if (infoRes.data.success) setTicketContractInfo(infoRes.data.data);
      if (listRes.data.success) setMintedTickets(listRes.data.data);
    } catch (e) {}
  };

  const handleMintTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintToAddress) return alert('Vui lòng nhập địa chỉ ví nhận NFT');
    setMintingLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/admin/tickets/mint`, {
        toAddress: mintToAddress,
        eventName: mintEventName,
        ticketType: mintTicketType,
        seatInfo: mintSeatInfo,
        metadataUri: mintMetadataUri,
      });
      if (res.data.success) {
        alert(`🎉 Mint NFT Vé thành công!\n\n• Token ID: #${res.data.data.tokenId}\n• TX Hash: ${res.data.data.txHash}`);
        setMintedTickets(prev => [res.data.data, ...prev]);
      }
    } catch (err: any) {
      alert('Mint thất bại: ' + (err.response?.data?.error || err.message));
    } finally {
      setMintingLoading(false);
    }
  };

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
      fetchTicketsData();
      setupWebSocket();
    }
    return () => wsRef.current?.close();
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [tokenRes, profileRes, chainRes, orderRes, adRes, walletRes, jobRes, wdRes, customRes, auctionRes, feeRes, configRes] = await Promise.all([
        axios.get(`${API_BASE}/api/v1/admin/tokens`),
        axios.get(`${API_BASE}/api/v1/admin/profiles`),
        axios.get(`${API_BASE}/api/v1/admin/chains`),
        axios.get(`${API_BASE}/api/v1/admin/p2p/orders`),
        axios.get(`${API_BASE}/api/v1/admin/p2p/ads`),
        axios.get(`${API_BASE}/api/v1/admin/wallets`),
        axios.get(`${API_BASE}/api/v1/admin/jobs`),
        axios.get(`${API_BASE}/api/v1/admin/withdrawals`),
        axios.get(`${API_BASE}/api/v1/admin/custom-tokens`),
        axios.get(`${API_BASE}/api/v1/admin/marketplace/auctions`),
        axios.get(`${API_BASE}/api/v1/admin/fees`),
        axios.get(`${API_BASE}/api/v1/config`)
      ]);
      setTokens(tokenRes.data.data || []);
      setProfiles(profileRes.data.data || []);
      setChains(chainRes.data.data || []);
      setP2pOrders(orderRes.data.data || []);
      setP2pAds(adRes.data.data || []);
      setWallets(walletRes.data.data || []);
      setJobs(jobRes.data.data || []);
      setWithdrawals(wdRes.data.data || []);
      setCustomTokenRequests(customRes.data.data || []);
      setAuctions(auctionRes.data.data || []);
      setFeeConfig(feeRes.data.data || null);
      setConfig({ features: configRes.data.features });
    } catch (err: any) {
      console.error('Fetch failed', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    try {
      const ws = new WebSocket(WS_BASE);
      wsRef.current = ws;
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        // Bỏ logic setPrices trực tiếp vào Root Component để tránh Web bị Rerender
        // if (data.event === 'priceChange') setPrices(p => ({ ...p, [data.symbol]: data.price }));
      };
      ws.onclose = () => setTimeout(setupWebSocket, 3000);
    } catch { }
  };

  // --- Handlers ---
  const toggleChain = async (id: string, currentStatus: boolean) => {
    try {
      await axios.put(`${API_BASE}/api/v1/admin/chains/${id}`, { is_active: !currentStatus });
      setChains(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    } catch (err) { alert('Toggle chain failed'); }
  };

  const toggleToken = async (id: string, currentStatus: boolean) => {
    try {
      await axios.put(`${API_BASE}/api/v1/admin/tokens/${id}`, { is_active: !currentStatus });
      setTokens(prev => prev.map(t => t.id === id ? { ...t, is_active: !currentStatus } : t));
    } catch (err) { alert('Toggle token failed'); }
  };

  const verifyProfile = async (id: string, currentStatus: boolean) => {
    try {
      await axios.put(`${API_BASE}/api/v1/admin/profiles/${id}`, { is_verified: !currentStatus });
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_verified: !currentStatus } : p));
    } catch (err) { alert('Profile update failed'); }
  };

  const handleApproveWithdrawal = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/api/v1/admin/withdrawals/${id}/approve`);
      setWithdrawals(prev => prev.filter(w => w.id !== id));
      alert('Withdrawal Approved! Lệnh đã được đưa vào Worker Queue.');
    } catch (err) { alert('Approval failed'); }
  };

  const handleRejectWithdrawal = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/api/v1/admin/withdrawals/${id}/reject`, { reason: 'Admin manual rejection' });
      setWithdrawals(prev => prev.filter(w => w.id !== id));
      alert('Withdrawal Rejected. Tiền đã được trả lại Available Balance.');
    } catch (err) { alert('Rejection failed'); }
  };

  const handleResolveDispute = async (id: string, resolution: 'FAVOR_BUYER' | 'FAVOR_SELLER') => {
    try {
      await axios.post(`${API_BASE}/api/v1/admin/p2p/disputes/${id}/resolve`, { resolution, reason: 'Admin Enforcement' });
      alert(`Đã giải quyết tranh chấp: ${resolution}`);
      fetchAllData();
    } catch (err) { alert('Dispute resolution failed'); }
  };

  const handleApproveToken = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/api/v1/admin/custom-tokens/${id}/approve`);
      alert('Token Approved!');
      fetchAllData();
    } catch (err) { alert('Approval failed'); }
  };

  const handleRejectToken = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/api/v1/admin/custom-tokens/${id}/reject`);
      alert('Token Rejected');
      fetchAllData();
    } catch (err) { alert('Rejection failed'); }
  };

  const loadAuctionBids = async (auctionId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/api/v1/admin/marketplace/auctions/${auctionId}/bids`);
      setSelectedAuctionId(auctionId);
      setSelectedAuctionBids(res.data.data || []);
    } catch (err) {
      alert('Load bids failed');
    }
  };

  const updateAuctionStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`${API_BASE}/api/v1/admin/marketplace/auctions/${id}`, { status });
      setAuctions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (selectedAuctionId === id) {
        await loadAuctionBids(id);
      }
    } catch (err) {
      alert('Update auction failed');
    }
  };

  const updateBidStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`${API_BASE}/api/v1/admin/marketplace/bids/${id}`, { status });
      setSelectedAuctionBids(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err) {
      alert('Update bid failed');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/v1/admin/login`, { email: authEmail, password: authPassword });
      if (res.data.success) {
        localStorage.setItem('admin_token', res.data.token);
        setIsAuthenticated(true);
      }
    } catch (err) {
      alert('Đăng nhập thất bại: Sai email hoặc mật khẩu');
    }
  };

  const saveFeeConfig = async () => {
    if (!feeConfig) return;
    try {
      const res = await axios.post(`${API_BASE}/api/v1/admin/fees`, feeConfig);
      setFeeConfig(res.data.data || feeConfig);
      alert('Fee config saved');
    } catch (err) {
      alert('Save fee config failed');
    }
  };

  const calculateFeePreview = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/v1/admin/fees/calculate`, {
        amount: Number(feeAmount),
        networkFee: Number(networkFee),
      });
      setFeePreview(res.data.data || null);
    } catch (err) {
      alert('Calculate fee failed');
    }
  };

  const getChainFeeEdit = (chain: Chain) => {
    return chainFeeEdits[chain.id] || {
      coin_transfer_fee: chain.coin_transfer_fee ?? 0.001,
      token_transfer_fee: chain.token_transfer_fee ?? 0.001,
      nft_transfer_fee: chain.nft_transfer_fee ?? 0.001,
    };
  };

  const updateChainFeeEdit = (chainId: string, field: string, value: number) => {
    setChainFeeEdits(prev => ({
      ...prev,
      [chainId]: { ...getChainFeeEdit(chains.find(c => c.id === chainId)!), [field]: value },
    }));
  };

  const saveChainFee = async (chainId: string) => {
    const edit = chainFeeEdits[chainId];
    if (!edit) return;
    try {
      const res = await axios.put(`${API_BASE}/api/v1/admin/chains/${chainId}`, edit);
      setChains(prev => prev.map(c => c.id === chainId ? { ...c, ...res.data.data } : c));
      setChainFeeEdits(prev => { const n = { ...prev }; delete n[chainId]; return n; });
      alert('Chain fee saved!');
    } catch (err) {
      alert('Save chain fee failed');
    }
  };

  if (!isAuthenticated) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
      <form style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '350px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: 16 }} onSubmit={handleLogin}>
        <h3 style={{ textAlign: 'center', color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>CryptoVault Admin</h3>
        <input type="email" placeholder="Admin Email" style={{ padding: '0.8rem', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff' }} value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu" style={{ padding: '0.8rem', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff' }} value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
        <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>Đăng Nhập Quản Trị</button>
      </form>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Zap size={24} color="var(--accent-blue)" fill="var(--accent-blue)" />
          <span>CryptoVault Admin</span>
        </div>

        <nav className="nav-list">
          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<Layers size={18} />} label="Asset Tokens" active={activeTab === 'tokens'} onClick={() => setActiveTab('tokens')} />
          <NavItem icon={<Activity size={18} />} label="Custom Tokens" active={activeTab === 'custom-tokens'} onClick={() => setActiveTab('custom-tokens')} />
          <NavItem icon={<Globe size={18} />} label="Network Chains" active={activeTab === 'chains'} onClick={() => setActiveTab('chains')} />
          <NavItem icon={<ShoppingCart size={18} />} label="P2P Marketplace" active={activeTab === 'p2p'} onClick={() => setActiveTab('p2p')} />
          <NavItem icon={<Ticket size={18} />} label="NFT Tickets" active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} />
          <NavItem icon={<Gavel size={18} />} label="NFT Auctions" active={activeTab === 'auctions'} onClick={() => setActiveTab('auctions')} />
          <NavItem icon={<ArrowRightLeft size={18} />} label="Withdrawals" active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} />
          <NavItem icon={<Wallet size={18} />} label="User Wallets" active={activeTab === 'wallets'} onClick={() => setActiveTab('wallets')} />
          <NavItem icon={<Users size={18} />} label="Profiles" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <NavItem icon={<Cpu size={18} />} label="System Jobs" active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
          <NavItem icon={<Activity size={18} />} label="Admin Fee" active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} />
          <NavItem icon={<Settings size={18} />} label="App Config" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot"></div>
          <span>Security Level: High (No Mnemonics Stored)</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div>
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')} Registry</h1>
            <p>Non-custodial Protocol Management (Database: Supabase Cluster)</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="security-badge"><Shield size={14} /> Encrypted DB</div>
            <button onClick={fetchAllData} className="btn btn-ghost"><RefreshCcw size={18} /> Sync</button>
          </div>
        </header>

        {loading ? (
          <div className="loading-state">
            <RefreshCcw size={32} className="animate-spin" />
            <p>Syncing entities...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key={activeTab}>
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-4">
                    <StatCard icon={<Layers color="var(--accent-blue)" />} label="Active Tokens" value={tokens.filter(t => t.is_active).length.toString()} subValue={`Total tracked: ${tokens.length}`} />
                    <StatCard icon={<Globe color="var(--accent-purple)" />} label="Active Protocols" value={chains.filter(c => c.is_active).length.toString()} subValue="Multi-architecture" />
                    <StatCard icon={<Users color="var(--accent-green)" />} label="Verified Users" value={profiles.filter(p => p.is_verified).length.toString()} subValue="Non-custodial" />
                    <StatCard icon={<Activity color="var(--accent-blue)" />} label="Server Status" value="Optimized" subValue="LATENCY: 12ms" />
                  </div>
                  <div className="glass-card chart-container">
                    <h3 style={{ marginBottom: '1rem' }}>System Engagement (Simulated)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={[{ t: '00', v: 10 }, { t: '04', v: 30 }, { t: '08', v: 25 }, { t: '12', v: 60 }, { t: '16', v: 45 }, { t: '20', v: 80 }]}>
                        <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent-blue)" stopOpacity={0.2} /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
                        <XAxis dataKey="t" stroke="#475569" axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Area type="monotone" dataKey="v" stroke="var(--accent-blue)" fill="url(#g)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {activeTab === 'tokens' && <TableLayout items={tokens} headers={['Asset', 'Chain', 'Address', 'Status', 'Actions']} renderRow={(t: Token) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="asset-icon">{t.symbol[0]}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{t.symbol}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{t.chain_name || 'Global'}</td>
                  <td className="mono">{t.contract_address || 'NATIVE'}</td>
                  <td><Badge active={t.is_active} /></td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => toggleToken(t.id, t.is_active)}>
                      {t.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </td>
                </tr>
              )} />}

              {activeTab === 'tickets' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Contract Header Info Card */}
                  <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Ticket size={20} color="var(--accent-blue)" /> TicketNFT Smart Contract (Sepolia Testnet)
                      </h3>
                      <a href={ticketContractInfo?.explorerUrl || 'https://sepolia.etherscan.io'} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={16} /> Xem trên Etherscan
                      </a>
                    </div>
                    <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
                      <div style={{ background: '#1e293b', padding: '1rem', borderRadius: 12, border: '1px solid #334155' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Contract Address</div>
                        <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 4, color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ticketContractInfo?.contractAddress || '0x54D9F360D2A08f34C947371aF1Dd2652020f3ACc'}
                        </div>
                      </div>
                      <div style={{ background: '#1e293b', padding: '1rem', borderRadius: 12, border: '1px solid #334155' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Minter Wallet Address</div>
                        <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 4, color: '#a855f7', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ticketContractInfo?.minterAddress || '0xc46b7cea13b8cF495B63B52445423dd31a1325b4'}
                        </div>
                      </div>
                      <div style={{ background: '#1e293b', padding: '1rem', borderRadius: 12, border: '1px solid #334155' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mạng Blockchain</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 4, color: '#4ade80' }}>
                          Ethereum Sepolia (Testnet $0)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Mint NFT Ticket */}
                  <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 16 }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>🚀 Mint NFT Vé Mới Cho Người Dùng</h3>
                    <form onSubmit={handleMintTicket} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 4 }}>Địa chỉ ví người nhận (toAddress):</label>
                        <input
                          type="text"
                          className="mono"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                          value={mintToAddress}
                          onChange={e => setMintToAddress(e.target.value)}
                          placeholder="0x..."
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 4 }}>Tên Sự Kiện (Event Name):</label>
                        <input
                          type="text"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                          value={mintEventName}
                          onChange={e => setMintEventName(e.target.value)}
                          placeholder="CryptoVault Festival 2026"
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 4 }}>Loại Vé (Ticket Type):</label>
                        <input
                          type="text"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                          value={mintTicketType}
                          onChange={e => setMintTicketType(e.target.value)}
                          placeholder="VIP Pass"
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 4 }}>Thông tin Ghế/Cổng (Seat Info):</label>
                        <input
                          type="text"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                          value={mintSeatInfo}
                          onChange={e => setMintSeatInfo(e.target.value)}
                          placeholder="VIP Row A-12"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 4 }}>IPFS Metadata URI:</label>
                        <input
                          type="text"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                          value={mintMetadataUri}
                          onChange={e => setMintMetadataUri(e.target.value)}
                          placeholder="ipfs://..."
                        />
                      </div>
                      <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                        <button
                          type="submit"
                          disabled={mintingLoading}
                          style={{ width: '100%', padding: '0.9rem', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: mintingLoading ? 0.7 : 1 }}
                        >
                          {mintingLoading ? '⏳ Đang Mint NFT On-Chain...' : '🚀 Mint NFT Vé Lên Sepolia Testnet'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Minted Tickets Table */}
                  <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 16 }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Lịch Sử Mint NFT Vé ({mintedTickets.length})</h3>
                    {mintedTickets.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có giao dịch mint vé nào trong phiên làm việc này.</div>
                    ) : (
                      <TableLayout
                        items={mintedTickets}
                        headers={['Token ID', 'Người Nhận', 'Sự Kiện / Vé', 'Thông Tin Ghế', 'TX Hash (Etherscan)', 'Thời Gian']}
                        renderRow={(item: TicketNFTRecord) => (
                          <tr key={item.id}>
                            <td><span className="badge badge-primary">#{item.tokenId}</span></td>
                            <td className="mono" style={{ color: '#38bdf8' }}>{item.toAddress.slice(0, 8)}...{item.toAddress.slice(-6)}</td>
                            <td>
                              <div style={{ fontWeight: 700 }}>{item.eventName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.ticketType}</div>
                            </td>
                            <td>{item.seatInfo}</td>
                            <td>
                              <a href={item.explorerUrl} target="_blank" rel="noreferrer" className="mono" style={{ color: '#a855f7', textDecoration: 'underline' }}>
                                {item.txHash.slice(0, 10)}...
                              </a>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(item.mintedAt).toLocaleTimeString()}</td>
                          </tr>
                        )}
                      />
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'custom-tokens' && (
                <div className="glass-card">
                  <h3>User Custom Token Requests</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Review tokens added by mobile users. Approving will add them to official Asset Tokens list.</p>
                  <TableLayout items={customTokenRequests} headers={['Asset', 'Chain', 'Contract Address', 'Requested By', 'Actions']} renderRow={(r: CustomTokenRequest) => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="asset-icon">{r.symbol ? r.symbol[0] : '?'}</div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{r.symbol}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>{r.chain_name}</td>
                      <td className="mono" style={{ fontSize: '0.8rem' }}>{r.contract_address}</td>
                      <td className="mono" style={{ fontSize: '0.8rem' }}>{r.metadata?.user_address?.substring(0, 10)}...</td>
                      <td>
                        <button className="btn btn-primary" style={{ marginRight: 8, padding: '0.5rem 1rem' }} onClick={() => handleApproveToken(r.id)}>Approve</button>
                        <button className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={() => handleRejectToken(r.id)}>Reject</button>
                      </td>
                    </tr>
                  )} />
                </div>
              )}

              {activeTab === 'chains' && <TableLayout items={chains} headers={['Network Name', 'Identifier', 'Arch', 'Protocol Support', 'Status', 'Toggle']} renderRow={(c: Chain) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td><code>{c.chain_key}</code></td>
                  <td>{c.architecture}</td>
                  <td>{c.is_testnet ? <span className="badge badge-neutral">Sandbox</span> : <span className="badge badge-success">Production</span>}</td>
                  <td><Badge active={c.is_active} /></td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={c.is_active} onChange={() => toggleChain(c.id, c.is_active)} />
                      <span className="slider"></span>
                    </label>
                  </td>
                </tr>
              )} />}

              {activeTab === 'p2p' && (
                <div className="grid grid-cols-1" style={{ gap: '2rem' }}>
                  <div className="glass-card">
                    <h3>P2P Dispute Resolution (Active Escrows)</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Sử dụng quyền Admin gỡ rối kẹt tiền (Giải phóng tới Buyer hoặc Hoàn tiền cho Seller)</p>
                    <TableLayout items={p2pOrders.filter(o => o.status === 'DISPUTED')} headers={['Order Code', 'Amount', 'Price', 'Status', 'Resolve P2P']} renderRow={(o: P2POrder) => (
                      <tr key={o.id}>
                        <td className="mono">{o.order_code}</td>
                        <td style={{ fontWeight: 800 }}>{o.amount} {o.symbol}</td>
                        <td>{o.price}</td>
                        <td><Badge active={false} danger label={o.status} /></td>
                        <td>
                          <button className="btn btn-primary" style={{ marginRight: 8, padding: '0.4rem 0.8rem', background: 'var(--accent-green)', borderColor: 'var(--accent-green)' }} onClick={() => handleResolveDispute(o.id, 'FAVOR_BUYER')}>Release to BUYER</button>
                          <button className="btn" style={{ padding: '0.4rem 0.8rem', background: '#334155', border: '1px solid #475569' }} onClick={() => handleResolveDispute(o.id, 'FAVOR_SELLER')}>Refund SELLER</button>
                        </td>
                      </tr>
                    )} />
                  </div>

                  <div className="glass-card">
                    <h3>Marketplace Ads List</h3>
                    <TableLayout items={p2pAds} headers={['Type', 'Asset', 'Price', 'Status']} renderRow={(a: P2PAd) => (
                      <tr key={a.id}>
                        <td style={{ color: a.type === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 800 }}>{a.type}</td>
                        <td>{a.symbol}</td>
                        <td>{a.price}</td>
                        <td><Badge active={a.status === 'ACTIVE'} label={a.status} /></td>
                      </tr>
                    )} />
                  </div>
                </div>
              )}

              {activeTab === 'withdrawals' && (
                <div className="glass-card">
                  <h3>Urgent Withdrawals Approval Queue</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Duyệt On-chain TX dành cho các khoản <Badge active label="PENDING" danger /> (Admin Workflow Orchestration)</p>
                  <TableLayout items={withdrawals} headers={['Tx ID', 'User UUID', 'Amount', 'Status', 'Date', 'Actions']} renderRow={(w: Withdrawal) => (
                    <tr key={w.id}>
                      <td className="mono">{w.id.substring(0, 8)}...</td>
                      <td className="mono" style={{ color: 'var(--accent-purple)' }}>{w.user_id.substring(0, 8)}...</td>
                      <td style={{ fontWeight: 800, fontSize: '1.2rem' }}>{w.amount}</td>
                      <td><Badge active={false} danger label={w.status} /></td>
                      <td>{new Date(w.created_at).toLocaleString()}</td>
                      <td>
                        <button className="btn btn-primary" style={{ marginRight: 8, padding: '0.5rem 1rem' }} onClick={() => handleApproveWithdrawal(w.id)}><Gavel size={14} style={{ display: 'inline', marginRight: 4 }} /> Approve</button>
                        <button className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={() => handleRejectWithdrawal(w.id)}>Reject</button>
                      </td>
                    </tr>
                  )} />
                </div>
              )}

              {activeTab === 'auctions' && (
                <div className="grid grid-cols-1" style={{ gap: '1rem' }}>
                  <div className="glass-card">
                    <h3>NFT Auction Registry</h3>
                    <TableLayout items={auctions} headers={['NFT', 'Seller', 'Current', 'End Time', 'Status', 'Actions']} renderRow={(a: MarketplaceAuction) => (
                      <tr key={a.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{a.nft_name || 'Unnamed NFT'}</div>
                          <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.nft_address}</div>
                        </td>
                        <td className="mono">{a.seller_address?.slice(0, 14)}...</td>
                        <td>{a.current_price || 0} TON</td>
                        <td>{new Date(a.end_time).toLocaleString()}</td>
                        <td><Badge active={a.status === 'active'} label={a.status} danger={a.status === 'cancelled'} /></td>
                        <td>
                          <button className="btn btn-ghost" style={{ marginRight: 6 }} onClick={() => loadAuctionBids(a.id)}>Bids</button>
                          <button className="btn btn-primary" style={{ marginRight: 6, padding: '0.35rem 0.7rem' }} onClick={() => updateAuctionStatus(a.id, 'finished')}>Finish</button>
                          <button className="btn" style={{ padding: '0.35rem 0.7rem', background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={() => updateAuctionStatus(a.id, 'cancelled')}>Cancel</button>
                        </td>
                      </tr>
                    )} />
                  </div>

                  {selectedAuctionId ? (
                    <div className="glass-card">
                      <h3>Bid Queue ({selectedAuctionBids.length})</h3>
                      <TableLayout items={selectedAuctionBids} headers={['Bidder', 'Amount', 'Status', 'Created', 'Actions']} renderRow={(b: MarketplaceBid) => (
                        <tr key={b.id}>
                          <td className="mono">{b.bidder_address}</td>
                          <td style={{ fontWeight: 700 }}>{b.amount} TON</td>
                          <td><Badge active={b.status === 'accepted'} label={b.status} danger={b.status === 'rejected'} /></td>
                          <td>{new Date(b.created_at).toLocaleString()}</td>
                          <td>
                            <button className="btn btn-primary" style={{ marginRight: 6, padding: '0.35rem 0.7rem' }} onClick={() => updateBidStatus(b.id, 'accepted')}>Accept</button>
                            <button className="btn" style={{ padding: '0.35rem 0.7rem', background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={() => updateBidStatus(b.id, 'rejected')}>Reject</button>
                          </td>
                        </tr>
                      )} />
                    </div>
                  ) : null}
                </div>
              )}

              {activeTab === 'users' && <TableLayout items={profiles} headers={['Identity', 'Auth ID', 'Seed Phrase Status', 'Created', 'KYC Status']} renderRow={(p: Profile) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={p.avatar_url || 'https://ui-avatars.com/api/?name=User'} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                      <span style={{ fontWeight: 700 }}>{p.nickname || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="mono">{p.user_id.slice(0, 12)}...</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)', fontSize: '0.8rem' }}>
                      <Shield size={12} /> Local Storage Only
                    </div>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className={`btn ${p.is_verified ? 'btn-ghost' : 'btn-primary'}`} style={{ padding: '0.3rem 0.6rem' }} onClick={() => verifyProfile(p.id, p.is_verified)}>
                      {p.is_verified ? 'Verified' : 'Verify Now'}
                    </button>
                  </td>
                </tr>
              )} />}

              {activeTab === 'config' && config && (
                <div className="grid grid-cols-2">
                  <div className="glass-card">
                    <h3>Gateway Management</h3>
                    <div className="switch-list">
                      {Object.entries(config.features).map(([key, val]) => (
                        <div className="switch-row" key={key}>
                          <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                          <label className="switch">
                            <input type="checkbox" checked={val} onChange={() => { }} />
                            <span className="slider"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fees' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Per-Chain Fee Management */}
                  <div className="glass-card">
                    <h3>⛓️ Per-Chain Transfer Fee</h3>
                    <p style={{ opacity: 0.6, fontSize: '0.85rem', marginBottom: '1rem' }}>Quản lý admin fee (%) cho mỗi mạng. Mobile app sẽ tự động nhận fee tương ứng.</p>
                    <div className="glass-table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Chain</th>
                            <th>Key</th>
                            <th>Coin Fee</th>
                            <th>Token Fee</th>
                            <th>NFT Fee</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chains.filter(c => c.is_active).map(chain => {
                            const edit = getChainFeeEdit(chain);
                            const hasChanges = !!chainFeeEdits[chain.id];
                            return (
                              <tr key={chain.id}>
                                <td><strong>{chain.name}</strong></td>
                                <td><span className="badge badge-neutral">{chain.chain_key}</span></td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.0001"
                                    value={edit.coin_transfer_fee}
                                    onChange={(e) => updateChainFeeEdit(chain.id, 'coin_transfer_fee', Number(e.target.value))}
                                    style={{ ...inputStyle, width: '100px' }}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.0001"
                                    value={edit.token_transfer_fee}
                                    onChange={(e) => updateChainFeeEdit(chain.id, 'token_transfer_fee', Number(e.target.value))}
                                    style={{ ...inputStyle, width: '100px' }}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.0001"
                                    value={edit.nft_transfer_fee}
                                    onChange={(e) => updateChainFeeEdit(chain.id, 'nft_transfer_fee', Number(e.target.value))}
                                    style={{ ...inputStyle, width: '100px' }}
                                  />
                                </td>
                                <td>
                                  <button
                                    className={`btn ${hasChanges ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => saveChainFee(chain.id)}
                                    disabled={!hasChanges}
                                    style={{ opacity: hasChanges ? 1 : 0.4 }}
                                  >
                                    Save
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Global Platform Fee Config */}
                  {feeConfig && (
                    <div className="grid grid-cols-2">
                      <div className="glass-card">
                        <h3>🌐 Global Platform Fee Config</h3>
                        <p style={{ opacity: 0.6, fontSize: '0.85rem', marginBottom: '1rem' }}>Cấu hình chung cho platform fee (áp dụng ngoài transfer fee per chain).</p>
                        <div className="switch-list">
                          <div className="switch-row">
                            <span>Enabled</span>
                            <label className="switch">
                              <input type="checkbox" checked={feeConfig.enabled} onChange={(e) => setFeeConfig({ ...feeConfig, enabled: e.target.checked })} />
                              <span className="slider"></span>
                            </label>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
                          <select value={feeConfig.mode} onChange={(e) => setFeeConfig({ ...feeConfig, mode: e.target.value as 'percentage' | 'flat' })} style={inputStyle}>
                            <option value="percentage">percentage</option>
                            <option value="flat">flat</option>
                          </select>
                          <input type="number" value={feeConfig.percent} onChange={(e) => setFeeConfig({ ...feeConfig, percent: Number(e.target.value) })} placeholder="percent" style={inputStyle} />
                          <input type="number" value={feeConfig.flatAmount} onChange={(e) => setFeeConfig({ ...feeConfig, flatAmount: Number(e.target.value) })} placeholder="flatAmount" style={inputStyle} />
                          <input type="number" value={feeConfig.minFee} onChange={(e) => setFeeConfig({ ...feeConfig, minFee: Number(e.target.value) })} placeholder="minFee" style={inputStyle} />
                          <input type="number" value={feeConfig.maxFee} onChange={(e) => setFeeConfig({ ...feeConfig, maxFee: Number(e.target.value) })} placeholder="maxFee" style={inputStyle} />
                          <input type="number" value={feeConfig.gasBufferPercent} onChange={(e) => setFeeConfig({ ...feeConfig, gasBufferPercent: Number(e.target.value) })} placeholder="gasBufferPercent" style={inputStyle} />
                          <button className="btn btn-primary" onClick={saveFeeConfig}>Save Fee Config</button>
                        </div>
                      </div>

                      <div className="glass-card">
                        <h3>🧮 Fee Calculator</h3>
                        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
                          <input type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} placeholder="Amount" style={inputStyle} />
                          <input type="number" value={networkFee} onChange={(e) => setNetworkFee(e.target.value)} placeholder="Network fee" style={inputStyle} />
                          <button className="btn btn-ghost" onClick={calculateFeePreview}>Calculate</button>
                        </div>
                        {feePreview ? (
                          <div style={{ marginTop: '1rem', lineHeight: 1.8 }}>
                            <div>Platform fee: <b>{feePreview.feeBreakdown?.platformFee}</b></div>
                            <div>Network fee: <b>{feePreview.feeBreakdown?.networkFee}</b></div>
                            <div>Gas buffer: <b>{feePreview.feeBreakdown?.gasBufferAmount}</b></div>
                            <div>Total fee: <b>{feePreview.feeBreakdown?.totalFee}</b></div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

// --- Helper Components ---
function NavItem({ icon, label, active, onClick }: any) {
  return (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      {icon} <span>{label}</span>
      {active && <motion.div layoutId="pill" className="nav-indicator" />}
    </div>
  );
}

function StatCard({ icon, label, value, subValue }: any) {
  return (
    <div className="glass-card stat-card">
      <div className="icon-box">{icon}</div>
      <div className="stat-content">
        <p className="label">{label}</p>
        <p className="value">{value}</p>
        <p className="sub">{subValue}</p>
      </div>
    </div>
  );
}

function TableLayout({ items, headers, renderRow }: any) {
  if (!items || items.length === 0) return <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No records found.</div>;
  return (
    <div className="glass-table-container">
      <table>
        <thead><tr>{headers.map((h: string) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{items.map(renderRow)}</tbody>
      </table>
    </div>
  );
}

function Badge({ active, label, danger }: any) {
  const text = label || (active ? 'Active' : 'Disabled');
  const type = active ? 'success' : (danger ? 'danger' : 'neutral');
  return <span className={`badge badge-${type}`}>{text}</span>;
}

const inputStyle: React.CSSProperties = {
  padding: '0.7rem 0.8rem',
  borderRadius: 8,
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#fff',
};

export default App;
