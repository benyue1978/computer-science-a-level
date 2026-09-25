export const processorContent = {
  en: {
    title: "Processor & registers",
    subtitle: "Where information is stored while the processor works.",
    bite: "EXPLORATION 02",
    stage: "Section",
    steps: [
      "Two components",
      "Inside the processor",
      "Register contents",
      "A fresh diagram",
    ],
    sections: [
      {
        title: "Two components, two roles.",
        intro:
          "Data is information, such as a number. Main memory stores data and instructions. The processor carries out instructions to process information. An instruction tells the processor what to do. This diagram shows only the parts we are introducing, not every part of a computer.",
        prompt: "Identify both components in the diagram.",
      },
      {
        title: "Look inside the processor.",
        intro:
          "A register is a small, fast storage location inside the processor. It temporarily holds information the processor uses. The processor has other parts too; we will meet them later.",
        prompt: "Where are the registers?",
      },
      {
        title: "A register has contents too.",
        intro:
          "This register currently contains 7. Its label identifies the register; 7 is its contents. The values shown here are already present—we have not copied anything.",
        prompt: "Use the labels and boundaries to answer both questions.",
      },
      {
        title: "Same relationship, new diagram.",
        intro:
          "The layout and values have changed, but the relationship has not: registers are inside the processor, and main memory is separate.",
        prompt: "Answer all four questions, then review the explanation.",
      },
    ],
    home: "All explorations",
    reset: "Start again",
    back: "Previous section",
    next: "Next section",
    tryIt: "TRY IT",
    computer: "Computer",
    processor: "Processor",
    processorNote: "Carries out instructions",
    memory: "Main memory",
    memoryNote: "Stores data and instructions",
    address: "Address",
    contents: "Contents",
    register: "Register",
    registerA: "Register A",
    registerB: "Register B",
    presetNote: "Preset contents—no transfer is being shown",
    recallTitle: "Optional recall from the first exploration",
    recallQuestion: "What are the contents at address 11?",
    revisit: "Revisit memory",
    lookInside: "Look inside the processor",
    revealNote:
      "The diagram now shows more detail. Nothing has moved or been executed.",
    positive: "Yes. ",
    retry: "Look at the labels and boundaries again. ",
    componentQuestions: [
      "Which component carries out instructions?",
      "Which component is main memory?",
    ],
    componentChoices: ["Processor", "Main memory"],
    componentFeedback: [
      "The processor carries out instructions.",
      "Main memory stores data and instructions outside the processor boundary.",
    ],
    locationQuestion:
      "Are registers inside the processor or in the separate main-memory area?",
    locationChoices: ["Inside the processor", "In main memory"],
    locationFeedback:
      "Registers are storage locations inside the processor. Main memory is a separate component.",
    registerQuestions: [
      "What are the contents of Register A?",
      "Which storage location is inside the processor?",
    ],
    registerChoices: [
      ["7", "A", "42"],
      ["Register A", "Main memory address 11"],
    ],
    registerFeedback: [
      "Register A is the label; 7 is its current contents.",
      "Register A is inside the processor. Address 11 belongs to main memory.",
    ],
    freshQuestions: [
      "Which shown location is a register?",
      "Where is that register?",
      "What does the processor do?",
      "What does main memory do?",
    ],
    freshChoices: [
      ["Register B", "Address 21"],
      ["Inside the processor", "In main memory"],
      ["Carries out instructions", "Stores every value"],
      ["Stores data and instructions", "Carries out instructions"],
    ],
    freshFeedback: [
      "Register B is enclosed by the processor boundary.",
      "A register is a storage location inside the processor.",
      "The processor carries out instructions.",
      "Main memory stores data and instructions. Registers also store information, but they are inside the processor.",
    ],
    finish:
      "Both can store information; their locations and roles are different.",
    finishText:
      "Main memory stores data and instructions. Registers temporarily hold information inside the processor. The processor carries out instructions.",
  },
  zh: {
    title: "处理器与寄存器",
    subtitle: "处理器工作时，信息暂时存在哪里？",
    bite: "探索 02",
    stage: "小节",
    steps: ["两个组成部分", "处理器内部", "寄存器的内容", "换一幅图"],
    sections: [
      {
        title: "两个组成部分，两种作用。",
        intro:
          "数据就是信息，例如一个数字。主存储器保存数据和指令。处理器执行指令，处理信息。指令就是告诉处理器要做什么。这幅图只显示现在要认识的组成部分，并没有画出计算机的所有部分。",
        prompt: "请在图中认出这两个组成部分。",
      },
      {
        title: "看看处理器内部。",
        intro:
          "寄存器是处理器内部容量小、速度快的存储位置，用来暂时保存处理器使用的信息。处理器还有其他组成部分，我们以后再认识。",
        prompt: "寄存器在哪里？",
      },
      {
        title: "寄存器也有内容。",
        intro:
          "这个寄存器现在存着 7。标签用来标识寄存器，7 是它的内容。图中的值原本就在那里，没有发生复制。",
        prompt: "根据标签和边界回答两个问题。",
      },
      {
        title: "关系不变，换一幅图。",
        intro:
          "布局和数值变了，关系没有变：寄存器在处理器内部，主存储器是另一个组成部分。",
        prompt: "回答全部四个问题，再查看解释。",
      },
    ],
    home: "全部探索",
    reset: "重新开始",
    back: "上一小节",
    next: "下一小节",
    tryIt: "试一试",
    computer: "计算机",
    processor: "处理器",
    processorNote: "执行指令",
    memory: "主存储器",
    memoryNote: "保存数据和指令",
    address: "地址",
    contents: "内容",
    register: "寄存器",
    registerA: "寄存器 A",
    registerB: "寄存器 B",
    presetNote: "预设内容——图中没有发生传送",
    recallTitle: "可选：回忆第一次探索",
    recallQuestion: "地址 11 的内容是什么？",
    revisit: "回顾存储器",
    lookInside: "看看处理器内部",
    revealNote: "示意图现在显示了更多细节，没有数值移动，也没有执行指令。",
    positive: "答对了。",
    retry: "再看看标签和边界。",
    componentQuestions: ["哪个组成部分执行指令？", "哪个组成部分是主存储器？"],
    componentChoices: ["处理器", "主存储器"],
    componentFeedback: [
      "处理器执行指令。",
      "主存储器在处理器边界之外，保存数据和指令。",
    ],
    locationQuestion: "寄存器在处理器内部，还是在旁边的主存储器区域？",
    locationChoices: ["处理器内部", "主存储器中"],
    locationFeedback:
      "寄存器是处理器内部的存储位置。主存储器是另一个组成部分。",
    registerQuestions: [
      "寄存器 A 的内容是什么？",
      "哪个存储位置在处理器内部？",
    ],
    registerChoices: [
      ["7", "A", "42"],
      ["寄存器 A", "主存储器地址 11"],
    ],
    registerFeedback: [
      "寄存器 A 是标签，7 是它现在存储的内容。",
      "寄存器 A 在处理器内部；地址 11 属于主存储器。",
    ],
    freshQuestions: [
      "图中哪个位置是寄存器？",
      "这个寄存器在哪里？",
      "处理器有什么作用？",
      "主存储器有什么作用？",
    ],
    freshChoices: [
      ["寄存器 B", "地址 21"],
      ["处理器内部", "主存储器中"],
      ["执行指令", "保存所有数值"],
      ["保存数据和指令", "执行指令"],
    ],
    freshFeedback: [
      "寄存器 B 位于处理器边界之内。",
      "寄存器是处理器内部的存储位置。",
      "处理器执行指令。",
      "主存储器保存数据和指令。寄存器也能存储信息，但它位于处理器内部。",
    ],
    finish: "两者都能存储信息，但位置和作用不同。",
    finishText:
      "主存储器保存数据和指令。寄存器在处理器内部暂时保存信息。处理器执行指令。",
  },
} as const;

export type ProcessorLanguage = keyof typeof processorContent;
