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
    new sst.aws.Nextjs('Web', {
      link: [table],
      environment: {
        NEXT_PUBLIC_REALTIME_ENDPOINT: realtime.endpoint,
        NEXT_PUBLIC_REALTIME_TOPIC_PREFIX: topicPrefix,
        NEXT_PUBLIC_REALTIME_AUTHORIZER: realtime.authorizer,
      },
    });
  },
});
