import React, { useState, useEffect, useRef } from "react";
import { useSchedule } from "../context/ScheduleContext";
import {
  Upload,
  X,
  Users,
  Download,
  RefreshCw,
  Edit2,
  Trash2,
  Plus,
  Save,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileArchive,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import mermaid from "mermaid";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import JSZip from "jszip";

const RecallRoster = () => {
  const { recallRosterData, setRecallRosterData } = useSchedule();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const mermaidRef = useRef(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedPerson, setEditedPerson] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [chartZoom, setChartZoom] = useState(1);
  const [chartPan, setChartPan] = useState({ x: 0, y: 0 });
  const [chartSize, setChartSize] = useState(null);
  const chartContainerRef = useRef(null);
  const autoFitDoneRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);
  const [downloadingPdfs, setDownloadingPdfs] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "base",
      securityLevel: "loose",
      maxTextSize: 200000,
      themeVariables: {
        primaryColor: "#1e3a5f",
        primaryTextColor: "#FFFFFF",
        primaryBorderColor: "#eab308",
        lineColor: "#64748B",
        secondaryColor: "#1e3a5f",
        tertiaryColor: "#FFFFFF",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
      },
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: "step",
        padding: 20,
        nodeSpacing: 100,
        rankSpacing: 120,
      },
    });
  }, []);

  useEffect(() => {
    if (!recallRosterData || !mermaidRef.current) return;

    const code = generateMermaidDiagram(recallRosterData);

    const renderDiagram = async () => {
      try {
        autoFitDoneRef.current = false;
        setChartSize(null);
        setChartPan({ x: 0, y: 0 });
        setChartZoom(1);
        mermaidRef.current.innerHTML = "";

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, code);
        mermaidRef.current.innerHTML = svg;

        const measure = () => {
          const svgEl = mermaidRef.current?.querySelector("svg");
          if (svgEl) {
            const rect = svgEl.getBoundingClientRect();
            const diagramW = rect.width > 0 ? rect.width : null;
            const diagramH = rect.height > 0 ? rect.height : null;

            if (diagramW && diagramH) {
              setChartSize({ width: diagramW, height: diagramH });
            } else {
              const vb = svgEl.viewBox?.baseVal;
              const w = vb?.width || svgEl.clientWidth || 800;
              const h = vb?.height || svgEl.clientHeight || 600;
              setChartSize({ width: w, height: h });
            }

            // Auto-fit initial zoom once per render
            if (!autoFitDoneRef.current && chartContainerRef.current) {
              const containerRect =
                chartContainerRef.current.getBoundingClientRect();
              const availableW = Math.max(0, containerRect.width - 32);
              const availableH = Math.max(0, containerRect.height - 32);

              const baseW = diagramW ?? svgEl.clientWidth ?? 800;
              const baseH = diagramH ?? svgEl.clientHeight ?? 600;

              const rawFit =
                baseW > 0 && baseH > 0
                  ? Math.min(1, availableW / baseW, availableH / baseH)
                  : 1;

              const STEP = 0.25;
              const MIN_ZOOM = 0.25;
              const fit =
                Math.max(
                  MIN_ZOOM,
                  Math.min(1, Math.floor(rawFit / STEP) * STEP)
                ) || 1;

              setChartZoom(fit);
              setChartPan({ x: 0, y: 0 });
              autoFitDoneRef.current = true;
            }
          }
        };
        requestAnimationFrame(measure);
        setTimeout(measure, 50);
        setTimeout(measure, 300);
      } catch (error) {
        console.error("Error rendering mermaid diagram:", error);
        mermaidRef.current.innerHTML = `<div class="text-red-600 text-sm">Error rendering diagram. Please refresh.</div>`;
      }
    };

    renderDiagram();
  }, [recallRosterData]);

  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 2;
  const zoomIn = () =>
    setChartZoom((z) =>
      Math.min(MAX_ZOOM, Math.round((z + 0.25) * 100) / 100)
    );
  const zoomOut = () =>
    setChartZoom((z) =>
      Math.max(MIN_ZOOM, Math.round((z - 0.25) * 100) / 100)
    );
  const zoomReset = () => {
    setChartZoom(1);
    setChartPan({ x: 0, y: 0 });
  };

  const handleChartPanStart = (e) => {
    if (e.button !== 0 || !recallRosterData) return;
    e.preventDefault();
    setIsPanning(true);
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startPanX = chartPan.x;
    const startPanY = chartPan.y;

    const onMove = (e) => {
      setChartPan({
        x: startPanX + (e.clientX - startClientX),
        y: startPanY + (e.clientY - startClientY),
      });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setIsPanning(false);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleChartWheel = (e) => {
    if (!e.ctrlKey || !recallRosterData) return;
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else if (e.deltaY > 0) zoomOut();
  };

  const generateMermaidDiagram = (data) => {
    // Build organizational hierarchy from data, grouped by shop
    let diagram = "graph TD\n";
    const nodeMap = new Map();
    const nameToIdMap = new Map();
    let nodeId = 0;

    // Common military ranks to strip from names when matching
    const ranks = [
      "Lt Col",
      "Col",
      "Maj",
      "Capt",
      "Lt",
      "CMSgt",
      "SMSgt",
      "MSgt",
      "TSgt",
      "SSgt",
      "SrA",
      "A1C",
      "Amn",
      "AB",
    ];

    // Helper function to normalize and strip rank from name
    const normalizeName = (name) => {
      if (!name) return "";
      let normalized = name.trim();

      for (const rank of ranks) {
        const rankPattern = new RegExp(`^${rank}\\s+`, "i");
        if (rankPattern.test(normalized)) {
          normalized = normalized.replace(rankPattern, "");
          break;
        }
      }

      return normalized.toLowerCase().replace(/\s+/g, " ").trim();
    };

    // Group people by shop
    const shopGroups = {};
    data.forEach((person) => {
      const shop = person.shop || "Unassigned";
      if (!shopGroups[shop]) {
        shopGroups[shop] = [];
      }
      shopGroups[shop].push(person);
    });

    // Create subgraphs for each shop
    Object.keys(shopGroups)
      .sort()
      .forEach((shop, shopIdx) => {
        const people = shopGroups[shop];
        const subgraphId = `shop${shopIdx}`;

        // Start subgraph
        diagram += `\n    subgraph ${subgraphId}["${shop}"]\n`;
        diagram += `        direction TB\n`;

        // Create nodes for people in this shop (truncate long text to avoid maxTextSize)
        const truncate = (s, maxLen = 35) =>
          s && s.length > maxLen ? s.slice(0, maxLen) + "…" : s || "";
        const escapeLabel = (s) => String(s).replace(/"/g, "#quot;");
        people.forEach((person) => {
          const id = `N${nodeId++}`;
          const rankLabel = escapeLabel(person.rank ? `${person.rank} ` : "");
          const pos = escapeLabel(truncate(person.position, 40));
          const positionLine = pos ? `<br/>${pos}` : "";
          const ph = escapeLabel(truncate(person.phone, 20));
          const phoneLine = ph ? `<br/>${ph}` : "";
          const namePart = escapeLabel(person.name || "Unknown");
          const label = `${rankLabel}${namePart}${positionLine}${phoneLine}`;

          // Store multiple variations of the name for flexible matching
          nodeMap.set(person.name, id);
          nameToIdMap.set(normalizeName(person.name), id);

          if (person.rank && person.name) {
            const fullName = `${person.rank} ${person.name}`;
            nodeMap.set(fullName, id);
            nameToIdMap.set(normalizeName(fullName), id);
          }

          diagram += `        ${id}["${label}"]\n`;
        });

        diagram += `    end\n`;
      });

    // Second pass: Create relationships based on supervisor field
    data.forEach((person) => {
      if (person.supervisor && person.name) {
        const childId = nodeMap.get(person.name);

        let parentId = null;

        // Try exact match
        parentId = nodeMap.get(person.supervisor);

        // Try normalized match
        if (!parentId) {
          const normalizedSupervisor = normalizeName(person.supervisor);
          parentId = nameToIdMap.get(normalizedSupervisor);
        }

        // Create relationship if both nodes exist and they're different
        if (childId && parentId && childId !== parentId) {
          diagram += `    ${parentId} --> ${childId}\n`;
        }
      }
    });

    // Add styling with multiple node classes based on rank
    diagram +=
      "\n    classDef commander fill:#1e3a5f,stroke:#eab308,stroke-width:2.5px,color:#FFFFFF,font-weight:bold,font-size:14px,rx:10,ry:10\n";
    diagram +=
      "    classDef senior fill:#1e3a5f,stroke:#eab308,stroke-width:2px,color:#FFFFFF,font-weight:600,font-size:13px,rx:8,ry:8\n";
    diagram +=
      "    classDef mid fill:#1e3a5f,stroke:#eab308,stroke-width:2px,color:#FFFFFF,font-size:12px,rx:8,ry:8\n";
    diagram +=
      "    classDef junior fill:#1e3a5f,stroke:#eab308,stroke-width:2px,color:#FFFFFF,font-size:11px,rx:8,ry:8\n";

    // Apply classes based on rank
    data.forEach((person, idx) => {
      const rank = person.rank?.toLowerCase() || "";
      const id = `N${idx}`;

      if (rank.includes("col") || rank.includes("commander")) {
        diagram += `    class ${id} commander\n`;
      } else if (
        rank.includes("cmsgt") ||
        rank.includes("smsgt") ||
        rank.includes("maj")
      ) {
        diagram += `    class ${id} senior\n`;
      } else if (
        rank.includes("msgt") ||
        rank.includes("tsgt") ||
        rank.includes("capt")
      ) {
        diagram += `    class ${id} mid\n`;
      } else {
        diagram += `    class ${id} junior\n`;
      }
    });

    // Style the subgraphs (shops)
    diagram +=
      "\n    style shop0 fill:#f8fafc,stroke:#eab308,stroke-width:2px\n";
    Object.keys(shopGroups).forEach((_, idx) => {
      if (idx > 0) {
        diagram += `    style shop${idx} fill:#f8fafc,stroke:#eab308,stroke-width:2px\n`;
      }
    });

    return diagram;
  };

  const handleExportDiagram = () => {
    if (!recallRosterData) return;
    const code = generateMermaidDiagram(recallRosterData);
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recall-roster-diagram.mmd";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (!recallRosterData || recallRosterData.length === 0) return;
    const rows = recallRosterData.map((p) => ({
      Name: p.name ?? "",
      Rank: p.rank ?? "",
      Position: p.position ?? "",
      Shop: p.shop ?? "",
      Supervisor: p.supervisor ?? "",
      Phone: p.phone ?? "",
      Email: p.email ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recall Roster");
    XLSX.writeFile(
      wb,
      `recall-roster-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const svgToPngDataUrl = (svgString) => {
    return new Promise((resolve, reject) => {
      let svg = svgString;
      const viewBoxMatch = svg.match(/viewBox=["']?([\d.\s-]+)["']?/);
      if (viewBoxMatch && !/width\s*=/.test(svg)) {
        const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
        const w = parts[2];
        const h = parts[3];
        if (w && h) {
          const insert = svg.indexOf(">");
          svg =
            svg.slice(0, insert) +
            ` width="${w}" height="${h}"` +
            svg.slice(insert);
        }
      }
      const encoded = btoa(unescape(encodeURIComponent(svg)));
      const img = new Image();
      img.onload = () => {
        try {
          const w = Math.max(1, img.naturalWidth || 400);
          const h = Math.max(1, img.naturalHeight || 300);
          const canvas = document.createElement("canvas");
          const scale = 2;
          canvas.width = w * scale;
          canvas.height = h * scale;
          const ctx = canvas.getContext("2d");
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("SVG to image failed"));
      img.src = `data:image/svg+xml;base64,${encoded}`;
    });
  };

  const placeholderPngDataUrl =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAHEQG/v5gYzQAAAABJRU5ErkJggg==";

  const sanitizeFilename = (name) => {
    return (
      String(name)
        .replace(/[<>:"/\\|?*]/g, "-")
        .trim() || "Unassigned"
    );
  };

  const handleDownloadAllPdfs = async () => {
    if (!recallRosterData || recallRosterData.length === 0) return;
    const shops = [
      ...new Set(recallRosterData.map((p) => p.shop || "Unassigned")),
    ].sort();
    if (shops.length === 0) return;

    setDownloadingPdfs(true);
    const zip = new JSZip();

    try {
      for (const shopName of shops) {
        const shopPeople = recallRosterData.filter(
          (p) => (p.shop || "Unassigned") === shopName,
        );
        if (shopPeople.length === 0) continue;

        const code = generateMermaidDiagram(shopPeople);
        const id = `mermaid-pdf-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        let svg;
        try {
          const result = await mermaid.render(id, code);
          svg = result.svg;
        } catch {
          svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60"><text x="20" y="40" fill="#b91c1c">Diagram could not be rendered</text></svg>`;
        }

        let pngDataUrl;
        try {
          pngDataUrl = await svgToPngDataUrl(svg);
        } catch (imgErr) {
          console.warn("SVG to PNG failed for shop", shopName, imgErr);
          pngDataUrl = placeholderPngDataUrl;
        }
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 15;
        const contentW = pageW - margin * 2;
        let y = margin;

        doc.setFontSize(16);
        doc.text(`Recall Roster – ${shopName}`, margin, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(
          `Organization chart & contact information • Printed: ${new Date().toLocaleDateString()}`,
          margin,
          y,
        );
        y += 12;

        const imgW = contentW;
        const maxImgH = doc.internal.pageSize.getHeight() - margin - y - 30;
        const imgH = Math.min(maxImgH, (imgW * 3) / 4);
        try {
          doc.addImage(pngDataUrl, "PNG", margin, y, imgW, imgH);
        } catch (imgErr) {
          console.warn("addImage failed for shop", shopName, imgErr);
        }
        y += imgH + 12;

        doc.autoTable({
          startY: y,
          head: [["Name", "Rank", "Position", "Supervisor", "Phone", "Email"]],
          body: shopPeople.map((p) => [
            String(p.name ?? ""),
            String(p.rank ?? ""),
            String(p.position ?? ""),
            String(p.supervisor ?? ""),
            String(p.phone ?? ""),
            String(p.email ?? ""),
          ]),
          margin: { left: margin, right: margin },
          theme: "grid",
          styles: { fontSize: 8 },
          headStyles: { fontSize: 8, fillColor: [0, 0, 0], textColor: 255 },
        });

        const pdfBlob = doc.output("arraybuffer");
        const safeName = sanitizeFilename(shopName);
        zip.file(`${safeName}.pdf`, pdfBlob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Recall-Roster-by-Shop-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download PDFs error:", err);
      const msg = err?.message || String(err);
      alert(
        `Something went wrong generating the PDFs. ${msg ? `Error: ${msg}` : "Please try again."}`,
      );
    } finally {
      setDownloadingPdfs(false);
    }
  };

  const startEditing = (person, index) => {
    setEditingIndex(index);
    setEditedPerson({ ...person });
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditedPerson(null);
  };

  const saveEdit = () => {
    if (editedPerson && editingIndex !== null) {
      const updatedData = [...recallRosterData];
      updatedData[editingIndex] = editedPerson;
      setRecallRosterData(updatedData);
      setEditingIndex(null);
      setEditedPerson(null);
    }
  };

  const deletePerson = (index) => {
    if (
      window.confirm(
        "Are you sure you want to delete this person from the roster?",
      )
    ) {
      const updatedData = recallRosterData.filter((_, idx) => idx !== index);
      setRecallRosterData(updatedData);
    }
  };

  const addPerson = (newPerson) => {
    const updatedData = [...(recallRosterData || []), newPerson];
    setRecallRosterData(updatedData);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-900">
          <div className="flex items-center gap-4">
            {/* Squadron Logo Placeholder */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">SQ</div>
                <div className="text-xs">LOGO</div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Recall Roster
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Organization Chart & Contact Information
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div className="font-semibold">
              Printed: {new Date().toLocaleDateString()}
            </div>
            <div>For Official Use Only</div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recall Roster</h1>
          <p className="mt-2 text-gray-600">
            Upload and visualize your organization's recall roster
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {recallRosterData && (
            <>
              <button
                onClick={() => window.print()}
                className="btn-secondary flex items-center"
                title="Print or save as PDF from the print dialog"
              >
                <Download className="h-4 w-4 mr-2" />
                Print / Save as PDF
              </button>
              <button
                onClick={handleExportDiagram}
                className="btn-secondary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Diagram
              </button>
              <button
                onClick={handleExportExcel}
                className="btn-secondary flex items-center"
                title="Download roster details as Excel (.xlsx)"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Excel
              </button>
              <button
                onClick={handleDownloadAllPdfs}
                disabled={downloadingPdfs}
                className="btn-secondary flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
                title="Download a ZIP with one PDF per shop"
              >
                {downloadingPdfs ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileArchive className="h-4 w-4 mr-2" />
                )}
                {downloadingPdfs ? "Generating…" : "Download all PDFs (ZIP)"}
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to clear the recall roster? This will remove all personnel data and cannot be undone.",
                    )
                  ) {
                    setRecallRosterData(null);
                    setEditingRowId(null);
                    setEditFormData({});
                  }
                }}
                className="btn-secondary flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Roster
              </button>
            </>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-secondary flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Roster
          </button>
        </div>
      </div>

      {/* Content */}
      {!recallRosterData ? (
        <div className="card text-center py-16">
          <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No Recall Roster Data
          </h3>
          <p className="text-gray-600 mb-6">
            Upload a spreadsheet containing your recall roster to generate an
            organizational diagram
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center mx-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Roster
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
            <div className="card">
              <p className="text-sm font-medium text-gray-600">
                Total Personnel
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {recallRosterData.length}
              </p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-gray-600">Unique Ranks</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {
                  new Set(recallRosterData.map((p) => p.rank).filter(Boolean))
                    .size
                }
              </p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-gray-600">Positions</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {
                  new Set(
                    recallRosterData.map((p) => p.position).filter(Boolean),
                  ).size
                }
              </p>
            </div>
          </div>

          {/* Mermaid Diagram */}
          <div className="card print:shadow-none print:border-0">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 print:block">
              <h2 className="text-xl font-semibold text-gray-900 print:text-2xl">
                Organization Chart
              </h2>
              <div className="flex items-center gap-2 print:hidden">
                <span className="text-sm text-gray-500 mr-1">Zoom:</span>
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={chartZoom <= 0.5}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4 text-gray-700" />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                  {Math.round(chartZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={chartZoom >= 2}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={zoomReset}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  title="Reset zoom and pan"
                >
                  <RotateCcw className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            </div>
            <div
              ref={chartContainerRef}
              className={`bg-white rounded-lg border border-gray-200 print:border-0 print:p-4 overflow-auto min-h-[400px] max-h-[70vh] select-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
              onWheel={handleChartWheel}
              onMouseDown={handleChartPanStart}
              role="application"
              aria-label="Organization chart, drag to pan, use controls to zoom"
            >
              <div
                className="org-chart-zoom-container flex justify-center origin-top"
                style={{
                  width: chartSize ? chartSize.width * chartZoom : "100%",
                  minHeight: chartSize ? chartSize.height * chartZoom : 400,
                }}
              >
                <div
                  className="org-chart-zoom-wrapper"
                  style={{
                    transform: `translate(${chartPan.x}px, ${chartPan.y}px) scale(${chartZoom})`,
                    transformOrigin: "top center",
                  }}
                >
                  <div
                    ref={mermaidRef}
                    className="mermaid flex justify-center min-h-[400px]"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm flex-wrap print:hidden">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-md border-2"
                  style={{ backgroundColor: "#1e3a5f", borderColor: "#eab308" }}
                />
                <span className="text-gray-700">Node style (all ranks)</span>
              </div>
            </div>
          </div>

          {/* Roster Table */}
          <div className="card print:shadow-none print:border-0 print:break-before-page">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 print:text-2xl">
                Roster Details
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center print:hidden"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </button>
            </div>
            <div className="overflow-x-auto print:overflow-visible">
              <table className="min-w-full divide-y divide-gray-200 print:text-sm">
                <thead className="bg-black">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Shop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Supervisor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider print:hidden">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recallRosterData.map((person, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {editingIndex === idx ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="text"
                              value={editedPerson.name}
                              onChange={(e) =>
                                setEditedPerson({
                                  ...editedPerson,
                                  name: e.target.value,
                                })
                              }
                              className="input-field py-1 px-2 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="text"
                              value={editedPerson.rank}
                              onChange={(e) =>
                                setEditedPerson({
                                  ...editedPerson,
                                  rank: e.target.value,
                                })
                              }
                              className="input-field py-1 px-2 text-sm w-20"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="text"
                              value={editedPerson.position}
                              onChange={(e) =>
                                setEditedPerson({
                                  ...editedPerson,
                                  position: e.target.value,
                                })
                              }
                              className="input-field py-1 px-2 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="text"
                              value={editedPerson.shop || ""}
                              onChange={(e) =>
                                setEditedPerson({
                                  ...editedPerson,
                                  shop: e.target.value,
                                })
                              }
                              className="input-field py-1 px-2 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="text"
                              value={editedPerson.supervisor || ""}
                              onChange={(e) =>
                                setEditedPerson({
                                  ...editedPerson,
                                  supervisor: e.target.value,
                                })
                              }
                              className="input-field py-1 px-2 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="text"
                              value={editedPerson.phone || ""}
                              onChange={(e) =>
                                setEditedPerson({
                                  ...editedPerson,
                                  phone: e.target.value,
                                })
                              }
                              className="input-field py-1 px-2 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="text"
                              value={editedPerson.email || ""}
                              onChange={(e) =>
                                setEditedPerson({
                                  ...editedPerson,
                                  email: e.target.value,
                                })
                              }
                              className="input-field py-1 px-2 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium print:hidden">
                            <button
                              onClick={saveEdit}
                              className="text-green-600 hover:text-green-900 mr-3"
                              title="Save"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-900"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {person.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {person.rank}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {person.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {person.shop || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {person.supervisor || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {person.phone || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {person.email || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium print:hidden">
                            <button
                              onClick={() => startEditing(person, idx)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deletePerson(idx)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Person Button - below table for easy access */}
          <div className="flex justify-center print:hidden">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Person
            </button>
          </div>
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <RecallRosterUpload onClose={() => setShowUploadModal(false)} />
      )}

      {/* Add Person Modal */}
      {showAddModal && (
        <AddPersonModal
          onClose={() => setShowAddModal(false)}
          onAdd={addPerson}
        />
      )}
    </div>
  );
};

const AddPersonModal = ({ onClose, onAdd }) => {
  const [newPerson, setNewPerson] = useState({
    name: "",
    rank: "",
    position: "",
    shop: "",
    supervisor: "",
    phone: "",
    email: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPerson.name) {
      onAdd(newPerson);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Plus className="h-6 w-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Add Person</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newPerson.name}
              onChange={(e) =>
                setNewPerson({ ...newPerson, name: e.target.value })
              }
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rank
              </label>
              <input
                type="text"
                value={newPerson.rank}
                onChange={(e) =>
                  setNewPerson({ ...newPerson, rank: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                value={newPerson.position}
                onChange={(e) =>
                  setNewPerson({ ...newPerson, position: e.target.value })
                }
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supervisor
            </label>
            <input
              type="text"
              value={newPerson.supervisor}
              onChange={(e) =>
                setNewPerson({ ...newPerson, supervisor: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={newPerson.phone}
              onChange={(e) =>
                setNewPerson({ ...newPerson, phone: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={newPerson.email}
              onChange={(e) =>
                setNewPerson({ ...newPerson, email: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Person
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RecallRosterUpload = ({ onClose }) => {
  const { setRecallRosterData } = useSchedule();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      parseFile(selectedFile);
    }
  };

  const parseMermaidFile = (content) => {
    const lines = content.split("\n");
    const people = new Map();
    const relationships = [];

    lines.forEach((line) => {
      // Match node definitions: person1["Rank Name<br/>Position<br/>Phone"]
      const nodeMatch = line.match(/(\w+)\["([^"]+)"\]/);
      if (nodeMatch) {
        const [, id, content] = nodeMatch;
        const parts = content.split("<br/>");

        let rank = "";
        let name = "";
        let position = "";
        let phone = "";

        if (parts.length >= 1) {
          // First part contains rank and name
          const firstPart = parts[0].trim();
          const nameParts = firstPart.split(" ");
          // Assume first word is rank if it's a common military rank
          const ranks = [
            "Pvt",
            "PFC",
            "Spc",
            "Cpl",
            "Sgt",
            "SSgt",
            "SFC",
            "MSG",
            "SGM",
            "Lt",
            "Capt",
            "Maj",
            "Col",
            "Gen",
            "AB",
            "Amn",
            "A1C",
            "SrA",
            "TSgt",
            "MSgt",
            "SMSgt",
            "CMSgt",
            "2Lt",
            "1Lt",
            "BGen",
            "MGen",
            "LtGen",
            "Lt Col",
            "Brig Gen",
          ];

          const firstWord = nameParts[0];
          if (ranks.some((r) => firstWord.includes(r))) {
            rank = nameParts[0];
            name = nameParts.slice(1).join(" ");
          } else {
            name = firstPart;
          }
        }
        if (parts.length >= 2) position = parts[1].trim();
        if (parts.length >= 3) phone = parts[2].trim();

        people.set(id, {
          id,
          rank,
          name,
          position,
          phone,
          email: "",
          shop: "",
          supervisor: "",
        });
      }

      // Match relationships: person2 --> person1
      const relMatch = line.match(/(\w+)\s*-->\s*(\w+)/);
      if (relMatch) {
        const [, subordinate, supervisor] = relMatch;
        relationships.push({ subordinate, supervisor });
      }
    });

    // Apply supervisor relationships
    relationships.forEach(({ subordinate, supervisor }) => {
      if (people.has(subordinate) && people.has(supervisor)) {
        const sub = people.get(subordinate);
        const sup = people.get(supervisor);
        sub.supervisor = sup.name;
      }
    });

    // Extract shop info from subgraphs if present
    let currentShop = "";
    lines.forEach((line) => {
      const shopMatch = line.match(/subgraph\s+\w+\["([^"]+)"\]/);
      if (shopMatch) {
        currentShop = shopMatch[1];
      } else if (line.trim() === "end") {
        currentShop = "";
      } else if (currentShop) {
        const nodeMatch = line.match(/(\w+)\[/);
        if (nodeMatch && people.has(nodeMatch[1])) {
          people.get(nodeMatch[1]).shop = currentShop;
        }
      }
    });

    return Array.from(people.values());
  };

  const parseFile = (file) => {
    const reader = new FileReader();

    // Check if it's a Mermaid file
    if (file.name.endsWith(".mmd")) {
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const transformedData = parseMermaidFile(content);

          if (transformedData.length === 0) {
            setError("No personnel data found in the Mermaid file");
            return;
          }

          setPreview(transformedData.slice(0, 5));
        } catch (err) {
          setError(
            "Error parsing Mermaid file. Please ensure it's a valid .mmd file.",
          );
          console.error(err);
        }
      };

      reader.onerror = () => {
        setError("Error reading file");
      };

      reader.readAsText(file);
    } else {
      // Handle Excel/CSV files
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          if (jsonData.length === 0) {
            setError("The file appears to be empty");
            return;
          }

          // Transform data to match our roster structure
          const transformedData = jsonData.map((row) => ({
            name: row["Name"] || row["name"] || "",
            rank: row["Rank"] || row["rank"] || "",
            position: row["Position"] || row["position"] || row["Title"] || "",
            shop: row["Shop"] || row["shop"] || row["Office"] || "",
            supervisor:
              row["Supervisor"] || row["supervisor"] || row["Reports To"] || "",
            phone: row["Phone"] || row["phone"] || row["Phone Number"] || "",
            email: row["Email"] || row["email"] || row["Email Address"] || "",
          }));

          setPreview(transformedData.slice(0, 5));
        } catch (err) {
          setError(
            "Error parsing file. Please ensure it's a valid Excel or CSV file.",
          );
          console.error(err);
        }
      };

      reader.onerror = () => {
        setError("Error reading file");
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handleImport = () => {
    if (!preview) return;

    if (file.name.endsWith(".mmd")) {
      // Import from Mermaid file
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const transformedData = parseMermaidFile(content);
          setRecallRosterData(transformedData);
          onClose();
        } catch (err) {
          setError("Error importing Mermaid data");
          console.error(err);
        }
      };

      reader.readAsText(file);
    } else {
      // Import from Excel/CSV
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          const transformedData = jsonData.map((row) => ({
            name: row["Name"] || row["name"] || "",
            rank: row["Rank"] || row["rank"] || "",
            position: row["Position"] || row["position"] || row["Title"] || "",
            shop: row["Shop"] || row["shop"] || row["Office"] || "",
            supervisor:
              row["Supervisor"] || row["supervisor"] || row["Reports To"] || "",
            phone: row["Phone"] || row["phone"] || row["Phone Number"] || "",
            email: row["Email"] || row["email"] || row["Email Address"] || "",
          }));

          setRecallRosterData(transformedData);
          onClose();
        } catch (err) {
          setError("Error importing data");
          console.error(err);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Upload className="h-6 w-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              Upload Recall Roster
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Upload Area */}
          <div className="mb-6">
            <label className="block w-full">
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.mmd"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-1">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-gray-600">
                  Excel (.xlsx, .xls), CSV, or Mermaid (.mmd) files with
                  columns: Name, Rank, Position, Shop, Supervisor, Phone, Email
                </p>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Preview (First 5 rows)
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Shop
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Supervisor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.rank}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.position}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.shop}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.supervisor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!preview}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import Roster
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecallRoster;
