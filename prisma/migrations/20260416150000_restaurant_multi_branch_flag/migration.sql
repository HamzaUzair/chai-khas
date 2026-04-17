-- ============================================================
--  Restaurant: "has_multiple_branches" toggle.
--  - true  → tenant can own many branches (default). Restaurant Admin sees the
--             Branches module and can create / edit / delete branches.
--  - false → tenant is treated as a single-branch restaurant. The Branches
--             module is hidden for that tenant's admin and the backend rejects
--             any attempt to create additional branches for it. One default
--             branch is expected to already exist (auto-created on tenant
--             provisioning for new single-branch tenants).
--
--  Existing tenants default to TRUE so behavior is unchanged for them.
-- ============================================================

ALTER TABLE "restaurants"
  ADD COLUMN "has_multiple_branches" BOOLEAN NOT NULL DEFAULT TRUE;
