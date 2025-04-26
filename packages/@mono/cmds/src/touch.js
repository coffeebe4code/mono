import { run_all_commands, load_mono, project_exists } from "@mono/logic";
import { critical_error, suggestions } from "@mono/validations";
import path from "path";

/**
 * @param {any} args - the args from command
 * @returns {Promise<void>}
 */
export async function touch(args) {
  /** @type {string | undefined} */
  const file_path = args._[1];

  if (!file_path) {
    suggestions(
      `expected args for folder path`,
      `suggestions:
      - provide a the full folder path
      `,
    );
  }

  const first_half = file_path.split(path.sep + "@");
  const project = "@" + first_half[1].split(path.sep).slice(0, 2).join("/");

  const mono_loaded = load_mono()
    .then(async (mono) => {
      const project_loaded = project_exists(mono, project);
      if (!project_loaded) {
        critical_error(`!expected a project that exists
      `);
      }
      let found = false;
      for (const t of project_loaded.targets) {
        if (t.kind === "build") {
          found = true;

          await run_all_commands(mono, project_loaded, "build");
        }
      }
      if (!found) {
        suggestions(
          `expected a project and target to contain build`,
          `
      suggestions:
      - this project does not have a build target command
      `,
        );
      }
    })
    .catch((e) => critical_error(e));

  await mono_loaded;
}
