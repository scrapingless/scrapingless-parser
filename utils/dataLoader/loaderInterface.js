class MenuInterface {
  /**
   * get parse Filter configuration
   */
  getParseFilter = (domain) => {
    throw new Error("not implemented!");
  };

  /**
   * get single rule configuration
   */
  getParseRule = (name) => {
    throw new Error("not implemented!");
  };

  /**
   * get all templates configuration
   */
  getTemplates = (domain) => {
    throw new Error("not implemented!");
  };
}
