# Identity Platform and API Keys bill the calling project by default, which for the CI
# account is its own project, not the app project: bill the app project instead.
provider "google" {
  alias                 = "app"
  user_project_override = true
  billing_project       = local.project_id
}

locals {
  frontend_domain = local.base_domain # src/frontend is served on the bare app domain
  auth_domain     = "${google_project.app_project.project_id}.firebaseapp.com"

  auth_env = {
    FIREBASE_API_KEY     = nonsensitive(google_apikeys_key.browser.key_string) # public by design
    FIREBASE_AUTH_DOMAIN = local.auth_domain
  }
}

resource "google_identity_platform_config" "auth" {
  provider = google.app
  project  = google_project.app_project.project_id

  authorized_domains = [
    "localhost",
    local.auth_domain,
    local.frontend_domain,
  ]

  sign_in {
    allow_duplicate_emails = false

    email {
      enabled           = true
      password_required = true
    }
  }

  client {
    permissions {
      disabled_user_signup   = false
      disabled_user_deletion = true
    }
  }

  depends_on = [google_project_service.app_services]
}

# Every visitor sees this key, so it is limited to the sign-in APIs and the app's own pages.
resource "google_apikeys_key" "browser" {
  provider     = google.app
  project      = google_project.app_project.project_id
  name         = "browser-sign-in"
  display_name = "Browser sign-in"

  restrictions {
    api_targets {
      service = "identitytoolkit.googleapis.com"
    }

    api_targets {
      service = "securetoken.googleapis.com"
    }

    browser_key_restrictions {
      allowed_referrers = [
        "https://${local.frontend_domain}/*",
        "http://localhost:3000/*",
      ]
    }
  }

  depends_on = [google_project_service.app_services]
}
