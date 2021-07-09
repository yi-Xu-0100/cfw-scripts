const exec = require('util').promisify(require('child_process').exec);
module.exports.parse = async (raw, { console }, { url }) => {
  const { stdout: output } = await exec(
    `curl -H "User-Agent:Quantumult%20X/1.0.23 (iPhone12,3; iOS 14.6)" -I ${url}`
  );
  console.log(output.toLowerCase());
  if (/subscription-userinfo:\s(.+?)[\r\n]/.test(output.toLowerCase())) {
    return `# ${RegExp.$1.trim()};\n${raw}`;
  }
  return raw;
};
