const TemplateKind = {
  SERVICE: 'services',
  CLI: 'clis',
  APP: 'apps',
  PACKAGE: 'packages',
};

const SupportedTemplates = {
  koa: TemplateKind.SERVICE,
  uws: TemplateKind.SERVICE,
  mini: TemplateKind.CLI,
  package: TemplateKind.PACKAGE,
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
