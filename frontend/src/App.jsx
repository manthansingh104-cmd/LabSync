
import { useEffect, useState } from "react";
import Programs from "./Programs";
import CreateProgram from "./CreateProgram";
import EditProgram from "./EditProgram";
import API from "./api";

const TOPICS = [
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

function App() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loggedIn, setLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [page, setPage] = useState("dashboard");
    const [editingProgramId, setEditingProgramId] = useState(null);

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    });

    const [programs, setPrograms] = useState([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [statsError, setStatsError] = useState("");

    // LOGIN / REGISTER
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isLogin) {
                const response = await API.post("/users/login", {
                    email,
                    password,
                });

                if (!response.data?.token || !response.data?.user) {
                    throw new Error(
                        "The server response is missing login information."
                    );
                }

                localStorage.setItem("token", response.data.token);
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );

                setUser(response.data.user);
                setLoggedIn(true);
                setPage("dashboard");

                alert("Login successful!");
            } else {
                await API.post("/users/register", {
                    name,
                    email,
                    password,
                });

                alert("Registration successful! Please login.");

                setIsLogin(true);
                setName("");
                setEmail("");
                setPassword("");
            }
        } catch (error) {
            console.error("LabSync login/register error:", error);

            if (error.response) {
                alert(
                    `Server error (${error.response.status}): ${
                        error.response.data?.message ||
                        "Unknown server error"
                    }`
                );
            } else if (error.request) {
                alert(
                    "No response received from the server. Please check your internet connection and API URL."
                );
            } else {
                alert(
                    `Request error: ${
                        error.message || "Unknown error"
                    }`
                );
            }
        }
    };

    // LOGOUT
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setLoggedIn(false);
        setPage("dashboard");
        setEditingProgramId(null);
        setPrograms([]);
        setStatsError("");
    };

    // FETCH PROGRAMS FOR DASHBOARD
    useEffect(() => {
        if (!loggedIn || page !== "dashboard" || !user?.id) {
            return;
        }

        let cancelled = false;

        const fetchDashboardPrograms = async () => {
            setLoadingStats(true);
            setStatsError("");

            try {
                const response = await API.get("/programs");

                if (!cancelled) {
                    setPrograms(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );
                }
            } catch (error) {
                console.error(
                    "Dashboard programs error:",
                    error
                );

                if (!cancelled) {
                    setStatsError(
                        "Could not load dashboard statistics. Please try again."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingStats(false);
                }
            }
        };

        fetchDashboardPrograms();

        return () => {
            cancelled = true;
        };
    }, [loggedIn, page, user?.id]);

    // CREATE PROGRAM
    if (loggedIn && page === "create") {
        return (
            <CreateProgram
                onBack={() => setPage("dashboard")}
            />
        );
    }

    // EDIT PROGRAM
    if (loggedIn && page === "edit") {
        return (
            <EditProgram
                programId={editingProgramId}
                onBack={() => {
                    setPage("programs");
                    setEditingProgramId(null);
                }}
            />
        );
    }

    // PROGRAM LIST / SEARCH
    if (loggedIn && page === "programs") {
        return (
            <div style={styles.dashboard}>
                <nav style={styles.navbar}>
                    <button
                        style={styles.brandButton}
                        onClick={() => setPage("dashboard")}
                    >
                        LabSync
                    </button>

                    <button
                        style={styles.logoutButton}
                        onClick={logout}
                    >
                        Logout
                    </button>
                </nav>

                <Programs
                    onEdit={(programId) => {
                        setEditingProgramId(programId);
                        setPage("edit");
                    }}
                />

                <div style={styles.backContainer}>
                    <button
                        style={styles.secondaryButton}
                        onClick={() => setPage("dashboard")}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // DASHBOARD
    if (loggedIn) {
        const topicsCovered = new Set(
            programs.map((program) => program.topic)
        ).size;

        const languagesUsed = new Set(
            programs
                .map((program) => program.language)
                .filter(Boolean)
        ).size;

        const topicStats = TOPICS.map((topic) => ({
            name: topic,
            count: programs.filter(
                (program) => program.topic === topic
            ).length,
        }));

        const languageStats = [
            ...new Set(
                programs
                    .map((program) => program.language)
                    .filter(Boolean)
            ),
        ]
            .map((language) => ({
                name: language,
                count: programs.filter(
                    (program) => program.language === language
                ).length,
            }))
            .sort((a, b) => b.count - a.count);

        const learningProgress = Math.round(
            (topicsCovered / TOPICS.length) * 100
        );

        const mostPracticedTopic = [...topicStats]
            .filter((topic) => topic.count > 0)
            .sort((a, b) => b.count - a.count)[0];

        const recentPrograms = [...programs]
            .sort((a, b) => {
                const dateA = new Date(
                    a.updatedAt || a.createdAt || 0
                ).getTime();

                const dateB = new Date(
                    b.updatedAt || b.createdAt || 0
                ).getTime();

                return dateB - dateA;
            })
            .slice(0, 3);

        const maxTopicCount = Math.max(
            ...topicStats.map((topic) => topic.count),
            1
        );

        return (
            <div style={styles.dashboard}>
                <nav style={styles.navbar}>
                    <button
                        style={styles.brandButton}
                        onClick={() => setPage("dashboard")}
                    >
                        LabSync
                    </button>

                    <button
                        style={styles.logoutButton}
                        onClick={logout}
                    >
                        Logout
                    </button>
                </nav>

                <main style={styles.content}>
                    <section style={styles.welcomeSection}>
                        <div>
                            <p style={styles.eyebrow}>
                                STUDENT WORKSPACE
                            </p>

                            <h1 style={styles.welcomeTitle}>
                                Welcome, {user?.name || "Student"}! 👋
                            </h1>

                            <p style={styles.email}>
                                {user?.email}
                            </p>

                            <p style={styles.welcomeDescription}>
                                Your DSA programs, organized in one place.
                                Continue learning from any computer.
                            </p>
                        </div>

                        <button
                            style={styles.primaryButton}
                            onClick={() => setPage("create")}
                        >
                            + New Program
                        </button>
                    </section>

                    {statsError && (
                        <div style={styles.errorBox}>
                            {statsError}

                            <button
                                style={styles.retryButton}
                                onClick={() => {
                                    setPage("programs");
                                    setPage("dashboard");
                                }}
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    <section style={styles.statsGrid}>
                        <StatCard
                            icon="📚"
                            label="Total Programs"
                            value={
                                loadingStats ? "..." : programs.length
                            }
                            description="Programs saved in your workspace"
                        />

                        <StatCard
                            icon="🧩"
                            label="Topics Covered"
                            value={
                                loadingStats ? "..." : topicsCovered
                            }
                            description={`Out of ${TOPICS.length} DSA topics`}
                        />

                        <StatCard
                            icon="💻"
                            label="Languages Used"
                            value={
                                loadingStats ? "..." : languagesUsed
                            }
                            description="Different programming languages"
                        />
                    </section>

                    <section style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <div>
                                <h2 style={styles.sectionTitle}>
                                    Learning Analytics
                                </h2>

                                <p style={styles.sectionDescription}>
                                    Track your DSA practice and coding progress.
                                </p>
                            </div>
                        </div>

                        <div style={styles.analyticsGrid}>
                            <article style={styles.analyticsCard}>
                                <h3 style={styles.analyticsTitle}>
                                    Learning Progress
                                </h3>

                                <div style={styles.progressHeader}>
                                    <span>Topics practiced</span>

                                    <strong>
                                        {loadingStats
                                            ? "..."
                                            : `${learningProgress}%`}
                                    </strong>
                                </div>

                                <div style={styles.progressTrack}>
                                    <div
                                        style={{
                                            ...styles.progressFill,
                                            width: `${
                                                loadingStats
                                                    ? 0
                                                    : learningProgress
                                            }%`,
                                        }}
                                    />
                                </div>

                                <p style={styles.analyticsDescription}>
                                    {loadingStats
                                        ? "Calculating progress..."
                                        : `${topicsCovered} of ${TOPICS.length} topics covered`}
                                </p>

                                <div style={styles.highlightBox}>
                                    <span>Most practiced topic</span>

                                    <strong>
                                        {loadingStats
                                            ? "Loading..."
                                            : mostPracticedTopic?.name ||
                                              "No topic yet"}
                                    </strong>

                                    <span>
                                        {loadingStats
                                            ? ""
                                            : mostPracticedTopic
                                            ? `${mostPracticedTopic.count} program(s)`
                                            : "Create a program to get started"}
                                    </span>
                                </div>
                            </article>

                            <article style={styles.analyticsCard}>
                                <h3 style={styles.analyticsTitle}>
                                    Programs by Topic
                                </h3>

                                {loadingStats ? (
                                    <p style={styles.analyticsDescription}>
                                        Loading analytics...
                                    </p>
                                ) : programs.length === 0 ? (
                                    <p style={styles.analyticsDescription}>
                                        Save your first program to see
                                        your topic statistics here.
                                    </p>
                                ) : (
                                    <div style={styles.chartList}>
                                        {topicStats
                                            .filter(
                                                (topic) => topic.count > 0
                                            )
                                            .sort(
                                                (a, b) =>
                                                    b.count - a.count
                                            )
                                            .map((topic) => (
                                                <div
                                                    key={topic.name}
                                                    style={styles.chartItem}
                                                >
                                                    <div
                                                        style={
                                                            styles.chartLabelRow
                                                        }
                                                    >
                                                        <span>
                                                            {topic.name}
                                                        </span>

                                                        <strong>
                                                            {topic.count}
                                                        </strong>
                                                    </div>

                                                    <div
                                                        style={
                                                            styles.chartTrack
                                                        }
                                                    >
                                                        <div
                                                            style={{
                                                                ...styles.chartFill,
                                                                width: `${
                                                                    (topic.count /
                                                                        maxTopicCount) *
                                                                    100
                                                                }%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </article>

                            <article style={styles.analyticsCard}>
                                <h3 style={styles.analyticsTitle}>
                                    Programs by Language
                                </h3>

                                {loadingStats ? (
                                    <p style={styles.analyticsDescription}>
                                        Loading analytics...
                                    </p>
                                ) : languageStats.length === 0 ? (
                                    <p style={styles.analyticsDescription}>
                                        Save a program to see your
                                        programming language breakdown.
                                    </p>
                                ) : (
                                    <div style={styles.languageList}>
                                        {languageStats.map((language) => (
                                            <div
                                                key={language.name}
                                                style={styles.languageItem}
                                            >
                                                <div
                                                    style={
                                                        styles.languageIcon
                                                    }
                                                >
                                                    💻
                                                </div>

                                                <div
                                                    style={
                                                        styles.languageInfo
                                                    }
                                                >
                                                    <strong>
                                                        {language.name}
                                                    </strong>

                                                    <span
                                                        style={
                                                            styles.languageInfoSpan
                                                        }
                                                    >
                                                        {language.count}{" "}
                                                        program(s)
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </article>
                        </div>
                    </section>

                    <section style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <div>
                                <h2 style={styles.sectionTitle}>
                                    Quick Actions
                                </h2>

                                <p style={styles.sectionDescription}>
                                    Manage your DSA work.
                                </p>
                            </div>
                        </div>

                        <div style={styles.actionsGrid}>
                            <ActionCard
                                icon="📂"
                                title="My Programs"
                                description="Browse, edit, search, and delete your saved programs."
                                buttonText="View Programs"
                                onClick={() => setPage("programs")}
                            />

                            <ActionCard
                                icon="✍️"
                                title="Create Program"
                                description="Write and save a new solution in your preferred language."
                                buttonText="Start Coding"
                                onClick={() => setPage("create")}
                            />

                            <ActionCard
                                icon="🔎"
                                title="Find a Program"
                                description="Search your saved programs by title, topic, or language."
                                buttonText="Search Programs"
                                onClick={() => setPage("programs")}
                            />
                        </div>
                    </section>

                    <section style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <div>
                                <h2 style={styles.sectionTitle}>
                                    Recently Updated
                                </h2>

                                <p style={styles.sectionDescription}>
                                    Pick up where you left off.
                                </p>
                            </div>

                            <button
                                style={styles.textButton}
                                onClick={() => setPage("programs")}
                            >
                                View all →
                            </button>
                        </div>

                        {loadingStats ? (
                            <div style={styles.emptyState}>
                                Loading your programs...
                            </div>
                        ) : recentPrograms.length === 0 ? (
                            <div style={styles.emptyState}>
                                <div style={styles.emptyIcon}>🗂️</div>

                                <h3>No programs yet</h3>

                                <p>
                                    Create your first DSA program to
                                    start building your collection.
                                </p>

                                <button
                                    style={styles.primaryButton}
                                    onClick={() => setPage("create")}
                                >
                                    Create Your First Program
                                </button>
                            </div>
                        ) : (
                            <div style={styles.recentGrid}>
                                {recentPrograms.map((program) => (
                                    <article
                                        key={program._id}
                                        style={styles.recentCard}
                                    >
                                        <div style={styles.recentCardTop}>
                                            <span style={styles.topicBadge}>
                                                {program.topic}
                                            </span>

                                            <span
                                                style={styles.languageBadge}
                                            >
                                                {program.language}
                                            </span>
                                        </div>

                                        <h3 style={styles.programTitle}>
                                            {program.title}
                                        </h3>

                                        <p style={styles.programDate}>
                                            Updated{" "}
                                            {new Date(
                                                program.updatedAt ||
                                                    program.createdAt ||
                                                    Date.now()
                                            ).toLocaleDateString()}
                                        </p>

                                        <button
                                            style={styles.openButton}
                                            onClick={() => {
                                                setEditingProgramId(
                                                    program._id
                                                );
                                                setPage("edit");
                                            }}
                                        >
                                            Open Program →
                                        </button>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <footer style={styles.footer}>
                        LabSync · DSA Lab Code Management System
                    </footer>
                </main>
            </div>
        );
    }

    // LOGIN / REGISTER PAGE
    return (
        <div style={styles.authPage}>
            <div style={styles.authCard}>
                <div style={styles.logoIcon}>⌘</div>

                <h1 style={styles.authTitle}>LabSync</h1>

                <p style={styles.authSubtitle}>
                    DSA Lab Code Management System
                </p>

                <h2 style={styles.authHeading}>
                    {isLogin ? "Welcome back" : "Create your account"}
                </h2>

                <p style={styles.authHint}>
                    {isLogin
                        ? "Log in to access your saved programs."
                        : "Join LabSync and keep your DSA work organized."}
                </p>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input
                            style={styles.authInput}
                            type="text"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                            required
                        />
                    )}

                    <input
                        style={styles.authInput}
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />

                    <input
                        style={styles.authInput}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={
                            isLogin ? "current-password" : "new-password"
                        }
                        required
                    />

                    <button
                        style={styles.authSubmit}
                        type="submit"
                    >
                        {isLogin ? "Login to LabSync" : "Create Account"}
                    </button>
                </form>

                <p style={styles.switchText}>
                    {isLogin
                        ? "Don't have an account?"
                        : "Already have an account?"}

                    <button
                        type="button"
                        style={styles.switchButton}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? " Register" : " Login"}
                    </button>
                </p>
            </div>
        </div>
    );
}

// STATISTICS CARD
function StatCard({ icon, label, value, description }) {
    return (
        <article style={styles.statCard}>
            <div style={styles.statCardTop}>
                <span style={styles.statIcon}>{icon}</span>
                <span style={styles.statLabel}>{label}</span>
            </div>

            <div style={styles.statValue}>{value}</div>

            <p style={styles.statDescription}>{description}</p>
        </article>
    );
}

// QUICK ACTION CARD
function ActionCard({
    icon,
    title,
    description,
    buttonText,
    onClick,
}) {
    return (
        <article style={styles.actionCard}>
            <div style={styles.actionIcon}>{icon}</div>

            <h3 style={styles.actionTitle}>{title}</h3>

            <p style={styles.actionDescription}>{description}</p>

            <button
                style={styles.actionButton}
                onClick={onClick}
            >
                {buttonText} →
            </button>
        </article>
    );
}

// STYLES
const styles = {
    dashboard: {
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#172033",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
    },

    navbar: {
        minHeight: "72px",
        background: "#ffffff",
        borderBottom: "1px solid #e8edf5",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 5%",
        position: "sticky",
        top: 0,
        zIndex: 10,
    },

    brandButton: {
        border: "none",
        background: "transparent",
        color: "#1d4ed8",
        fontSize: "25px",
        fontWeight: 800,
        cursor: "pointer",
    },

    logoutButton: {
        padding: "10px 18px",
        border: "1px solid #fecaca",
        borderRadius: "9px",
        background: "#fff1f2",
        color: "#be123c",
        fontWeight: 600,
        cursor: "pointer",
    },

    content: {
        width: "min(1200px, 92%)",
        margin: "0 auto",
        padding: "38px 0",
    },

    welcomeSection: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "24px",
        flexWrap: "wrap",
        marginBottom: "30px",
    },

    eyebrow: {
        color: "#2563eb",
        fontSize: "12px",
        fontWeight: 800,
        letterSpacing: "1.8px",
        marginBottom: "10px",
    },

    welcomeTitle: {
        fontSize: "clamp(27px, 4vw, 36px)",
        margin: "0 0 8px",
        color: "#111827",
    },

    email: {
        margin: "0 0 12px",
        color: "#64748b",
    },

    welcomeDescription: {
        margin: 0,
        color: "#64748b",
        lineHeight: 1.7,
    },

    primaryButton: {
        border: "none",
        borderRadius: "10px",
        padding: "13px 20px",
        background: "#2563eb",
        color: "white",
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(37,99,235,0.18)",
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "18px",
        marginBottom: "38px",
    },

    statCard: {
        background: "white",
        padding: "24px",
        border: "1px solid #e8edf5",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(15,23,42,0.035)",
    },

    statCardTop: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },

    statIcon: {
        fontSize: "22px",
    },

    statLabel: {
        color: "#64748b",
        fontSize: "14px",
        fontWeight: 600,
    },

    statValue: {
        fontSize: "34px",
        fontWeight: 800,
        marginTop: "18px",
        color: "#111827",
    },

    statDescription: {
        color: "#94a3b8",
        fontSize: "13px",
        marginBottom: 0,
    },

    section: {
        marginBottom: "38px",
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        marginBottom: "18px",
    },

    sectionTitle: {
        fontSize: "22px",
        margin: "0 0 6px",
        color: "#111827",
    },

    sectionDescription: {
        color: "#64748b",
        margin: 0,
        fontSize: "14px",
    },

    analyticsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "20px",
        alignItems: "stretch",
    },

    analyticsCard: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "22px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.04)",
        minWidth: 0,
    },

    analyticsTitle: {
        margin: "0 0 22px",
        fontSize: "17px",
        fontWeight: 700,
        color: "#111827",
    },

    progressHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        marginBottom: "10px",
        fontSize: "14px",
        color: "#4b5563",
    },

    progressTrack: {
        height: "10px",
        background: "#e5e7eb",
        borderRadius: "999px",
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        background: "linear-gradient(90deg, #2563eb, #06b6d4)",
        borderRadius: "999px",
        transition: "width 0.4s ease",
    },

    analyticsDescription: {
        color: "#6b7280",
        fontSize: "13px",
        lineHeight: 1.6,
        marginTop: "12px",
    },

    highlightBox: {
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        marginTop: "25px",
        padding: "15px",
        background: "#eff6ff",
        borderRadius: "12px",
        color: "#4b5563",
        fontSize: "13px",
    },

    chartList: {
        display: "flex",
        flexDirection: "column",
        gap: "18px",
    },

    chartItem: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },

    chartLabelRow: {
        display: "flex",
        justifyContent: "space-between",
        gap: "10px",
        fontSize: "13px",
        color: "#374151",
    },

    chartTrack: {
        height: "8px",
        background: "#e5e7eb",
        borderRadius: "999px",
        overflow: "hidden",
    },

    chartFill: {
        height: "100%",
        background: "#4f46e5",
        borderRadius: "999px",
        transition: "width 0.4s ease",
    },

    languageList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },

    languageItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        background: "#f9fafb",
        border: "1px solid #f3f4f6",
        borderRadius: "10px",
    },

    languageIcon: {
        width: "42px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#e0e7ff",
        borderRadius: "10px",
        fontSize: "20px",
        flexShrink: 0,
    },

    languageInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        color: "#111827",
        fontSize: "14px",
    },

    languageInfoSpan: {
        color: "#6b7280",
        fontSize: "12px",
    },

    actionsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "18px",
    },

    actionCard: {
        background: "white",
        border: "1px solid #e8edf5",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 16px rgba(15,23,42,0.035)",
    },

    actionIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "13px",
        background: "#eff6ff",
        display: "grid",
        placeItems: "center",
        fontSize: "24px",
    },

    actionTitle: {
        fontSize: "18px",
        margin: "18px 0 8px",
    },

    actionDescription: {
        minHeight: "44px",
        color: "#64748b",
        fontSize: "14px",
        lineHeight: 1.6,
    },

    actionButton: {
        border: "none",
        background: "transparent",
        color: "#2563eb",
        padding: "10px 0 0",
        fontWeight: 700,
        cursor: "pointer",
    },

    textButton: {
        border: "none",
        background: "transparent",
        color: "#2563eb",
        fontWeight: 700,
        cursor: "pointer",
    },

    emptyState: {
        background: "white",
        border: "1px dashed #cbd5e1",
        borderRadius: "16px",
        padding: "36px 20px",
        textAlign: "center",
        color: "#64748b",
    },

    emptyIcon: {
        fontSize: "36px",
    },

    recentGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "18px",
    },

    recentCard: {
        background: "white",
        border: "1px solid #e8edf5",
        borderRadius: "14px",
        padding: "20px",
        boxShadow: "0 4px 16px rgba(15,23,42,0.035)",
    },

    recentCardTop: {
        display: "flex",
        justifyContent: "space-between",
        gap: "8px",
        flexWrap: "wrap",
    },

    topicBadge: {
        padding: "5px 9px",
        borderRadius: "20px",
        background: "#eff6ff",
        color: "#1d4ed8",
        fontSize: "12px",
        fontWeight: 700,
    },

    languageBadge: {
        padding: "5px 9px",
        borderRadius: "20px",
        background: "#f1f5f9",
        color: "#475569",
        fontSize: "12px",
    },

    programTitle: {
        fontSize: "18px",
        margin: "18px 0 8px",
        overflowWrap: "anywhere",
    },

    programDate: {
        color: "#94a3b8",
        fontSize: "13px",
    },

    openButton: {
        marginTop: "8px",
        border: "none",
        background: "transparent",
        color: "#2563eb",
        fontWeight: 700,
        cursor: "pointer",
        padding: "8px 0",
    },

    errorBox: {
        background: "#fff1f2",
        border: "1px solid #fecdd3",
        color: "#be123c",
        padding: "14px",
        borderRadius: "10px",
        marginBottom: "20px",
    },

    retryButton: {
        display: "block",
        marginTop: "10px",
        padding: "8px 12px",
        border: "1px solid #fecdd3",
        borderRadius: "8px",
        background: "#ffffff",
        color: "#be123c",
        cursor: "pointer",
    },

    backContainer: {
        padding: "0 4% 30px",
    },

    secondaryButton: {
        padding: "11px 16px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        background: "white",
        cursor: "pointer",
    },

    footer: {
        borderTop: "1px solid #e2e8f0",
        paddingTop: "22px",
        textAlign: "center",
        color: "#94a3b8",
        fontSize: "13px",
    },

    authPage: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        background:
            "linear-gradient(135deg, #eff6ff, #f8fafc 55%, #eef2ff)",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
    },

    authCard: {
        width: "100%",
        maxWidth: "410px",
        padding: "36px",
        background: "white",
        border: "1px solid #e8edf5",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
        textAlign: "center",
    },

    logoIcon: {
        width: "54px",
        height: "54px",
        display: "grid",
        placeItems: "center",
        margin: "0 auto 14px",
        background: "#2563eb",
        color: "white",
        borderRadius: "15px",
        fontSize: "28px",
        fontWeight: 800,
    },

    authTitle: {
        margin: "0 0 6px",
        fontSize: "32px",
        color: "#111827",
    },

    authSubtitle: {
        color: "#64748b",
        fontSize: "14px",
        marginBottom: "28px",
    },

    authHeading: {
        fontSize: "22px",
        marginBottom: "8px",
    },

    authHint: {
        color: "#64748b",
        fontSize: "14px",
        lineHeight: 1.5,
        marginBottom: "22px",
    },

    authInput: {
        width: "100%",
        boxSizing: "border-box",
        padding: "13px 14px",
        marginBottom: "14px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        fontSize: "15px",
        outlineColor: "#2563eb",
    },

    authSubmit: {
        width: "100%",
        padding: "13px",
        marginTop: "4px",
        border: "none",
        borderRadius: "9px",
        background: "#2563eb",
        color: "white",
        fontSize: "15px",
        fontWeight: 700,
        cursor: "pointer",
    },

    switchText: {
        marginTop: "22px",
        color: "#64748b",
        fontSize: "14px",
    },

    switchButton: {
        border: "none",
        background: "transparent",
        color: "#2563eb",
        cursor: "pointer",
        fontWeight: 700,
    },
};

export default App;

