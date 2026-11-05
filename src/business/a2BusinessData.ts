import unit6 from "./data/unit6";
import unit7 from "./data/unit7";
import unit8 from "./data/unit8";
import unit9 from "./data/unit9";
import unit10 from "./data/unit10";
import type { BusinessTerm, BusinessUnitInfo, SyllabusSection } from "./businessTypes";

export const a2BusinessUnits: BusinessUnitInfo[] = [
  { id: 6, titleEn: "Business and its environment", titleZh: "企业与商业环境" },
  { id: 7, titleEn: "Human resource management", titleZh: "人力资源管理" },
  { id: 8, titleEn: "Marketing", titleZh: "市场营销" },
  { id: 9, titleEn: "Operations management", titleZh: "运营管理" },
  { id: 10, titleEn: "Finance and accounting", titleZh: "财务与会计" },
];

const sections = [
  ["5.1.1", 5, "The need for business finance", "企业的融资需求"],
  ["5.4.1", 5, "Cost information", "成本信息"],
  ["5.4.2", 5, "Full and contribution costing", "完全成本法与边际贡献成本法"],
  ["5.4.3", 5, "Using cost information", "成本信息的应用"],
  ["5.4.4", 5, "Break-even analysis", "盈亏平衡分析"],
  ["5.5.1", 5, "The meaning and purpose of budgets", "预算的含义与目的"],
  ["5.5.2", 5, "Variances", "预算差异"],
  ["6.1.1", 6, "Political and legal", "政治与法律因素"],
  ["6.1.2", 6, "Economic", "经济因素"],
  ["6.1.3", 6, "Social and demographic", "社会与人口因素"],
  ["6.1.4", 6, "Technological", "技术因素"],
  ["6.1.5", 6, "Competitors and suppliers", "竞争者与供应商"],
  ["6.1.6", 6, "International", "国际因素"],
  ["6.1.7", 6, "Environmental", "环境因素"],
  ["6.2.1", 6, "Developing business strategy", "制定企业战略"],
  ["6.2.2", 6, "Corporate planning and implementation", "企业规划与执行"],
  ["7.1.1", 7, "The relationship between business objectives and organisational structure", "企业目标与组织结构的关系"],
  ["7.1.2", 7, "Types of structure: functional, hierarchical (flat and narrow), matrix", "组织结构类型：职能型、层级型（扁平或狭长）与矩阵型"],
  ["7.1.3", 7, "Delegation and accountability", "授权与问责"],
  ["7.1.4", 7, "Control, authority and trust", "控制、权力与信任"],
  ["7.1.5", 7, "Centralisation and decentralisation", "集权与分权"],
  ["7.1.6", 7, "Line and staff", "直线职能与参谋职能"],
  ["7.2.1", 7, "Purposes of communication", "沟通的目的"],
  ["7.2.2", 7, "Methods of communication", "沟通方式"],
  ["7.2.3", 7, "Channels of communication", "沟通渠道"],
  ["7.2.4", 7, "Barriers to communication", "沟通障碍"],
  ["7.2.5", 7, "The role of management in facilitating communication", "管理层在促进沟通中的作用"],
  ["7.3.1", 7, "Leadership", "领导力"],
  ["7.3.2", 7, "Theories of leadership", "领导理论"],
  ["7.3.3", 7, "Emotional intelligence / emotional quotient (EQ)", "情绪智力／情商"],
  ["7.4.1", 7, "Approaches to human resource management (HRM)", "人力资源管理方法"],
  ["8.1.1", 8, "Elasticity", "需求弹性"],
  ["8.1.2", 8, "Product development", "产品开发"],
  ["8.1.3", 8, "Sales forecasting", "销售预测"],
  ["8.2.1", 8, "Planning the marketing strategy", "营销战略规划"],
  ["8.2.2", 8, "Approaches to marketing strategy", "营销战略方法"],
  ["8.2.3", 8, "Strategies for international marketing", "国际营销战略"],
  ["9.1.1", 9, "Location", "选址"],
  ["9.1.2", 9, "Scale of operations", "运营规模"],
  ["9.2.1", 9, "Quality control and quality assurance", "质量控制与质量保证"],
  ["9.2.2", 9, "Benchmarking", "基准分析"],
  ["9.3.1", 9, "Operational decisions", "运营决策"],
  ["9.3.2", 9, "Flexibility and innovation", "灵活性与创新"],
  ["9.3.3", 9, "Enterprise resource planning (ERP)", "企业资源计划"],
  ["9.3.4", 9, "Lean production", "精益生产"],
  ["9.3.5", 9, "Operations planning", "运营规划"],
  ["10.1.1", 10, "Statement of profit or loss", "损益表"],
  ["10.1.2", 10, "Statement of financial position", "财务状况表"],
  ["10.1.3", 10, "Inventory valuation", "存货估值"],
  ["10.1.4", 10, "Depreciation", "折旧"],
  ["10.2.1", 10, "Liquidity ratios", "流动性比率"],
  ["10.2.2", 10, "Profitability ratios", "盈利能力比率"],
  ["10.2.3", 10, "Financial efficiency ratios", "财务效率比率"],
  ["10.2.4", 10, "Gearing ratio", "杠杆比率"],
  ["10.2.5", 10, "Investment ratios", "投资比率"],
  ["10.3.1", 10, "The concept of investment appraisal", "投资评估的概念"],
  ["10.3.2", 10, "Basic methods: payback and accounting rate of return (ARR)", "基本方法：回收期与会计收益率"],
  ["10.3.3", 10, "Discounted cash flow method: net present value (NPV)", "贴现现金流法：净现值"],
  ["10.3.4", 10, "Investment appraisal decisions", "投资评估决策"],
  ["10.4.1", 10, "The use of accounting data to enable strategic decision-making", "利用会计数据进行战略决策"],
  ["10.4.2", 10, "The use of accounting data and ratio analysis in strategic decision-making", "利用会计数据与比率分析进行战略决策"],
] as const;

export const a2SyllabusSections: Record<string, SyllabusSection> = Object.fromEntries(
  sections.map(([id, unit, titleEn, titleZh]) => [id, { id, unit, titleEn, titleZh }]),
);

export const a2BusinessTerms: BusinessTerm[] = [
  ...unit6,
  ...unit7,
  ...unit8,
  ...unit9,
  ...unit10,
];
