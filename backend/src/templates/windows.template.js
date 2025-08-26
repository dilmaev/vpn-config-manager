const { baseTemplate, createMoscowOutbound, createGermanyOutbound } = require('./base.template');

function generateWindowsConfig(moscowData, germanyData) {
  const germanyOutbounds = createGermanyOutbound(germanyData, moscowData);
  
  return {
    ...baseTemplate,
    inbounds: [
      {
        type: "mixed",
        listen: "127.0.0.1",
        listen_port: 2080,
        sniff: true,
        set_system_proxy: true
      }
    ],
    outbounds: [
      ...baseTemplate.outbounds,
      createMoscowOutbound(moscowData),
      ...(Array.isArray(germanyOutbounds) ? germanyOutbounds : [germanyOutbounds])
    ]
  };
}

module.exports = generateWindowsConfig;