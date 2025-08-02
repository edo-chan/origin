# -*- mode: Python -*-

# Load extensions
load('ext://uibutton', 'cmd_button', 'location')

# Load docker-compose
docker_compose('./docker-compose.yml')

# Define resources for each service
dc_resource('postgres', labels=["database"])
dc_resource('redis', labels=["database"])
dc_resource('backend', labels=["backend"], resource_deps=['postgres', 'redis'])
dc_resource('envoy', labels=["proxy"], resource_deps=['backend'])
dc_resource('frontend', labels=["frontend"])
dc_resource('storybook', labels=["frontend"])

# Configure docker builds with context isolation
docker_build('origin-backend', 
    context='.', 
    dockerfile='backend/Dockerfile',
    only=['./backend/', './proto/', './googleapis/', './frontend/package.json', './frontend/package-lock.json'],
    ignore=['./data/', './.git/', './*.md']
)

docker_build('origin-frontend', 
    context='.', 
    dockerfile='frontend/Dockerfile', 
    only=['./frontend/', './proto/gen/'],
    ignore=['./backend/', './data/', './.git/', './*.md']
)

docker_build('origin-envoy',
    context='./backend/envoy',
    dockerfile='./backend/envoy/Dockerfile',
    ignore=['../../frontend/', '../../data/', '../../.git/']
)

# Database migration command buttons
cmd_button('migrate-run',
           argv=['./backend/migrate.sh', 'run'],
           icon_name='play_arrow',
           text='Run Migrations',
           resource='postgres')

cmd_button('migrate-revert',
           argv=['./backend/migrate.sh', 'revert'],
           icon_name='undo',
           text='Revert Last Migration',
           resource='postgres')

cmd_button('migrate-reset',
           argv=['./backend/migrate.sh', 'reset'],
           icon_name='refresh',
           text='Reset Database',
           resource='postgres')

# Print helpful message
print("""
Template project is running!
----------------------------
Frontend: http://localhost:3000
Storybook: http://localhost:6006
Backend gRPC: localhost:50051
Envoy Proxy (HTTP to gRPC): http://localhost:49999
Postgres: localhost:5433
Redis: localhost:6380
""")
