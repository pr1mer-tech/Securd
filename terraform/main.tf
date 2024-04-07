resource "google_compute_network" "private_network" {
  name                    = "private-network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "private_subnetwork" {
  name          = "private-subnetwork"
  ip_cidr_range = "10.0.0.0/16"
  region        = "europe-west1"
  network       = google_compute_network.private_network.id
}

resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.private_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.private_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

resource "google_sql_database_instance" "postgres" {
  name             = "postgres"
  region           = "europe-west1"
  database_version = "POSTGRES_15"

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.private_network.id
    }
  }
}

resource "google_compute_instance" "lb" {
  name         = "lb-instance"
  machine_type = "e2-medium"
  zone         = "europe-west1-d"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.private_subnetwork.id

    access_config {
      // Ephemeral IP
    }
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash

    # Install HAProxy
    apt-get update
    apt-get install -y haproxy

    # Configure HAProxy
    cat > /etc/haproxy/haproxy.cfg <<EOL
    global
      log /dev/log local0
      log /dev/log local1 notice
      chroot /var/lib/haproxy
      stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
      stats timeout 30s
      user haproxy
      group haproxy
      daemon

    defaults
      log global
      mode tcp
      option tcplog
      option dontlognull
      timeout connect 5000
      timeout client 50000
      timeout server 50000

    frontend ft_postgresql
      bind *:5432
      default_backend bk_postgresql

    backend bk_postgresql
      balance roundrobin
      server postgres1 ${google_sql_database_instance.postgres.private_ip_address}:5432 check
    EOL

    # Restart HAProxy
    systemctl restart haproxy
  EOF

  depends_on = [google_sql_database_instance.postgres]
}
