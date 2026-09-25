export const content = {
  en: {
    brand: "The learning workshop",
    series: "COMPUTER SCIENCE · FOUNDATIONS",
    homeTitle: "Big ideas.\nSmall beginnings.",
    homeIntro:
      "A little curiosity, a shared screen, and one idea at a time. Explore how computers work, together.",
    available: "YOUR FIRST EXPLORATION",
    lessonTitle: "Memory, addresses\nand contents",
    lessonIntro:
      "Where is something stored? How do we find it? Start with three simple places and see what changes.",
    enter: "Explore memory",
    homeNote:
      "Made for a learner and a parent. Take your time; talk through what you notice.",
    home: "All explorations",
    bite: "EXPLORATION 01",
    title: "Memory, addresses & contents",
    subtitle: "A place is different from what it holds.",
    next: "Next",
    back: "Back",
    reset: "Start again",
    stage: "Step",
    of: "of",
    address: "Address",
    contents: "Contents",
    selected: "Selected",
    memory: "OUR SMALL MEMORY",
    model:
      "These cells are a simple model of memory: places where values are stored.",
    revealAddress: "Reveal address",
    revealContents: "Reveal contents",
    read: "Read address 11",
    replace: "Replace with 6",
    spoken: "We said our prediction aloud",
    predict: "Make a prediction",
    readout: "Activity readout",
    readoutNote:
      "This display shows what we read. It is part of this activity.",
    choiceHint: "Choose a cell above. Look at its outside label.",
    parent: "For the parent",
    parentIntro: "A conversation, not a test. Pause or revisit any step.",
    guide: [
      [
        "Prepare",
        "Point to an address and a value. Check that your learner recognises the numbers. If helpful, practise with labels A, B and C on paper first.",
      ],
      ["Ask", "“Are we being asked where it is, or what is there?”"],
      [
        "First hint",
        "Point to the two positions: the address outside, the contents inside.",
      ],
      [
        "Second hint",
        "Go back to a single cell and read its address and contents together.",
      ],
      [
        "Check",
        "Try the new example without hints. Then ask why replacing a value did not change its address.",
      ],
      [
        "Review",
        "Next time, draw three new labels and values. Ask one “where” and one “what” question.",
      ],
    ],
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
          "Memory holds values in places. Begin with one place, then uncover its label and what it holds.",
        prompt: "Notice the cell. Reveal its address, then its contents.",
        state: "Look at one memory location.",
        action: "Uncover its label and stored value.",
        change: "What became visible? Did revealing it change what was stored?",
        why: "The address tells us which place. The contents tell us what is stored there.",
      },
      {
        title: "Which place is 11?",
        intro:
          "Now there are three locations. Each has its own address on the outside and contents on the inside.",
        prompt: "Which cell has address 11?",
        state: "Three locations hold three values.",
        action: "Choose the location with address 11.",
        change:
          "Selection changes the highlight. Does it change any stored value?",
        why: "An address identifies a place; choosing it does not replace its contents.",
      },
      {
        title: "What is stored there?",
        intro:
          "We will read address 11. First, predict what the readout will show. You can choose an answer or tell your parent.",
        prompt: "What contents will we read at address 11?",
        state: "Look at address 11 and its stored value.",
        action: "Predict first, then read address 11.",
        change: "What changes in the readout? What stays in memory?",
        why: "Explain why reading a value leaves it in its location.",
      },
      {
        title: "Where is 7 stored?",
        intro:
          "Turn the question around: this time we know the contents and want to find the place.",
        prompt: "Choose the address of the cell containing 7.",
        state: "Find the value 7 inside a cell.",
        action: "Choose the place where it is stored.",
        change:
          "The selection moves; the values remain. Which label identifies that place?",
        why: "A “where” question asks for the address, not the contents.",
      },
      {
        title: "Same place. New contents.",
        intro:
          "We will replace the contents at address 11 with 6. Before trying it, say what you think will change.",
        prompt: "When we replace the contents, what will change?",
        state: "Inspect address 11 before the action.",
        action: "Predict, then replace its contents with 6.",
        change:
          "What changes inside the cell? What happens to its label and neighbours?",
        why: "Explain why changing what is stored does not change where it is stored.",
      },
      {
        title: "A fresh example. Your turn.",
        intro:
          "New addresses, new values, the same ideas. Tell your parent how you know each answer.",
        prompt: "Look closely, then explain.",
        state: "Addresses 20, 21 and 22 hold 8, 3 and 8.",
        action: "Answer one “what”, one “where”, and one comparison question.",
        change:
          "Answering changes your response on screen. The stored values stay the same.",
        why: "Why can different places hold the same value? Why does replacing contents leave the address unchanged?",
      },
    ],
    four: ["Current state", "Action", "Changed & unchanged", "Reason"],
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
      "Address 11 is the outside label; 42 is the contents inside. Choosing changes only the selection.",
    findFeedback:
      "The value 7 is inside the cell labelled address 10. The value and its address answer different questions.",
    readFeedback:
      "The readout shows 42. Reading leaves every stored value unchanged, including 42 at address 11. The address labels stay the same too. Reading retrieves a value without replacing or removing it.",
    writeFeedback:
      "Only the contents at address 11 changed: 42 became 6. Its address is still 11; the other values remain 7 and 9. Reading earlier did not empty the cell. Writing replaces the value at the chosen location, not its address.",
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
  },
  zh: {
    brand: "一起探索计算机",
    series: "计算机科学 · 基础启蒙",
    homeTitle: "从小小一步，\n理解大大世界。",
    homeIntro:
      "带着好奇心，共用一块屏幕，一次理解一个概念。一起探索计算机是怎样工作的。",
    available: "你的第一次探索",
    lessonTitle: "存储器、地址\n与内容",
    lessonIntro:
      "东西存在哪里？怎样找到它？从三个简单的位置开始，观察什么会改变。",
    enter: "探索存储器",
    homeNote: "为孩子和家长一起学习而设计。不用着急，说说你发现了什么。",
    home: "全部探索",
    bite: "探索 01",
    title: "存储器、地址与内容",
    subtitle: "位置与它存放的东西，是两个概念。",
    next: "下一步",
    back: "上一步",
    reset: "重新开始",
    stage: "第",
    of: "步，共",
    address: "地址",
    contents: "内容",
    selected: "已选择",
    memory: "我们的小小存储器",
    model: "这些格子是存储位置的简单模型：每个位置都可以存放一个值。",
    revealAddress: "显示地址",
    revealContents: "显示内容",
    read: "读取地址 11",
    replace: "替换为 6",
    spoken: "我们已经说出了预测",
    predict: "先做一个预测",
    readout: "活动读数",
    readoutNote: "这里显示我们读到的值。这只是本活动的显示区域。",
    choiceHint: "选择上面的一个格子。注意格子外面的标签。",
    parent: "给家长的小卡片",
    parentIntro: "这是一次对话，不是考试。随时可以停下来或回看。",
    guide: [
      [
        "准备",
        "指一指地址和内容，确认孩子认得这些数字。如果需要，可以先在纸上用 A、B、C 作为位置标签练习。",
      ],
      ["提问", "“我们要找的是位置，还是那个位置里的内容？”"],
      ["提示一", "指向两个不同的地方：地址在格子外面，内容在格子里面。"],
      ["提示二", "回到一个格子，一起读出它的地址和内容。"],
      ["检查", "不提供提示，完成新例子。然后问：为什么替换内容不会改变地址？"],
      ["复习", "下次画出三个新的标签和内容，分别问一次“在哪里”和“是什么”。"],
    ],
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
          "存储器把值保存在不同的位置。先看一个位置，再揭开它的标签和内容。",
        prompt: "观察这个格子。先显示地址，再显示内容。",
        state: "看看这一个存储位置。",
        action: "揭开它的标签和存储的值。",
        change: "什么变得可见了？显示内容会改变存储的值吗？",
        why: "地址告诉我们是哪一个位置；内容告诉我们那里存着什么。",
      },
      {
        title: "哪个位置的地址是 11？",
        intro: "现在有三个位置。每个位置外面都有自己的地址，里面有存储的内容。",
        prompt: "哪一个存储位置的地址是 11？",
        state: "三个位置存着三个值。",
        action: "选择地址为 11 的位置。",
        change: "选中标记变了。存储的值改变了吗？",
        why: "地址标识一个位置；选中它并不会替换里面的内容。",
      },
      {
        title: "那里存着什么？",
        intro:
          "我们将读取地址 11。先预测读数会显示什么。可以选择答案，也可以告诉家长。",
        prompt: "读取地址 11，会读到什么内容？",
        state: "观察地址 11 和里面存储的值。",
        action: "先预测，再读取地址 11。",
        change: "读数有什么变化？存储器里什么没有变？",
        why: "解释一下，为什么读取一个值后，它仍然留在原来的位置。",
      },
      {
        title: "7 存在哪里？",
        intro: "把问题反过来：这次我们知道内容，要找到它的位置。",
        prompt: "请选择存着 7 的那个位置的地址。",
        state: "找到格子里面的值 7。",
        action: "选择存着它的位置。",
        change: "选中标记移动了，内容没变。哪个标签标识这个位置？",
        why: "“在哪里”问的是地址，不是内容。",
      },
      {
        title: "位置不变，内容更新。",
        intro:
          "我们要把地址 11 的内容替换为 6。操作之前，先说说你认为什么会改变。",
        prompt: "替换内容时，什么会改变？",
        state: "先观察地址 11 的内容。",
        action: "先预测，再把它的内容替换为 6。",
        change: "格子里面什么变了？它的标签和旁边的格子呢？",
        why: "解释一下，为什么改变存储的内容不会改变它的位置。",
      },
      {
        title: "新例子，你来试试。",
        intro: "新的地址，新的值，相同的道理。告诉家长你是怎样知道答案的。",
        prompt: "仔细观察，然后解释。",
        state: "地址 20、21、22 分别存着 8、3、8。",
        action: "回答一个“是什么”、一个“在哪里”，再比较两个位置。",
        change: "回答改变了屏幕上的答复，存储的值没有变化。",
        why: "为什么不同的位置可以存着相同的值？为什么替换内容不会改变地址？",
      },
    ],
    four: ["当前状态", "进行操作", "变了什么，没变什么", "为什么"],
    writeChoices: ["只有地址 11 的内容", "地址标签", "所有存储的值"],
    freshQuestions: [
      "地址 21 的内容是什么？",
      "3 存在哪个地址？",
      "两个位置可以存着相同的值吗？",
    ],
    duplicateChoices: ["可以——20 和 22", "不可以——每个值都必须不同"],
    positive: "对了。",
    retry: "我们一起再看看。",
    chooseFeedback:
      "11 是格子外面的地址标签；42 是里面的内容。选择只会改变选中标记。",
    findFeedback: "7 在地址为 10 的格子里。内容和地址回答的是不同的问题。",
    readFeedback:
      "读数显示 42。读取不会改变任何存储的值，地址 11 仍然存着 42。所有地址标签也保持不变。读取只是取出一个值供查看，不会替换或移除它。",
    writeFeedback:
      "只有地址 11 的内容变了：42 变成了 6。地址仍然是 11，其他位置的值仍是 7 和 9。之前的读取没有把格子清空。写入替换的是所选位置的值，不是它的地址。",
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
  },
};
export type Language = keyof typeof content;
