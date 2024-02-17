#!/bin/bash
# Do not use latest images in a production environment, always define a version in the manifest files

# Load .env file
if [ -f .env ]; then
    export $(cat .env | sed 's/#.*//g' | xargs)
else
    echo "Error: .env file not found."
    exit 1
fi

# Verify if BUILD_REGISTRY_ADDRESS is set
if [ -z "$BUILD_REGISTRY_ADDRESS" ]; then
    echo "Error: BUILD_REGISTRY_ADDRESS must be defined in .env"
    exit 1
fi


# Check for correct number of arguments
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 [exec|run]"
    exit 1
fi

ARGUMENT=$1

# Execute commands based on the argument
case "$ARGUMENT" in
    exec)
        # Execute container with an interactive bash shell
        docker run -it -p 3000:3000 --entrypoint /bin/bash "${BUILD_REGISTRY_ADDRESS}/${BUILD_IMAGE_NAME}:dev"
        ;;
    run)
        # Run container normally
        docker run -it -p 3000:3000 "${BUILD_REGISTRY_ADDRESS}/${BUILD_IMAGE_NAME}:dev"
        ;;
    *)
        echo "Invalid argument: $ARGUMENT"
        echo "Usage: $0 [exec|run]"
        exit 1
        ;;
esac
