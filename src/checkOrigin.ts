function checkOrigin(origin: string, callback: (err: Error | null, allow?: boolean) => void) {
  console.log('Origin:', origin);

  const isDevelopment = process.env.NODE_ENV === 'development';
  const productionDomain = 'shoetopia.site';

  const allowedOrigins = isDevelopment
    ? ['http://localhost:3000', 'http://subdomain.localhost:3000']
    : [`https://${productionDomain}`, `https://www.${productionDomain}`];

  // Check if the origin is in the allowed list
  if (!origin || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  // Check for subdomain matching
  const originHostname = new URL(origin).hostname;
  const baseDomain = isDevelopment ? 'localhost' : productionDomain;
  const subdomainRegex = new RegExp(`^([a-z0-9-]+\\.)?${baseDomain.replace('.', '\\.')}$`);

  if (subdomainRegex.test(originHostname)) {
    return callback(null, true);
  }

  // If origin is not allowed, callback with an error
  callback(new Error('Not allowed by CORS'));
}

export default checkOrigin;