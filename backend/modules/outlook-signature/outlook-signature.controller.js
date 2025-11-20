const { OutlookSignature } = require("./outlook-signature.model");
const userService = require("../../services/userService");

/**
 * Helper function to get base URL with forced HTTPS for Outlook compatibility
 * Microsoft requires all Outlook add-in URLs to use HTTPS
 */
function getBaseUrlWithHttps(req) {
  let baseUrl = process.env.BACKEND_URL;

  if (!baseUrl) {
    // Check for proxy headers (X-Forwarded-Proto, X-Forwarded-Host)
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('x-forwarded-host') || req.get('host');
    // Force HTTPS for Outlook (Microsoft requirement)
    baseUrl = `https://${host}`;
  }

  // Ensure baseUrl uses HTTPS
  if (baseUrl.startsWith('http://')) {
    console.warn('⚠️  WARNING: Outlook requires HTTPS. Converting HTTP to HTTPS.');
    baseUrl = baseUrl.replace('http://', 'https://');
  }

  return baseUrl;
}

const ZERO_WIDTH_SPACE = '\u200B';

function insertZeroWidthSpaces(text) {
  if (!text) return '';
  return text.replace(/([@.])/g, `$1${ZERO_WIDTH_SPACE}`);
}

// Default HTML template from requirements - Outlook compatible with inline styles
const DEFAULT_HTML_TEMPLATE = `<!--[if mso]>
<style type="text/css">
@font-face{font-family:"AktivGrotesk";src:url("https://cdn-ileaolp.nitrocdn.com/XyERqqlzUUUQQwlWmuaJLVHDbQgsqGcu/assets/static/source/rev-0cb01a5/betasite.exctel.com/wp-content/uploads/2025/03/AktivGrotesk-Regular.otf") format("opentype");font-weight:400;font-style:normal;font-display:swap}
body, table, td { font-family: "AktivGrotesk", Arial, sans-serif !important; }
</style>
<![endif]-->
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:15px;line-height:1.4;color:#333;width:600px;margin:0;padding:0">
<tr>
<td valign="top" style="padding-right:20px;width:180px;font-family:'AktivGrotesk',Arial,sans-serif">
<div style="font-weight:bold;color:#000;font-size:17px;margin-bottom:2px;font-family:'AktivGrotesk',Arial,sans-serif;line-height:1.2">%%FirstName%% %%LastName%%</div>
%%IF_TITLE%%<div style="color:#000;font-size:16px;margin-bottom:15px;font-family:'AktivGrotesk',Arial,sans-serif;line-height:1.2">%%Title%%</div>%%ENDIF_TITLE%%
<div style="margin-bottom:15px"><img src="https://cdn-ileaolp.nitrocdn.com/XyERqqlzUUUQQwlWmuaJLVHDbQgsqGcu/assets/images/optimized/rev-6c1cac3/betasite.exctel.com/wp-content/uploads/2025/04/Exctel-Logo-FA.png" alt="Exctel" width="160" style="display:block;border:none;outline:none"></div>
</td>
<td valign="top" style="padding-left:20px;font-size:14px;color:#333;font-family:'AktivGrotesk',Arial,sans-serif">
<table cellpadding="3" cellspacing="0" border="0" style="font-size:14px;font-family:'AktivGrotesk',Arial,sans-serif">
%%IF_EMAIL%%<tr><td style="width:20px;padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=100&id=blLagk1rxZGp&format=png&color=000000" alt="Email" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%Email%%</td></tr>%%ENDIF_EMAIL%%
%%IF_MOBILE%%<tr><td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=100&id=11471&format=png&color=000000" alt="Mobile" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%MobileNumber%%</td></tr>%%ENDIF_MOBILE%%
%%IF_FAX%%<tr><td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=100&id=11471&format=png&color=000000" alt="Fax" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%FaxNumber%%</td></tr>%%ENDIF_FAX%%
%%IF_PHONE%%<tr><td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=200&id=pjumbCENHfje&format=png&color=000000" alt="Landline" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%PhoneNumber%%</td></tr>%%ENDIF_PHONE%%
%%IF_STREET%%<tr><td style="padding-right:8px;vertical-align:top;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/marker.png" alt="Address" width="12" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%Street%%</td></tr>%%ENDIF_STREET%%
</table>
</td>
</tr></table>
<table width="600" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:2px solid #ff8331;line-height:0;font-size:0;margin:2px;padding:0">&nbsp;</td></tr></table>
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:14px;width:500px;margin-top:10px">
<tr><td style="width:180px;padding-right:20px;font-family:'AktivGrotesk',Arial,sans-serif"><span style="color:#000;font-weight:bold;font-family:'AktivGrotesk',Arial,sans-serif">w&#8203;w&#8203;w&#8203;.&#8203;exctel&#8203;.&#8203;com</span></td>
<td style="padding-left:20px;font-family:'AktivGrotesk',Arial,sans-serif">
<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/linkedin.png" width="20" height="20" alt="LinkedIn" style="display:block;border:none;outline:none"></td>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://www.freeiconspng.com/uploads/new-x-twitter-logo-png-photo-1.png" width="20" height="20" alt="X" style="display:block;border:none;outline:none"></td>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/facebook-new.png" width="20" height="20" alt="Facebook" style="display:block;border:none;outline:none"></td>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/instagram-new.png" width="20" height="20" alt="Instagram" style="display:block;border:none;outline:none"></td>
</tr></table>
</td></tr></table>
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:9px;line-height:1.4;color:#333;width:600px;margin-top:10px">
<tr><td style="padding-top:10px;font-style:italic;color:#555;text-align:justify;font-family:'AktivGrotesk',Arial,sans-serif">
    This email and any attachments are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you are not the intended recipient, please delete this message, notify the sender immediately, and note that any review, use, disclosure, or distribution of its contents is strictly prohibited. We accept no liability for any errors, delays, or security issues that may arise during the transmission of this email.
</td></tr></table>`;

/**
 * Replace placeholders in HTML template with actual values
 */
function replacePlaceholders(template, userProfile, placeholders = {}) {
  let html = template;

  // Map user profile fields to placeholders
  const mapping = {
    '%%FirstName%%': userProfile.firstName || placeholders.FirstName || '',
    '%%LastName%%': userProfile.lastName || placeholders.LastName || '',
    '%%Title%%': userProfile.jobTitle || placeholders.Title || '',
    '%%Email%%': userProfile.mail || placeholders.Email || '',
    '%%MobileNumber%%': userProfile.mobilePhone || placeholders.MobileNumber || '',
    '%%FaxNumber%%': userProfile.faxNumber || placeholders.FaxNumber || '',
    '%%PhoneNumber%%': userProfile.phoneNumber || placeholders.PhoneNumber || '',
    '%%Street%%': userProfile.street || placeholders.Street || '',
    '%%City%%': userProfile.city || placeholders.City || '',
    '%%State%%': userProfile.state || placeholders.State || '',
    '%%PostalCode%%': userProfile.postalCode || placeholders.PostalCode || '',
    '%%Country%%': userProfile.country || placeholders.Country || '',
    '%%CompanyName%%': userProfile.companyName || placeholders.CompanyName || 'Exctel',
    '%%Department%%': userProfile.department || placeholders.Department || '',
  };

  // Prevent Outlook auto-linking by inserting zero-width spaces
  if (mapping['%%Email%%']) {
    mapping['%%Email%%'] = insertZeroWidthSpaces(mapping['%%Email%%']);
  }

  // Handle conditional blocks - only show rows if the field has data
  const conditionalFields = {
    'TITLE': userProfile.jobTitle || placeholders.Title || '',
    'EMAIL': userProfile.mail || placeholders.Email || '',
    'MOBILE': userProfile.mobilePhone || placeholders.MobileNumber || '',
    'FAX': userProfile.faxNumber || placeholders.FaxNumber || '',
    'PHONE': userProfile.phoneNumber || placeholders.PhoneNumber || '',
    'STREET': userProfile.street || placeholders.Street || '',
  };

  // Process each conditional block
  Object.keys(conditionalFields).forEach(field => {
    const value = conditionalFields[field];
    const ifPattern = `%%IF_${field}%%`;
    const endifPattern = `%%ENDIF_${field}%%`;
    const regex = new RegExp(`${ifPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)${endifPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');

    if (value && value.trim() !== '') {
      // Replace the conditional block with its content
      html = html.replace(regex, '$1');
    } else {
      // Remove the conditional block entirely if field is empty
      html = html.replace(regex, '');
    }
  });

  // Replace all placeholders
  Object.keys(mapping).forEach(placeholder => {
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    html = html.replace(regex, mapping[placeholder]);
  });

  return html;
}

/**
 * Outlook Signature Controller
 */
class OutlookSignatureController {
  /**
   * Get all signature configs for the current user
   */
  getAllConfigs = async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.email || req.user?.oid;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const configs = await OutlookSignature.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        data: configs,
      });
    } catch (error) {
      console.error("Get Configs Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch signature configurations",
        error: error.message,
      });
    }
  };

  /**
   * Get single signature config by ID
   */
  getConfigById = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?.email || req.user?.oid;

      const config = await OutlookSignature.findOne({
        _id: id,
        user_id: userId,
      }).lean();

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Signature configuration not found",
        });
      }

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      console.error("Get Config Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch signature configuration",
        error: error.message,
      });
    }
  };

  /**
   * Create new signature config
   */
  createConfig = async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.email || req.user?.oid;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const {
        signature_name,
        html_template,
        placeholders,
        user_profile,
        description,
        is_active = true,
      } = req.body;

      // Use default template if none provided
      const template = html_template || DEFAULT_HTML_TEMPLATE;

      const config = new OutlookSignature({
        signature_name: signature_name || "My Signature",
        user_id: userId,
        html_template: template,
        placeholders: placeholders || {},
        user_profile: user_profile || {},
        description,
        is_active,
        created_by: userId,
        updated_by: userId,
      });

      await config.save();

      res.status(201).json({
        success: true,
        data: config,
        message: "Signature configuration created successfully",
      });
    } catch (error) {
      console.error("Create Config Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create signature configuration",
        error: error.message,
      });
    }
  };

  /**
   * Update signature config
   */
  updateConfig = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?.email || req.user?.oid;

      const {
        signature_name,
        html_template,
        placeholders,
        user_profile,
        description,
        is_active,
      } = req.body;

      const config = await OutlookSignature.findOne({
        _id: id,
        user_id: userId,
      });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Signature configuration not found",
        });
      }

      // Update fields
      if (signature_name !== undefined) config.signature_name = signature_name;
      if (html_template !== undefined) config.html_template = html_template;
      if (placeholders !== undefined) config.placeholders = placeholders;
      if (user_profile !== undefined) config.user_profile = { ...config.user_profile, ...user_profile };
      if (description !== undefined) config.description = description;
      if (is_active !== undefined) config.is_active = is_active;
      config.updated_by = userId;
      config.version += 1;

      await config.save();

      res.json({
        success: true,
        data: config,
        message: "Signature configuration updated successfully",
      });
    } catch (error) {
      console.error("Update Config Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update signature configuration",
        error: error.message,
      });
    }
  };

  /**
   * Delete signature config
   */
  deleteConfig = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?.email || req.user?.oid;

      const config = await OutlookSignature.findOneAndDelete({
        _id: id,
        user_id: userId,
      });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Signature configuration not found",
        });
      }

      res.json({
        success: true,
        message: "Signature configuration deleted successfully",
      });
    } catch (error) {
      console.error("Delete Config Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete signature configuration",
        error: error.message,
      });
    }
  };

  /**
   * Generate HTML preview from template
   */
  generatePreview = async (req, res) => {
    try {
      const { html_template, user_profile, placeholders } = req.body;

      if (!html_template) {
        return res.status(400).json({
          success: false,
          message: "HTML template is required",
        });
      }

      const template = html_template || DEFAULT_HTML_TEMPLATE;
      const profile = user_profile || {};
      const placeholderMap = placeholders || {};

      const previewHtml = replacePlaceholders(template, profile, placeholderMap);

      res.json({
        success: true,
        data: {
          html: previewHtml,
        },
      });
    } catch (error) {
      console.error("Generate Preview Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate preview",
        error: error.message,
      });
    }
  };

  /**
   * Generate Outlook Add-in manifest and code files
   */
  generateAddin = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?.email || req.user?.oid;

      const config = await OutlookSignature.findOne({
        _id: id,
        user_id: userId,
      }).lean();

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Signature configuration not found",
        });
      }

      // Get user preferences to check auto-insert setting
      let autoInsert = true; // Default to true
      try {
        const user = await userService.getUserByAzureId(userId);
        if (user && user.preferences) {
          autoInsert = user.preferences.outlook_signature_auto_insert !== false;
        }
      } catch (userError) {
        console.warn("Could not fetch user preferences, defaulting to auto-insert:", userError);
      }

      // Get base URL with HTTPS enforced (Microsoft requirement)
      const baseUrl = getBaseUrlWithHttps(req);
      const manifestUrl = `${baseUrl}/api/outlook-signature/manifest/${id}`;
      const commandsUrl = `${baseUrl}/api/outlook-signature/commands/${id}`;

      // Generate manifest XML with auto-insert setting
      const manifestXml = generateManifestXML(autoInsert, commandsUrl);

      // Generate JavaScript code with auto-insert setting
      const jsCode = generateJavaScriptCode(config, autoInsert);

      res.json({
        success: true,
        data: {
          manifest: manifestXml,
          javascript: jsCode,
          manifestUrl: manifestUrl,
          commandsUrl: commandsUrl,
          config: {
            signature_name: config.signature_name,
            html_template: config.html_template,
            autoInsert: autoInsert,
          },
        },
      });
    } catch (error) {
      console.error("Generate Add-in Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate add-in files",
        error: error.message,
      });
    }
  };

  /**
   * Serve manifest.xml file
   */
  serveManifest = async (req, res) => {
    try {
      const { id } = req.params;
      // Try to get user from token, but allow public access for Outlook
      const userId = req.user?.id || req.user?.email || req.user?.oid;

      // Find config - allow access even without user if config exists
      const query = { _id: id };
      if (userId) {
        query.user_id = userId;
      }

      const config = await OutlookSignature.findOne(query).lean();

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Signature configuration not found",
        });
      }

      // Use config's user_id if we don't have it from token
      const configUserId = userId || config.user_id;

      // Get user preferences to check auto-insert setting
      let autoInsert = true;
      if (configUserId) {
        try {
          const user = await userService.getUserByAzureId(configUserId);
          if (user && user.preferences) {
            autoInsert = user.preferences.outlook_signature_auto_insert !== false;
          }
        } catch (userError) {
          console.warn("Could not fetch user preferences, defaulting to auto-insert:", userError);
        }
      }

      // Get base URL with HTTPS enforced (Microsoft requirement)
      const baseUrl = getBaseUrlWithHttps(req);
      const commandsUrl = `${baseUrl}/api/outlook-signature/commands/${id}`;

      // Generate manifest with correct URLs
      const manifestXml = generateManifestXML(autoInsert, commandsUrl);

      res.setHeader('Content-Type', 'application/xml');
      res.send(manifestXml);
    } catch (error) {
      console.error("Serve Manifest Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to serve manifest",
        error: error.message,
      });
    }
  };

  /**
   * Serve commands.html file
   */
  serveCommands = async (req, res) => {
    try {
      const { id } = req.params;
      // Try to get user from token, but allow public access for Outlook
      const userId = req.user?.id || req.user?.email || req.user?.oid;

      // Find config - allow access even without user if config exists
      const query = { _id: id };
      if (userId) {
        query.user_id = userId;
      }

      const config = await OutlookSignature.findOne(query).lean();

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Signature configuration not found",
        });
      }

      // Use config's user_id if we don't have it from token
      const configUserId = userId || config.user_id;

      // Get user preferences to check auto-insert setting
      let autoInsert = true;
      if (configUserId) {
        try {
          const user = await userService.getUserByAzureId(configUserId);
          if (user && user.preferences) {
            autoInsert = user.preferences.outlook_signature_auto_insert !== false;
          }
        } catch (userError) {
          console.warn("Could not fetch user preferences, defaulting to auto-insert:", userError);
        }
      }

      // Generate JavaScript code
      const jsCode = generateJavaScriptCode(config, autoInsert);

      // Create HTML file that loads Office.js and the commands script
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Exctel Signature Commands</title>
    <script type="text/javascript" src="https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js"></script>
</head>
<body>
    <script type="text/javascript">
${jsCode}
    </script>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } catch (error) {
      console.error("Serve Commands Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to serve commands",
        error: error.message,
      });
    }
  };

  /**
   * Generate universal admin add-in (works for all users)
   */
  generateAdminAddin = async (req, res) => {
    try {
      // Get base URL with HTTPS enforced (Microsoft requirement)
      const baseUrl = getBaseUrlWithHttps(req);
      const commandsUrl = `${baseUrl}/api/outlook-signature/commands-universal`;

      // Generate universal manifest (always has auto-insert enabled by default)
      const manifestXml = generateUniversalManifestXML(commandsUrl);

      res.json({
        success: true,
        data: {
          manifest: manifestXml,
          manifestUrl: `${baseUrl}/api/outlook-signature/manifest-universal`,
          commandsUrl: commandsUrl,
        },
      });
    } catch (error) {
      console.error("Generate Admin Add-in Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate admin add-in files",
        error: error.message,
      });
    }
  };

  /**
   * Serve universal manifest.xml file (for admin installation)
   */
  serveUniversalManifest = async (req, res) => {
    try {
      // Set CORS headers to allow Outlook to access the manifest
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // Get base URL with HTTPS enforced (Microsoft requirement)
      const baseUrl = getBaseUrlWithHttps(req);
      const commandsUrl = `${baseUrl}/api/outlook-signature/commands-universal`;

      // Generate universal manifest
      const manifestXml = generateUniversalManifestXML(commandsUrl);

      res.setHeader('Content-Type', 'application/xml');
      res.send(manifestXml);
    } catch (error) {
      console.error("Serve Universal Manifest Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to serve universal manifest",
        error: error.message,
      });
    }
  };

  /**
   * Serve universal commands.html file (works for all users)
   */
  serveUniversalCommands = async (req, res) => {
    try {
      // Set CORS headers to allow Outlook to access the commands file
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Get base URL with HTTPS enforced (Microsoft requirement)
      const baseUrl = getBaseUrlWithHttps(req);

      // Generate universal JavaScript code that fetches user's config dynamically
      const jsCode = generateUniversalJavaScriptCode(baseUrl);

      // Create HTML file that loads Office.js and the commands script
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Exctel Signature Commands</title>
    <script type="text/javascript" src="https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js"></script>
</head>
<body>
    <script type="text/javascript">
${jsCode}
    </script>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } catch (error) {
      console.error("Serve Universal Commands Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to serve universal commands",
        error: error.message,
      });
    }
  };

  /**
   * Serve universal commands.js file (raw JavaScript for Runtime override)
   */
  serveUniversalCommandsJs = async (req, res) => {
    try {
      // Set CORS headers to allow Outlook to access the JavaScript file
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Get base URL with HTTPS enforced (Microsoft requirement)
      const baseUrl = getBaseUrlWithHttps(req);

      // Generate universal JavaScript code that fetches user's config dynamically
      const jsCode = generateUniversalJavaScriptCode(baseUrl);

      res.setHeader('Content-Type', 'application/javascript');
      res.send(jsCode);
    } catch (error) {
      console.error("Serve Universal Commands JS Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to serve universal commands JavaScript",
        error: error.message,
      });
    }
  };

  /**
   * Get user's signature config by Azure AD token (for universal add-in)
   */
  getUserSignatureConfig = async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.email || req.user?.oid;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // Find the user's active signature config
      const config = await OutlookSignature.findOne({
        user_id: userId,
        is_active: true,
      }).lean();

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "No active signature configuration found",
        });
      }

      // Get user preferences to check auto-insert setting
      let autoInsert = true;
      try {
        const user = await userService.getUserByAzureId(userId);
        if (user && user.preferences) {
          autoInsert = user.preferences.outlook_signature_auto_insert !== false;
        }
      } catch (userError) {
        console.warn("Could not fetch user preferences, defaulting to auto-insert:", userError);
      }

      res.json({
        success: true,
        data: {
          config: {
            html_template: config.html_template,
            user_profile: config.user_profile,
            autoInsert: autoInsert,
          },
        },
      });
    } catch (error) {
      console.error("Get User Signature Config Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get user signature config",
        error: error.message,
      });
    }
  };

  /**
   * Admin: Get all signature configs for all users
   */
  getAllConfigsAdmin = async (req, res) => {
    try {
      const configs = await OutlookSignature.find()
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        data: configs,
      });
    } catch (error) {
      console.error("Get All Configs Admin Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch all signature configurations",
        error: error.message,
      });
    }
  };

  /**
   * Admin: Get signature configs for a specific user
   */
  getUserConfigsAdmin = async (req, res) => {
    try {
      const { userId } = req.params;

      const configs = await OutlookSignature.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        data: configs,
      });
    } catch (error) {
      console.error("Get User Configs Admin Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user signature configurations",
        error: error.message,
      });
    }
  };

  /**
   * Admin: Create signature config for any user
   */
  createConfigAdmin = async (req, res) => {
    try {
      const {
        user_id,
        signature_name,
        html_template,
        placeholders,
        user_profile,
        description,
        is_active = true,
      } = req.body;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: "user_id is required",
        });
      }

      const template = html_template || DEFAULT_HTML_TEMPLATE;

      const config = new OutlookSignature({
        signature_name: signature_name || "My Signature",
        user_id: user_id,
        html_template: template,
        placeholders: placeholders || {},
        user_profile: user_profile || {},
        description,
        is_active,
        created_by: req.user?.id || req.user?.email || req.user?.oid || "admin",
        updated_by: req.user?.id || req.user?.email || req.user?.oid || "admin",
      });

      await config.save();

      res.status(201).json({
        success: true,
        data: config,
        message: "Signature configuration created successfully",
      });
    } catch (error) {
      console.error("Create Config Admin Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create signature configuration",
        error: error.message,
      });
    }
  };

  /**
   * Admin: Update signature config for any user
   */
  updateConfigAdmin = async (req, res) => {
    try {
      const { id } = req.params;

      const {
        signature_name,
        html_template,
        placeholders,
        user_profile,
        description,
        is_active,
      } = req.body;

      const config = await OutlookSignature.findById(id);

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Signature configuration not found",
        });
      }

      // Update fields
      if (signature_name !== undefined) config.signature_name = signature_name;
      if (html_template !== undefined) config.html_template = html_template;
      if (placeholders !== undefined) config.placeholders = placeholders;
      if (user_profile !== undefined) config.user_profile = { ...config.user_profile, ...user_profile };
      if (description !== undefined) config.description = description;
      if (is_active !== undefined) config.is_active = is_active;
      config.updated_by = req.user?.id || req.user?.email || req.user?.oid || "admin";
      config.version += 1;

      await config.save();

      res.json({
        success: true,
        data: config,
        message: "Signature configuration updated successfully",
      });
    } catch (error) {
      console.error("Update Config Admin Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update signature configuration",
        error: error.message,
      });
    }
  };

  /**
   * Admin: Delete signature config for any user
   */
  deleteConfigAdmin = async (req, res) => {
    try {
      const { id } = req.params;

      const config = await OutlookSignature.findByIdAndDelete(id);

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Signature configuration not found",
        });
      }

      res.json({
        success: true,
        message: "Signature configuration deleted successfully",
      });
    } catch (error) {
      console.error("Delete Config Admin Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete signature configuration",
        error: error.message,
      });
    }
  };

  /**
   * Admin: Update all signature templates to new format with conditional blocks
   */
  migrateAllTemplatesToNewFormat = async (req, res) => {
    try {
      // Find all configs with the old template (without conditional blocks)
      const configs = await OutlookSignature.find({});

      let updatedCount = 0;
      let skippedCount = 0;

      for (const config of configs) {
        // Check if template already has conditional blocks
        if (config.html_template && !config.html_template.includes('%%IF_EMAIL%%')) {
          // Update to new template
          config.html_template = DEFAULT_HTML_TEMPLATE;
          config.version += 1;
          config.updated_by = req.user?.id || req.user?.email || req.user?.oid || "admin";
          await config.save();
          updatedCount++;
        } else {
          skippedCount++;
        }
      }

      res.json({
        success: true,
        message: `Template migration completed. Updated: ${updatedCount}, Already up-to-date: ${skippedCount}`,
        data: {
          updated: updatedCount,
          skipped: skippedCount,
          total: configs.length
        }
      });
    } catch (error) {
      console.error("Migrate Templates Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to migrate templates",
        error: error.message,
      });
    }
  };
}

/**
 * Generate Outlook Add-in Manifest XML
 * @param {boolean} autoInsert - Whether to enable auto-insert on compose
 * @param {string} commandsUrl - URL to commands.html file
 */
function generateManifestXML(autoInsert = true, commandsUrl = "https://localhost:3000/commands.html") {
  // Generate the JavaScript file URL (replace .html with .js or append .js)
  const commandsJsUrl = commandsUrl.replace(/\.html?$/, '') + '.js';

  // Runtimes section (only if auto-insert enabled)
  const runtimesSection = autoInsert ? `
          <Runtimes>
            <Runtime resid="Autorun">
              <Override type="javascript" resid="AutorunJs"/>
            </Runtime>
          </Runtimes>
          ` : '';

  // LaunchEvent for auto-insert (only if enabled)
  const launchEventSection = autoInsert ? `
            
            <ExtensionPoint xsi:type="LaunchEvent">
              <LaunchEvents>
                <LaunchEvent Type="OnNewMessageCompose" FunctionName="insertSignature" />
              </LaunchEvents>
              <SourceLocation resid="Autorun" />
            </ExtensionPoint>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:bt="http://schemas.microsoft.com/office/officeappbasictypes/1.0"
           xmlns:mailappor="http://schemas.microsoft.com/office/mailappversionoverrides"
           xsi:type="MailApp">
  <Id>00000000-0000-0000-0000-000000000000</Id>
  <Version>1.0.0.0</Version>
  <ProviderName>Exctel</ProviderName>
  <DefaultLocale>en-US</DefaultLocale>
  <DisplayName DefaultValue="Exctel Signature Manager"/>
  <Description DefaultValue="Automatically inserts personalized HTML signature in Outlook emails"/>
  <IconUrl DefaultValue="https://officedev.github.io/Office-Add-in-samples/Samples/outlook-set-signature/assets/final_logo.png"/>
  <HighResolutionIconUrl DefaultValue="https://officedev.github.io/Office-Add-in-samples/Samples/outlook-set-signature/assets/final_logo.png"/>
  <SupportUrl DefaultValue="https://www.exctel.com"/>
  <AppDomains>
    <AppDomain>https://www.exctel.com</AppDomain>
    <AppDomain>https://api-ai.exctel.com</AppDomain>
  </AppDomains>
  <Hosts>
    <Host Name="Mailbox"/>
  </Hosts>
  <Requirements>
    <Sets DefaultMinVersion="1.1">
      <Set Name="Mailbox" />
    </Sets>
  </Requirements>
  <FormSettings>
    <Form xsi:type="ItemRead">
      <DesktopSettings>
        <SourceLocation DefaultValue="${commandsUrl}"/>
        <RequestedHeight>250</RequestedHeight>
      </DesktopSettings>
    </Form>
  </FormSettings>
  <Permissions>ReadWriteMailbox</Permissions>
  <Rule xsi:type="RuleCollection" Mode="Or">
    <Rule xsi:type="ItemIs" ItemType="Message" FormType="Read"/>
  </Rule>
  <DisableEntityHighlighting>true</DisableEntityHighlighting>
  
  <WebApplicationInfo>
    <Id>${process.env.AZURE_CLIENT_ID || 'YOUR_AZURE_APP_CLIENT_ID'}</Id>
    <Resource>api://${process.env.AZURE_APP_DOMAIN || 'api-ai.exctel.com'}/${process.env.AZURE_CLIENT_ID || 'YOUR_AZURE_APP_CLIENT_ID'}</Resource>
    <Scopes>
      <Scope>User.Read</Scope>
      <Scope>openid</Scope>
      <Scope>profile</Scope>
    </Scopes>
  </WebApplicationInfo>
  
  <VersionOverrides xmlns="http://schemas.microsoft.com/office/mailappversionoverrides" xsi:type="VersionOverridesV1_0">
    <VersionOverrides xmlns="http://schemas.microsoft.com/office/mailappversionoverrides/1.1" xsi:type="VersionOverridesV1_1">
      <Description resid="residAppDesc" />
      
      <Requirements>
        <bt:Sets DefaultMinVersion="1.10">
          <bt:Set Name="Mailbox" />
        </bt:Sets>
      </Requirements>
      
      <Hosts>
        <Host xsi:type="MailHost">${runtimesSection}
          <DesktopFormFactor>
            <FunctionFile resid="FunctionFile.Url"/>
            <ExtensionPoint xsi:type="MessageComposeCommandSurface">
              <OfficeTab id="TabDefault">
                <Group id="msgReadGroup">
                  <Label resid="GroupLabel"/>
                  <Control xsi:type="Button" id="msgReadFunctionButton">
                    <Label resid="TaskFunctionButton.Label"/>
                    <Supertip>
                      <Title resid="TaskFunctionButton.Label"/>
                      <Description resid="TaskFunctionButton.Tooltip"/>
                    </Supertip>
                    <Icon>
                      <bt:Image size="16" resid="Icon.16x16"/>
                      <bt:Image size="32" resid="Icon.32x32"/>
                      <bt:Image size="80" resid="Icon.80x80"/>
                    </Icon>
                    <Action xsi:type="ExecuteFunction">
                      <FunctionName>insertSignatureManual</FunctionName>
                    </Action>
                  </Control>
                </Group>
              </OfficeTab>
            </ExtensionPoint>${launchEventSection}
          </DesktopFormFactor>
        </Host>
      </Hosts>
      
      <Resources>
        <bt:Images>
          <bt:Image id="Icon.16x16" DefaultValue="https://officedev.github.io/Office-Add-in-samples/Samples/outlook-set-signature/assets/final_logo.png"/>
          <bt:Image id="Icon.32x32" DefaultValue="https://officedev.github.io/Office-Add-in-samples/Samples/outlook-set-signature/assets/final_logo.png"/>
          <bt:Image id="Icon.80x80" DefaultValue="https://officedev.github.io/Office-Add-in-samples/Samples/outlook-set-signature/assets/final_logo.png"/>
        </bt:Images>
        <bt:Urls>
          <bt:Url id="FunctionFile.Url" DefaultValue="${commandsUrl}"/>
          <bt:Url id="Autorun" DefaultValue="${commandsUrl}"/>
          <bt:Url id="AutorunJs" DefaultValue="${commandsJsUrl}"/>
        </bt:Urls>
        <bt:ShortStrings>
          <bt:String id="GroupLabel" DefaultValue="Signature"/>
          <bt:String id="TaskFunctionButton.Label" DefaultValue="Insert Signature"/>
        </bt:ShortStrings>
        <bt:LongStrings>
          <bt:String id="residAppDesc" DefaultValue="Automatically inserts personalized HTML signature in Outlook emails"/>
          <bt:String id="TaskFunctionButton.Tooltip" DefaultValue="Insert personalized signature"/>
        </bt:LongStrings>
      </Resources>
    </VersionOverrides>
  </VersionOverrides>
</OfficeApp>`;
}

/**
 * Generate JavaScript code for Outlook Add-in
 * @param {Object} config - Signature configuration
 * @param {boolean} autoInsert - Whether to enable auto-insert on compose
 */
function generateJavaScriptCode(config, autoInsert = true) {
  // Escape template literal content for embedding in generated code
  const escapeTemplateLiteral = (str) => {
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
  };

  const escapedTemplate = escapeTemplateLiteral(config.html_template);

  return `// Office.js initialization
Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    console.log("Outlook add-in loaded");
  }
});

// Get access token using Office.js
function getAccessToken() {
  return new Promise(function (resolve, reject) {
    Office.context.auth.getAccessTokenAsync(
      { allowSignInPrompt: true },
      function (result) {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve(result.value);
        } else {
          console.error("Error getting access token:", result.error);
          reject(new Error(result.error.message || "Failed to get access token"));
        }
      }
    );
  });
}

// Fetch user profile from Microsoft Graph
async function fetchUserProfile(accessToken) {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me?$select=displayName,givenName,surname,jobTitle,companyName,mail,mobilePhone,businessPhones,streetAddress,city,state,postalCode,country,department", {
      method: "GET",
      headers: {
        "Authorization": \`Bearer \${accessToken}\`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const user = await response.json();
    return {
      displayName: user.displayName || "",
      firstName: user.givenName || "",
      lastName: user.surname || "",
      jobTitle: user.jobTitle || "",
      companyName: user.companyName || "Exctel",
      mail: user.mail || user.userPrincipalName || "",
      mobilePhone: user.mobilePhone || "",
      businessPhones: user.businessPhones?.[0] || "",
      streetAddress: user.streetAddress || "",
      city: user.city || "",
      state: user.state || "",
      postalCode: user.postalCode || "",
      country: user.country || "",
      department: user.department || ""
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

// Replace placeholders in template
function replacePlaceholders(template, userProfile) {
  let html = template;
  const mapping = {
    '%%FirstName%%': userProfile.firstName || '',
    '%%LastName%%': userProfile.lastName || '',
    '%%Title%%': userProfile.jobTitle || '',
    '%%Email%%': userProfile.mail || '',
    '%%MobileNumber%%': userProfile.mobilePhone || '',
    '%%FaxNumber%%': userProfile.mobilePhone || '',
    '%%PhoneNumber%%': userProfile.businessPhones || '',
    '%%Street%%': userProfile.streetAddress || '',
    '%%City%%': userProfile.city || '',
    '%%State%%': userProfile.state || '',
    '%%PostalCode%%': userProfile.postalCode || '',
    '%%Country%%': userProfile.country || '',
    '%%CompanyName%%': userProfile.companyName || 'Exctel',
    '%%Department%%': userProfile.department || ''
  };

  Object.keys(mapping).forEach(placeholder => {
    const escapedPlaceholder = placeholder.replace(/[.*+?^$()|[\]\\]/g, '\\\\\\\\$&').replace(/{/g, '\\\\{').replace(/}/g, '\\\\}');
    const regex = new RegExp(escapedPlaceholder, 'g');
    html = html.replace(regex, mapping[placeholder]);
  });

  return html;
}

// Insert signature into email (called by LaunchEvent)
function insertSignature(event) {
  console.log("insertSignature called for LaunchEvent");
  
  try {
    if (!Office.context.mailbox.item) {
      console.log("No mail item available");
      if (event && event.completed) {
        event.completed();
      }
      return;
    }
    
    Office.context.mailbox.item.body.getAsync(
      Office.CoercionType.Html,
      function (result) {
        if (result.status !== Office.AsyncResultStatus.Succeeded) {
          console.error("Error getting email body:", result.error);
          if (event && event.completed) {
            event.completed();
          }
          return;
        }
        
        const currentBody = result.value;
        const signatureMarker = "exctel.com";
        if (currentBody && currentBody.indexOf(signatureMarker) !== -1) {
          console.log("Signature already exists, skipping");
          if (event && event.completed) {
            event.completed();
          }
          return;
        }
        
        // Get access token and fetch user profile
        getAccessToken()
          .then(function (accessToken) {
            return fetchUserProfile(accessToken);
          })
          .then(function (userProfile) {
            // HTML template from configuration
            const htmlTemplate = \`${escapedTemplate}\`;
            
            // Replace placeholders
            const signatureHtml = replacePlaceholders(htmlTemplate, userProfile);
            
            // Append signature to email body
            const newBody = currentBody ? currentBody + "<br/><br/>" + signatureHtml : signatureHtml;
            
            Office.context.mailbox.item.body.setAsync(
              newBody,
              { coercionType: Office.CoercionType.Html },
              function (setResult) {
                if (setResult.status === Office.AsyncResultStatus.Succeeded) {
                  console.log("Signature inserted successfully");
                } else {
                  console.error("Error inserting signature:", setResult.error);
                }
                
                // Signal that the event processing is complete
                if (event && event.completed) {
                  event.completed();
                }
              }
            );
          })
          .catch(function (error) {
            console.error("Error in insertSignature:", error);
            if (event && event.completed) {
              event.completed();
            }
          });
      }
    );
  } catch (error) {
    console.error("Error in insertSignature:", error);
    if (event && event.completed) {
      event.completed();
    }
  }
}

// Manual insert function (for button click)
function insertSignatureManual(event) {
  console.log("insertSignatureManual called");
  insertSignature(event);
}

// Register functions for Office.js to call
Office.actions.associate("insertSignature", insertSignature);
Office.actions.associate("insertSignatureManual", insertSignatureManual);

// Export for manual trigger button
function insertSignatureButton() {
  insertSignature();
}`;
}

/**
 * Generate Universal Outlook Add-in Manifest XML (for admin installation)
 * @param {string} commandsUrl - URL to commands.html file
 */
function generateUniversalManifestXML(commandsUrl = "https://localhost:3000/commands-universal.html") {
  // Use a fixed GUID for the universal add-in (proper GUID format)
  const addinId = "12fa71f2-4574-4874-aa47-79f527e54347";

  // Generate the JavaScript file URL (replace .html with .js or append .js)
  const commandsJsUrl = commandsUrl.replace(/\.html?$/, '') + '.js';

  return `<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:bt="http://schemas.microsoft.com/office/officeappbasictypes/1.0"
           xmlns:mailappor="http://schemas.microsoft.com/office/mailappversionoverrides"
           xsi:type="MailApp">
  <Id>${addinId}</Id>
  <Version>1.0.0.0</Version>
  <ProviderName>Exctel</ProviderName>
  <DefaultLocale>en-US</DefaultLocale>
  <DisplayName DefaultValue="Exctel Signature Manager"/>
  <Description DefaultValue="Automatically inserts personalized HTML signature in Outlook emails"/>
  <IconUrl DefaultValue="https://officedev.github.io/Office-Add-in-samples/Samples/outlook-set-signature/assets/final_logo.png"/>
  <HighResolutionIconUrl DefaultValue="https://officedev.github.io/Office-Add-in-samples/Samples/outlook-set-signature/assets/final_logo.png"/>
  <SupportUrl DefaultValue="https://www.exctel.com"/>
  <AppDomains>
    <AppDomain>https://www.exctel.com</AppDomain>
    <AppDomain>https://api-ai.exctel.com</AppDomain>
  </AppDomains>
  <Hosts>
    <Host Name="Mailbox"/>
  </Hosts>
  <Requirements>
    <Sets DefaultMinVersion="1.1">
      <Set Name="Mailbox" />
    </Sets>
  </Requirements>
  <FormSettings>
    <Form xsi:type="ItemRead">
      <DesktopSettings>
        <SourceLocation DefaultValue="${commandsUrl}"/>
        <RequestedHeight>250</RequestedHeight>
      </DesktopSettings>
    </Form>
  </FormSettings>
  <Permissions>ReadWriteMailbox</Permissions>
  <Rule xsi:type="RuleCollection" Mode="Or">
    <Rule xsi:type="ItemIs" ItemType="Message" FormType="Read"/>
  </Rule>
  <DisableEntityHighlighting>true</DisableEntityHighlighting>
  
  <WebApplicationInfo>
    <Id>${process.env.AZURE_CLIENT_ID || 'YOUR_AZURE_APP_CLIENT_ID'}</Id>
    <Resource>api://${process.env.AZURE_APP_DOMAIN || 'api-ai.exctel.com'}/${process.env.AZURE_CLIENT_ID || 'YOUR_AZURE_APP_CLIENT_ID'}</Resource>
    <Scopes>
      <Scope>User.Read</Scope>
      <Scope>openid</Scope>
      <Scope>profile</Scope>
    </Scopes>
  </WebApplicationInfo>
  
  <VersionOverrides xmlns="http://schemas.microsoft.com/office/mailappversionoverrides" xsi:type="VersionOverridesV1_0">
    <VersionOverrides xmlns="http://schemas.microsoft.com/office/mailappversionoverrides/1.1" xsi:type="VersionOverridesV1_1">
      <Description resid="residAppDesc" />
      
      <Requirements>
        <bt:Sets DefaultMinVersion="1.10">
          <bt:Set Name="Mailbox" />
        </bt:Sets>
      </Requirements>
      
      <Hosts>
        <Host xsi:type="MailHost">
          <Runtimes>
            <Runtime resid="Autorun">
              <Override type="javascript" resid="AutorunJs"/>
            </Runtime>
          </Runtimes>
          
          <DesktopFormFactor>
            <FunctionFile resid="FunctionFile.Url"/>
            <ExtensionPoint xsi:type="MessageComposeCommandSurface">
              <OfficeTab id="TabDefault">
                <Group id="msgReadGroup">
                  <Label resid="GroupLabel"/>
                  <Control xsi:type="Button" id="msgReadFunctionButton">
                    <Label resid="TaskFunctionButton.Label"/>
                    <Supertip>
                      <Title resid="TaskFunctionButton.Label"/>
                      <Description resid="TaskFunctionButton.Tooltip"/>
                    </Supertip>
                    <Icon>
                      <bt:Image size="16" resid="Icon.16x16"/>
                      <bt:Image size="32" resid="Icon.32x32"/>
                      <bt:Image size="80" resid="Icon.80x80"/>
                    </Icon>
                    <Action xsi:type="ExecuteFunction">
                      <FunctionName>insertSignatureManual</FunctionName>
                    </Action>
                  </Control>
                </Group>
              </OfficeTab>
            </ExtensionPoint>
            
            <ExtensionPoint xsi:type="LaunchEvent">
              <LaunchEvents>
                <LaunchEvent Type="OnNewMessageCompose" FunctionName="insertSignature" />
              </LaunchEvents>
              <SourceLocation resid="Autorun" />
            </ExtensionPoint>
          </DesktopFormFactor>
        </Host>
      </Hosts>
      
      <Resources>
        <bt:Images>
          <bt:Image id="Icon.16x16" DefaultValue="https://officedev.github.io/Office-Add-in-samples/Samples/outlook-set-signature/assets/final_logo.png"/>
          <bt:Image id="Icon.32x32" DefaultValue="https://officedev.github.io/Office-Add-in-samples/Samples/outlook-set-signature/assets/final_logo.png"/>
          <bt:Image id="Icon.80x80" DefaultValue="https://officedev.github.io/Office-Add-in-samples/Samples/outlook-set-signature/assets/final_logo.png"/>
        </bt:Images>
        <bt:Urls>
          <bt:Url id="FunctionFile.Url" DefaultValue="${commandsUrl}"/>
          <bt:Url id="Autorun" DefaultValue="${commandsUrl}"/>
          <bt:Url id="AutorunJs" DefaultValue="${commandsJsUrl}"/>
        </bt:Urls>
        <bt:ShortStrings>
          <bt:String id="GroupLabel" DefaultValue="Signature"/>
          <bt:String id="TaskFunctionButton.Label" DefaultValue="Insert Signature"/>
        </bt:ShortStrings>
        <bt:LongStrings>
          <bt:String id="residAppDesc" DefaultValue="Automatically inserts personalized HTML signature in Outlook emails"/>
          <bt:String id="TaskFunctionButton.Tooltip" DefaultValue="Insert personalized signature"/>
        </bt:LongStrings>
      </Resources>
    </VersionOverrides>
  </VersionOverrides>
</OfficeApp>`;
}

/**
 * Generate Universal JavaScript code for Outlook Add-in (works for all users)
 * @param {string} baseUrl - Base URL of the backend API
 */
function generateUniversalJavaScriptCode(baseUrl = "https://api-ai.exctel.com") {
  return `// Office.js initialization
Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    console.log("Universal Outlook add-in loaded");
  }
});

// Get access token using Office.js
function getAccessToken() {
  return new Promise(function (resolve, reject) {
    Office.context.auth.getAccessTokenAsync(
      { allowSignInPrompt: true },
      function (result) {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve(result.value);
        } else {
          console.error("Error getting access token:", result.error);
          reject(new Error(result.error.message || "Failed to get access token"));
        }
      }
    );
  });
}

// Fetch user's signature config from backend
async function getUserSignatureConfig(accessToken) {
  try {
    const baseUrl = "${baseUrl}";
    const response = await fetch(\`\${baseUrl}/api/outlook-signature/user-config\`, {
      method: "GET",
      headers: {
        "Authorization": \`Bearer \${accessToken}\`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    return data.data.config;
  } catch (error) {
    console.error("Error fetching signature config:", error);
    throw error;
  }
}

// Fetch user profile from Microsoft Graph
async function fetchUserProfile(accessToken) {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me?$select=displayName,jobTitle,companyName,mail,mobilePhone,streetAddress,city,state,postalCode,country,officeLocation", {
      method: "GET",
      headers: {
        "Authorization": \`Bearer \${accessToken}\`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const profile = await response.json();
    
    // Format address
    const addressParts = [];
    if (profile.streetAddress) addressParts.push(profile.streetAddress);
    if (profile.city) addressParts.push(profile.city);
    if (profile.state) addressParts.push(profile.state);
    if (profile.postalCode) addressParts.push(profile.postalCode);
    if (profile.country) addressParts.push(profile.country);
    const formattedAddress = addressParts.length > 0 
      ? addressParts.join(", ") 
      : (profile.officeLocation || "Exctel Address");
    
    return {
      displayName: profile.displayName || "",
      jobTitle: profile.jobTitle || "",
      companyName: profile.companyName || "Exctel",
      mail: profile.mail || "",
      mobilePhone: profile.mobilePhone || "",
      address: formattedAddress,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

// Replace placeholders in template
function replacePlaceholders(template, userProfile) {
  let html = template;
  const placeholders = {
    "%%DisplayName%%": userProfile.displayName || "",
    "%%JobTitle%%": userProfile.jobTitle || "",
    "%%CompanyName%%": userProfile.companyName || "Exctel",
    "%%Email%%": userProfile.mail || "",
    "%%Phone%%": userProfile.mobilePhone || "",
    "%%Address%%": userProfile.address || "",
  };
  
  for (const [placeholder, value] of Object.entries(placeholders)) {
    const regex = new RegExp(placeholder.replace(/[.*+?^$()|[\\]\\\\]/g, '\\\\\\\\$&').replace(/{/g, '\\\\{').replace(/}/g, '\\\\}'), 'g');
    html = html.replace(regex, value);
  }
  
  return html;
}

// Insert signature into email (called by LaunchEvent)
function insertSignature(event) {
  console.log("insertSignature called for LaunchEvent");
  
  try {
    if (!Office.context.mailbox.item) {
      console.log("No mail item available");
      if (event && event.completed) {
        event.completed();
      }
      return;
    }
    
    Office.context.mailbox.item.body.getAsync(
      Office.CoercionType.Html,
      function (result) {
        if (result.status !== Office.AsyncResultStatus.Succeeded) {
          console.error("Error getting email body:", result.error);
          if (event && event.completed) {
            event.completed();
          }
          return;
        }
        
        const currentBody = result.value;
        const signatureMarker = "exctel.com";
        if (currentBody && currentBody.indexOf(signatureMarker) !== -1) {
          console.log("Signature already exists, skipping");
          if (event && event.completed) {
            event.completed();
          }
          return;
        }
        
        // Get access token and fetch config
        getAccessToken()
          .then(function (accessToken) {
            return Promise.all([
              getUserSignatureConfig(accessToken),
              fetchUserProfile(accessToken),
            ]);
          })
          .then(function (results) {
            const config = results[0];
            const userProfile = results[1];
            
            // Only insert if auto-insert is enabled
            if (!config.autoInsert) {
              console.log("Auto-insert is disabled for this user");
              if (event && event.completed) {
                event.completed();
              }
              return;
            }
            
            const signatureHtml = replacePlaceholders(config.html_template, userProfile);
            const newBody = currentBody ? currentBody + "<br/><br/>" + signatureHtml : signatureHtml;
            
            Office.context.mailbox.item.body.setAsync(
              newBody,
              { coercionType: Office.CoercionType.Html },
              function (setResult) {
                if (setResult.status === Office.AsyncResultStatus.Succeeded) {
                  console.log("Signature inserted successfully");
                } else {
                  console.error("Error inserting signature:", setResult.error);
                }
                
                // Signal that the event processing is complete
                if (event && event.completed) {
                  event.completed();
                }
              }
            );
          })
          .catch(function (error) {
            console.error("Error in insertSignature:", error);
            if (event && event.completed) {
              event.completed();
            }
          });
      }
    );
  } catch (error) {
    console.error("Error in insertSignature:", error);
    if (event && event.completed) {
      event.completed();
    }
  }
}

// Manual insert function (for button click)
function insertSignatureManual(event) {
  console.log("insertSignatureManual called");
  insertSignature(event);
}

// Register functions for Office.js to call
Office.actions.associate("insertSignature", insertSignature);
Office.actions.associate("insertSignatureManual", insertSignatureManual);
`;
}

module.exports = new OutlookSignatureController();

