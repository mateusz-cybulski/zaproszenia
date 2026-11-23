# The API checks guests' addresses with the Geocoding API, which accepts only an API key.
# Restricted to that one API; the API service reads it from Secret Manager (secrets.tf).
resource "google_apikeys_key" "geocoding" {
  provider     = google.app
  project      = google_project.app_project.project_id
  name         = "geocoding"
  display_name = "Geocoding (API service)"

  restrictions {
    api_targets {
      service = "geocoding-backend.googleapis.com"
    }
  }

  depends_on = [google_project_service.app_services]
}
