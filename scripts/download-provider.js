const { homedir } = require('os');
const { join, isAbsolute, dirname } = require('path');
const { existsSync, writeFileSync, mkdirSync } = require('fs');

const downloadProvider = async ({ path, url }, axios) => {
  const homeDirectory = join(homedir(), '.config/clash');
  const { data = 'payload: []' } = await axios.get(url);
  if (path) {
    const filePath = isAbsolute(path) ? path : join(homeDirectory, path);
    const fileDir = dirname(filePath);
    if (!existsSync(fileDir)) {
      mkdirSync(fileDir, { recursive: true });
    }
    if (!existsSync(filePath)) {
      writeFileSync(filePath, data);
    }
  }
};

module.exports.parse = async (raw, { yaml, axios }) => {
  const {
    'rule-providers': ruleProviders = {},
    'proxy-providers': proxyProviders = {}
  } = yaml.parse(raw);
  await Promise.all(
    Object.entries(ruleProviders)
      .concat(Object.entries(proxyProviders))
      .map(([, info]) => downloadProvider(info, axios))
  );

  return raw;
};
