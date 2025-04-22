const TemplateFolderKind = {
  SERVICE: "services",
  CLI: "clis",
  APP: "apps",
  PACKAGE: "packages",
};

const TemplateKind = {
  SERVICE: "service",
  CLI: "cli",
  APP: "app",
  PACKAGE: "package",
};

/**
 * @param {string} name - name of template
 * @returns {string | undefined} - returns the path location or undefined if not found
 */
function get_template_folder_kind(name) {
  //* @type {string | undefined} */
  let result = undefined;
  Object.entries(TemplateFolderKind).forEach(([key, val]) => {
    if (key.toLowerCase() === name) {
      result = val;
    }
  });
  return result;
}

const SupportedPathTemplates = {
  uws: TemplateFolderKind.SERVICE,
  mini: TemplateFolderKind.CLI,
  package: TemplateFolderKind.PACKAGE,
};

const SupportedTemplates = {
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
  Object.entries(SupportedPathTemplates).forEach(([key, val]) => {
    if (key === name) {
      result = val;
    }
  });
  return result;
}

/**
 * @param {string} name - name of template
 * @returns {string} - returns the path location or undefined if not found
 */
function get_template_kind(name) {
  //* @type {string} */
  let result = "";
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
  return Object.keys(SupportedTemplates).map((key) => {
    return key;
  });
}

export {
  TemplateKind,
  TemplateFolderKind,
  SupportedTemplates,
  get_template_kind,
  get_template_folder_kind,
  get_template_kind_path,
  get_templates,
};
