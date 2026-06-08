import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env.local') })

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  globalTimeout: 20 * 60 * 1000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  snapshotPathTemplate: 'tests/e2e/__screenshots__/{arg}{ext}',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'https://startingmonday.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },
    {
      name: 'smoke',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
    },
    {
      name: 'synthetics',
      testMatch: /synthetics\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
    },
    {
      name: 'outreach-canary',
      testMatch: /outreach-canary\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
    },
    {
      name: 'personas',
      testMatch: /persona-flows\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
    },
    {
      name: 'auth-ux',
      testMatch: /auth-ux\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'mobile-iphone',
      testMatch: /mobile-(ui|key-routes|public-routes|visual|elite-visual)\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        storageState: 'tests/e2e/.auth/user.json',
      },
    },
    {
      name: 'mobile-android',
      testMatch: /mobile-(ui|key-routes|public-routes|visual|elite-visual)\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Pixel 7'],
        storageState: 'tests/e2e/.auth/user.json',
      },
    },
    {
      name: 'mobile-tablet',
      testMatch: /mobile-(ui|key-routes|public-routes|visual|elite-visual)\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Galaxy Tab S4'],
        storageState: 'tests/e2e/.auth/user.json',
      },
    },
  ],
})
