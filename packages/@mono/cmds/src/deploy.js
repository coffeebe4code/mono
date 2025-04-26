import { run_all_commands, load_mono, project_exists } from "@mono/logic";
import { critical_error, suggestions } from "@mono/validations";
/**
 * @param {any} args - the args from command
 * @returns {Promise<void>}
 */
export async function deploy(args) {
  /** @type {string | undefined} */
  const project = args._[1];
  const env = args._["env"] ?? args.e;

  if (!project) {
    suggestions(
      `expected args for project name`,
      `suggestions:
      - provide a scoped or unscoped name
      `,
    );
  }
  if (!env) {
    suggestions(
      `expected deploy env`,
      `suggestions:
      - provide local for packages to install locally
      - provide prod for packages to publish
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
      let found = false;
      for (const t of project_loaded.targets) {
        if (t.kind === "deploy") {
          found = true;

          await run_all_commands(mono, project_loaded, "deploy");
        }
      }
      if (!found) {
        suggestions(
          `expected a project and target to contain deploy`,
          `
      suggestions:
      - this project does not have a deploy target command
      `,
        );
      }
    })
    .catch((e) => critical_error(e));

  await mono_loaded;
}
