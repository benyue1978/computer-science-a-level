export const content = {
  en: {
    brand: "The learning workshop",
    series: "COMPUTER SCIENCE · FOUNDATIONS",
    homeTitle: "Big ideas.\nSmall beginnings.",
    homeIntro: "Explore how computers work, one idea at a time.",
    available: "YOUR FIRST EXPLORATION",
    lessonTitle: "Memory, addresses\nand contents",
    lessonIntro:
      "Where is something stored? How do we find it? Start with three simple places and see what changes.",
    enter: "Explore memory",
    homeNote:
      "Take your time. Explore an example, try a question, and explain what you notice.",
    home: "All explorations",
    bite: "EXPLORATION 01",
    title: "Memory, addresses & contents",
    subtitle: "A place is different from what it holds.",
    next: "Next section",
    back: "Previous section",
    reset: "Start again",
    stage: "Section",
    address: "Address",
    contents: "Contents",
    selected: "Selected",
    memory: "MEMORY MODEL",
    model:
      "These cells are a simple model of memory: places where values are stored.",
    revealAddress: "Reveal address",
    revealContents: "Reveal contents",
    read: "Show reading",
    replace: "Show writing",
    spoken: "I have made my prediction",
    predict: "Choose an answer, or think of one before viewing the example.",
    readout: "Value read",
    readoutNote: "The example displays the value read from address 11.",
    choiceHint: "Choose a cell above. Look at its outside label.",
    steps: [
      "Meet a location",
      "Choose an address",
      "Read the contents",
      "Find the location",
      "Change the contents",
      "Try a new example",
    ],
    stages: [
      {
        title: "One place. Two ideas.",
        intro:
          "Memory stores values in locations. Each location has an address to identify it, and contents stored there.",
        prompt: "Reveal the address label, then reveal the contents.",
      },
      {
        title: "Which place is 11?",
        intro:
          "Each memory location has its own address. In this diagram, addresses are outside the cells and contents are inside.",
        prompt: "Select the cell with address 11.",
      },
      {
        title: "What is stored there?",
        intro:
          "Reading memory means retrieving the contents at a specified address. This example will read from address 11.",
        prompt: "What value will reading address 11 return?",
      },
      {
        title: "Where is 7 stored?",
        intro:
          "An address answers “where?”. Contents answer “what is stored there?”. The same diagram can answer both questions.",
        prompt: "Select the address where 7 is stored.",
      },
      {
        title: "Same place. New contents.",
        intro:
          "Writing to memory means storing a value at a specified address. This example will write 6 to address 11.",
        prompt: "What will change when 6 is written to address 11?",
      },
      {
        title: "A fresh example. Your turn.",
        intro:
          "Here are three different locations. Use their address labels and contents to answer the questions.",
        prompt:
          "Choose an answer to each question, then explain your reasoning.",
      },
    ],
    writeChoices: [
      "Only the contents at 11",
      "The address label",
      "Every stored value",
    ],
    freshQuestions: [
      "What are the contents at address 21?",
      "At which address is 3 stored?",
      "Can two locations hold the same value?",
    ],
    duplicateChoices: ["Yes — 20 and 22", "No — each value must be different"],
    positive: "Yes. ",
    retry: "Let’s look together. ",
    chooseFeedback:
      "11 is the address on the outside. 42 is the contents stored at that address.",
    findFeedback:
      "The value 7 is inside the cell labelled address 10. The value and its address answer different questions.",
    readFeedback:
      "Reading address 11 gives 42. Reading retrieves a value without replacing or removing it: address 11 still holds 42, and the other stored values are unchanged.",
    writeFeedback:
      "Writing 6 to address 11 replaces 42 with 6. The address is still 11, and the other locations still hold 7 and 9. Writing changes the contents at the specified address, not the address itself.",
    freshFeedback: [
      "Address 21 contains 3. We were asked what is stored there.",
      "3 is stored at address 21. We were asked where it is.",
      "Yes. Addresses 20 and 22 both contain 8. Different locations can store the same value.",
    ],
    end: "No rush to move on.",
    endText:
      "Explain why a value can change while its address stays the same. Revisit any step whenever you want.",
    unknown: "This page is not in the workshop.",
    backHome: "Back to home",
    tryIt: "TRY IT",
    locationExplanation:
      "The address identifies the location. The contents are the value stored there.",
  },
  zh: {
    brand: "一起探索计算机",
    series: "计算机科学 · 基础启蒙",
    homeTitle: "从小小一步，\n理解大大世界。",
    homeIntro: "一次理解一个概念，逐步探索计算机是怎样工作的。",
    available: "你的第一次探索",
    lessonTitle: "存储器、地址\n与内容",
    lessonIntro:
      "东西存在哪里？怎样找到它？从三个简单的位置开始，观察什么会改变。",
    enter: "探索存储器",
    homeNote: "不用着急。看看例子，试着回答，再说说你理解了什么。",
    home: "全部探索",
    bite: "探索 01",
    title: "存储器、地址与内容",
    subtitle: "位置与它存放的东西，是两个概念。",
    next: "下一小节",
    back: "上一小节",
    reset: "重新开始",
    stage: "小节",
    address: "地址",
    contents: "内容",
    selected: "已选择",
    memory: "存储器示意图",
    model: "这些格子是存储位置的简单模型：每个位置都可以存放一个值。",
    revealAddress: "显示地址",
    revealContents: "显示内容",
    read: "演示读取",
    replace: "演示写入",
    spoken: "我已想好答案",
    predict: "先选择一个答案，或自己想好，再观看示例。",
    readout: "读出的值",
    readoutNote: "这里展示从地址 11 读取到的值。",
    choiceHint: "选择上面的一个格子。注意格子外面的标签。",
    steps: [
      "认识位置",
      "选择地址",
      "读取内容",
      "找到位置",
      "改变内容",
      "试试新例子",
    ],
    stages: [
      {
        title: "一个位置，两个概念。",
        intro:
          "存储器在不同的位置保存值。每个位置有标识它的地址，也有存放在那里的内容。",
        prompt:
          "先点“显示地址”，看看位置的标签；再点“显示内容”，看看里面存着什么。",
      },
      {
        title: "哪个位置的地址是 11？",
        intro:
          "每个存储位置都有自己的地址。在这幅图中，地址标在格子外面，内容显示在格子里面。",
        prompt: "请选择地址为 11 的格子。",
      },
      {
        title: "那里存着什么？",
        intro:
          "读取存储器，就是获得指定地址所存储的内容。这个示例将从地址 11 读取一个值。",
        prompt: "从地址 11 读取，会得到什么值？",
      },
      {
        title: "7 存在哪里？",
        intro:
          "地址回答“在哪里”，内容回答“那里存着什么”。同一幅图可以回答这两种问题。",
        prompt: "请选择存着 7 的那个位置的地址。",
      },
      {
        title: "位置不变，内容更新。",
        intro:
          "写入存储器，就是把一个值存到指定的地址。这个示例将向地址 11 写入 6。",
        prompt: "向地址 11 写入 6，什么会改变？",
      },
      {
        title: "新例子，你来试试。",
        intro:
          "这里是另外三个存储位置。根据它们的地址标签和内容，回答下面的问题。",
        prompt: "为每个问题选择一个答案，再说说理由。",
      },
    ],
    writeChoices: ["只有地址 11 的内容", "地址标签", "所有存储的值"],
    freshQuestions: [
      "地址 21 的内容是什么？",
      "3 存在哪个地址？",
      "两个位置可以存着相同的值吗？",
    ],
    duplicateChoices: ["可以——20 和 22", "不可以——每个值都必须不同"],
    positive: "对了。",
    retry: "我们一起再看看。",
    chooseFeedback: "格子外面的 11 是地址，里面的 42 是这个地址存储的内容。",
    findFeedback: "7 在地址为 10 的格子里。内容和地址回答的是不同的问题。",
    readFeedback:
      "读取地址 11 得到的值是 42。读取获得这个位置存储的值，不会替换或移除它：地址 11 仍然存着 42，其他位置的内容也没有变化。",
    writeFeedback:
      "向地址 11 写入 6，原来的内容 42 就被替换为 6。地址仍然是 11，其他位置仍然存着 7 和 9。写入改变的是指定地址的内容，不是地址本身。",
    freshFeedback: [
      "地址 21 的内容是 3。问题问的是那里存着什么。",
      "3 存在地址 21。问题问的是它在哪里。",
      "可以。地址 20 和 22 都存着 8。不同的位置可以存储相同的值。",
    ],
    end: "不用急着往前走。",
    endText:
      "解释一下，为什么内容可以改变，地址却保持不变。随时可以回到任何一步。",
    unknown: "工作坊里还没有这个页面。",
    backHome: "返回首页",
    tryIt: "试一试",
    locationExplanation: "地址告诉我们是哪一个位置；内容告诉我们那里存着什么。",
  },
};
export type Language = keyof typeof content;
