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
		h2a: '細胞はプレートの上のまま。',
		h2b: '条件を変えるのはロボット、観るのは私たち。'
	},
	beats: {
		above: '変化は上から。',
		below: '観るのは下から。',
		again: '同じ変化を、もう一度。',
		strengths: '強さを三段階に。',
		untouched: 'この列には、何も加えない。',
		later: '一日後。同じ細胞。',
		still:
			'変化は上から、観察は下から。三つの強さ、三回の繰り返し、何もしない三列。一日後、同じ細胞がまた応える。'
	},
	readout: {
		h2a: '返ってくるのは、モデル。',
		h2b: 'どの条件で、この細胞が\nよく機能するのか。根拠つきで。',
		pBefore:
			'ロボットが設定する条件の一つひとつが摂動であり、撮影する一コマ一コマが測定です。その時系列から、細胞がどう応答するかの因果モデルを推定します。カレン・サックスが単一細胞の摂動データに対して ',
		pLink: 'Science（2005）',
		pAfter: ' で示した手法です。'
	},
	founders: {
		h2: '創業者'
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
			'標準プレートの一部を長時間露光で写したもの。変化が来る側、上から見ている。どのウェルの底にも一つひとつの細胞の培養があり、その下を観察者が歩く。その光は真上のウェルを通してだけ見える。ウェルの上にポインタを置くと、上から変化が入る。長く置くほど強くなり、通り過ぎただけなら何も入らない。タッチ画面では、一度触れれば一つの変化。変化は入った場所から広がり、細胞はそれぞれのタイミングで応える、あるいは応えない。触れていないウェルのすぐ隣で。ロボットは、来たときに一つだけ変化を入れ、あとはこちらの手に応える。同じ変化をその列の隣のウェルへ。次に、三段階の強さを一列に。強いほど多くの細胞が応える。何もしない列はひとりでにまたたくだけ。変化によって応えたものが、ゆっくりと因果の地図に落ち着いていく。'
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
		key: 'beats.untouched',
		note: 'Changed from 何もしていない (could read "not done yet") to 何も加えない (deliberate, present tense).',
		open: false
	},
	{
		key: 'readout.h2b',
		note: 'Changed はたらく (soft; recalls 『はたらく細胞』) to よく機能する; meta.description changed to match.',
		open: false
	}
];
