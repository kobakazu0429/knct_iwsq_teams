# knct_iwsq_teams

スクエア用の Teams 周りのスクリプト集です

## セットアップ

1. Node.js と Yarn を入れてください
2. このリポジトリをクローンしてください
3. `yarn install` を実行してください
4. `cp .env.template .env`を実行し、.env を編集してください

### .env

#### GRAPH_EXPLORER_ACCESS_TOKEN

次で取得できます

https://developer.microsoft.com/en-us/graph/graph-explorer

#### GOOGLE_SERVICE_CLIENT_EMAIL と GOOGLE_SERVICE_PRIVATE_KEY

GCP で取得してください
`GOOGLE_SERVICE_CLIENT_EMAIL`を TA 一覧のスプレッドシートに閲覧者として招待してください

## 使い方

### `export-users`

高専機構の AD に登録されている(?)アカウントをドメイン単位で出力するスクリプト

```shell
$ yarn run export-users --dest=./users.txt
```

### `invite-all-tas-to-missing-private-channels`

Teams のすべてのプライペートチャネルに TA を所有者権限で一括で招待するスクリプト

TA 一覧のスプレッドシートにに招待する TA のメールアドレスを記載してください

チームに TA が全員参加済みであることを確認してください

```shell
$ yarn run invite-all-tas-to-missing-private-channels
$ yarn run invite-all-tas-to-missing-private-channels --dry-run
```

### `invite-to-team`

チームに招待するスクリプト

ブラウザで Teams を開き次の 2 つの Cookie を取得し、.env に追記してください

- `authtoken`
  - value: Bearer=JWT&Origin=https://teams.microsoft.com
  - required: JWT
- `skypetoken_asm`
  - value: JWT
  - required: JWT

```shell
$ yarn run invite-to-team --user-email=m22-abcd,e22-abcd,..
$ yarn run invite-to-team --user-id=uuid1,uuid2,...
$ yarn run invite-to-team --user-email=m22-abcd,e22-abcd,.. --user-id=uuid1,uuid2,...
$ yarn run invite-to-team --user-email=m22-abcd,e22-abcd,.. --user-id=uuid1,uuid2,... --dry-run
```

### `post-all-channel-info`

チーム内のプライベートチャネルを含む全チャネル情報を General に流すスクリプト
