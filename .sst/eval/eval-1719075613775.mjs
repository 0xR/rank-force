
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
    const server = new sst.aws.Realtime("MyServer", {
      authorizer: "src/authorizer.handler"
    });
    const table = new sst.aws.Dynamo("Table", {
      fields: {
        pk: "string",
        sk: "string"
      },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" }
    });
    new sst.aws.Nextjs("Web", {
      link: [table]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiPGRlZmluZTokaW5wdXQ+IiwgIi4uLy4uL3NzdC5jb25maWcudHMiLCAiLi4vZXZhbC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiIiwgIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy5zc3QvcGxhdGZvcm0vY29uZmlnLmQudHNcIiAvPlxuXG5leHBvcnQgZGVmYXVsdCAkY29uZmlnKHtcbiAgYXBwKGlucHV0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdyYW5rLWZvcmNlJyxcbiAgICAgIHJlbW92YWw6IGlucHV0Py5zdGFnZSA9PT0gJ3ByZCcgPyAncmV0YWluJyA6ICdyZW1vdmUnLFxuICAgICAgaG9tZTogJ2F3cycsXG4gICAgfTtcbiAgfSxcbiAgYXN5bmMgcnVuKCkge1xuICAgIGNvbnN0IHNlcnZlciA9IG5ldyBzc3QuYXdzLlJlYWx0aW1lKCdNeVNlcnZlcicsIHtcbiAgICAgIGF1dGhvcml6ZXI6ICdzcmMvYXV0aG9yaXplci5oYW5kbGVyJyxcbiAgICB9KTtcbiAgICBjb25zdCB0YWJsZSA9IG5ldyBzc3QuYXdzLkR5bmFtbygnVGFibGUnLCB7XG4gICAgICBmaWVsZHM6IHtcbiAgICAgICAgcGs6ICdzdHJpbmcnLFxuICAgICAgICBzazogJ3N0cmluZycsXG4gICAgICB9LFxuICAgICAgcHJpbWFyeUluZGV4OiB7IGhhc2hLZXk6ICdwaycsIHJhbmdlS2V5OiAnc2snIH0sXG4gICAgfSk7XG4gICAgbmV3IHNzdC5hd3MuTmV4dGpzKCdXZWInLCB7XG4gICAgICBsaW5rOiBbdGFibGVdLFxuICAgIH0pO1xuICB9LFxufSk7XG4iLCAiXG5pbXBvcnQgbW9kIGZyb20gJy9ob21lL3Jqcy93b3Jrc3BhY2VzL3BlcnNvbmFsL3JhbmstZm9yY2Uvc3N0LmNvbmZpZy50cyc7XG5pZiAobW9kLnN0YWNrcyB8fCBtb2QuY29uZmlnKSB7XG4gIGNvbnNvbGUubG9nKFwifnYyXCIpXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuY29uc29sZS5sb2coXCJ+alwiICsgSlNPTi5zdHJpbmdpZnkobW9kLmFwcCh7XG4gIHN0YWdlOiAkaW5wdXQuc3RhZ2UgfHwgdW5kZWZpbmVkLFxufSkpKSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFBQSw2QkFBQyxPQUFRLE1BQUs7OztBQ0VkLElBQU8scUJBQVEsUUFBUTtBQUFBLEVBQ3JCLElBQUksT0FBTztBQUNULFdBQU87QUFBQSxNQUNMLE1BQU07QUFBQSxNQUNOLFNBQVMsT0FBTyxVQUFVLFFBQVEsV0FBVztBQUFBLE1BQzdDLE1BQU07QUFBQSxJQUNSO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTSxNQUFNO0FBQ1YsVUFBTSxTQUFTLElBQUksSUFBSSxJQUFJLFNBQVMsWUFBWTtBQUFBLE1BQzlDLFlBQVk7QUFBQSxJQUNkLENBQUM7QUFDRCxVQUFNLFFBQVEsSUFBSSxJQUFJLElBQUksT0FBTyxTQUFTO0FBQUEsTUFDeEMsUUFBUTtBQUFBLFFBQ04sSUFBSTtBQUFBLFFBQ0osSUFBSTtBQUFBLE1BQ047QUFBQSxNQUNBLGNBQWMsRUFBRSxTQUFTLE1BQU0sVUFBVSxLQUFLO0FBQUEsSUFDaEQsQ0FBQztBQUNELFFBQUksSUFBSSxJQUFJLE9BQU8sT0FBTztBQUFBLE1BQ3hCLE1BQU0sQ0FBQyxLQUFLO0FBQUEsSUFDZCxDQUFDO0FBQUEsRUFDSDtBQUNGLENBQUM7OztBQ3ZCRCxJQUFJLG1CQUFJLFVBQVUsbUJBQUksUUFBUTtBQUM1QixVQUFRLElBQUksS0FBSztBQUNqQixVQUFRLEtBQUssQ0FBQztBQUNoQjtBQUNBLFFBQVEsSUFBSSxPQUFPLEtBQUssVUFBVSxtQkFBSSxJQUFJO0FBQUEsRUFDeEMsT0FBTyxxQkFBTyxTQUFTO0FBQ3pCLENBQUMsQ0FBQyxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
