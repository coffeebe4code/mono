import { run_all_commands, load_mono, project_exists } from "@mono/logic";
import { critical_error, suggestions } from "@mono/validations";
/**
 * @param {any} args - the args from command
 * @returns {Promise<void>}
 */
export async function local(args) {
  /** @type {string | undefined} */
  const project = args._[1];

  if (!project) {
    suggestions(
      `expected args for project name`,
      `suggestions:
      - provide a scoped or unscoped name
      `,
    );
  }

  const mono_loaded = load_mono()
    .then(async (mono) => {
      const project_loaded = project_exists(mono, project);
      if (!project_loaded) {
        critical_error(`!expected a project that exists
      `);
      }
      for (const t of project_loaded.targets) {
        if (t.kind === "local") {
          console.log("invoking local");
          return await run_all_commands(mono, project_loaded, "local");
        }
      }
      suggestions(
        `expected a project and target to contain deploy`,
        `
      suggestions:
      - this project does not have a deploy target command
      `,
      );
    })
    .catch((e) => critical_error(e));

  await mono_loaded;
}
