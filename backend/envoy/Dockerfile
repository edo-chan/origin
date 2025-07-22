FROM envoyproxy/envoy:v1.28-latest

# Copy Envoy config, entrypoint script, and pre-generated proto descriptor
COPY ./envoy.yaml /etc/envoy/envoy.yaml
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
COPY ../proto.pb /etc/envoy/proto.pb

# Make entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Ensure directory for proto descriptor exists
RUN mkdir -p /etc/envoy

# Expose ports
EXPOSE 8080 9901

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
