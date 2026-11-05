import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Business from "./Business";

beforeEach(() => {
  window.history.replaceState({}, "", "/business");
  vi.stubGlobal("print", vi.fn());
});

describe("Business in Context", () => {
  it("finds entries by English and Chinese text", async () => {
    const user = userEvent.setup();
    render(<Business />);

    const search = screen.getByRole("searchbox", { name: "搜索英中术语" });
    await user.type(search, "Added value");
    expect(screen.getByRole("heading", { name: "Added value" })).toBeVisible();

    await user.clear(search);
    await user.type(search, "增值");
    expect(screen.getByRole("heading", { name: "Added value" })).toBeVisible();
  });

  it("sorts Unit 1 subsections by Cambridge syllabus number", () => {
    const { container } = render(<Business />);
    const codes = Array.from(
      container.querySelectorAll("#unit-1 .business-topic-code"),
      (element) => element.textContent,
    );

    expect(codes.slice(0, 3)).toEqual(["1.1.1", "1.1.2", "1.1.3"]);
  });

  it("prints a whole syllabus subsection regardless of the current search", async () => {
    const user = userEvent.setup();
    render(<Business />);
    await user.type(screen.getByRole("searchbox", { name: "搜索英中术语" }), "Added value");
    const term = screen.getByRole("heading", { name: "Added value" });
    const topic = term.closest(".business-topic");
    expect(topic).not.toBeNull();
    await user.click(within(topic as HTMLElement).getByRole("button", { name: /打印小节/ }));

    expect(window.print).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: "Factor of Production" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Employee Contract" })).not.toBeInTheDocument();
  });

  it("prints a full unit directly from its chapter heading", async () => {
    const user = userEvent.setup();
    render(<Business />);
    await user.click(screen.getByRole("button", { name: "打印 Unit 1 全章" }));

    expect(window.print).toHaveBeenCalledOnce();
    expect(document.querySelectorAll(".business-term--print-target")).toHaveLength(73);
    expect(screen.queryByRole("heading", { name: "Employment Contract" })).not.toBeInTheDocument();
  });

  it("uses unique disclosure ids when syllabus topics appear in multiple source units", () => {
    const { container } = render(<Business />);
    const controls = Array.from(container.querySelectorAll<HTMLElement>("[aria-controls]"))
      .map((element) => element.getAttribute("aria-controls"))
      .filter((id): id is string => id !== null);

    expect(new Set(controls).size).toBe(controls.length);
    for (const id of controls) {
      expect(container.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
    }
  });

  it("lets readers collapse a subsection while searching", async () => {
    const user = userEvent.setup();
    render(<Business />);
    const search = screen.getByRole("searchbox", { name: "搜索英中术语" });
    await user.type(search, "Added value");

    const termHeading = screen.getByRole("heading", { name: "Added value" });
    const topic = termHeading.closest(".business-topic");
    const toggle = topic?.querySelector<HTMLButtonElement>(".business-topic-toggle");
    expect(toggle).not.toBeNull();
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.click(toggle as HTMLButtonElement);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(termHeading).not.toBeVisible();
  });

});
