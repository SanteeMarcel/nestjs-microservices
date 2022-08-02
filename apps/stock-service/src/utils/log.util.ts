const logInfo = (trackingId: string, origin: string, message: string) => {
  console.log(`INFORMATION: ${origin} - ${message}`);
};

const logError = (
  trackingId: string,
  origin: string,
  message: string,
  e: any,
) => {
  console.log(`ERROR: ${origin} - ${message}`);
  console.log(e);
};

const logWarning = (trackingId: string, origin: string, message: string) => {
  console.log(`WARNING: ${origin} - ${message}`);
};

export { logInfo, logError, logWarning };
