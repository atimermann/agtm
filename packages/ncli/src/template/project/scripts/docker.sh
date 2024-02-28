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
    echo "Usage: $0 [shell|run]"
    exit 1
fi

ARGUMENT=$1

echo "In the .env file, ensure that the values are not enclosed with either single or double quotes."
# Execute commands based on the argument
case "$ARGUMENT" in

    shell)
      docker run -it \
      -p 3001:3001 \
      -p 4001:4001 \
      -e NF_HTTPSERVER_HOSTNAME=0.0.0.0 \
      --env-file .env \
      --entrypoint /bin/bash \
      "${BUILD_REGISTRY_ADDRESS}/${BUILD_IMAGE_NAME}":dev
    ;;

    run)
      docker run -it \
      -p 3001:3001 \
      -p 4001:4001 \
      -e NF_HTTPSERVER_HOSTNAME=0.0.0.0 \
      --env-file .env \
       "${BUILD_REGISTRY_ADDRESS}/${BUILD_IMAGE_NAME}:dev" npm start
    ;;

    *)
        echo "Invalid argument: $ARGUMENT"
        echo "Usage: $0 [exec|run]"
        exit 1
    ;;
esac
