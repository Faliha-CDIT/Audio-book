const { withAndroidManifest } = require('@expo/config-plugins');
const { mkdirSync, writeFileSync } = require('fs');
const { resolve, join } = require('path');

/**
 * Expo Config Plugin: withNetworkSecurityConfig
 * 
 * This plugin adds an Android Network Security Configuration that enforces
 * SSL/TLS certificate pinning for the app's backend domain (sarva.cditproject.org).
 * This prevents Man-in-the-Middle (MITM) attacks by rejecting any certificate
 * that doesn't match the pinned public keys, even if the attacker has installed
 * a rogue CA certificate on the device.
 * 
 * Pins included:
 *   - Leaf certificate public key (sarva.cditproject.org)
 *   - Let's Encrypt E7 intermediate CA
 *   - ISRG Root X2 (backup root CA)
 * 
 * IMPORTANT: When the server's SSL certificate is renewed, the leaf pin
 * will change. The intermediate and root pins provide continuity as long
 * as Let's Encrypt is used as the CA. If the CA provider changes, all
 * pins must be updated.
 */

const NETWORK_SECURITY_CONFIG_XML = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Default configuration: block cleartext traffic globally -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>

    <!-- Pin certificates for the backend API domain -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">sarva.cditproject.org</domain>
        <pin-set expiration="2026-12-31">
            <!--
                Leaf certificate public key pin (sarva.cditproject.org)
                Verified via SSL Labs.
            -->
            <pin digest="SHA-256">Uy2TNyL+767SoiAuwAqTWdMm1KdvUQy/h6mrclypvDg=</pin>

            <!--
                Let's Encrypt E7 intermediate CA pin.
                Provides continuity during leaf certificate renewals.
            -->
            <pin digest="SHA-256">y7xVm0TVJNahMr2sZydE2jQH8SquXV9yLF9seROHHHU=</pin>

            <!--
                ISRG Root X1 (Let's Encrypt root CA) - backup pin.
                Most stable pin; changes only if Let's Encrypt changes root CA.
            -->
            <pin digest="SHA-256">C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=</pin>
        </pin-set>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
</network-security-config>`;

function withNetworkSecurityConfig(config) {
  return withAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];

    if (mainApplication) {
      // Set the networkSecurityConfig attribute on <application>
      mainApplication.$['android:networkSecurityConfig'] =
        '@xml/network_security_config';
    }

    // Write the network_security_config.xml to android/app/src/main/res/xml/
    // Only execute if we have a valid platform project root (during prebuild/build)
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
