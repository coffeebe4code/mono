const TemplateKind = {
  SERVICE: 'services',
  CLI: 'clis',
  UI: 'apps',
  MOBILE: 'apps',
  LIB: 'libs',
};

const SupportedTemplates = {
  //express: TemplateKind.SERVICE,
  koa: TemplateKind.SERVICE,
  cli: TemplateKind.CLI,
  //package: TemplateKind.LIB,
};

/**
 * @param {string} name - name of template
 * @returns {string | undefined} - returns the path location or undefined if not found
 */
function get_template_kind_path(name) {
  //* @type {string | undefined} */
  let result = undefined;
  Object.entries(SupportedTemplates).forEach(([key, val]) => {
    if (key === name) {
      result = val;
    }
  });
  return result;
}

/**
 * @returns {string[]} - returns the supported templates
 */
function get_templates() {
  return Object.keys(SupportedTemplates).map(key => {
    return key;
  });
}

export { TemplateKind, SupportedTemplates, get_template_kind_path, get_templates };
