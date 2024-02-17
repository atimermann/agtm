#!/bin/bash
# Do not use latest images in a production environment, always define a version in the manifest files

# Load .env file
if [ -f .env ]; then
    export $(cat .env | sed 's/#.*//g' | xargs)
else
    echo "Error: .env file not found."
    exit 1
fi

# Check for correct number of arguments
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 [patch|minor|major|prod]"
    exit 1
fi

ARGUMENT=$1

# Step 1: Determine the action based on the argument
if [ "$ARGUMENT" = "prod" ]; then
    NEW_VERSION=$(node -p "require('./package.json').version")

    # Production build - ask for user confirmation
    read -p "You are about to create and push a production build Version: '$NEW_VERSION'. Are you sure? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        echo "Production build cancelled."
        exit 1
    fi
    echo "Creating production build using current version..."
else
    # Development build - increment version
    npm version "$ARGUMENT"
    NEW_VERSION=dev-$(node -p "require('./package.json').version")
fi

MINOR_VERSION=$(echo $NEW_VERSION | cut -d '.' -f 1,2)

# Step 2: Build the Docker image with the version tag
docker build -t $BUILD_REGISTRY_ADDRESS/$BUILD_IMAGE_NAME:${NEW_VERSION} .

echo
echo "Image generated successfully with version: ${NEW_VERSION}!"
echo

# Step 3: Push the image to the registry
docker push $BUILD_REGISTRY_ADDRESS/$BUILD_IMAGE_NAME:${NEW_VERSION}


# Step 4: Also create and push a 'dev' tag if not a production build
if [ "$ARGUMENT" != "prod" ]; then
  docker tag $BUILD_REGISTRY_ADDRESS/$BUILD_IMAGE_NAME:${NEW_VERSION} $BUILD_REGISTRY_ADDRESS/$BUILD_IMAGE_NAME:dev
  docker push $BUILD_REGISTRY_ADDRESS/$BUILD_IMAGE_NAME:dev

else
  docker tag $BUILD_REGISTRY_ADDRESS/$BUILD_IMAGE_NAME:${NEW_VERSION} $BUILD_REGISTRY_ADDRESS/$BUILD_IMAGE_NAME:${MINOR_VERSION}
  docker push $BUILD_REGISTRY_ADDRESS/$BUILD_IMAGE_NAME:${MINOR_VERSION}
fi
