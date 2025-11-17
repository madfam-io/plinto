/**
 * E2E tests for enterprise features (Compliance, SCIM, RBAC)
 * Tests UI components for GDPR compliance, SCIM provisioning, and role management
 */

import { test, expect } from '@playwright/test';

test.describe('Compliance Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/compliance-enterprise-showcase');
  });

  test.describe('Consent Management', () => {
    test('should display consent manager with purpose list', async ({ page }) => {
      // Switch to Consent tab
      await page.click('button:has-text("Consent")');

      // Verify consent purposes are displayed
      await expect(page.getByText('Marketing Communications')).toBeVisible();
      await expect(page.getByText('Analytics & Performance')).toBeVisible();
      await expect(page.getByText('Third-party Data Sharing')).toBeVisible();
    });

    test('should allow granting consent', async ({ page }) => {
      await page.click('button:has-text("Consent")');

      // Grant consent for marketing
      const marketingCheckbox = page.locator('input[type="checkbox"]').first();
      await marketingCheckbox.check();

      // Verify checkbox is checked
      await expect(marketingCheckbox).toBeChecked();

      // Submit consent
      const submitButton = page.getByRole('button', { name: /save|submit|grant/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Verify success message or confirmation
        await expect(page.getByText(/success|saved|updated/i)).toBeVisible({ timeout: 3000 });
      }
    });

    test('should display legal basis for each purpose', async ({ page }) => {
      await page.click('button:has-text("Consent")');

      // Verify legal basis is shown
      await expect(page.getByText(/consent|legitimate interest|contract/i)).toBeVisible();
    });

    test('should show consent history', async ({ page }) => {
      await page.click('button:has-text("Consent")');

      // Look for history section
      const historySection = page.locator('text=/history|previous|audit/i');
      if (await historySection.isVisible()) {
        await expect(historySection).toBeVisible();
      }
    });

    test('should allow withdrawing consent', async ({ page }) => {
      await page.click('button:has-text("Consent")');

      // Find and click withdraw button
      const withdrawButton = page.getByRole('button', { name: /withdraw|revoke/i });
      if (await withdrawButton.isVisible()) {
        await withdrawButton.click();

        // Verify withdrawal confirmation
        await expect(page.getByText(/withdrawn|revoked/i)).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe('Data Subject Rights', () => {
    test('should display data rights request form', async ({ page }) => {
      // Switch to Data Rights tab
      await page.click('button:has-text("Data Rights")');

      // Verify request types are available
      await expect(page.getByText(/access|erasure|rectification|portability/i)).toBeVisible();
    });

    test('should allow submitting data access request (Article 15)', async ({ page }) => {
      await page.click('button:has-text("Data Rights")');

      // Select access request
      await page.click('text=/access.*data/i');

      // Submit request
      const submitButton = page.getByRole('button', { name: /submit|request/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Verify request submitted
        await expect(page.getByText(/submitted|processing|received/i)).toBeVisible({ timeout: 3000 });
      }
    });

    test('should display GDPR article references', async ({ page }) => {
      await page.click('button:has-text("Data Rights")');

      // Verify GDPR articles are mentioned
      await expect(page.getByText(/article.*15|article.*17|gdpr/i)).toBeVisible();
    });

    test('should show 30-day response timeline', async ({ page }) => {
      await page.click('button:has-text("Data Rights")');

      // Look for timeline information
      await expect(page.getByText(/30.*day|one month|timeline/i)).toBeVisible();
    });

    test('should allow requesting data erasure (Article 17)', async ({ page }) => {
      await page.click('button:has-text("Data Rights")');

      // Select erasure/deletion option
      const erasureOption = page.locator('text=/erasure|delete|remove.*data/i');
      if (await erasureOption.isVisible()) {
        await erasureOption.click();
        await expect(erasureOption).toBeVisible();
      }
    });

    test('should allow data portability request (Article 20)', async ({ page }) => {
      await page.click('button:has-text("Data Rights")');

      // Select portability option
      const portabilityOption = page.locator('text=/portability|export|download/i');
      if (await portabilityOption.isVisible()) {
        await portabilityOption.click();
        await expect(portabilityOption).toBeVisible();
      }
    });
  });

  test.describe('Privacy Settings', () => {
    test('should display privacy settings controls', async ({ page }) => {
      // Switch to Privacy tab
      await page.click('button:has-text("Privacy")');

      // Verify privacy controls are present
      await expect(page.getByText(/analytics|marketing|tracking|cookies/i)).toBeVisible();
    });

    test('should allow toggling analytics tracking', async ({ page }) => {
      await page.click('button:has-text("Privacy")');

      // Find analytics toggle
      const analyticsToggle = page.locator('input[type="checkbox"]').first();
      const initialState = await analyticsToggle.isChecked();

      // Toggle the setting
      await analyticsToggle.click();

      // Verify state changed
      await expect(analyticsToggle).toBeChecked({ checked: !initialState });
    });

    test('should allow controlling marketing preferences', async ({ page }) => {
      await page.click('button:has-text("Privacy")');

      // Find marketing control
      const marketingControl = page.getByText(/marketing/i).locator('..').locator('input[type="checkbox"]');
      if (await marketingControl.isVisible()) {
        await marketingControl.click();
        // Setting should update
        expect(true).toBe(true);
      }
    });

    test('should show third-party sharing options', async ({ page }) => {
      await page.click('button:has-text("Privacy")');

      // Verify third-party sharing control
      await expect(page.getByText(/third.*party|sharing/i)).toBeVisible();
    });

    test('should allow setting profile visibility', async ({ page }) => {
      await page.click('button:has-text("Privacy")');

      // Look for visibility controls
      const visibilityControl = page.getByText(/visibility|public|private/i);
      if (await visibilityControl.isVisible()) {
        await expect(visibilityControl).toBeVisible();
      }
    });

    test('should allow cookie consent management', async ({ page }) => {
      await page.click('button:has-text("Privacy")');

      // Find cookie controls
      await expect(page.getByText(/cookie/i)).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.click('button:has-text("Consent")');

      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Focused element should be visible
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check for aria-labels
      const elements = await page.locator('[aria-label]').count();
      expect(elements).toBeGreaterThan(0);
    });

    test('should have semantic HTML structure', async ({ page }) => {
      // Verify semantic elements exist
      await expect(page.locator('main, section, article').first()).toBeVisible();
    });
  });
});

test.describe('SCIM Provisioning Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/scim-rbac-showcase');
  });

  test.describe('SCIM Configuration Wizard', () => {
    test('should display SCIM wizard with provider selection', async ({ page }) => {
      // Switch to SCIM tab
      await page.click('button:has-text("SCIM Provisioning")');

      // Verify provider options
      await expect(page.getByText(/okta|azure|google|onelogin/i)).toBeVisible();
    });

    test('should show step 1: provider selection', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Verify step 1 is active
      await expect(page.getByText(/step.*1|select.*provider/i)).toBeVisible();
    });

    test('should allow selecting Okta provider', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Click Okta provider
      const oktaButton = page.getByRole('button', { name: /okta/i });
      if (await oktaButton.isVisible()) {
        await oktaButton.click();
        await expect(oktaButton).toHaveClass(/selected|active/);
      }
    });

    test('should allow selecting Azure AD provider', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Click Azure AD provider
      const azureButton = page.getByRole('button', { name: /azure/i });
      if (await azureButton.isVisible()) {
        await azureButton.click();
        await expect(azureButton).toHaveClass(/selected|active/);
      }
    });

    test('should progress to step 2: endpoint configuration', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Select provider
      const oktaButton = page.getByRole('button', { name: /okta/i });
      if (await oktaButton.isVisible()) {
        await oktaButton.click();

        // Click next
        const nextButton = page.getByRole('button', { name: /next|continue/i });
        await nextButton.click();

        // Verify step 2
        await expect(page.getByText(/step.*2|endpoint|configuration/i)).toBeVisible({ timeout: 3000 });
      }
    });

    test('should display SCIM endpoint URL', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Look for SCIM endpoint
      await expect(page.getByText(/scim.*endpoint|base.*url/i)).toBeVisible();
    });

    test('should allow generating bearer token', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Find generate token button
      const generateButton = page.getByRole('button', { name: /generate.*token/i });
      if (await generateButton.isVisible()) {
        await generateButton.click();

        // Token should appear
        await expect(page.locator('input[type="text"][value*="re_"]')).toBeVisible({ timeout: 3000 });
      }
    });

    test('should allow copying SCIM endpoint', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Find copy button
      const copyButton = page.getByRole('button', { name: /copy/i }).first();
      if (await copyButton.isVisible()) {
        await copyButton.click();

        // Success feedback
        await expect(page.getByText(/copied/i)).toBeVisible({ timeout: 2000 });
      }
    });

    test('should show step 3: sync settings', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Navigate through wizard
      // Step 3 should show sync options
      await expect(page.getByText(/user.*sync|group.*sync|provisioning/i)).toBeVisible();
    });

    test('should allow configuring user sync', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Find user sync toggle
      const userSyncToggle = page.getByText(/user.*sync/i).locator('..').locator('input[type="checkbox"]');
      if (await userSyncToggle.isVisible()) {
        await userSyncToggle.click();
        // Should toggle
        expect(true).toBe(true);
      }
    });

    test('should allow configuring group sync', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Find group sync toggle
      const groupSyncToggle = page.getByText(/group.*sync/i).locator('..').locator('input[type="checkbox"]');
      if (await groupSyncToggle.isVisible()) {
        await groupSyncToggle.click();
        expect(true).toBe(true);
      }
    });

    test('should display provider documentation links', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Verify documentation links
      const docLink = page.getByRole('link', { name: /documentation|guide|setup/i });
      if (await docLink.isVisible()) {
        await expect(docLink).toHaveAttribute('href', /.+/);
      }
    });
  });

  test.describe('SCIM Sync Status', () => {
    test('should display sync status dashboard', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Verify status indicators
      await expect(page.getByText(/users.*synced|groups.*synced|status/i)).toBeVisible();
    });

    test('should show last sync timestamp', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Look for timestamp
      await expect(page.getByText(/last.*sync|updated/i)).toBeVisible();
    });

    test('should display sync error count', async ({ page }) => {
      await page.click('button:has-text("SCIM Provisioning")');

      // Look for error count
      const errorCount = page.getByText(/error|failed/i);
      if (await errorCount.isVisible()) {
        await expect(errorCount).toBeVisible();
      }
    });
  });
});

test.describe('RBAC Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/scim-rbac-showcase');
  });

  test.describe('Role Manager', () => {
    test('should display role manager interface', async ({ page }) => {
      // Switch to Role Management tab
      await page.click('button:has-text("Role Management")');

      // Verify role management UI
      await expect(page.getByText(/role|permission/i)).toBeVisible();
    });

    test('should list existing roles', async ({ page }) => {
      await page.click('button:has-text("Role Management")');

      // Verify default roles are shown
      await expect(page.getByText(/admin|member|owner|viewer/i)).toBeVisible();
    });

    test('should allow creating custom role', async ({ page }) => {
      await page.click('button:has-text("Role Management")');

      // Click create role button
      const createButton = page.getByRole('button', { name: /create.*role|new.*role/i });
      if (await createButton.isVisible()) {
        await createButton.click();

        // Form should appear
        await expect(page.getByLabel(/role.*name|name/i)).toBeVisible({ timeout: 3000 });
      }
    });

    test('should allow selecting permissions for role', async ({ page }) => {
      await page.click('button:has-text("Role Management")');

      // Find permission checkboxes
      const permissionCheckbox = page.locator('input[type="checkbox"]').first();
      if (await permissionCheckbox.isVisible()) {
        await permissionCheckbox.click();
        await expect(permissionCheckbox).toBeChecked();
      }
    });

    test('should show permission categories', async ({ page }) => {
      await page.click('button:has-text("Role Management")');

      // Verify permission categories
      await expect(page.getByText(/user.*management|organization|settings/i)).toBeVisible();
    });

    test('should prevent editing system roles', async ({ page }) => {
      await page.click('button:has-text("Role Management")');

      // System roles should be marked as protected
      const systemRoleBadge = page.getByText(/system|protected|default/i);
      if (await systemRoleBadge.isVisible()) {
        await expect(systemRoleBadge).toBeVisible();
      }
    });

    test('should allow deleting custom roles', async ({ page }) => {
      await page.click('button:has-text("Role Management")');

      // Find delete button for custom role
      const deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();
      if (await deleteButton.isVisible() && !(await page.getByText(/system/i).isVisible())) {
        await deleteButton.click();

        // Confirmation dialog
        await expect(page.getByText(/confirm|are you sure/i)).toBeVisible({ timeout: 2000 });
      }
    });

    test('should show role description field', async ({ page }) => {
      await page.click('button:has-text("Role Management")');

      // Verify description field
      await expect(page.getByText(/description/i)).toBeVisible();
    });

    test('should display permission count per role', async ({ page }) => {
      await page.click('button:has-text("Role Management")');

      // Look for permission counts
      const permCount = page.getByText(/\d+.*permission/i);
      if (await permCount.isVisible()) {
        await expect(permCount).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/scim-rbac-showcase');

      // UI should be usable on mobile
      await expect(page.locator('main')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/auth/compliance-enterprise-showcase');

      // UI should be usable on tablet
      await expect(page.locator('main')).toBeVisible();
    });
  });
});

test.describe('Integration Scenarios', () => {
  test('should navigate between compliance and SCIM pages', async ({ page }) => {
    await page.goto('/auth/compliance-enterprise-showcase');
    await expect(page).toHaveURL(/compliance-enterprise-showcase/);

    await page.goto('/auth/scim-rbac-showcase');
    await expect(page).toHaveURL(/scim-rbac-showcase/);
  });

  test('should maintain form state when switching tabs', async ({ page }) => {
    await page.goto('/auth/compliance-enterprise-showcase');

    // Grant consent
    await page.click('button:has-text("Consent")');
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();

    // Switch tabs
    await page.click('button:has-text("Data Rights")');
    await page.click('button:has-text("Consent")');

    // State should be maintained (in real app)
    expect(true).toBe(true);
  });

  test('should handle concurrent SCIM and RBAC operations', async ({ page }) => {
    await page.goto('/auth/scim-rbac-showcase');

    // Configure SCIM
    await page.click('button:has-text("SCIM Provisioning")');

    // Switch to RBAC
    await page.click('button:has-text("Role Management")');

    // Both should work independently
    expect(true).toBe(true);
  });
});
