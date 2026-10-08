/**
 * Oracle Cloud Infrastructure (OCI) Object Storage Client
 * Supports:
 * 1. OCI Pre-Authenticated Requests (PAR) - Recommended for secure, zero-secret client uploads
 * 2. Public / Read-Access Buckets for study materials and question papers
 * 3. OCI S3-Compatible API Endpoint
 */

const OCI_NAMESPACE = import.meta.env.VITE_ORACLE_STORAGE_NAMESPACE || import.meta.env.ORACLE_STORAGE_NAMESPACE || '';
const OCI_BUCKET = import.meta.env.VITE_ORACLE_STORAGE_BUCKET || import.meta.env.ORACLE_STORAGE_BUCKET || '';
const OCI_REGION = import.meta.env.VITE_ORACLE_STORAGE_REGION || import.meta.env.ORACLE_STORAGE_REGION || '';
const OCI_PAR_URL = import.meta.env.VITE_ORACLE_STORAGE_PAR_URL || import.meta.env.ORACLE_STORAGE_PAR_URL || '';
const OCI_COMPAT_ENDPOINT = import.meta.env.VITE_ORACLE_STORAGE_ENDPOINT || import.meta.env.ORACLE_STORAGE_ENDPOINT || '';

export const isOracleStorageConfigured = Boolean(
  OCI_PAR_URL || 
  (OCI_NAMESPACE && OCI_BUCKET && OCI_REGION && !OCI_NAMESPACE.includes('placeholder'))
);

/**
 * Get direct viewing / streaming URL for an object stored in Oracle Cloud
 * @param {string} objectName Path or filename inside the bucket
 * @returns {string} Fully qualified HTTPS URL
 */
export function getOracleStorageUrl(objectName) {
  if (!objectName) return '';
  if (objectName.startsWith('http://') || objectName.startsWith('https://')) {
    return objectName;
  }

  const cleanName = encodeURIComponent(objectName).replace(/%2F/g, '/');

  // 1. If a Pre-Authenticated Request (PAR) base URL is provided
  if (OCI_PAR_URL) {
    const base = OCI_PAR_URL.endsWith('/') ? OCI_PAR_URL : OCI_PAR_URL + '/';
    return `${base}${cleanName}`;
  }

  // 2. Standard OCI Object Storage Public URL
  if (OCI_REGION && OCI_NAMESPACE && OCI_BUCKET) {
    return `https://objectstorage.${OCI_REGION}.oraclecloud.com/n/${OCI_NAMESPACE}/b/${OCI_BUCKET}/o/${cleanName}`;
  }

  // 3. S3-compatible endpoint fallback
  if (OCI_COMPAT_ENDPOINT) {
    const base = OCI_COMPAT_ENDPOINT.endsWith('/') ? OCI_COMPAT_ENDPOINT : OCI_COMPAT_ENDPOINT + '/';
    return `${base}${OCI_BUCKET}/${cleanName}`;
  }

  return '';
}

/**
 * Upload a file or binary Blob to Oracle Cloud Object Storage
 * @param {File|Blob} file The file to upload
 * @param {string} objectName Desired destination path/filename (e.g. "materials/notes-101.pdf")
 * @param {Object} options Optional metadata and headers
 * @returns {Promise<{success: boolean, url: string, error?: string}>}
 */
export async function uploadToOracleStorage(file, objectName, options = {}) {
  if (!isOracleStorageConfigured) {
    return {
      success: false,
      url: '',
      error: 'Oracle Cloud Object Storage is not configured. Please set credentials in .env.'
    };
  }

  const targetUrl = getOracleStorageUrl(objectName);
  if (!targetUrl) {
    return {
      success: false,
      url: '',
      error: 'Could not construct valid Oracle Storage URL.'
    };
  }

  try {
    const contentType = file.type || options.contentType || 'application/octet-stream';
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        ...(options.headers || {})
      },
      body: file
    });

    if (!response.ok) {
      throw new Error(`Oracle Storage responded with HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      success: true,
      url: targetUrl
    };
  } catch (err) {
    console.error('[Oracle Storage] Upload failed:', err);
    return {
      success: false,
      url: '',
      error: err?.message || 'Upload failed'
    };
  }
}

/**
 * Delete an object from Oracle Cloud Object Storage (via PAR or API)
 * @param {string} objectName 
 */
export async function deleteFromOracleStorage(objectName) {
  if (!isOracleStorageConfigured) return false;

  const targetUrl = getOracleStorageUrl(objectName);
  if (!targetUrl) return false;

  try {
    const response = await fetch(targetUrl, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (err) {
    console.warn('[Oracle Storage] Delete failed:', err?.message);
    return false;
  }
}
