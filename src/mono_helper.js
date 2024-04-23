import * as fs from 'node:fs/promises';

export const TargetValues = {
  BUILD: 'build',
  LINT: 'lint',
  TEST: 'test',
  E2E: 'e2e',
  INSTALL: 'install',
  PUBLISH: 'publish',
  SERVE: 'serve',
};
/**
 * Represents the Dependencies structure
 * @typedef {object} DependencyStruct
 * @property {string} project_path - path to the Project
 * @property {string} uuid - uuid of the target
 */

/**
 * Represents the Targets structure
 * @typedef {object} TargetStruct
 * @property {string} kind - name of the target
 * @property {string} cmd - cmd the target needs
 * @property {string} uuid - uuid of the target
 * @property {DependencyStruct[]} dependencies_up - the dependency of the project up
 * @property {DependencyStruct[]} dependencies_down - the dependency of the project down
 */

/**
 * Represents the Projects structure
 * @typedef {object} ProjectStruct
 * @property {string} path - file location
 * @property {string} name - scoped or unscoped name
 * @property {string} kind - service, cli, etc
 * @property {boolean} publishable - whether or not it is publishable
 * @property {TargetStruct[]} targets - the targets of the project
 * @property {string[]} up_dep_uuids - the target deps of the project as guids upwards
 * @property {string[]} down_dep_uuids - the target deps of the project as guids downwards
 */

/**
 * Represents the Monojs.json structure
 * @typedef {object} MonoStruct
 * @property {number} version - the version of the js file
 * @property {ProjectStruct[] | undefined} projects - the version of the js file
 */

/**
 * Loads the monojs.json file and validates with current version of monojs
 * @returns {Promise<MonoStruct>} mono struct of a certain version
 */
export async function load_mono() {
  return await fs
    .readFile(process.cwd() + '/monojs.json', { encoding: 'utf8' })
    .then(data => {
      /** @type {MonoStruct} */
      const obj = JSON.parse(data);
      if (obj.version > 0) {
        console.error(`!expected correct monojs version for monojs file
        found '${obj.version}' expected version 0
        suggestions:
        - install an older version of monojs globally
        - or upgrade the current monojs file with \`monojs upgrade\``);
        throw Error('error');
      }
      return obj;
    });
}

/**
 * @param {MonoStruct} mono - this is the mono object from load_mono
 * @param {ProjectStruct} project - this is the project to add
 * @returns {void}
 */
export function add_project(mono, project) {
  mono.projects.push(project);
}

/**
 * @param {ProjectStruct} project - this is the project object
 * @param {string} cmd - this is the cmd for the target
 * @param {string} kind - this is the kind for the target. TargetValues
 * @returns {void}
 */
export function add_target(project, cmd, kind) {
  /** @type {TargetStruct} */
  const target = { cmd, kind, uuid: 'a', dependencies_down: [], dependencies_up: [] };
  project.targets.push(target);
}
