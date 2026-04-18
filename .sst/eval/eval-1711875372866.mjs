
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
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws"
    };
  },
  async run() {
    new sst.aws.Nextjs("MyWeb");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiPGRlZmluZTokaW5wdXQ+IiwgIi4uLy4uL3NzdC5jb25maWcudHMiLCAiLi4vZXZhbC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiIiwgIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy5zc3QvcGxhdGZvcm0vY29uZmlnLmQudHNcIiAvPlxuXG5leHBvcnQgZGVmYXVsdCAkY29uZmlnKHtcbiAgYXBwKGlucHV0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IFwicmFuay1mb3JjZVwiLFxuICAgICAgcmVtb3ZhbDogaW5wdXQ/LnN0YWdlID09PSBcInByb2R1Y3Rpb25cIiA/IFwicmV0YWluXCIgOiBcInJlbW92ZVwiLFxuICAgICAgaG9tZTogXCJhd3NcIixcbiAgICB9O1xuICB9LFxuICBhc3luYyBydW4oKSB7XG4gICAgbmV3IHNzdC5hd3MuTmV4dGpzKFwiTXlXZWJcIik7XG4gIH0sXG59KTtcbiIsICJcbmltcG9ydCBtb2QgZnJvbSAnL2hvbWUvcmpzL3dvcmtzcGFjZXMvcGVyc29uYWwvcmFuay1mb3JjZS9zc3QuY29uZmlnLnRzJztcbmlmIChtb2Quc3RhY2tzIHx8IG1vZC5jb25maWcpIHtcbiAgY29uc29sZS5sb2coXCJ+djJcIilcbiAgcHJvY2Vzcy5leGl0KDApXG59XG5jb25zb2xlLmxvZyhcIn5qXCIgKyBKU09OLnN0cmluZ2lmeShtb2QuYXBwKHtcbiAgc3RhZ2U6ICRpbnB1dC5zdGFnZSB8fCB1bmRlZmluZWQsXG59KSkpIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7OztBQUFBLDZCQUFDLE9BQVEsTUFBSzs7O0FDRWQsSUFBTyxxQkFBUSxRQUFRO0FBQUEsRUFDckIsSUFBSSxPQUFPO0FBQ1QsV0FBTztBQUFBLE1BQ0wsTUFBTTtBQUFBLE1BQ04sU0FBUyxPQUFPLFVBQVUsZUFBZSxXQUFXO0FBQUEsTUFDcEQsTUFBTTtBQUFBLElBQ1I7QUFBQSxFQUNGO0FBQUEsRUFDQSxNQUFNLE1BQU07QUFDVixRQUFJLElBQUksSUFBSSxPQUFPLE9BQU87QUFBQSxFQUM1QjtBQUNGLENBQUM7OztBQ1hELElBQUksbUJBQUksVUFBVSxtQkFBSSxRQUFRO0FBQzVCLFVBQVEsSUFBSSxLQUFLO0FBQ2pCLFVBQVEsS0FBSyxDQUFDO0FBQ2hCO0FBQ0EsUUFBUSxJQUFJLE9BQU8sS0FBSyxVQUFVLG1CQUFJLElBQUk7QUFBQSxFQUN4QyxPQUFPLHFCQUFPLFNBQVM7QUFDekIsQ0FBQyxDQUFDLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
