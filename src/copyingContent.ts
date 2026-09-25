export type CopyingLanguage = "en" | "zh";

export const copyingContent = {
  en: {
    title: "Copying values",
    subtitle: "One value stays; another location receives its copy.",
    bite: "EXPLORATION 03",
    stage: "Section",
    steps: ["Source and destination", "Register copy", "Memory copy", "Apply the rule"],
    sections: [
      {
        title: "Where does a copy come from—and where does it go?",
        intro:
          "The source is where the value comes from. The destination is where the copy goes. Copying keeps the source and replaces the destination’s old contents.",
      },
      {
        title: "Copy from A to B.",
        intro:
          "Register A contains 7 and Register B contains 42. Predict both contents after the copy, then reveal the result.",
      },
      {
        title: "Copy from memory into a register.",
        intro:
          "Copy the contents at address 11 into Register A. Address 11 identifies the source location; 42 is the value copied.",
      },
      {
        title: "Apply the same rule twice.",
        intro:
          "The locations change, but the copy rule stays the same. Make every prediction before revealing either result.",
      },
    ],
    home: "All explorations",
    reset: "Start again",
    back: "Previous section",
    next: "Next section",
    finish: "All explorations",
    tryIt: "TRY IT",
    computer: "Computer",
    processor: "Processor",
    mainMemory: "Main memory",
    registerA: "Register A",
    registerB: "Register B",
    source: "Source",
    destination: "Destination",
    copyCue: "Copy from Register A to Register B",
    sourceQuestion: "Which is the source?",
    destinationQuestion: "Which is the destination?",
    sourceFeedback: "Register A is the source because its value is read.",
    destinationFeedback: "Register B is the destination because its old contents will be replaced.",
    recallTitle: "Optional register recall",
    recallQuestion: "What are the contents of Register A?",
    revisitProcessors: "Revisit processors",
    registerChoices: ["Register A", "Register B"],
    positive: "Yes. ",
    review: "Use the labels in the diagram. ",
    before: "Before",
    after: "After",
    current: "Current result",
    prediction: "Make a prediction",
    spoken: "I have made my prediction",
    showCopy: "Show copy",
    showBothCopies: "Show both copies",
    copyValue: "Copy value",
    address: "Address",
    contents: "Contents",
    physicalRoute:
      "This diagram shows the result, not the physical route. The next exploration introduces buses.",
    memoryRecallTitle: "Optional address and contents check",
    memoryRecallQuestion: "What are the contents at address 11?",
    memoryRecallCorrection:
      "11 is the address label; 42 is its contents. The copy reads the contents, not the address label.",
    memoryRecallRetry: "Look again: the contents are the number stored inside the memory cell.",
    revisitMemory: "Revisit memory",
    registerSourcePrediction: "What will Register A contain after the copy?",
    registerDestinationPrediction: "What will Register B contain after the copy?",
    registerResult:
      "Register A stays 7 because it is the source. Register B changes from 42 to 7 because it is the destination. The source value is read and the destination’s old contents are replaced.",
    memorySourcePrediction: "What will address 11 contain after the copy?",
    memoryDestinationPrediction: "What will Register A contain after the copy?",
    memoryResult:
      "Address 11 still contains 42 because memory is the source. Register A changes from 7 to 42 because it is the destination. The address label, source contents and other memory cells stay unchanged.",
    example1: "Example 1",
    example2: "Example 2",
    freshQuestions: [
      "which location is the source?",
      "which location is the destination?",
      "what is the source’s final value?",
      "what is the destination’s final value?",
    ],
    freshResult1:
      "Register B stays 3 because it is the source. Register A changes from 9 to 3 because it is the destination.",
    freshResult2:
      "Address 21 stays 4 because memory is the source. Register B changes from 8 to 4 because it is the destination. Different locations use the same copy rule: preserve the source and replace the destination.",
  },
  zh: {
    title: "复制数值",
    subtitle: "一个位置保留原值，另一个位置接收它的副本。",
    bite: "探索 03",
    stage: "小节",
    steps: ["来源与目标", "寄存器之间复制", "从内存复制", "应用同一规则"],
    sections: [
      {
        title: "副本从哪里来，又到哪里去？",
        intro:
          "来源是数值来自的位置；目标是副本到达的位置。复制不会清空来源，但会替换目标原来的内容。",
      },
      {
        title: "从 A 复制到 B。",
        intro:
          "寄存器 A 的内容是 7，寄存器 B 的内容是 42。先预测复制后两者的内容，再查看结果。",
      },
      {
        title: "从内存复制到寄存器。",
        intro:
          "把地址 11 的内容复制到寄存器 A。地址 11 指明来源位置；被复制的数值是 42。",
      },
      {
        title: "把同一规则应用两次。",
        intro:
          "位置不同，复制规则不变。先完成全部预测，再一起查看两个结果。",
      },
    ],
    home: "全部探索",
    reset: "重新开始",
    back: "上一小节",
    next: "下一小节",
    finish: "全部探索",
    tryIt: "试一试",
    computer: "计算机",
    processor: "处理器",
    mainMemory: "主存储器",
    registerA: "寄存器 A",
    registerB: "寄存器 B",
    source: "来源",
    destination: "目标",
    copyCue: "从寄存器 A 复制到寄存器 B",
    sourceQuestion: "哪一个是来源？",
    destinationQuestion: "哪一个是目标？",
    sourceFeedback: "寄存器 A 是来源，因为要读取它的数值。",
    destinationFeedback: "寄存器 B 是目标，因为它原来的内容将被替换。",
    recallTitle: "可选：回忆寄存器",
    recallQuestion: "寄存器 A 的内容是什么？",
    revisitProcessors: "回顾处理器",
    registerChoices: ["寄存器 A", "寄存器 B"],
    positive: "对。",
    review: "请看图中的标签。",
    before: "复制前",
    after: "复制后",
    current: "当前结果",
    prediction: "先作预测",
    spoken: "我已经作出预测",
    showCopy: "显示复制结果",
    showBothCopies: "显示两个复制结果",
    copyValue: "复制数值",
    address: "地址",
    contents: "内容",
    physicalRoute: "这幅图展示复制结果，不表示实际传送路径。下一次探索会介绍总线。",
    memoryRecallTitle: "可选：检查地址和内容",
    memoryRecallQuestion: "地址 11 的内容是什么？",
    memoryRecallCorrection:
      "11 是地址标签；42 才是其中的内容。复制时读取的是内容，而不是地址标签。",
    memoryRecallRetry: "再看一看：内容是存储在内存单元里面的数值。",
    revisitMemory: "回顾内存",
    registerSourcePrediction: "复制后，寄存器 A 的内容是什么？",
    registerDestinationPrediction: "复制后，寄存器 B 的内容是什么？",
    registerResult:
      "寄存器 A 是来源，所以仍然是 7。寄存器 B 是目标，所以从 42 变为 7。读取来源的数值，并用它替换目标原来的内容。",
    memorySourcePrediction: "复制后，地址 11 的内容是什么？",
    memoryDestinationPrediction: "复制后，寄存器 A 的内容是什么？",
    memoryResult:
      "内存是来源，所以地址 11 的内容仍然是 42。寄存器 A 是目标，所以从 7 变为 42。地址标签、来源内容和其他内存单元都不变。",
    example1: "例子 1",
    example2: "例子 2",
    freshQuestions: [
      "哪个位置是来源？",
      "哪个位置是目标？",
      "来源最后的数值是什么？",
      "目标最后的数值是什么？",
    ],
    freshResult1: "寄存器 B 是来源，所以仍然是 3。寄存器 A 是目标，所以从 9 变为 3。",
    freshResult2:
      "内存是来源，所以地址 21 仍然是 4。寄存器 B 是目标，所以从 8 变为 4。位置不同，复制规则相同：保留来源，替换目标。",
  },
} as const;
