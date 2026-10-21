
import { useRef, useState } from "react";
import "./App.css";

const ACCEPTED_TYPES = [".png", ".jpg", ".jpeg", ".jfif", ".bmp", ".mat"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function App() {
  const fileInput = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState("workspace");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function chooseFile(nextFile) {
    if (!nextFile) return;

    const extension = `.${nextFile.name.split(".").pop().toLowerCase()}`;

    if (!ACCEPTED_TYPES.includes(extension)) {
      setError("Unsupported file. Choose PNG, JPEG, JFIF, BMP or MATLAB v7.3.");
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      setError("This file exceeds the 10 MB upload limit.");
      return;
    }

    if (nextFile.size === 0) {
      setError("This file is empty. Choose another file.");
      return;
    }

    setError("");
    setFile(nextFile);
    setResult(null);
    setPreview("");

    if (extension !== ".mat") {
      const imageUrl = URL.createObjectURL(nextFile);
      setPreview(imageUrl);
    }
  }

  async function analyzeScan() {
    if (!file || busy) return;

    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed. Please try again.");
      }

      setResult(data);
      setView("results");
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot reach the API. Make sure your FastAPI server is running."
          : err.message
      );
    } finally {
      setBusy(false);
    }
  }

  function resetWorkspace() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    setView("workspace");
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={resetWorkspace}>
          <span className="brand-mark"><span /></span>
          <span className="brand-copy">
            <strong>NeuroFrame</strong>
            <small>IMAGING RESEARCH</small>
          </span>
        </a>

        <div className="side-label">WORKSPACE</div>

        <button
          className={`nav-item ${view === "workspace" ? "active" : ""}`}
          onClick={() => setView("workspace")}
        >
          <span className="nav-icon">⌗</span>
          Imaging desk
          <span className="nav-index">01</span>
        </button>

        <button
          className={`nav-item ${view === "results" ? "active" : ""}`}
          onClick={() => result && setView("results")}
        >
          <span className="nav-icon">◫</span>
          Model findings
          <span className="nav-index">02</span>
        </button>

        <div className="side-label secondary-label">REFERENCE</div>

        <button
          className={`nav-item ${view === "model" ? "active" : ""}`}
          onClick={() => setView("model")}
        >
          <span className="nav-icon">◈</span>
          About the model
        </button>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <div>
            <strong>Research build</strong>
            <small>DenseNet-121 · Three classes</small>
          </div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">
            NEUROFRAME <span>/</span>{" "}
            {view === "workspace"
              ? "IMAGING DESK"
              : view === "results"
                ? "MODEL FINDINGS"
                : "MODEL REFERENCE"}
          </div>
          <div className="topbar-right">
            <span className="system-indicator"><i /> LOCAL SYSTEM</span>
            <span className="version-tag">v1.0</span>
          </div>
        </header>


{view === "workspace" && (
  <div className="content">
    <section className="intro-panel">
      <div className="intro-copy">
        <div className="eyebrow">BRAIN IMAGING / RESEARCH TOOL</div>

        <h1>
          Understanding the
          <br />
          <em>patterns in a scan.</em>
        </h1>

        <p className="intro">
          NeuroFrame is an experimental brain MRI classification tool.
          Upload a scan to see which of three tumour categories a
          machine-learning model matches most closely and understand
          what that result means.
        </p>

        <div className="intro-points">
          <div>
            <span className="intro-index">01</span>
            <span>Upload a supported MRI file</span>
          </div>
          <div>
            <span className="intro-index">02</span>
            <span>Receive the model's top-matching category</span>
          </div>
          <div>
            <span className="intro-index">03</span>
            <span>Read an explanation of the scores and limitations</span>
          </div>
        </div>

        <p className="intro-caution">
          This tool cannot confirm or rule out a tumour. It is not
          a substitute for a medical assessment.
        </p>
      </div>

      <div className="brain-visual" aria-label="Illustration of a human brain" role="img">
        <div className="brain-visual-label">
          <span>NEUROFRAME</span>
          <span>ILLUSTRATION / 001</span>
        </div>

        <svg
          className="brain-svg"
          viewBox="0 0 360 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="brain-fill" x1="75" y1="48" x2="286" y2="270">
              <stop offset="0%" stopColor="#e5d5d0" />
              <stop offset="100%" stopColor="#b77c83" />
            </linearGradient>
            <clipPath id="brain-clip">
              <path d="M178 56 C158 32 124 42 116 65 C91 54 68 78 75 101 C49 115 57 145 70 158 C51 182 68 210 90 213 C91 240 119 251 141 237 C153 258 174 261 180 245 L180 62 Z" />
              <path d="M182 56 C202 32 236 42 244 65 C269 54 292 78 285 101 C311 115 303 145 290 158 C309 182 292 210 270 213 C269 240 241 251 219 237 C207 258 186 261 180 245 L180 62 Z" />
            </clipPath>
          </defs>

          <circle cx="180" cy="155" r="120" stroke="#762a3b" strokeOpacity=".14" />
          <circle cx="180" cy="155" r="96" stroke="#762a3b" strokeOpacity=".13" strokeDasharray="3 7" />

          <g clipPath="url(#brain-clip)">
            <path
              d="M178 56 C158 32 124 42 116 65 C91 54 68 78 75 101 C49 115 57 145 70 158 C51 182 68 210 90 213 C91 240 119 251 141 237 C153 258 174 261 180 245 L180 62 Z"
              fill="url(#brain-fill)"
              stroke="#762a3b"
              strokeWidth="2.2"
            />
            <path
              d="M182 56 C202 32 236 42 244 65 C269 54 292 78 285 101 C311 115 303 145 290 158 C309 182 292 210 270 213 C269 240 241 251 219 237 C207 258 186 261 180 245 L180 62 Z"
              fill="url(#brain-fill)"
              stroke="#762a3b"
              strokeWidth="2.2"
            />

            <g stroke="#762a3b" strokeWidth="2" strokeLinecap="round" opacity=".8">
              <path d="M84 98 C99 84 118 96 112 111 C108 124 88 120 91 139 C94 151 113 150 120 135" />
              <path d="M69 158 C86 143 105 157 99 172 C95 185 77 183 82 201" />
              <path d="M112 68 C135 65 146 83 135 97 C124 110 133 125 150 119" />
              <path d="M108 187 C127 174 144 186 139 202 C135 215 149 227 162 218" />
              <path d="M125 139 C143 130 156 144 149 159 C143 173 158 183 174 170" />
              <path d="M133 224 C146 208 165 215 165 232" />
              <path d="M276 98 C261 84 242 96 248 111 C252 124 272 120 269 139 C266 151 247 150 240 135" />
              <path d="M291 158 C274 143 255 157 261 172 C265 185 283 183 278 201" />
              <path d="M248 68 C225 65 214 83 225 97 C236 110 227 125 210 119" />
              <path d="M252 187 C233 174 216 186 221 202 C225 215 211 227 198 218" />
              <path d="M235 139 C217 130 204 144 211 159 C217 173 202 183 186 170" />
              <path d="M227 224 C214 208 195 215 195 232" />
            </g>
          </g>

          <path d="M180 57 L180 246" stroke="#762a3b" strokeWidth="2" strokeDasharray="4 5" />
          <path d="M180 246 C178 264 188 272 194 283 C199 291 193 299 185 299" stroke="#762a3b" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M185 299 L210 299" stroke="#762a3b" strokeWidth="2" strokeLinecap="round" />

          <circle cx="247" cy="106" r="5" fill="#762a3b" />
          <path d="M252 106 L282 86 L319 86" stroke="#762a3b" strokeWidth="1.2" />
          <text x="318" y="78" textAnchor="end" fill="#762a3b" fontSize="9" letterSpacing="1.2">MRI</text>

          <circle cx="105" cy="193" r="4" fill="#762a3b" />
          <path d="M101 193 L76 218 L43 218" stroke="#762a3b" strokeWidth="1.2" />
          <text x="42" y="210" fill="#762a3b" fontSize="8" letterSpacing="1">IMAGING</text>
        </svg>

        <div className="brain-visual-caption">
          <span>THE HUMAN BRAIN</span>
          <span>SCHEMATIC STUDY</span>
        </div>
      </div>
    </section>

    <div className="section-line">
      <span>01 — IMAGING DESK</span>
      <span>INPUT / MRI</span>
    </div>

    <div className="workspace-grid">
      <div className="upload-card">
        <div className="card-heading">
          <div>
            <span className="micro-label">SCAN INPUT</span>
            <h2>Bring in a scan</h2>
          </div>
          <span className="step-number">01</span>
        </div>

        <p className="upload-intro">
          Choose a brain MRI image from your device. NeuroFrame will
          process it and return the category that best matches its
          three available outputs.
        </p>

        <div
          className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            chooseFile(event.dataTransfer.files[0]);
          }}
        >
          <input
            ref={fileInput}
            type="file"
            accept=".png,.jpg,.jpeg,.jfif,.bmp,.mat"
            hidden
            onChange={(event) => chooseFile(event.target.files[0])}
          />

          {file ? (
            <div className="file-selected">
              {preview ? (
                <img
                  src={preview}
                  alt="Selected MRI preview"
                  className="scan-preview"
                />
              ) : (
                <div className="mat-preview">MAT</div>
              )}
              <div className="file-info">
                <strong>{file.name}</strong>
                <span>
                  {(file.size / 1024).toFixed(1)} KB · Ready for analysis
                </span>
                <button className="text-button" onClick={resetWorkspace}>
                  Remove scan
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="upload-symbol"><span>↑</span></div>
              <h3>Drop your image here</h3>
              <p>or select a file from your computer</p>
              <button
                className="browse-button"
                onClick={() => fileInput.current?.click()}
              >
                Browse files <span>↗</span>
              </button>
            </>
          )}
        </div>

        <div className="format-row">
          <span>SUPPORTED FORMATS</span>
          <div>
            {["PNG", "JPG", "BMP", "MAT"].map((format) => (
              <span className="format-chip" key={format}>{format}</span>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="analyze-button"
          disabled={!file || busy}
          onClick={analyzeScan}
        >
          {busy ? "Analyzing scan..." : "Analyze scan"}
          <span>{busy ? "◌" : "↗"}</span>
        </button>

        <p className="upload-note">
          Files are sent to your locally running API for processing.
        </p>
      </div>

      <div className="context-column">
        <div className="context-card specimen-card">
          <div className="card-heading">
            <div>
              <span className="micro-label">HOW IT WORKS</span>
              <h2>From scan to result</h2>
            </div>
            <span className="outline-icon">⌁</span>
          </div>

          <div className="workflow-list">
            <div className="workflow-step">
              <span className="workflow-number">01</span>
              <div>
                <strong>Upload your scan</strong>
                <p>Select a supported MRI image or MATLAB file.</p>
              </div>
            </div>
            <div className="workflow-step">
              <span className="workflow-number">02</span>
              <div>
                <strong>Image preparation</strong>
                <p>The image is resized and its intensity values are adjusted.</p>
              </div>
            </div>
            <div className="workflow-step">
              <span className="workflow-number">03</span>
              <div>
                <strong>Review the result</strong>
                <p>See the top-matching category, model scores and their meaning.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="model-card">
          <span className="micro-label">ABOUT THE MODEL</span>
          <div className="model-name">DenseNet<span>-121</span></div>
          <p>A deep-learning model trained to classify MRI images into three categories.</p>
          <div className="model-divider" />
          <div className="class-list">
            <span><i className="class-dot meningioma" /> Meningioma</span>
            <span><i className="class-dot glioma" /> Glioma</span>
            <span><i className="class-dot pituitary" /> Pituitary tumour</span>
          </div>
          <div className="model-foot">
            <span>INPUT / 224 × 224</span>
            <span>GRAYSCALE</span>
          </div>
        </div>
      </div>
    </div>

    <div className="notice-strip">
      <span className="notice-icon">i</span>
      <p>
        <strong>Research use only.</strong> NeuroFrame is not a medical
        diagnostic system. It only compares an image against three
        tumour categories and may produce a category even when none
        is appropriate. Seek qualified clinical interpretation.
      </p>
    </div>
  </div>
)}



{view === "results" && (
  <div className="content">
    <div className="eyebrow">ANALYSIS / RESULTS</div>
    <h1 className="subpage-title">
      Understand the <em>findings.</em>
    </h1>

    {result ? (
      <>
        {/*
          Translate the model's class label into plain language.
          These are type descriptions, not a diagnosis.
        */}
        {(() => {
          const classInfo = {
            glioma: {
              title: "Glioma",
              description:
                "A type of tumour that originates in glial cells, which support nerve cells in the brain.",
            },
            meningioma: {
              title: "Meningioma",
              description:
                "A type of tumour that develops in the membranes surrounding the brain and spinal cord.",
            },
            pituitary: {
              title: "Pituitary tumour",
              description:
                "A type associated with tumours in the pituitary gland, located at the base of the brain.",
            },
          };

          const predictedClass = result.predicted_class.toLowerCase();
          const finding = classInfo[predictedClass] || {
            title: result.predicted_class,
            description:
              "This is one of the types of tumours the model was trained to recognise.",
          };

          return (
            <>
              <div className="result-hero">
                <span className="micro-label">
                  DIAGNOSED TUMOR
                </span>

                <h2>{finding.title}</h2>
                <p className="finding-description">
                  {finding.description}
                </p>

                <div className="score-explanation">
                  <span className="micro-label">ACCURACY SCORE</span>

                  <div className="confidence-value">
                    {(result.confidence * 100).toFixed(1)}
                    <span>%</span>
                  </div>

                  <div className="confidence-track">
                    <div
                      style={{
                        width: `${result.confidence * 100}%`,
                      }}
                    />
                  </div>

                  <p>
                    Out of the three types available to the model,
                    this is the tumour that scored highest. The score
                    describes the model's output, not the probability
                    that you have this tumour.
                  </p>
                </div>
              </div>

              <div className="result-grid">
                <div className="result-card">
                  <span className="micro-label">
                    THE OTHER TUMOUR SCORES
                  </span>

                  <h3>How the types compare</h3>

                  <p className="card-explanation">
                    Each bar shows the score assigned to a type.
                    Higher scores indicate which category the model
                    favoured. These scores are not confirmed diagnoses
                    or medically validated probabilities.
                  </p>

                  {Object.entries(result.class_probabilities).map(
                    ([name, score]) => (
                      <div className="score-row" key={name}>
                        <div className="score-label">
                          <span>
                            {classInfo[name.toLowerCase()]?.title || name}
                          </span>
                          <strong>
                            {(score * 100).toFixed(1)}%
                          </strong>
                        </div>

                        <div className="score-track">
                          <div
                            style={{
                              width: `${score * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}

                  <p className="score-footnote">
                    The scores add up to approximately 100% because
                    the model distributes its output across these
                    three categories. This does not mean that the
                    scan has a 100% chance of belonging to one of
                    these tumour types.
                  </p>
                </div>

                <div className="result-card file-result">
                  <span className="micro-label">YOUR SUBMITTED FILE</span>

                  <h3 className="filename-heading">
                    {result.filename}
                  </h3>

                  <p>
                    <strong>File format:</strong>{" "}
                    {result.input_type.toUpperCase()}
                  </p>



                  <div className="result-disclaimer">
                    <strong>Important limitation</strong>
                    <p>
                      NeuroFrame is a research prototype. It cannot
                      confirm whether a tumour is present, rule one
                      out or determine whether a person is healthy.
                      Its three-category model must choose among
                      those categories, even when a scan does not
                      fit them.
                    </p>
                    <p>
                      Do not use this result to make treatment
                      decisions. A qualified healthcare professional
                      should interpret your MRI and other relevant
                      clinical information.
                    </p>
                  </div>
                </div>
              </div>

              <button
                className="analyze-button new-scan"
                onClick={resetWorkspace}
              >
                Analyze another scan <span>↗</span>
              </button>
            </>
          );
        })()}
      </>
    ) : (
      <div className="empty-state">
        <span className="upload-symbol">⌁</span>
        <h2>No results yet</h2>
        <p>
          Upload a supported MRI image to see the model's
          prediction and an explanation of its scores.
        </p>

        <button
          className="browse-button"
          onClick={() => setView("workspace")}
        >
          Return to imaging desk ↗
        </button>
      </div>
    )}
  </div>
)}


        {view === "model" && (
          <div className="content">
            <div className="eyebrow">REFERENCE / ARCHITECTURE</div>
            <h1 className="subpage-title">Know the <em>model.</em></h1>
            <p className="intro">
              NeuroFrame wraps a trained image classifier in a local research interface.
            </p>
            <div className="reference-grid">
              <div className="reference-card">
                <span className="micro-label">ARCHITECTURE</span>
                <h2>DenseNet-121</h2>
                <p>A convolutional neural network that uses densely connected feature layers.</p>
              </div>
              <div className="reference-card">
                <span className="micro-label">INPUT PIPELINE</span>
                <h2>Grayscale / 224²</h2>
                <p>Intensity normalization followed by bilinear resizing to the expected input dimensions.</p>
              </div>
              <div className="reference-card">
                <span className="micro-label">OUTPUT SPACE</span>
                <h2>Three classes</h2>
                <p>Meningioma, glioma and pituitary. There is no no-tumor class.</p>
              </div>
              <div className="reference-card">
                <span className="micro-label">INTERPRETATION</span>
                <h2>Scores ≠ certainty</h2>
                <p>Output scores are not calibrated clinical probabilities. External performance remains uncertain.</p>
              </div>
            </div>
            <div className="notice-strip">
              <span className="notice-icon">i</span>
              <p><strong>Important limitation.</strong> This research model cannot rule out a tumor or confirm a diagnosis.</p>
            </div>
          </div>
        )}

        <footer className="footer">
          <span>NEUROFRAME © 2026</span>
          <span>BUILT FOR EXPLORATION, NOT DIAGNOSIS</span>
        </footer>
      </section>
    </main>
  );
}

export default App;
