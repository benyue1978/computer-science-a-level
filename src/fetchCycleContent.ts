import type { Language } from "./content";

export type FetchCycleState = {
  pc: string; mar: string; mdr: string; cir: string; acc: string;
  addressBus: string; dataBus: string; controlBus: string;
};

type Step = {
  stage: "fetch" | "decode" | "execute";
  rtLine?: number;
  question: string;
  choices: string[];
  answer: number;
  retry: string;
  event: string;
  state: FetchCycleState;
};

type Copy = {
  title: string; eyebrow: string; intro: string; homeIntro: string; explore: string;
  home: string; reset: string; stageNames: { fetch: string; decode: string; execute: string };
  cycleMapTitle: string; fetchShort: string; decodeShort: string; executeShort: string; loopShort: string;
  walkthrough: string; stepLabel: string; questionLabel: string; eventLabel: string; nextStep: string;
  stateTitle: string; pc: string; mar: string; mdr: string; cir: string; acc: string; accRole: string;
  addressBus: string; dataBus: string; controlBus: string; noSignal: string; memoryTitle: string;
  memoryAddress: string; instruction: string; instructionText: string; instructionCaveat: string; notFilled: string; notUsed: string;
  rtnTitle: string; rtnSequenceLabel: string; busActivityLabel: string; cuTitle: string; cuWaiting: string; aluTitle: string; aluWaiting: string;
  decodeResult: string;
  completeTitle: string; completeText: string; nextAddress: string;
  clockTitle: string; clockText: string; clockDifference: string;
  examTitle: string; examPrompt: string; examLabel: string; examPlaceholder: string;
  examButton: string; markPointsTitle: string; markPoints: string[]; modelAnswerTitle: string; modelAnswer: string;
  steps: Step[];
};

export const fetchCycleContent = {
  en: {
    title: "Putting fetch, decode and execute together",
    eyebrow: "YOUR EIGHTH EXPLORATION",
    intro: "Follow one instruction from its address in memory, through fetch and decode, to the work the processor carries out. Predict each computer event before revealing it.",
    homeIntro: "Bring registers, buses, RTN and the instruction cycle together. Step through one complete Fetch–Decode–Execute cycle.",
    explore: "Explore the complete F-D-E cycle", home: "All explorations", reset: "Start again",
    stageNames: { fetch: "Fetch", decode: "Decode", execute: "Execute" },
    cycleMapTitle: "One instruction cycle",
    fetchShort: "Get the next instruction from memory",
    decodeShort: "Work out what the instruction means",
    executeShort: "Carry out that instruction",
    loopShort: "Then fetch the next instruction",
    walkthrough: "Follow the computer step by step", stepLabel: "Computer step", questionLabel: "Your prediction",
    eventLabel: "Computer event", nextStep: "Show next computer step", stateTitle: "What the processor currently holds",
    pc: "Program Counter (PC)", mar: "Memory Address Register (MAR)", mdr: "Memory Data Register (MDR)",
    cir: "Current Instruction Register (CIR)", acc: "Accumulator (ACC)", accRole: "ACC stores a value used in a calculation.",
    addressBus: "Address bus", dataBus: "Data bus", controlBus: "Control bus", noSignal: "No bus transfer in this step",
    memoryTitle: "Main memory", memoryAddress: "Location 20", instruction: "Plain-language instruction meaning", instructionText: "Add five to the value in ACC", instructionCaveat: "This sentence explains what the teaching instruction means; it is not assembly or machine code.",
    notFilled: "Not filled yet", notUsed: "Not used in this example",
    rtnTitle: "Fetch written in RTN", rtnSequenceLabel: "RTN fetch sequence", busActivityLabel: "Bus activity", cuTitle: "Control Unit (CU)", cuWaiting: "Waiting to decode the instruction",
    aluTitle: "Arithmetic and Logic Unit (ALU)", aluWaiting: "Waiting for an arithmetic operation", decodeResult: "Add five to the value in ACC",
    completeTitle: "The instruction cycle is complete",
    completeText: "The processor can begin another fetch. PC now identifies the next instruction address; the Fetch–Decode–Execute process repeats while the program continues.",
    nextAddress: "Next instruction address: 21",
    clockTitle: "A clock cycle and an instruction cycle",
    clockText: "The system clock provides regular timing signals that coordinate small processor actions. This step-by-step display lets us pause between those actions; it is a teaching view, not a timing measurement.",
    clockDifference: "An instruction cycle is the complete process for one instruction: fetch, decode and execute. It is larger than one small clock-coordinated action. Do not assume every processor needs a fixed number of clock cycles per instruction.",
    examTitle: "Try an exam-style explanation",
    examPrompt: "Describe the Fetch–Decode–Execute cycle for this example. Include the four fetch RTN lines, the register and bus roles, what CU does during decode, and how the instruction is carried out.",
    examLabel: "Your exam-style answer", examPlaceholder: "Write your answer in your own words…",
    examButton: "Show answer guidance", markPointsTitle: "Mark points to look for",
    markPoints: [
      "Fetch begins with PC holding the address of the next instruction; MAR ← [PC] copies that address into MAR.",
      "PC ← [PC] + 1 updates PC to the next sequential instruction address while MAR keeps the fetched address.",
      "MAR supplies the address on the address bus and CU sends READ on the control bus; the instruction returns on the data bus into MDR (MDR ← [[MAR]]).",
      "CIR ← [MDR] places the fetched instruction in CIR, ready for decoding.",
      "During decode, CU interprets the instruction and coordinates the required processor work.",
      "During execute, the required unit carries out the instruction; here the ALU adds 5 to ACC, changing 7 to 12. The cycle then repeats for the next instruction."
    ],
    modelAnswerTitle: "One possible answer",
    modelAnswer: "The PC holds the address of the next instruction. This address is copied into MAR (MAR ← [PC]), then PC is incremented (PC ← [PC] + 1). MAR supplies the address on the address bus and the CU sends a READ signal on the control bus. The instruction at that address returns over the data bus into MDR (MDR ← [[MAR]]) and is copied into CIR (CIR ← [MDR]). The CU decodes the instruction to work out what must happen. During execution, the required processor component carries it out; for this plain-language example, the ALU adds 5 to the ACC value of 7, giving 12. The processor then repeats the cycle for the next instruction.",
    steps: [
      { stage: "fetch", rtLine: 0, question: "PC contains 20. What happens when the processor starts fetching this instruction?", choices: ["MAR becomes 20; PC stays 20", "PC becomes 20; MAR stays empty", "Memory location 20 is erased"], answer: 0, retry: "The first line copies the current PC contents into MAR. It does not remove the value from PC.", event: "The processor copies the address 20 from PC into MAR. MAR changes to 20; PC stays 20 because the source is read, not cleared.", state: { pc: "20", mar: "20", mdr: "Not filled yet", cir: "Not filled yet", acc: "7", addressBus: "—", dataBus: "—", controlBus: "—" } },
      { stage: "fetch", rtLine: 1, question: "MAR now holds 20. What does the second RTN line do?", choices: ["PC becomes 21; MAR keeps 20", "MAR becomes 21; PC stays 20", "The instruction in memory changes"], answer: 0, retry: "Read the current PC value, add 1, and store the result back in PC. MAR keeps the original address.", event: "The processor adds 1 to the current PC value. PC becomes 21, the next instruction address; MAR remains 20 so the processor can still read the instruction at location 20.", state: { pc: "21", mar: "20", mdr: "Not filled yet", cir: "Not filled yet", acc: "7", addressBus: "—", dataBus: "—", controlBus: "—" } },
      { stage: "fetch", rtLine: 2, question: "How will the instruction at memory location 20 reach the processor?", choices: ["Address bus carries 20, control bus carries READ, data bus returns the instruction to MDR", "All three items travel on the address bus", "The instruction travels from PC straight to CIR"], answer: 0, retry: "The address says where, READ says what memory should do, and the data bus carries the returned contents.", event: "The processor uses MAR's 20 on the address bus. The CU requests READ on the control bus. Memory returns “Add five to the value in ACC” on the data bus into MDR. Only MDR changes; MAR keeps address 20 and memory keeps its instruction.", state: { pc: "21", mar: "20", mdr: "Add five to the value in ACC", cir: "Not filled yet", acc: "7", addressBus: "20", dataBus: "Add five to the value in ACC → MDR", controlBus: "READ" } },
      { stage: "fetch", rtLine: 3, question: "The instruction is now in MDR. Where does it go so the processor can decode it?", choices: ["CIR receives the instruction from MDR", "PC receives the instruction", "The instruction is removed from memory"], answer: 0, retry: "CIR is the Current Instruction Register. It holds the instruction being decoded and executed.", event: "The processor copies the instruction from MDR into CIR. CIR now holds the current instruction; MDR still shows the value just transferred.", state: { pc: "21", mar: "20", mdr: "Add five to the value in ACC", cir: "Add five to the value in ACC", acc: "7", addressBus: "—", dataBus: "—", controlBus: "—" } },
      { stage: "decode", question: "What does the CU do while the instruction is being decoded?", choices: ["It works out that the instruction means add 5 to ACC; register values have not changed yet", "It performs the addition itself", "It copies the instruction back to memory"], answer: 0, retry: "The CU interprets the instruction and coordinates what should happen. The calculation belongs to the ALU.", event: "The CU examines the instruction in CIR and decodes it: add 5 to ACC. It coordinates the next work. Decoding identifies the action; it has not changed ACC yet.", state: { pc: "21", mar: "20", mdr: "Add five to the value in ACC", cir: "Add five to the value in ACC", acc: "7", addressBus: "—", dataBus: "—", controlBus: "—" } },
      { stage: "execute", question: "ACC contains 7. What will happen when the processor executes “Add five to the value in ACC”?", choices: ["The ALU calculates 7 + 5; ACC becomes 12", "The CU changes ACC to 5 without calculating", "PC returns to 20"], answer: 0, retry: "The ALU carries out the arithmetic: add the instruction's 5 to the current ACC value, 7.", event: "The ALU adds 5 to the value 7 in ACC. The result, 12, is stored in ACC. PC stays at 21, ready to identify the next instruction.", state: { pc: "21", mar: "20", mdr: "Add five to the value in ACC", cir: "Add five to the value in ACC", acc: "12", addressBus: "—", dataBus: "—", controlBus: "—" } },
    ],
  },
  zh: {
    title: "把取指、译码和执行连起来",
    eyebrow: "你的第八次探索",
    intro: "跟随一条指令，从它在存储器中的地址，经过取指和译码，再到处理器真正执行。每次显示计算机事件前，先预测会发生什么。",
    homeIntro: "把寄存器、总线、RTN 和指令周期连起来，逐步观察一个完整的取指—译码—执行过程。",
    explore: "探索完整的 F-D-E 周期", home: "全部探索", reset: "重新开始",
    stageNames: { fetch: "取指", decode: "译码", execute: "执行" },
    cycleMapTitle: "一条指令的周期",
    fetchShort: "从存储器取得下一条指令", decodeShort: "弄清指令的含义", executeShort: "完成指令要求的工作",
    loopShort: "然后取出下一条指令", walkthrough: "逐步观察计算机", stepLabel: "计算机步骤", questionLabel: "你的预测",
    eventLabel: "计算机事件", nextStep: "显示计算机下一步", stateTitle: "处理器当前保存的内容",
    pc: "程序计数器（PC）", mar: "存储器地址寄存器（MAR）", mdr: "存储器数据寄存器（MDR）",
    cir: "当前指令寄存器（CIR）", acc: "累加器（ACC）", accRole: "ACC 保存计算要用的数值。",
    addressBus: "地址总线", dataBus: "数据总线", controlBus: "控制总线", noSignal: "此步骤没有总线传输",
    memoryTitle: "主存储器", memoryAddress: "位置 20", instruction: "指令含义（自然语言）", instructionText: "将 5 加到 ACC 当前保存的数值", instructionCaveat: "这是对教学指令含义的自然语言说明，不是汇编语言或机器码。",
    notFilled: "尚未填写", notUsed: "本例中暂不使用",
    rtnTitle: "用 RTN 表示取指", rtnSequenceLabel: "RTN 取指顺序", busActivityLabel: "总线活动", cuTitle: "控制单元（CU）", cuWaiting: "等待译码这条指令",
    aluTitle: "算术逻辑单元（ALU）", aluWaiting: "等待执行算术运算", decodeResult: "将 5 加到 ACC 当前保存的数值",
    completeTitle: "这条指令的周期完成了",
    completeText: "处理器可以开始下一次取指。PC 现在指出下一条指令的地址；只要程序继续，取指、译码和执行就会重复。",
    nextAddress: "下一条指令的地址：21",
    clockTitle: "时钟周期与指令周期",
    clockText: "系统时钟发出有规律的信号，协调处理器内部的小步骤。这个逐步演示让我们可以在动作之间暂停；它是教学视图，不是对处理器速度的测量。",
    clockDifference: "一个指令周期是处理一条指令的完整过程：取指、译码和执行。它包含的内容多于一个由时钟协调的小动作。不要认为每种处理器执行每条指令都固定需要相同数量的时钟周期。",
    examTitle: "试着写一道考试式说明题",
    examPrompt: "结合本例，说明取指—译码—执行周期。答案应包括四行取指 RTN、寄存器和总线的作用、译码时 CU 做什么，以及处理器怎样执行这条指令。",
    examLabel: "你的考试式答案", examPlaceholder: "用自己的话写下答案……",
    examButton: "显示答案提示", markPointsTitle: "可以检查的评分要点",
    markPoints: [
      "取指开始时，PC 保存下一条指令的地址；MAR ← [PC] 把该地址复制到 MAR。",
      "PC ← [PC] + 1 把 PC 更新为下一条顺序指令的地址，同时 MAR 仍保存刚才要读取的地址。",
      "MAR 把地址放到地址总线上，CU 在控制总线上发出 READ；指令内容经数据总线返回 MDR（MDR ← [[MAR]]）。",
      "CIR ← [MDR] 把取到的指令放入 CIR，准备译码。",
      "译码时，CU 解释指令，并协调处理器接下来需要完成的工作。",
      "执行时，相关部件完成指令要求的工作；本例中 ALU 把 5 加到 ACC，ACC 从 7 变为 12。随后为下一条指令重复该周期。"
    ],
    modelAnswerTitle: "一种参考答案",
    modelAnswer: "PC 保存下一条指令的地址。该地址被复制到 MAR（MAR ← [PC]），然后 PC 加 1（PC ← [PC] + 1）。MAR 把地址放到地址总线上，CU 在控制总线上发出 READ 信号。该地址中的指令经数据总线传到 MDR（MDR ← [[MAR]]），再复制到 CIR（CIR ← [MDR]）。CU 译码这条指令，弄清楚需要做什么。执行时，相关处理器部件完成指令要求的工作；在本例中，ALU 把 5 加到 ACC 原有的 7，结果是 12。然后处理器为下一条指令重复这个周期。",
    steps: [
      { stage: "fetch", rtLine: 0, question: "PC 中保存着 20。处理器开始取这条指令时会发生什么？", choices: ["MAR 变成 20；PC 仍是 20", "PC 变成 20；MAR 仍为空", "存储器位置 20 被清空"], answer: 0, retry: "第一行把 PC 当前保存的内容复制到 MAR。它不会把 PC 中的数值删除。", event: "处理器把 PC 中的地址 20 复制到 MAR。MAR 变为 20；PC 仍是 20，因为读取来源不会清除它。", state: { pc: "20", mar: "20", mdr: "尚未填写", cir: "尚未填写", acc: "7", addressBus: "—", dataBus: "—", controlBus: "—" } },
      { stage: "fetch", rtLine: 1, question: "MAR 现在保存着 20。第二行 RTN 会做什么？", choices: ["PC 变为 21；MAR 保持 20", "MAR 变为 21；PC 保持 20", "存储器中的指令发生变化"], answer: 0, retry: "读取 PC 当前的数值，加 1，再把结果存回 PC。MAR 仍保留原来的地址。", event: "处理器给 PC 当前的数值加 1。PC 变为 21，也就是下一条指令的地址；MAR 仍是 20，因此处理器仍能读取位置 20 中的指令。", state: { pc: "21", mar: "20", mdr: "尚未填写", cir: "尚未填写", acc: "7", addressBus: "—", dataBus: "—", controlBus: "—" } },
      { stage: "fetch", rtLine: 2, question: "存储器位置 20 中的指令怎样传到处理器？", choices: ["地址总线传送 20，控制总线传送 READ，数据总线把指令送回 MDR", "这三项都通过地址总线传送", "指令从 PC 直接传到 CIR"], answer: 0, retry: "地址表示去哪里，READ 表示让存储器做什么，返回的内容则通过数据总线传送。", event: "处理器使用 MAR 中的 20，通过地址总线指出位置。CU 通过控制总线发出 READ。存储器通过数据总线把“将 5 加到 ACC 当前保存的数值”传回 MDR。只有 MDR 改变；MAR 仍保存地址 20，存储器中的指令也没有被删除。", state: { pc: "21", mar: "20", mdr: "将 5 加到 ACC 当前保存的数值", cir: "尚未填写", acc: "7", addressBus: "20", dataBus: "将 5 加到 ACC 当前保存的数值 → MDR", controlBus: "READ" } },
      { stage: "fetch", rtLine: 3, question: "指令现在在 MDR 中。它要放到哪里，处理器才能译码？", choices: ["CIR 从 MDR 接收指令", "PC 接收指令", "指令从存储器中删除"], answer: 0, retry: "CIR 是当前指令寄存器，它保存正在译码和执行的指令。", event: "处理器把 MDR 中的指令复制到 CIR。CIR 现在保存着当前指令；MDR 仍显示刚才传送的内容。", state: { pc: "21", mar: "20", mdr: "将 5 加到 ACC 当前保存的数值", cir: "将 5 加到 ACC 当前保存的数值", acc: "7", addressBus: "—", dataBus: "—", controlBus: "—" } },
      { stage: "decode", question: "指令译码时，CU 做什么？", choices: ["它弄清楚指令要求把 5 加到 ACC；此时寄存器数值还没有变化", "它亲自完成加法", "它把指令复制回存储器"], answer: 0, retry: "CU 负责解释指令并协调接下来的工作。真正的算术运算由 ALU 完成。", event: "CU 查看 CIR 中的指令并进行译码：把 5 加到 ACC。它协调接下来的工作。译码只是确定要做什么，此时 ACC 还没有改变。", state: { pc: "21", mar: "20", mdr: "将 5 加到 ACC 当前保存的数值", cir: "将 5 加到 ACC 当前保存的数值", acc: "7", addressBus: "—", dataBus: "—", controlBus: "—" } },
      { stage: "execute", question: "ACC 中的数值是 7。处理器执行“将 5 加到 ACC 当前保存的数值”后会怎样？", choices: ["ALU 计算 7 + 5；ACC 变为 12", "CU 不经计算就把 ACC 改成 5", "PC 回到 20"], answer: 0, retry: "ALU 完成算术运算：把指令中的 5 加到 ACC 当前的 7。", event: "ALU 把 5 加到 ACC 中的 7，得到 12 并存回 ACC。PC 仍是 21，准备指出下一条指令。", state: { pc: "21", mar: "20", mdr: "将 5 加到 ACC 当前保存的数值", cir: "将 5 加到 ACC 当前保存的数值", acc: "12", addressBus: "—", dataBus: "—", controlBus: "—" } },
    ],
  },
} satisfies Record<Language, Copy>;

export type FetchCycleLanguage = Language;
export type FetchCycleCopy = Copy;
