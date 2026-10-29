
import { useEffect, useRef, useState } from "react";
import API from "./api";
import Editor from "@monaco-editor/react";

function EditProgram({ programId, onBack }) {
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("Array");
    const [language, setLanguage] = useState("C++");
    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState("");
    const [error, setError] = useState("");

    const [showVersions, setShowVersions] = useState(false);
    const [versions, setVersions] = useState([]);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [versionError, setVersionError] = useState("");
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [restoring, setRestoring] = useState(false);

    const loadedRef = useRef(false);
    const timerRef = useRef(null);
    const requestRef = useRef(Promise.resolve());
    const latestDataRef = useRef(null);
    const revisionRef = useRef(0);
    const savedRevisionRef = useRef(0);

    // LOAD PROGRAM
    useEffect(() => {
        let cancelled = false;

        const fetchProgram = async () => {
            loadedRef.current = false;
            setLoading(true);
            setError("");
            setSaveStatus("");
            clearTimeout(timerRef.current);

            try {
                if (!programId) {
                    throw new Error("Program ID is missing.");
                }

                const response = await API.get(`/programs/${programId}`);

                if (cancelled) return;

                const program = response.data;

                const initialData = {
                    title: program.title || "",
                    topic: program.topic || "Array",
                    language: program.language || "C++",
                    code: program.code || ""
                };

                setTitle(initialData.title);
                setTopic(initialData.topic);
                setLanguage(initialData.language);
                setCode(initialData.code);

                latestDataRef.current = initialData;
                revisionRef.current = 0;
                savedRevisionRef.current = 0;
                loadedRef.current = true;
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Could not load program."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchProgram();

        return () => {
            cancelled = true;
            loadedRef.current = false;
            clearTimeout(timerRef.current);
        };
    }, [programId]);

    // SAVE THE LATEST VERSION
    const saveProgram = () => {
        if (!loadedRef.current || !programId) return;

        clearTimeout(timerRef.current);

        const revisionToSave = revisionRef.current;
        const dataToSave = { ...latestDataRef.current };

        setSaving(true);
        setSaveStatus("Saving...");

        requestRef.current = requestRef.current
            .catch(() => {})
            .then(async () => {
                await API.put(`/programs/${programId}`, dataToSave);
                savedRevisionRef.current = revisionToSave;
            });

        requestRef.current
            .then(() => {
                if (revisionRef.current === savedRevisionRef.current) {
                    setSaveStatus("Saved ✓");
                }
            })
            .catch((err) => {
                console.error("Auto-save failed:", err);
                setSaveStatus("Save failed — please try again.");
            })
            .finally(() => {
                setSaving(false);

                if (revisionRef.current > savedRevisionRef.current) {
                    timerRef.current = setTimeout(saveProgram, 1000);
                }
            });
    };

    // UPDATE A FIELD AND SCHEDULE AUTO-SAVE
    const updateField = (field, value) => {
        if (!loadedRef.current) return;

        const updatedData = {
            ...latestDataRef.current,
            [field]: value
        };

        latestDataRef.current = updatedData;
        revisionRef.current += 1;

        if (field === "title") setTitle(value);
        if (field === "topic") setTopic(value);
        if (field === "language") setLanguage(value);
        if (field === "code") setCode(value);

        setSaveStatus("Unsaved changes");

        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(saveProgram, 1000);
    };

    // ENSURE ALL PENDING CHANGES ARE SAVED
    const flushPendingSave = async () => {
        clearTimeout(timerRef.current);

        if (!loadedRef.current || !programId) {
            throw new Error("Program is not ready to save.");
        }

        await requestRef.current.catch(() => {});

        if (revisionRef.current > savedRevisionRef.current) {
            const dataToSave = { ...latestDataRef.current };
            const revisionToSave = revisionRef.current;

            requestRef.current = requestRef.current
                .catch(() => {})
                .then(() => API.put(`/programs/${programId}`, dataToSave));

            await requestRef.current;

            savedRevisionRef.current = revisionToSave;
        }
    };

    // MANUAL SAVE
    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!title.trim() || !code.trim()) {
            alert("Please enter a program title and code.");
            return;
        }

        setSaving(true);
        setSaveStatus("Saving...");

        try {
            await flushPendingSave();

            setSaveStatus("Saved ✓");
            alert("Program updated successfully!");
            onBack();
        } catch (err) {
            console.error("Update failed:", err);
            setSaveStatus("Save failed — please try again.");

            alert(
                err.response?.data?.message ||
                err.message ||
                "Failed to update program."
            );
        } finally {
            setSaving(false);
        }
    };

    // LOAD VERSION HISTORY
    const loadVersions = async () => {
        setShowVersions(true);
        setLoadingVersions(true);
        setVersionError("");
        setSelectedVersion(null);

        try {
            // Finish saving any current edits before requesting history.
            await flushPendingSave();

            const response = await API.get(
                `/programs/${programId}/versions`
            );

            setVersions(response.data);
        } catch (err) {
            console.error("Load versions error:", err);

            setVersionError(
                err.response?.data?.message ||
                err.message ||
                "Could not load version history."
            );
        } finally {
            setLoadingVersions(false);
        }
    };

    // RESTORE A SELECTED VERSION
    const restoreVersion = async (version) => {
        const confirmed = window.confirm(
            "Restore this older version? Your current saved code will be preserved in version history."
        );

        if (!confirmed) return;

        setRestoring(true);
        setVersionError("");

        try {
            await flushPendingSave();

            const response = await API.post(
                `/programs/${programId}/versions/${version._id}/restore`
            );

            const program = response.data.program;

            const restoredData = {
                title: program.title,
                topic: program.topic,
                language: program.language,
                code: program.code
            };

            latestDataRef.current = restoredData;

            revisionRef.current += 1;
            savedRevisionRef.current = revisionRef.current;

            setTitle(restoredData.title);
            setTopic(restoredData.topic);
            setLanguage(restoredData.language);
            setCode(restoredData.code);

            setSaveStatus("Restored ✓");
            setSelectedVersion(null);

            // Reload the history to show the preserved current version.
            const historyResponse = await API.get(
                `/programs/${programId}/versions`
            );

            setVersions(historyResponse.data);

            alert("Previous version restored successfully!");
        } catch (err) {
            console.error("Restore version error:", err);

            setVersionError(
                err.response?.data?.message ||
                err.message ||
                "Could not restore this version."
            );
        } finally {
            setRestoring(false);
        }
    };

    // FORMAT VERSION DATE
    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <h2>Loading program...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <h2>⚠️ Could not load program</h2>
                <p>{error}</p>
                <button style={styles.backButton} onClick={onBack}>
                    ← Back
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1>✏️ Edit Program</h1>
                    <p>Update your DSA program</p>
                </div>

                <div style={styles.headerButtons}>
                    <button
                        type="button"
                        style={styles.historyButton}
                        onClick={loadVersions}
                        disabled={saving || restoring}
                    >
                        🕒 Version History
                    </button>

                    <button
                        type="button"
                        style={styles.backButton}
                        onClick={onBack}
                    >
                        ← Back
                    </button>
                </div>
            </div>

            <form onSubmit={handleUpdate} style={styles.form}>
                <label>Program Title</label>

                <input
                    type="text"
                    value={title}
                    onChange={(e) => updateField("title", e.target.value)}
                    required
                />

                <label>DSA Topic</label>

                <select
                    value={topic}
                    onChange={(e) => updateField("topic", e.target.value)}
                >
                    {[
                        "Array",
                        "Stack",
                        "Queue",
                        "Linked List",
                        "Tree",
                        "Graph",
                        "Searching",
                        "Sorting",
                        "Other"
                    ].map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

                <label>Programming Language</label>

                <select
                    value={language}
                    onChange={(e) => updateField("language", e.target.value)}
                >
                    {["C++", "Java", "Python", "C"].map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

                <label>Program Code</label>

                <Editor
                    height="500px"
                    language={
                        {
                            "C++": "cpp",
                            Java: "java",
                            Python: "python",
                            C: "c"
                        }[language] || "cpp"
                    }
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => updateField("code", value || "")}
                    options={{
                        fontSize: 16,
                        minimap: { enabled: false },
                        automaticLayout: true
                    }}
                />

                <div style={styles.status} aria-live="polite">
                    {saveStatus ||
                        "Your changes are saved automatically."}
                </div>

                <button
                    type="submit"
                    style={{
                        ...styles.saveButton,
                        opacity: saving || restoring ? 0.7 : 1
                    }}
                    disabled={saving || restoring}
                >
                    {saving ? "Saving..." : "💾 Save and Return"}
                </button>
            </form>

            {/* VERSION HISTORY PANEL */}
            {showVersions && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <div>
                                <h2>🕒 Version History</h2>
                                <p>View or restore previous program versions.</p>
                            </div>

                            <button
                                type="button"
                                style={styles.closeButton}
                                onClick={() => {
                                    setShowVersions(false);
                                    setSelectedVersion(null);
                                    setVersionError("");
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {loadingVersions && (
                            <p style={styles.infoText}>
                                Loading version history...
                            </p>
                        )}

                        {versionError && (
                            <div style={styles.errorMessage}>
                                {versionError}
                            </div>
                        )}

                        {!loadingVersions &&
                            !versionError &&
                            versions.length === 0 && (
                                <div style={styles.emptyState}>
                                    <h3>No previous versions yet</h3>
                                    <p>
                                        Edit and save your program to begin
                                        building its version history.
                                    </p>
                                </div>
                            )}

                        {!loadingVersions && versions.length > 0 && (
                            <div style={styles.versionLayout}>
                                <div style={styles.versionList}>
                                    <h3>Saved Versions ({versions.length})</h3>

                                    {versions.map((version, index) => (
                                        <div
                                            key={version._id}
                                            style={{
                                                ...styles.versionCard,
                                                borderColor:
                                                    selectedVersion?._id ===
                                                    version._id
                                                        ? "#2563eb"
                                                        : "#e2e8f0"
                                            }}
                                        >
                                            <strong>
                                                Version {versions.length - index}
                                            </strong>

                                            <p style={styles.versionDate}>
                                                {formatDate(version.savedAt)}
                                            </p>

                                            <p style={styles.versionDetails}>
                                                {version.language} · {version.topic}
                                            </p>

                                            <button
                                                type="button"
                                                style={styles.previewButton}
                                                onClick={() =>
                                                    setSelectedVersion(version)
                                                }
                                            >
                                                Preview Code
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div style={styles.previewPanel}>
                                    {!selectedVersion ? (
                                        <div style={styles.emptyPreview}>
                                            <h3>Select a version</h3>
                                            <p>
                                                Choose a saved version to preview
                                                its code.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <h3>{selectedVersion.title}</h3>

                                            <p style={styles.versionDate}>
                                                {formatDate(
                                                    selectedVersion.savedAt
                                                )}
                                            </p>

                                            <div style={styles.previewEditor}>
                                                <Editor
                                                    height="350px"
                                                    language={
                                                        {
                                                            "C++": "cpp",
                                                            Java: "java",
                                                            Python: "python",
                                                            C: "c"
                                                        }[
                                                            selectedVersion.language
                                                        ] || "cpp"
                                                    }
                                                    theme="vs-dark"
                                                    value={selectedVersion.code}
                                                    options={{
                                                        readOnly: true,
                                                        fontSize: 14,
                                                        minimap: {
                                                            enabled: false
                                                        },
                                                        automaticLayout: true
                                                    }}
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                style={{
                                                    ...styles.restoreButton,
                                                    opacity: restoring ? 0.6 : 1
                                                }}
                                                disabled={restoring}
                                                onClick={() =>
                                                    restoreVersion(selectedVersion)
                                                }
                                            >
                                                {restoring
                                                    ? "Restoring..."
                                                    : "♻️ Restore This Version"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={styles.modalFooter}>
                            <button
                                type="button"
                                style={styles.backButton}
                                onClick={() => {
                                    setShowVersions(false);
                                    setSelectedVersion(null);
                                    setVersionError("");
                                }}
                            >
                                Close History
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        padding: "30px",
        background: "#f1f5f9",
        fontFamily: "Arial, sans-serif"
    },
    header: {
        maxWidth: "1100px",
        margin: "0 auto 25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        flexWrap: "wrap"
    },
    headerButtons: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap"
    },
    form: {
        maxWidth: "1100px",
        margin: "0 auto",
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },
    loading: {
        padding: "50px",
        textAlign: "center"
    },
    errorContainer: {
        padding: "50px",
        textAlign: "center"
    },
    backButton: {
        padding: "10px 16px",
        border: "none",
        borderRadius: "6px",
        background: "#64748b",
        color: "white",
        cursor: "pointer"
    },
    historyButton: {
        padding: "10px 16px",
        border: "none",
        borderRadius: "6px",
        background: "#7c3aed",
        color: "white",
        cursor: "pointer"
    },
    status: {
        marginTop: "8px",
        minHeight: "22px",
        color: "#2563eb",
        fontWeight: 600,
        fontSize: "14px"
    },
    saveButton: {
        width: "100%",
        marginTop: "8px",
        padding: "13px",
        border: "none",
        borderRadius: "6px",
        background: "#2563eb",
        color: "white",
        fontSize: "16px",
        cursor: "pointer"
    },
    overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15, 23, 42, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
    },
    modal: {
        width: "100%",
        maxWidth: "1200px",
        maxHeight: "90vh",
        overflowY: "auto",
        background: "white",
        borderRadius: "14px",
        padding: "25px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
        borderBottom: "1px solid #e2e8f0",
        paddingBottom: "15px",
        marginBottom: "20px"
    },
    closeButton: {
        border: "none",
        borderRadius: "6px",
        background: "#e2e8f0",
        padding: "9px 12px",
        cursor: "pointer",
        fontSize: "16px"
    },
    versionLayout: {
        display: "grid",
        gridTemplateColumns: "minmax(220px, 0.8fr) minmax(0, 1.7fr)",
        gap: "20px"
    },
    versionList: {
        minWidth: 0
    },
    versionCard: {
        border: "2px solid #e2e8f0",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "12px",
        overflowWrap: "anywhere"
    },
    versionDate: {
        color: "#64748b",
        fontSize: "12px",
        lineHeight: 1.5
    },
    versionDetails: {
        fontSize: "13px",
        color: "#475569"
    },
    previewButton: {
        width: "100%",
        padding: "9px",
        border: "none",
        borderRadius: "5px",
        background: "#e0e7ff",
        color: "#3730a3",
        cursor: "pointer"
    },
    previewPanel: {
        minWidth: 0
    },
    previewEditor: {
        overflow: "hidden",
        borderRadius: "8px",
        marginTop: "12px",
        marginBottom: "15px"
    },
    restoreButton: {
        width: "100%",
        padding: "12px",
        border: "none",
        borderRadius: "6px",
        background: "#059669",
        color: "white",
        cursor: "pointer",
        fontSize: "15px"
    },
    emptyState: {
        padding: "30px",
        textAlign: "center",
        background: "#f8fafc",
        borderRadius: "8px"
    },
    emptyPreview: {
        padding: "40px 20px",
        textAlign: "center",
        background: "#f8fafc",
        borderRadius: "8px"
    },
    infoText: {
        padding: "20px",
        color: "#475569"
    },
    errorMessage: {
        background: "#fee2e2",
        color: "#991b1b",
        borderRadius: "6px",
        padding: "12px",
        marginBottom: "15px"
    },
    modalFooter: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "20px",
        paddingTop: "15px",
        borderTop: "1px solid #e2e8f0"
    }
};

export default EditProgram;

