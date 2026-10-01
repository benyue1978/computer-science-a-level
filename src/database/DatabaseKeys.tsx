import { useEffect, type ReactNode } from 'react';
import './database.css';

function Table({ title, heads, rows, accents = [] }: { title: string; heads: string[]; rows: string[][]; accents?: number[] }) {
  return <div className="dk-table-wrap"><table><caption>{title}</caption><thead><tr>{heads.map((h, i) => <th scope="col" className={accents.includes(i) ? 'dk-key-cell' : ''} key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((v, j) => <td className={accents.includes(j) ? 'dk-key-cell' : ''} key={j}>{v}</td>)}</tr>)}</tbody></table></div>;
}
function Chapter({ id, n, en, title, children }: { id: string; n: string; en: string; title: string; children: ReactNode }) {
  return <section id={id} className="dk-chapter"><header className="dk-chapter-head"><span className="dk-number">{n}</span><div><p className="dk-label">{en}</p><h2>{title}</h2></div></header>{children}</section>;
}
function Analogy({ children }: { children: ReactNode }) {
  return <aside className="dk-analogy"><span>生活里的类比</span><p>{children}</p></aside>;
}
const students = [['S01', '小林', '7A'], ['S02', '小林', '7B'], ['S03', '小雨', '7A']];

export default function DatabaseKeys() {
  useEffect(() => { document.documentElement.lang = 'zh-Hans'; document.title = '数据库里的 Key · 图解课堂'; }, []);
  return <div className="dk-page">
    <a className="skip-link" href="#dk-main">跳到主要内容</a>
    <header className="dk-top"><a href="/">↳ Computer Science</a><span>图解课堂 / 08 DATABASES</span><a href="#recap">速览全图 ↗</a></header>
    <main id="dk-main">
      <section className="dk-hero">
        <div><p className="dk-label">CAMBRIDGE AS & A LEVEL · 9618</p><h1>一张名单，<br />读懂数据库里的 <em>Key</em>。</h1><p className="dk-intro">从“你是哪位同学”，到“你属于哪个班”。<br />用一个学校的故事，把表与键串起来。</p><a className="dk-start" href="#tables">从一张表开始 <span>↓</span></a><p className="dk-small">中文讲解 · 英文术语 · 约 6 分钟</p></div>
        <div className="dk-hero-art" aria-label="学号识别学生，班级编号连接班级"><div className="dk-idcard"><span>STUDENT CARD / 学生证</span><strong>小林</strong><p>学号 <b>S01</b></p><p>班级 <b>7A</b></p><i>用学号，认出这个人。</i></div><div className="dk-art-arrow">7A <span>→</span></div><div className="dk-classcard"><span>CLASS / 班级档案</span><strong>7A</strong><p>王老师 · 201 教室</p><i>用班级编号，找到另一张表。</i></div></div>
      </section>
      <nav className="dk-nav" aria-label="本课内容">{[['tables','01 表'],['primary','02 主键'],['candidate','03 候选键与次键'],['foreign','04 外键'],['composite','05 复合键'],['recap','06 回顾']].map(([id,t])=><a key={id} href={'#'+id}>{t}</a>)}</nav>

      <Chapter id="tables" n="01" en="TABLE · RECORD · FIELD" title="数据库，从整理好的名单开始。">
        <div className="dk-two"><div className="dk-copy"><p>一所学校要记住学生、班级和选科信息。把同一类事物的信息排成行和列，就得到一张<strong>表（table）</strong>。</p><Analogy>就像通讯录：一行记一个联系人，每一列固定记姓名、电话等某一项信息。</Analogy><p className="dk-small">关系型数据库由这样的表组成；表之间还可以建立联系。</p></div><div><Table title="STUDENT / 学生表" heads={['学号','姓名','班级编号']} rows={students}/><div className="dk-row-notes"><p><b>横着读 → 一行</b><br />一名学生的记录<br /><span>record / tuple</span></p><p><b>竖着读 ↓ 一列</b><br />所有学生的同一项信息<br /><span>field / attribute</span></p></div></div></div>
      </Chapter>

      <Chapter id="primary" n="02" en="PRIMARY KEY / PK" title="两个“小林”，怎么分清？">
        <div className="dk-two"><div><div className="dk-twins"><div><span>小林</span><b>S01</b><small>7A 班</small></div><span className="dk-not-equal">≠</span><div><span>小林</span><b>S02</b><small>7B 班</small></div></div><p className="dk-caption">姓名一样，学号不同 → 是两条不同的记录。</p></div><div className="dk-copy"><p><strong>主键</strong>是选定的、用来唯一识别每条记录的字段或字段组合。这里选择<strong>学号</strong>。</p><Analogy>学号就像学生的“身份证号”。叫“小林”可能有两个人，报出 S01 就能确定是哪一位。</Analogy><div className="dk-rules"><span>① 唯一：不能重复</span><span>② 必填：不能为 NULL</span></div></div></div>
        <div className="dk-verdicts"><p><b>× 新学生也用 S01</b><span>拒绝：已经有这个学号。</span></p><p><b>× 新学生不填学号</b><span>拒绝：主键不能空缺。</span></p><p><b>✓ 新学生也叫“小林”</b><span>允许：姓名不是主键。</span></p></div>
      </Chapter>

      <Chapter id="candidate" n="03" en="CANDIDATE KEY → PRIMARY / SECONDARY KEY" title="有资格的都候选，选中一个当主键。">
        <p className="dk-lead">给学生再加一个学校邮箱。<strong>约定：每人都有学号和学校邮箱，两者各自都唯一。</strong>因此，任何一个都能单独识别学生。</p>
        <div className="dk-candidate-diagram"><div className="dk-bracket">候选键 Candidate keys <span>都能唯一识别，且没有多余字段</span></div><div className="dk-key-options"><article><span className="dk-pill">候选 A</span><h3>学号</h3><code>S01</code><div className="dk-down">↓ 选作主要标识</div><strong className="dk-result">主键 Primary key</strong></article><article><span className="dk-pill">候选 B</span><h3>学校邮箱</h3><code>s01@school.example</code><div className="dk-down">↓ 未被选中</div><strong className="dk-result dk-secondary">次键 Secondary key</strong></article></div></div>
        <div className="dk-two dk-after"><Analogy>办理手续时，身份证号或护照号都能确认同一个人。如果系统选身份证号作主要标识，护照号仍是另一个可用的唯一标识。</Analogy><div className="dk-copy"><p><strong>主键仍然是候选键。</strong>“当选”没有让它失去候选资格。</p><p>「学号 + 姓名」不是这里的候选键：仅凭学号已经够了，加上姓名是多余的。</p><p className="dk-small">本课按所参考的 Hodder / Cambridge 教材口径：secondary key 指未被选作主键的候选键。</p></div></div>
      </Chapter>

      <Chapter id="foreign" n="04" en="FOREIGN KEY / FK" title="外键，是通往另一张表的线索。">
        <p className="dk-lead">学生表不必为每位同学重复写老师和教室，只需记下班级编号，再去班级表查。</p>
        <div className="dk-relation"><Table title="STUDENT / 学生表" heads={['学号 PK','姓名','班级编号 FK']} rows={students} accents={[2]}/><div className="dk-link"><span>7A</span><b>→</b><small>引用同一个编号</small></div><Table title="CLASS / 班级表" heads={['班级编号 PK','老师','教室']} rows={[["7A","王老师","201"],["7B","李老师","202"]]} accents={[0]}/></div>
        <div className="dk-two dk-after"><Analogy>像快递单上的取件点编号：看到 P01，就去取件点目录查 P01 在哪里。单子记的是编号，不是把整家店的信息复制一遍。</Analogy><div className="dk-copy"><p>这里，学生表的<strong>班级编号是外键</strong>，引用班级表的主键。</p><p><strong>外键可以重复。</strong>S01 和 S03 都填 7A，表示多名学生属于同一个班；但班级表里的 7A 只出现一次。</p></div></div>
        <div className="dk-integrity"><b>如果填了不存在的 7Z？</b><p>在启用外键约束的数据库里，这次写入会被拒绝：先要有 7Z 的班级记录。这个检查体现了<strong>参照完整性（referential integrity）</strong>。</p><small>本例规定每个学生必须有班级。外键是否允许 NULL，要看该字段的约束。</small></div>
      </Chapter>

      <Chapter id="composite" n="05" en="COMPOSITE KEY" title="一个字段不够，就两个一起。">
        <div className="dk-two"><div className="dk-copy"><p>一名学生能选多科，一门科目也有多人选。<strong>约定：每名学生对每门科目只登记一次。</strong></p><div className="dk-equation"><span>学号</span><b>+</b><span>科目名称</span><b>=</b><strong>一次选科</strong></div><p>学号单独会重复，科目名称单独也会重复；<strong>两项合起来才唯一</strong>。这个组合就是选科表的复合主键。</p><Analogy>电影院里，“第 3 排”不能确定座位，“第 8 座”也不能。只有“第 3 排 + 第 8 座”才能确定同一场次中的一个座位。</Analogy></div><div><Table title="STUDENTSUBJECT / 选科表" heads={['学号 PK·FK','科目名称 PK·FK']} rows={[["S01","数学"],["S01","历史"],["S02","数学"]]} accents={[0,1]}/><p className="dk-caption">两列共同组成一个主键，不是两个主键。</p><div className="dk-pair"><b>S01 + 数学</b><span>再次插入同一组合 → 拒绝</span></div><p className="dk-small">学号同时引用学生表；科目名称同时引用科目表（本例科目名称唯一）。一个字段可以既属于主键，又是外键。</p></div></div>
        <div className="dk-subject"><span>科目表 SUBJECT</span><p><b>科目名称 PK</b> → 任课老师</p><p>数学 → 陈老师　 /　 历史 → 周老师</p></div>
      </Chapter>

      <Chapter id="recap" n="06" en="THE BIG PICTURE" title="Key 不是多一种数据，而是字段的角色。">
        <div className="dk-summary">{[['候选键','Candidate key','谁有资格？','能唯一识别记录的最小字段组合。'],['主键','Primary key','最终选谁？','从候选键中选定一个；唯一且非空。'],['次键','Secondary key','谁没被选中？','教材中，未被选作主键的候选键。'],['外键','Foreign key','和谁有联系？','引用另一张表的键，把记录联系起来。'],['复合键','Composite key','要几个字段？','多个字段共同组成一个键。']].map(([zh,en,q,d])=><article key={en}><span>{en}</span><h3>{zh}</h3><b>{q}</b><p>{d}</p></article>)}</div>
        <div className="dk-final"><span>记住这条线</span><p>先用<strong>主键认人</strong>，再用<strong>外键找班级</strong>。<br />选科要认准<strong>“谁 + 哪一科”</strong>。</p></div>
      </Chapter>
      <footer className="dk-footer"><p>例子与术语依据</p><p>Hodder · David Watson & Helen Williams（2019），第 8 章，pp. 200–205；Cambridge · Sylvia Langfield & Dave Duddell（第二版，2019），第 11 章，pp. 160–161。</p><p>沿用教材的学校场景；本页学生、邮箱及老师数据为教学改编。学校邮箱例子用于补充解释候选键。</p><a href="https://www.cambridgeinternational.org/Images/721397-2027-2029-syllabus.pdf#page=25" target="_blank" rel="noreferrer">查看 Cambridge 9618 官方考纲 ↗</a><a href="#dk-main">回到开头 ↑</a></footer>
    </main>
  </div>;
}
