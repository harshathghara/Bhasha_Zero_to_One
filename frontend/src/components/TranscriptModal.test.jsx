import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TranscriptModal from "./TranscriptModal";

const downloadTranscriptPdf = vi.fn().mockResolvedValue(undefined);

vi.mock("../transcriptPdf", () => ({
  downloadTranscriptPdf: (...args) => downloadTranscriptPdf(...args),
}));

const showData = {
  id: "bhram",
  title: "Bhram",
  contestants: [
    { id: "creditor", name: "Vikram Sethi — The Creditor" },
    { id: "wife", name: "Priya Malhotra — The Wife" },
    { id: "lawyer", name: "Arjun Mehta — The Lawyer" },
    { id: "brother", name: "Karan Malhotra — The Brother" },
    { id: "househelp", name: "Meena Devi — The Househelp" },
  ],
  events: [
    {
      round: 1,
      seq: 1,
      sender_id: "game_master",
      kind: "gm_announcement",
      visibility: "public",
      recipients: [],
      text: "Doors sealed.",
      timestamp: 1710000000,
    },
    {
      round: 1,
      seq: 2,
      sender_id: "creditor",
      kind: "agent_action",
      visibility: "private",
      recipients: ["wife"],
      text: "Protect me on the debt.",
      timestamp: 1710000060,
    },
  ],
  recaps: { 1: "Heat shifted onto Karan." },
  narratives: { 1: "Priya watched the room turn." },
};

beforeEach(() => {
  vi.clearAllMocks();
  downloadTranscriptPdf.mockResolvedValue(undefined);
});

describe("TranscriptModal", () => {
  it("renders cast traits, puppets, dialogue, and recap", () => {
    render(<TranscriptModal showData={showData} onClose={() => {}} />);

    expect(screen.getByTestId("transcript-modal")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /producer log/i })).toBeInTheDocument();
    expect(screen.getByTestId("transcript-scroll")).toBeInTheDocument();
    expect(screen.getByText(/Cold & calculating/i)).toBeInTheDocument();
    expect(screen.getByTestId("transcript-portrait-creditor")).toBeInTheDocument();
    expect(screen.getByTestId("transcript-line-portrait-creditor")).toBeInTheDocument();
    expect(screen.getByText("Doors sealed.")).toBeInTheDocument();
    expect(screen.getByText("Protect me on the debt.")).toBeInTheDocument();
    expect(screen.getByText(/Heat shifted onto Karan/i)).toBeInTheDocument();
  });

  it("downloads a .txt file when Download is clicked", () => {
    const click = vi.fn();
    const anchor = { href: "", download: "", click, remove: vi.fn() };
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag, options) => {
      if (tag === "a") return anchor;
      return realCreate(tag, options);
    });
    const realAppend = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, "appendChild").mockImplementation((node) => {
      if (node === anchor) return anchor;
      return realAppend(node);
    });
    URL.createObjectURL = vi.fn(() => "blob:transcript");
    URL.revokeObjectURL = vi.fn();

    render(<TranscriptModal showData={showData} onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /download \.txt/i }));

    expect(anchor.download).toMatch(/\.txt$/);
    expect(click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it("calls onClose when closed", () => {
    const onClose = vi.fn();
    render(<TranscriptModal showData={showData} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("downloads a PDF of the preview when Download PDF is clicked", async () => {
    render(<TranscriptModal showData={showData} onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    await waitFor(() => expect(downloadTranscriptPdf).toHaveBeenCalled());
    const [element, filename] = downloadTranscriptPdf.mock.calls[0];
    expect(element).toHaveAttribute("data-testid", "transcript-capture");
    expect(filename).toMatch(/\.pdf$/);
  });
});
