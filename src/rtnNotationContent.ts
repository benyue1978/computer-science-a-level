import type { Language } from "./content";

type LineResult = { pc: string; mar: string; mdr: string };
type RTNExample = {
  label: string;
  lines: string[];
  initial: LineResult;
  note: string;
  question: string[];
  choices: string[][];
  answer: number[];
  retry: string[];
  events: string[];
  results: LineResult[];
  memoryAddress?: string;
  memoryValue?: string;
  nextAddressNote?: string;
};
type Copy = {
  title: string; intro: string; homeEyebrow: string; homeIntro: string; explore: string;
  home: string; reset: string; exampleLabel: string; nextExample: string; completed: string;
  prediction: string; eventLabel: string; showEvent: string; before: string; after: string;
  expression: string; processorState: string; pc: string; mar: string; mdr: string; memory: string;
  pcContents: string; marContents: string; mdrContents: string;
  memoryCell: string; notFilled: string; arrowKey: string; singleBracketKey: string; doubleBracketKey: string;
  arrowMeaning: string; singleBracketMeaning: string; doubleBracketMeaning: string; rightSideFirst: string;
  currentState: string; changed: string; unchanged: string; why: string; challengeTitle: string;
  challengeQuestion: string; challengeChoices: string[]; challengeAnswer: string; challengeRetry: string;
  examples: RTNExample[];
};

export const rtnNotationContent = {
  en: {
    title: "Reading processor notation",
    intro: "Register Transfer Notation (RTN) is a short way to write what a computer does to its stored values. Read the expression, predict the result, then reveal one computer event.",
    homeEyebrow: "YOUR SEVENTH EXPLORATION",
    homeIntro: "What do the arrow and brackets mean in processor notation? Read and step through the expressions used in a fetch.",
    explore: "Explore RTN notation",
    home: "All explorations", reset: "Start again", exampleLabel: "Choose an RTN example",
    nextExample: "Next RTN example", completed: "All RTN examples complete",
    prediction: "Your prediction", eventLabel: "Computer event", showEvent: "Show computer event",
    before: "Before", after: "After", expression: "RTN expression", processorState: "Processor state",
    pc: "PC", mar: "MAR", mdr: "MDR", memory: "Memory", memoryCell: "Memory location",
    pcContents: "PC contents", marContents: "MAR contents", mdrContents: "MDR contents",
    notFilled: "Not filled yet", arrowKey: "←", singleBracketKey: "[Register]", doubleBracketKey: "[[Register]]",
    arrowMeaning: "The left side is where the result goes. The arrow points to this destination.",
    singleBracketMeaning: "Square brackets mean “the contents of”. [PC] is the value currently stored in PC.",
    doubleBracketMeaning: "Double brackets mean: use the address in MAR, then read the contents stored at that memory location.",
    rightSideFirst: "Work out the right-hand side first, then put that result into the destination on the left.",
    currentState: "Current state", changed: "Changed", unchanged: "Stayed the same", why: "Why this result?",
    challengeTitle: "Try the same rule with a new value",
    challengeQuestion: "PC contains 32. What will MAR contain after MAR ← [PC]?",
    challengeChoices: ["32", "20", "Not filled yet"],
    challengeAnswer: "Yes. The expression copies the current PC contents, 32, into MAR.",
    challengeRetry: "Read the value inside PC, then follow the arrow to its destination.",
    examples: [
      {
        label: "Copy from one register to another", lines: ["MAR ← [PC]"],
        note: "The arrow names the destination. The brackets ask for the source register's contents.",
        question: ["What will MAR contain after this line?"], choices: [["20", "Not filled yet", "0"]], answer: [0],
        retry: ["The line reads the contents of PC, then copies that value to MAR."],
        events: ["The computer copies the contents of PC into MAR. MAR changes to 20; PC stays 20 because copying reads the source without removing it."],
        initial: { pc: "20", mar: "Not filled yet", mdr: "Not filled yet" },
        results: [{ pc: "20", mar: "20", mdr: "Not filled yet" }],
      },
      {
        label: "Look up a memory location", lines: ["MDR ← [[MAR]]"],
        note: "MAR contains the address 17. Memory location 17 contains 42, so the nested brackets produce 42.",
        question: ["What value will the expression copy into MDR?"], choices: [["17", "42", "Not filled yet"]], answer: [1],
        retry: ["17 is the address in MAR. The value stored at memory location 17 is 42."],
        events: ["The computer uses MAR's address to read memory location 17, then copies 42 into MDR. MAR and the memory contents stay unchanged because reading does not erase them."],
        initial: { pc: "Not used", mar: "17", mdr: "Not filled yet" },
        results: [{ pc: "Not used", mar: "17", mdr: "42" }], memoryAddress: "17", memoryValue: "42",
      },
      {
        label: "Calculate a new register value", lines: ["PC ← [PC] + 1"],
        note: "The current PC contents are 20. Add 1, then store the result back in PC.",
        question: ["What will PC contain after this line?"], choices: [["21", "20", "22"]], answer: [0],
        retry: ["First use the current PC contents, 20, then add 1."],
        events: ["The computer calculates 20 + 1 and stores 21 back in PC. Only PC changes; it now holds the next instruction address."],
        initial: { pc: "20", mar: "Not used", mdr: "Not used" },
        results: [{ pc: "21", mar: "Not used", mdr: "Not used" }], nextAddressNote: "The resulting PC value identifies the next instruction address in this teaching example.",
      },
      {
        label: "Read two lines in order", lines: ["MAR ← [PC]", "PC ← [PC] + 1"],
        note: "RTN lines are carried out from top to bottom. Each line uses the state left by the line before it.",
        question: ["After line 1, what are MAR and PC?", "After line 2, what will PC contain?"],
        choices: [["MAR=20; PC=20", "MAR=20; PC=21"], ["21", "20", "22"]], answer: [0, 0],
        retry: ["Line 1 copies the original PC value. It has not been incremented yet.", "PC currently contains 20; line 2 adds 1."],
        events: ["Line 1: the computer copies the current PC value, 20, into MAR. MAR changes; PC stays 20 because it is the source.", "Line 2: the computer adds 1 to PC and stores 21. PC changes; MAR stays 20 from line 1."],
        initial: { pc: "20", mar: "Not filled yet", mdr: "Not used" },
        results: [{ pc: "20", mar: "20", mdr: "Not used" }, { pc: "21", mar: "20", mdr: "Not used" }],
      },
    ],
  },
  zh: {
    title: "读懂寄存器传送表示法",
    intro: "寄存器传送表示法（Register Transfer Notation，RTN）用简短的写法描述计算机怎样改变已存储的数值。先读懂表达式并作出预测，再显示一个计算机事件。",
    homeEyebrow: "你的第七次探索",
    homeIntro: "处理器表示法中的箭头和方括号是什么意思？一起读懂并逐步观察取指中用到的表达式。",
    explore: "探索 RTN 表示法",
    home: "全部探索", reset: "重新开始", exampleLabel: "选择 RTN 示例",
    nextExample: "下一个 RTN 示例", completed: "所有 RTN 示例已完成",
    prediction: "你的预测", eventLabel: "计算机事件", showEvent: "显示计算机事件",
    before: "之前", after: "之后", expression: "RTN 表达式", processorState: "处理器状态",
    pc: "PC", mar: "MAR", mdr: "MDR", memory: "存储器", memoryCell: "存储器位置",
    pcContents: "PC 内容", marContents: "MAR 内容", mdrContents: "MDR 内容",
    notFilled: "尚未填写", arrowKey: "←", singleBracketKey: "[寄存器]", doubleBracketKey: "[[寄存器]]",
    arrowMeaning: "左边表示结果要放到哪里。箭头指向这个目标位置。",
    singleBracketMeaning: "方括号表示“……中的内容”。[PC] 就是 PC 当前保存的数值。",
    doubleBracketMeaning: "双层方括号表示：先使用 MAR 中的地址，再读取该存储位置中保存的内容。",
    rightSideFirst: "先计算右边的表达式，再把结果放入左边的目标位置。",
    currentState: "当前状态", changed: "发生变化", unchanged: "保持不变", why: "为什么得到这个结果？",
    challengeTitle: "换一个数值，试试同一规则",
    challengeQuestion: "PC 中保存着 32。执行 MAR ← [PC] 后，MAR 中会保存什么？",
    challengeChoices: ["32", "20", "尚未填写"],
    challengeAnswer: "是的。表达式把 PC 当前保存的 32 复制到 MAR。",
    challengeRetry: "先读出 PC 中的数值，再沿着箭头找到它的目标位置。",
    examples: [
      {
        label: "从一个寄存器复制到另一个", lines: ["MAR ← [PC]"],
        note: "箭头左边写出目标位置。方括号表示读取源寄存器中的内容。",
        question: ["执行这一行后，MAR 中会保存什么？"], choices: [["20", "尚未填写", "0"]], answer: [0],
        retry: ["这一行先读取 PC 中的内容，再把这个数值复制到 MAR。"],
        events: ["计算机把 PC 中的内容复制到 MAR。MAR 变为 20；PC 仍是 20，因为读取源数值不会把它清除。"],
        initial: { pc: "20", mar: "尚未填写", mdr: "尚未填写" },
        results: [{ pc: "20", mar: "20", mdr: "尚未填写" }],
      },
      {
        label: "查找一个存储器位置", lines: ["MDR ← [[MAR]]"],
        note: "MAR 中保存着地址 17。存储器位置 17 中保存着 42，所以双层方括号表示的数值是 42。",
        question: ["这个表达式会把哪个数值复制到 MDR？"], choices: [["17", "42", "尚未填写"]], answer: [1],
        retry: ["17 是 MAR 中的地址。存储器位置 17 中保存的数值是 42。"],
        events: ["计算机使用 MAR 中的地址读取存储器位置 17，再把 42 复制到 MDR。MAR 和存储器内容保持不变，因为读取不会清除它们。"],
        initial: { pc: "暂不使用", mar: "17", mdr: "尚未填写" },
        results: [{ pc: "暂不使用", mar: "17", mdr: "42" }], memoryAddress: "17", memoryValue: "42",
      },
      {
        label: "计算新的寄存器数值", lines: ["PC ← [PC] + 1"],
        note: "PC 当前保存着 20。加上 1，再把结果存回 PC。",
        question: ["执行这一行后，PC 中会保存什么？"], choices: [["21", "20", "22"]], answer: [0],
        retry: ["先读取 PC 当前保存的 20，再加上 1。"],
        events: ["计算机计算 20 + 1，并把 21 存回 PC。只有 PC 改变了；现在它保存着下一条指令的地址。"],
        initial: { pc: "20", mar: "暂不使用", mdr: "暂不使用" },
        results: [{ pc: "21", mar: "暂不使用", mdr: "暂不使用" }], nextAddressNote: "在这个教学示例中，得到的 PC 数值表示下一条指令的地址。",
      },
      {
        label: "按顺序阅读两行", lines: ["MAR ← [PC]", "PC ← [PC] + 1"],
        note: "RTN 语句从上到下依次执行。每一行都使用上一行完成后留下的状态。",
        question: ["执行第 1 行后，MAR 和 PC 分别是多少？", "执行第 2 行后，PC 中会保存什么？"],
        choices: [["MAR=20；PC=20", "MAR=20；PC=21"], ["21", "20", "22"]], answer: [0, 0],
        retry: ["第 1 行复制的是原来的 PC 数值。此时 PC 还没有递增。", "PC 当前是 20；第 2 行会加上 1。"],
        events: ["第 1 行：计算机把 PC 当前保存的 20 复制到 MAR。MAR 改变；PC 仍是 20，因为它是来源。", "第 2 行：计算机给 PC 加上 1 并存回 21。PC 改变；MAR 保持第 1 行存入的 20。"],
        initial: { pc: "20", mar: "尚未填写", mdr: "暂不使用" },
        results: [{ pc: "20", mar: "20", mdr: "暂不使用" }, { pc: "21", mar: "20", mdr: "暂不使用" }],
      },
    ],
  },
} satisfies Record<Language, Copy>;

export type RTNNotationLanguage = Language;
