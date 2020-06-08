# Medi Timetracker

[![Build Status](https://drone.zebbra.ch/api/badges/zebbra-repos/timetracker/status.svg)](https://drone.zebbra.ch/zebbra-repos/timetracker)

Combined repository for the timetracker application developed for [medi](https://www.medi.ch/).

- [Loopback 3 Backend](./backend/README.md)
- [React/Redux Frontend](./frontend/README.md)

## Production Setup

1. Create shared namespace

   ```bash
   kubectl create ns medi-timetracker
   ```

1. Copy secrets from 1Password `medi-secrets-backend` / `medi-secrets-frontend` to

   - deploy/helm/templates/backend/secrets.yaml
   - deploy/helm/templates/frontend/secrets.yaml

1. Deploy secrets

   ```bash
   kubectl apply -n medi-timetracker -f deploy/helm/templates/backend/secrets.yaml
   kubectl apply -n medi-timetracker -f deploy/helm/templates/frontend/secrets.yaml
   ```

1. Deploy Helm chart

   ```bash
   helmfile apply
   ```

## Normal Deployment

```bash
drone build promote zebbra-repos/medi-timetracker <build-number>
```
