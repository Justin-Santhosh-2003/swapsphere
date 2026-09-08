import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    getAdminStats,
    getAdminUsers,
    toggleSuspendUser,
    toggleAdminRole,
    getAdminListings,
    removeListing,
    restoreListing,
    getAdminExchanges,
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../api/adminApi";
import "./AdminDashboard.css";

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function Badge({ label, color }) {
    const colors = {
        green:  { bg: "rgba(34,197,94,0.12)",  text: "#4ade80", border: "rgba(34,197,94,0.25)" },
        red:    { bg: "rgba(239,68,68,0.12)",   text: "#f87171", border: "rgba(239,68,68,0.25)" },
        yellow: { bg: "rgba(234,179,8,0.12)",   text: "#facc15", border: "rgba(234,179,8,0.25)" },
        blue:   { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
        purple: { bg: "rgba(168,85,247,0.12)",  text: "#c084fc", border: "rgba(168,85,247,0.25)" },
        gray:   { bg: "rgba(100,116,139,0.12)", text: "#94a3b8", border: "rgba(100,116,139,0.25)" }
    };
    const c = colors[color] || colors.gray;
    return (
        <span style={{
            background: c.bg,
            color: c.text,
            border: `1px solid ${c.border}`,
            padding: "2px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 700,
            whiteSpace: "nowrap"
        }}>
            {label}
        </span>
    );
}

const statusBadge = (status) => {
    const map = {
        ACTIVE:    ["Active",    "green"],
        SUSPENDED: ["Suspended", "red"],
        AVAILABLE: ["Available", "green"],
        PENDING:   ["Pending",   "yellow"],
        IN_EXCHANGE:["In Exchange","blue"],
        EXCHANGED: ["Exchanged", "purple"],
        REMOVED:   ["Removed",   "red"],
        COMPLETED: ["Completed", "purple"],
        ACCEPTED:  ["Accepted",  "green"],
        REJECTED:  ["Rejected",  "red"],
        CANCELLED: ["Cancelled", "gray"]
    };
    const [label, color] = map[status] || [status, "gray"];
    return <Badge label={label} color={color} />;
};


// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
        <div className="adm-modal-overlay" onClick={onClose}>
            <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="adm-modal-header">
                    <h3 className="adm-modal-title">{title}</h3>
                    <button className="adm-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="adm-modal-body">{children}</div>
            </div>
        </div>
    );
}


// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
function ConfirmDialog({ isOpen, message, onConfirm, onCancel, confirmText = "Confirm", danger = false }) {
    if (!isOpen) return null;
    return (
        <div className="adm-modal-overlay" onClick={onCancel}>
            <div className="adm-modal adm-modal--sm" onClick={(e) => e.stopPropagation()}>
                <div className="adm-modal-body" style={{ textAlign: "center", padding: "28px 24px" }}>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, marginBottom: 24 }}>{message}</p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                        <button className="adm-btn adm-btn--ghost" onClick={onCancel}>Cancel</button>
                        <button
                            className={`adm-btn ${danger ? "adm-btn--danger" : "adm-btn--primary"}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


// ─── STATS CARDS ─────────────────────────────────────────────────────────────
function StatsSection({ stats }) {
    const cards = [
        { icon: "👥", label: "Total Users",       value: stats.totalUsers,         color: "#6366f1" },
        { icon: "📦", label: "Total Listings",     value: stats.totalListings,       color: "#22c55e" },
        { icon: "📂", label: "Categories",         value: stats.totalCategories,     color: "#f59e0b" },
        { icon: "🔄", label: "Exchanges",          value: stats.totalExchanges,      color: "#3b82f6" },
        { icon: "✅", label: "Completed",          value: stats.completedExchanges,  color: "#a855f7" },
        { icon: "⏳", label: "Pending Requests",   value: stats.pendingExchanges,    color: "#ec4899" },
        { icon: "⛔", label: "Suspended Users",    value: stats.suspendedUsers,      color: "#ef4444" },
        { icon: "⭐", label: "Reviews",            value: stats.totalReviews,        color: "#eab308" }
    ];

    return (
        <div className="adm-stats-grid">
            {cards.map((c, i) => (
                <div className="adm-stat-card" key={i} style={{ "--accent": c.color }}>
                    <div className="adm-stat-icon">{c.icon}</div>
                    <div className="adm-stat-value">{c.value ?? "—"}</div>
                    <div className="adm-stat-label">{c.label}</div>
                </div>
            ))}
        </div>
    );
}


// ─── USERS TAB ───────────────────────────────────────────────────────────────
function UsersTab() {
    const [users,   setUsers]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [pages,   setPages]   = useState(1);
    const [loading, setLoading] = useState(false);
    const [search,  setSearch]  = useState("");
    const [role,    setRole]    = useState("ALL");
    const [status,  setStatus]  = useState("ALL");
    const [confirm, setConfirm] = useState(null);

    const load = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const res = await getAdminUsers({ page: p, limit: 15, search, role, status });
            const d = res.data;
            setUsers(d.users);
            setTotal(d.total);
            setPages(d.pages);
            setPage(p);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [search, role, status]);

    useEffect(() => { load(1); }, [load]);

    const handleSuspend = async (id) => {
        try {
            await toggleSuspendUser(id);
            load(page);
        } catch (e) { console.error(e); }
        setConfirm(null);
    };

    const handleToggleAdmin = async (id) => {
        try {
            await toggleAdminRole(id);
            load(page);
        } catch (e) { console.error(e); }
        setConfirm(null);
    };

    return (
        <div>
            {/* FILTERS */}
            <div className="adm-filter-row">
                <input
                    className="adm-search"
                    placeholder="🔍  Search name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select className="adm-select" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="ALL">All Roles</option>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
            </div>

            <div className="adm-table-meta">
                {total} user{total !== 1 ? "s" : ""} found
            </div>

            {loading ? <div className="adm-loading">Loading…</div> : (
                <div className="adm-table-wrap">
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Location</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id}>
                                    <td>
                                        <div className="adm-user-cell">
                                            <div className="adm-user-avatar">
                                                {u.profilePicture
                                                    ? <img src={u.profilePicture} alt={u.fullName} />
                                                    : <span>{u.fullName?.charAt(0) || "?"}</span>
                                                }
                                            </div>
                                            <div>
                                                <div className="adm-user-name">{u.fullName}</div>
                                                <div className="adm-user-email">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="adm-muted">{u.location || "—"}</span></td>
                                    <td>{statusBadge(u.role === "ADMIN" ? "ACTIVE" : "SUSPENDED")}{" "}
                                        {<Badge label={u.role} color={u.role === "ADMIN" ? "yellow" : "blue"} />}
                                    </td>
                                    <td>{statusBadge(u.status)}</td>
                                    <td><span className="adm-muted">{new Date(u.createdAt).toLocaleDateString("en-IN")}</span></td>
                                    <td>
                                        <div className="adm-action-row">
                                            <button
                                                className={`adm-btn adm-btn--sm ${u.status === "ACTIVE" ? "adm-btn--danger" : "adm-btn--success"}`}
                                                onClick={() => setConfirm({
                                                    message: u.status === "ACTIVE"
                                                        ? `Suspend "${u.fullName}"? They will be locked out.`
                                                        : `Reactivate "${u.fullName}"?`,
                                                    onConfirm: () => handleSuspend(u._id),
                                                    confirmText: u.status === "ACTIVE" ? "Suspend" : "Reactivate",
                                                    danger: u.status === "ACTIVE"
                                                })}
                                            >
                                                {u.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                                            </button>
                                            <button
                                                className="adm-btn adm-btn--sm adm-btn--ghost"
                                                onClick={() => setConfirm({
                                                    message: u.role === "ADMIN"
                                                        ? `Remove admin rights from "${u.fullName}"?`
                                                        : `Promote "${u.fullName}" to Admin?`,
                                                    onConfirm: () => handleToggleAdmin(u._id),
                                                    confirmText: u.role === "ADMIN" ? "Remove Admin" : "Make Admin",
                                                    danger: false
                                                })}
                                            >
                                                {u.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PAGINATION */}
            {pages > 1 && (
                <div className="adm-pagination">
                    <button disabled={page <= 1} onClick={() => load(page - 1)} className="adm-btn adm-btn--ghost adm-btn--sm">← Prev</button>
                    <span className="adm-page-info">Page {page} of {pages}</span>
                    <button disabled={page >= pages} onClick={() => load(page + 1)} className="adm-btn adm-btn--ghost adm-btn--sm">Next →</button>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirm}
                message={confirm?.message}
                onConfirm={confirm?.onConfirm}
                onCancel={() => setConfirm(null)}
                confirmText={confirm?.confirmText}
                danger={confirm?.danger}
            />
        </div>
    );
}


// ─── LISTINGS TAB ─────────────────────────────────────────────────────────────
function ListingsTab() {
    const navigate = useNavigate();
    const [items,   setItems]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [pages,   setPages]   = useState(1);
    const [loading, setLoading] = useState(false);
    const [search,  setSearch]  = useState("");
    const [status,  setStatus]  = useState("ALL");
    const [confirm, setConfirm] = useState(null);

    const load = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const res = await getAdminListings({ page: p, limit: 15, search, status });
            const d = res.data;
            setItems(d.items);
            setTotal(d.total);
            setPages(d.pages);
            setPage(p);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [search, status]);

    useEffect(() => { load(1); }, [load]);

    const handleRemove = async (id) => {
        try { await removeListing(id); load(page); } catch (e) { console.error(e); }
        setConfirm(null);
    };

    const handleRestore = async (id) => {
        try { await restoreListing(id); load(page); } catch (e) { console.error(e); }
        setConfirm(null);
    };

    return (
        <div>
            <div className="adm-filter-row">
                <input className="adm-search" placeholder="🔍  Search title…" value={search} onChange={(e) => setSearch(e.target.value)} />
                <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="ALL">All Status</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="PENDING">Pending</option>
                    <option value="EXCHANGED">Exchanged</option>
                    <option value="REMOVED">Removed</option>
                </select>
            </div>

            <div className="adm-table-meta">{total} listing{total !== 1 ? "s" : ""} found</div>

            {loading ? <div className="adm-loading">Loading…</div> : (
                <div className="adm-table-wrap">
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Owner</th>
                                <th>Status</th>
                                <th>Listed</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        <div className="adm-item-cell">
                                            {item.images?.[0] && (
                                                <img src={item.images[0]} alt={item.title} className="adm-item-thumb" />
                                            )}
                                            <span className="adm-item-title">{item.title}</span>
                                        </div>
                                    </td>
                                    <td><span className="adm-muted">{item.categoryId?.name || "—"}</span></td>
                                    <td>
                                        <div className="adm-user-name">{item.ownerId?.fullName || "—"}</div>
                                        <div className="adm-user-email">{item.ownerId?.email || ""}</div>
                                    </td>
                                    <td>{statusBadge(item.status)}</td>
                                    <td><span className="adm-muted">{new Date(item.createdAt).toLocaleDateString("en-IN")}</span></td>
                                    <td>
                                        <div className="adm-action-row">
                                            <button
                                                className="adm-btn adm-btn--sm adm-btn--ghost"
                                                onClick={() => navigate(`/item/${item._id}`)}
                                            >
                                                View
                                            </button>
                                            {item.status === "REMOVED" ? (
                                                <button
                                                    className="adm-btn adm-btn--sm adm-btn--success"
                                                    onClick={() => setConfirm({
                                                        message: `Restore "${item.title}" to Available?`,
                                                        onConfirm: () => handleRestore(item._id),
                                                        confirmText: "Restore",
                                                        danger: false
                                                    })}
                                                >
                                                    Restore
                                                </button>
                                            ) : (
                                                <button
                                                    className="adm-btn adm-btn--sm adm-btn--danger"
                                                    onClick={() => setConfirm({
                                                        message: `Remove listing "${item.title}"? The owner will be notified.`,
                                                        onConfirm: () => handleRemove(item._id),
                                                        confirmText: "Remove",
                                                        danger: true
                                                    })}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pages > 1 && (
                <div className="adm-pagination">
                    <button disabled={page <= 1} onClick={() => load(page - 1)} className="adm-btn adm-btn--ghost adm-btn--sm">← Prev</button>
                    <span className="adm-page-info">Page {page} of {pages}</span>
                    <button disabled={page >= pages} onClick={() => load(page + 1)} className="adm-btn adm-btn--ghost adm-btn--sm">Next →</button>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirm}
                message={confirm?.message}
                onConfirm={confirm?.onConfirm}
                onCancel={() => setConfirm(null)}
                confirmText={confirm?.confirmText}
                danger={confirm?.danger}
            />
        </div>
    );
}


// ─── EXCHANGES TAB ────────────────────────────────────────────────────────────
function ExchangesTab() {
    const [exchanges, setExchanges] = useState([]);
    const [total,     setTotal]     = useState(0);
    const [page,      setPage]      = useState(1);
    const [pages,     setPages]     = useState(1);
    const [loading,   setLoading]   = useState(false);
    const [status,    setStatus]    = useState("ALL");

    const load = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const res = await getAdminExchanges({ page: p, limit: 15, status });
            const d = res.data;
            setExchanges(d.exchanges);
            setTotal(d.total);
            setPages(d.pages);
            setPage(p);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [status]);

    useEffect(() => { load(1); }, [load]);

    return (
        <div>
            <div className="adm-filter-row">
                <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            <div className="adm-table-meta">{total} exchange{total !== 1 ? "s" : ""} found</div>

            {loading ? <div className="adm-loading">Loading…</div> : (
                <div className="adm-table-wrap">
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th>Requester</th>
                                <th>Offered Item</th>
                                <th>↔</th>
                                <th>Requested Item</th>
                                <th>Receiver</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exchanges.map((ex) => (
                                <tr key={ex._id}>
                                    <td>
                                        <div className="adm-user-name">{ex.requesterId?.fullName || "—"}</div>
                                        <div className="adm-user-email">{ex.requesterId?.email || ""}</div>
                                    </td>
                                    <td><span className="adm-item-title">{ex.offeredItemId?.title || "—"}</span></td>
                                    <td style={{ textAlign: "center", color: "#6366f1", fontWeight: 700 }}>⇌</td>
                                    <td><span className="adm-item-title">{ex.requestedItemId?.title || "—"}</span></td>
                                    <td>
                                        <div className="adm-user-name">{ex.receiverId?.fullName || "—"}</div>
                                        <div className="adm-user-email">{ex.receiverId?.email || ""}</div>
                                    </td>
                                    <td>{statusBadge(ex.status)}</td>
                                    <td><span className="adm-muted">{new Date(ex.createdAt).toLocaleDateString("en-IN")}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pages > 1 && (
                <div className="adm-pagination">
                    <button disabled={page <= 1} onClick={() => load(page - 1)} className="adm-btn adm-btn--ghost adm-btn--sm">← Prev</button>
                    <span className="adm-page-info">Page {page} of {pages}</span>
                    <button disabled={page >= pages} onClick={() => load(page + 1)} className="adm-btn adm-btn--ghost adm-btn--sm">Next →</button>
                </div>
            )}
        </div>
    );
}


// ─── CATEGORIES TAB ───────────────────────────────────────────────────────────
function CategoriesTab() {
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(false);
    const [search,     setSearch]     = useState("");
    const [modal,      setModal]      = useState(null); // null | { type: "create" | "edit", data? }
    const [confirm,    setConfirm]    = useState(null);
    const [formErr,    setFormErr]    = useState("");

    // Form state
    const [formName,        setFormName]        = useState("");
    const [formIcon,        setFormIcon]        = useState("📦");
    const [formDesc,        setFormDesc]        = useState("");
    const [formSubcatInput, setFormSubcatInput] = useState(""); // newline-separated
    const [saving,          setSaving]          = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getAdminCategories();
            setCategories(res.data.categories);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setFormName(""); setFormIcon("📦"); setFormDesc(""); setFormSubcatInput(""); setFormErr("");
        setModal({ type: "create" });
    };

    const openEdit = (cat) => {
        setFormName(cat.name);
        setFormIcon(cat.icon || "📦");
        setFormDesc(cat.description || "");
        setFormSubcatInput((cat.subcategories || []).join("\n"));
        setFormErr("");
        setModal({ type: "edit", data: cat });
    };

    const handleSave = async () => {
        if (!formName.trim()) { setFormErr("Category name is required."); return; }
        setSaving(true);
        const payload = {
            name: formName.trim(),
            icon: formIcon.trim() || "📦",
            description: formDesc.trim(),
            subcategories: formSubcatInput
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
        };
        try {
            if (modal.type === "create") {
                await createCategory(payload);
            } else {
                await updateCategory(modal.data._id, payload);
            }
            setModal(null);
            load();
        } catch (e) {
            setFormErr(e.response?.data?.message || "Failed to save category.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);
            load();
        } catch (e) {
            alert(e.response?.data?.message || "Cannot delete category.");
        }
        setConfirm(null);
    };

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="adm-filter-row">
                <input
                    className="adm-search"
                    placeholder="🔍  Search categories…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="adm-btn adm-btn--primary" onClick={openCreate}>
                    + New Category
                </button>
            </div>

            <div className="adm-table-meta">
                {filtered.length} categor{filtered.length !== 1 ? "ies" : "y"}
            </div>

            {loading ? <div className="adm-loading">Loading…</div> : (
                <div className="adm-categories-grid">
                    {filtered.map((cat) => (
                        <div className="adm-cat-card" key={cat._id}>
                            <div className="adm-cat-card-top">
                                <span className="adm-cat-icon">{cat.icon || "📦"}</span>
                                <div className="adm-cat-info">
                                    <span className="adm-cat-name">{cat.name}</span>
                                    <span className="adm-muted" style={{ fontSize: 11 }}>
                                        {(cat.subcategories || []).length} subcategories
                                    </span>
                                </div>
                                <div className="adm-cat-actions">
                                    <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => openEdit(cat)}>
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="adm-btn adm-btn--danger adm-btn--sm"
                                        onClick={() => setConfirm({
                                            message: `Delete category "${cat.name}"? This cannot be undone.`,
                                            onConfirm: () => handleDelete(cat._id),
                                            confirmText: "Delete",
                                            danger: true
                                        })}
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                            {(cat.subcategories || []).length > 0 && (
                                <div className="adm-cat-subs">
                                    {cat.subcategories.slice(0, 6).map((s, i) => (
                                        <span key={i} className="adm-cat-sub-chip">{s}</span>
                                    ))}
                                    {cat.subcategories.length > 6 && (
                                        <span className="adm-cat-sub-chip adm-cat-sub-chip--more">
                                            +{cat.subcategories.length - 6} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE / EDIT MODAL */}
            <Modal
                isOpen={!!modal}
                onClose={() => setModal(null)}
                title={modal?.type === "create" ? "Create New Category" : `Edit: ${modal?.data?.name}`}
            >
                <div className="adm-form">
                    <div className="adm-form-row">
                        <div className="adm-form-group" style={{ flex: "0 0 80px" }}>
                            <label className="adm-label">Icon</label>
                            <input
                                className="adm-input"
                                style={{ textAlign: "center", fontSize: 22 }}
                                value={formIcon}
                                onChange={(e) => setFormIcon(e.target.value)}
                                maxLength={2}
                            />
                        </div>
                        <div className="adm-form-group" style={{ flex: 1 }}>
                            <label className="adm-label">Category Name *</label>
                            <input
                                className="adm-input"
                                placeholder="e.g. Laptops"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="adm-form-group">
                        <label className="adm-label">Description</label>
                        <input
                            className="adm-input"
                            placeholder="Short description of this category"
                            value={formDesc}
                            onChange={(e) => setFormDesc(e.target.value)}
                        />
                    </div>

                    <div className="adm-form-group">
                        <label className="adm-label">
                            Subcategories <span className="adm-muted">(one per line)</span>
                        </label>
                        <textarea
                            className="adm-input adm-textarea"
                            placeholder={"Gaming Laptops\nUltrabooks\nBusiness Laptops"}
                            value={formSubcatInput}
                            onChange={(e) => setFormSubcatInput(e.target.value)}
                            rows={8}
                        />
                        <span className="adm-muted" style={{ fontSize: 11, marginTop: 4 }}>
                            {formSubcatInput.split("\n").filter((s) => s.trim()).length} subcategories entered
                        </span>
                    </div>

                    {formErr && <p className="adm-form-error">{formErr}</p>}

                    <div className="adm-form-actions">
                        <button className="adm-btn adm-btn--ghost" onClick={() => setModal(null)}>
                            Cancel
                        </button>
                        <button className="adm-btn adm-btn--primary" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving…" : modal?.type === "create" ? "Create Category" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={!!confirm}
                message={confirm?.message}
                onConfirm={confirm?.onConfirm}
                onCancel={() => setConfirm(null)}
                confirmText={confirm?.confirmText}
                danger={confirm?.danger}
            />
        </div>
    );
}


// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
const TABS = [
    { id: "overview",    label: "📊 Overview"   },
    { id: "users",       label: "👥 Users"      },
    { id: "listings",    label: "📦 Listings"   },
    { id: "exchanges",   label: "🔄 Exchanges"  },
    { id: "categories",  label: "📂 Categories" }
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [stats,     setStats]     = useState({});
    const [statsLoad, setStatsLoad] = useState(true);

    useEffect(() => {
        getAdminStats()
            .then((res) => setStats(res.data.stats || {}))
            .catch(console.error)
            .finally(() => setStatsLoad(false));
    }, []);

    return (
        <div className="adm-page">

            {/* HEADER */}
            <div className="adm-page-header">
                <div className="adm-header-content">
                    <span className="adm-header-badge">⚙️ ADMIN PANEL</span>
                    <h1 className="adm-page-title">Admin Dashboard</h1>
                    <p className="adm-page-sub">
                        Manage users, listings, exchanges, and categories across SwapSphere.
                    </p>
                </div>
            </div>

            {/* STATS ROW (always visible) */}
            {statsLoad
                ? <div className="adm-loading">Loading stats…</div>
                : <StatsSection stats={stats} />
            }

            {/* TABS */}
            <div className="adm-tabs">
                {TABS.filter((t) => t.id !== "overview").map((tab) => (
                    <button
                        key={tab.id}
                        className={`adm-tab ${activeTab === tab.id ? "adm-tab--active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            <div className="adm-tab-content">
                {activeTab === "users"      && <UsersTab      />}
                {activeTab === "listings"   && <ListingsTab   />}
                {activeTab === "exchanges"  && <ExchangesTab  />}
                {activeTab === "categories" && <CategoriesTab />}
                {activeTab === "overview"   && (
                    <div className="adm-welcome">
                        <p>Select a tab above to manage your platform.</p>
                    </div>
                )}
            </div>

        </div>
    );
}