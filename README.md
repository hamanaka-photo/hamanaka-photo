# HAMANAKA PHOTO

東京カメラ部2026写真展のデジタルアーカイブと、浜中町での撮影旅行に役立つフォトガイドを中心とした静的Webサイトです。
GitHub Pagesにそのままアップロードして公開できます。

## 1. ファイル構成

```text
hamanaka-photo-site/
├─ index.html              HOME
├─ gallery.html            写真展10作品・作者紹介
├─ guide.html              フォトガイド
├─ project.html            今後の写真活動
├─ about.html              サイト説明
├─ 404.html
├─ .nojekyll
├─ assets/
│  ├─ css/style.css
│  ├─ js/
│  │  ├─ main.js
│  │  ├─ gallery-data.js   10作品の情報を編集するファイル
│  │  ├─ gallery.js
│  │  └─ year.js
│  └─ images/
│     ├─ hero.webp
│     ├─ photo-01.webp ～ photo-10.webp
│     └─ その他ページ用画像
└─ downloads/
   └─ README.txt
```

## 2. GitHub Pagesで公開する手順

1. GitHub Organization内に新しいPublicリポジトリを作成します。
   推奨リポジトリ名: `hamanaka-photo`
2. このフォルダの「中身」をすべてリポジトリ直下へアップロードします。
3. GitHubのリポジトリで `Settings` → `Pages` を開きます。
4. `Build and deployment` の Source を `Deploy from a branch` にします。
5. Branchを `main`、Folderを `/(root)` にして `Save` します。
6. 公開URL例: `https://組織名.github.io/hamanaka-photo/`

このコードはすべて相対パスで作っているため、リポジトリ名が変わっても基本的に修正不要です。

## 3. 最初に差し替える写真

`assets/images/` 内の同名ファイルを差し替えるだけで反映できます。

- `hero.webp` : HOME最上部のメイン写真
- `gallery-cover.webp` : 写真展カード
- `guide-cover.webp` : フォトガイドカード
- `project-cover.webp` : 写真活動カード
- `feature.webp` : 写真展特集バナー
- `photo-01.webp` ～ `photo-10.webp` : 展示作品10点
- `author.webp` : 作者プロフィール写真

推奨画像形式: WebP
展示作品の目安: 長辺2000～2560px程度、1枚300KB～1.5MB程度

JPGを使いたい場合は、ファイル名をJPGに変更したうえで、HTML/CSSまたは `gallery-data.js` の拡張子も変更してください。

## 4. 展示作品のタイトル・作者コメントを変更する

`assets/js/gallery-data.js` を編集します。

例:

```js
{
  id: 1,
  title: "作品タイトル",
  image: "assets/images/photo-01.webp",
  location: "霧多布岬",
  season: "2026年6月",
  camera: "Canon EOS R6 Mark II",
  lens: "RF200-800mm F6.3-9 IS USM",
  settings: "800mm / 1/1600秒 / F9 / ISO1600",
  author: "撮影者名",
  comment: "作品コメント"
}
```

10作品の情報を同じファイルでまとめて管理できます。

## 5. 作者紹介を変更する

`gallery.html` の `作者紹介` 部分を編集します。

検索しやすい文字:

```text
撮影者名を入力
```

作者が複数いる場合は `<article class="author-card"> ... </article>` を複製できます。

## 6. フォトガイドPDFを公開する

完成したPDFを次の場所へ配置します。

```text
downloads/hamanaka-photo-guide.pdf
```

その後 `guide.html` の

```html
<span class="btn btn-muted" aria-disabled="true">PDF版は準備中</span>
```

を次へ変更します。

```html
<a class="btn btn-blue" href="downloads/hamanaka-photo-guide.pdf" target="_blank" rel="noopener">PDF版を読む →</a>
```

## 7. 公開前に確認するところ

- 実際の展示写真10点への差し替え
- 作品タイトル、作者名、コメント、撮影情報
- 作者プロフィール
- フォトガイド本文
- 撮影マナーの正式内容
- NEWSの日付・内容
- ABOUTページの運営主体、問い合わせ先
- 写真・文章の著作権表記
- 必要に応じてプライバシーポリシー
- 浜中町公式サイトからのリンク

## 8. 独自ドメインを使う場合

GitHub Pagesの `Settings` → `Pages` → `Custom domain` から設定できます。
自治体管理のサブドメインを使う場合は、庁内のDNS管理者と調整のうえ設定してください。

## 9. セキュリティ上の前提

このサイトは公開情報だけを扱う静的サイトとして作っています。
次のものはリポジトリへ保存しないでください。

- パスワード
- APIキー
- 非公開の個人情報
- 応募者名簿
- 内部資料

フォトコンテストの応募受付などで個人情報を取得する場合は、この静的サイト内で直接処理せず、町が利用を認めたフォーム等へリンクする構成を推奨します。
