const os = require('os');
const mem_total = os.totalmem();
const mem_free = os.freemem();
const mem_ratio = parseInt(((mem_total - mem_free) / mem_total) * 100);
async function getCPUUsage() {
  function _getCPUInfo() {
    const cpus = os.cpus();
    let user = 0,
      nice = 0,
      sys = 0,
      idle = 0,
      irq = 0,
      total = 0;

    for (let cpu in cpus) {
      const times = cpus[cpu].times;
      user += times.user;
      nice += times.nice;
      sys += times.sys;
      idle += times.idle;
      irq += times.irq;
    }

    total += user + nice + sys + idle + irq;

    return {
      user,
      sys,
      idle,
      total
    };
  }
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const t1 = _getCPUInfo();
  await sleep(100);
  const t2 = _getCPUInfo();
  const idle = t2.idle - t1.idle;
  const total = t2.total - t1.total;
  let usage = 1 - idle / total;
  usage = (usage * 100.0).toFixed(0) + '%';
  return usage;
}
module.exports.run = async () => {
  const CPU = await getCPUUsage();
  return [`CPU: ${CPU}`, `内存: ${mem_ratio}%`];
};
