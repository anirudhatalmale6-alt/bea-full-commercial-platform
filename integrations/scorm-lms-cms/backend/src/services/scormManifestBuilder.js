'use strict';

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildScorm12Manifest(definition) {
  const id = definition.identifier || definition.package_key || 'BEA_SCORM_PACKAGE';
  const title = escapeXml(definition.title || 'British English Academy SCORM Package');
  const launch = escapeXml(definition.launch_path || 'index.html');
  const mastery = Number(definition.mastery_score || 80);
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${escapeXml(id)}" version="1.2"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-1">
    <organization identifier="ORG-1">
      <title>${title}</title>
      <item identifier="ITEM-1" identifierref="RES-1">
        <title>${title}</title>
        <adlcp:masteryscore>${mastery}</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1" type="webcontent" adlcp:scormtype="sco" href="${launch}">
      <file href="${launch}" />
      <file href="scormdriver.js" />
      <file href="content/data.json" />
    </resource>
  </resources>
</manifest>`;
}

function buildScorm2004Manifest(definition) {
  const id = definition.identifier || definition.package_key || 'BEA_SCORM_2004_PACKAGE';
  const title = escapeXml(definition.title || 'British English Academy SCORM 2004 Package');
  const launch = escapeXml(definition.launch_path || 'index.html');
  const mastery = Number(definition.mastery_score || 80);
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${escapeXml(id)}" version="1.0"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
  xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  <organizations default="ORG-1">
    <organization identifier="ORG-1">
      <title>${title}</title>
      <item identifier="ITEM-1" identifierref="RES-1" isvisible="true">
        <title>${title}</title>
        <imsss:sequencing>
          <imsss:controlMode choice="true" flow="true" />
          <imsss:objectives>
            <imsss:primaryObjective objectiveID="PRIMARYOBJ" satisfiedByMeasure="true">
              <imsss:minNormalizedMeasure>${(mastery / 100).toFixed(2)}</imsss:minNormalizedMeasure>
            </imsss:primaryObjective>
          </imsss:objectives>
        </imsss:sequencing>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1" type="webcontent" adlcp:scormType="sco" href="${launch}">
      <file href="${launch}" />
      <file href="scormdriver.js" />
      <file href="content/data.json" />
    </resource>
  </resources>
</manifest>`;
}

function buildManifest(definition) {
  if (definition.scorm_version === '2004-4th') return buildScorm2004Manifest(definition);
  return buildScorm12Manifest(definition);
}

module.exports = { buildManifest, buildScorm12Manifest, buildScorm2004Manifest };
