import type { BusinessTerm } from "../businessTypes";

type Seed = [
  topicId: string,
  sourceRefs: number[],
  term: string,
  termZh: string,
  definitionEn: string,
  explanationZh: string,
  exampleEn: string,
  exampleZh: string,
  relatedTopicIds?: string[],
];

const rows: Seed[] = [
  ["8.1.1", [46, 85], "Income elasticity of demand", "需求收入弹性", "A measure of how responsive demand for a product is to a change in consumer income; it is calculated as percentage change in demand divided by percentage change in income.", "需求收入弹性衡量消费者收入变化时产品需求量的反应程度，计算时用需求量的百分比变化除以收入的百分比变化，可帮助企业判断景气变化对产品销量的影响。", "Income elasticity of demand is high for our premium luggage range, so the sales team is cautious about expanding stock while household incomes are under pressure.", "我们的高端行李箱系列需求收入弹性较高，因此在家庭收入承压时，销售团队对扩大库存保持谨慎。", ["6.1.2"]],
  ["8.2.1", [84], "Marketing plan", "营销计划", "A researched written plan setting out marketing objectives and the strategies intended to achieve them.", "营销计划以调研为基础，写明营销目标及实现目标的策略，通常还需要协调市场分析、资源与营销组合。", "The marketing plan sets a target for repeat bookings and assigns the hotel app, email offers and local partnerships to different customer groups.", "营销计划为回头客预订设定了目标，并为不同顾客群安排酒店应用程序、电子邮件优惠和本地合作活动。"],
  ["8.1.1", [86], "Promotional elasticity of demand", "需求促销弹性", "A measure of how responsive demand is to a change in promotional spending; it is percentage change in demand divided by percentage change in promotion expenditure.", "需求促销弹性衡量促销支出变化对需求的影响程度，企业可据此评估促销是否带来足够的销量变化，同时考虑时间和竞争因素。", "Promotional elasticity of demand was low for the winter campaign, so the retailer shifted part of its budget from broad discounts to targeted demonstrations.", "冬季促销的需求促销弹性较低，因此零售商把部分预算从普遍折扣转向定向产品演示。"],
  ["8.1.1", [87], "Cross elasticity of demand", "需求交叉弹性", "A measure of how responsive demand for one product is to a change in the price of another product.", "需求交叉弹性衡量一种产品的需求对另一种产品价格变化的反应，可帮助企业判断两种产品是替代品还是互补品。", "Cross elasticity of demand turned positive when a rival raised its printer prices, so our distributor increased orders for compatible models.", "竞争对手提高打印机价格后，需求交叉弹性转为正值，因此我们的分销商增加了兼容型号的订单。"],
  ["8.1.2", [88], "New product development (NPD)", "新产品开发", "The process of designing, creating and marketing new goods or services.", "新产品开发涵盖新商品或服务从构思、设计到上市营销的过程；企业需要验证顾客需求、技术可行性和投入回报。", "New product development brought engineering and customer support together to test whether the portable scanner could survive daily use in busy clinics.", "新产品开发让工程和客户支持团队共同测试这款便携式扫描仪能否经受诊所的日常繁忙使用。"],
  ["8.1.2", [89], "Test marketing", "试销", "Launching a product in a limited market to assess consumer reactions before a wider launch.", "试销是在较小范围内推出产品，观察消费者反应并发现问题，再决定是否扩大上市；试销市场应尽量接近目标顾客。", "Test marketing in three city stores showed that customers preferred refill packs, so the manufacturer changed the launch mix before national distribution.", "在三家城市门店试销后发现顾客更喜欢补充装，因此制造商在全国铺货前调整了上市产品组合。"],
  ["8.1.2", [90], "Research and development (R&D)", "研究与开发", "Scientific research and technical development undertaken to create or improve products and processes.", "研究与开发通过科学研究和技术开发创造或改进产品、流程；投入可能带来创新，但成果、时间和商业回报都有不确定性。", "Research and development (R&D) improved the battery life of our handheld scanner, although the team still needs to test performance in cold warehouses.", "研究与开发改善了手持扫描仪的电池续航，不过团队仍需测试它在冷藏仓库中的表现。"],
  ["8.1.3", [91], "Sales forecasting", "销售预测", "The prediction of future sales levels and trends.", "销售预测估计未来销量及趋势，帮助企业安排生产、库存、现金和人员；预测结果取决于数据和假设，应定期更新。", "Sales forecasting points to a busy August, so the wholesaler is reserving temporary warehouse space before seasonal orders arrive.", "销售预测显示八月将进入旺季，因此批发商正在旺季订单到来前预留临时仓库空间。"],
  ["8.1.3", [92], "Sales-force composite", "销售人员综合预测法", "A forecasting method that combines individual sales representatives' predictions of future sales.", "销售人员综合预测法把各销售代表对未来销量的估计汇总起来；一线人员掌握客户信息，但估计可能受个人偏差或销售目标影响。", "The sales-force composite came in below the finance forecast, so managers asked representatives to explain which delayed contracts were driving the gap.", "销售人员综合预测低于财务部门的预测，因此经理要求代表说明哪些延迟签约导致了差距。"],
  ["8.1.3", [93], "Delphi method", "德尔菲法", "A long-range qualitative forecasting technique that gathers forecasts from a panel of experts.", "德尔菲法通过专家小组提供多轮意见来进行长期定性预测，适合缺少可靠历史数据的议题，但需要时间并谨慎选择专家。", "The Delphi method helped the airline estimate demand for regional electric aircraft, where past ticket sales offered little guidance.", "由于过去的机票销量难以提供参考，航空公司采用德尔菲法估计区域电动飞机的需求。"],
  ["8.1.3", [94], "Jury of experts", "专家评议法", "A forecasting approach in which specialists within a business use their knowledge to estimate future outcomes.", "专家评议法由企业内部专业人士凭经验共同作出预测，决策较快，但结果可能受到权威影响或共同假设的限制。", "A jury of experts from sales, finance and operations estimated the first-year demand for the new maintenance contract before pricing was finalised.", "在确定价格之前，来自销售、财务和运营部门的专家组成专家评议小组，估算这项新维护合同第一年的需求。"],
  ["8.1.3", [95], "The trend", "趋势", "The underlying long-term direction of movement in a time series, after short-term variations are considered.", "时间序列的趋势反映数据长期的上升、下降或稳定方向；分析趋势时要区分季节波动和偶发变化。", "The trend in online renewals has risen for three quarters, so the insurer is moving more service staff to the digital team.", "线上续订的趋势已连续三个季度上升，因此保险公司正把更多客服人员调到数字业务团队。"],
  ["8.1.3", [96], "Seasonal fluctuations", "季节性波动", "Regular and repeated changes in sales within a period of twelve months.", "季节性波动是在一年内按规律重复出现的销量变化，企业可据此安排库存、员工班次和促销时点。", "Seasonal fluctuations raise demand for replacement air filters before the dry season, so the distributor places its largest order in February.", "旱季前更换空气滤网的需求出现季节性波动，因此分销商把最大一批订单安排在二月。"],
  ["8.1.3", [97], "Cyclical fluctuations", "周期性波动", "Sales variations over periods longer than a year that are associated with the business cycle.", "周期性波动通常跨越一年以上，与经济周期有关；企业可观察宏观需求变化，但难以准确判断每次转折的时间。", "Cyclical fluctuations in construction demand have reduced crane bookings for two years, so the rental firm is delaying its next fleet purchase.", "建筑需求的周期性波动已使起重机预订连续两年下降，因此租赁公司推迟了下一批车队采购。"],
  ["8.1.3", [98], "Random fluctuations", "随机波动", "Unpredictable changes in sales that may occur at any time because of unusual events.", "随机波动由难以预测的偶发事件造成，例如恶劣天气或产品事故后的负面舆情；企业通常通过情境预案应对，而非从中推断稳定规律。", "Random fluctuations followed the celebrity review, so the cosmetics team separated the one-week sales spike from its longer-term forecast.", "名人评论后出现随机波动，因此化妆品团队没有把这一周的销量激增纳入长期预测趋势。"],
  ["8.2.3", [104], "International marketing", "国际营销", "Selling a business's products in markets outside its original domestic market.", "国际营销是进入本国市场之外销售产品，企业需要选择目标市场与进入方式，并适应当地顾客、法规和竞争条件。", "International marketing will take the firm's repair subscription into Thailand, but the team is checking local service expectations before setting the launch price.", "国际营销将把公司的维修订阅服务带到泰国，但团队正在确定当地服务预期后才设定上市价格。"],
  ["8.2.3", [105], "BRICS", "金砖国家（BRICS）", "An acronym originally formed from Brazil, Russia, India, China and South Africa, referring to a group of major emerging economies.", "BRICS是由巴西、俄罗斯、印度、中国和南非的英文名称首字母组成的缩写，常用于讨论这些大型新兴经济体所代表的市场机会。", "The strategy team compared BRICS markets for a low-cost appliance launch, then narrowed the shortlist after reviewing distribution and currency risks.", "战略团队比较了金砖国家市场是否适合推出低价家电，随后根据分销和汇率风险缩小了候选范围。", ["6.1.6"]],
  ["8.2.3", [106], "Pan-global marketing", "泛全球营销", "A standardised approach that treats the world as one market and sells the same product in the same way across countries.", "泛全球营销把世界视作单一市场，尽量在不同国家使用相同产品与营销方式，可降低调整成本，但可能忽视当地需求差异。", "Pan-global marketing suits our basic cloud-storage plan, but the team will keep local payment options for markets where card use is limited.", "基础云存储方案适合泛全球营销，但在银行卡使用有限的市场，团队仍会保留本地支付选项。"],
  ["8.2.3", [107], "Global localisation", "全球本土化", "Adapting the marketing mix, including products, to reflect national or regional tastes and cultures.", "全球本土化是在跨国经营的同时调整营销组合以适应当地口味和文化，例如改变产品规格、促销内容或销售渠道。", "Global localisation led the snack brand to reduce chilli levels for one market and use locally familiar packaging before its regional launch.", "全球本土化促使这个零食品牌为一个市场降低辣度，并在区域上市前采用当地熟悉的包装。"],
];

const unit8: BusinessTerm[] = rows.map(([topicId, sourceRefs, term, termZh, definitionEn, explanationZh, exampleEn, exampleZh, relatedTopicIds]) => ({
  id: `a2-${String(sourceRefs[0]).padStart(3, "0")}`,
  unit: 8,
  topicId,
  ...(relatedTopicIds ? { relatedTopicIds } : {}),
  sourceRefs,
  term,
  termZh,
  definitionEn,
  explanationZh,
  exampleEn,
  exampleZh,
}));

export default unit8;
