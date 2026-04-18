
import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);
import { fileURLToPath as topLevelFileUrlToPath, URL as topLevelURL } from "url"
const __dirname = topLevelFileUrlToPath(new topLevelURL(".", import.meta.url))

      function $config(input) { return input }
      

// <define:$input>
var define_input_default = { stage: "rjs" };

// sst.config.ts
var sst_config_default = $config({
  app(input) {
    return {
      name: "rank-force",
      removal: input?.stage === "prd" ? "retain" : "remove",
      home: "aws"
    };
  },
  async run() {
    const topic = `${$app.name}/${$app.stage}/chat`;
    const realtime = new sst.aws.Realtime("MyRealtime", {
      authorizer: {
        handler: "function/realtime-authorizer.handler",
        environment: {
          SST_TOPIC: topic
        }
      }
    });
    const table = new sst.aws.Dynamo("Table", {
      fields: {
        pk: "string",
        sk: "string"
      },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" }
    });
    new sst.aws.Nextjs("Web", {
      link: [table],
      environment: {
        NEXT_PUBLIC_REALTIME_ENDPOINT: realtime.endpoint,
        NEXT_PUBLIC_REALTIME_TOPIC: topic,
        NEXT_PUBLIC_REALTIME_AUTHORIZER: realtime.authorizer
      }
    });
  }
});

// .sst/eval.ts
if (sst_config_default.stacks || sst_config_default.config) {
  console.log("~v2");
  process.exit(0);
}
console.log("~j" + JSON.stringify(sst_config_default.app({
  stage: define_input_default.stage || void 0
})));
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiPGRlZmluZTokaW5wdXQ+IiwgIi4uLy4uL3NzdC5jb25maWcudHMiLCAiLi4vZXZhbC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiIiwgIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy5zc3QvcGxhdGZvcm0vY29uZmlnLmQudHNcIiAvPlxuXG5leHBvcnQgZGVmYXVsdCAkY29uZmlnKHtcbiAgYXBwKGlucHV0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdyYW5rLWZvcmNlJyxcbiAgICAgIHJlbW92YWw6IGlucHV0Py5zdGFnZSA9PT0gJ3ByZCcgPyAncmV0YWluJyA6ICdyZW1vdmUnLFxuICAgICAgaG9tZTogJ2F3cycsXG4gICAgfTtcbiAgfSxcbiAgYXN5bmMgcnVuKCkge1xuICAgIGNvbnN0IHRvcGljID0gYCR7JGFwcC5uYW1lfS8keyRhcHAuc3RhZ2V9L2NoYXRgO1xuICAgIGNvbnN0IHJlYWx0aW1lID0gbmV3IHNzdC5hd3MuUmVhbHRpbWUoJ015UmVhbHRpbWUnLCB7XG4gICAgICBhdXRob3JpemVyOiB7XG4gICAgICAgIGhhbmRsZXI6ICdmdW5jdGlvbi9yZWFsdGltZS1hdXRob3JpemVyLmhhbmRsZXInLFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIFNTVF9UT1BJQzogdG9waWMsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IHRhYmxlID0gbmV3IHNzdC5hd3MuRHluYW1vKCdUYWJsZScsIHtcbiAgICAgIGZpZWxkczoge1xuICAgICAgICBwazogJ3N0cmluZycsXG4gICAgICAgIHNrOiAnc3RyaW5nJyxcbiAgICAgIH0sXG4gICAgICBwcmltYXJ5SW5kZXg6IHsgaGFzaEtleTogJ3BrJywgcmFuZ2VLZXk6ICdzaycgfSxcbiAgICB9KTtcbiAgICBuZXcgc3N0LmF3cy5OZXh0anMoJ1dlYicsIHtcbiAgICAgIGxpbms6IFt0YWJsZV0sXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBORVhUX1BVQkxJQ19SRUFMVElNRV9FTkRQT0lOVDogcmVhbHRpbWUuZW5kcG9pbnQsXG4gICAgICAgIE5FWFRfUFVCTElDX1JFQUxUSU1FX1RPUElDOiB0b3BpYyxcbiAgICAgICAgTkVYVF9QVUJMSUNfUkVBTFRJTUVfQVVUSE9SSVpFUjogcmVhbHRpbWUuYXV0aG9yaXplcixcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG59KTtcbiIsICJcbmltcG9ydCBtb2QgZnJvbSAnL2hvbWUvcmpzL3dvcmtzcGFjZXMvcGVyc29uYWwvcmFuay1mb3JjZS9zc3QuY29uZmlnLnRzJztcbmlmIChtb2Quc3RhY2tzIHx8IG1vZC5jb25maWcpIHtcbiAgY29uc29sZS5sb2coXCJ+djJcIilcbiAgcHJvY2Vzcy5leGl0KDApXG59XG5jb25zb2xlLmxvZyhcIn5qXCIgKyBKU09OLnN0cmluZ2lmeShtb2QuYXBwKHtcbiAgc3RhZ2U6ICRpbnB1dC5zdGFnZSB8fCB1bmRlZmluZWQsXG59KSkpIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7OztBQUFBLDZCQUFDLE9BQVEsTUFBSzs7O0FDRWQsSUFBTyxxQkFBUSxRQUFRO0FBQUEsRUFDckIsSUFBSSxPQUFPO0FBQ1QsV0FBTztBQUFBLE1BQ0wsTUFBTTtBQUFBLE1BQ04sU0FBUyxPQUFPLFVBQVUsUUFBUSxXQUFXO0FBQUEsTUFDN0MsTUFBTTtBQUFBLElBQ1I7QUFBQSxFQUNGO0FBQUEsRUFDQSxNQUFNLE1BQU07QUFDVixVQUFNLFFBQVEsR0FBRyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUs7QUFDeEMsVUFBTSxXQUFXLElBQUksSUFBSSxJQUFJLFNBQVMsY0FBYztBQUFBLE1BQ2xELFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxVQUNYLFdBQVc7QUFBQSxRQUNiO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUNELFVBQU0sUUFBUSxJQUFJLElBQUksSUFBSSxPQUFPLFNBQVM7QUFBQSxNQUN4QyxRQUFRO0FBQUEsUUFDTixJQUFJO0FBQUEsUUFDSixJQUFJO0FBQUEsTUFDTjtBQUFBLE1BQ0EsY0FBYyxFQUFFLFNBQVMsTUFBTSxVQUFVLEtBQUs7QUFBQSxJQUNoRCxDQUFDO0FBQ0QsUUFBSSxJQUFJLElBQUksT0FBTyxPQUFPO0FBQUEsTUFDeEIsTUFBTSxDQUFDLEtBQUs7QUFBQSxNQUNaLGFBQWE7QUFBQSxRQUNYLCtCQUErQixTQUFTO0FBQUEsUUFDeEMsNEJBQTRCO0FBQUEsUUFDNUIsaUNBQWlDLFNBQVM7QUFBQSxNQUM1QztBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOzs7QUNsQ0QsSUFBSSxtQkFBSSxVQUFVLG1CQUFJLFFBQVE7QUFDNUIsVUFBUSxJQUFJLEtBQUs7QUFDakIsVUFBUSxLQUFLLENBQUM7QUFDaEI7QUFDQSxRQUFRLElBQUksT0FBTyxLQUFLLFVBQVUsbUJBQUksSUFBSTtBQUFBLEVBQ3hDLE9BQU8scUJBQU8sU0FBUztBQUN6QixDQUFDLENBQUMsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
