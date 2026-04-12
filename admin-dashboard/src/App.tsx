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
  Zap
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

axios.interceptors.response.use(res => res, err => {
  const isLoginRequest = err.config?.url?.includes('/admin/login');

  // Chỉ reload nếu KHÔNG PHẢI là request login và gặp lỗi 401
  if (err.response?.status === 401 && !isLoginRequest) {
    localStorage.removeItem('admin_token');
    // Thay vì reload liên tục, chúng ta có thể điều hướng hoặc báo lỗi nhẹ nhàng
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
  return Promise.reject(err);
});

// Nhúng URL Backend (Mặc định local nếu đang dev)
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : (import.meta.env.VITE_API_URL ? `https://${import.meta.env.VITE_API_URL}` : 'https://cryptovault-backend-latest.onrender.com');

const WS_BASE = API_BASE.replace('http', 'ws');

// --- Types ---
interface Token { id: string; chain_id: string; chain_name?: string; symbol: string; name: string; decimals: number; contract_address: string; is_native: boolean; is_active: boolean; }
interface Profile { id: string; user_id: string; nickname: string; avatar_url: string; is_verified: boolean; created_at: string; }
interface Chain { id: string; name: string; chain_key: string; architecture: string; is_testnet: boolean; is_active: boolean; }
interface P2POrder { id: string; order_code: string; symbol: string; amount: string; price: string; status: string; created_at: string; buyer_id: string; seller_id: string; }
interface P2PAd { id: string; type: 'BUY' | 'SELL'; symbol: string; price: string; status: string; }
interface UserWallet { id: string; address: string; chain_name: string; wallet_type: string; user_id: string; }
interface TransJob { id: string; type: string; status: string; chain_name: string; tx_hash: string; created_at: string; }
interface AppConfig { features: { p2pEnabled: boolean; swapEnabled: boolean; bridgeEnabled: boolean; maintenanceMode: boolean; }; }
interface Withdrawal { id: string; user_id: string; token_id: string; amount: string; status: string; created_at: string; }

type Tab = 'overview' | 'tokens' | 'chains' | 'p2p' | 'withdrawals' | 'wallets' | 'users' | 'jobs' | 'config';

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
  const [config, setConfig] = useState<AppConfig | null>(null);
  // Không lưu State Price ở Root App để tránh Re-render hàng loạt mỗi Mili-giây khiến Web bị treo
  // const [prices, setPrices] = useState<Record<string, number>>({});

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
      setupWebSocket();
    }
    return () => wsRef.current?.close();
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [tokenRes, profileRes, chainRes, orderRes, adRes, walletRes, jobRes, wdRes, configRes] = await Promise.all([
        axios.get(`${API_BASE}/api/v1/admin/tokens`),
        axios.get(`${API_BASE}/api/v1/admin/profiles`),
        axios.get(`${API_BASE}/api/v1/admin/chains`),
        axios.get(`${API_BASE}/api/v1/admin/p2p/orders`),
        axios.get(`${API_BASE}/api/v1/admin/p2p/ads`),
        axios.get(`${API_BASE}/api/v1/admin/wallets`),
        axios.get(`${API_BASE}/api/v1/admin/jobs`),
        axios.get(`${API_BASE}/api/v1/admin/withdrawals`),
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
      setConfig({ features: configRes.data.features });
    } catch (err) {
      console.error('Fetch failed', err);
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
          <NavItem icon={<Globe size={18} />} label="Network Chains" active={activeTab === 'chains'} onClick={() => setActiveTab('chains')} />
          <NavItem icon={<ShoppingCart size={18} />} label="P2P Marketplace" active={activeTab === 'p2p'} onClick={() => setActiveTab('p2p')} />
          <NavItem icon={<ArrowRightLeft size={18} />} label="Withdrawals" active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} />
          <NavItem icon={<Wallet size={18} />} label="User Wallets" active={activeTab === 'wallets'} onClick={() => setActiveTab('wallets')} />
          <NavItem icon={<Users size={18} />} label="Profiles" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <NavItem icon={<Cpu size={18} />} label="System Jobs" active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
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

export default App;
