
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "./api";

function ProgramDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                const response = await API.get(`/programs/${id}`);
                setProgram(response.data);
            } catch (err) {
                console.error("Error fetching program:", err);
                setError("Unable to load this program. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchProgram();
    }, [id]);

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(program.code);
            alert("Code copied successfully!");
        } catch {
            alert("Unable to copy code. Please copy it manually.");
        }
    };

    if (loading) {
        return <p style={{ padding: "30px" }}>Loading program...</p>;
    }

    if (error || !program) {
        return (
            <div style={{ padding: "30px" }}>
                <p>{error || "Program not found."}</p>
                <button onClick={() => navigate("/programs")}>
                    Back to Programs
                </button>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "30px",
                background: "#f1f5f9",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <button
                    onClick={() => navigate("/programs")}
                    style={buttonStyle}
                >
                    ← Back to Programs
                </button>

                <div
                    style={{
                        background: "white",
                        padding: "25px",
                        borderRadius: "12px",
                        marginTop: "20px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "15px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <h1 style={{ marginBottom: "10px" }}>
                                {program.title}
                            </h1>

                            <p>
                                <strong>Topic:</strong> {program.topic}
                            </p>

                            <p>
                                <strong>Language:</strong> {program.language}
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={copyCode} style={buttonStyle}>
                                Copy Code
                            </button>

                            <button
                                onClick={() =>
                                    navigate(`/edit-program/${program._id}`)
                                }
                                style={buttonStyle}
                            >
                                Edit Program
                            </button>
                        </div>
                    </div>

                    <h3>Source Code</h3>

                    <pre
                        style={{
                            background: "#0f172a",
                            color: "#e2e8f0",
                            padding: "20px",
                            borderRadius: "8px",
                            overflowX: "auto",
                            whiteSpace: "pre",
                            fontSize: "14px",
                            lineHeight: "1.6",
                        }}
                    >
                        <code>{program.code}</code>
                    </pre>

                    <p style={{ color: "#64748b", fontSize: "13px" }}>
                        Created:{" "}
                        {program.createdAt
                            ? new Date(program.createdAt).toLocaleString()
                            : "Unknown"}
                    </p>

                    <p style={{ color: "#64748b", fontSize: "13px" }}>
                        Last updated:{" "}
                        {program.updatedAt
                            ? new Date(program.updatedAt).toLocaleString()
                            : "Unknown"}
                    </p>
                </div>
            </div>
        </div>
    );
}

const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
};

export default ProgramDetails;

