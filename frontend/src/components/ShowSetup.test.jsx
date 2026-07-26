import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ShowSetup from "./ShowSetup";
import * as api from "../api/client";

const CAST = [
  "Vikram Sethi — The Creditor",
  "Priya Malhotra — The Wife",
  "Arjun Mehta — The Lawyer",
  "Karan Malhotra — The Brother",
  "Meena Devi — The Househelp",
];

beforeEach(() => {
  vi.restoreAllMocks();
});

function goToCast() {
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
}

describe("ShowSetup", () => {
  it("starts on game pick, then cast with all five selected", () => {
    render(<ShowSetup onCreated={() => {}} />);
    expect(screen.getByTestId("game-pick-step")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /start show/i })).not.toBeInTheDocument();

    goToCast();

    expect(screen.getByTestId("cast-pick-step")).toBeInTheDocument();
    const submit = screen.getByRole("button", { name: /start show/i });
    expect(submit).not.toBeDisabled();

    fireEvent.click(screen.getByLabelText(CAST[0]));
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByLabelText(CAST[0]));
    expect(submit).not.toBeDisabled();
  });

  it("shows clear traits on each character card", () => {
    render(<ShowSetup onCreated={() => {}} />);
    goToCast();

    expect(screen.getByText(/Cold & calculating, criminal edge/i)).toBeInTheDocument();
    expect(screen.getByText(/Public grieving widow; private restlessness/i)).toBeInTheDocument();
    expect(screen.getByText(/Precise, reasonable, three steps ahead/i)).toBeInTheDocument();
    expect(screen.getByText(/Hot, impulsive, status-hungry/i)).toBeInTheDocument();
    expect(screen.getByText(/Observant, mischievous, underestimated/i)).toBeInTheDocument();
  });

  it("shows the fixed Bhram title and submits murder defaults", async () => {
    const spy = vi.spyOn(api, "createShow").mockResolvedValue({ id: "bhram" });
    const onCreated = vi.fn();

    render(<ShowSetup onCreated={onCreated} />);
    expect(screen.getByTestId("show-title")).toHaveTextContent("Bhram");
    expect(screen.queryByLabelText(/show title/i)).not.toBeInTheDocument();

    goToCast();
    fireEvent.change(screen.getByLabelText(/number of rounds/i), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByRole("button", { name: /start show/i }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith({ id: "bhram" }));
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Bhram",
        max_rounds: 6,
        agent_preset_ids: [
          "creditor", "wife", "lawyer", "brother", "househelp",
        ],
      })
    );
    expect(spy.mock.calls[0][0].show_prompt).toContain("Ramesh Malhotra");
  });

  it("sends null rounds when the field is left blank", async () => {
    const spy = vi.spyOn(api, "createShow").mockResolvedValue({ id: "bhram" });

    render(<ShowSetup onCreated={() => {}} />);
    goToCast();
    fireEvent.click(screen.getByRole("button", { name: /start show/i }));

    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ max_rounds: null }));
  });

  it("can go back from cast to game pick", () => {
    render(<ShowSetup onCreated={() => {}} />);
    goToCast();
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByTestId("game-pick-step")).toBeInTheDocument();
  });
});
