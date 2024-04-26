import { get_run_chain_top } from './mono_helper.js';

describe('mono_helper', () => {
  /** @type {import('./mono_helper.js').DependencyStruct[]} */
  const deps = [
    // lib 1 lint
    { path: 'p2', uuid: 'd' },
    // lib 2 lint
    { path: 'p3', uuid: 'g' },
    // lib 1 build
    { path: 'p2', uuid: 'e' },
    // lib 2 build
    { path: 'p3', uuid: 'h' },
  ];
  /** @type {import('./mono_helper.js').TargetStruct[]} */
  const targets = [
    // service
    {
      kind: 'lint',
      cmd: 'p1lint',
      uuid: 'a',
      dependencies_up: [],
      dependencies_down: [deps[0], deps[1], deps[2], deps[3]],
    },
    {
      kind: 'build',
      cmd: 'p1build',
      uuid: 'b',
      dependencies_up: [],
      dependencies_down: [deps[0], deps[1], deps[2], deps[3]],
    },
    {
      kind: 'test',
      cmd: 'p1test',
      uuid: 'c',
      dependencies_up: [],
      dependencies_down: [],
    },
    // lib 1
    {
      kind: 'lint',
      cmd: 'p2lint',
      uuid: 'd',
      dependencies_down: [deps[1], deps[3]],
      dependencies_up: [],
    },
    {
      kind: 'build',
      cmd: 'p2build',
      uuid: 'e',
      dependencies_up: [],
      dependencies_down: [deps[1], deps[3]],
    },
    {
      kind: 'test',
      cmd: 'p2test',
      uuid: 'f',
      dependencies_up: [],
      dependencies_down: [],
    },
    // lib 2
    {
      kind: 'lint',
      cmd: 'p3lint',
      uuid: 'g',
      dependencies_down: [],
      dependencies_up: [],
    },
    {
      kind: 'build',
      cmd: 'p3build',
      uuid: 'h',
      dependencies_up: [],
      dependencies_down: [],
    },
    {
      kind: 'test',
      cmd: 'p3test',
      uuid: 'i',
      dependencies_up: [],
      dependencies_down: [],
    },
  ];
  /** @type {import('./mono_helper.js').ProjectStruct[]} */
  const projects = [
    {
      path: 'p1',
      name: 'p1',
      type: 'service',
      targets: [targets[0], targets[1], targets[2]],
    },
    {
      path: 'p2',
      name: 'p2',
      type: 'lib',
      targets: [targets[3], targets[4], targets[5]],
    },
    {
      path: 'p3',
      name: 'p3',
      type: 'lib',
      targets: [targets[6], targets[7], targets[8]],
    },
  ];
  /** @type {import('./mono_helper.js').MonoStruct} */
  const mono = {
    version: 0,
    projects: projects,
  };

  it('should get the correct run chain from top 2 deep', async () => {
    const result = get_run_chain_top(mono, mono.projects[0], 'build');
    expect(result).toStrictEqual({
      lint: ['p1lint', 'p2lint', 'p3lint'],
      build: ['p2build', 'p3build', 'p1build'],
      test: [],
      //test: ['p1test', 'p2test', 'p3test'],
      e2e: [],
      install: [],
      publish: [],
      serve: [],
    });
  });

  it('should get the correct run chain from bottom 2 up', async () => {
    //todo:: create logic and this test
    const result = get_run_chain_top(mono, mono.projects[0], 'build');
    expect(result).toStrictEqual({
      lint: ['p1lint', 'p2lint', 'p3lint'],
      build: ['p2build', 'p3build', 'p1build'],
      test: [],
      //test: ['p1test', 'p2test', 'p3test'],
      e2e: [],
      install: [],
      publish: [],
      serve: [],
    });
  });
});
