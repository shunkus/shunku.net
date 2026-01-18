---
title: "Docker Monitoring and Logging for Production"
date: "2025-01-18"
excerpt: "Set up comprehensive monitoring and logging for Docker containers using Prometheus, Grafana, cAdvisor, and the ELK Stack."
tags: ["Docker", "Containers", "DevOps", "Monitoring"]
author: "Shunku"
---

Running containers in production requires visibility into performance, resource usage, and application behavior. This article covers the essential tools and techniques for monitoring and logging Docker environments.

## Monitoring Architecture

A typical Docker monitoring stack:

```mermaid
flowchart TB
    subgraph Containers["Docker Containers"]
        App1["App Container 1"]
        App2["App Container 2"]
        App3["App Container 3"]
    end

    subgraph Monitoring["Monitoring Stack"]
        cAdvisor["cAdvisor"]
        NodeExp["Node Exporter"]
        Prometheus["Prometheus"]
        Grafana["Grafana"]
    end

    subgraph Logging["Logging Stack"]
        Filebeat["Filebeat"]
        Logstash["Logstash"]
        Elasticsearch["Elasticsearch"]
        Kibana["Kibana"]
    end

    App1 --> cAdvisor
    App2 --> cAdvisor
    App3 --> cAdvisor
    cAdvisor --> Prometheus
    NodeExp --> Prometheus
    Prometheus --> Grafana

    App1 --> Filebeat
    App2 --> Filebeat
    App3 --> Filebeat
    Filebeat --> Logstash
    Logstash --> Elasticsearch
    Elasticsearch --> Kibana

    style Prometheus fill:#e6522c,color:#fff
    style Grafana fill:#f46800,color:#fff
    style Elasticsearch fill:#005571,color:#fff
```

## Docker Native Monitoring

### docker stats

The built-in monitoring command:

```bash
# Real-time stats for all containers
docker stats

# Specific containers
docker stats container1 container2

# Custom format
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# One-time snapshot (no streaming)
docker stats --no-stream
```

### docker events

Monitor Docker daemon events:

```bash
# Watch all events
docker events

# Filter by event type
docker events --filter 'type=container'
docker events --filter 'event=start'
docker events --filter 'container=myapp'

# Time-based filtering
docker events --since '2025-01-18T00:00:00' --until '2025-01-18T12:00:00'

# JSON output
docker events --format '{{json .}}'
```

## cAdvisor

cAdvisor (Container Advisor) provides container resource usage and performance data.

### Running cAdvisor

```bash
docker run -d \
  --name cadvisor \
  --privileged \
  -p 8080:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  -v /dev/disk/:/dev/disk:ro \
  gcr.io/cadvisor/cadvisor:latest
```

### cAdvisor Metrics

Access the web UI at `http://localhost:8080` or metrics at `/metrics`:

| Metric | Description |
|--------|-------------|
| container_cpu_usage_seconds_total | Total CPU usage |
| container_memory_usage_bytes | Current memory usage |
| container_network_receive_bytes_total | Network bytes received |
| container_network_transmit_bytes_total | Network bytes transmitted |
| container_fs_usage_bytes | Filesystem usage |

## Prometheus

Prometheus is the standard for container metrics collection.

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - "alerts/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'docker'
    static_configs:
      - targets: ['host.docker.internal:9323']
```

### Docker Compose for Prometheus Stack

```yaml
version: "3.8"

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alerts:/etc/prometheus/alerts
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
    networks:
      - monitoring

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    privileged: true
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'
    networks:
      - monitoring

volumes:
  prometheus_data:

networks:
  monitoring:
    driver: bridge
```

### Alert Rules

```yaml
# alerts/container_alerts.yml
groups:
  - name: container_alerts
    rules:
      - alert: ContainerHighCPU
        expr: rate(container_cpu_usage_seconds_total[5m]) * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Container {{ $labels.name }} high CPU usage"
          description: "CPU usage is above 80% for 5 minutes"

      - alert: ContainerHighMemory
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Container {{ $labels.name }} high memory usage"

      - alert: ContainerDown
        expr: absent(container_last_seen{name=~".+"})
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Container {{ $labels.name }} is down"
```

## Grafana

Grafana provides visualization for Prometheus metrics.

### Adding Grafana to the Stack

```yaml
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    networks:
      - monitoring
    depends_on:
      - prometheus

volumes:
  grafana_data:
```

### Provisioning Datasources

```yaml
# grafana/provisioning/datasources/prometheus.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
```

### Useful PromQL Queries

| Metric | Query |
|--------|-------|
| CPU usage per container | `rate(container_cpu_usage_seconds_total{name!=""}[5m]) * 100` |
| Memory usage | `container_memory_usage_bytes{name!=""}` |
| Network receive rate | `rate(container_network_receive_bytes_total[5m])` |
| Network transmit rate | `rate(container_network_transmit_bytes_total[5m])` |
| Container restarts | `changes(container_start_time_seconds[1h])` |
| Running containers | `count(container_last_seen{name!=""})` |

## Docker Logging

### Log Drivers

Docker supports multiple log drivers:

```bash
# Check current log driver
docker info --format '{{.LoggingDriver}}'

# Run with specific driver
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  nginx
```

| Driver | Description |
|--------|-------------|
| json-file | Default, logs to JSON files |
| syslog | Send to syslog |
| journald | Send to journald |
| fluentd | Send to Fluentd |
| gelf | Graylog Extended Log Format |
| awslogs | Amazon CloudWatch |
| splunk | Splunk HTTP Event Collector |

### Configure Default Log Driver

```json
// /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "labels": "production_status",
    "env": "os,customer"
  }
}
```

## ELK Stack for Logging

The ELK Stack (Elasticsearch, Logstash, Kibana) provides centralized logging.

### Complete ELK Docker Compose

```yaml
version: "3.8"

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - logging
    healthcheck:
      test: curl -s http://localhost:9200 >/dev/null || exit 1
      interval: 30s
      timeout: 10s
      retries: 5

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5044:5044"
      - "9600:9600"
    environment:
      - "LS_JAVA_OPTS=-Xms256m -Xmx256m"
    networks:
      - logging
    depends_on:
      elasticsearch:
        condition: service_healthy

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    networks:
      - logging
    depends_on:
      elasticsearch:
        condition: service_healthy

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.11.0
    user: root
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - logging
    depends_on:
      - logstash

volumes:
  elasticsearch_data:

networks:
  logging:
    driver: bridge
```

### Filebeat Configuration

```yaml
# filebeat/filebeat.yml
filebeat.inputs:
  - type: container
    paths:
      - '/var/lib/docker/containers/*/*.log'
    processors:
      - add_docker_metadata:
          host: "unix:///var/run/docker.sock"

filebeat.autodiscover:
  providers:
    - type: docker
      hints.enabled: true

processors:
  - add_host_metadata: ~
  - add_cloud_metadata: ~

output.logstash:
  hosts: ["logstash:5044"]
```

### Logstash Pipeline

```ruby
# logstash/pipeline/docker.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [container][name] {
    mutate {
      add_field => { "container_name" => "%{[container][name]}" }
    }
  }

  # Parse JSON logs if applicable
  if [message] =~ /^\{/ {
    json {
      source => "message"
      target => "parsed"
      skip_on_invalid_json => true
    }
  }

  # Parse common log formats
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }
    overwrite => [ "message" ]
    tag_on_failure => ["_grokparsefailure"]
  }

  # Add timestamp
  date {
    match => [ "timestamp", "ISO8601", "dd/MMM/yyyy:HH:mm:ss Z" ]
    target => "@timestamp"
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "docker-logs-%{+YYYY.MM.dd}"
  }
}
```

## Loki for Lightweight Logging

Loki is a lightweight alternative to ELK, designed for Grafana.

### Loki Stack

```yaml
version: "3.8"

services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki/config.yml:/etc/loki/config.yml
      - loki_data:/loki
    command: -config.file=/etc/loki/config.yml
    networks:
      - logging

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./promtail/config.yml:/etc/promtail/config.yml
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock
    command: -config.file=/etc/promtail/config.yml
    networks:
      - logging

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
    networks:
      - logging

volumes:
  loki_data:

networks:
  logging:
```

### Promtail Configuration

```yaml
# promtail/config.yml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
      - source_labels: ['__meta_docker_container_log_stream']
        target_label: 'logstream'
      - source_labels: ['__meta_docker_container_label_com_docker_compose_service']
        target_label: 'service'
```

## Application Metrics

### Exposing Application Metrics

For custom application metrics, expose a `/metrics` endpoint:

```javascript
// Node.js with prom-client
const express = require('express');
const client = require('prom-client');

const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(3000);
```

### Prometheus Scrape Config for Apps

```yaml
scrape_configs:
  - job_name: 'myapp'
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
    relabel_configs:
      - source_labels: [__meta_docker_container_label_prometheus_job]
        regex: (.+)
        target_label: job
      - source_labels: [__meta_docker_container_label_prometheus_port]
        regex: (.+)
        target_label: __address__
        replacement: '${1}'
```

## Complete Monitoring Stack

Here's a production-ready monitoring and logging stack:

```yaml
version: "3.8"

services:
  # Metrics Collection
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=15d'
    networks:
      - monitoring

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    privileged: true
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
    networks:
      - monitoring

  # Visualization
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    networks:
      - monitoring

  # Alerting
  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager:/etc/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
    networks:
      - monitoring

  # Logging
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki:/etc/loki
      - loki_data:/loki
    command: -config.file=/etc/loki/config.yml
    networks:
      - monitoring

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./promtail:/etc/promtail
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock
    command: -config.file=/etc/promtail/config.yml
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:
  loki_data:

networks:
  monitoring:
    driver: bridge
```

## Key Takeaways

| Tool | Purpose |
|------|---------|
| docker stats | Quick container metrics |
| cAdvisor | Container resource metrics |
| Prometheus | Metrics collection and alerting |
| Grafana | Visualization dashboards |
| ELK Stack | Full-featured log aggregation |
| Loki | Lightweight log aggregation |

## Best Practices

1. **Set resource limits** - Prevent monitoring tools from consuming too many resources
2. **Configure retention** - Balance storage costs with data needs
3. **Use labels** - Organize metrics and logs by service, environment, etc.
4. **Set up alerts** - Don't just collect data, act on it
5. **Secure your stack** - Use authentication and network isolation
6. **Monitor the monitors** - Ensure your monitoring stack is healthy

## Next Steps

In the next article, we'll cover Docker CI/CD pipelines with GitHub Actions.

## References

- Docker Deep Dive, 5th Edition - Nigel Poulton
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Elastic Stack Documentation](https://www.elastic.co/guide/)
