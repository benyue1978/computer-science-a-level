import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Business from "./Business";

beforeEach(() => {
  window.history.replaceState({}, "", "/business");
  vi.stubGlobal("print", vi.fn());
});

describe("Business in Context", () => {
  it("switches between separate AS and A2 glossary collections", async () => {
    const user = userEvent.setup();
    render(<Business />);

    expect(screen.getByText("THE A2 COLLECTION")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Business and its environment" })).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "AS" }));
    expect(screen.getByText("THE AS COLLECTION")).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "A2" }));
    expect(screen.getByText("THE A2 COLLECTION")).toBeVisible();
    await user.type(screen.getByRole("searchbox", { name: "搜索英中术语" }), "Globalisation");
    expect(screen.getByRole("heading", { name: "Globalisation" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Added value" })).not.toBeInTheDocument();
  });

  it("prints an A2 subsection with its cross-listed terms and the whole A2 chapter", async () => {
    const user = userEvent.setup();
    render(<Business />);
    await user.click(screen.getByRole("tab", { name: "A2" }));
    await user.type(screen.getByRole("searchbox", { name: "搜索英中术语" }), "Globalisation");

    const topic = screen.getByText("Globalisation").closest(".business-term")?.closest(".business-topic");
    expect(topic).not.toBeNull();
    await user.click(within(topic as HTMLElement).getByRole("button", { name: /打印小节/ }));
    expect(window.print).toHaveBeenCalledOnce();
    expect(document.querySelectorAll(".business-term--print-target").length).toBeGreaterThan(0);

    window.dispatchEvent(new Event("afterprint"));
    await user.click(screen.getByRole("button", { name: "打印 Unit 6 全章" }));
    expect(window.print).toHaveBeenCalledTimes(2);
  });

  it("includes a merged A2 term when printing its related syllabus subsection", async () => {
    const user = userEvent.setup();
    render(<Business />);
    await user.click(screen.getByRole("tab", { name: "A2" }));
    const topic = screen.getByRole("button", { name: /8\.2\.3/ }).closest(".business-topic");
    expect(topic).not.toBeNull();

    await user.click(within(topic as HTMLElement).getByRole("button", { name: /打印小节/ }));

    expect(window.print).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: "Globalisation" })).toBeInTheDocument();
    expect(Array.from(document.querySelectorAll("#unit-8 .business-term--print-target h4"), (el) => el.textContent))
      .toContain("Globalisation");
    expect(document.querySelectorAll("#unit-6 .business-term--print-target")).toHaveLength(0);
  });

  it("finds entries by English and Chinese text", async () => {
    const user = userEvent.setup();
    render(<Business />);
    await user.click(screen.getByRole("tab", { name: "AS" }));

    const search = screen.getByRole("searchbox", { name: "搜索英中术语" });
    await user.type(search, "Added value");
    expect(screen.getByRole("heading", { name: "Added value" })).toBeVisible();

    await user.clear(search);
    await user.type(search, "增值");
    expect(screen.getByRole("heading", { name: "Added value" })).toBeVisible();
  });

  it("sorts Unit 1 subsections by Cambridge syllabus number", async () => {
    const user = userEvent.setup();
    const { container } = render(<Business />);
    await user.click(screen.getByRole("tab", { name: "AS" }));
    const codes = Array.from(
      container.querySelectorAll("#unit-1 .business-topic-code"),
      (element) => element.textContent,
    );

    expect(codes.slice(0, 3)).toEqual(["1.1.1", "1.1.2", "1.1.3"]);
  });

  it("prints a whole syllabus subsection regardless of the current search", async () => {
    const user = userEvent.setup();
    render(<Business />);
    await user.click(screen.getByRole("tab", { name: "AS" }));
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
    await user.click(screen.getByRole("tab", { name: "AS" }));
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
    await user.click(screen.getByRole("tab", { name: "AS" }));
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
