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
      },
    });
  },
});
