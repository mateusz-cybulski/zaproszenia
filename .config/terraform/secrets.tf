# Secrets for the services, kept in Secret Manager and exposed to a service as env vars
# through "secrets" in its service.json, e.g. { "secrets": { "DATABASE_URL": "database-url" } }.
#
# A provided value comes from a GitHub secret passed as TF_VAR_<NAME> in
# .github/workflows/terraform.yml; an unset GitHub secret is "", so it creates no Secret Manager
# secret. A generated value comes from a resource Terraform creates (e.g. an API key).

locals {
  # The keys are known at plan time; only the values are sensitive.
  provided_secrets = {
    "database-url" = var.DATABASE_URL
  }
  # Always present, but unknown until the first apply: never filtered by value.
  generated_secrets = {
    "geocoding-api-key" = google_apikeys_key.geocoding.key_string
  }
  secret_values = merge(local.provided_secrets, local.generated_secrets)

  managed_secrets = setunion(
    [for id, value in local.provided_secrets : id if nonsensitive(value != "")],
    keys(local.generated_secrets),
  )
}

resource "google_secret_manager_secret" "managed" {
  for_each = local.managed_secrets

  project   = google_project.app_project.project_id
  secret_id = each.key

  replication {
    auto {}
  }

  depends_on = [google_project_service.app_services]
}

resource "google_secret_manager_secret_version" "managed" {
  for_each = local.managed_secrets

  secret      = google_secret_manager_secret.managed[each.key].id
  secret_data = local.secret_values[each.key]

  # A new value replaces the version. Create the new one first: the running Cloud Run
  # revision is pinned to the old version and must still read it until it is replaced.
  lifecycle {
    create_before_destroy = true
  }
}

# Each service may read only the secrets its service.json names.
resource "google_secret_manager_secret_iam_member" "service" {
  for_each = { for key, pair in local.service_secrets : key => pair if contains(local.managed_secrets, pair.secret) }

  project   = google_project.app_project.project_id
  secret_id = google_secret_manager_secret.managed[each.value.secret].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.service[each.value.service].member
}
