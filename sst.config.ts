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
    const table = new sst.aws.Dynamo('Table', {
      fields: {
        pk: 'string',
        sk: 'string',
      },
      primaryIndex: { hashKey: 'pk', rangeKey: 'sk' },
    });
    new sst.aws.Nextjs('Web', {
      link: [table],
    });
  },
});
