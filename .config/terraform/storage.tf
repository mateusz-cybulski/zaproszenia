locals {
  # Bucket access goes to the API's own account on this bucket only, not as a project-wide role.
  storage_service = "api"

  storage_env = {
    STORAGE_BUCKET = google_storage_bucket.files.name
  }
}

resource "google_storage_bucket" "files" {
  project  = google_project.app_project.project_id
  name     = "${google_project.app_project.project_id}-files"
  location = var.GCP_REGION

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  depends_on = [google_project_service.app_services]
}

resource "google_storage_bucket_iam_member" "files" {
  for_each = contains(keys(local.services), local.storage_service) ? toset([local.storage_service]) : toset([])

  bucket = google_storage_bucket.files.name
  role   = "roles/storage.objectUser"
  member = google_service_account.service[each.key].member
}
