
import JSZip from "jszip";

const getExtension = (language) => {
  const extensions = {
    cpp: "cpp",
    "c++": "cpp",
    c: "c",
    javascript: "js",
    js: "js",
    typescript: "ts",
    ts: "ts",
    python: "py",
    java: "java",
    csharp: "cs",
    "c#": "cs",
    go: "go",
    rust: "rs",
    php: "php",
    html: "html",
    css: "css",
  };

  return extensions[String(language || "").toLowerCase()] || "txt";
};

const safeFileName = (name) => {
  return String(name || "program")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/[. ]+$/g, "")
    .trim() || "program";
};

// Download one program as a file.
export const downloadProgram = (program) => {
  if (!program) {
    alert("Program not found.");
    return;
  }

  const extension = getExtension(program.language);
  const fileName = `${safeFileName(program.title)}.${extension}`;

  const content = String(program.code ?? "");

  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(downloadUrl);
};

// Download all programs in a ZIP file.
export const downloadAllPrograms = async (programs) => {
  if (!Array.isArray(programs) || programs.length === 0) {
    alert("There are no programs to export.");
    return;
  }

  const zip = new JSZip();
  const usedNames = new Set();

  programs.forEach((program, index) => {
    const topic = safeFileName(program.topic || "Other");
    const title = safeFileName(program.title || `Program_${index + 1}`);
    const extension = getExtension(program.language);

    const folder = zip.folder(topic);

    let fileName = `${title}.${extension}`;
    let uniqueName = fileName;
    let counter = 2;

    while (usedNames.has(`${topic}/${uniqueName}`)) {
      uniqueName = `${title}_${counter}.${extension}`;
      counter++;
    }

    usedNames.add(`${topic}/${uniqueName}`);

    folder.file(uniqueName, String(program.code ?? ""));
  });

  // Include a README with basic program details.
  const readme = programs
    .map((program, index) => {
      return [
        `Program ${index + 1}: ${program.title || "Untitled"}`,
        `Topic: ${program.topic || "Other"}`,
        `Language: ${program.language || "Unknown"}`,
        "",
      ].join("\n");
    })
    .join("\n");

  zip.file("README.txt", `LabSync - Exported DSA Programs\n\n${readme}`);

  try {
    const blob = await zip.generateAsync({ type: "blob" });

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "LabSync_Programs.zip";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("ZIP export failed:", error);
    alert("Unable to export programs. Please try again.");
  }
};

