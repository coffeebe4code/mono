import { run_all_commands, load_mono, project_exists } from "@mono/logic";
import { critical_error, suggestions } from "@mono/validations";
import path from "path";
import * as fs from "node:fs/promises";

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

  // todo(chris):: this ends up being quite easy. since I can split on "path.sep+@"
  let sliced = path.normalize(file_path).split(path.sep);

  sliced.pop();
  let cont = true;

  while (cont && sliced.length > 0) {
    await fs
      .readdir("/" + path.join(...sliced), { withFileTypes: true })
      .then((files) => {
        files.forEach((dirent) => {
          if (dirent.name === "monojs.json") {
            cont = false;
          }
        });
      });
    if (cont) {
      sliced.pop();
    }
  }

  if (sliced.length === 0) {
    suggestions(
      `expected to find monojs.json`,
      `suggestions:
      - provide a the full folder path where a monojs.json file is present somewhere up in the directory
        structure ie /home/chris/my-cool-project/monojs.json
        and the touched file /home/chris/my-cool-project/packages/@core/utils/src/index.js
      `,
    );
  }

  const mono_loaded = load_mono()
    .then(async (mono) => {
      const project_loaded = project_exists(mono, path.join(...sliced));
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
