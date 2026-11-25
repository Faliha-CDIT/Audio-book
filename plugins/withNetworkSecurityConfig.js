const { withAndroidManifest } = require('@expo/config-plugins');
const { mkdirSync, writeFileSync } = require('fs');
const { resolve, join } = require('path');

/**
 * Expo Config Plugin: withNetworkSecurityConfig
 *
 * Configures Android Network Security to:
 *   - Block cleartext (HTTP) traffic globally (HTTPS only).
 *   - Trust Android's built-in system CA store (<certificates src="system" />),
 *     excluding user-installed CAs.
 *
 * NOTE: Certificate pinning (<pin-set>) was intentionally removed because
 * Let's Encrypt rotates intermediate CAs (e.g. E7 -> YE2 -> Root YE) and
 * newer Android devices terminate chains at ISRG Root X2 while older devices
 * terminate at ISRG Root X1, causing pin-set mismatches that blocked API and
 * audio requests on some Android models.
 */

const NETWORK_SECURITY_CONFIG_XML = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Block cleartext (HTTP) traffic on all connections and trust system CAs only -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>

    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">sarva.cditproject.org</domain>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
</network-security-config>`;

function withNetworkSecurityConfig(config) {
  return withAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];

    if (mainApplication) {
      mainApplication.$['android:networkSecurityConfig'] =
        '@xml/network_security_config';
    }

    if (config.modRequest && config.modRequest.platformProjectRoot) {
      const resXmlDir = resolve(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'xml'
      );

      mkdirSync(resXmlDir, { recursive: true });

      const xmlFilePath = join(resXmlDir, 'network_security_config.xml');
      writeFileSync(xmlFilePath, NETWORK_SECURITY_CONFIG_XML, 'utf-8');
    }

    return config;
  });
}

module.exports = withNetworkSecurityConfig;
