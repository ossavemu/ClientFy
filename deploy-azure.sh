#!/bin/bash

# Variables
RESOURCE_GROUP="clientfy-rg"
LOCATION="eastus"
APP_NAME="clientfy-bot"
REGISTRY_NAME="clientfyregistry"
SKU="B1"

# Crear grupo de recursos
az group create --name $RESOURCE_GROUP --location $LOCATION

# Crear registro de contenedores
az acr create --resource-group $RESOURCE_GROUP \
    --name $REGISTRY_NAME --sku Basic

# Habilitar admin
az acr update -n $REGISTRY_NAME --admin-enabled true

# Obtener credenciales
ACR_USERNAME=$(az acr credential show -n $REGISTRY_NAME --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show -n $REGISTRY_NAME --query "passwords[0].value" -o tsv)

# Crear plan de App Service
az appservice plan create --name "${APP_NAME}-plan" \
    --resource-group $RESOURCE_GROUP \
    --sku $SKU \
    --is-linux

# Crear Web App
az webapp create --resource-group $RESOURCE_GROUP \
    --plan "${APP_NAME}-plan" \
    --name $APP_NAME \
    --deployment-container-image-name "${REGISTRY_NAME}.azurecr.io/${APP_NAME}:latest"

# Configurar variables de entorno
az webapp config appsettings set --resource-group $RESOURCE_GROUP --name $APP_NAME --settings \
    DATABASE_URL="$DATABASE_URL" \
    GMAIL_USER="$GMAIL_USER" \
    GMAIL_APP_PASSWORD="$GMAIL_APP_PASSWORD" \
    ZOOM_ACCOUNT_ID="$ZOOM_ACCOUNT_ID" \
    ZOOM_CLIENT_ID="$ZOOM_CLIENT_ID" \
    ZOOM_CLIENT_SECRET="$ZOOM_CLIENT_SECRET" \
    OPENAI_API_KEY="$OPENAI_API_KEY" \
    RESEND="$RESEND" 