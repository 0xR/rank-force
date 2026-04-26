// SST scaffolds this reference to expose the $config / sst.* globals; there is no import alternative.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'rank-force',
      removal: input?.stage === 'prd' ? 'retain' : 'remove',
      home: 'aws',
    };
  },
  async run() {
    const topicPrefix = `${$app.name}/${$app.stage}/`;
    const realtime = new sst.aws.Realtime('MyRealtime', {
      authorizer: {
        handler: 'src/function/realtime-authorizer.handler',
        environment: {
          SST_TOPIC_PREFIX: topicPrefix,
        },
      },
    });
    const table = new sst.aws.Dynamo('Table', {
      fields: {
        pk: 'string',
        sk: 'string',
      },
      primaryIndex: { hashKey: 'pk', rangeKey: 'sk' },
    });

    realtime.subscribe(
      {
        handler: 'src/function/persister.handler',
        link: [table],
      },
      {
        filter: `${topicPrefix}#`,
        // Default IoT SQL `SELECT *` parses payloads as JSON; we publish raw
        // Automerge change bytes, so encode the message body as base64 and
        // expose the topic so the handler can extract the documentId.
        transform: {
          topicRule: {
            sql: `SELECT encode(*, 'base64') AS payload, topic() AS topic FROM '${topicPrefix}#'`,
          },
        },
      },
    );

    const snapshotFn = new sst.aws.Function('Snapshot', {
      handler: 'src/function/snapshot-fetch.handler',
      url: true,
      link: [table],
    });

    new sst.aws.StaticSite('Web', {
      link: [table],
      build: {
        command: 'pnpm build',
        output: 'dist',
      },
      dev: {
        command: 'pnpm exec vite',
        autostart: true,
      },
      environment: {
        VITE_REALTIME_ENDPOINT: realtime.endpoint,
        VITE_REALTIME_TOPIC_PREFIX: topicPrefix,
        VITE_REALTIME_AUTHORIZER: realtime.authorizer,
        VITE_SNAPSHOT_URL: snapshotFn.url,
      },
    });
  },
});
