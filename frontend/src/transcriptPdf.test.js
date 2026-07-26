import { describe, it, expect, vi, beforeEach } from "vitest";

const save = vi.fn();
const addImage = vi.fn();
const addPage = vi.fn();
const html2canvas = vi.fn();

vi.mock("html2canvas", () => ({
  default: (...args) => html2canvas(...args),
}));

vi.mock("jspdf", () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 595, getHeight: () => 842 } },
    addImage,
    addPage,
    save,
  })),
}));

describe("downloadTranscriptPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    html2canvas.mockResolvedValue({
      width: 800,
      height: 2000,
      toDataURL: () => "data:image/png;base64,AAA",
    });
  });

  it("captures the preview element and saves a multi-page PDF", async () => {
    const { downloadTranscriptPdf } = await import("./transcriptPdf");
    const element = document.createElement("div");
    element.appendChild(document.createElement("p")).textContent = "Producer log";

    await downloadTranscriptPdf(element, "bhram-transcript-round-1.pdf");

    expect(html2canvas).toHaveBeenCalled();
    expect(addImage).toHaveBeenCalled();
    expect(addPage).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith("bhram-transcript-round-1.pdf");
  });
});
