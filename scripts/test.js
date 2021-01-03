module.exports.parse = async (raw, { yaml }) => {
  var rawObj = yaml.parse(raw);
  raw = yaml.stringify(rawObj);
  return raw;
};
