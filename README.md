# Medi Timetracker

[![Build Status](https://drone.zebbra.ch/api/badges/zebbra/timetracker/status.svg)](https://drone.zebbra.ch/zebbra/timetracker)

Combined repository for the timetracker application developed for [medi](https://www.medi.ch/).

- [Loopback 3 Backend](./backend/README.md)
- [React/Redux Frontend](./frontend/README.md)

## Production Setup

> This project is managed with helm v3

1. Create shared namespace

   ```bash
   kubectl create ns medi-timetracker
   ```

1. Copy secrets from 1Password `medi-secrets` to

   - deploy/secrets.yaml

1. Deploy secrets

   ```bash
   kubectl apply -n medi-timetracker -f deploy/secrets.yaml
   ```

1. Deploy Helm chart

   ```bash
   cd deploy && helmfile apply
   ```

## Deployment

Push to master branch will trigger new deployment on k8s.
