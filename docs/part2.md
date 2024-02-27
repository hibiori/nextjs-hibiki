# 第2回 Next.js handson

## 概要

Next.jsを利用した、オリジナルのグルメ検索サービス開発を通して、一貫してWebアプリケーションを作成できる力をつけます。

## レジュメ

- セットアップ
- データベース
- RESTful API
- 本番DBのセットアップ
- DBを使った機能例
- 他機能やデザインなどを考えて実装する

## セットアップ

part1実施済みの方は以下手順を実行、part2から参加の方はpart2-1setupブランチから始めてください。

DB操作に利用するOR/Mapper prismaのインストール

```sh
$ yarn add prisma@3.8.1
$ yarn add -D @prisma/client@3.8.1
```

prisma initの実行。prisma設定ファイル(prisma/schema.prisma)が生成されているか確認

```sh
$ yarn prisma init --datasource-provider mysql
```

開発用ローカルDBを定義した `docker-compose.yml` を作成

```yml
version: '3.8'

services:
  db:
    image: mysql:8.0.31
    environment:
      MYSQL_DATABASE: nextjs-handson
      MYSQL_ROOT_PASSWORD: pass
    ports:
      - 3306:3306
    volumes:
      - mysql-data:/var/lib/mysql
    command: mysqld --default-authentication-plugin=mysql_native_password

volumes:
  mysql-data:
    driver: local
```

作業後、以下を実行してパッケージインストールと開発環境を立ち上げて確認してください。

```sh
$ yarn
$ yarn dev
```

## データベース

part1では外部のAPIを利用した例を学びました。

外部のAPIだけではオリジナルの機能作成にはどうしても制限がついてきます。

今回はオリジナルの機能作成するためにデータベースも利用したサービス開発の例を学びます。

### セットアップ

DB接続用に環境変数の設定を追加してください。

https://github.com/arakawamoriyuki/nextjs-handson/commit/912784845c0966b8d11287b5f212f5951d4d2b7c

`.env`
```
HOTPEPPER_API_KEY=xxxxx
+ DATABASE_URL=mysql://root:pass@localhost:3306/nextjs-handson-arakawa
```

最後のデータベース名 `nextjs-handson-arakawa` は自分の名前などに変更してください。

後に本番用DBも作りますが、同じMysqlサーバーに作るので名前はユニークである必要があります。

また、変更したら `docker-compose.yml` のMYSQL_DATABASEも同様に変えてください

```diff
-  MYSQL_DATABASE: nextjs-handson
+  MYSQL_DATABASE: nextjs-handson-arakawa
```

データベース名を変えたら以下を実行してmysqlコンテナを立ち上げます。

```sh
$ docker compose up
```

持っていればデータベースクライアントなどを使って、なければmysqlコマンドなどを利用して接続とデータベースが作られているか確認してみましょう。

```sh
$ mysql --host=127.0.0.1 --port=3306 --user=root --password=pass
mysql> show databases;
+------------------------+
| Database               |
+------------------------+
| information_schema     |
| mysql                  |
| nextjs-handson-arakawa |
| performance_schema     |
| sys                    |
+------------------------+
5 rows in set (0.01 sec)
```

### DB設計

簡単な例でデータベースとAPIの繋ぎ方の例をみていきましょう。

グルメサーチAPIはジャンルを指定できます。

マスタデータAPIを使って都度取ることもできますが、今回はDBに保存して利用しましょう。

まずはジャンルAPIをみてみましょう。

```
http://webservice.recruit.co.jp/hotpepper/genre/v1/?key={APIキー}&format=json
```

ジャンルは `code` と `name` を持っています。

`code` はグルメサーチAPIを叩く時のパラメータとして利用し、`name` は表示上の名前として利用します。

また、それぞれは他のレコードで被らないことをDBで補償されていると良いでしょう。

### prismaでモデリング

今回はprismaというライブラリを使ってDBに接続、反映します。

`prisma/schema.prisma` にDSLでモデリングし、マイグレーションコマンドを実行すると適用されます。

[Prisma schema - Prisma](https://www.prisma.io/docs/concepts/components/prisma-schema)

ジャンルモデルを作成してみましょう。

https://github.com/arakawamoriyuki/nextjs-handson/commit/10ef3222453d776c3f16c8e218ca376a2e1a8f0a

```
model genres {
  id Int @id @default(autoincrement())
  code String @db.VarChar(255) @unique
  name String @db.VarChar(255) @unique
}
```

最低限の `id` と `code`、 `name` カラムを持った `genres` テーブルをモデリングしました。

`id` は `autoincrement` により作成時に自動的に連番がふられ、 `@unique` によって被らないことが保証されます。

### prismaでマイグレーション

以下でデータベースに反映します。

```sh
$ yarn prisma migrate dev --name create_genres
```

`prisma/migrations` 内にSQLが生成され、管理されます。

テーブルが作成されているか確認してみましょう。

```sh
$ mysql --host=127.0.0.1 --port=3306 --user=root --password=pass
mysql> use nextjs-handson-arakawa;
mysql> show tables;
+----------------------------------+
| Tables_in_nextjs-handson-arakawa |
+----------------------------------+
| _prisma_migrations               |
| genres                           |
+----------------------------------+
2 rows in set (0.00 sec)
```

## RESTful API

DBと接続し、情報を返すAPIをRESTfulに従って作っていきましょう。

- 一覧 GET /api/genres
- 作成 POST /api/genres
- 詳細 GET /api/genres/:id
- 更新 PATCH /api/genres/:id
- 削除 DELETE /api/genres/:id

また、prismaの使い方は以下を参照してください。

[CRUD - Prisma](https://www.prisma.io/docs/concepts/components/prisma-client/crud)

### 一覧 GET /api/genres

まずは一覧取得APIを作成します。

https://github.com/arakawamoriyuki/nextjs-handson/commit/917667bd57e79b5a8f1aefd3a203aca93de537b1

`pages/api/genres/index.js`
```js
import getConfig from 'next/config';
import { PrismaClient } from '@prisma/client';

const getGenres = async () => {
  const prisma = new PrismaClient();
  const genres = await prisma.genres.findMany();

  return genres;
};

const genres = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.status(200).json(await getGenres());
    default:
      return res.status(405).end();
  }
};

export default genres;
```

`/api/genres` あてにGETリクエストがあるとジャンルを返すAPIができました。

試してみましょう。

```sh
$ curl http://localhost:3000/api/genres
[]
```

まだ何もデータがないので空配列が帰ってきます。

以下を実行してprismaに内包されたDBクライアントでデータを追加してみましょう。

```sh
$ yarn prisma studio
```

![](./part2-studio.png)

データ追加後、一覧APIで値が帰ってきているか確認しましょう。

```sh
$ curl http://localhost:3000/api/genres
[{"id":1,"code":"G001","name":"居酒屋"}]
```

### 作成 POST /api/genres

取得はできましたが、作成は `prisma studio` 経由で作っていました。

作成APIも作成していきましょう。

https://github.com/arakawamoriyuki/nextjs-handson/commit/917667bd57e79b5a8f1aefd3a203aca93de537b1

`pages/api/genres/index.js`
```diff
+ const createGenre = async ({ code, name }) => {
+   const prisma = new PrismaClient();
+   const genre = await prisma.genres.create({
+     data: {
+       code,
+       name,
+     },
+   });
+
+   return genre;
+ };
+
const genres = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.status(200).json(await getGenres());
+     case 'POST':
+       return res.status(201).json(await createGenre(req.body));
    default:
      return res.status(405).end();
  }
```

POSTリクエストがあった場合、受け取った `code`、 `name` でレコードを作成します。

curlでリクエストして確認してみましょう。

```sh
$ curl --request POST \
  --url http://localhost:3000/api/genres \
  --header 'Content-Type: application/json' \
  --data '{
  "code": "G002",
  "name": "ダイニングバー・バル"
}'
```

リクエスト実行後、データが作成されているか確認しましょう。

```sh
$ curl http://localhost:3000/api/genres
[{"id":1,"code":"G001","name":"居酒屋"},{"id":2,"code":"G002","name":"ダイニングバー・バル"}]
```

### 詳細 GET /api/genres/:id

詳細ページを実装する場合、一覧APIを使ってデータを取得していると速度的にもかなりの無駄が発生します。

今回は使用しないですが、詳細APIを実装しましょう。

https://github.com/arakawamoriyuki/nextjs-handson/commit/9cae89797ce965bd65f19859f308ed7fada4da8d

`pages/api/genres/[id].js`
```js
import getConfig from 'next/config';
import { PrismaClient } from '@prisma/client';

const getGenre = async (id) => {
  const prisma = new PrismaClient();
  const genre = await prisma.genres.findUnique({
    where: {
      id,
    },
  });

  return genre;
};

const genre = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.status(200).json(await getGenre(parseInt(req.query.id, 10)));
      break;

    default:
      res.status(405).end();
      break;
  }
};

export default genre;
```

詳細ページはURLでIDを指定します。 `pages/api/genres/[id].js` というファイルを作成すると

`api/genres/1` のようにアクセスでき、 `req.query.id` で取り出すことができます。

詳細APIで値が帰ってきているか確認しましょう。

```sh
$ curl http://localhost:3000/api/genres/1
{"id":1,"code":"G001","name":"居酒屋"}
```

### 更新 PATCH /api/genres/:id

取得や作成ができるようになりましたが、データの更新ができません。

今度は更新APIをつくってみましょう。

https://github.com/arakawamoriyuki/nextjs-handson/commit/c7f67c0a48446cc6861cb14043422f93e87945a4

`pages/api/genres/[id].js`
```diff
+ const updateGenre = async (id, { code, name }) => {
+   const prisma = new PrismaClient();
+
+   const data = {};
+   if (code) data.code = code;
+   if (name) data.name = name;
+
+   const genre = await prisma.genres.update({
+     where: {
+       id,
+     },
+     data,
+   });
+
+   return genre;
+ };
+
const genre = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.status(200).json(await getGenre(parseInt(req.query.id, 10)));
      break;

+     case 'PATCH':
+       return res.status(200).json(await updateGenre(parseInt(req.query.id, 10), req.body));
+       break;
+
    default:
      res.status(405).end();
      break;
```

更新APIを実装しました。

PATCHリクエストがあった場合、受け取った `code`、もしくは `name` でレコードを更新します。

```
curl --request PATCH \
  --url http://localhost:3000/api/genres/1 \
  --header 'Content-Type: application/json' \
  --data '{
	"name": "居酒屋!!!!"
}'
```

データが変わっているか確認しましょう。

```sh
$ curl http://localhost:3000/api/genres/1
{"id":1,"code":"G001","name":"居酒屋!!!!"}
```

#### PUTとPATCHの違い

一部のフレームワークではPUTとPATCHは同義として扱われますが、厳密には `PUT` は(レコード全体の)置換、 `PATCH` は更新になります。

これは結構重要な違いで、上記のようにnameだけ受け取った場合に

- nameだけ更新する
- nameを更新するが、codeは指定がないのでnullにする

など、システムによって解釈が変わるかもしれないことに注意しましょう。

今回は指定ないカラムは操作しないという意味でPATCH(更新)にしています。

### 削除 DELETE /api/genres/:id

最後に削除APIを実装します。

https://github.com/arakawamoriyuki/nextjs-handson/commit/140d90aa56a6fbe9cf475900590fbd2b54500c43

`pages/api/genres/[id].js`
```diff
+ const deleteGenre = async (id) => {
+   const prisma = new PrismaClient();
+   await prisma.genres.delete({
+     where: {
+       id,
+     },
+   });
+ };
+
...
+     case 'DELETE':
+       await deleteGenre(parseInt(req.query.id, 10));
+       return res.status(204).end();
+       break;
```

削除APIも作成しました。

以下でデータが削除されているか確認しましょう。

```sh
$ curl --request DELETE \
  --url http://localhost:3000/api/genres/1
```

## 本番DBのセットアップ

今接続しているDBはローカルに立てたMyslqですが、vercelでdeployされているアプリケーションもDBを使います。

主催者からDB情報を受け取り、データベースを作成しましょう。

### データベース作成

本番DBにアクセスし、データベースを作成します。

`nextjs-handson-arakawa` は適宜読み替えてください。

```
$ mysql --host={DBホスト} --port=3306 --user=admin --password={DBパスワード}
  mysql> create database `nextjs-handson-arakawa`;
  mysql> show databases;
```

### マイグレーション

一時的に.envを変更し、本番DBに接続するようにします。

```.env
DATABASE_URL=mysql://admin:{DBパスワード}@{DBホスト}:3306/{DB名}
```

その後、以下コマンドでDBへ反映します。

```sh
$ yarn prisma migrate status
$ yarn prisma migrate deploy
```

### vercel側の環境変数設定

ホットペッパーAPIの時と同様、vercelで読み込む環境変数もvercelのサイトから設定してください

`DATABASE_URL=mysql://admin:{DBパスワード}@{DBホスト}:3306/{DB名}`

![](./part2-vercel-ev.png)

### デプロイ

ここまでできたらpushし、デプロイしてAPIを試してみましょう。

## DBを使った機能例

APIは揃ったので画面側で利用し、ジャンルを指定できるようにして利便性を向上させましょう。

### codeを受け取ってジャンルで検索できるように

まずは既存のAPIを改修してcodeを受け取るようにしましょう

https://github.com/arakawamoriyuki/nextjs-handson/commit/81d07e205cf76e98339c2ec338c024eb63898d41

`pages/api/shops.js `
```diff
  if (req.query.keyword) query.set('keyword', req.query.keyword);
+   if (req.query.code) query.set('genre', req.query.code);

  const response = await fetch(`https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?${query.toString()}`);
```

codeを反映したフィルタができているか確認しましょう。`G006` はイタリアン/フレンチです。

http://localhost:3000/api/shops?code=G006

次にpart1の最終成果をコピーし、 `pages/part2/gourmets.js` を作り、

URLにcodeが指定されている場合にそのジャンルを指定して初期表示を変えるようにします。

https://github.com/arakawamoriyuki/nextjs-handson/commit/5ac388c8685c83c49924f3370f102b82d0d808f7

https://github.com/arakawamoriyuki/nextjs-handson/commit/8dbe4941b08dc943f87b80ab52ea0b3a9958a779

`pages/part2/gourmets.js`
```diff
- const fetchData = async (keyword) => {
+ const fetchShops = async (keyword, code) => {
  const { API_HOST } = getConfig().publicRuntimeConfig;

  const query = new URLSearchParams();
  if (keyword) query.set('keyword', keyword);
+   if (code) query.set('code', code);

  const host = process.browser ? '' : API_HOST;
  const res = await fetch(`${host}/api/shops?${query.toString()}`);
  return await res.json();
};
const Shops = ({ firstViewShops }) => {
  const [keyword, setKeyword] = React.useState('');
  const [shops, setShops] = React.useState([]);
  useEffect(() => {
    setShops(firstViewShops);
  }, [firstViewShops]);

  const onSearchClick = async () => {
    const data = await fetchData(keyword);
    const data = await fetchShops(keyword);

-     setShops(data);
+     setKeyword('');
...
export const getServerSideProps = async (req) => {
-   const data = await fetchData(req.query.keyword);
+   const shops = await fetchShops(req.query.keyword, req.query.code);

  return {
    props: {
-       firstViewShops: data,
+       firstViewShops: shops,
    },
  };
};
```

codeを指定して初期表示がイタリアン/フレンチで絞られているか確認しましょう。

http://localhost:3000/part2/gourmets?code=G006

### SSRでデータ表示

今回使うジャンルデータは画面から作成/更新などして更新するわけではないので固定値です。

ジャンルをSSRで取得して表示してみましょう。

https://github.com/arakawamoriyuki/nextjs-handson/commit/a07a67864daeaa861a6f04398f6caf55caac6c9f

```diff
- const Shops = ({ firstViewShops }) => {
+ const fetchGenres = async () => {
+   const { API_HOST } = getConfig().publicRuntimeConfig;
+
+   const host = process.browser ? '' : API_HOST;
+   const res = await fetch(`${host}/api/genres`);
+   return await res.json();
+ };
+
+ const Shops = ({ firstViewShops, genres }) => {
  const [keyword, setKeyword] = React.useState('');
  const [shops, setShops] = React.useState([]);
...
export const getServerSideProps = async (req) => {
  const shops = await fetchShops(req.query.keyword, req.query.code);
+   const genres = await fetchGenres();

  return {
    props: {
      firstViewShops: shops,
+       genres,
    },
  };
};
```

SSRでgenresを受け取れるようになりました。データが入っているかconsole.logなどで確認してもいいでしょう。

### ジャンル条件を適用して検索

SSRでもらったジャンルをループで回し、ラジオボタンで表示します。

https://github.com/arakawamoriyuki/nextjs-handson/commit/b1c71df81fb75312de90412c1f1f8a15f56476b1

```diff
import TextField from '@mui/material/TextField';
+ import Radio from '@mui/material/Radio';
+ import RadioGroup from '@mui/material/RadioGroup';
+ import FormControlLabel from '@mui/material/FormControlLabel';
+ import FormControl from '@mui/material/FormControl';
+ import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
...
          }}
        />
+         <FormControl fullWidth>
+           <FormLabel id="genres">ジャンル</FormLabel>
+           <RadioGroup row aria-labelledby="genres" name="genres">
+             {genres.map((genre) => {
+               return <FormControlLabel key={genre.id} value={genre.code} control={<Radio />} label={genre.name} />;
+             })}
+           </RadioGroup>
+         </FormControl>
        <Button
          variant="contained"
```

![](./part2-genres.png)

また、codeも状態管理し、ラジオボタンが押された時に変更されるようにしてみましょう。

https://github.com/arakawamoriyuki/nextjs-handson/commit/50a370d073f25ef20cbbf8ed9ab70408630a5309

```diff
  const [keyword, setKeyword] = React.useState('');
+   const [code, setCode] = React.useState(null);
  const [shops, setShops] = React.useState([]);
...
        <FormControl fullWidth>
          <FormLabel id="genres">ジャンル</FormLabel>
-           <RadioGroup row aria-labelledby="genres" name="genres">
+           <RadioGroup
+             row
+             aria-labelledby="genres"
+             name="genres"
+             value={code}
+             onChange={(event, code) => {
+               setCode(code);
+             }}
+           >
            {genres.map((genre) => {
              return <FormControlLabel key={genre.id} value={genre.code} control={<Radio />} label={genre.name} />;
            })}
```

最後に、検索ボタン押下された時、変更されたジャンルコードをAPIに渡してshopsデータを更新するようにします。

https://github.com/arakawamoriyuki/nextjs-handson/commit/9758df5246e85c1f9ee7cc86e986cc7683fe07c9

```diff
  const onSearchClick = async () => {
-     const data = await fetchShops(keyword);
+     const data = await fetchShops(keyword, code);

    setShops(data);
```

上記で変更されたコードを利用してデータをfetchできるようになりました。

ジャンルにチェックをいれて、キーワードも含めて動作を確認しましょう。

![](./part2-complete.png)

### デプロイ

デプロイして本番で確認してみましょう。

## 他機能やデザインなどを考えて実装する

TOPページ `pages/index.js` を書き換えて自由にグルメ検索サービスを作ってください。

part2で作ったものをベースにしても大丈夫です。

どういうものを作りたいか企画/設計し、メンターに報告し、実装してみましょう

- Lv1 デザイン 一覧ページのデザイン改修、持っている他のデータ表示
- Lv1 デザイン 詳細ページの作成
- Lv1 デザイン サイドメニューを追加
- Lv2 ジャンル/地域などを固定値で選択できるフォームで表示、指定
- Lv3 ジャンルの管理画面 CRUD
- Lv3 ページング
- Lv4 他検索条件の管理画面 CRUD
- Lv4 お気に入り店舗の保存と表示
- Lv4 検索条件の保存と表示
- Lv4 ジャンルやエリアの検索回数を集計し、ランキング表示
