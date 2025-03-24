# README for CDP Project

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Unomi and Elasticsearch Setup](#unomi-and-elasticsearch-setup)
4. [Running the Project](#running-the-project)
5. [Environment Variables](#environment-variables)
6. [Additional Information](#additional-information)

---

## Introduction
This project involves setting up Apache Unomi as a Customer Data Platform (CDP) with Elasticsearch for data storage. Follow this guide to configure and run the services using Docker.

---

## Prerequisites
Ensure the following tools are installed on your system:
- [Docker](https://docs.docker.com/get-docker/)
- [Git](https://git-scm.com/downloads)

---

## Unomi and Elasticsearch Setup
Create a `docker-compose.yml` file with the following content:

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.10.2
    environment:
      - discovery.type=single-node
    ports:
      - 9200:9200

  unomi:
    image: apache/unomi:1.5.7
    environment:
      - UNOMI_ELASTICSEARCH_ADDRESSES=elasticsearch:9200
      - UNOMI_THIRDPARTY_PROVIDER1_IPADDRESSES=0.0.0.0/0,::1,127.0.0.1
    ports:
      - 8181:8181
      - 9443:9443
      - 8102:8102
    links:
      - elasticsearch
    depends_on:
      - elasticsearch
```

---

## Running the Project
1. Save the content above as `docker-compose.yml`.
2. Open a terminal in the directory where the file is located.
3. Run the following command to start the services:
    ```bash
    docker-compose up -d
    ```

---

## Environment Variables
Ensure the following environment variables are set in your `.env` file for both the backend and frontend:

```bash
UNOMI_API_URL=http://localhost:8181
UNOMI_AUTH=a2FyYWY6a2FyYWY=
```

---

## Additional Information
- For more details, visit the [Apache Unomi Documentation](https://unomi.apache.org/)
- In case of issues, check the logs using:
  ```bash
  docker-compose logs -f
  ```
---

**Powered by Lumiq & Crisp Analytics**

