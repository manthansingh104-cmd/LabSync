
import { useState } from "react";
import API from "./api";
import Editor from "@monaco-editor/react";

function CreateProgram({ onBack }) {
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("Array");
    const [language, setLanguage] = useState("C++");
    const [code, setCode] = useState("");

    const [saving, setSaving] = useState(false);
    const [output, setOutput] = useState("");

    const handleSave = async (e) => {
        e.preventDefault();

        const user = JSON.parse(
            localStorage.getItem("user")
        );

        if (!user) {
            alert("Please login first.");
            return;
        }

        try {
            setSaving(true);

            const response = await API.post("/programs", {
                title,
                topic,
                language,
                code,
                user: user.id,
            });

            console.log(response.data);

            alert("Program saved successfully! 🎉");

            setTitle("");
            setTopic("Array");
            setLanguage("C++");
            setCode("");
            setOutput("");
        } catch (error) {
            console.error("Save program error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to save program"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleRun = () => {
        setOutput(
            "Code execution will be connected next..."
        );
    };

    const editorLanguage = {
        "C++": "cpp",
        C: "c",
        Java: "java",
        Python: "python",
    }[language] || "plaintext";

    return (
        <div style={styles.page}>
            <div style={styles.workspace}>

                {/* HEADER */}
                <header style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.iconBox}>{"</>"}</div>

                        <div>
                            <div style={styles.breadcrumb}>
                                LABSYNC / WORKSPACE
                            </div>

                            <h1 style={styles.heading}>
                                Create Program
                            </h1>

                            <p style={styles.subtitle}>
                                Write, organize, and save your DSA solutions.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        style={styles.backButton}
                        onClick={onBack}
                    >
                        ← Back to Dashboard
                    </button>
                </header>

                {/* FORM */}
                <form
                    onSubmit={handleSave}
                    style={styles.form}
                >

                    {/* PROGRAM DETAILS */}
                    <section style={styles.detailsSection}>
                        <div style={styles.sectionHeading}>
                            <span style={styles.sectionNumber}>01</span>

                            <div>
                                <h2 style={styles.sectionTitle}>
                                    Program Details
                                </h2>

                                <p style={styles.sectionDescription}>
                                    Give your solution a title and select its category.
                                </p>
                            </div>
                        </div>

                        <div style={styles.field}>
                            <label
                                htmlFor="program-title"
                                style={styles.label}
                            >
                                Program Title
                                <span style={styles.required}> *</span>
                            </label>

                            <input
                                id="program-title"
                                type="text"
                                placeholder="e.g. Linear Search Algorithm"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.fieldsGrid}>
                            <div style={styles.field}>
                                <label
                                    htmlFor="program-topic"
                                    style={styles.label}
                                >
                                    DSA Topic
                                </label>

                                <select
                                    id="program-topic"
                                    value={topic}
                                    onChange={(e) =>
                                        setTopic(e.target.value)
                                    }
                                    style={styles.input}
                                >
                                    <option value="Array">Array</option>
                                    <option value="Stack">Stack</option>
                                    <option value="Queue">Queue</option>
                                    <option value="Linked List">
                                        Linked List
                                    </option>
                                    <option value="Tree">Tree</option>
                                    <option value="Graph">Graph</option>
                                    <option value="Searching">
                                        Searching
                                    </option>
                                    <option value="Sorting">Sorting</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div style={styles.field}>
                                <label
                                    htmlFor="program-language"
                                    style={styles.label}
                                >
                                    Programming Language
                                </label>

                                <select
                                    id="program-language"
                                    value={language}
                                    onChange={(e) =>
                                        setLanguage(e.target.value)
                                    }
                                    style={styles.input}
                                >
                                    <option value="C++">C++</option>
                                    <option value="Java">Java</option>
                                    <option value="Python">Python</option>
                                    <option value="C">C</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* CODE EDITOR */}
                    <section style={styles.editorSection}>
                        <div style={styles.editorHeader}>
                            <div style={styles.sectionHeading}>
                                <span style={styles.sectionNumber}>02</span>

                                <div>
                                    <h2 style={styles.sectionTitle}>
                                        Code Editor
                                    </h2>

                                    <p style={styles.sectionDescription}>
                                        Write your solution in the editor below.
                                    </p>
                                </div>
                            </div>

                            <div style={styles.languageBadge}>
                                <span style={styles.statusDot} />
                                {language}
                            </div>
                        </div>

                        <div style={styles.editorFrame}>
                            <div style={styles.editorToolbar}>
                                <div style={styles.windowDots}>
                                    <span style={{ ...styles.dot, background: "#f87171" }} />
                                    <span style={{ ...styles.dot, background: "#fbbf24" }} />
                                    <span style={{ ...styles.dot, background: "#4ade80" }} />
                                </div>

                                <span style={styles.fileName}>
                                    solution.{{
                                        "C++": "cpp",
                                        C: "c",
                                        Java: "java",
                                        Python: "py",
                                    }[language]}
                                </span>

                                <span style={styles.editorLabel}>
                                    MONACO EDITOR
                                </span>
                            </div>

                            <Editor
                                height="440px"
                                language={editorLanguage}
                                theme="vs-dark"
                                value={code}
                                onChange={(value) =>
                                    setCode(value || "")
                                }
                                options={{
                                    fontSize: 15,
                                    minimap: {
                                        enabled: false,
                                    },
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    wordWrap: "on",
                                    padding: {
                                        top: 18,
                                        bottom: 18,
                                    },
                                    lineNumbers: "on",
                                    renderLineHighlight: "all",
                                    tabSize: 4,
                                    insertSpaces: true,
                                    bracketPairColorization: {
                                        enabled: true,
                                    },
                                }}
                            />
                        </div>

                        <div style={styles.editorFooter}>
                            <span>⌨️ Indentation: 4 spaces</span>
                            <span>{code.split("\n").length} lines</span>
                        </div>
                    </section>

                    {/* OUTPUT */}
                    {output && (
                        <section style={styles.outputBox}>
                            <div style={styles.outputHeader}>
                                <h3 style={styles.outputTitle}>
                                    ▶ Execution Output
                                </h3>

                                <button
                                    type="button"
                                    style={styles.clearButton}
                                    onClick={() => setOutput("")}
                                >
                                    Clear
                                </button>
                            </div>

                            <pre style={styles.outputText}>
                                {output}
                            </pre>
                        </section>
                    )}

                    {/* ACTIONS */}
                    <div style={styles.actions}>
                        <p style={styles.saveHint}>
                            Your program will be saved to your LabSync account.
                        </p>

                        <div style={styles.actionButtons}>
                            <button
                                type="button"
                                style={styles.runButton}
                                onClick={handleRun}
                            >
                                ▶ Run Code
                            </button>

                            <button
                                type="submit"
                                style={{
                                    ...styles.saveButton,
                                    opacity: saving ? 0.7 : 1,
                                    cursor: saving
                                        ? "not-allowed"
                                        : "pointer",
                                }}
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "💾 Save Program"}
                            </button>
                        </div>
                    </div>
                </form>

                <footer style={styles.footer}>
                    LabSync · Your personal DSA code workspace
                </footer>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f3f6fb",
        padding: "36px 24px",
        boxSizing: "border-box",
        color: "#172033",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
    },

    workspace: {
        width: "100%",
        maxWidth: "1050px",
        margin: "0 auto",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "28px",
    },

    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },

    iconBox: {
        width: "54px",
        height: "54px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "15px",
        background: "#e0eaff",
        color: "#2459dc",
        fontSize: "22px",
        fontWeight: "800",
    },

    breadcrumb: {
        color: "#64748b",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "1.5px",
        marginBottom: "5px",
    },

    heading: {
        fontSize: "30px",
        fontWeight: "750",
        margin: "0",
        letterSpacing: "-0.7px",
    },

    subtitle: {
        margin: "7px 0 0",
        color: "#64748b",
        fontSize: "14px",
        lineHeight: 1.5,
    },

    backButton: {
        padding: "11px 16px",
        border: "1px solid #d8e0ec",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#334155",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
    },

    form: {
        background: "#ffffff",
        padding: "30px",
        border: "1px solid #e5eaf2",
        borderRadius: "18px",
        boxShadow: "0 8px 30px rgba(30, 50, 90, 0.06)",
        boxSizing: "border-box",
    },

    detailsSection: {
        marginBottom: "34px",
    },

    sectionHeading: {
        display: "flex",
        alignItems: "flex-start",
        gap: "13px",
    },

    sectionNumber: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        flexShrink: 0,
        borderRadius: "10px",
        background: "#eaf0ff",
        color: "#2459dc",
        fontSize: "13px",
        fontWeight: "800",
    },

    sectionTitle: {
        margin: "0",
        fontSize: "18px",
        fontWeight: "700",
        color: "#172033",
    },

    sectionDescription: {
        margin: "5px 0 0",
        fontSize: "13px",
        lineHeight: 1.5,
        color: "#718096",
    },

    field: {
        display: "flex",
        flexDirection: "column",
        gap: "9px",
        minWidth: 0,
        marginTop: "23px",
    },

    label: {
        color: "#334155",
        fontSize: "13px",
        fontWeight: "650",
    },

    required: {
        color: "#dc2626",
    },

    input: {
        width: "100%",
        height: "46px",
        boxSizing: "border-box",
        padding: "0 13px",
        border: "1px solid #d9e1ed",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#172033",
        fontSize: "14px",
        outlineColor: "#2563eb",
    },

    fieldsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "20px",
    },

    editorSection: {
        marginTop: "8px",
    },

    editorHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        marginBottom: "17px",
    },

    languageBadge: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        border: "1px solid #dce5f4",
        borderRadius: "8px",
        background: "#f8faff",
        color: "#334155",
        fontSize: "12px",
        fontWeight: "650",
    },

    statusDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#22c55e",
    },

    editorFrame: {
        overflow: "hidden",
        border: "1px solid #293548",
        borderRadius: "11px",
        background: "#1e1e1e",
    },

    editorToolbar: {
        height: "42px",
        padding: "0 15px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
        background: "#111827",
        borderBottom: "1px solid #30394a",
        color: "#cbd5e1",
    },

    windowDots: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },

    dot: {
        width: "9px",
        height: "9px",
        borderRadius: "50%",
    },

    fileName: {
        fontSize: "12px",
        color: "#e2e8f0",
    },

    editorLabel: {
        marginLeft: "auto",
        color: "#94a3b8",
        fontSize: "10px",
        letterSpacing: "1px",
    },

    editorFooter: {
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        padding: "11px 2px 0",
        color: "#718096",
        fontSize: "11px",
    },

    actions: {
        marginTop: "30px",
        paddingTop: "22px",
        borderTop: "1px solid #edf0f5",
    },

    saveHint: {
        margin: "0 0 17px",
        color: "#718096",
        fontSize: "12px",
        lineHeight: 1.5,
    },

    actionButtons: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        flexWrap: "wrap",
    },

    runButton: {
        minWidth: "145px",
        padding: "13px 20px",
        border: "1px solid #bbf7d0",
        borderRadius: "9px",
        background: "#f0fdf4",
        color: "#15803d",
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
    },

    saveButton: {
        minWidth: "175px",
        padding: "13px 20px",
        border: "none",
        borderRadius: "9px",
        background: "#2563eb",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "700",
        boxShadow: "0 4px 10px rgba(37, 99, 235, 0.18)",
    },

    outputBox: {
        marginTop: "22px",
        padding: "18px",
        borderRadius: "10px",
        border: "1px solid #30394a",
        background: "#111827",
        color: "#e2e8f0",
    },

    outputHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
    },

    outputTitle: {
        margin: "0",
        fontSize: "14px",
    },

    clearButton: {
        padding: "6px 10px",
        border: "1px solid #475569",
        borderRadius: "6px",
        background: "transparent",
        color: "#cbd5e1",
        cursor: "pointer",
    },

    outputText: {
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        fontSize: "13px",
        lineHeight: 1.6,
    },

    footer: {
        padding: "24px 0 4px",
        textAlign: "center",
        color: "#94a3b8",
        fontSize: "12px",
    },
};

export default CreateProgram;

