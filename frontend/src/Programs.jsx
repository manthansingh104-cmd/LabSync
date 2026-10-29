
import { useEffect, useState } from "react";
import API from "./api";
import {
    downloadProgram,
    downloadAllPrograms,
} from "./utils/downloadPrograms";

function Programs({ onEdit }) {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [search, setSearch] = useState("");
    const [topicFilter, setTopicFilter] = useState("All");

    const topics = [
        "All",
        "Array",
        "Stack",
        "Queue",
        "Linked List",
        "Tree",
        "Graph",
        "Searching",
        "Sorting",
        "Other",
    ];

    useEffect(() => {
        fetchPrograms();
    }, []);

    // Fetch programs
    const fetchPrograms = async () => {
        try {
            const user = JSON.parse(
                localStorage.getItem("user")
            );

            if (!user) {
                setPrograms([]);
                return;
            }

            const response = await API.get(
                `/programs?user=${user.id}`
            );

            setPrograms(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error("Error fetching programs:", error);
            alert("Could not load programs.");
        } finally {
            setLoading(false);
        }
    };

    // Delete program
    const deleteProgram = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this program?"
        );

        if (!confirmed) return;

        try {
            await API.delete(`/programs/${id}`);

            setPrograms((current) =>
                current.filter(
                    (program) => program._id !== id
                )
            );

            alert("Program deleted successfully!");
        } catch (error) {
            console.error("Delete error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete program."
            );
        }
    };

    // Download all programs
    const handleDownloadAll = async () => {
        if (!programs.length) {
            alert("There are no programs to export.");
            return;
        }

        try {
            setExporting(true);
            await downloadAllPrograms(programs);
        } catch (error) {
            console.error("Export error:", error);
            alert("Could not export programs.");
        } finally {
            setExporting(false);
        }
    };

    // Search and filter
    const filteredPrograms = programs.filter((program) => {
        const query = search.toLowerCase();

        const matchesSearch = [
            program.title,
            program.topic,
            program.language,
        ].some((value) =>
            String(value || "").toLowerCase().includes(query)
        );

        const matchesTopic =
            topicFilter === "All" ||
            program.topic === topicFilter;

        return matchesSearch && matchesTopic;
    });

    // Statistics
    const languageCount = new Set(
        programs.map((program) => program.language)
    ).size;

    const topicCount = new Set(
        programs.map((program) => program.topic)
    ).size;

    if (loading) {
        return (
            <div style={styles.loadingPage}>
                <div style={styles.loadingSpinner}>⌛</div>
                <h2>Loading your programs...</h2>
                <p>Your DSA workspace is getting ready.</p>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* HEADER */}
                <header style={styles.header}>
                    <div>
                        <div style={styles.eyebrow}>
                            YOUR CODING WORKSPACE
                        </div>

                        <h1 style={styles.heading}>
                            My Programs
                        </h1>

                        <p style={styles.subtitle}>
                            Manage, organize, and download your DSA solutions.
                        </p>
                    </div>

                    <button
                        style={styles.backButton}
                        onClick={fetchPrograms}
                        title="Refresh your program list"
                    >
                        ↻ Refresh
                    </button>
                </header>

                {/* STATISTICS */}
                <section style={styles.statsGrid}>
                    <StatCard
                        icon="📚"
                        label="Total Programs"
                        value={programs.length}
                        accent="#2563eb"
                    />

                    <StatCard
                        icon="🧩"
                        label="Topics Covered"
                        value={topicCount}
                        accent="#7c3aed"
                    />

                    <StatCard
                        icon="💻"
                        label="Languages Used"
                        value={languageCount}
                        accent="#059669"
                    />
                </section>

                {/* EXPORT PANEL */}
                <section style={styles.exportPanel}>
                    <div style={styles.exportInfo}>
                        <div style={styles.exportIcon}>📦</div>

                        <div>
                            <h2 style={styles.exportTitle}>
                                Your DSA collection
                            </h2>

                            <p style={styles.exportSubtitle}>
                                Download all your saved programs in one ZIP file.
                            </p>
                        </div>
                    </div>

                    <button
                        style={{
                            ...styles.exportButton,
                            opacity:
                                exporting || programs.length === 0
                                    ? 0.6
                                    : 1,
                        }}
                        onClick={handleDownloadAll}
                        disabled={
                            exporting || programs.length === 0
                        }
                    >
                        {exporting
                            ? "Preparing ZIP..."
                            : "⬇ Download All as ZIP"}
                    </button>
                </section>

                {/* SEARCH AND FILTER */}
                <section style={styles.searchPanel}>
                    <div style={styles.searchBox}>
                        <span style={styles.searchIcon}>⌕</span>

                        <input
                            type="text"
                            placeholder="Search by title, topic, or language..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            style={styles.searchInput}
                        />

                        {search && (
                            <button
                                style={styles.clearSearch}
                                onClick={() => setSearch("")}
                                type="button"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <select
                        value={topicFilter}
                        onChange={(e) =>
                            setTopicFilter(e.target.value)
                        }
                        style={styles.topicSelect}
                    >
                        {topics.map((topic) => (
                            <option
                                key={topic}
                                value={topic}
                            >
                                {topic === "All"
                                    ? "All Topics"
                                    : topic}
                            </option>
                        ))}
                    </select>

                    <div style={styles.resultCount}>
                        {filteredPrograms.length}{" "}
                        {filteredPrograms.length === 1
                            ? "program"
                            : "programs"}
                    </div>
                </section>

                {/* EMPTY STATES */}
                {programs.length === 0 ? (
                    <section style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📝</div>

                        <h2>No programs yet</h2>

                        <p>
                            Create your first DSA program to start
                            building your collection.
                        </p>
                    </section>
                ) : filteredPrograms.length === 0 ? (
                    <section style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🔍</div>

                        <h2>No matching programs</h2>

                        <p>
                            Try another search term or select a
                            different topic.
                        </p>

                        <button
                            style={styles.resetButton}
                            onClick={() => {
                                setSearch("");
                                setTopicFilter("All");
                            }}
                        >
                            Clear Filters
                        </button>
                    </section>
                ) : (
                    <>
                        <div style={styles.sectionHeader}>
                            <div>
                                <h2 style={styles.sectionTitle}>
                                    Your Collection
                                </h2>

                                <p style={styles.sectionSubtitle}>
                                    Your saved solutions, all in one place.
                                </p>
                            </div>
                        </div>

                        {/* PROGRAM CARDS */}
                        <section style={styles.programGrid}>
                            {filteredPrograms.map((program) => (
                                <article
                                    key={program._id}
                                    style={styles.card}
                                >
                                    <div style={styles.cardTop}>
                                        <div style={styles.programIcon}>
                                            {getLanguageIcon(
                                                program.language
                                            )}
                                        </div>

                                        <span style={styles.topicBadge}>
                                            {program.topic || "Other"}
                                        </span>
                                    </div>

                                    <h3 style={styles.programTitle}>
                                        {program.title || "Untitled Program"}
                                    </h3>

                                    <p style={styles.languageText}>
                                        <span style={styles.languageDot} />
                                        {program.language || "Unknown language"}
                                    </p>

                                    <div style={styles.codePreview}>
                                        <div style={styles.codeHeader}>
                                            <span>CODE PREVIEW</span>

                                            <span>
                                                {String(
                                                    program.code || ""
                                                ).split("\n").length}{" "}
                                                lines
                                            </span>
                                        </div>

                                        <pre style={styles.code}>
                                            {program.code ||
                                                "// No code available"}
                                        </pre>
                                    </div>

                                    <div style={styles.cardFooter}>
                                        <span style={styles.createdDate}>
                                            Created{" "}
                                            {program.createdAt
                                                ? new Date(
                                                    program.createdAt
                                                ).toLocaleDateString()
                                                : "—"}
                                        </span>
                                    </div>

                                    <div style={styles.cardActions}>
                                        <button
                                            style={styles.editButton}
                                            onClick={() =>
                                                onEdit(program._id)
                                            }
                                        >
                                            ✏ Edit
                                        </button>

                                        <button
                                            style={styles.downloadButton}
                                            onClick={() =>
                                                downloadProgram(program)
                                            }
                                        >
                                            ↓ Download
                                        </button>

                                        <button
                                            style={styles.deleteButton}
                                            onClick={() =>
                                                deleteProgram(
                                                    program._id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </section>
                    </>
                )}

                {/* FOOTER */}
                <footer style={styles.footer}>
                    <span>LabSync</span>
                    <span>Keep learning. Keep coding.</span>
                </footer>
            </div>
        </div>
    );
}

// Statistics card
function StatCard({ icon, label, value, accent }) {
    return (
        <div
            style={{
                ...styles.statCard,
                borderTop: `3px solid ${accent}`,
            }}
        >
            <div
                style={{
                    ...styles.statIcon,
                    color: accent,
                }}
            >
                {icon}
            </div>

            <div>
                <p style={styles.statLabel}>{label}</p>
                <h2 style={styles.statValue}>{value}</h2>
            </div>
        </div>
    );
}

function getLanguageIcon(language) {
    const icons = {
        "C++": "⚙️",
        C: "⚙️",
        Java: "☕",
        Python: "🐍",
        JavaScript: "🟨",
        TypeScript: "🔷",
    };

    return icons[language] || "💻";
}

// ================= STYLES =================

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f4f7fc",
        padding: "36px 28px",
        boxSizing: "border-box",
        color: "#172033",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
    },

    container: {
        width: "100%",
        maxWidth: "1450px",
        margin: "0 auto",
    },

    loadingPage: {
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#334155",
        textAlign: "center",
    },

    loadingSpinner: {
        fontSize: "34px",
        marginBottom: "10px",
    },

    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "28px",
    },

    eyebrow: {
        fontSize: "11px",
        fontWeight: "750",
        letterSpacing: "1.7px",
        color: "#64748b",
        marginBottom: "8px",
    },

    heading: {
        fontSize: "32px",
        lineHeight: 1.2,
        fontWeight: "800",
        letterSpacing: "-0.8px",
        margin: 0,
    },

    subtitle: {
        margin: "9px 0 0",
        color: "#718096",
        fontSize: "14px",
        lineHeight: 1.6,
    },

    backButton: {
        padding: "11px 16px",
        border: "1px solid #dbe3ef",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#334155",
        fontWeight: "650",
        fontSize: "13px",
        cursor: "pointer",
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "18px",
        marginBottom: "22px",
    },

    statCard: {
        display: "flex",
        alignItems: "center",
        gap: "17px",
        minWidth: 0,
        padding: "22px",
        borderRadius: "13px",
        background: "#ffffff",
        boxShadow: "0 3px 12px rgba(30, 50, 90, 0.04)",
        borderRight: "1px solid #e8edf5",
        borderBottom: "1px solid #e8edf5",
        borderLeft: "1px solid #e8edf5",
    },

    statIcon: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "48px",
        height: "48px",
        flexShrink: 0,
        borderRadius: "12px",
        background: "#f1f5f9",
        fontSize: "23px",
    },

    statLabel: {
        margin: "0 0 6px",
        fontSize: "12px",
        color: "#718096",
        fontWeight: "600",
    },

    statValue: {
        margin: 0,
        fontSize: "27px",
        lineHeight: 1,
        fontWeight: "800",
        color: "#172033",
    },

    exportPanel: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "18px",
        flexWrap: "wrap",
        padding: "20px 22px",
        marginBottom: "22px",
        border: "1px solid #dfe7f4",
        borderRadius: "13px",
        background: "#ffffff",
    },

    exportInfo: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },

    exportIcon: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "46px",
        height: "46px",
        borderRadius: "12px",
        background: "#eaf0ff",
        fontSize: "22px",
    },

    exportTitle: {
        margin: 0,
        fontSize: "15px",
        fontWeight: "750",
    },

    exportSubtitle: {
        margin: "5px 0 0",
        fontSize: "12px",
        color: "#718096",
        lineHeight: 1.5,
    },

    exportButton: {
        padding: "12px 17px",
        border: "none",
        borderRadius: "9px",
        background: "#2563eb",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer",
    },

    searchPanel: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        flexWrap: "wrap",
        marginBottom: "28px",
    },

    searchBox: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flex: "1 1 300px",
        minWidth: 0,
        height: "46px",
        padding: "0 13px",
        boxSizing: "border-box",
        border: "1px solid #dbe3ef",
        borderRadius: "10px",
        background: "#ffffff",
    },

    searchIcon: {
        color: "#64748b",
        fontSize: "25px",
        lineHeight: 1,
    },

    searchInput: {
        width: "100%",
        minWidth: 0,
        height: "100%",
        border: "none",
        outline: "none",
        background: "transparent",
        color: "#172033",
        fontSize: "13px",
    },

    clearSearch: {
        border: "none",
        background: "transparent",
        color: "#64748b",
        fontSize: "22px",
        cursor: "pointer",
    },

    topicSelect: {
        minWidth: "165px",
        height: "46px",
        padding: "0 13px",
        border: "1px solid #dbe3ef",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#334155",
        fontSize: "13px",
        cursor: "pointer",
    },

    resultCount: {
        color: "#718096",
        fontSize: "12px",
        fontWeight: "650",
        padding: "0 5px",
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },

    sectionTitle: {
        margin: 0,
        fontSize: "19px",
        fontWeight: "750",
    },

    sectionSubtitle: {
        margin: "5px 0 0",
        color: "#718096",
        fontSize: "12px",
    },

    programGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
        gap: "20px",
        alignItems: "stretch",
    },

    card: {
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        padding: "21px",
        border: "1px solid #e5eaf2",
        borderRadius: "14px",
        background: "#ffffff",
        boxShadow: "0 4px 15px rgba(30, 50, 90, 0.04)",
    },

    cardTop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "17px",
    },

    programIcon: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "42px",
        height: "42px",
        borderRadius: "11px",
        background: "#eff4ff",
        fontSize: "20px",
    },

    topicBadge: {
        maxWidth: "65%",
        padding: "7px 10px",
        borderRadius: "7px",
        background: "#f0f4ff",
        color: "#315ac7",
        fontSize: "11px",
        fontWeight: "700",
        overflowWrap: "anywhere",
    },

    programTitle: {
        margin: "0 0 10px",
        fontSize: "19px",
        lineHeight: 1.4,
        fontWeight: "750",
        overflowWrap: "anywhere",
    },

    languageText: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        margin: "0 0 18px",
        color: "#64748b",
        fontSize: "12px",
    },

    languageDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#10b981",
    },

    codePreview: {
        minWidth: 0,
        overflow: "hidden",
        border: "1px solid #e6ebf2",
        borderRadius: "9px",
        background: "#f8fafc",
    },

    codeHeader: {
        display: "flex",
        justifyContent: "space-between",
        gap: "10px",
        padding: "10px 12px",
        borderBottom: "1px solid #e6ebf2",
        color: "#64748b",
        fontSize: "9px",
        fontWeight: "750",
        letterSpacing: "0.7px",
    },

    code: {
        margin: 0,
        padding: "13px",
        minHeight: "75px",
        maxHeight: "150px",
        overflow: "auto",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        color: "#334155",
        fontSize: "11px",
        lineHeight: 1.7,
        fontFamily: "Consolas, monospace",
    },

    cardFooter: {
        marginTop: "15px",
        paddingBottom: "15px",
    },

    createdDate: {
        color: "#94a3b8",
        fontSize: "11px",
    },

    cardActions: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        marginTop: "auto",
        paddingTop: "14px",
        borderTop: "1px solid #edf0f5",
    },

    editButton: {
        flex: "1 1 auto",
        padding: "10px 12px",
        border: "1px solid #fde3b0",
        borderRadius: "8px",
        background: "#fff8eb",
        color: "#b76b08",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },

    downloadButton: {
        flex: "1 1 auto",
        padding: "10px 12px",
        border: "1px solid #bbf7d0",
        borderRadius: "8px",
        background: "#f0fdf4",
        color: "#15803d",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },

    deleteButton: {
        padding: "10px 12px",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        background: "#fff1f2",
        color: "#dc2626",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },

    emptyState: {
        padding: "65px 20px",
        textAlign: "center",
        border: "1px dashed #cbd5e1",
        borderRadius: "14px",
        background: "#ffffff",
    },

    emptyIcon: {
        fontSize: "42px",
        marginBottom: "15px",
    },

    resetButton: {
        marginTop: "12px",
        padding: "10px 16px",
        border: "none",
        borderRadius: "8px",
        background: "#2563eb",
        color: "#ffffff",
        fontWeight: "650",
        cursor: "pointer",
    },

    footer: {
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        padding: "28px 0 5px",
        marginTop: "20px",
        borderTop: "1px solid #e2e8f0",
        color: "#94a3b8",
        fontSize: "11px",
    },
};

export default Programs;

