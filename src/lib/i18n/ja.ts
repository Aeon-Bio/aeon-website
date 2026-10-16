// Japanese as a native copywriter would write it (COPY_DECK.md), same keys as en.ts.
// Register: the business card's Japanese face. 体言止め headlines, です・ます body,
// katakana for Western names, Latin for product and standard names, full-width 。、
import type { Messages } from './index';

export const ja: Messages = {
	meta: {
		title: 'aeon.science',
		description:
			'分注ロボットの上に載り、標準プレートの中で細胞を生かしたまま、ロボットが条件を変えるあいだ撮影し続ける装置。どの条件で細胞がよく機能するのかが見えてきます。',
		ogTitle: 'aeon.science',
		ogDescription:
			'分注ロボットの上に載り、標準プレートの中で細胞を生かしたまま、ロボットが条件を変えるあいだ撮影し続ける装置。',
		ogLocale: 'ja_JP'
	},
	hero: {
		line: '生細胞実験のためのオープンハードウェア',
		h1: '変えて、観る。',
		cue: 'しくみを見る'
	},
	dish: {
		h2a: 'ひとりの人の、細胞がひとつ。',
		h2b: 'たずねて、手放さない。',
		lede: '何かが届く。細胞は、光で答える。次の問いは、同じ細胞に。生きたまま。測るために壊されることは、ない。',
		horizon: 'この先にあるのは、治療の前に、その人自身の細胞にたずねる病院。'
	},
	record: {
		none: 'まだ、たずねていない。',
		one: '一度、たずねた。同じ細胞。',
		two: '二度、たずねた。同じ細胞が、生きたまま。',
		many: '{n}回、たずねた。同じ細胞が、生きたまま。',
		still: '三度、たずねた。同じ細胞が、生きたまま。'
	},
	readout: {
		h2a: '返ってくるのは、答え。',
		h2b: 'この細胞には、\nどの条件を、どの強さで。',
		pBefore:
			'ロボットが設定する条件の一つひとつが摂動であり、撮影する一コマ一コマが測定です。その時系列から、細胞がどう応答するかの因果モデルを推定します。カレン・サックスが単一細胞の摂動データに対して ',
		pLink: 'Science（2005）',
		pAfter: ' で示した手法です。'
	},
	founders: {
		h2: '創業者',
		stage:
			'装置はまだ設計の段階で、細胞を入れたことはありません。エリックは2026年11月まで神戸にいて、細胞アッセイを担う人たちに、何を測り、どこに時間がかかるのかを聞いて回っています。'
	},
	eric: {
		name: 'エリック・モックラー',
		role: '共同創業者・エンジニア',
		alt: '眼鏡をかけ、えんじ色のシャツで微笑むエリック・モックラー',
		linkedin: 'エリック・モックラーの LinkedIn',
		github: 'エリック・モックラーの GitHub',
		scholar: 'エリック・モックラーの Google Scholar',
		bio: [
			{ t: 'カリフォルニア大学サンタクルーズ校で生体工学・認知科学・神経科学を学ぶ。' },
			{ t: 'Gladstone 研究所', href: 'https://gladstone.org' },
			{ t: ' と ' },
			{ t: 'Answer ALS', href: 'https://www.answerals.org' },
			{ t: ' で 1 万人超のゲノムから' },
			{ t: '変異を探索', href: 'https://github.com/ejmockler/case-control-genomics' },
			{ t: '。Gyori 研では、論文が本当に「これが原因だ」と言っているのかを問う' },
			{ t: 'ビリーフモデル', href: 'https://github.com/gyorilab/indra-belief-model' },
			{ t: 'を開発。' }
		]
	},
	karen: {
		name: 'カレン・サックス 博士',
		role: '共同創業者・CSO/CTO',
		alt: 'サングラスを髪に上げて微笑むカレン・サックス',
		linkedin: 'カレン・サックスの LinkedIn',
		scholar: 'カレン・サックスの Google Scholar',
		bio: [
			{ t: 'MIT 博士（生物工学）、スタンフォード大学医学部 博士研究員。' },
			{
				t: '単一細胞摂動データからの因果ネットワーク推定',
				href: 'https://doi.org/10.1126/science.1105809'
			},
			{ t: ' で Science 誌 Breakthrough of the Year 次点。' },
			{ t: '論文 60 報超', href: 'https://scholar.google.com/citations?user=lS0tvhoAAAAJ&hl=en' },
			{ t: '。' }
		]
	},
	cta: {
		line: 'ウェットラボをお持ちの方、摂動データをお持ちの方、ぜひご連絡ください。',
		write: 'お問い合わせ',
		follow: '開発のお知らせを受け取る'
	},
	colophon: {
		text: 'CERN-OHL-S-2.0 のオープンハードウェア · ',
		link: 'GitHub: Aeon-Bio'
	},
	switch: {
		label: 'English'
	},
	modal: {
		write: 'お問い合わせ',
		follow: '開発のお知らせを受け取る',
		close: '閉じる'
	},
	form: {
		progress: '入力の進み具合',
		step: 'ステップ {n}／{total}',
		who: 'ご連絡先',
		name: 'お名前',
		namePlaceholder: 'お名前をご記入ください',
		email: 'メールアドレス',
		emailPlaceholder: '例）name@example.ac.jp',
		org: 'ご所属',
		orgPlaceholder: '会社名・機関名',
		nameRequired: 'お名前をご記入ください',
		emailRequired: 'メールアドレスをご記入ください',
		emailInvalid: '有効なメールアドレスをご記入ください',
		orgRequired: 'ご所属をご記入ください',
		pickOneError: 'いずれか一つをお選びください',
		failed: '送信できませんでした。お手数ですが、もう一度お試しください。',
		next: '次へ',
		topic: 'ご相談内容',
		fewLines: '数行で結構です。',
		why: 'ご関心のきっかけ',
		pickOne: 'お選びください',
		optWetLab: 'ウェットラボを運営している',
		optData: '摂動データを持っている',
		optOther: 'その他',
		more: '用途について',
		morePlaceholder: 'お使いの細胞、いま測っているもの、時間がかかっている点をお聞かせください。',
		moreAria: '用途、プロジェクトの内容、研究の目的、データの種類、協業のイメージなど',
		backAria: '前のステップに戻る',
		back: '戻る',
		sending: '送信中…',
		submit: '送信',
		thanks: 'ありがとうございます。確かに受け取りました。',
		reply: 'すべてエリックが読み、本人が返信します。',
		nextSteps:
			'まだお見せできる製品はありません。お聞きしたいのは、細胞の状態をいまどう測っているか、どこに時間がかかっているか、です。',
		close: '閉じる',
		another: 'もう一通書く'
	},
	follow: {
		title: '開発のお知らせを受け取る',
		body: '装置ができあがっていく過程を、ときどきお届けします。何を測り、何を変えたのか、そしてお見せできるものができたとき。配信は月に一度までです。',
		email: 'メールアドレス',
		emailPlaceholder: 'メールアドレスをご記入ください',
		emailAria: 'お知らせを受け取るメールアドレス',
		emailRequired: 'メールアドレスをご記入ください',
		emailInvalid: '有効なメールアドレスをご記入ください',
		failed: '送信できませんでした。お手数ですが、もう一度お試しください。',
		interest: '関心のある分野',
		optional: '（任意）',
		optBuild: '開発の進み具合',
		optHardware: 'ハードウェアの設計データ（公開時）',
		optAnalysis: '解析とモデル',
		optVisit: '見学やオンラインでのお話',
		sending: '送信中…',
		submit: '登録する',
		thanks: 'ありがとうございます。登録が完了しました。',
		reply: 'お見せできるものができたら、お知らせします。',
		nextSteps: '確認メールはお送りしません。お知らせがあるときだけ配信します。',
		close: '閉じる',
		another: '別のアドレスを登録する'
	},
	a11y: {
		mark: 'aeon のマーク。長時間露光で撮影したローレンツ・アトラクター',
		figure:
			'生きた細胞がひとつ、暗がりに大きく、ゆっくり呼吸している。画面の外から一滴が届き、細胞のふちに波を立てて取り込まれる。細胞は光で答える。触れたところから波が広がり、与えられた分だけ全体が明るくなって、やがて落ち着く。前より少し、明るいまま。次の一滴も、同じ細胞に。来たときに装置が三度たずねる。少し、多すぎ、そのあいだ。それからは、ゆっくりたずね続ける。細胞をタップ、またはクリックすると、触れた側から一滴が届く。細胞が取り除かれることは、ない。',
		put: '細胞にたずねる。'
	}
};

// The three lines flagged for a native speaker. All three answered by native review (2026-10-12, S2):
// none is still open. `open: false` marks a resolved flag; the note records the answer.
export const nativeCheck: readonly { key: string; note: string; open?: boolean }[] = [
	{
		key: 'hero.h1',
		note: 'Kept: 変えて、観る。 reads as a sequence, never an imperative; 観る is right for continuous observation.',
		open: false
	},
	{
		key: 'dish.h2a',
		note: 'ひとりの人の、細胞がひとつ。: one person, one cell (体言止め); confirm 細胞がひとつ reads as "a single cell" and not as a count.',
		open: true
	},
	{
		key: 'dish.h2b',
		note: 'たずねて、手放さない。: asked and kept; confirm 手放さない carries "never discarded" for a living sample.',
		open: true
	},
	{
		key: 'dish.lede',
		note: '何かが届く / 光で答える / 生きたまま / 測るために壊されることは、ない: confirm the last clause reads as a plain fact about destructive assays, not as a boast.',
		open: true
	},
	{
		key: 'dish.horizon',
		note: '治療の前に、その人自身の細胞にたずねる病院。: the horizon; confirm it does not read as a clinic selling unproven therapy (再生医療等安全性確保法 context).',
		open: true
	},
	{
		key: 'record.many',
		note: '{n}回、たずねた。同じ細胞が、生きたまま。: one line at 390; confirm 回 and the 体言止め close.',
		open: true
	},
	{
		key: 'a11y.figure',
		note: 'The figure description, rewritten for the cell: confirm 取り込まれる for a drop taken in at the membrane and 少し、多すぎ、そのあいだ for the three strengths.',
		open: true
	},
	{
		key: 'a11y.put',
		note: '細胞にたずねる。: the keyboard button names an action.',
		open: true
	},
	{
		key: 'founders.stage',
		note: 'The stage sentence; confirm 聞いて回っています is not too casual for the readers at FBRI / Kobe University.',
		open: true
	}
];
