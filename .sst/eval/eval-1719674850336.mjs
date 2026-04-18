
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
    const topicPrefix = `${$app.name}/${$app.stage}/`;
    const realtime = new sst.aws.Realtime("MyRealtime", {
      authorizer: {
        handler: "src/function/realtime-authorizer.handler",
        environment: {
          SST_TOPIC_PREFIX: topicPrefix
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
        NEXT_PUBLIC_REALTIME_TOPIC_PREFIX: topicPrefix,
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiPGRlZmluZTokaW5wdXQ+IiwgIi4uLy4uL3NzdC5jb25maWcudHMiLCAiLi4vZXZhbC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiIiwgIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy5zc3QvcGxhdGZvcm0vY29uZmlnLmQudHNcIiAvPlxuXG5leHBvcnQgZGVmYXVsdCAkY29uZmlnKHtcbiAgYXBwKGlucHV0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdyYW5rLWZvcmNlJyxcbiAgICAgIHJlbW92YWw6IGlucHV0Py5zdGFnZSA9PT0gJ3ByZCcgPyAncmV0YWluJyA6ICdyZW1vdmUnLFxuICAgICAgaG9tZTogJ2F3cycsXG4gICAgfTtcbiAgfSxcbiAgYXN5bmMgcnVuKCkge1xuICAgIGNvbnN0IHRvcGljUHJlZml4ID0gYCR7JGFwcC5uYW1lfS8keyRhcHAuc3RhZ2V9L2A7XG4gICAgY29uc3QgcmVhbHRpbWUgPSBuZXcgc3N0LmF3cy5SZWFsdGltZSgnTXlSZWFsdGltZScsIHtcbiAgICAgIGF1dGhvcml6ZXI6IHtcbiAgICAgICAgaGFuZGxlcjogJ3NyYy9mdW5jdGlvbi9yZWFsdGltZS1hdXRob3JpemVyLmhhbmRsZXInLFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIFNTVF9UT1BJQ19QUkVGSVg6IHRvcGljUHJlZml4LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCB0YWJsZSA9IG5ldyBzc3QuYXdzLkR5bmFtbygnVGFibGUnLCB7XG4gICAgICBmaWVsZHM6IHtcbiAgICAgICAgcGs6ICdzdHJpbmcnLFxuICAgICAgICBzazogJ3N0cmluZycsXG4gICAgICB9LFxuICAgICAgcHJpbWFyeUluZGV4OiB7IGhhc2hLZXk6ICdwaycsIHJhbmdlS2V5OiAnc2snIH0sXG4gICAgfSk7XG4gICAgbmV3IHNzdC5hd3MuTmV4dGpzKCdXZWInLCB7XG4gICAgICBsaW5rOiBbdGFibGVdLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgTkVYVF9QVUJMSUNfUkVBTFRJTUVfRU5EUE9JTlQ6IHJlYWx0aW1lLmVuZHBvaW50LFxuICAgICAgICBORVhUX1BVQkxJQ19SRUFMVElNRV9UT1BJQ19QUkVGSVg6IHRvcGljUHJlZml4LFxuICAgICAgICBORVhUX1BVQkxJQ19SRUFMVElNRV9BVVRIT1JJWkVSOiByZWFsdGltZS5hdXRob3JpemVyLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbn0pO1xuIiwgIlxuaW1wb3J0IG1vZCBmcm9tICcvaG9tZS9yanMvd29ya3NwYWNlcy9wZXJzb25hbC9yYW5rLWZvcmNlL3NzdC5jb25maWcudHMnO1xuaWYgKG1vZC5zdGFja3MgfHwgbW9kLmNvbmZpZykge1xuICBjb25zb2xlLmxvZyhcIn52MlwiKVxuICBwcm9jZXNzLmV4aXQoMClcbn1cbmNvbnNvbGUubG9nKFwifmpcIiArIEpTT04uc3RyaW5naWZ5KG1vZC5hcHAoe1xuICBzdGFnZTogJGlucHV0LnN0YWdlIHx8IHVuZGVmaW5lZCxcbn0pKSkiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBQUEsNkJBQUMsT0FBUSxNQUFLOzs7QUNFZCxJQUFPLHFCQUFRLFFBQVE7QUFBQSxFQUNyQixJQUFJLE9BQU87QUFDVCxXQUFPO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTixTQUFTLE9BQU8sVUFBVSxRQUFRLFdBQVc7QUFBQSxNQUM3QyxNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU0sTUFBTTtBQUNWLFVBQU0sY0FBYyxHQUFHLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSztBQUM5QyxVQUFNLFdBQVcsSUFBSSxJQUFJLElBQUksU0FBUyxjQUFjO0FBQUEsTUFDbEQsWUFBWTtBQUFBLFFBQ1YsU0FBUztBQUFBLFFBQ1QsYUFBYTtBQUFBLFVBQ1gsa0JBQWtCO0FBQUEsUUFDcEI7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQ0QsVUFBTSxRQUFRLElBQUksSUFBSSxJQUFJLE9BQU8sU0FBUztBQUFBLE1BQ3hDLFFBQVE7QUFBQSxRQUNOLElBQUk7QUFBQSxRQUNKLElBQUk7QUFBQSxNQUNOO0FBQUEsTUFDQSxjQUFjLEVBQUUsU0FBUyxNQUFNLFVBQVUsS0FBSztBQUFBLElBQ2hELENBQUM7QUFDRCxRQUFJLElBQUksSUFBSSxPQUFPLE9BQU87QUFBQSxNQUN4QixNQUFNLENBQUMsS0FBSztBQUFBLE1BQ1osYUFBYTtBQUFBLFFBQ1gsK0JBQStCLFNBQVM7QUFBQSxRQUN4QyxtQ0FBbUM7QUFBQSxRQUNuQyxpQ0FBaUMsU0FBUztBQUFBLE1BQzVDO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNGLENBQUM7OztBQ2xDRCxJQUFJLG1CQUFJLFVBQVUsbUJBQUksUUFBUTtBQUM1QixVQUFRLElBQUksS0FBSztBQUNqQixVQUFRLEtBQUssQ0FBQztBQUNoQjtBQUNBLFFBQVEsSUFBSSxPQUFPLEtBQUssVUFBVSxtQkFBSSxJQUFJO0FBQUEsRUFDeEMsT0FBTyxxQkFBTyxTQUFTO0FBQ3pCLENBQUMsQ0FBQyxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
