const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, PageBreak,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  AlignmentType, VerticalAlign,
} = require('docx');

const DIR = __dirname;
const MM = 56.7;                       // 1mm = 56.7 DXA
const PAGE_W = Math.round(297 * MM);   // A3 幅
const PAGE_H = Math.round(420 * MM);   // A3 高さ
const MARGIN = Math.round(20 * MM);
const CONTENT_W = PAGE_W - MARGIN * 2;
const LEFT_W = Math.round(CONTENT_W * 0.60);
const RIGHT_W = CONTENT_W - LEFT_W;

const C = {
  fukushi: '2E7D5B', bosai: 'C9581D', ink: '22302A',
  ink2: '5A6A61', ink3: '86958C', line: 'D9E0D4',
  fukushiBg: 'E6F1EA', bosaiBg: 'FAEADF', goldBg: 'F7EFD7', cardBg: 'FBFCF8',
};
const FONT = 'Yu Gothic';

const run = (text, o = {}) => new TextRun({
  text, font: FONT, size: o.size || 22, bold: !!o.bold,
  color: o.color || C.ink, characterSpacing: o.spacing,
});
const p = (text, o = {}) => new Paragraph({
  alignment: o.align, spacing: { before: o.before || 0, after: o.after === undefined ? 80 : o.after, line: o.line || 300 },
  indent: o.indent, border: o.border, shading: o.shading,
  children: Array.isArray(text) ? text : [run(text, o)],
});
const label = (t, color) => p(t, { size: 17, bold: true, color: color || C.ink3, after: 40, line: 240 });
const noBorder = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } };
const thinBorder = (color) => ({
  top: { style: BorderStyle.SINGLE, size: 4, color: color || C.line },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: color || C.line },
  left: { style: BorderStyle.SINGLE, size: 4, color: color || C.line },
  right: { style: BorderStyle.SINGLE, size: 4, color: color || C.line },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: color || C.line },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: color || C.line },
});
const cell = (children, width, o = {}) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  margins: { top: 120, bottom: 120, left: 160, right: 160 },
  shading: o.shading ? { type: ShadingType.CLEAR, fill: o.shading, color: 'auto' } : undefined,
  verticalAlign: VerticalAlign.TOP,
  children,
});
function photo(file, caption, maxW) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const buf = fs.readFileSync(path.join(DIR, 'photos', file));
  const dims = { 'kurumaisu.jpg': [2000, 1500], 'hakujou.jpg': [2000, 1500], 'kourei.jpg': [2000, 1500],
    'saigai-vc.png': [1080, 548], 'ninchisho.jpg': [2000, 1500], 'bousai-bingo.jpg': [2000, 1500],
    'volunteer-haishoku.jpg': [2000, 1500] }[file];
  const w = maxW || 700;
  const h = Math.round(w * dims[1] / dims[0]);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240, after: 60 },
      children: [new ImageRun({ data: buf, type: ext === 'png' ? 'png' : 'jpg', transformation: { width: w, height: h } })] }),
    p(caption, { size: 17, color: C.ink3, align: AlignmentType.CENTER, after: 0 }),
  ];
}
const metaLine = (k, v) => new Paragraph({
  spacing: { after: 70, line: 260 },
  children: [run(k + '　', { size: 18, bold: true, color: C.ink3 }), run(v, { size: 19 })],
});

// ============ プログラムのデータ ============
const F = C.fukushi, B = C.bosai;
const programs = [
  { cat: 'ふくし体験', color: F, name: '車いす体験', catch: '「押す人」も「乗る人」も、両方やってみる。',
    body: '車いすの開き方・たたみ方から始めて、平らな道 → 段差 → スロープ → 砂利道と、少しずつ難しくなるコースを進みます。乗る役と押す役を必ず交代。最後に「怖かった場面」と「うれしかった声かけ」を出し合って共有します。',
    aim: '車いすを使う人の目線の高さと不安を、体で知る。段差・すき間・傾きなど、ふだん見えていないまちのバリアに気づく目を持ち、「押しましょうか？」の一言を言えるようにする。',
    meta: [['対象','小学4年生〜大人'],['人数','10〜40人（4〜6人の班に分けます）'],['所要','60〜90分'],['会場','体育館・多目的ホール（段差やスロープのある屋外もあると◎）'],['用意','動きやすい服装／車いす・コーンは社協が貸出']],
    photo: ['kurumaisu.jpg','車いす体験：自分で車輪を回して進んでみる（大郷町内小学校）'], first: true, sec: 'ふくし体験' },
  { cat: 'ふくし体験', color: F, name: '白杖体験（アイマスク体験）', catch: '目を閉じた3分間で、まちの音が変わる。',
    body: '2人1組で、アイマスクと白杖で歩く役と、となりで支える「ガイドヘルプ」役を交代します。廊下を歩く、階段を上り下りする、自動販売機で飲み物を買う——短い課題を用意。「あぶない！」ではなく「3歩先に下り階段があります」と伝える練習までを行います。',
    aim: '見えない・見えにくい人の心細さと、伝わる声かけ／伝わらない声かけの違いを知る。手を引くのではなく「腕を貸す」介助の基本を身につける。',
    meta: [['対象','小学4年生〜大人'],['人数','10〜30人（偶数だとスムーズ）'],['所要','60〜90分'],['会場','廊下・階段が使える学校や施設'],['用意','会場の通路確保／アイマスク・白杖は社協が貸出']],
    photo: ['hakujou.jpg','白杖体験：アイマスクと白杖で、ガイド役といっしょに歩く'] },
  { cat: 'ふくし体験', color: F, name: '高齢者疑似体験講座', catch: '30分だけ、80歳になってみる。',
    body: '手足の重り、関節を曲がりにくくするサポーター、視界がぼやける特殊ゴーグル、感覚が鈍る手袋を装着。その状態で、階段の上り下り、財布から小銭を出す、新聞の細かい字を読む、ペットボトルのふたを開ける——ふだん何気なくしている動作をやってみます。',
    aim: '「歳をとると、なぜゆっくりになるのか」を身体で理解する。急かさない・待つ・声をかけるという関わり方を、家族や近所づきあいの中に持ち帰ってもらう。',
    meta: [['対象','小学5年生〜大人'],['人数','10〜30人（装具の数により調整）'],['所要','約90分'],['会場','教室・和室・集会所（階段が近くにあると◎）'],['用意','疑似体験セットは社協が貸出／着脱しやすい服装']],
    photo: ['kourei.jpg','高齢者疑似体験：見えにくさ・聞こえにくさ・動かしにくさを同時に体験'] },
  { cat: 'ふくし体験', color: F, name: '災害ボランティアセンター運営体験', catch: '「手伝いたい人」と「困っている人」をつなぐ現場を、まるごと。',
    body: '受付班・オリエンテーション班・ニーズ班・マッチング班・資機材班に分かれ、模擬のニーズ票（「床下の泥出しをお願いしたい」など）とボランティア役を使って、センターを1サイクル動かしてみます。最後は各班からの「困ったこと」を出し合う運営会議まで。',
    aim: '災害時に社協が立ち上げるボランティアセンターの仕組みを知る。「その日、誰が動かすのか」を自分ごとにして、地域から運営スタッフになれる人を増やす。',
    meta: [['対象','中学生〜大人（自主防災組織・行政職員にも）'],['人数','15〜50人'],['所要','120〜180分'],['会場','体育館・多目的ホール（机といすが並べられる広さ）'],['用意','机・いす・受付スペース／様式類は社協が用意']],
    photo: ['saigai-vc.png','災害ボランティアセンター運営体験：班に分かれて受付・ニーズ・資機材を担当し、模擬のニーズ票でセンターを動かす'] },
  { cat: 'ふくし体験', color: F, name: '認知症サポーター養成講座', catch: '認知症を「知っている人」が、まちの安心になる。',
    body: 'キャラバン・メイトが伺い、映像や寸劇で認知症の症状と、その人が感じている世界を紹介します。「もし、同じ話をくり返す人に出会ったら」「道に迷っている様子の人がいたら」を全員で考える時間つき。受講された方には認知症サポーターの目印（オレンジのカード・リング）をお渡しします。',
    aim: '正しい知識で「怖い・わからない」を減らす。認知症のある人とその家族を、責めずに見守り、さりげなく支える応援者を地域に増やす。',
    meta: [['対象','小学生〜大人（学校・職場・サロンでも）'],['人数','10〜100人'],['所要','約90分'],['会場','集会所・教室・会議室（映像が映せると◎）'],['用意','プロジェクター等（ご相談ください）']],
    photo: ['ninchisho.jpg','認知症サポーター養成講座：「若い時 → 正常な老化 → 認知症のはじまり」を寸劇で見える形に'] },
  { cat: 'ふくし体験', color: F, name: 'ボランティア入門講座', catch: '「やってみたい」を、最初の一歩に。',
    body: '「ボランティアって、なに？」というところから始めます。配食・サロン・見守り・除雪・傾聴・災害支援など、大郷町でいま実際に動いている活動を写真で紹介。そのうえで「自分にできそうなこと」「出られる曜日と時間」を書き出し、最後にボランティアセンターへの登録と、活動先の見学のしかたをご案内します。',
    aim: '「ボランティアは特別な人がするもの」というイメージをほどく。得意なことや空いている時間から始められると知り、その場で最初の一歩（登録・見学の申し込み）まで進めてもらう。',
    meta: [['対象','中学生〜大人（学校・企業・サロン・新任の役員さんにも）'],['人数','10〜50人'],['所要','60〜90分'],['会場','集会所・会議室・教室'],['用意','筆記用具（資料・登録用紙は社協が用意）']],
    photo: ['volunteer-haishoku.jpg','町内で続いているボランティア活動のひとつ、配食サービス。講座では、こうした活動を写真で紹介します'] },
  { cat: '防災', color: B, name: '防災ビンゴゲーム', catch: '遊んでいるうちに、家の備えが見えてくる。',
    body: '「懐中電灯」「乾電池」「常備薬」「現金」「おくすり手帳」など、非常持ち出し袋に入れたいものが並んだビンゴカードで対戦。読み上げるたびに「なぜ必要か」「何日分いるか」をひと言ずつ解説します。仕上げは、わが家に足りないものを書き出す「備えメモ」づくり。',
    aim: 'むずかしい話をせずに、幅広い年齢が一緒に参加できる入り口をつくる。「備えなきゃ」で終わらせず、その日のうちに家庭の行動リストへ変える。',
    meta: [['対象','年長〜大人（親子・三世代におすすめ）'],['人数','10〜60人'],['所要','45〜60分'],['会場','集会所・多目的室（机があると◎）'],['用意','カード・景品は社協が用意／筆記用具']],
    photo: ['bousai-bingo.jpg','防災ビンゴゲーム：「みず・たべもの」「かいちゅうでんとう」など、非常持ち出し品のカードを並べて'], first: true, sec: '防災' },
  { cat: '防災', color: B, name: '避難所体験', catch: '3時間いてみると、足りないものがわかる。',
    body: '受付名簿づくり → 間仕切り・段ボールベッドの組み立て → 簡易トイレの設置 → 非常食の配給 → 夜をどう過ごすかの話し合い。泊まらずに、半日でひととおり体験できます。高齢者・車いすの人・乳幼児連れ・外国から来た人などの「配慮が必要な役」を置くと、学びが一気に深まります。',
    aim: '避難所は「行けば誰かが用意してくれる場所」ではなく「集まった人で運営する場所」だと、体験で理解する。誰が困るのかを先に知り、地域の避難所運営マニュアルづくりにつなげる。',
    meta: [['対象','小学生〜大人（家族・町内会単位で）'],['人数','20〜80人'],['所要','120〜180分'],['会場','体育館・公民館'],['用意','間仕切り・段ボールベッド等は社協が手配']],
    photo: null },
  { cat: '防災', color: B, name: '助けられ上手・助け上手になろう！', catch: 'その「大丈夫です」を、やめてみる。',
    body: '「困っていることを伝える練習」と「手伝いを申し出る練習」を、役を交代しながらロールプレイ。停電した／断水した／薬が切れた／段差が越えられない——場面カードを引いて、誰に・どう頼むかを実際に声に出します。最後に「わたしの助けてほしいことリスト」と「わたしにできることリスト」を交換します。',
    aim: '支援は一方通行ではないと知る。日ごろから「頼める関係」をつくっておくことが、災害時の逃げ遅れを防ぐ——遠慮が命に関わることを、無理なく実感してもらう。',
    meta: [['対象','小学生〜大人（サロン・PTAにも）'],['人数','10〜40人'],['所要','60〜90分'],['会場','集会所・教室（グループで座れる配置）'],['用意','場面カード・ワークシートは社協が用意']],
    photo: null },
  { cat: '防災', color: B, name: 'サバメシ作り', catch: '電気もガスも止まった日の、あたたかいごはん。',
    body: '耐熱ポリ袋と少しの水でごはんを炊く「ポリ袋炊飯」が主役。カセットコンロと大鍋で全員分をまとめて調理します。缶詰・乾物を使ったおかずも一緒に作って試食。水を節約する洗い物の工夫、アレルギーのある人への配慮もあわせてお伝えします。',
    aim: '「非常食＝かたい乾パン」のイメージを変える。ライフラインが止まっても食べられる、という自信をひとつ持ち帰ってもらう。あたたかい食事は、避難生活で心を支えることも伝えます。',
    meta: [['対象','小学生〜大人（低学年は保護者と一緒に）'],['人数','10〜40人'],['所要','90〜120分'],['会場','調理室・かまど・屋外（火気の使える場所）'],['用意','エプロン・三角巾／材料費は実費のご負担をお願いする場合があります']],
    photo: null },
];

function qrBlock() {
  const f = path.join(DIR, 'photos', 'form-qr.png');
  if (!fs.existsSync(f)) return [];
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 320, after: 60 },
      children: [new ImageRun({ data: fs.readFileSync(f), type: 'png', transformation: { width: 190, height: 190 } })] }),
    p('スマホで読み取ると申込フォームが開きます', { size: 19, color: C.ink2, align: AlignmentType.CENTER, after: 0 }),
  ];
}

// ============ ページ組み立て ============
const children = [];

// ---- 1ページ目 ----
children.push(p('大郷町社会福祉協議会', { size: 20, bold: true, color: C.fukushi, after: 60 }));
children.push(p('福祉教育・防災教育事業', { size: 19, bold: true, color: C.ink3, after: 200 }));
children.push(p('育てよう！', { size: 76, bold: true, after: 40, line: 900 }));
children.push(p('地域のやさしい目', { size: 76, bold: true, after: 200, line: 900, shading: { type: ShadingType.CLEAR, fill: C.goldBg, color: 'auto' } }));
children.push(p('ふくし体験と防災を、地域のみなさんといっしょに。', { size: 30, bold: true, color: C.fukushi, after: 160 }));
children.push(p('町内会・自治会、学校、子ども会、サークル、事業所——「うちでもやってみたい」に、社協がまるごと伴走します。講師も資機材もこちらで用意。会場と参加者だけ、そろえてください。', { size: 23, color: C.ink2, after: 320 }));

const factW = Math.round(CONTENT_W / 4);
children.push(new Table({
  columnWidths: [factW, factW, factW, CONTENT_W - factW * 3], borders: thinBorder(),
  rows: [new TableRow({ children: [
    ['プログラム数', 'ふくし体験 6 ／ 防災 4'], ['対象', '小学生から大人まで'],
    ['所要時間', '45分 〜 180分'], ['組み合わせ', '自由に選べます'],
  ].map(([k, v], i) => cell([label(k), p(v, { size: 22, bold: true, after: 0 })], i === 3 ? CONTENT_W - factW * 3 : factW, { shading: C.cardBg })) })],
}));

children.push(p('社協の福祉教育、3つの約束', { size: 34, bold: true, before: 400, after: 160 }));
const promW = Math.round(CONTENT_W / 3);
children.push(new Table({
  columnWidths: [promW, promW, CONTENT_W - promW * 2], borders: thinBorder(),
  rows: [new TableRow({ children: [
    ['「聞く」より「やってみる」', '講義だけで終わりません。体を動かし、困り、気づく時間をかならず入れます。だから記憶に残ります。'],
    ['準備から当日まで一緒に', 'ねらいの整理、進行表づくり、協力者への声かけ、保険の手配まで。初めての担当者さんでも大丈夫です。'],
    ['一回で終わらせない', 'ふりかえりまでがプログラム。出てきた「気になること」を、次の活動や地域の見守りにつなげます。'],
  ].map(([t, d], i) => cell([p(t, { size: 24, bold: true, color: C.fukushi, after: 80 }), p(d, { size: 20, color: C.ink2, after: 0 })], i === 2 ? CONTENT_W - promW * 2 : promW)) })],
}));

children.push(p('10のメニューから、自由に組み合わせ', { size: 34, bold: true, before: 400, after: 120 }));
children.push(p('単独でも、2〜3本をつないで半日・一日のプログラムにもできます。時間・人数・会場に合わせて調整しますので、まずは「やってみたいもの」に印をつけてご相談ください。', { size: 21, color: C.ink2, after: 160 }));
const halfW = Math.round(CONTENT_W / 2);
const listCell = (title, color, items) => cell([
  p(title, { size: 24, bold: true, color, after: 120 }),
  ...items.map((t, i) => p(`${i + 1}. ${t}`, { size: 22, after: 60 })),
], halfW);
children.push(new Table({
  columnWidths: [halfW, CONTENT_W - halfW], borders: thinBorder(),
  rows: [new TableRow({ children: [
    listCell('ふくし体験プログラム', C.fukushi, programs.filter(x => x.cat === 'ふくし体験').map(x => x.name)),
    listCell('防災プログラム（新設）', C.bosai, programs.filter(x => x.cat === '防災').map(x => x.name)),
  ] })],
}));

// ---- 2ページ目以降：1プログラム1ページ ----
programs.forEach((pr) => {
  children.push(new Paragraph({ children: [new PageBreak()] }));
  if (pr.first) {
    children.push(p(pr.sec === 'ふくし体験' ? 'PROGRAM ／ ふくし体験　いま実施している 6つのプログラム'
                                            : 'PROGRAM ／ 防災　これから増やしていく 4つのプログラム',
      { size: 22, bold: true, color: pr.color, after: 60,
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: pr.color, space: 6 } } }));
    children.push(p('', { size: 12, after: 120 }));
  }
  children.push(p(pr.cat, { size: 18, bold: true, color: pr.color, after: 60 }));
  children.push(p(pr.name, { size: 40, bold: true, after: 80 }));
  children.push(p(pr.catch, { size: 24, color: C.ink2, after: 200 }));
  children.push(new Table({
    columnWidths: [LEFT_W, RIGHT_W], borders: thinBorder(),
    rows: [new TableRow({ children: [
      cell([
        label('どんな内容？'), p(pr.body, { size: 21, after: 200 }),
        label('ねらい', pr.color), p(pr.aim, { size: 21, after: 0 }),
      ], LEFT_W),
      cell(pr.meta.map(([k, v]) => metaLine(k, v)), RIGHT_W, { shading: C.cardBg }),
    ] })],
  }));
  if (pr.photo) {
    children.push(...photo(pr.photo[0], pr.photo[1], pr.photo[0] === 'saigai-vc.png' ? 760 : 620));
  } else {
    children.push(p('［ この プログラム の 写真 は、初回 実施 のあと 差し替えます ］'.replace(/ /g, ''), {
      size: 20, color: C.ink3, align: AlignmentType.CENTER, before: 400,
      border: { top: { style: BorderStyle.DASHED, size: 6, color: C.line, space: 12 },
                bottom: { style: BorderStyle.DASHED, size: 6, color: C.line, space: 12 } },
    }));
  }
});

// ---- 組み合わせ例 ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(p('組み合わせ例　つなげると、学びが深くなります', { size: 34, bold: true, after: 120 }));
children.push(p('下は、よくお申し込みいただく組み合わせの例です。もちろん1本だけでもOK。時間や参加者に合わせて、いくらでも組み替えられます。', { size: 21, color: C.ink2, after: 200 }));
[
  ['A', '学校のふくし体験学習', '1日（4時間程度）／小学校・中学校', '車いす体験 ＋ 白杖体験 ＋ 助けられ上手・助け上手になろう！', '「気づく → やってみる → 言葉にする」の順に並べた王道コース。体験だけで終わらせず、最後に「声のかけ方」を練習して教室に持ち帰ります。'],
  ['B', '町内会・自主防災組織の防災デー', '半日（3時間程度）／地域住民', '防災ビンゴゲーム ＋ 助けられ上手・助け上手 ＋ サバメシ作り', 'ビンゴで場をあたためてから、いざというとき誰にどう頼むかを声に出して練習し、最後はみんなでごはん。顔と名前がつながる半日になります。'],
  ['C', '地域まるごと、防災の一日', '1日（5時間程度）／家族・町内会', '避難所体験 ＋ サバメシ作り ＋ 災害ボランティアセンター運営体験', '午前に避難所を開設し、昼はサバメシ、午後はボランティアセンターの運営まで。災害の一日を通しで体験する、いちばん濃いコースです。プログラムごとの時間を短く調整して、1日に収めます。'],
  ['D', 'まずは1回、90分から', '45〜90分／サロン・職場・PTA', '認知症サポーター養成講座、ボランティア入門講座、または防災ビンゴゲーム', '準備の負担がいちばん軽い入門コース。会場と参加者だけご用意いただければ、あとは社協が持ち込みます。「まず一度やってみる」にどうぞ。'],
].forEach(([mark, title, time, chain, desc]) => {
  children.push(new Table({
    columnWidths: [CONTENT_W], borders: thinBorder(),
    rows: [new TableRow({ children: [cell([
      new Paragraph({ spacing: { after: 100 }, children: [
        run(mark + '　', { size: 30, bold: true, color: 'B8860B' }),
        run(title, { size: 28, bold: true }),
        run('　' + time, { size: 19, bold: true, color: C.ink2 }),
      ] }),
      p(chain, { size: 23, bold: true, color: C.fukushi, after: 100 }),
      p(desc, { size: 21, color: C.ink2, after: 0 }),
    ], CONTENT_W)] })],
  }));
  children.push(p('', { size: 12, after: 120 }));
});

// ---- 実施までの流れ ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(p('実施までの流れ　ご相談から、ふりかえりまで', { size: 34, bold: true, after: 120 }));
children.push(p('目安は実施の3か月前からのご相談です。急ぎの場合もできる範囲で対応しますので、まずはお電話ください。日程が決まっていなくても大丈夫です。', { size: 21, color: C.ink2, after: 200 }));
const whenW = Math.round(CONTENT_W * 0.16);
children.push(new Table({
  columnWidths: [whenW, CONTENT_W - whenW], borders: thinBorder(),
  rows: [
    ['3か月前〜', 'まずは相談', 'お電話・窓口・メールで「こんなことがしたい」とお声かけください。決まっていることが少なくても構いません。', 'お伝えいただきたいこと：だいたいの時期／参加する人（学年・年代）／だいたいの人数'],
    ['2か月前', '打ち合わせ', '社協職員が伺うか、来ていただくかして、「今回いちばん伝えたいこと」を一緒に整理します。そのうえで、ぴったりのプログラムと時間割をご提案します。', '決めること：ねらい／プログラム／日時・会場／当日の役割分担'],
    ['1〜2か月前', '内容決定・お申し込み', '実施計画書と進行表をつくります。必要な資機材、講師・協力者、材料費の有無をここで確定します。', '社協がすること：講師や当事者団体への依頼／資機材の確保／進行表の作成'],
    ['3週間前〜', '準備', '会場のレイアウト、参加者の募集、案内チラシ、保険の加入手続きを進めます。チラシのひな型もお渡しできます。', '主催者にお願いすること：会場予約／参加者への案内／名簿づくり／雨天時の判断'],
    ['前日・当日', '実施', '前日または当日の朝に会場設営と流れの確認。当日は受付から進行、片づけまで社協スタッフが一緒に動きます。写真もお撮りします。', '当日の流れ：受付 → はじめのあいさつ → 体験 → ふりかえり → 終わりのあいさつ'],
    ['1週間以内', 'ふりかえり', 'アンケートの集計結果と写真をお届けします。参加者から出た「気になること」を一緒に読み、次にできることを考えるところまでがプログラムです。', 'その後へ：地域の見守り活動／次回の企画／広報紙・社協だよりでの紹介'],
  ].map(([when, title, desc, todo], i) => new TableRow({ children: [
    cell([p(when, { size: 20, bold: true, color: C.ink3, after: 0 })], whenW),
    cell([
      new Paragraph({ spacing: { after: 80 }, children: [
        run((i + 1) + '　', { size: 26, bold: true, color: C.fukushi }), run(title, { size: 26, bold: true })] }),
      p(desc, { size: 21, color: C.ink2, after: 80 }),
      p(todo, { size: 19, after: 0, shading: { type: ShadingType.CLEAR, fill: C.fukushiBg, color: 'auto' } }),
    ], CONTENT_W - whenW),
  ] })),
}));

// ---- Q&A・お問い合わせ ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(p('よくあるご質問', { size: 34, bold: true, after: 160 }));
const qa = [
  ['費用はかかりますか？', '講師の派遣・資機材の貸出については、まずご相談ください。サバメシ作りなどの材料費は実費のご負担をお願いする場合があります。'],
  ['少人数でもできますか？', '10人程度から実施できます。大人数の場合は班に分けて、体験と講義を入れ替えながら進めます。'],
  ['雨が降ったらどうなりますか？', 'まち歩きは、事前に撮った写真と地図を使う屋内版に切り替えられます。中止の判断は前日にご相談のうえ決めます。'],
  ['会場がありません。', '社協の会議室もご利用いただけます（要予約）。公民館や学校の空き教室のご相談にも応じます。'],
  ['けがをしたら心配です。', 'ボランティア活動保険・行事用保険のご案内をします。体験前の安全確認と補助スタッフの配置も一緒に計画します。'],
  ['車いすの人や高齢の方も参加できますか？', 'もちろんです。むしろ当事者の方に参加していただくと、体験の質が大きく変わります。参加しやすい進め方を一緒に考えます。'],
];
const qaW = Math.round(CONTENT_W / 2);
for (let i = 0; i < qa.length; i += 2) {
  children.push(new Table({
    columnWidths: [qaW, CONTENT_W - qaW], borders: thinBorder(),
    rows: [new TableRow({ children: [qa[i], qa[i + 1]].map((x, j) => cell([
      new Paragraph({ spacing: { after: 80 }, children: [run('Q　', { size: 24, bold: true, color: 'B8860B' }), run(x[0], { size: 22, bold: true })] }),
      p(x[1], { size: 20, color: C.ink2, after: 0 }),
    ], j === 0 ? qaW : CONTENT_W - qaW)) })],
  }));
}
children.push(p('※ 記載の所要時間・人数・用意するものは目安です。実際の内容、費用、貸出の条件は変更になる場合がありますので、お申し込みの際にご確認ください。', { size: 19, color: C.ink3, before: 200, after: 400 }));

children.push(new Table({
  columnWidths: [CONTENT_W],
  borders: { top: { style: BorderStyle.SINGLE, size: 18, color: C.ink }, bottom: { style: BorderStyle.SINGLE, size: 18, color: C.ink },
             left: { style: BorderStyle.SINGLE, size: 18, color: C.ink }, right: { style: BorderStyle.SINGLE, size: 18, color: C.ink },
             insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
  rows: [new TableRow({ children: [cell([
    p('お申し込み・お問い合わせ', { size: 34, bold: true, after: 100 }),
    p('「うちでもできますか？」の一本のお電話から始まります。日程も内容も決まっていなくて大丈夫です。', { size: 22, color: C.ink2, after: 60 }),
    p('この事業は「育てよう！地域のやさしい目」として、大郷町社協が進めています。', { size: 21, color: C.ink2, after: 240 }),
    p('社会福祉法人 大郷町社会福祉協議会', { size: 28, bold: true, after: 100 }),
    new Paragraph({ spacing: { after: 100 }, children: [
      run('TEL　', { size: 20, bold: true, color: C.ink3 }), run('022-359-2753', { size: 40, bold: true, color: C.fukushi }),
      run('　　FAX 022-359-4896', { size: 22 })] }),
    p('メール　community@oosato-syakyo.or.jp', { size: 22, after: 60 }),
    p('住所　宮城県黒川郡大郷町粕川字東長崎31-7', { size: 22, after: 60 }),
    p('受付時間　平日 8:30〜17:15（土日祝・年末年始を除く）／担当　金須・及川・千田', { size: 22, after: 0 }),
    ...qrBlock(),
  ], CONTENT_W)] })],
}));
children.push(p('「育てよう！地域のやさしい目」事業　福祉教育・防災教育プログラムのご案内／発行：社会福祉法人 大郷町社会福祉協議会', { size: 18, color: C.ink3, before: 240, after: 0 }));

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 22, color: C.ink } } } },
  sections: [{
    properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(DIR, '育てよう地域のやさしい目_案内資料_A3.docx');
  fs.writeFileSync(out, buf);
  console.log('書き出し完了:', out, (buf.length / 1024 / 1024).toFixed(2) + ' MB');
});
