var de = require("jinjs").defaultEnvironment;
tpl = eval(de.getTemplateSourceFromString("{{toto}}"));

exports.tpl = tpl;