/**
 * 大郷町社会福祉協議会
 * 「育てよう！地域のやさしい目」事業
 * 福祉教育・防災教育プログラム 申込フォーム 自動作成＋自動返信スクリプト
 *
 * 【使い方】
 *  1. script.google.com を開き、「新しいプロジェクト」をクリック
 *  2. 表示されたコードを全部消して、このファイルの中身をすべて貼り付ける
 *  3. 下の CONFIG の中身（メールアドレスなど）を確認する
 *  4. 上の関数リストで「createForm」を選び、「実行」を押す
 *     → 初回は Google から許可を求められるので、許可する
 *  5. 実行ログにフォームのURLが表示されるので、それを配布する
 *
 *  ※ createForm は一度だけ実行してください。
 *    もう一度実行すると、別のフォームが新しく作られます。
 */

// ============================================================
// 設定（ここだけ直せば内容が変わります）
// ============================================================
const CONFIG = {
  formTitle: '【大郷町社会福祉協議会】福祉教育・防災教育プログラム 申込フォーム',

  // 申込みが届いたときに通知するメールアドレス（社協）
  staffEmail: 'community@oosato-syakyo.or.jp',

  // 署名に使う情報
  jigyoName: '「育てよう！地域のやさしい目」事業',
  orgName: '社会福祉法人 大郷町社会福祉協議会',
  tel: '022-359-2753',
  fax: '022-359-4896',
  mail: 'community@oosato-syakyo.or.jp',
  address: '宮城県黒川郡大郷町粕川字東長崎31-7',
  hours: '平日 8:30〜17:15（土日祝・年末年始を除く）',
  staffNames: '金須・及川・千田',

  // 自動返信の宛先を探すための設問名（設問名を変えたらここも変える）
  emailItemTitle: 'メールアドレス',
  nameItemTitle: 'ご担当者のお名前',
  orgItemTitle: '団体名・学校名',
};

// プログラム一覧（案内資料と同じ並び）
const PROGRAMS = [
  '車いす体験',
  '白杖体験（アイマスク体験）',
  '高齢者疑似体験講座',
  '災害ボランティアセンター運営体験',
  '認知症サポーター養成講座',
  'ボランティア入門講座',
  '防災ビンゴゲーム',
  '避難所体験',
  '助けられ上手・助け上手になろう！',
  'サバメシ作り',
  'まだ決まっていない／相談したい',
];

// ============================================================
// ① フォームを作る（最初に1回だけ実行）
// ============================================================
function createForm() {
  const form = FormApp.create(CONFIG.formTitle);

  form.setDescription(
    CONFIG.orgName + 'の福祉教育・防災教育プログラム（' + CONFIG.jigyoName + '）のお申し込みフォームです。\n\n' +
    '日程や内容が決まっていなくても大丈夫です。「こんなことがしたい」だけでも送信してください。\n' +
    '担当者から3日以内（土日祝を除く）にご連絡します。\n\n' +
    'お急ぎの場合はお電話ください。　TEL ' + CONFIG.tel + '（' + CONFIG.hours + '）'
  );

  form.setConfirmationMessage(
    'お申し込みありがとうございます。受付いたしました。\n' +
    'ご入力のメールアドレスに、控えのメールをお送りしています。\n' +
    '3日以内（土日祝を除く）に、担当者からご連絡します。\n\n' +
    CONFIG.orgName + '　TEL ' + CONFIG.tel
  );

  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setProgressBar(true);

  // ---- 申し込む方について ----
  form.addSectionHeaderItem()
    .setTitle('1. お申し込みの方について');

  form.addTextItem()
    .setTitle(CONFIG.orgItemTitle)
    .setHelpText('例：○○町内会、○○小学校、○○子ども会、株式会社○○')
    .setRequired(true);

  form.addTextItem()
    .setTitle(CONFIG.nameItemTitle)
    .setRequired(true);

  form.addTextItem()
    .setTitle('電話番号')
    .setHelpText('日中つながる番号をご記入ください')
    .setRequired(true);

  const emailItem = form.addTextItem()
    .setTitle(CONFIG.emailItemTitle)
    .setHelpText('このアドレスに、受付の控えメールをお送りします')
    .setRequired(true);
  emailItem.setValidation(
    FormApp.createTextValidation()
      .requireTextIsEmail()
      .setHelpText('メールアドレスの形式でご記入ください')
      .build()
  );

  // ---- やってみたいプログラム ----
  form.addSectionHeaderItem()
    .setTitle('2. やってみたいプログラム')
    .setHelpText('いくつでも選べます。組み合わせのご相談も承ります。');

  form.addCheckboxItem()
    .setTitle('希望するプログラム')
    .setChoiceValues(PROGRAMS)
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('今回いちばん伝えたいこと・ねらい')
    .setHelpText('例：子どもたちにまちのバリアに気づいてほしい／町内会で防災を自分ごとにしたい　など。決まっていなければ空欄で構いません。')
    .setRequired(false);

  // ---- 日時・会場 ----
  form.addSectionHeaderItem()
    .setTitle('3. 日時・会場')
    .setHelpText('まだ決まっていない項目は「未定」とご記入ください。');

  form.addDateItem()
    .setTitle('実施希望日（第1希望）')
    .setRequired(false);

  form.addDateItem()
    .setTitle('実施希望日（第2希望）')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('希望する時間帯')
    .setChoiceValues(['午前', '午後', '夕方・夜間', 'まだ決まっていない'])
    .setRequired(false);

  form.addTextItem()
    .setTitle('会場')
    .setHelpText('例：○○集会所、○○小学校体育館、未定')
    .setRequired(true);

  // ---- 参加者について ----
  form.addSectionHeaderItem()
    .setTitle('4. 参加する方について');

  form.addTextItem()
    .setTitle('参加する方（学年・年代）')
    .setHelpText('例：小学4年生、町内会の役員、60〜80代のサロン参加者')
    .setRequired(true);

  form.addTextItem()
    .setTitle('参加予定人数')
    .setHelpText('およその人数で構いません（例：30人程度）')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('配慮が必要な方はいらっしゃいますか')
    .setHelpText('車いすを使う方、アレルギーのある方、通訳が必要な方など。ある場合はご記入ください。')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('その他、ご質問・連絡事項')
    .setRequired(false);

  // ---- 回答スプレッドシートを作って紐づける ----
  const ss = SpreadsheetApp.create(CONFIG.formTitle + '（回答一覧）');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // ---- 自動返信のトリガーを設定 ----
  removeFormTriggers_();
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();

  const info =
    '\n========================================\n' +
    'フォームができました。\n\n' +
    '【配布用URL（この住所を町内会や学校に伝えてください）】\n' +
    form.getPublishedUrl() + '\n\n' +
    '【編集用URL（社協の担当者だけが使います）】\n' +
    form.getEditUrl() + '\n\n' +
    '【回答一覧のスプレッドシート】\n' +
    ss.getUrl() + '\n\n' +
    '自動返信も設定しました。テスト送信して確認してください。\n' +
    '========================================\n';
  Logger.log(info);
  return info;
}

// ============================================================
// ② 申し込みが届いたときの自動返信（自動で動きます）
// ============================================================
function onFormSubmit(e) {
  try {
    const answers = readAnswers_(e);
    const to = answers.map[CONFIG.emailItemTitle];
    const personName = answers.map[CONFIG.nameItemTitle] || '';
    const orgTitle = answers.map[CONFIG.orgItemTitle] || '';

    // --- 申込者への自動返信 ---
    if (to) {
      const subject = '【受付しました】福祉教育・防災教育プログラムのお申し込み';
      const body =
        (personName ? personName + ' 様\n\n' : '') +
        'このたびは、' + CONFIG.orgName + 'の福祉教育・防災教育プログラムに\n' +
        'お申し込みいただき、ありがとうございます。\n' +
        '下記の内容で受け付けました。\n\n' +
        '────────────────────\n' +
        answers.text +
        '────────────────────\n\n' +
        '【このあとの流れ】\n' +
        '　1. 3日以内（土日祝を除く）に、担当者からお電話またはメールでご連絡します\n' +
        '　2. 打ち合わせで、ねらい・プログラム・日時・会場を一緒に決めます\n' +
        '　3. 実施計画書と進行表をお渡しし、当日に向けて準備を進めます\n\n' +
        '日程や内容が固まっていなくても大丈夫です。ご相談しながら進めます。\n' +
        'お急ぎの場合や、内容の変更・取り消しは、お電話ください。\n\n' +
        '※ このメールは自動でお送りしています。ご返信いただいても担当者が確認します。\n\n' +
        signature_();
      MailApp.sendEmail({
        to: to,
        subject: subject,
        body: body,
        name: CONFIG.orgName,
        replyTo: CONFIG.staffEmail,
      });
    }

    // --- 社協への通知 ---
    const staffSubject = '【新規申込】' + (orgTitle || '団体名なし') + '／' + (personName || '担当者名なし');
    const staffBody =
      '申込フォームに新しい回答が届きました。\n' +
      '受付日時：' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy年M月d日 HH:mm') + '\n\n' +
      '────────────────────\n' +
      answers.text +
      '────────────────────\n\n' +
      (to ? '申込者への自動返信は送信済みです（宛先：' + to + '）。\n' : '※ メールアドレスの記入がなかったため、自動返信は送っていません。お電話でご連絡ください。\n') +
      '\n3日以内（土日祝を除く）のご連絡をお願いします。\n';
    MailApp.sendEmail({
      to: CONFIG.staffEmail,
      subject: staffSubject,
      body: staffBody,
      name: '申込フォーム自動通知',
      replyTo: to || CONFIG.staffEmail,
    });

  } catch (err) {
    // 失敗しても申込自体は残るように、担当者へ知らせるだけにする
    MailApp.sendEmail(
      CONFIG.staffEmail,
      '【要確認】申込フォームの自動返信でエラーが出ました',
      'エラー内容：\n' + err + '\n\n回答はスプレッドシートに残っています。手動でご連絡ください。'
    );
  }
}

// ============================================================
// 補助
// ============================================================
function readAnswers_(e) {
  const map = {};
  const lines = [];
  const itemResponses = e.response.getItemResponses();
  for (let i = 0; i < itemResponses.length; i++) {
    const ir = itemResponses[i];
    const title = ir.getItem().getTitle();
    let value = ir.getResponse();
    if (Object.prototype.toString.call(value) === '[object Array]') {
      value = value.join('、');
    }
    value = String(value == null ? '' : value);
    map[title] = value;
    if (value.trim() !== '') {
      lines.push('■ ' + title + '\n　' + value.replace(/\n/g, '\n　') + '\n');
    }
  }
  return { map: map, text: lines.join('\n') };
}

function signature_() {
  return '' +
  '━━━━━━━━━━━━━━━━━━━━\n' +
  CONFIG.jigyoName + '\n' +
  CONFIG.orgName + '\n' +
  '担当：' + CONFIG.staffNames + '\n' +
  '〒　' + CONFIG.address + '\n' +
  'TEL ' + CONFIG.tel + '　FAX ' + CONFIG.fax + '\n' +
  'MAIL ' + CONFIG.mail + '\n' +
  '受付時間 ' + CONFIG.hours + '\n' +
  '━━━━━━━━━━━━━━━━━━━━';
}

function removeFormTriggers_() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

// ============================================================
// 動作確認用（自動返信の文面を自分あてに送ってみる）
// ============================================================
function sendTestMail() {
  const me = Session.getActiveUser().getEmail();
  const dummy = {
    map: {},
    text:
      '■ 団体名・学校名\n　○○町内会\n\n' +
      '■ ご担当者のお名前\n　大郷 太郎\n\n' +
      '■ 電話番号\n　022-000-0000\n\n' +
      '■ 希望するプログラム\n　防災ビンゴゲーム、サバメシ作り\n\n' +
      '■ 会場\n　○○集会所\n\n' +
      '■ 参加する方（学年・年代）\n　町内会の役員\n\n' +
      '■ 参加予定人数\n　30人程度\n',
  };
  MailApp.sendEmail({
    to: me,
    subject: '【テスト】受付しました：福祉教育・防災教育プログラムのお申し込み',
    body:
      '大郷 太郎 様\n\nこのたびは、' + CONFIG.orgName + 'の福祉教育・防災教育プログラムに\n' +
      'お申し込みいただき、ありがとうございます。\n下記の内容で受け付けました。\n\n' +
      '────────────────────\n' + dummy.text + '────────────────────\n\n' +
      '【このあとの流れ】\n' +
      '　1. 3日以内（土日祝を除く）に、担当者からお電話またはメールでご連絡します\n' +
      '　2. 打ち合わせで、ねらい・プログラム・日時・会場を一緒に決めます\n' +
      '　3. 実施計画書と進行表をお渡しし、当日に向けて準備を進めます\n\n' +
      signature_(),
    name: CONFIG.orgName,
  });
  Logger.log('テストメールを ' + me + ' に送りました。');
}

// フォームのURLとトリガーの状態を確認する
function checkSetup() {
  const triggers = ScriptApp.getProjectTriggers().filter(function (t) {
    return t.getHandlerFunction() === 'onFormSubmit';
  });
  Logger.log('自動返信トリガー：' + (triggers.length > 0 ? '設定されています（' + triggers.length + '件）' : '設定されていません'));
  Logger.log('通知先メール：' + CONFIG.staffEmail);
}
