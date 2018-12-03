/**
 * Create and export configuration variables
 */

const environments = {};

// create staging(default) environment

environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging',
};

// create production environment

environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production',
};

// Determine which environment to export
const currentEnv = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// check that the current environment is one of the environments defined
const environmentToExport = typeof (environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;

export const httpPort = environmentToExport.httpPort;
export const httpsPort = environmentToExport.httpsPort;
export const envName = environmentToExport.envName;

