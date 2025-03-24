# Mautic Docker-Compose
Repository includes docker-compose configurations and documentation for running Mautic in docker.

## Install
Make sure you have docker-compose and docker installed.

### Start
Start docker containers:
```shell
docker-compose up
```

Now open:
```shell
http://localhost:8080
```

Finish setup and you are ready to use.


## Persistence
By default code and database will be persistent. You may disable it by commenting out the `volumes` form docker-compose.yaml file.

#### Code and Media
Mautic code will be copied into `.storage/mautic` on first start. It is done in order to persist uploaded files and test plugins.


