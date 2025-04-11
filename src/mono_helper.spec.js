/** @typedef {import('./mono_helper.js').DependencyStruct} DependencyStruct*/
/** @typedef {import('./mono_helper.js').ProjectStruct} ProjectStruct */
/** @typedef {import('./mono_helper.js').TargetStruct} TargetStruct */
/** @typedef {import('./mono_helper.js').MonoStruct} MonoStruct*/

describe('mono_helper', () => {
  /** @type {DependencyStruct[]} */
  const deps = [
    // lib 1 lint
    { name: 'p2', uuid: 'd' },
    // lib 2 lint
    { name: 'p3', uuid: 'g' },
    // lib 1 build
    { name: 'p2', uuid: 'e' },
    // lib 2 build
    { name: 'p3', uuid: 'h' },
  ];
  /** @type {TargetStruct[]} */
  const targets = [
    // service
    {
      kind: 'lint',
      uuid: 'a',
      dependencies_down: [deps[0], deps[1], deps[2], deps[3]],
    },
    {
      kind: 'build',
      uuid: 'b',
      dependencies_down: [deps[0], deps[1], deps[2], deps[3]],
    },
    {
      kind: 'test',
      uuid: 'c',
      dependencies_down: [],
    },
    // lib 1
    {
      kind: 'lint',
      uuid: 'd',
      dependencies_down: [deps[1], deps[3]],
    },
    {
      kind: 'build',
      uuid: 'e',
      dependencies_down: [deps[1], deps[3]],
    },
    {
      kind: 'test',
      uuid: 'f',
      dependencies_down: [],
    },
    // lib 2
    {
      kind: 'lint',
      uuid: 'g',
      dependencies_down: [],
    },
    {
      kind: 'build',
      uuid: 'h',
      dependencies_down: [],
    },
    {
      kind: 'test',
      uuid: 'i',
      dependencies_down: [],
    },
  ];
  /** @type {ProjectStruct[]} */
  const projects = [
    {
      name: 'p1',
      type: 'service',
      targets: [targets[0], targets[1], targets[2]],
    },
    {
      name: 'p2',
      type: 'package',
      targets: [targets[3], targets[4], targets[5]],
    },
    {
      name: 'p3',
      type: 'package',
      targets: [targets[6], targets[7], targets[8]],
    },
  ];

  const mono = {
    version: 0,
    projects: projects,
  };

  it('should assert not null', async () => {
    expect(mono).toBeTruthy();
  });
});
