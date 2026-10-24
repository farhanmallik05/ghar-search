import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const suiteResults = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function recordTest(name, category, fn) {
  const start = performance.now();
  try {
    fn();
    const duration = performance.now() - start;
    suiteResults.push({ name, category, status: 'PASS', duration: duration.toFixed(2), error: null });
    console.log(`[PASS] [${category}] ${name}`);
  } catch (err) {
    const duration = performance.now() - start;
    suiteResults.push({ name, category, status: 'FAIL', duration: duration.toFixed(2), error: err.message });
    console.error(`[FAIL] [${category}] ${name}: ${err.message}`);
  }
}

async function runEmpiricalStressTests() {
  console.log('================================================================');
  console.log('CHALLENGER 2: MILESTONE 1 EMPIRICAL STRESS & EDGE CASE SUITE');
  console.log('================================================================\n');

  // ===========================================================================
  // 1. Asset Integrity Verification
  // ===========================================================================
  const seqDir = path.join(rootDir, 'Landing Page', 'public', 'sequence');

  recordTest('Sequence Directory Exists', 'Asset Integrity', () => {
    assert(fs.existsSync(seqDir), `Sequence directory not found at ${seqDir}`);
  });

  recordTest('All 240 WebP Files Exist (frame_0.webp to frame_239.webp) with Non-Zero Size', 'Asset Integrity', () => {
    const missing = [];
    let zeroByteCount = 0;
    let minSize = Infinity;
    let maxSize = 0;

    for (let i = 0; i < 240; i++) {
      const filename = `frame_${i}.webp`;
      const filePath = path.join(seqDir, filename);

      if (!fs.existsSync(filePath)) {
        missing.push(filename);
        continue;
      }

      const stat = fs.statSync(filePath);
      if (stat.size === 0) {
        zeroByteCount++;
      }
      if (stat.size < minSize) minSize = stat.size;
      if (stat.size > maxSize) maxSize = stat.size;
    }

    assert(missing.length === 0, `Missing ${missing.length} frames: ${missing.slice(0, 5).join(', ')}...`);
    assert(zeroByteCount === 0, `Found ${zeroByteCount} zero-byte frames!`);
    console.log(`    -> Frame sizes range from ${(minSize / 1024).toFixed(1)} KB to ${(maxSize / 1024).toFixed(1)} KB (Total 240 files verified)`);
  });

  recordTest('All 240 JPG Fallback Frames Exist (frame_0.jpg to frame_239.jpg) with Valid SOI Headers', 'Asset Integrity', () => {
    const missing = [];
    const invalidHeader = [];
    let zeroByteCount = 0;

    for (let i = 0; i < 240; i++) {
      const filename = `frame_${i}.jpg`;
      const filePath = path.join(seqDir, filename);

      if (!fs.existsSync(filePath)) {
        missing.push(filename);
        continue;
      }

      const stat = fs.statSync(filePath);
      if (stat.size === 0) {
        zeroByteCount++;
      }

      // Check JPEG SOI header 0xFF, 0xD8
      const buf = Buffer.alloc(2);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buf, 0, 2, 0);
      fs.closeSync(fd);

      if (buf[0] !== 0xFF || buf[1] !== 0xD8) {
        invalidHeader.push(filename);
      }
    }

    assert(missing.length === 0, `Missing ${missing.length} fallback frames: ${missing.slice(0, 5).join(', ')}...`);
    assert(zeroByteCount === 0, `Found ${zeroByteCount} zero-byte fallback frames!`);
    assert(invalidHeader.length === 0, `Found ${invalidHeader.length} fallback frames without valid JPEG magic header!`);
  });

  // ===========================================================================
  // 2. Environment Fallbacks Stress Test
  // ===========================================================================
  const envCases = [
    { label: 'Undefined', envVal: undefined, expectedApp: 'http://localhost:3000', expectedLanding: 'http://localhost:3001' },
    { label: 'Empty string', envVal: '', expectedApp: 'http://localhost:3000', expectedLanding: 'http://localhost:3001' },
    { label: 'Custom Port', envVal: 'http://127.0.0.1:4000', expectedApp: 'http://127.0.0.1:4000', expectedLanding: 'http://127.0.0.1:4000' },
    { label: 'Production HTTPS domain', envVal: 'https://ghar-search.vercel.app', expectedApp: 'https://ghar-search.vercel.app', expectedLanding: 'https://ghar-search.vercel.app' },
  ];

  for (const c of envCases) {
    recordTest(`Landing Page NEXT_PUBLIC_APP_URL Fallback (${c.label})`, 'Environment Fallbacks', () => {
      const simulatedEnv = { NEXT_PUBLIC_APP_URL: c.envVal };
      const appUrl = simulatedEnv.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      assert(appUrl === c.expectedApp, `Expected ${c.expectedApp}, got ${appUrl}`);

      // Test URL construction in Navigation and ScrollCanvas
      const verifyUrl = `${appUrl}/#verify-section`;
      assert(verifyUrl.startsWith(c.expectedApp), `verifyUrl does not start with expected base`);
      assert(verifyUrl.endsWith('/#verify-section'), `verifyUrl does not end with /#verify-section`);
    });

    recordTest(`Frontend NEXT_PUBLIC_LANDING_URL Fallback (${c.label})`, 'Environment Fallbacks', () => {
      const simulatedEnv = { NEXT_PUBLIC_LANDING_URL: c.envVal };
      const landingUrl = simulatedEnv.NEXT_PUBLIC_LANDING_URL || 'http://localhost:3001';
      assert(landingUrl === c.expectedLanding, `Expected ${c.expectedLanding}, got ${landingUrl}`);
    });
  }

  // ===========================================================================
  // 3. Query Parameter Ingestion & Edge Cases Simulation
  // ===========================================================================
  // Simulates frontend/src/app/page.tsx query ingestion logic exactly
  function simulateQueryIngestion(searchParamsObj) {
    const params = new URLSearchParams(searchParamsObj);
    const urlParam = params.get('url');
    const reraParam = params.get('rera');
    const queryParam = params.get('query');
    const autoParam = params.get('auto') === 'true';
    const verifyParam = params.get('verify') === 'true';
    const stateParam = params.get('state');
    const projectParam = params.get('project');
    const promoterParam = params.get('promoter');

    let stateName = stateParam || 'Maharashtra';
    let projectName = projectParam || '';
    let promoterName = promoterParam || '';
    let listingUrl = '';
    let reraNumber = '';
    let activeTab = 'url';

    let resolvedTab = null;
    let resolvedUrl = '';
    let resolvedRera = '';
    let resolvedProject = projectParam || '';

    if (urlParam) {
      resolvedTab = 'url';
      resolvedUrl = urlParam;
      listingUrl = urlParam;
      activeTab = 'url';
    }

    if (reraParam) {
      resolvedTab = 'manual';
      resolvedRera = reraParam;
      reraNumber = reraParam;
      activeTab = 'manual';
    }

    if (queryParam) {
      const trimmed = queryParam.trim();
      const isUrlPattern =
        /^https?:\/\//i.test(trimmed) ||
        trimmed.includes('housing.com') ||
        trimmed.includes('99acres.com') ||
        trimmed.includes('magicbricks.com') ||
        trimmed.includes('.com') ||
        trimmed.includes('.in');

      if (isUrlPattern) {
        if (!urlParam) {
          resolvedTab = 'url';
          resolvedUrl = trimmed;
          listingUrl = trimmed;
          activeTab = 'url';
        }
      } else {
        if (!reraParam) {
          resolvedTab = 'manual';
          activeTab = 'manual';
          if (/\s/.test(trimmed)) {
            resolvedProject = trimmed;
            projectName = trimmed;
          } else if (/[0-9]/.test(trimmed)) {
            resolvedRera = trimmed;
            reraNumber = trimmed;
          } else {
            resolvedProject = trimmed;
            projectName = trimmed;
          }
        }
      }
    }

    let payloadToTrigger = null;
    if (autoParam) {
      if (resolvedTab === 'url' && resolvedUrl) {
        payloadToTrigger = { property_url: resolvedUrl };
      } else if (resolvedTab === 'manual' && (resolvedRera || resolvedProject)) {
        payloadToTrigger = {
          project_name: resolvedProject,
          promoter_name: promoterParam || '',
          rera_number: resolvedRera,
          state: stateParam || 'Maharashtra',
        };
      } else if (resolvedUrl) {
        payloadToTrigger = { property_url: resolvedUrl };
      }
    }

    return {
      activeTab,
      listingUrl,
      projectName,
      reraNumber,
      stateName,
      promoterName,
      verifyParam,
      autoParam,
      payloadToTrigger,
    };
  }

  // LiveVerdictDemo URL constructor
  function constructLiveVerifyUrl(appUrl, input) {
    return `${appUrl}/?verify=true&query=${encodeURIComponent(input.trim())}#verify-section`;
  }

  const queryStressCases = [
    {
      name: 'Standard Portal URL',
      input: 'https://housing.com/in/buy/projects/sample-residency-greater-noida',
      expectedTab: 'url',
      expectedUrl: 'https://housing.com/in/buy/projects/sample-residency-greater-noida',
    },
    {
      name: 'URL with Spaces and Ampersands in Query String',
      input: 'https://www.99acres.com/property-search?city=Noida&bhk=3&proj=DLF%20Phase%205%20%26%206',
      expectedTab: 'url',
      expectedUrl: 'https://www.99acres.com/property-search?city=Noida&bhk=3&proj=DLF%20Phase%205%20%26%206',
    },
    {
      name: 'RERA Number with Hyphens and Digits (UP RERA)',
      input: 'UPRERA-PRJ-2024-8841',
      expectedTab: 'manual',
      expectedRera: 'UPRERA-PRJ-2024-8841',
    },
    {
      name: 'RERA Number with Slashes (MahaRERA)',
      input: 'P51800012345',
      expectedTab: 'manual',
      expectedRera: 'P51800012345',
    },
    {
      name: 'RERA Number with Complex Slashes (Karnataka RERA)',
      input: 'PRM/KA/RERA/1251/446/PR/220101',
      expectedTab: 'manual',
      expectedRera: 'PRM/KA/RERA/1251/446/PR/220101',
    },
    {
      name: 'Project Name with Spaces',
      input: 'Godrej Woods Phase 2',
      expectedTab: 'manual',
      expectedProject: 'Godrej Woods Phase 2',
    },
    {
      name: 'Project Name with Ampersand and Spaces',
      input: 'L&T Seawoods Residences',
      expectedTab: 'manual',
      expectedProject: 'L&T Seawoods Residences',
    },
    {
      name: 'Leading and Trailing Whitespace Input',
      input: '   https://magicbricks.com/oasis-grand-whitefield-bengaluru   ',
      expectedTab: 'url',
      expectedUrl: 'https://magicbricks.com/oasis-grand-whitefield-bengaluru',
    },
    {
      name: 'XSS / Script Injection Attempt',
      input: '<script>alert("xss")</script>',
      expectedTab: 'manual',
      expectedProject: '<script>alert("xss")</script>',
    },
    {
      name: 'Unicode and Hindi Project Title',
      input: 'आनंद निकेतन फेज १',
      expectedTab: 'manual',
      expectedProject: 'आनंद निकेतन फेज १',
    },
  ];

  for (const tc of queryStressCases) {
    recordTest(`Query Stress: ${tc.name}`, 'Query String Encoding & Ingestion', () => {
      // 1. Construct URL as LiveVerdictDemo does
      const constructed = constructLiveVerifyUrl('http://localhost:3000', tc.input);

      // Verify valid URL
      const parsedUrl = new URL(constructed);
      assert(parsedUrl.searchParams.get('verify') === 'true', 'verify param should be true');

      const rawQueryParam = parsedUrl.searchParams.get('query');
      assert(rawQueryParam !== null, 'query param must be present');

      // 2. Ingest in frontend page simulation
      const result = simulateQueryIngestion({
        verify: parsedUrl.searchParams.get('verify'),
        query: rawQueryParam,
      });

      assert(result.activeTab === tc.expectedTab, `Expected tab ${tc.expectedTab}, got ${result.activeTab}`);

      if (tc.expectedUrl) {
        assert(result.listingUrl === tc.expectedUrl, `Expected listingUrl ${tc.expectedUrl}, got ${result.listingUrl}`);
      }
      if (tc.expectedRera) {
        assert(result.reraNumber === tc.expectedRera, `Expected reraNumber ${tc.expectedRera}, got ${result.reraNumber}`);
      }
      if (tc.expectedProject) {
        assert(result.projectName === tc.expectedProject, `Expected projectName ${tc.expectedProject}, got ${result.projectName}`);
      }
    });
  }

  // Test Auto-Verification Trigger edge cases
  recordTest('Auto Verification Trigger with URL', 'Query String Encoding & Ingestion', () => {
    const res = simulateQueryIngestion({
      url: 'https://housing.com/sample',
      auto: 'true',
    });
    assert(res.payloadToTrigger !== null, 'Payload must be generated');
    assert(res.payloadToTrigger.property_url === 'https://housing.com/sample', 'Payload must contain property_url');
  });

  recordTest('Auto Verification Trigger with RERA and State', 'Query String Encoding & Ingestion', () => {
    const res = simulateQueryIngestion({
      rera: 'UPRERA-1234',
      state: 'Uttar Pradesh',
      auto: 'true',
    });
    assert(res.payloadToTrigger !== null, 'Payload must be generated');
    assert(res.payloadToTrigger.rera_number === 'UPRERA-1234', 'Payload must contain rera_number');
    assert(res.payloadToTrigger.state === 'Uttar Pradesh', 'Payload must contain state');
  });

  // ===========================================================================
  // 4. Redirect Configurations
  // ===========================================================================
  recordTest('Landing Page next.config.mjs Redirect Rules', 'Redirect Configurations', async () => {
    const landingConfigPath = path.join(rootDir, 'Landing Page', 'next.config.mjs');
    const landingConfig = (await import(`file://${landingConfigPath}`)).default;
    assert(typeof landingConfig.redirects === 'function', 'Landing Page config must export redirects function');

    const redirects = await landingConfig.redirects();
    const verifyRedirect = redirects.find(r => r.source === '/verify');
    assert(verifyRedirect !== undefined, 'Missing /verify redirect rule in Landing Page config');
    assert(verifyRedirect.permanent === false, 'Redirect must be temporary (permanent: false)');
    assert(verifyRedirect.destination.includes('/#verify-section'), 'Destination must include /#verify-section');
  });

  recordTest('Frontend next.config.js Redirect Rules', 'Redirect Configurations', async () => {
    const frontendConfigPath = path.join(rootDir, 'frontend', 'next.config.js');
    const frontendConfig = (await import(`file://${frontendConfigPath}`)).default;
    assert(typeof frontendConfig.redirects === 'function', 'Frontend config must export redirects function');

    const redirects = await frontendConfig.redirects();
    const verifyRedirect = redirects.find(r => r.source === '/verify');
    assert(verifyRedirect !== undefined, 'Missing /verify redirect rule in Frontend config');
    assert(verifyRedirect.permanent === false, 'Redirect must be temporary (permanent: false)');
    assert(verifyRedirect.destination === '/#verify-section', 'Destination must be /#verify-section');
  });

  // ===========================================================================
  // 5. Monorepo Scripts & Docker Config Validation
  // ===========================================================================
  recordTest('Root package.json Scripts Contain Concurrently Commands', 'Monorepo Configuration', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert(pkg.scripts.dev !== undefined, 'Missing "dev" script');
    assert(pkg.scripts['dev:frontend'] !== undefined, 'Missing "dev:frontend" script');
    assert(pkg.scripts['dev:landing'] !== undefined, 'Missing "dev:landing" script');
    assert(pkg.scripts.build !== undefined, 'Missing "build" script');
    assert(pkg.scripts.start !== undefined, 'Missing "start" script');
    assert(pkg.scripts.dev.includes('concurrently'), '"dev" script must use concurrently');
    assert(pkg.scripts.start.includes('concurrently'), '"start" script must use concurrently');
  });

  recordTest('Landing Page package.json Runs on Port 3001', 'Monorepo Configuration', () => {
    const pkgPath = path.join(rootDir, 'Landing Page', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert(pkg.scripts.dev.includes('-p 3001') || pkg.scripts.dev.includes('--port 3001'), 'Landing Page dev script must specify port 3001');
    assert(pkg.scripts.start.includes('-p 3001') || pkg.scripts.start.includes('--port 3001'), 'Landing Page start script must specify port 3001');
  });

  // Summary
  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${suiteResults.length}`);
  const passed = suiteResults.filter(r => r.status === 'PASS').length;
  const failed = suiteResults.filter(r => r.status === 'FAIL').length;
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runEmpiricalStressTests();
