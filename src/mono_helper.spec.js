import { get_run_chain_top } from './mono_helper.js';
describe('mono_helper', () => {
  it('should get the correct run chain from top 2 deep', async () => {
    /** @type {import('./mono_helper.js').DependencyStruct[]} */
    const deps = [];
    /** @type {import('./mono_helper.js').TargetStruct[]} */
    const targets = [
      {
        kind: 'lint',
        cmd: 'lint1',
        uuid: 'a',
        dependencies_down: [],
        dependencies_up: [],
      },
      {
        kind: 'build',
        cmd: 'build1',
        uuid: 'b',
        dependencies_up: [],
        dependencies_down: [],
      },
      {
        kind: 'test',
        cmd: 'test1',
        uuid: 'b',
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
        publishable: false,
        targets: [targets[0], targets[1], targets[2]],
      },
      {
        path: 'p2',
        name: 'p2',
        type: 'lib',
        publishable: false,
        targets: [targets[3], targets[4], targets[5]],
      },
      {
        path: 'p3',
        name: 'p3',
        type: 'lib',
        publishable: true,
        targets: [targets[6], targets[7], targets[8]],
      },
    ];
    /** @type {import('./mono_helper.js').MonoStruct} */
    const mono = {
      version: 0,
      projects: projects,
    };

    const result = get_run_chain_top(mono, mono.projects[0], 'test');
    expect(result).toBe({
      lint: ['lint1', 'lint2', 'lint3'],
      build: ['build1', 'build2', 'build3'],
      test: ['test1', 'test2', 'test3'],
      e2e: [],
      install: [],
      publish: [],
      service: [],
    });
  });
});
